'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Shield,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Session = {
  id: string;
  session_id: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  location_country: string;
  location_city: string;
  is_active: boolean;
  is_current: boolean;
  last_activity_at: string;
  created_at: string;
  expires_at: string;
};

type LoginRecord = {
  id: string;
  username: string;
  employee_name: string;
  ip_address: string;
  user_agent: string;
  login_at: string;
  logout_at: string;
  status: string;
  failure_reason: string;
  device_type: string;
  location: string;
};

const deviceIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  laptop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Globe,
};

export default function SessionManagementPage() {
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [sessionsRes, historyRes] = await Promise.all([
      supabase.from('user_sessions').select('*').eq('user_id', user?.id).eq('is_active', true).order('last_activity_at', { ascending: false }),
      supabase.from('login_history').select('*').order('login_at', { ascending: false }).limit(20),
    ]);

    if (sessionsRes.data) setSessions(sessionsRes.data as Session[]);
    if (historyRes.data) setLoginHistory(historyRes.data as LoginRecord[]);
    setLoading(false);
  };

  const terminateSession = async (sessionId: string) => {
    setTerminating(sessionId);
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('session_id', sessionId);
    setSessions(sessions.filter(s => s.session_id !== sessionId));
    setTerminating(null);
  };

  const terminateAllOtherSessions = async () => {
    const currentSessionId = sessions.find(s => s.is_current)?.session_id;
    if (!currentSessionId) return;

    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', user?.id)
      .neq('session_id', currentSessionId);

    setSessions(sessions.filter(s => s.is_current));
  };

  const getDeviceIcon = (type: string) => {
    return deviceIcons[type?.toLowerCase()] || Globe;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <AppShell>
      <PageHeader
        title="Session Management"
        description="Manage your active sessions and login history"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={terminateAllOtherSessions}
              className="gap-2 text-red-500 hover:text-red-600"
              disabled={sessions.filter(s => !s.is_current).length === 0}
            >
              <LogOut className="h-4 w-4" />
              Sign out all other devices
            </Button>
          </div>
        }
      />

      {/* Security Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Sessions', value: sessions.length, icon: Monitor, color: 'text-blue-500' },
          { label: 'Trusted Devices', value: sessions.filter(s => s.is_current).length, icon: Shield, color: 'text-green-500' },
          { label: 'Failed Logins (24h)', value: loginHistory.filter(l => l.status === 'failed').length, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Security Score', value: '92%', icon: CheckCircle, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="glass-card p-1 h-auto">
          <TabsTrigger value="sessions" className="rounded-lg gap-1.5">
            <Monitor className="h-4 w-4" />
            Active Sessions
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Login History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                  <CardDescription>Devices currently logged into your account</CardDescription>
                </div>
                <Badge variant="outline">{sessions.length} active</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No active sessions</p>
                  <p className="text-sm text-muted-foreground">Sign in to see your sessions</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sessions.map((session, i) => {
                    const DeviceIcon = getDeviceIcon(session.device_type);
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className={cn(
                          'flex items-center justify-between p-4 hover:bg-muted/30 transition-colors',
                          session.is_current && 'bg-green-500/5'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-lg flex items-center justify-center',
                            session.is_current ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                          )}>
                            <DeviceIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device_name || 'Unknown device'}</p>
                              {session.is_current && (
                                <Badge className="text-[10px] bg-green-500/10 text-green-600">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{session.browser} on {session.os}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location_city || 'Unknown location'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{session.ip_address || 'Unknown IP'}</span>
                              <span>•</span>
                              <span>Last active {formatTimeAgo(session.last_activity_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!session.is_current && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => terminateSession(session.session_id)}
                              disabled={terminating === session.session_id}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              {terminating === session.session_id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Login History</CardTitle>
              <CardDescription>Recent login attempts to your account</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading history...</p>
                </div>
              ) : loginHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No login history</p>
                  <p className="text-sm text-muted-foreground">Your login attempts will appear here</p>
                </div>
              ) : (
                <div className="divide-y">
                  {loginHistory.map((record, i) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        record.status === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                      )}>
                        {record.status === 'success' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {record.status === 'success' ? 'Successful login' : 'Failed login attempt'}
                          </p>
                          <Badge variant="outline" className={cn(
                            'text-[10px]',
                            record.status === 'success' ? 'text-green-600' : 'text-red-600'
                          )}>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{record.device_type || 'Unknown device'}</span>
                          <span>•</span>
                          <span>{record.ip_address || 'Unknown IP'}</span>
                          {record.location && (
                            <>
                              <span>•</span>
                              <span>{record.location}</span>
                            </>
                          )}
                        </div>
                        {record.failure_reason && (
                          <p className="text-xs text-red-500 mt-1">{record.failure_reason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.login_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.login_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
