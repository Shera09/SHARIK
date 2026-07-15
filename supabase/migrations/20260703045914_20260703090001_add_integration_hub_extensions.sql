-- =====================================================
-- ENTERPRISE INTEGRATION HUB - Part 21 (Additional Tables)
-- =====================================================

-- =============================================
-- MISSING TABLES FOR INTEGRATION HUB
-- =============================================

-- Event Types Registry
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Log
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  correlation_id UUID,
  event_name VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  user_id UUID,
  entity_type VARCHAR(50),
  entity_id UUID,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incoming Webhooks
CREATE TABLE IF NOT EXISTS incoming_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  source VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  external_id VARCHAR(255),
  raw_payload JSONB NOT NULL,
  parsed_data JSONB,
  verified BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- API Request Logs
CREATE TABLE IF NOT EXISTS api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  api_key_id UUID,
  endpoint_path VARCHAR(500),
  correlation_id UUID,
  request_id UUID DEFAULT gen_random_uuid(),
  method VARCHAR(10) NOT NULL,
  path VARCHAR(1000) NOT NULL,
  request_headers JSONB,
  response_status INTEGER,
  latency_ms INTEGER,
  client_ip VARCHAR(45),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage Daily
CREATE TABLE IF NOT EXISTS api_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  api_key_id UUID,
  date DATE NOT NULL,
  total_requests BIGINT DEFAULT 0,
  successful_requests BIGINT DEFAULT 0,
  failed_requests BIGINT DEFAULT 0,
  avg_latency_ms INTEGER,
  rate_limit_hits BIGINT DEFAULT 0,
  UNIQUE(tenant_id, api_key_id, date)
);

-- AI Provider Credentials
CREATE TABLE IF NOT EXISTS ai_provider_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  provider_id UUID,
  encrypted_credential TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  daily_budget DECIMAL(10,2),
  monthly_budget DECIMAL(10,2),
  current_daily_usage DECIMAL(10,2) DEFAULT 0,
  current_monthly_usage DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider_id)
);

-- AI Model Routing Rules
CREATE TABLE IF NOT EXISTS ai_model_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name VARCHAR(200) NOT NULL,
  use_case VARCHAR(50) NOT NULL,
  primary_provider_id UUID,
  primary_model VARCHAR(100),
  fallback_provider_ids UUID[] DEFAULT ARRAY[]::UUID[],
  selection_strategy VARCHAR(20) DEFAULT 'priority',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Cost Daily
CREATE TABLE IF NOT EXISTS ai_costs_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  provider_id UUID,
  date DATE NOT NULL,
  total_requests BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  avg_latency_ms INTEGER,
  UNIQUE(tenant_id, provider_id, date)
);

-- Connector Types Registry
CREATE TABLE IF NOT EXISTS connector_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  display_name VARCHAR(200),
  description TEXT,
  icon VARCHAR(100),
  auth_type VARCHAR(20) NOT NULL,
  config_schema JSONB,
  capabilities TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Connector Instances
CREATE TABLE IF NOT EXISTS connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  connector_type_id UUID,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  encrypted_credentials TEXT,
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  health_status VARCHAR(20) DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connector Sync Jobs
CREATE TABLE IF NOT EXISTS connector_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed BIGINT DEFAULT 0,
  records_created BIGINT DEFAULT 0,
  records_updated BIGINT DEFAULT 0,
  records_failed BIGINT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_type_id UUID,
  name VARCHAR(200) NOT NULL,
  tagline VARCHAR(500),
  description TEXT,
  icon_url TEXT,
  category VARCHAR(50) NOT NULL,
  pricing_type VARCHAR(20) DEFAULT 'free',
  price DECIMAL(10,2),
  developer_name VARCHAR(200),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Developer Apps
CREATE TABLE IF NOT EXISTS developer_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  redirect_uris TEXT[],
  webhook_url TEXT,
  sandbox_mode BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration Health
CREATE TABLE IF NOT EXISTS integration_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  integration_type VARCHAR(50) NOT NULL,
  integration_id UUID,
  integration_name VARCHAR(200),
  status VARCHAR(20) NOT NULL,
  uptime_percentage DECIMAL(5,2),
  avg_response_time_ms INTEGER,
  error_rate DECIMAL(5,4),
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, integration_type, integration_id)
);

-- Integration Alerts
CREATE TABLE IF NOT EXISTS integration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  integration_type VARCHAR(50),
  integration_id UUID,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  metadata JSONB,
  acknowledged BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secrets Vault
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  key VARCHAR(200) NOT NULL,
  encrypted_value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  rotation_days INTEGER,
  last_rotated_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- Insert Event Types
