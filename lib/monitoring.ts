import { supabase } from '@/lib/supabase';

export type LogSeverity = 'info' | 'warn' | 'error' | 'fatal';
export type LogCategory =
  | 'application'
  | 'api'
  | 'webhook'
  | 'worker'
  | 'payment'
  | 'whatsapp'
  | 'email'
  | 'auth'
  | 'audit'
  | 'security';

export type MetricData = {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
};

export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

class TelemetryLogger {
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log an event across application boundaries with Correlation ID and Trace ID.
   */
  async log(
    category: LogCategory,
    severity: LogSeverity,
    message: string,
    metadata: Record<string, any> = {},
    organization_id?: string
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const correlationId = metadata.correlationId || generateCorrelationId();
    const traceId = metadata.traceId || generateTraceId();

    const structuredPayload = {
      severity,
      category,
      message,
      correlation_id: correlationId,
      trace_id: traceId,
      metadata,
      timestamp,
    };

    if (!this.isProduction) {
      console.log(`[${timestamp}] [${severity.toUpperCase()}] [${category}] [Corr:${correlationId}]: ${message}`, metadata);
    }

    try {
      // Store audit log in Supabase audit_logs table
      await supabase.from('audit_logs').insert({
        action: `${category}:${message}`,
        details: structuredPayload,
        organization_id: organization_id || null,
      });
    } catch {}
  }

  /**
   * Capture exceptions with stack trace and context.
   */
  async captureException(error: Error | any, category: LogCategory = 'application', metadata: Record<string, any> = {}): Promise<void> {
    const errorMessage = error?.message || String(error);
    const stack = error?.stack || '';

    await this.log(category, 'error', errorMessage, { ...metadata, stack });
  }

  /**
   * Record telemetry metrics (API latency, response time, DB latency).
   */
  recordMetric(metric: MetricData): void {
    if (!this.isProduction) {
      console.log(`[METRIC] ${metric.name}: ${metric.value}${metric.unit || ''}`, metric.tags || {});
    }
  }
}

export const logger = new TelemetryLogger();
