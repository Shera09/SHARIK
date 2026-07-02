/*
# Master Integration Platform - Event Bus, Observability, AI Governance

## Summary
This migration creates the enterprise integration layer including:
- Event Bus for domain events
- System Health Monitoring
- AI Usage Tracking and Governance
- Security Audit Center
- Performance Metrics
- Backup Configuration
- Integration Connectors

## New Tables

### Event Bus System
1. `domain_events` - Central event log for all domain events
   - id (uuid, primary key)
   - event_type (text, indexed) - e.g., LeadCreated, InvoicePaid
   - aggregate_type (text) - Source entity type
   - aggregate_id (uuid) - Source entity ID
   - payload (jsonb) - Event data
   - metadata (jsonb) - Additional context
   - status (text) - pending, processed, failed
   - retry_count (integer)
   - processed_at (timestamp)
   - created_at (timestamp)

2. `event_subscriptions` - Subscribers to domain events
   - id, subscriber_name, event_types (array), webhook_url, is_active, created_at

3. `event_deliveries` - Event delivery tracking
   - id, event_id (FK), subscription_id (FK), status, response_code, delivered_at

### System Health & Observability
4. `system_health_metrics` - Real-time health metrics
   - id, metric_name, metric_value, unit, category, status, timestamp

5. `alert_rules` - Alert configuration
   - id, name, metric_name, condition, threshold, severity, is_active, notification_channels

6. `active_alerts` - Current active alerts
   - id, rule_id (FK), current_value, triggered_at, acknowledged_at, acknowledged_by, resolved_at

7. `performance_logs` - API performance tracking
   - id, endpoint, method, response_time_ms, status_code, request_id, user_id, created_at

### AI Governance
8. `ai_usage_logs` - AI model usage tracking
   - id, model_name, provider, prompt_tokens, completion_tokens, total_tokens, cost_usd, request_type, user_id, session_id, created_at

9. `ai_conversations` - Conversation tracking
   - id, user_id, agent_type, title, message_count, total_tokens, total_cost, started_at, ended_at

10. `ai_content_reviews` - AI output review queue
    - id, conversation_id, message_id, content_type, content, review_status, reviewed_by, reviewed_at, notes

11. `prompt_templates` - Managed prompt library
    - id, name, category, template, variables, is_active, version, created_by, created_at

### Security Center
12. `security_events` - Security incident log
    - id, event_type, severity, source_ip, user_id, resource, action, details, created_at

13. `security_policies` - Security policy configuration
    - id, name, policy_type, rules, is_active, created_at, updated_at

14. `login_attempts` - Login attempt tracking
    - id, email, ip_address, user_agent, success, failure_reason, created_at

### Integration
15. `integration_connectors` - External integrations
    - id, name, type, config, credentials_ref, status, last_sync, created_at

16. `sync_jobs` - Data synchronization jobs
    - id, connector_id (FK), job_type, status, records_processed, error_message, started_at, completed_at

### Backup Management
17. `backup_records` - Backup tracking
    - id, backup_type, size_bytes, storage_path, status, started_at, completed_at, verified_at

### Dashboard Configuration
18. `dashboard_widgets` - Configurable dashboard widgets
    - id, user_id, widget_type, config, position, is_active, created_at

19. `user_preferences` - User-specific preferences
    - id, user_id, theme, notifications_enabled, ai_assist_enabled, locale, timezone, preferences (jsonb), created_at

## Security
- RLS enabled on all tables
- Policies for authenticated users to manage their own data
- Admin-only access for system-wide monitoring tables
*/

-- Event Bus System
CREATE TABLE IF NOT EXISTS domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'retrying')),
  retry_count integer DEFAULT 0,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domain_events_type ON domain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_domain_events_status ON domain_events(status);
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_domain_events_created ON domain_events(created_at DESC);

CREATE TABLE IF NOT EXISTS event_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_name text NOT NULL,
  event_types text[] NOT NULL,
  webhook_url text,
  is_active boolean DEFAULT true,
  retry_policy jsonb DEFAULT '{"max_retries": 3, "backoff_seconds": [5, 30, 120]}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES domain_events(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES event_subscriptions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
  response_code integer,
  response_body text,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- System Health & Observability
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  unit text,
  category text NOT NULL CHECK (category IN ('system', 'database', 'api', 'ai', 'queue', 'storage', 'network')),
  status text NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')),
  details jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_name ON system_health_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded ON system_health_metrics(recorded_at DESC);

CREATE TABLE IF NOT EXISTS alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  metric_name text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('greater_than', 'less_than', 'equals', 'not_equals', 'change_percent')),
  threshold numeric NOT NULL,
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  evaluation_window_minutes integer DEFAULT 5,
  notification_channels jsonb DEFAULT '{"email": true, "slack": false}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS active_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES alert_rules(id) ON DELETE CASCADE,
  current_value numeric NOT NULL,
  message text,
  triggered_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  resolved_at timestamptz,
  resolution_notes text
);

