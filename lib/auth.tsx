'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export type AuthProfile = {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  job_title?: string;
  department?: string;
  timezone: string;
  locale: string;
  theme: string;
  theme_color: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  last_login_device?: string;
  onboarding_completed: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type UserRole = {
  id: string;
  role: 'super_admin' | 'owner' | 'admin' | 'manager' | 'hr' | 'finance' | 'sales' | 'support' | 'marketing' | 'employee' | 'customer' | 'vendor' | 'developer';
  organization_id?: string;
  workspace_id?: string;
  permissions: Record<string, any>;
  is_active: boolean;
};

export type AuthState = {
  user: User | null;
  profile: AuthProfile | null;
  roles: UserRole[];
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type AuthContextType = AuthState & {
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    roles: [],
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('auth_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data as AuthProfile | null;
  }, []);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_role_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    return (data || []) as UserRole[];
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        return;
      }

      if (session?.user) {
        const [profile, roles] = await Promise.all([
          fetchProfile(session.user.id),
          fetchRoles(session.user.id),
        ]);

        setState({
          user: session.user,
          profile,
          roles,
          session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Auth initialization failed'
      }));
    }
  }, [fetchProfile, fetchRoles]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        (async () => {
          const [profile, roles] = await Promise.all([
            fetchProfile(session.user.id),
            fetchRoles(session.user.id),
          ]);
          setState({
            user: session.user,
            profile,
            roles,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        })();
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          profile: null,
          roles: [],
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        router.push('/login');
      } else if (event === 'TOKEN_REFRESHED') {
        setState(prev => ({ ...prev, session }));
      }
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth, fetchProfile, fetchRoles, router]);

  const signIn = async (email: string, password: string, _remember = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : error.message
      }));
      return { error };
    }

    // Log login attempt
    await supabase.from('login_history').insert({
      username: email,
      status: 'success',
      ip_address: 'unknown',
      login_at: new Date().toISOString(),
    });

    router.push('/dashboard');
    return { error: null };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      roles: [],
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const updateProfile = async (updates: Partial<AuthProfile>) => {
    if (!state.user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('auth_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', state.user.id);

    if (!error) {
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null
      }));
    }

    return { error };
  };

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session) {
      setState(prev => ({ ...prev, session }));
    }
  };

  const hasRole = (role: string): boolean => {
    return state.roles.some(r => r.role === role);
  };

  const hasPermission = (permission: string): boolean => {
    return state.roles.some(r => r.permissions?.[permission] === true);
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshSession,
        hasRole,
        hasPermission,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo]);

  return auth;
}
