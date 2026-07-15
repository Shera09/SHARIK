/*
# Advanced AI Platform - Part 24 Extensions

This migration adds additional tables for the Advanced AI Platform:
- Multi-Agent System with specialized agent types
- Conversation and Memory Engine
- Knowledge & RAG 2.0 System
- Document, Voice, and Vision AI
- AI Automation with Approval Workflows
- AI Search and Governance

New Tables:
- ai_agent_types: 27 specialized agent definitions
- ai_agent_permissions: Agent access control
- ai_agent_tasks: Task assignments to agents
- ai_agent_collaborations: Inter-agent coordination
- ai_conversation_sessions: Conversation tracking
- ai_conversation_messages: Individual messages
- ai_session_memory: Session-based memory
- ai_user_preferences: User AI preferences
- ai_knowledge_sources: Knowledge source management
- ai_knowledge_documents: Document storage
- ai_knowledge_chunks: Document chunks for RAG
- ai_rag_queries: RAG query logs
- ai_rag_citations: Source citations
- ai_document_jobs: Document processing jobs
- ai_document_entities: Extracted entities
- ai_voice_sessions: Voice interaction sessions
- ai_voice_transcriptions: Speech-to-text
- ai_voice_commands: Voice command processing
- ai_voice_notes: Voice notes storage
- ai_vision_jobs: Image processing jobs
- ai_vision_extractions: Extracted data from images
- ai_automation_executions: AI automation tracking
- ai_automation_approvals: Human approvals for AI actions
- ai_search_queries: Unified search
- ai_search_indexes: Search index metadata
- ai_search_suggestions: AI search suggestions
- ai_usage_metrics: Token usage and latency
- ai_feedback: User feedback on AI
- ai_hallucination_reports: Flagged hallucinations
- ai_safety_rules: Safety constraints
- ai_content_filters: Content moderation
- ai_rate_limits: Rate limiting config
- ai_audit_logs: Comprehensive audit trail
- ai_cost_tracking: AI cost tracking
*/

