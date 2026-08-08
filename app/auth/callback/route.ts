import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractNormalizedProfile, validateDomainPolicy } from '@/lib/oauth-provider-manager';
import { logger } from '@/lib/monitoring';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorParam = requestUrl.searchParams.get('error');
  const errorDesc = requestUrl.searchParams.get('error_description');
  const providerParam = requestUrl.searchParams.get('provider') || 'sso';
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const forwardHeader = request.headers.get('x-forwarded-for');
  const ipAddress = forwardHeader ? forwardHeader.split(',')[0].trim() : '127.0.0.1';

  // Handle OAuth Cancellation / Access Denied
  if (errorParam) {
    console.warn(`[OAuth Warning] Provider ${providerParam} returned error: ${errorParam} - ${errorDesc}`);
    try {
      await supabase.from('security_events').insert({
        event_type: 'oauth_cancelled',
        severity: 'warning',
        resource: `auth/${providerParam}`,
        action: 'oauth_flow_aborted',
        source_ip: ipAddress,
        user_agent: userAgent,
        details: { provider: providerParam, error: errorParam, description: errorDesc, timestamp: new Date().toISOString() },
      });
    } catch {}

    const redirectPath = errorParam === 'access_denied' ? 'access_denied' : 'oauth_error';
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${redirectPath}`);
  }

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_callback`);
  }

  try {
    // Exchange OAuth Authorization Code for User Session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !session?.user) {
      console.error('[OAuth Error] Code exchange failed:', exchangeError);
      try {
        await supabase.from('security_events').insert({
          event_type: 'oauth_failed',
          severity: 'high',
          resource: `auth/${providerParam}`,
          action: 'code_exchange_failed',
          source_ip: ipAddress,
          user_agent: userAgent,
          details: { provider: providerParam, error: exchangeError?.message || 'No session returned', timestamp: new Date().toISOString() },
        });
      } catch {}

      return NextResponse.redirect(`${requestUrl.origin}/login?error=expired_code`);
    }

    const userId = session.user.id;
    const userEmail = session.user.email || '';
    const userMetadata = session.user.user_metadata || {};
    const { fullName, avatarUrl } = extractNormalizedProfile(userMetadata, userEmail);

    // 1. Check Tenant Domain Restriction Policy (if organization specifies allowed domains)
    const { data: orgSettings } = await supabase
      .from('security_policies')
      .select('rules')
      .eq('policy_type', 'access')
      .eq('is_active', true)
      .maybeSingle();

    const allowedDomains = orgSettings?.rules?.allowed_domains as string[] | undefined;

    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = validateDomainPolicy(userEmail, allowedDomains);
      if (!isAllowed) {
        await supabase.from('security_events').insert({
          event_type: 'domain_rejected',
          severity: 'warning',
          user_id: userId,
          user_email: userEmail,
          source_ip: ipAddress,
          user_agent: userAgent,
          resource: 'auth/domain',
          action: 'login_domain_blocked',
          details: { email: userEmail, allowed_domains: allowedDomains, timestamp: new Date().toISOString() },
        });

        await supabase.auth.signOut();
        return NextResponse.redirect(`${requestUrl.origin}/login?error=domain_restricted`);
      }
    }

    // 2. Ensure Profile in auth_profiles (Preserve existing profile data)
    const { data: existingProfile } = await supabase
      .from('auth_profiles')
      .select('id, full_name, avatar_url, organization_id')
      .eq('id', userId)
      .maybeSingle();

    let isFirstLogin = false;

    if (!existingProfile) {
      isFirstLogin = true;
      await supabase.from('auth_profiles').insert({
        id: userId,
        full_name: fullName,
        avatar_url: avatarUrl,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });
    } else if (!existingProfile.avatar_url && avatarUrl) {
      await supabase.from('auth_profiles').update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    }

    // 3. Ensure Role in user_role_assignments (NEVER overwrite existing roles)
    const { data: existingRoles } = await supabase
      .from('user_role_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!existingRoles || existingRoles.length === 0) {
      await supabase.from('user_role_assignments').insert({
        user_id: userId,
        role: 'employee',
        is_active: true,
      });
    }

    // 4. Structured Telemetry & Audit Security Logs
    await supabase.from('login_history').insert({
      username: userEmail,
      employee_name: fullName,
      status: 'success',
      ip_address: ipAddress,
      login_at: new Date().toISOString(),
    });

    await logger.log(
      'security',
      'info',
      `SSO Login Completed (${providerParam})`,
      {
        provider: providerParam,
        user_id: userId,
        user_email: userEmail,
        is_first_login: isFirstLogin,
        ip_address: ipAddress,
        user_agent: userAgent,
      }
    );

    await supabase.from('security_events').insert({
      event_type: 'sso_login',
      severity: 'info',
      user_id: userId,
      user_email: userEmail,
      source_ip: ipAddress,
      user_agent: userAgent,
      resource: `auth/${providerParam}`,
      action: 'sso_authentication_success',
      details: {
        provider: providerParam,
        is_first_login: isFirstLogin,
        timestamp: new Date().toISOString(),
      },
    });

    if (isFirstLogin) {
      await supabase.from('security_events').insert({
        event_type: 'first_login',
        severity: 'info',
        user_id: userId,
        user_email: userEmail,
        resource: 'auth/profile',
        action: 'user_profile_created',
        details: { method: providerParam, timestamp: new Date().toISOString() },
      });
    }

    // Account Linking Check
    const providers = session.user.app_metadata?.providers as string[] | undefined;
    if (providers && providers.length > 1) {
      await supabase.from('security_events').insert({
        event_type: 'provider_linked',
        severity: 'info',
        user_id: userId,
        user_email: userEmail,
        resource: 'auth/providers',
        action: 'provider_linked',
        details: { provider: providerParam, providers, timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  } catch (err: any) {
    console.error('[OAuth Exception] Callback error:', err);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=server_error`);
  }
}
