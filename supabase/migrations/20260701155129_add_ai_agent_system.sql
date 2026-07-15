-- AI Agent System Tables

-- AI Agents Configuration
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL UNIQUE,
  description text,
  capabilities text[] DEFAULT '{}',
  permissions text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'maintenance')),
  config jsonb DEFAULT '{}',
  metrics jsonb DEFAULT '{}',
  last_activity timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agent Tasks Queue
CREATE TABLE IF NOT EXISTS ai_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  task_type text NOT NULL,
  priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  input_data jsonb DEFAULT '{}',
  output_data jsonb,
  error_message text,
  related_entity_type text,
  related_entity_id uuid,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Agent Memory (Layered Memory System)
CREATE TABLE IF NOT EXISTS ai_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES ai_agents(id) ON DELETE CASCADE,
  memory_type text NOT NULL CHECK (memory_type IN ('session', 'user', 'customer', 'business', 'knowledge', 'long_term')),
  entity_type text,
  entity_id uuid,
  content text NOT NULL,
  embedding_data jsonb,
  metadata jsonb DEFAULT '{}',
  importance_score numeric(3,2) DEFAULT 0.5,
  access_count integer DEFAULT 0,
  last_accessed timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Agent Communication Log
CREATE TABLE IF NOT EXISTS ai_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  to_agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  message_type text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Workflow Definitions
CREATE TABLE IF NOT EXISTS ai_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_event text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]',
  active boolean DEFAULT true,
  execution_count integer DEFAULT 0,
  last_executed timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workflow Executions
CREATE TABLE IF NOT EXISTS ai_workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES ai_workflows(id) ON DELETE SET NULL,
  trigger_entity_type text,
  trigger_entity_id uuid,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  current_step integer DEFAULT 0,
  steps_log jsonb DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  impact text,
  action_required text,
  related_entity_type text,
  related_entity_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'implemented', 'dismissed')),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Reports Generated
CREATE TABLE IF NOT EXISTS ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  report_type text NOT NULL,
  title text NOT NULL,
  content text,
  data jsonb DEFAULT '{}',
  period_start date,
  period_end date,
  sent_via text[] DEFAULT '{}',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "anon_all_ai_agents" ON ai_agents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_tasks" ON ai_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_memory" ON ai_memory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_communications" ON ai_communications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_workflows" ON ai_workflows FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_workflow_executions" ON ai_workflow_executions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_recommendations" ON ai_recommendations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_reports" ON ai_reports FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks (status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_agent ON ai_tasks (agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_scheduled ON ai_tasks (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ai_memory_agent ON ai_memory (agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_type ON ai_memory (memory_type);
CREATE INDEX IF NOT EXISTS idx_ai_communications_to ON ai_communications (to_agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations (status);

-- Triggers for updated_at
CREATE TRIGGER trg_ai_agents_updated BEFORE UPDATE ON ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ai_workflows_updated BEFORE UPDATE ON ai_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ai_recommendations_updated BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default AI agents
INSERT INTO ai_agents (name, role, description, capabilities, permissions, config) VALUES
('AI CEO', 'ceo', 'Chief Executive AI - monitors business health and provides strategic recommendations', ARRAY['strategic_planning', 'risk_detection', 'performance_monitoring', 'revenue_forecasting', 'executive_reporting'], ARRAY['read_all', 'write_recommendations', 'send_notifications'], '{"check_interval_minutes": 60, "report_schedule": "daily"}'),
('AI Sales Manager', 'sales_manager', 'Analyzes leads, scores opportunities, and optimizes sales pipeline', ARRAY['lead_scoring', 'conversion_prediction', 'followup_scheduling', 'quotation_drafting', 'cross_sell_recommendations'], ARRAY['read_leads', 'read_customers', 'write_recommendations', 'create_quotations'], '{"lead_score_threshold": 70}'),
('AI CRM Manager', 'crm_manager', 'Manages customer relationships and ensures timely engagement', ARRAY['customer_health_scoring', 'engagement_tracking', 'churn_prediction', 'retention_strategies'], ARRAY['read_customers', 'write_recommendations', 'schedule_followups'], '{}'),
('AI Accountant', 'accountant', 'Handles financial monitoring, invoice verification, and financial reporting', ARRAY['invoice_verification', 'gst_validation', 'cash_flow_prediction', 'financial_reporting', 'payment_reminders'], ARRAY['read_invoices', 'read_payments', 'read_expenses', 'write_recommendations'], '{}'),
('AI GST Consultant', 'gst_consultant', 'Provides GST compliance guidance and validates tax calculations', ARRAY['gstin_validation', 'hsn_suggestion', 'gst_calculation', 'compliance_check'], ARRAY['read_invoices', 'read_services', 'write_recommendations'], '{}'),
('AI Customer Support', 'support', 'Handles customer queries across all channels', ARRAY['faq_answers', 'status_tracking', 'document_collection', 'escalation'], ARRAY['read_customers', 'read_invoices', 'create_activities', 'send_messages'], '{}'),
('AI Marketing Manager', 'marketing', 'Generates marketing content and analyzes campaign performance', ARRAY['content_generation', 'post_scheduling', 'campaign_analysis', 'seo_optimization'], ARRAY['read_customers', 'read_leads', 'create_content', 'write_recommendations'], '{}'),
('AI HR Manager', 'hr', 'Manages employee relations and productivity analysis', ARRAY['performance_analysis', 'leave_management', 'payroll_verification', 'employee_engagement'], ARRAY['read_employees', 'read_tasks', 'write_recommendations'], '{}'),
('AI Operations Manager', 'operations', 'Optimizes business processes and resource allocation', ARRAY['task_optimization', 'resource_allocation', 'bottleneck_detection', 'workflow_automation'], ARRAY['read_tasks', 'read_employees', 'write_recommendations'], '{}'),
('AI WhatsApp Manager', 'whatsapp', 'Handles all WhatsApp communications autonomously', ARRAY['message_sending', 'template_management', 'conversation_tracking', 'lead_nurturing'], ARRAY['send_whatsapp', 'read_customers', 'read_leads'], '{}'),
('AI Email Manager', 'email', 'Manages email communications and campaigns', ARRAY['email_drafting', 'campaign_management', 'delivery_tracking'], ARRAY['send_email', 'read_customers', 'read_leads'], '{}'),
('AI Notification Manager', 'notifications', 'Orchestrates notifications across all channels', ARRAY['notification_routing', 'priority_management', 'digest_generation'], ARRAY['send_notifications', 'read_all'], '{}'),
('AI Document Verifier', 'document_verifier', 'Verifies and extracts data from uploaded documents', ARRAY['ocr_processing', 'data_extraction', 'document_validation', 'fraud_detection'], ARRAY['read_documents', 'write_extracted_data'], '{}')
ON CONFLICT (role) DO NOTHING;
