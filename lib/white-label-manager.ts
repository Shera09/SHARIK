/**
 * SHARIK CRM Enterprise White-Label Branding Manager
 * Manages custom company logo, primary/secondary theme colors, custom login branding,
 * custom email templates, and domain branding configuration.
 */

import { supabase } from '@/lib/supabase';

export interface WhiteLabelConfig {
  company_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  custom_domain?: string;
  login_welcome_title?: string;
  login_welcome_subtitle?: string;
  email_from_name?: string;
}

export const defaultWhiteLabelConfig: WhiteLabelConfig = {
  company_name: 'WebHoster AI Business OS',
  primary_color: '#10B981',
  secondary_color: '#6366F1',
  accent_color: '#F59E0B',
  font_family: 'Inter',
  login_welcome_title: 'Welcome back',
  login_welcome_subtitle: 'Sign in to your intelligent business operating system',
  email_from_name: 'SHARIK CRM Notifications',
};

export async function getTenantWhiteLabelConfig(tenantId: string): Promise<WhiteLabelConfig> {
  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, logo_url, favicon_url, primary_color, secondary_color, accent_color, font_family, custom_domain, settings')
      .eq('id', tenantId)
      .maybeSingle();

    if (tenant) {
      return {
        company_name: tenant.name || defaultWhiteLabelConfig.company_name,
        logo_url: tenant.logo_url || undefined,
        favicon_url: tenant.favicon_url || undefined,
        primary_color: tenant.primary_color || defaultWhiteLabelConfig.primary_color,
        secondary_color: tenant.secondary_color || defaultWhiteLabelConfig.secondary_color,
        accent_color: tenant.accent_color || defaultWhiteLabelConfig.accent_color,
        font_family: tenant.font_family || defaultWhiteLabelConfig.font_family,
        custom_domain: tenant.custom_domain || undefined,
        login_welcome_title: tenant.settings?.login_welcome_title || defaultWhiteLabelConfig.login_welcome_title,
        login_welcome_subtitle: tenant.settings?.login_welcome_subtitle || defaultWhiteLabelConfig.login_welcome_subtitle,
        email_from_name: tenant.settings?.email_from_name || defaultWhiteLabelConfig.email_from_name,
      };
    }
  } catch {}

  return defaultWhiteLabelConfig;
}
