/**
 * Centralized Enterprise Feature Access & Usage Metering Manager
 * Controls plan entitlement checks, usage limit enforcement (AI credits, storage, API calls),
 * domain/device limits, and security audit event logging.
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/monitoring';
import { verifySignedLicenseToken, LicensePlanType, LicenseVerificationResult } from '@/lib/licensing-engine';

export type GatedFeatureKey =
  | 'ai'
  | 'whatsapp'
  | 'reports'
  | 'reviews'
  | 'white_label'
  | 'api_access'
  | 'crm_modules'
  | 'marketplace';

export type UsageMetricKey =
  | 'active_users'
  | 'storage_mb_used'
  | 'ai_credits_used'
  | 'api_calls_count'
  | 'whatsapp_messages_count'
  | 'email_volume_count';

export interface PlanEntitlements {
  plan_type: LicensePlanType;
  ai: boolean;
  whatsapp: boolean;
  reports: boolean;
  reviews: boolean;
  white_label: boolean;
  api_access: boolean;
  max_users: number;
  max_storage_mb: number;
  max_customers: number;
  ai_credits: number;
}

export class FeatureAccessManager {
  /**
   * Check if a tenant has access to a specific feature flag
   */
  static async checkFeatureAccess(tenantId: string, feature: GatedFeatureKey): Promise<boolean> {
    try {
      const entitlements = await this.getTenantEntitlements(tenantId);
      const isAllowed = Boolean((entitlements as any)[feature]);

      if (!isAllowed) {
        await this.logSecurityEvent('feature_denied', tenantId, {
          feature,
          plan_type: entitlements.plan_type,
          timestamp: new Date().toISOString(),
        });
      }

      return isAllowed;
    } catch {
      return true; // Fallback to avoid breaking core UI in emergency
    }
  }

  /**
   * Check if tenant usage stays within plan limits
   */
  static async checkUsageLimit(
    tenantId: string,
    metric: UsageMetricKey,
    requestedAmount: number = 1
  ): Promise<{ allowed: boolean; currentUsage: number; maxLimit: number }> {
    try {
      const entitlements = await this.getTenantEntitlements(tenantId);
      const { data: usageLog } = await supabase
        .from('usage_metering_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('metric_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const currentUsage = usageLog ? Number((usageLog as any)[metric] || 0) : 0;
      let maxLimit = 1000;

      if (metric === 'active_users') maxLimit = entitlements.max_users;
      else if (metric === 'storage_mb_used') maxLimit = entitlements.max_storage_mb;
      else if (metric === 'ai_credits_used') maxLimit = entitlements.ai_credits;

      const allowed = currentUsage + requestedAmount <= maxLimit;

      if (!allowed) {
        const eventType = metric === 'active_users' ? 'seat_limit_exceeded' : 'feature_denied';
        await this.logSecurityEvent(eventType, tenantId, {
          metric,
          currentUsage,
          requestedAmount,
          maxLimit,
          timestamp: new Date().toISOString(),
        });
      }

      return { allowed, currentUsage, maxLimit };
    } catch {
      return { allowed: true, currentUsage: 0, maxLimit: 100000 };
    }
  }

  /**
   * Record real-time usage metrics
   */
  static async recordUsageMetric(tenantId: string, metric: UsageMetricKey, amount: number = 1): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: existingLog } = await supabase
        .from('usage_metering_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('metric_date', today)
        .maybeSingle();

      if (existingLog) {
        const updatedVal = Number((existingLog as any)[metric] || 0) + amount;
        await supabase
          .from('usage_metering_logs')
          .update({ [metric]: updatedVal, recorded_at: new Date().toISOString() })
          .eq('id', existingLog.id);
      } else {
        await supabase.from('usage_metering_logs').insert({
          tenant_id: tenantId,
          [metric]: amount,
          metric_date: today,
          recorded_at: new Date().toISOString(),
        });
      }
    } catch {}
  }

  /**
   * Get entitlements matrix for tenant
   */
  static async getTenantEntitlements(tenantId: string): Promise<PlanEntitlements> {
    const defaultStarter: PlanEntitlements = {
      plan_type: 'starter',
      ai: true,
      whatsapp: false,
      reports: true,
      reviews: false,
      white_label: false,
      api_access: false,
      max_users: 5,
      max_storage_mb: 500,
      max_customers: 1000,
      ai_credits: 10000,
    };

    try {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('current_plan')
        .eq('id', tenantId)
        .maybeSingle();

      const planType = (tenant?.current_plan || 'starter') as LicensePlanType;

      const { data: entitlement } = await supabase
        .from('feature_entitlements')
        .select('features')
        .eq('plan_type', planType)
        .maybeSingle();

      if (entitlement?.features) {
        return { plan_type: planType, ...entitlement.features };
      }
    } catch {}

    return defaultStarter;
  }

  /**
   * Log licensing security audit events
   */
  private static async logSecurityEvent(eventType: string, tenantId: string, details: Record<string, any>): Promise<void> {
    try {
      await supabase.from('security_events').insert({
        event_type: eventType,
        severity: 'warning',
        resource: 'licensing/feature_access',
        action: eventType,
        details: { tenant_id: tenantId, ...details },
      });

      await logger.log('security', 'warn', `Licensing Event: ${eventType}`, { tenantId, ...details }, tenantId);
    } catch {}
  }
}
