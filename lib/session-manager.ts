/**
 * SHARIK CRM Active Session Manager Engine
 * Tracks active sessions, enforces concurrent session limits, and manages remote session revocation.
 */

import { supabase } from '@/lib/supabase';
import { cryptoNativeHMACSHA256 } from '@/lib/crypto-utils';

export class EnterpriseSessionManager {
  /**
   * Create & Register Active Session Record
   */
  static async registerSession(
    userId: string,
    tenantId: string,
    sessionToken: string,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const tokenHash = cryptoNativeHMACSHA256(sessionToken, 'sharik_session_salt');

    // Check & Enforce Concurrent Session Limits (e.g. Max 3 active sessions)
    const { data: activeSessions } = await supabase
      .from('user_active_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (activeSessions && activeSessions.length >= 3) {
      // Terminate oldest session to enforce concurrent limit
      await supabase
        .from('user_active_sessions')
        .update({ is_active: false })
        .eq('id', activeSessions[0].id);
    }

    const { data: session } = await supabase
      .from('user_active_sessions')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        session_token_hash: tokenHash,
        device_id: deviceId || null,
        ip_address: ipAddress || '127.0.0.1',
        user_agent: userAgent || 'SHARIK Client',
        is_active: true,
      })
      .select('*')
      .single();

    return session;
  }

  /**
   * Revoke Specific Session
   */
  static async revokeSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_active_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    return !error;
  }

  /**
   * Remote Logout All Sessions For User
   */
  static async logoutAllDevices(userId: string, tenantId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_active_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('tenant_id', tenantId);

    return !error;
  }
}