-- =====================================================
-- MULTI-AGENT SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_agent_types (
  agent_type_key text PRIMARY KEY,
  agent_name text NOT NULL,
  agent_category text NOT NULL CHECK (agent_category IN ('operations', 'finance', 'hr', 'sales', 'marketing', 'support', 'analytics', 'development', 'security', 'compliance', 'executive')),
  description text,
  system_prompt text,
  default_model_id text,
  capabilities jsonb DEFAULT '[]',
  allowed_tools jsonb DEFAULT '[]',
  escalation_threshold numeric(3, 2) DEFAULT 0.7,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO ai_agent_types (agent_type_key, agent_name, agent_category, description) VALUES
  ('ceo_ai', 'CEO AI', 'executive', 'Strategic decision support and business intelligence'),
  ('sales_ai', 'Sales AI', 'sales', 'Lead scoring, pipeline management, and sales optimization'),
  ('crm_ai', 'CRM AI', 'sales', 'Customer data management and relationship insights'),
  ('marketing_ai', 'Marketing AI', 'marketing', 'Campaign optimization and content strategy'),
  ('finance_ai', 'Finance AI', 'finance', 'Financial analysis and forecasting'),
  ('gst_ai', 'GST AI', 'finance', 'GST compliance and filing assistance'),
  ('invoice_ai', 'Invoice AI', 'finance', 'Invoice processing and validation'),
  ('accounting_ai', 'Accounting AI', 'finance', 'Bookkeeping and financial reporting'),
  ('hr_ai', 'HR AI', 'hr', 'Employee management and HR analytics'),
  ('recruitment_ai', 'Recruitment AI', 'hr', 'Candidate screening and hiring support'),
  ('payroll_ai', 'Payroll AI', 'hr', 'Payroll processing and compliance'),
  ('support_ai', 'Support AI', 'support', 'Customer support and ticket routing'),
  ('success_ai', 'Customer Success AI', 'support', 'Customer health scoring and retention'),
  ('knowledge_ai', 'Knowledge AI', 'operations', 'Knowledge management and search'),
  ('legal_ai', 'Legal Document AI', 'compliance', 'Contract analysis and legal compliance'),
  ('document_ai', 'Document AI', 'operations', 'Document processing and extraction'),
  ('ocr_ai', 'OCR AI', 'operations', 'Optical character recognition'),
  ('analytics_ai', 'Analytics AI', 'analytics', 'Data analysis and insights generation'),
  ('bi_ai', 'Business Intelligence AI', 'analytics', 'Executive dashboards and reporting'),
  ('workflow_ai', 'Workflow AI', 'operations', 'Workflow automation and orchestration'),
  ('automation_ai', 'Automation AI', 'operations', 'Task automation and scheduling'),
  ('meeting_ai', 'Meeting Assistant AI', 'operations', 'Meeting scheduling and note-taking'),
  ('project_ai', 'Project Manager AI', 'operations', 'Project tracking and resource allocation'),
  ('developer_ai', 'Developer Assistant AI', 'development', 'Code review and development support'),
  ('security_ai', 'Security AI', 'security', 'Threat detection and security monitoring'),
  ('compliance_ai', 'Compliance AI', 'compliance', 'Regulatory compliance and audit support'),
  ('mobile_ai', 'Mobile Assistant AI', 'operations', 'Mobile-optimized AI interactions')
ON CONFLICT (agent_type_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS ai_agent_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type_key text REFERENCES ai_agent_types(agent_type_key) ON DELETE CASCADE,
  resource_type text NOT NULL,
  action text NOT NULL CHECK (action IN ('read', 'write', 'delete', 'execute', 'approve')),
  conditions jsonb DEFAULT '{}',
  requires_approval boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  task_type text NOT NULL,
  task_input jsonb NOT NULL,
  task_output jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'escalated')),
  priority integer DEFAULT 5,
  result_confidence numeric(3, 2),
  escalated_to text,
  escalation_reason text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_agent_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  secondary_agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  collaboration_type text NOT NULL CHECK (collaboration_type IN ('delegate', 'consult', 'review', 'parallel')),
  task_id uuid REFERENCES ai_agent_tasks(id),
  context jsonb,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- CONVERSATION & MEMORY ENGINE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_conversation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  session_context jsonb DEFAULT '{}',
  language text DEFAULT 'en',
  status text DEFAULT 'active' CHECK (status IN ('active', 'ended', 'timeout')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  message_count integer DEFAULT 0,
  total_tokens integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ai_conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_conversation_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content text NOT NULL,
  tokens_used integer DEFAULT 0,
  model_id text,
  retrieval_sources jsonb DEFAULT '[]',
  feedback_score integer CHECK (feedback_score >= 1 AND feedback_score <= 5),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_session_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_conversation_sessions(id) ON DELETE CASCADE,
  memory_key text NOT NULL,
  memory_value jsonb NOT NULL,
  memory_type text NOT NULL CHECK (memory_type IN ('fact', 'preference', 'context', 'intent', 'entity')),
  importance_score numeric(3, 2) DEFAULT 0.5,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  preference_key text NOT NULL,
  preference_value jsonb NOT NULL,
  preference_source text DEFAULT 'explicit',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, preference_key)
);

