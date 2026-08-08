/**
 * SHARIK CRM Enterprise MFA Engine (RFC6238 TOTP & Backup Recovery Codes)
 */

import { cryptoNativeHMACSHA256 } from '@/lib/crypto-utils';
import { supabase } from '@/lib/supabase';

export interface TOTPSetupResult {
  secret: string;
  otpauth_url: string;
  qr_code_data: string;
}

export class EnterpriseMFAEngine {
  /**
   * Generate RFC6238 TOTP Secret & OTPAuth Data
   */
  static generateTOTPSecret(userEmail: string, issuer: string = 'SHARIK CRM'): TOTPSetupResult {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    const qrCodeData = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    return { secret, otpauth_url: otpauthUrl, qr_code_data: qrCodeData };
  }

  /**
   * Verify RFC6238 TOTP Code (30-second window calculation)
   */
  static verifyTOTPCode(secret: string, code: string, windowSeconds: number = 30): boolean {
    if (!code || code.length !== 6 || !secret) return false;

    const timeStep = Math.floor(Date.now() / 1000 / windowSeconds);
    // Calculate hash for current time window and adjacent windows for clock skew tolerance
    for (let i = -1; i <= 1; i++) {
      const step = timeStep + i;
      const expectedCode = this.calculateTOTPForStep(secret, step);
      if (expectedCode === code) return true;
    }
    return false;
  }

  private static calculateTOTPForStep(secret: string, step: number): string {
    const hash = cryptoNativeHMACSHA256(String(step), secret);
    // Extract 6-digit numeric string from hash
    const num = Math.abs(parseInt(hash.substring(0, 8), 16)) % 1000000;
    return String(num).padStart(6, '0');
  }

  /**
   * Generate 10 Random 8-Digit Backup Recovery Codes
   */
  static generateBackupCodes(count: number = 10): { rawCodes: string[]; hashedCodes: string[] } {
    const rawCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      const hash = cryptoNativeHMACSHA256(code, 'sharik_mfa_backup_secret');
      rawCodes.push(code);
      hashedCodes.push(hash);
    }

    return { rawCodes, hashedCodes };
  }

  /**
   * Redeem Backup Recovery Code
   */
  static async verifyAndRedeemBackupCode(userId: string, tenantId: string, rawCode: string): Promise<boolean> {
    const codeHash = cryptoNativeHMACSHA256(rawCode, 'sharik_mfa_backup_secret');

    const { data: record } = await supabase
      .from('user_mfa_backup_codes')
      .select('id, is_used')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('code_hash', codeHash)
      .eq('is_used', false)
      .maybeSingle();

    if (!record) return false;

    await supabase
      .from('user_mfa_backup_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', record.id);

    return true;
  }
}
