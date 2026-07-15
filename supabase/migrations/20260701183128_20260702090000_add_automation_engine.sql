-- Automation Engine Schema
-- Visual workflow builder, triggers, actions, and execution engine

-- Trigger Types
CREATE TYPE trigger_type AS ENUM (
  'manual', 'webhook', 'cron', 'lead_created', 'lead_updated', 'lead_converted',
  'customer_created', 'invoice_created', 'invoice_paid', 'invoice_overdue',
  'payment_received', 'payment_failed', 'quotation_created', 'quotation_accepted',
  'task_created', 'task_completed', 'employee_created', 'calendar_event',
  'service_expiry', 'subscription_renewal', 'whatsapp_received', 'email_received',
  'form_submitted', 'birthday', 'anniversary', 'review_received', 'complaint_created',
  'high_value_lead', 'low_revenue_alert', 'customer_inactive', 'database_change'
);

-- Action Types
CREATE TYPE action_type AS ENUM (
  'send_whatsapp', 'send_email', 'create_lead', 'update_lead', 'create_customer',
  'generate_invoice', 'generate_quotation', 'create_task', 'assign_employee',
  'notify_admin', 'notify_user', 'create_calendar_event', 'update_crm',
  'generate_payment_link', 'generate_receipt', 'export_pdf', 'export_excel',
  'generate_report', 'webhook_call', 'api_call', 'slack_notify', 'telegram_notify',
  'google_sheets_update', 'google_drive_upload', 'ai_generate_summary',
  'ai_generate_reply', 'ocr_scan', 'delay', 'condition', 'loop', 'variable_set'
);

-- Condition Operators
CREATE TYPE condition_operator AS ENUM (
  'equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with',
  'greater_than', 'less_than', 'greater_equal', 'less_equal', 'is_empty',
  'is_not_empty', 'regex_match', 'in_list', 'not_in_list', 'between', 'and', 'or', 'not'
);

-- Workflow Status
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'archived', 'error');

-- Execution Status
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled', 'retrying');

-- Workflows Table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status workflow_status DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  trigger_type trigger_type NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  template_category TEXT,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_execution_at TIMESTAMPTZ,
  last_error TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Workflow Versions
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  trigger_config JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  UNIQUE(workflow_id, version)
);

-- Workflow Executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  workflow_version INTEGER NOT NULL,
  status execution_status DEFAULT 'pending',
  trigger_type trigger_type NOT NULL,
  trigger_data JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}'::jsonb,
  variables JSONB DEFAULT '{}'::jsonb,
  current_node_id TEXT,
  executed_nodes TEXT[] DEFAULT '{}',
  node_results JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  error_node_id TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Execution Logs
CREATE TABLE workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  action action_type,
  status execution_status NOT NULL,
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_execution_logs_execution ON workflow_execution_logs(execution_id);

-- Webhook Triggers
CREATE TABLE workflow_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  webhook_key TEXT NOT NULL UNIQUE,
  secret TEXT,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Triggers
CREATE TABLE workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  variables TEXT[] DEFAULT '{}',
  is_html BOOLEAN DEFAULT TRUE,
  preview_text TEXT,
  from_name TEXT,
  from_email TEXT,
  reply_to TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  campaign_type TEXT DEFAULT 'promotional',
  status TEXT DEFAULT 'draft',
  recipients JSONB DEFAULT '[]'::jsonb,
  segment_filters JSONB DEFAULT '{}'::jsonb,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Sends
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  message_id TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  clicked_url TEXT,
  bounced_at TIMESTAMPTZ,
  bounce_reason TEXT,
  unsubscribed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);

-- WhatsApp Campaigns
CREATE TABLE whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  template_id UUID,
  campaign_type TEXT DEFAULT 'promotional',
  status TEXT DEFAULT 'draft',
  recipients JSONB DEFAULT '[]'::jsonb,
  segment_filters JSONB DEFAULT '{}'::jsonb,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Campaign Sends
CREATE TABLE whatsapp_campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES whatsapp_campaigns(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  message_id TEXT,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wa_campaign_sends ON whatsapp_campaign_sends(campaign_id);

-- Automation Analytics
CREATE TABLE automation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  total_duration_ms BIGINT DEFAULT 0,
  avg_duration_ms INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  whatsapp_sent INTEGER DEFAULT 0,
  whatsapp_delivered INTEGER DEFAULT 0,
  whatsapp_read INTEGER DEFAULT 0,
  leads_created INTEGER DEFAULT 0,
  invoices_generated INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, workflow_id)
);

-- Smart Business Rules
CREATE TABLE business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  condition JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_events TEXT[] DEFAULT '{}',
  execution_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Workflow Suggestions
CREATE TABLE workflow_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  trigger_type trigger_type,
  suggested_workflow JSONB NOT NULL,
  reasoning TEXT,
  confidence_score NUMERIC DEFAULT 0,
  is_applied BOOLEAN DEFAULT FALSE,
  applied_workflow_id UUID REFERENCES workflows(id),
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "allow_all_workflows" ON workflows FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_workflow_versions" ON workflow_versions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_workflow_executions" ON workflow_executions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_workflow_execution_logs" ON workflow_execution_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_workflow_webhooks" ON workflow_webhooks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_workflow_schedules" ON workflow_schedules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_email_templates" ON email_templates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_email_campaigns" ON email_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_email_sends" ON email_sends FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_whatsapp_campaigns" ON whatsapp_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_whatsapp_campaign_sends" ON whatsapp_campaign_sends FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_automation_analytics" ON automation_analytics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_business_rules" ON business_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_workflow_suggestions" ON workflow_suggestions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Updated at triggers
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_campaigns_updated_at BEFORE UPDATE ON whatsapp_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_rules_updated_at BEFORE UPDATE ON business_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_executions_updated_at BEFORE UPDATE ON workflow_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();