-- =====================================================
-- KNOWLEDGE & RAG SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('upload', 'integration', 'database', 'api', 'webhook')),
  source_config jsonb DEFAULT '{}',
  sync_status text DEFAULT 'active',
  last_sync_at timestamptz,
  document_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES ai_knowledge_sources(id),
  document_type text NOT NULL CHECK (document_type IN ('pdf', 'word', 'excel', 'powerpoint', 'image', 'text', 'html', 'csv', 'email', 'whatsapp', 'invoice', 'contract', 'policy', 'manual', 'other')),
  original_filename text,
  file_size_bytes bigint,
  language text DEFAULT 'en',
  document_status text DEFAULT 'processing' CHECK (document_status IN ('processing', 'ready', 'failed', 'archived')),
  processing_progress integer DEFAULT 0,
  page_count integer,
  word_count integer,
  document_metadata jsonb DEFAULT '{}',
  freshness_score numeric(3, 2) DEFAULT 1.0,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES ai_knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  chunk_text text NOT NULL,
  chunk_type text DEFAULT 'paragraph',
  page_number integer,
  token_count integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS ai_rag_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  query_type text DEFAULT 'semantic' CHECK (query_type IN ('semantic', 'keyword', 'hybrid', 'filter')),
  retrieved_chunks jsonb DEFAULT '[]',
  retrieved_documents jsonb DEFAULT '[]',
  context_used text,
  generated_response text,
  confidence_score numeric(3, 2),
  model_id text,
  agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  latency_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_rag_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES ai_rag_queries(id) ON DELETE CASCADE,
  chunk_id uuid REFERENCES ai_knowledge_chunks(id),
  document_id uuid REFERENCES ai_knowledge_documents(id),
  citation_text text,
  relevance_score numeric(3, 2),
  source_page integer,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- DOCUMENT INTELLIGENCE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_document_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES ai_knowledge_documents(id),
  job_type text NOT NULL CHECK (job_type IN ('ocr', 'table_extraction', 'form_extraction', 'invoice_parsing', 'gst_extraction', 'contract_analysis', 'classification', 'entity_extraction', 'summarization', 'translation', 'comparison')),
  job_status text DEFAULT 'pending' CHECK (job_status IN ('pending', 'running', 'completed', 'failed')),
  processing_config jsonb DEFAULT '{}',
  result_data jsonb,
  confidence_score numeric(3, 2),
  error_message text,
  retry_count integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_document_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES ai_document_jobs(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('person', 'organization', 'location', 'date', 'amount', 'currency', 'percentage', 'email', 'phone', 'address', 'gst_number', 'pan_number', 'invoice_number', 'reference_number', 'other')),
  entity_value text NOT NULL,
  normalized_value text,
  confidence_score numeric(3, 2),
  context_text text,
  page_number integer,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- VOICE AI
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  session_type text NOT NULL CHECK (session_type IN ('command', 'dictation', 'meeting', 'conversation', 'search')),
  language text DEFAULT 'en',
  audio_format text DEFAULT 'wav',
  sample_rate integer DEFAULT 16000,
  duration_seconds integer,
  speaker_count integer DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active', 'processing', 'completed', 'failed')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_voice_transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_voice_sessions(id) ON DELETE CASCADE,
  transcript_text text NOT NULL,
  confidence_score numeric(3, 2),
  speaker_id text,
  start_time_ms integer,
  end_time_ms integer,
  segment_index integer,
  is_final boolean DEFAULT true,
  language_detected text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_voice_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_voice_sessions(id),
  command_text text NOT NULL,
  intent_detected text,
  entities jsonb DEFAULT '{}',
  action_executed text,
  action_result jsonb,
  success boolean DEFAULT false,
  requires_confirmation boolean DEFAULT false,
  confirmed boolean,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_voice_sessions(id),
  note_title text,
  note_content text NOT NULL,
  summary text,
  tags jsonb DEFAULT '[]',
  linked_entities jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- VISION AI
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_vision_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_source text NOT NULL,
  image_type text DEFAULT 'upload' CHECK (image_type IN ('upload', 'url', 'camera', 'document_scan')),
  job_type text NOT NULL CHECK (job_type IN ('ocr', 'document_ocr', 'business_card', 'qr_code', 'barcode', 'receipt', 'object_detection', 'scene', 'face_detection', 'table_extraction')),
  processing_config jsonb DEFAULT '{}',
  result_data jsonb,
  confidence_score numeric(3, 2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_vision_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES ai_vision_jobs(id) ON DELETE CASCADE,
  detection_type text NOT NULL,
  detection_label text,
  confidence_score numeric(3, 2),
  bounding_box jsonb,
  attributes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_vision_extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES ai_vision_jobs(id) ON DELETE CASCADE,
  extraction_type text NOT NULL CHECK (extraction_type IN ('text', 'business_card', 'qr_data', 'barcode_data', 'receipt_data', 'form_data')),
  extracted_data jsonb NOT NULL,
  confidence_score numeric(3, 2),
  field_count integer,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- AI AUTOMATION
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_automation_actions (
  action_key text PRIMARY KEY,
  action_name text NOT NULL,
  action_category text NOT NULL CHECK (action_category IN ('create', 'update', 'schedule', 'send', 'generate', 'assign', 'analyze', 'approve', 'delete')),
  target_resource text NOT NULL,
  description text,
  requires_approval boolean DEFAULT false,
  approval_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO ai_automation_actions (action_key, action_name, action_category, target_resource, requires_approval) VALUES
  ('create_task', 'Create Task', 'create', 'tasks', false),
  ('schedule_meeting', 'Schedule Meeting', 'schedule', 'calendar', false),
  ('generate_invoice', 'Generate Invoice', 'generate', 'invoices', true),
  ('draft_quotation', 'Draft Quotation', 'generate', 'quotations', false),
  ('assign_lead', 'Assign Lead', 'assign', 'leads', true),
  ('draft_email', 'Draft Email', 'generate', 'emails', false),
  ('send_whatsapp', 'Send WhatsApp', 'send', 'whatsapp', true),
  ('generate_report', 'Generate Report', 'generate', 'reports', false),
  ('analyze_dashboard', 'Analyze Dashboard', 'analyze', 'analytics', false),
  ('recommend_followup', 'Recommend Follow-up', 'analyze', 'crm', false)
ON CONFLICT (action_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS ai_automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key text REFERENCES ai_automation_actions(action_key),
  agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  trigger_source text NOT NULL,
  input_params jsonb,
  output_result jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'running', 'completed', 'failed', 'cancelled')),
  approved_by text,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  executed_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_automation_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid REFERENCES ai_automation_executions(id) ON DELETE CASCADE,
  approver_id text NOT NULL,
  approval_type text NOT NULL CHECK (approval_type IN ('approve', 'reject', 'modify')),
  approval_comment text,
  modified_params jsonb,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- AI SEARCH
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  query_type text DEFAULT 'natural' CHECK (query_type IN ('natural', 'keyword', 'semantic', 'voice', 'saved')),
  search_scope jsonb DEFAULT '{}',
  results jsonb,
  result_count integer DEFAULT 0,
  latency_ms integer,
  feedback_score integer,
  user_id text,
  session_id uuid REFERENCES ai_conversation_sessions(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_search_indexes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  index_name text NOT NULL UNIQUE,
  index_config jsonb DEFAULT '{}',
  last_indexed_at timestamptz,
  document_count integer DEFAULT 0,
  index_size_mb numeric(10, 2),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_search_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_text text NOT NULL,
  suggestion_type text DEFAULT 'query' CHECK (suggestion_type IN ('query', 'correction', 'refinement', 'related')),
  frequency integer DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- AI ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  model_id text,
  agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  total_requests integer DEFAULT 0,
  successful_requests integer DEFAULT 0,
  failed_requests integer DEFAULT 0,
  total_input_tokens bigint DEFAULT 0,
  total_output_tokens bigint DEFAULT 0,
  avg_latency_ms integer DEFAULT 0,
  p95_latency_ms integer,
  total_cost numeric(12, 4) DEFAULT 0,
  UNIQUE(metric_date, model_id, agent_type_key)
);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES ai_conversation_messages(id),
  feedback_type text NOT NULL CHECK (feedback_type IN ('rating', 'correction', 'report', 'helpful', 'not_helpful')),
  feedback_value integer,
  feedback_text text,
  user_id text,
  agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  resolved boolean DEFAULT false,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_hallucination_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES ai_conversation_messages(id),
  reported_by text,
  report_type text NOT NULL CHECK (report_type IN ('factual_error', 'fabrication', 'context_mismatch', 'citation_error', 'other')),
  description text,
  expected_output text,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  reviewed boolean DEFAULT false,
  reviewed_by text,
  resolution text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_cost_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_date date NOT NULL DEFAULT CURRENT_DATE,
  provider_name text,
  model_id text,
  agent_type_key text REFERENCES ai_agent_types(agent_type_key),
  request_count integer DEFAULT 0,
  input_tokens bigint DEFAULT 0,
  output_tokens bigint DEFAULT 0,
  total_cost numeric(12, 4) DEFAULT 0,
  budget_limit numeric(12, 2),
  budget_used_percent numeric(5, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tracking_date, model_id, agent_type_key)
);

