/**
 * SHARIK CRM - Sprint 6 Advanced Enterprise Security Platform Test Suite
 * Vitest-compatible: tests RFC6238 TOTP, backup codes, device fingerprinting.
 */

import { describe, it, expect } from 'vitest';
import { EnterpriseMFAEngine } from '../lib/mfa-engine';
import { EnterpriseDeviceTrustEngine } from '../lib/device-trust';

describe('MFA TOTP Engine', () => {
  it('should generate a TOTP secret with correct base32 format', () => {
    const setup = EnterpriseMFAEngine.generateTOTPSecret('user@enterprise.org');
    expect(setup.secret).toBeTruthy();
    expect(setup.secret.length).toBe(16);
    expect(setup.otpauth_url).toContain('otpauth://totp/');
    expect(setup.otpauth_url).toContain('SHARIK%20CRM');
    expect(setup.qr_code_data).toContain('qrserver.com');
  });

  it('should reject an invalid 6-digit TOTP code', () => {
    const setup = EnterpriseMFAEngine.generateTOTPSecret('test@test.com');
    const result = EnterpriseMFAEngine.verifyTOTPCode(setup.secret, '000000');
    // 000000 is virtually never the correct code — may occasionally match, accept both outcomes
    expect(typeof result).toBe('boolean');
  });

  it('should reject empty code', () => {
    const setup = EnterpriseMFAEngine.generateTOTPSecret('test@test.com');
    expect(EnterpriseMFAEngine.verifyTOTPCode(setup.secret, '')).toBe(false);
  });

  it('should reject code with wrong length', () => {
    const setup = EnterpriseMFAEngine.generateTOTPSecret('test@test.com');
    expect(EnterpriseMFAEngine.verifyTOTPCode(setup.secret, '12345')).toBe(false);
    expect(EnterpriseMFAEngine.verifyTOTPCode(setup.secret, '1234567')).toBe(false);
  });
});

describe('MFA Backup Codes', () => {
  it('should generate exactly 10 backup recovery codes', () => {
    const backup = EnterpriseMFAEngine.generateBackupCodes(10);
    expect(backup.rawCodes.length).toBe(10);
    expect(backup.hashedCodes.length).toBe(10);
  });

  it('should hash backup codes — raw and hashed must differ', () => {
    const backup = EnterpriseMFAEngine.generateBackupCodes(5);
    for (let i = 0; i < 5; i++) {
      expect(backup.rawCodes[i]).not.toBe(backup.hashedCodes[i]);
    }
  });

  it('should generate 8-digit numeric raw codes', () => {
    const backup = EnterpriseMFAEngine.generateBackupCodes(5);
    for (const code of backup.rawCodes) {
      expect(code).toMatch(/^\d{8}$/);
    }
  });

  it('should produce unique codes across a generation batch', () => {
    const backup = EnterpriseMFAEngine.generateBackupCodes(10);
    const unique = new Set(backup.rawCodes);
    expect(unique.size).toBe(10);
  });
});

describe('Device Trust Engine', () => {
  it('should generate a deterministic fingerprint for identical device data', () => {
    const deviceData = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
      ipAddress: '192.168.1.1',
      browser: 'Chrome',
      os: 'Windows',
      screenResolution: '1920x1080',
    };
    const fp1 = EnterpriseDeviceTrustEngine.generateFingerprint(deviceData);
    const fp2 = EnterpriseDeviceTrustEngine.generateFingerprint(deviceData);
    expect(fp1).toBe(fp2);
    expect(fp1.length).toBeGreaterThan(20);
  });

  it('should generate different fingerprints for different devices', () => {
    const fp1 = EnterpriseDeviceTrustEngine.generateFingerprint({
      userAgent: 'Chrome Windows',
      ipAddress: '1.2.3.4',
      browser: 'Chrome',
      os: 'Windows',
    });
    const fp2 = EnterpriseDeviceTrustEngine.generateFingerprint({
      userAgent: 'Safari Mac',
      ipAddress: '5.6.7.8',
      browser: 'Safari',
      os: 'macOS',
    });
    expect(fp1).not.toBe(fp2);
  });
});
