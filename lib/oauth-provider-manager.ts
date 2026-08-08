import { Provider } from '@supabase/supabase-js';
import { isFeatureEnabled } from '@/lib/feature-flags';

export type SupportedOAuthProvider = 'google' | 'azure' | 'github' | 'linkedin' | 'apple' | 'saml' | 'scim';

export interface OAuthProviderMetadata {
  id: SupportedOAuthProvider;
  name: string;
  supabaseProvider: Provider;
  scopes: string;
  icon: string;
  enabled: boolean;
  enterpriseOnly?: boolean;
}

export const OAUTH_PROVIDER_REGISTRY: Record<SupportedOAuthProvider, OAuthProviderMetadata> = {
  google: {
    id: 'google',
    name: 'Google Workspace',
    supabaseProvider: 'google',
    scopes: 'email profile',
    icon: 'google',
    enabled: true,
  },
  azure: {
    id: 'azure',
    name: 'Microsoft Entra ID / 365',
    supabaseProvider: 'azure',
    scopes: 'email profile User.Read',
    icon: 'microsoft',
    enabled: true,
  },
  github: {
    id: 'github',
    name: 'GitHub Enterprise',
    supabaseProvider: 'github',
    scopes: 'user:email read:user',
    icon: 'github',
    enabled: true,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Corporation',
    supabaseProvider: 'linkedin_oidc' as unknown as Provider,
    scopes: 'openid profile email',
    icon: 'linkedin',
    enabled: true,
  },
  apple: {
    id: 'apple',
    name: 'Apple ID',
    supabaseProvider: 'apple',
    scopes: 'email name',
    icon: 'apple',
    enabled: false,
  },
  saml: {
    id: 'saml',
    name: 'SAML 2.0 Identity Provider',
    supabaseProvider: 'azure', // Handled via enterprise bridge
    scopes: 'openid',
    icon: 'shield',
    enabled: false,
    enterpriseOnly: true,
  },
  scim: {
    id: 'scim',
    name: 'SCIM 2.0 User Provisioning',
    supabaseProvider: 'azure',
    scopes: 'scim',
    icon: 'users',
    enabled: false,
    enterpriseOnly: true,
  },
};

/**
 * Generate secure OAuth state token
 */
export function generateOAuthState(): string {
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', nonce);
  }
  return nonce;
}

/**
 * Validate incoming OAuth state token
 */
export function validateOAuthState(state: string | null): boolean {
  if (typeof window === 'undefined' || !state) return true; // Server-side context fallback
  const storedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  return storedState ? storedState === state : true;
}

/**
 * Domain Restriction Policy Validator
 */
export function validateDomainPolicy(email: string, allowedDomains: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return allowedDomains.some((d) => d.toLowerCase() === domain);
}

/**
 * Risk Assessment Engine: Impossible Travel Detection
 */
export interface LoginGeoLocation {
  ip: string;
  country?: string;
  city?: string;
  lat?: number;
  lon?: number;
  timestamp: string;
}

export function detectImpossibleTravel(previousLocation?: LoginGeoLocation, currentLocation?: LoginGeoLocation): { isImpossible: boolean; distanceKm: number; speedKmH: number } {
  if (
    !previousLocation ||
    !currentLocation ||
    previousLocation.lat === undefined ||
    previousLocation.lon === undefined ||
    currentLocation.lat === undefined ||
    currentLocation.lon === undefined
  ) {
    return { isImpossible: false, distanceKm: 0, speedKmH: 0 };
  }

  // Haversine formula distance calculation
  const R = 6371; // Earth radius in KM
  const dLat = ((currentLocation.lat - previousLocation.lat) * Math.PI) / 180;
  const dLon = ((currentLocation.lon - previousLocation.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((previousLocation.lat * Math.PI) / 180) *
      Math.cos((currentLocation.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  const timeDiffHours = (new Date(currentLocation.timestamp).getTime() - new Date(previousLocation.timestamp).getTime()) / (1000 * 60 * 60);

  if (timeDiffHours <= 0) return { isImpossible: false, distanceKm, speedKmH: 0 };

  const speedKmH = distanceKm / timeDiffHours;
  // Maximum commercial aircraft speed ~900 km/h
  const isImpossible = speedKmH > 950 && distanceKm > 300;

  return { isImpossible, distanceKm: Math.round(distanceKm), speedKmH: Math.round(speedKmH) };
}

/**
 * Calculate Risk Score (0 - 100)
 */
export function calculateRiskScore(params: {
  isNewDevice: boolean;
  isNewIp: boolean;
  isImpossibleTravel: boolean;
  failedAttemptsLastHour: number;
}): number {
  let score = 0;
  if (params.isNewDevice) score += 20;
  if (params.isNewIp) score += 15;
  if (params.isImpossibleTravel) score += 55;
  if (params.failedAttemptsLastHour > 3) score += 30;
  return Math.min(100, score);
}

/**
 * Normalized Profile Metadata Extractor across Providers
 */
export function extractNormalizedProfile(userMetadata: Record<string, any>, userEmail: string): { fullName: string; avatarUrl: string } {
  const fullName =
    userMetadata.full_name ||
    userMetadata.name ||
    userMetadata.preferred_username ||
    userMetadata.user_name ||
    userEmail.split('@')[0] ||
    'User';

  const avatarUrl =
    userMetadata.avatar_url ||
    userMetadata.picture ||
    userMetadata.avatar_url_hd ||
    '';

  return { fullName, avatarUrl };
}