INSERT INTO event_types (name, category, description, is_active)
SELECT 'lead.created', 'sales', 'New lead created in the system', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'lead.created');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'lead.updated', 'sales', 'Lead information updated', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'lead.updated');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'lead.converted', 'sales', 'Lead converted to customer', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'lead.converted');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'customer.created', 'sales', 'New customer created', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'customer.created');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'invoice.generated', 'finance', 'Invoice generated', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'invoice.generated');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'invoice.paid', 'finance', 'Invoice payment received', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'invoice.paid');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'payment.received', 'finance', 'Payment received', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'payment.received');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'payment.failed', 'finance', 'Payment processing failed', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'payment.failed');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'employee.joined', 'hr', 'New employee joined', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'employee.joined');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'task.created', 'operations', 'New task created', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'task.created');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'task.completed', 'operations', 'Task marked as completed', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'task.completed');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'workflow.started', 'automation', 'Workflow execution started', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'workflow.started');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'workflow.completed', 'automation', 'Workflow execution completed', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'workflow.completed');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'ai.response.generated', 'ai', 'AI response generated', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'ai.response.generated');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'whatsapp.message.received', 'communication', 'WhatsApp message received', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'whatsapp.message.received');

INSERT INTO event_types (name, category, description, is_active)
SELECT 'email.delivered', 'communication', 'Email delivered successfully', true
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'email.delivered');

-- Insert Connector Types
INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'whatsapp_business', 'communication', 'WhatsApp Business', 'WhatsApp Business Platform', 'oauth', ARRAY['send_messages', 'receive_messages', 'templates', 'media'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'whatsapp_business');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'twilio', 'communication', 'Twilio', 'SMS, Voice, and Video platform', 'api_key', ARRAY['sms', 'voice', 'video', 'whatsapp'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'twilio');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'sendgrid', 'communication', 'SendGrid', 'Email delivery platform', 'api_key', ARRAY['send_email', 'templates', 'webhooks', 'analytics'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'sendgrid');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'razorpay', 'payment', 'Razorpay', 'Indian payment gateway', 'api_key', ARRAY['payments', 'refunds', 'subscriptions', 'webhooks'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'razorpay');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'stripe', 'payment', 'Stripe', 'Global payment processing', 'api_key', ARRAY['payments', 'refunds', 'subscriptions', 'webhooks'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'stripe');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'google_drive', 'document', 'Google Drive', 'Cloud storage and documents', 'oauth', ARRAY['read', 'write', 'share', 'sync'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'google_drive');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'google_workspace', 'identity', 'Google Workspace', 'Google suite authentication', 'oauth', ARRAY['sso', 'directory', 'provisioning'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'google_workspace');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'tally', 'accounting', 'Tally', 'Indian accounting software', 'api_key', ARRAY['sync', 'reports', 'gst'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'tally');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'zoho_books', 'accounting', 'Zoho Books', 'Zoho accounting platform', 'oauth', ARRAY['sync', 'invoices', 'inventory', 'gst'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'zoho_books');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'google_calendar', 'productivity', 'Google Calendar', 'Google Calendar integration', 'oauth', ARRAY['events', 'availability', 'reminders'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'google_calendar');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'slack', 'productivity', 'Slack', 'Team communication platform', 'oauth', ARRAY['messages', 'channels', 'webhooks'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'slack');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'zoom', 'productivity', 'Zoom', 'Video conferencing', 'oauth', ARRAY['meetings', 'webinars', 'recordings'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'zoom');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'mailchimp', 'marketing', 'Mailchimp', 'Email marketing', 'api_key', ARRAY['campaigns', 'lists', 'automations'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'mailchimp');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'facebook_ads', 'marketing', 'Facebook Ads', 'Meta advertising', 'oauth', ARRAY['campaigns', 'analytics', 'audiences'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'facebook_ads');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'google_ads', 'marketing', 'Google Ads', 'Google advertising', 'oauth', ARRAY['campaigns', 'analytics', 'keywords'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'google_ads');

INSERT INTO connector_types (name, category, display_name, description, auth_type, capabilities, is_active, is_popular)
SELECT 'pinecone', 'search', 'Pinecone', 'Vector database for AI', 'api_key', ARRAY['vectors', 'embeddings', 'search'], true, true
WHERE NOT EXISTS (SELECT 1 FROM connector_types WHERE name = 'pinecone');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_tenant ON api_request_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incoming_webhooks_source ON incoming_webhooks(source, event_type, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_connectors_tenant ON connectors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_connectors_type ON connectors(connector_type_id);
CREATE INDEX IF NOT EXISTS idx_integration_health_tenant ON integration_health(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integration_alerts_tenant ON integration_alerts(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_secrets_tenant ON secrets(tenant_id);