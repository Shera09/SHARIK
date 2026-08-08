/**
 * SHARIK CRM Enterprise Device Trust Engine
 * Generates SHA-256 client device fingerprints and manages trusted devices.
 */

import { cryptoNativeHMACSHA256 } from '@/lib/crypto-utils';
import { supabase } from '@/lib/supabase';

export interface DeviceMetadata {
  userAgent: string;
  ipAddress: string;
  browser?: string;
  os?: string;
  screenResolution?: string;
}

export class EnterpriseDeviceTrustEngine {
  /**
   * Compute Hashed Device Fingerprint
   */
  static generateFingerprint(meta: DeviceMetadata): string {
    const rawData = `${meta.userAgent}|${meta.screenResolution || '1920x1080'}|${meta.os || 'Windows'}`;
    return cryptoNativeHMACSHA256(rawData, 'sharik_device_fingerprint_salt');
  }

  /**
   * Register or Update Trusted Device
   */
  static async registerDevice(
    userId: string,
    tenantId: string,
    meta: DeviceMetadata
  ): Promise<{ deviceId: string; isTrusted: boolean }> {
    const fingerprint = this.generateFingerprint(meta);

    const { data: existing } = await supabase
      .from('user_trusted_devices')
      .select('id, is_trusted')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('device_fingerprint', fingerprint)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_trusted_devices')
        .update({ last_used_at: new Date().toISOString(), ip_address: meta.ipAddress })
        .eq('id', existing.id);

      return { deviceId: existing.id, isTrusted: existing.is_trusted };
    }

    const { data: created } = await supabase
      .from('user_trusted_devices')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        device_fingerprint: fingerprint,
        device_name: `${meta.browser || 'Browser'} on ${meta.os || 'Desktop'}`,
        browser: meta.browser || 'Browser',
        os: meta.os || 'Desktop',
        ip_address: meta.ipAddress,
        is_trusted: true,
      })
      .select('id')
      .single();

    return { deviceId: created?.id || `dev_${Date.now()}`, isTrusted: true };
  }

  /**
   * Revoke Device Trust
   */
  static async revokeDevice(deviceId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_trusted_devices')
      .update({ is_trusted: false })
      .eq('id', deviceId);

    return !error;
  }
}
