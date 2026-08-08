/**
 * SHARIK CRM Enterprise Webhook Dispatcher — Production HTTP Delivery
 *
 * Implements:
 * - HMAC SHA-256 payload signature (X-Sharik-Signature header)
 * - Real HTTP POST delivery to target_url
 * - Exponential backoff retry (up to 5 attempts)
 * - Dead Letter Queue (DLQ) recording for failed deliveries
 * - Manual event replay from DLQ
 * - Per-delivery timeout (10 seconds)
 * - Delivery status tracking in webhook_delivery_logs
 */

import { supabase } from '@/lib/supabase';
import { cryptoNativeHMACSHA256 } from '@/lib/crypto-utils';

const WEBHOOK_TIMEOUT_MS = 10_000; // 10 second per-delivery timeout
const MAX_RETRY_ATTEMPTS = 5;

export class EnterpriseWebhookDispatcher {
  /**
   * Compute HMAC SHA-256 Signature for Outbound Webhook Payload
   */
  static generateSignature(payload: string, secretKey: string): string {
    return cryptoNativeHMACSHA256(payload, secretKey);
  }

  /**
   * Deliver Payload to a Single Target URL with Exponential Backoff
   */
  private static async deliverWithRetry(
    targetUrl: string,
    payloadString: string,
    signature: string,
    maxAttempts: number = MAX_RETRY_ATTEMPTS
  ): Promise<{ success: boolean; statusCode?: number; attempts: number; error?: string }> {
    let lastError = '';
    let attempts = 0;

    for (let i = 0; i < maxAttempts; i++) {
      attempts = i + 1;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Sharik-Signature': `sha256=${signature}`,
            'X-Sharik-Event-Timestamp': new Date().toISOString(),
            'User-Agent': 'SHARIK-CRM-Webhook/1.0',
          },
          body: payloadString,
        });
        clearTimeout(timer);

        if (response.ok || (response.status >= 200 && response.status < 300)) {
          return { success: true, statusCode: response.status, attempts };
        }

        // 4xx errors should NOT be retried (permanent failure from receiver)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            statusCode: response.status,
            attempts,
            error: `Receiver returned ${response.status} — no retry`,
          };
        }

        lastError = `HTTP ${response.status} from ${targetUrl}`;
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err?.name === 'AbortError'
          ? `Timeout after ${WEBHOOK_TIMEOUT_MS}ms`
          : (err?.message || 'Network error');
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }

    return { success: false, attempts, error: lastError };
  }

  /**
   * Dispatch Event to All Subscribed Active Webhooks for a Tenant
   */
  static async dispatchEvent(
    tenantId: string,
    eventType: string,
    data: Record<string, any>
  ): Promise<{ dispatched: number; failed: number; dlqCount: number }> {
    let dispatched = 0;
    let failed = 0;
    let dlqCount = 0;

    try {
      const { data: webhooks } = await supabase
        .from('outbound_webhooks')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (!webhooks || webhooks.length === 0) {
        return { dispatched: 0, failed: 0, dlqCount: 0 };
      }

      const payloadString = JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        tenant_id: tenantId,
        data,
      });

      for (const hook of webhooks) {
        // Skip if this webhook doesn't subscribe to this event
        if (hook.events && !hook.events.includes(eventType)) continue;

        const signature = this.generateSignature(payloadString, hook.secret_key);
        const retryPolicy = hook.retry_policy || {};
        const maxAttempts = retryPolicy.max_attempts || MAX_RETRY_ATTEMPTS;

        const result = await this.deliverWithRetry(
          hook.target_url,
          payloadString,
          signature,
          maxAttempts
        );

        const deliveryStatus = result.success
          ? 'delivered'
          : result.attempts >= maxAttempts
          ? 'dead_letter'
          : 'failed';

        // Record delivery log
        await supabase.from('webhook_delivery_logs').insert({
          tenant_id: tenantId,
          webhook_id: hook.id,
          event_type: eventType,
          status: deliveryStatus,
          attempts: result.attempts,
          payload: data,
          response_code: result.statusCode || null,
          next_retry_at: null, // DLQ items require manual replay
        });

        if (result.success) {
          dispatched++;
          // Reset failure counter on success
          await supabase
            .from('outbound_webhooks')
            .update({ failure_count: 0 })
            .eq('id', hook.id);
        } else {
          failed++;
          if (deliveryStatus === 'dead_letter') dlqCount++;
          // Increment failure counter
          await supabase
            .from('outbound_webhooks')
            .update({ failure_count: (hook.failure_count || 0) + 1 })
            .eq('id', hook.id);
        }
      }
    } catch (err: any) {
      console.error('[Webhook Dispatcher Error]:', err);
    }

    return { dispatched, failed, dlqCount };
  }

  /**
   * Replay a Failed Webhook Event from the Dead Letter Queue
   */
  static async replayDLQEvent(logId: string): Promise<{ success: boolean; error?: string }> {
    const { data: log } = await supabase
      .from('webhook_delivery_logs')
      .select('*, outbound_webhooks!webhook_id(*)')
      .eq('id', logId)
      .maybeSingle();

    if (!log) return { success: false, error: 'DLQ log entry not found' };

    const hook = (log as any).outbound_webhooks;
    if (!hook) return { success: false, error: 'Associated webhook not found' };

    const payloadString = JSON.stringify({
      event: log.event_type,
      timestamp: new Date().toISOString(),
      replayed: true,
      original_log_id: logId,
      data: log.payload,
    });
    const signature = this.generateSignature(payloadString, hook.secret_key);

    const result = await this.deliverWithRetry(hook.target_url, payloadString, signature, 3);

    await supabase
      .from('webhook_delivery_logs')
      .update({
        status: result.success ? 'delivered' : 'dead_letter',
        attempts: (log.attempts || 1) + result.attempts,
        response_code: result.statusCode || null,
      })
      .eq('id', logId);

    return { success: result.success, error: result.error };
  }
}