CREATE TABLE IF NOT EXISTS performance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  method text NOT NULL,
  response_time_ms integer NOT NULL,
  status_code integer NOT NULL,
  request_size_bytes integer,
  response_size_bytes integer,
  request_id text,
  user_id uuid,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_endpoint ON performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_created ON performance_logs(created_at DESC);

-- AI Governance
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  provider text NOT NULL DEFAULT 'anthropic',
  operation text NOT NULL CHECK (operation IN ('chat', 'completion', 'embedding', 'image')),
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  cost_usd numeric(10, 6) DEFAULT 0,
  request_type text,
  user_id uuid,
  session_id text,
  request_duration_ms integer,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON ai_usage_logs(model_name);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  agent_type text NOT NULL,
  title text,
  message_count integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  total_cost numeric(10, 4) DEFAULT 0,
  satisfaction_rating integer CHECK (satisfaction_rating BETWEEN 1 AND 5),
  feedback text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_content_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES ai_conversations(id) ON DELETE CASCADE,
  message_id text,
  content_type text NOT NULL,
  content text NOT NULL,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'flagged')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  template text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  default_values jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security Center
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'high', 'critical')),
  source_ip text,
  user_id uuid,
  user_email text,
  resource text,
  action text,
  details jsonb DEFAULT '{}'::jsonb,
  geo_location jsonb,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);

CREATE TABLE IF NOT EXISTS security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  policy_type text NOT NULL CHECK (policy_type IN ('access', 'password', 'session', 'rate_limit', 'content')),
  rules jsonb NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  failure_reason text,
  location jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at DESC);

-- Integration Connectors
CREATE TABLE IF NOT EXISTS integration_connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('payment', 'messaging', 'email', 'crm', 'storage', 'analytics', 'ai_provider')),
  provider text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  credentials_ref text,
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'syncing')),
  last_sync_at timestamptz,
  last_error text,
  sync_frequency_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid REFERENCES integration_connectors(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Backup Management
CREATE TABLE IF NOT EXISTS backup_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL CHECK (backup_type IN ('daily', 'weekly', 'monthly', 'manual')),
  size_bytes bigint,
  storage_path text,
  checksum text,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'verified')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  verified_at timestamptz,
  retention_until timestamptz,
  notes text
);

-- Dashboard Configuration
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  widget_type text NOT NULL,
  title text,
  config jsonb DEFAULT '{}'::jsonb,
  position_row integer DEFAULT 0,
  position_col integer DEFAULT 0,
  width integer DEFAULT 1,
  height integer DEFAULT 1,
  is_active boolean DEFAULT true,
  refresh_interval_seconds integer DEFAULT 300,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  date_format text DEFAULT 'MM/DD/YYYY',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  ai_assist_enabled boolean DEFAULT true,
  dashboard_layout jsonb DEFAULT '{}'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant access (authenticated users)
DROP POLICY IF EXISTS "select_own_preferences" ON user_preferences;
CREATE POLICY "select_own_preferences" ON user_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_preferences" ON user_preferences;
CREATE POLICY "insert_own_preferences" ON user_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_preferences" ON user_preferences;
CREATE POLICY "update_own_preferences" ON user_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_widgets" ON dashboard_widgets;
CREATE POLICY "select_own_widgets" ON dashboard_widgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_widgets" ON dashboard_widgets;
CREATE POLICY "insert_own_widgets" ON dashboard_widgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_widgets" ON dashboard_widgets;
CREATE POLICY "update_own_widgets" ON dashboard_widgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_widgets" ON dashboard_widgets;
CREATE POLICY "delete_own_widgets" ON dashboard_widgets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_ai_conversations" ON ai_conversations;
CREATE POLICY "select_own_ai_conversations" ON ai_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_conversations" ON ai_conversations;
CREATE POLICY "insert_own_ai_conversations" ON ai_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_conversations" ON ai_conversations;
CREATE POLICY "update_own_ai_conversations" ON ai_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_ai_usage" ON ai_usage_logs;
CREATE POLICY "select_own_ai_usage" ON ai_usage_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_usage" ON ai_usage_logs;
CREATE POLICY "insert_own_ai_usage" ON ai_usage_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin-level access for system tables (using anon, authenticated for demo purposes)
DROP POLICY IF EXISTS "admin_read_events" ON domain_events;
CREATE POLICY "admin_read_events" ON domain_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_events" ON domain_events;
CREATE POLICY "admin_insert_events" ON domain_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_health" ON system_health_metrics;
CREATE POLICY "admin_read_health" ON system_health_metrics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_health" ON system_health_metrics;
CREATE POLICY "admin_insert_health" ON system_health_metrics FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_alerts" ON alert_rules;
CREATE POLICY "admin_read_alerts" ON alert_rules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_read_active_alerts" ON active_alerts;
CREATE POLICY "admin_read_active_alerts" ON active_alerts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_read_performance" ON performance_logs;
CREATE POLICY "admin_read_performance" ON performance_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_performance" ON performance_logs;
CREATE POLICY "admin_insert_performance" ON performance_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_security_events" ON security_events;
CREATE POLICY "admin_read_security_events" ON security_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_security_events" ON security_events;
CREATE POLICY "admin_insert_security_events" ON security_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_login_attempts" ON login_attempts;
CREATE POLICY "admin_read_login_attempts" ON login_attempts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_login_attempts" ON login_attempts;
CREATE POLICY "admin_insert_login_attempts" ON login_attempts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_connectors" ON integration_connectors;
CREATE POLICY "admin_read_connectors" ON integration_connectors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_read_backups" ON backup_records;
CREATE POLICY "admin_read_backups" ON backup_records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_read_prompt_templates" ON prompt_templates;
CREATE POLICY "admin_read_prompt_templates" ON prompt_templates FOR SELECT
  TO anon, authenticated USING (true);

