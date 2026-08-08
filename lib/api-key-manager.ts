/**
 * SHARIK CRM Public Developer API Key Manager
 * Handles API key generation, SHA-256 hashing, scope permissions, expiration, key rotation, and OpenAPI schema generation.
 */

import { supabase } from '@/lib/supabase';
import { cryptoNativeHMACSHA256 } from '@/lib/crypto-utils';
import crypto from 'crypto';

// API Key HMAC salt — sourced from server environment variable (never client-exposed)
const API_KEY_HASH_SALT = process.env.API_KEY_HASH_SALT || 'sharik_public_api_secret_salt_fallback_change_in_production';

export interface GeneratedAPIKey {
  id: string;
  keyPrefix: string;
  rawApiKey: string; // Displayed once upon creation
  scopes: string[];
  expiresAt?: string;
}

export class EnterpriseAPIKeyManager {
  /**
   * Create New Public API Key
   */
  static async createAPIKey(
    tenantId: string,
    name: string,
    scopes: string[] = ['leads:read', 'leads:write'],
    rateLimitPerMin: number = 60,
    expirationDays?: number
  ): Promise<GeneratedAPIKey> {
    const rawSecret = crypto.randomBytes(24).toString('hex');
    const keyPrefix = `sharik_live_${crypto.randomBytes(4).toString('hex')}`;
    const rawApiKey = `${keyPrefix}_${rawSecret}`;

    const apiKeyHash = cryptoNativeHMACSHA256(rawApiKey, API_KEY_HASH_SALT);
    const expiresAt = expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString() : undefined;

    const { data: created } = await supabase
      .from('public_api_keys')
      .insert({
        tenant_id: tenantId,
        name,
        api_key_hash: apiKeyHash,
        key_prefix: keyPrefix,
        scopes,
        rate_limit_per_min: rateLimitPerMin,
        expires_at: expiresAt || null,
        is_active: true,
      })
      .select('id')
      .single();

    return {
      id: created?.id || `key_${Date.now()}`,
      keyPrefix,
      rawApiKey,
      scopes,
      expiresAt,
    };
  }

  /**
   * Rotate Existing API Key
   */
  static async rotateAPIKey(keyId: string): Promise<string> {
    const rawSecret = crypto.randomBytes(24).toString('hex');
    const newRawApiKey = `sharik_live_rot_${rawSecret}`;
    const newHash = cryptoNativeHMACSHA256(newRawApiKey, API_KEY_HASH_SALT);

    await supabase
      .from('public_api_keys')
      .update({
        api_key_hash: newHash,
        last_rotated_at: new Date().toISOString(),
      })
      .eq('id', keyId);

    return newRawApiKey;
  }

  /**
   * Verify API Key & Validate Scope Access
   */
  static async authenticateKey(rawApiKey: string, requiredScope?: string) {
    if (!rawApiKey) return { valid: false, reason: 'Missing API Key' };

    const apiKeyHash = cryptoNativeHMACSHA256(rawApiKey, API_KEY_HASH_SALT);

    const { data: record } = await supabase
      .from('public_api_keys')
      .select('*')
      .eq('api_key_hash', apiKeyHash)
      .eq('is_active', true)
      .maybeSingle();

    if (!record) {
      return { valid: false, reason: 'Invalid or revoked API Key' };
    }

    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return { valid: false, reason: 'API Key expired' };
    }

    if (requiredScope && !record.scopes?.includes(requiredScope)) {
      return { valid: false, reason: `Missing required scope: ${requiredScope}` };
    }

    return { valid: true, tenant_id: record.tenant_id, scopes: record.scopes };
  }

  /**
   * OpenAPI 3.0 Specification Schema Generator Helper
   */
  static getOpenAPISpecJson() {
    return {
      openapi: '3.0.0',
      info: { title: 'SHARIK CRM Public Developer API', version: '1.0.0' },
      paths: {
        '/api/v1/leads': {
          get: { summary: 'List CRM Leads', security: [{ ApiKeyAuth: [] }] },
          post: { summary: 'Create CRM Lead', security: [{ ApiKeyAuth: [] }] },
        },
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
        },
      },
    };
  }
}
