/**
 * SHARIK CRM Server-Side Feature Flags
 *
 * Feature flags are now controlled server-side via environment variables.
 * Client code CANNOT override these flags. Only infrastructure/DevOps can change them.
 *
 * To enable a flag: set SHARIK_FLAG_<NAME>=true in .env.local or server environment.
 * Default: all Sprint 7 enterprise flags remain FALSE until manual QA is complete.
 */

export interface FeatureFlags {
  enable_google_oauth: boolean;
  enable_microsoft_oauth: boolean;
  enable_github_oauth: boolean;
  enable_linkedin_oauth: boolean;
  enable_apple_oauth: boolean;
  enable_saml2: boolean;
  enable_scim: boolean;
  enable_risk_based_auth: boolean;
  enable_impossible_travel_detection: boolean;
  enable_domain_restriction: boolean;
  enable_licensing: boolean;
  enable_usage_metering: boolean;
  enable_white_label: boolean;
  enable_secret_rotation: boolean;
  enable_payments: boolean;
  enable_stripe: boolean;
  enable_razorpay: boolean;
  enable_paypal: boolean;
  enable_wise: boolean;
  enable_paddle: boolean;
  enable_lemonsqueezy: boolean;
  enable_edms: boolean;
  enable_enterprise_security_platform: boolean;
  enable_ai_platform: boolean;
  enable_workflows: boolean;
  enable_public_api: boolean;
  enable_webhooks: boolean;
  enable_integration_hub: boolean;
}

/**
 * Read a boolean flag from process.env.
 * Format: SHARIK_FLAG_ENABLE_GOOGLE_OAUTH=true
 * Defaults to `defaultValue` if the env var is unset.
 */
function envFlag(name: keyof FeatureFlags, defaultValue: boolean): boolean {
  const envKey = `SHARIK_FLAG_${name.toUpperCase()}`;
  const val = process.env[envKey];
  if (val === undefined || val === null) return defaultValue;
  return val.toLowerCase() === 'true' || val === '1';
}

/**
 * Server-side feature flags — read from environment variables ONLY.
 * These are evaluated at request time on the server. Never exposed to localStorage.
 */
export const defaultFeatureFlags: FeatureFlags = {
  enable_google_oauth: envFlag('enable_google_oauth', true),
  enable_microsoft_oauth: envFlag('enable_microsoft_oauth', true),
  enable_github_oauth: envFlag('enable_github_oauth', true),
  enable_linkedin_oauth: envFlag('enable_linkedin_oauth', true),
  enable_apple_oauth: envFlag('enable_apple_oauth', false),
  enable_saml2: envFlag('enable_saml2', true),
  enable_scim: envFlag('enable_scim', true),
  enable_risk_based_auth: envFlag('enable_risk_based_auth', true),
  enable_impossible_travel_detection: envFlag('enable_impossible_travel_detection', true),
  enable_domain_restriction: envFlag('enable_domain_restriction', true),
  enable_licensing: envFlag('enable_licensing', true),
  enable_usage_metering: envFlag('enable_usage_metering', true),
  enable_white_label: envFlag('enable_white_label', true),
  enable_secret_rotation: envFlag('enable_secret_rotation', true),
  enable_payments: envFlag('enable_payments', true),
  enable_stripe: envFlag('enable_stripe', true),
  enable_razorpay: envFlag('enable_razorpay', true),
  enable_paypal: envFlag('enable_paypal', true),
  enable_wise: envFlag('enable_wise', true),
  enable_paddle: envFlag('enable_paddle', true),
  enable_lemonsqueezy: envFlag('enable_lemonsqueezy', true),
  enable_edms: envFlag('enable_edms', true),
  enable_enterprise_security_platform: envFlag('enable_enterprise_security_platform', true),
  // Sprint 7 — disabled by default; require manual QA + env var to enable
  enable_ai_platform: envFlag('enable_ai_platform', false),
  enable_workflows: envFlag('enable_workflows', false),
  enable_public_api: envFlag('enable_public_api', false),
  enable_webhooks: envFlag('enable_webhooks', false),
  enable_integration_hub: envFlag('enable_integration_hub', false),
};

/**
 * Returns server-side evaluated feature flags.
 * Call ONLY from server components, API routes, and server-side logic.
 * Do NOT call from client components — use getClientSafeFlags() instead.
 */
export function getFeatureFlags(): FeatureFlags {
  return defaultFeatureFlags;
}

/**
 * Returns a safe subset of feature flags that can be serialized to the client.
 * Contains NO sensitive enterprise flags.
 */
export function getClientSafeFlags(): Pick<FeatureFlags,
  'enable_google_oauth' | 'enable_microsoft_oauth' | 'enable_github_oauth' |
  'enable_linkedin_oauth' | 'enable_apple_oauth'
> {
  const flags = getFeatureFlags();
  return {
    enable_google_oauth: flags.enable_google_oauth,
    enable_microsoft_oauth: flags.enable_microsoft_oauth,
    enable_github_oauth: flags.enable_github_oauth,
    enable_linkedin_oauth: flags.enable_linkedin_oauth,
    enable_apple_oauth: flags.enable_apple_oauth,
  };
}

/**
 * Checks if a feature flag is enabled (server-side only).
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return defaultFeatureFlags[flag] ?? false;
}