-- =====================================================
-- AI GOVERNANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_safety_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('content_filter', 'pii_detection', 'output_validation', 'prompt_injection', 'rate_limit', 'cost_limit')),
  rule_config jsonb NOT NULL,
  action_on_violation text DEFAULT 'block' CHECK (action_on_violation IN ('block', 'warn', 'log', 'escalate')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_content_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filter_name text NOT NULL,
  filter_type text NOT NULL CHECK (filter_type IN ('keyword', 'regex', 'model', 'custom')),
  filter_config jsonb NOT NULL,
  apply_to text DEFAULT 'both' CHECK (apply_to IN ('input', 'output', 'both')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type text NOT NULL CHECK (scope_type IN ('user', 'agent', 'model', 'global')),
  scope_id text,
  requests_per_minute integer,
  requests_per_hour integer,
  requests_per_day integer,
  tokens_per_day bigint,
  cost_per_day numeric(12, 2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_audit_logs_ext (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  action_category text NOT NULL CHECK (action_category IN ('query', 'response', 'automation', 'memory', 'knowledge', 'document', 'voice', 'vision', 'governance')),
  actor_id text,
  actor_type text DEFAULT 'user' CHECK (actor_type IN ('user', 'agent', 'system')),
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}',
  model_id text,
  tokens_used integer,
  cost numeric(10, 6),
  latency_ms integer,
  success boolean DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE ai_agent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_session_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rag_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rag_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vision_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vision_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vision_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_automation_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_hallucination_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_safety_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit_logs_ext ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "public_read_ai_agent_types" ON ai_agent_types;
CREATE POLICY "public_read_ai_agent_types" ON ai_agent_types FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "public_read_ai_automation_actions" ON ai_automation_actions;
CREATE POLICY "public_read_ai_automation_actions" ON ai_automation_actions FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "public_read_ai_safety_rules" ON ai_safety_rules;
CREATE POLICY "public_read_ai_safety_rules" ON ai_safety_rules FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "auth_conversations_all" ON ai_conversation_sessions;
CREATE POLICY "auth_conversations_all" ON ai_conversation_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_messages_all" ON ai_conversation_messages;
CREATE POLICY "auth_messages_all" ON ai_conversation_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_knowledge_all" ON ai_knowledge_documents;
CREATE POLICY "auth_knowledge_all" ON ai_knowledge_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_chunks_all" ON ai_knowledge_chunks;
CREATE POLICY "auth_chunks_all" ON ai_knowledge_chunks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_rag_all" ON ai_rag_queries;
CREATE POLICY "auth_rag_all" ON ai_rag_queries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_agent_tasks_all" ON ai_agent_tasks;
CREATE POLICY "auth_agent_tasks_all" ON ai_agent_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_memory_all" ON ai_session_memory;
CREATE POLICY "auth_memory_all" ON ai_session_memory FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_voice_all" ON ai_voice_sessions;
CREATE POLICY "auth_voice_all" ON ai_voice_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_vision_all" ON ai_vision_jobs;
CREATE POLICY "auth_vision_all" ON ai_vision_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_automation_all" ON ai_automation_executions;
CREATE POLICY "auth_automation_all" ON ai_automation_executions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_search_all" ON ai_search_queries;
CREATE POLICY "auth_search_all" ON ai_search_queries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_feedback_all" ON ai_feedback;
CREATE POLICY "auth_feedback_all" ON ai_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_usage_read" ON ai_usage_metrics;
CREATE POLICY "auth_usage_read" ON ai_usage_metrics FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_cost_read" ON ai_cost_tracking;
CREATE POLICY "auth_cost_read" ON ai_cost_tracking FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_preferences_all" ON ai_user_preferences;
CREATE POLICY "auth_preferences_all" ON ai_user_preferences FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_document_jobs_all" ON ai_document_jobs;
CREATE POLICY "auth_document_jobs_all" ON ai_document_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_hallucination_all" ON ai_hallucination_reports;
CREATE POLICY "auth_hallucination_all" ON ai_hallucination_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_audit_read" ON ai_audit_logs_ext;
CREATE POLICY "auth_audit_read" ON ai_audit_logs_ext FOR SELECT TO authenticated USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ai_conversation_sessions_user ON ai_conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_session ON ai_conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_documents_status ON ai_knowledge_documents(document_status);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_chunks_document ON ai_knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_tasks_status ON ai_agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_rag_queries_created ON ai_rag_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_document_jobs_status ON ai_document_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_ai_voice_sessions_status ON ai_voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_vision_jobs_status ON ai_vision_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_automation_executions_status ON ai_automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_created ON ai_search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_metrics_date ON ai_usage_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_ai_cost_tracking_date ON ai_cost_tracking(tracking_date);
