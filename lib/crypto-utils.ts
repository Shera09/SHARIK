import crypto from 'crypto';

/**
 * Native Node.js crypto HMAC SHA-256 implementation
 */
export function cryptoNativeHMACSHA256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}