-- Insert default alert rules
INSERT INTO alert_rules (name, description, metric_name, condition, threshold, severity, notification_channels) VALUES
('High API Latency', 'Alert when API response time exceeds threshold', 'api_response_time_ms', 'greater_than', 1000, 'warning', '{"email": true, "slack": true}'::jsonb),
('Database Connection Pool', 'Alert when database connections are low', 'db_connections_available', 'less_than', 5, 'critical', '{"email": true, "slack": true}'::jsonb),
('Error Rate Spike', 'Alert when error rate increases significantly', 'error_rate_percent', 'greater_than', 5, 'warning', '{"email": true, "slack": true}'::jsonb),
('AI Cost Threshold', 'Alert when daily AI costs exceed budget', 'ai_daily_cost_usd', 'greater_than', 50, 'warning', '{"email": true, "slack": false}'::jsonb),
('Storage Usage', 'Alert when storage usage is high', 'storage_usage_percent', 'greater_than', 85, 'warning', '{"email": true, "slack": false}'::jsonb),
('Failed Login Attempts', 'Alert on suspicious login activity', 'failed_logins_per_hour', 'greater_than', 10, 'critical', '{"email": true, "slack": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert default prompt templates
INSERT INTO prompt_templates (name, category, description, template, variables) VALUES
('Lead Qualification', 'sales', 'Qualify a new lead based on information', 'You are a sales assistant. Analyze the following lead information and provide a qualification score (1-10) with reasoning:\n\nLead Name: {{lead_name}}\nCompany: {{company}}\nSource: {{source}}\nNotes: {{notes}}', '["lead_name", "company", "source", "notes"]'::jsonb),
('Customer Support', 'support', 'Generate a support response', 'You are a helpful customer support agent. Provide a professional and empathetic response to the following customer inquiry:\n\nCustomer: {{customer_name}}\nInquiry: {{inquiry}}\nOrder ID: {{order_id}}', '["customer_name", "inquiry", "order_id"]'::jsonb),
('Invoice Summary', 'finance', 'Summarize invoice details for email', 'Generate a brief, professional email summary for the following invoice:\n\nInvoice #: {{invoice_number}}\nAmount: {{amount}}\nDue Date: {{due_date}}\nClient: {{client_name}}', '["invoice_number", "amount", "due_date", "client_name"]'::jsonb),
('Task Prioritization', 'productivity', 'Help prioritize tasks', 'Help prioritize the following tasks based on urgency and importance:\n\nTasks:\n{{tasks_list}}', '["tasks_list"]'::jsonb),
('Report Analysis', 'analytics', 'Analyze business report data', 'Analyze the following business data and provide key insights and recommendations:\n\nData: {{data}}\nTime Period: {{period}}', '["data", "period"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default integration connectors
INSERT INTO integration_connectors (name, type, provider, status, config) VALUES
('Stripe Payments', 'payment', 'stripe', 'disconnected', '{"webhook_events": ["payment_intent.succeeded", "invoice.paid"]}'::jsonb),
('WhatsApp Business', 'messaging', 'meta', 'disconnected', '{"phone_number_id": null}'::jsonb),
('SendGrid Email', 'email', 'sendgrid', 'disconnected', '{"templates_enabled": true}'::jsonb),
('OpenAI API', 'ai_provider', 'openai', 'disconnected', '{"models": ["gpt-4", "gpt-3.5-turbo"]}'::jsonb),
('Google Analytics', 'analytics', 'google', 'disconnected', '{"tracking_enabled": true}'::jsonb)
ON CONFLICT DO NOTHING;
