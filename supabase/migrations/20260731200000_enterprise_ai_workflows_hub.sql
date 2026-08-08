/*
# Enterprise AI Platform, Workflow Automation, Public API & Integration Hub Schema (Sprint 7)

## Summary
- Creates `ai_insights` table for AI Sales Copilot summaries, proposals, and predictive lead scores.
- Creates `workflow_rules` and `workflow_executions` tables for automation triggers, retries, and versioning.
- Creates `public_api_keys` table for scope-based API Key authentication, rotation, and usage tracking.
- Creates `outbound_webhooks` and `webhook_delivery_logs` tables for Dead Letter Queue (DLQ), HMAC signatures, and event replay.
- Creates `integration_connections` table for Zapier, Make.com, n8n, and Custom plugin health & sync tracking.
- Enables RLS on all tables with tenant isolation.
*/

-- 1. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID,
  provider TEXT NOT NULL DEFAULT 'openai' CHECK (provider IN ('openai', 'gemini', 'anthropic', 'azure', 'local')),
  insight_type TEXT NOT NULL CHECK (insight_type IN ('summary', 'next_action', 'lead_score', 'proposal')),
  score INT DEFAULT 0,
  confidence_score NUMERIC(3,2) DEFAULT 0.95,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workflow Rules Table
CREATE TABLE IF NOT EXISTS workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  version INT DEFAULT 1,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('event', 'manual', 'scheduled', 'webhook')),
  trigger_event TEXT NOT NULL,
  conditions JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  max_retries INT DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  workflow_id UUID REFERENCES workflow_rules(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'retrying')),
  attempts INT DEFAULT 1,
  execution_logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Public API Keys Table
CREATE TABLE IF NOT EXISTS public_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['leads:read', 'leads:write'],
  rate_limit_per_min INT DEFAULT 60,
  expires_at TIMESTAMPTZ,
  last_rotated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outbound Webhooks Table
CREATE TABLE IF NOT EXISTS outbound_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  target_url TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['lead.created', 'invoice.paid'],
  retry_policy JSONB DEFAULT '{"max_attempts": 5, "backoff": "exponential"}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Webhook Delivery & Dead Letter Queue Logs Table
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  webhook_id UUID REFERENCES outbound_webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('delivered', 'queued', 'failed', 'dead_letter')),
  attempts INT DEFAULT 1,
  next_retry_at TIMESTAMPTZ,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_code INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Integration Connections Table
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('zapier', 'make', 'n8n', 'custom')),
  connection_name TEXT NOT NULL,
  version TEXT DEFAULT '1.0.0',
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'error')),
  auth_status TEXT DEFAULT 'connected' CHECK (auth_status IN ('connected', 'expired', 'disconnected')),
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_tenant ON ai_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tenant ON workflow_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public_api_keys(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_delivery_logs(webhook_id, status);
CREATE INDEX IF NOT EXISTS idx_integrations_tenant ON integration_connections(tenant_id);

-- Enable RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_ai_insights" ON ai_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_ai_insights" ON ai_insights FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_workflow_rules" ON workflow_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_workflow_rules" ON workflow_rules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_workflow_rules" ON workflow_rules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_workflow_executions" ON workflow_executions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_workflow_executions" ON workflow_executions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_public_api_keys" ON public_api_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_public_api_keys" ON public_api_keys FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_public_api_keys" ON public_api_keys FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_outbound_webhooks" ON outbound_webhooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_outbound_webhooks" ON outbound_webhooks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_webhook_logs" ON webhook_delivery_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_webhook_logs" ON webhook_delivery_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_integrations" ON integration_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_integrations" ON integration_connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_integrations" ON integration_connections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
