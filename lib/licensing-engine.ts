/**
 * SHARIK CRM Enterprise Cryptographic Licensing Engine
 * Handles HMAC SHA-256 signed license tokens, secret rotation, clock skew tolerance,
 * tamper detection, and offline 7-day grace period calculations.
 */

import { cryptoNativeHMACSHA256 } from '@/lib/crypto-utils';

export type LicensePlanType = 'starter' | 'professional' | 'business' | 'enterprise' | 'trial';
export type LicenseStatus = 'active' | 'trialing' | 'grace_period' | 'suspended' | 'expired' | 'revoked';

export interface LicenseTokenPayload {
  license_key: string;
  tenant_id: string;
  organization_id?: string;
  plan_type: LicensePlanType;
  valid_from: string;
  valid_until: string;
  bound_domain?: string;
  max_users: number;
  max_devices: number;
  issued_at: string;
  jti: string; // Unique token identifier for replay protection
}

export interface LicenseTokenHeader {
  alg: 'HS256';
  typ: 'SHARIK-LIC';
  kid?: string; // Secret Key ID for secret rotation
}

/**
 * Format License Key Generator
 * Format: SHARIK-[PLAN]-[4 CHARS]-[4 CHARS]-[4 CHARS]
 */
export function generateFormattedLicenseKey(plan: LicensePlanType = 'starter'): string {
  const prefix = plan.toUpperCase().slice(0, 4);
  const randomSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SHARIK-${prefix}-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
}

/**
 * Generate HMAC SHA-256 Signed License Token
 */
export function createSignedLicenseToken(
  payload: LicenseTokenPayload,
  secretKey: string = process.env.LICENSE_SIGNING_SECRET || 'sharik_enterprise_licensing_secret_2026'
): string {
  const header: LicenseTokenHeader = { alg: 'HS256', typ: 'SHARIK-LIC', kid: 'v1' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = cryptoNativeHMACSHA256(dataToSign, secretKey);

  return `${dataToSign}.${signature}`;
}

/**
 * Verify Signed License Token with Secret Rotation & Clock Skew Tolerance
 */
export interface LicenseVerificationResult {
  valid: boolean;
  status: LicenseStatus;
  payload?: LicenseTokenPayload;
  reason?: string;
  isInGracePeriod?: boolean;
  graceDaysRemaining?: number;
}

export function verifySignedLicenseToken(
  token: string,
  primarySecret: string = process.env.LICENSE_SIGNING_SECRET || 'sharik_enterprise_licensing_secret_2026',
  fallbackSecret: string = process.env.LICENSE_SIGNING_SECRET_FALLBACK || 'sharik_fallback_licensing_secret_2026'
): LicenseVerificationResult {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, status: 'revoked', reason: 'Malformed license token structure' };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    // Verify signature against primary secret, then fallback secret (Secret Rotation)
    let isSignatureValid = cryptoNativeHMACSHA256(dataToSign, primarySecret) === signature;
    if (!isSignatureValid && fallbackSecret) {
      isSignatureValid = cryptoNativeHMACSHA256(dataToSign, fallbackSecret) === signature;
    }

    if (!isSignatureValid) {
      return { valid: false, status: 'revoked', reason: 'Invalid signature - token tampered or key revoked' };
    }

    const payloadText = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload: LicenseTokenPayload = JSON.parse(payloadText);

    const nowMs = Date.now();
    const clockSkewToleranceMs = 5 * 60 * 1000; // ±5 minutes leeway
    const validFromMs = new Date(payload.valid_from).getTime() - clockSkewToleranceMs;
    const validUntilMs = new Date(payload.valid_until).getTime() + clockSkewToleranceMs;

    if (nowMs < validFromMs) {
      return { valid: false, status: 'expired', payload, reason: 'License token not yet active' };
    }

    // Grace Period calculation (7 days offline allowance after expiry)
    const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;
    const expirationWithGraceMs = new Date(payload.valid_until).getTime() + gracePeriodMs;

    if (nowMs > validUntilMs) {
      if (nowMs <= expirationWithGraceMs) {
        const graceDaysRemaining = Math.ceil((expirationWithGraceMs - nowMs) / (1000 * 60 * 60 * 24));
        return {
          valid: true,
          status: 'grace_period',
          payload,
          isInGracePeriod: true,
          graceDaysRemaining,
          reason: `License expired but operating in ${graceDaysRemaining}-day offline grace period`,
        };
      } else {
        return { valid: false, status: 'expired', payload, reason: 'License and offline grace period expired' };
      }
    }

    return {
      valid: true,
      status: payload.plan_type === 'trial' ? 'trialing' : 'active',
      payload,
      isInGracePeriod: false,
    };
  } catch (err: any) {
    return { valid: false, status: 'revoked', reason: `Verification error: ${err.message}` };
  }
}

/**
 * Lightweight browser/node native HMAC SHA-256 helper for zero dependencies
 */
export function calculateHMACSignature(data: string, secret: string): string {
  return cryptoNativeHMACSHA256(data, secret);
}
