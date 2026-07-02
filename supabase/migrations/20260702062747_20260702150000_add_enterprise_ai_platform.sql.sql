-- =====================================================
-- WEBHOSTER AI BUSINESS OS - PART 12: Enterprise AI Platform
-- Multi-Model AI | RAG | AI Memory | Intelligent Model Router
-- =====================================================

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- AI PROVIDERS & MODELS
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  provider_type TEXT NOT NULL DEFAULT 'external',
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  rate_limit_rpm INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES ai_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model_id TEXT NOT NULL,
  model_type TEXT NOT NULL DEFAULT 'chat',
  context_window INTEGER DEFAULT 4096,
  max_output_tokens INTEGER DEFAULT 2048,
  input_cost_per_1k DECIMAL(10, 6) DEFAULT 0,
  output_cost_per_1k DECIMAL(10, 6) DEFAULT 0,
  supports_vision BOOLEAN DEFAULT false,
  supports_functions BOOLEAN DEFAULT true,
  supports_json_mode BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  capabilities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  priority INTEGER DEFAULT 100,
  task_type TEXT NOT NULL,
  preferred_model_id UUID REFERENCES ai_models(id),
  fallback_model_id UUID REFERENCES ai_models(id),
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROMPT MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS prompt_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES prompt_categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  default_values JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  owner_id UUID,
  approval_status TEXT DEFAULT 'approved',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  avg_tokens INTEGER,
  avg_rating DECIMAL(3, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  change_summary TEXT,
  changed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, version)
);

CREATE TABLE IF NOT EXISTS prompt_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id),
  model_id UUID REFERENCES ai_models(id),
  variables_used JSONB,
  tokens_input INTEGER,
  tokens_output INTEGER,
  latency_ms INTEGER,
  user_rating INTEGER,
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RAG KNOWLEDGE SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending',
  document_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes BIGINT,
  storage_path TEXT,
  content_text TEXT,
  metadata JSONB DEFAULT '{}',
  document_type TEXT,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'pending',
  extracted_at TIMESTAMPTZ,
  chunked_at TIMESTAMPTZ,
  embedded_at TIMESTAMPTZ,
  chunk_count INTEGER DEFAULT 0,
  confidence_score DECIMAL(5, 4),
  duplicate_of UUID REFERENCES knowledge_documents(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_type TEXT DEFAULT 'text',
  page_number INTEGER,
  start_char INTEGER,
  end_char INTEGER,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  embedding_model TEXT,
  token_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retrieval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_embedding vector(1536),
  retrieved_chunk_ids UUID[],
  retrieved_document_ids UUID[],
  similarity_scores DECIMAL[],
  context_used TEXT,
  model_id UUID REFERENCES ai_models(id),
  response_text TEXT,
  latency_ms INTEGER,
  result_count INTEGER,
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEMORY ARCHITECTURE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_memory_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  layer_type TEXT NOT NULL,
  description TEXT,
  retention_days INTEGER DEFAULT 90,
  max_entries INTEGER DEFAULT 10000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  embedding vector(1536),
  importance_score DECIMAL(3, 2) DEFAULT 0.5,
  access_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  memory_type TEXT DEFAULT 'preference',
  embedding vector(1536),
  importance_score DECIMAL(3, 2) DEFAULT 0.5,
  source_conversation_id UUID,
  is_confirmed BOOLEAN DEFAULT false,
  access_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

CREATE TABLE IF NOT EXISTS customer_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  tenant_id UUID,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  memory_type TEXT DEFAULT 'insight',
  embedding vector(1536),
  importance_score DECIMAL(3, 2) DEFAULT 0.5,
  source_type TEXT,
  source_id UUID,
  is_verified BOOLEAN DEFAULT false,
  access_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  memory_type TEXT DEFAULT 'policy',
  embedding vector(1536),
  importance_score DECIMAL(3, 2) DEFAULT 0.5,
  created_by UUID,
  access_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  user_id UUID,
  summary TEXT NOT NULL,
  summary_embedding vector(1536),
  topics TEXT[] DEFAULT '{}',
  entities JSONB DEFAULT '{}',
  sentiment_score DECIMAL(3, 2),
  message_count INTEGER,
  token_count INTEGER,
  model_id UUID REFERENCES ai_models(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS long_term_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  embedding vector(1536),
  consolidation_count INTEGER DEFAULT 1,
  last_consolidated_at TIMESTAMPTZ DEFAULT NOW(),
  importance_score DECIMAL(3, 2) DEFAULT 0.5,
  decay_factor DECIMAL(4, 3) DEFAULT 1.0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VECTOR SEARCH INDEX
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_session_memories_embedding ON session_memories
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX IF NOT EXISTS idx_user_memories_embedding ON user_memories
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- =====================================================
-- AI GUARDRAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_guardrails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  guardrail_type TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '[]',
  severity TEXT DEFAULT 'medium',
  action TEXT DEFAULT 'block',
  is_active BOOLEAN DEFAULT true,
  violations_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guardrail_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardrail_id UUID REFERENCES ai_guardrails(id),
  conversation_id TEXT,
  user_id UUID,
  input_text TEXT,
  violation_type TEXT NOT NULL,
  matched_pattern TEXT,
  severity TEXT,
  action_taken TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensitive_data_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_regex TEXT NOT NULL,
  category TEXT,
  action TEXT DEFAULT 'mask',
  replacement TEXT DEFAULT '[REDACTED]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT INTELLIGENCE
-- =====================================================

CREATE TABLE IF NOT EXISTS document_intelligence_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id),
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  config JSONB DEFAULT '{}',
  result JSONB,
  confidence_score DECIMAL(5, 4),
  error_message TEXT,
  processing_time_ms INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS extracted_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES document_intelligence_jobs(id) ON DELETE CASCADE,
  document_id UUID REFERENCES knowledge_documents(id),
  entity_type TEXT NOT NULL,
  entity_value TEXT NOT NULL,
  confidence_score DECIMAL(5, 4),
  page_number INTEGER,
  bounding_box JSONB,
  metadata JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id),
  classification_type TEXT NOT NULL,
  predicted_class TEXT NOT NULL,
  confidence_score DECIMAL(5, 4),
  model_used TEXT,
  is_corrected BOOLEAN DEFAULT false,
  corrected_class TEXT,
  corrected_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI EVALUATION
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_evaluation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL UNIQUE,
  metric_type TEXT NOT NULL,
  description TEXT,
  calculation_method TEXT,
  target_value DECIMAL(10, 4),
  unit TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_evaluation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  response_id TEXT,
  model_id UUID REFERENCES ai_models(id),
  prompt_id UUID REFERENCES prompts(id),
  metric_id UUID REFERENCES ai_evaluation_metrics(id),
  metric_value DECIMAL(10, 4),
  ground_truth TEXT,
  predicted_value TEXT,
  evaluation_method TEXT DEFAULT 'automatic',
  evaluator_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_feedback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  message_id TEXT,
  user_id UUID,
  feedback_type TEXT NOT NULL,
  rating INTEGER,
  comment TEXT,
  suggested_response TEXT,
  is_helpful BOOLEAN,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI COST MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  budget_type TEXT NOT NULL DEFAULT 'monthly',
  amount DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  alert_threshold_pct INTEGER DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_cost_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID,
  model_id UUID REFERENCES ai_models(id),
  conversation_id TEXT,
  request_type TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  input_cost DECIMAL(10, 6) DEFAULT 0,
  output_cost DECIMAL(10, 6) DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  latency_ms INTEGER,
  provider TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  period_type TEXT NOT NULL,
  period_date DATE NOT NULL,
  model_id UUID REFERENCES ai_models(id),
  request_count INTEGER DEFAULT 0,
  input_tokens BIGINT DEFAULT 0,
  output_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  total_cost DECIMAL(12, 4) DEFAULT 0,
  avg_latency_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, period_type, period_date, model_id)
);

-- =====================================================
-- AI OBSERVABILITY
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_observability_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15, 4),
  metric_unit TEXT,
  dimensions JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_model_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ai_models(id),
  provider_id UUID REFERENCES ai_providers(id),
  is_healthy BOOLEAN DEFAULT true,
  latency_p50 INTEGER,
  latency_p95 INTEGER,
  latency_p99 INTEGER,
  error_rate DECIMAL(5, 4) DEFAULT 0,
  availability_pct DECIMAL(5, 2) DEFAULT 100,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_orchestration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE,
  tenant_id UUID,
  user_id UUID,
  conversation_id TEXT,
  pipeline_stage TEXT NOT NULL,
  stage_status TEXT NOT NULL,
  model_id UUID REFERENCES ai_models(id),
  prompt_id UUID REFERENCES prompts(id),
  input_tokens INTEGER,
  output_tokens INTEGER,
  context_sources JSONB DEFAULT '[]',
  knowledge_used UUID[],
  memory_keys TEXT[],
  guardrail_flags TEXT[],
  latency_ms INTEGER,
  cost DECIMAL(10, 6),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HUMAN-IN-THE-LOOP
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL,
  approver_roles TEXT[] NOT NULL,
  escalation_minutes INTEGER DEFAULT 60,
  auto_approve_after_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES ai_approval_workflows(id),
  conversation_id TEXT,
  request_type TEXT NOT NULL,
  draft_content TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  impact_level TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  requested_by UUID,
  assigned_to UUID,
  reviewed_by UUID,
  review_notes TEXT,
  final_content TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrieval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE long_term_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_guardrails ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardrail_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensitive_data_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_intelligence_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_observability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_orchestration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_approval_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PUBLIC READ FOR CONFIG TABLES
-- =====================================================

CREATE POLICY "read_ai_providers" ON ai_providers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_ai_models" ON ai_models FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_model_routing_rules" ON model_routing_rules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_prompt_categories" ON prompt_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_ai_memory_layers" ON ai_memory_layers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_ai_guardrails" ON ai_guardrails FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_sensitive_data_patterns" ON sensitive_data_patterns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_ai_evaluation_metrics" ON ai_evaluation_metrics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read_ai_approval_workflows" ON ai_approval_workflows FOR SELECT TO anon, authenticated USING (true);

-- =====================================================
-- RLS POLICIES - TENANT-ISOLATED TABLES
-- =====================================================

CREATE POLICY "read_prompts" ON prompts FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_prompts" ON prompts FOR ALL TO authenticated USING (true);

CREATE POLICY "read_prompt_versions" ON prompt_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_prompt_versions" ON prompt_versions FOR ALL TO authenticated USING (true);

CREATE POLICY "read_knowledge_sources" ON knowledge_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_knowledge_sources" ON knowledge_sources FOR ALL TO authenticated USING (true);

CREATE POLICY "read_knowledge_documents" ON knowledge_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_knowledge_documents" ON knowledge_documents FOR ALL TO authenticated USING (true);

CREATE POLICY "read_knowledge_chunks" ON knowledge_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_knowledge_chunks" ON knowledge_chunks FOR ALL TO authenticated USING (true);

CREATE POLICY "read_retrieval_logs" ON retrieval_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_retrieval_logs" ON retrieval_logs FOR ALL TO authenticated USING (true);

CREATE POLICY "read_session_memories" ON session_memories FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_session_memories" ON session_memories FOR ALL TO authenticated USING (true);

CREATE POLICY "read_user_memories" ON user_memories FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_user_memories" ON user_memories FOR ALL TO authenticated USING (true);

CREATE POLICY "read_customer_memories" ON customer_memories FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_customer_memories" ON customer_memories FOR ALL TO authenticated USING (true);

CREATE POLICY "read_organization_memories" ON organization_memories FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_organization_memories" ON organization_memories FOR ALL TO authenticated USING (true);

CREATE POLICY "read_conversation_summaries" ON conversation_summaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_conversation_summaries" ON conversation_summaries FOR ALL TO authenticated USING (true);

CREATE POLICY "read_long_term_memories" ON long_term_memories FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_long_term_memories" ON long_term_memories FOR ALL TO authenticated USING (true);

CREATE POLICY "read_guardrail_violations" ON guardrail_violations FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_guardrail_violations" ON guardrail_violations FOR ALL TO authenticated USING (true);

CREATE POLICY "read_document_intelligence_jobs" ON document_intelligence_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_document_intelligence_jobs" ON document_intelligence_jobs FOR ALL TO authenticated USING (true);

CREATE POLICY "read_extracted_entities" ON extracted_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_extracted_entities" ON extracted_entities FOR ALL TO authenticated USING (true);

CREATE POLICY "read_document_classifications" ON document_classifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_document_classifications" ON document_classifications FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_evaluation_results" ON ai_evaluation_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_evaluation_results" ON ai_evaluation_results FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_feedback_logs" ON ai_feedback_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_feedback_logs" ON ai_feedback_logs FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_budgets" ON ai_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_budgets" ON ai_budgets FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_cost_logs" ON ai_cost_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_cost_logs" ON ai_cost_logs FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_usage_summaries" ON ai_usage_summaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_usage_summaries" ON ai_usage_summaries FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_observability_metrics" ON ai_observability_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_observability_metrics" ON ai_observability_metrics FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_model_health" ON ai_model_health FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_model_health" ON ai_model_health FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_orchestration_logs" ON ai_orchestration_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_orchestration_logs" ON ai_orchestration_logs FOR ALL TO authenticated USING (true);

CREATE POLICY "read_ai_approval_requests" ON ai_approval_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_ai_approval_requests" ON ai_approval_requests FOR ALL TO authenticated USING (true);

CREATE POLICY "read_prompt_usage_logs" ON prompt_usage_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_prompt_usage_logs" ON prompt_usage_logs FOR ALL TO authenticated USING (true);

-- =====================================================
-- SEED DATA - AI PROVIDERS
-- =====================================================

INSERT INTO ai_providers (name, slug, provider_type, api_endpoint, is_active) VALUES
('OpenAI', 'openai', 'external', 'https://api.openai.com/v1', true),
('Anthropic', 'anthropic', 'external', 'https://api.anthropic.com/v1', true),
('Google AI', 'google', 'external', 'https://generativelanguage.googleapis.com/v1', true),
('Azure OpenAI', 'azure-openai', 'external', 'https://YOUR_RESOURCE.openai.azure.com', false);

INSERT INTO ai_models (provider_id, name, model_id, model_type, context_window, max_output_tokens, input_cost_per_1k, output_cost_per_1k, supports_vision, supports_functions, capabilities) VALUES
((SELECT id FROM ai_providers WHERE slug = 'openai'), 'GPT-4o', 'gpt-4o', 'chat', 128000, 4096, 0.005, 0.015, true, true, ARRAY['reasoning', 'code', 'vision', 'function_calling']),
((SELECT id FROM ai_providers WHERE slug = 'openai'), 'GPT-4o Mini', 'gpt-4o-mini', 'chat', 128000, 16384, 0.00015, 0.0006, true, true, ARRAY['fast', 'code', 'vision']),
((SELECT id FROM ai_providers WHERE slug = 'openai'), 'GPT-4 Turbo', 'gpt-4-turbo', 'chat', 128000, 4096, 0.01, 0.03, true, true, ARRAY['reasoning', 'code', 'vision']),
((SELECT id FROM ai_providers WHERE slug = 'openai'), 'GPT-3.5 Turbo', 'gpt-3.5-turbo', 'chat', 16385, 4096, 0.0005, 0.0015, false, true, ARRAY['fast', 'chat']),
((SELECT id FROM ai_providers WHERE slug = 'openai'), 'text-embedding-3-large', 'text-embedding-3-large', 'embedding', 8191, 8191, 0.00013, 0, false, false, ARRAY['embeddings']),
((SELECT id FROM ai_providers WHERE slug = 'openai'), 'text-embedding-3-small', 'text-embedding-3-small', 'embedding', 8191, 8191, 0.00002, 0, false, false, ARRAY['embeddings', 'fast']),
((SELECT id FROM ai_providers WHERE slug = 'anthropic'), 'Claude 4 Sonnet', 'claude-sonnet-4-20250514', 'chat', 200000, 8192, 0.003, 0.015, true, true, ARRAY['reasoning', 'code', 'vision', 'long_context']),
((SELECT id FROM ai_providers WHERE slug = 'anthropic'), 'Claude 4 Opus', 'claude-opus-4-20250514', 'chat', 200000, 16384, 0.015, 0.075, true, true, ARRAY['reasoning', 'code', 'vision', 'long_context', 'advanced']),
((SELECT id FROM ai_providers WHERE slug = 'anthropic'), 'Claude 3.5 Haiku', 'claude-3-5-haiku-20241022', 'chat', 200000, 8192, 0.001, 0.005, false, true, ARRAY['fast', 'code']),
((SELECT id FROM ai_providers WHERE slug = 'google'), 'Gemini 1.5 Pro', 'gemini-1.5-pro', 'chat', 1000000, 8192, 0.00125, 0.005, true, true, ARRAY['reasoning', 'code', 'vision', 'long_context', 'multimodal']),
((SELECT id FROM ai_providers WHERE slug = 'google'), 'Gemini 1.5 Flash', 'gemini-1.5-flash', 'chat', 1000000, 8192, 0.000075, 0.0003, true, true, ARRAY['fast', 'vision', 'long_context']);

-- =====================================================
-- SEED DATA - PROMPT CATEGORIES
-- =====================================================

INSERT INTO prompt_categories (name, slug, description, icon, sort_order) VALUES
('Sales', 'sales', 'Sales and lead conversion prompts', 'TrendingUp', 1),
('CRM', 'crm', 'Customer relationship management prompts', 'Users', 2),
('Marketing', 'marketing', 'Marketing and campaign prompts', 'Megaphone', 3),
('GST', 'gst', 'GST and tax-related prompts', 'Receipt', 4),
('Accounting', 'accounting', 'Accounting and finance prompts', 'Calculator', 5),
('Support', 'support', 'Customer support prompts', 'Headphones', 6),
('HR', 'hr', 'Human resources prompts', 'UserCheck', 7),
('Legal', 'legal', 'Legal and compliance prompts', 'Scale', 8),
('Reports', 'reports', 'Report generation prompts', 'FileBarChart', 9),
('Invoice', 'invoice', 'Invoice processing prompts', 'FileText', 10),
('Website Builder', 'website-builder', 'Website generation prompts', 'Globe', 11),
('Workflow Builder', 'workflow-builder', 'Workflow automation prompts', 'GitBranch', 12),
('Analytics', 'analytics', 'Data analysis prompts', 'BarChart3', 13),
('Email', 'email', 'Email composition prompts', 'Mail', 14),
('WhatsApp', 'whatsapp', 'WhatsApp messaging prompts', 'MessageSquare', 15);

-- =====================================================
-- SEED DATA - DEFAULT MODEL ROUTING RULES
-- =====================================================

INSERT INTO model_routing_rules (name, priority, task_type, preferred_model_id, fallback_model_id, conditions, is_active) VALUES
('Code Generation', 100, 'code', (SELECT id FROM ai_models WHERE model_id = 'claude-sonnet-4-20250514'), (SELECT id FROM ai_models WHERE model_id = 'gpt-4o'), '{"complexity": "high"}', true),
('Quick Chat', 90, 'chat', (SELECT id FROM ai_models WHERE model_id = 'gpt-4o-mini'), (SELECT id FROM ai_models WHERE model_id = 'claude-3-5-haiku-20241022'), '{"complexity": "low"}', true),
('Document Analysis', 100, 'document', (SELECT id FROM ai_models WHERE model_id = 'claude-sonnet-4-20250514'), (SELECT id FROM ai_models WHERE model_id = 'gpt-4o'), '{"pages": ">10"}', true),
('Embeddings', 100, 'embedding', (SELECT id FROM ai_models WHERE model_id = 'text-embedding-3-large'), (SELECT id FROM ai_models WHERE model_id = 'text-embedding-3-small'), '{}', true),
('Long Context', 100, 'long_context', (SELECT id FROM ai_models WHERE model_id = 'claude-sonnet-4-20250514'), (SELECT id FROM ai_models WHERE model_id = 'gemini-1.5-pro'), '{"tokens": ">50000"}', true),
('Vision Analysis', 100, 'vision', (SELECT id FROM ai_models WHERE model_id = 'gpt-4o'), (SELECT id FROM ai_models WHERE model_id = 'claude-sonnet-4-20250514'), '{}', true);

-- =====================================================
-- SEED DATA - AI GUARDRAILS
-- =====================================================

INSERT INTO ai_guardrails (name, guardrail_type, description, rules, severity, action, is_active) VALUES
('Prompt Injection Detection', 'pattern', 'Detects common prompt injection patterns', '["ignore previous instructions", "disregard all above", "you are now", "new instructions:", "system override"]', 'high', 'block', true),
('PII Protection', 'pattern', 'Prevents exposure of sensitive personal information', '["\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}", "\\b\\d{3}[-.]?\\d{2}[-.]?\\d{4}\\b"]', 'high', 'mask', true),
('Financial Data Protection', 'semantic', 'Prevents unauthorized financial operations', '{"concepts": ["transfer money", "delete records", "modify pricing", "waive payment"]}', 'critical', 'require_approval', true),
('Harmful Content', 'semantic', 'Blocks harmful or illegal requests', '{"categories": ["violence", "illegal_activities", "self_harm", "harassment"]}', 'critical', 'block', true),
('Competitor Disparagement', 'semantic', 'Prevents negative competitor mentions', '{"concepts": ["competitor is bad", "competitor scam", "competitor fraud"]}', 'medium', 'warn', true);

-- =====================================================
-- SEED DATA - SENSITIVE DATA PATTERNS
-- =====================================================

INSERT INTO sensitive_data_patterns (name, pattern_type, pattern_regex, category, action, replacement, is_active) VALUES
('Credit Card Number', 'regex', '\\b(?:\\d{4}[\\s-]?){3}\\d{4}\\b', 'financial', 'mask', '[CC REDACTED]', true),
('PAN Number', 'regex', '[A-Z]{5}\\d{4}[A-Z]{1}', 'identity', 'mask', '[PAN REDACTED]', true),
('Aadhaar Number', 'regex', '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b', 'identity', 'mask', '[AADHAAR REDACTED]', true),
('GST Number', 'regex', '\\d{2}[A-Z]{5}\\d{4}[A-Z]{1}[A-Z\\d]{1}[Z]{1}[A-Z\\d]{1}', 'business', 'mask', '[GST REDACTED]', true),
('Email Address', 'regex', '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', 'contact', 'partial_mask', 'e***@example.com', false),
('Phone Number', 'regex', '\\b\\+?\\d{1,3}[\\s-]?\\d{10}\\b', 'contact', 'partial_mask', '+91-****[LAST4]', false);

-- =====================================================
-- SEED DATA - AI MEMORY LAYERS
-- =====================================================

INSERT INTO ai_memory_layers (name, layer_type, description, retention_days, max_entries, is_active) VALUES
('Session Memory', 'session', 'Short-term memory for current conversation session', 1, 1000, true),
('User Memory', 'user', 'Personal preferences and settings for individual users', 365, 500, true),
('Customer Memory', 'customer', 'Customer-specific insights and interaction history', 365, 2000, true),
('Organization Memory', 'organization', 'Company-wide policies and guidelines', 730, 5000, true),
('Knowledge Memory', 'knowledge', 'Retrievable facts and documentation', 1095, 50000, true),
('Conversation Summary', 'summary', 'Condensed summaries of past conversations', 180, 10000, true),
('Long-Term Memory', 'long_term', 'Consolidated important information', 1095, 20000, true);

-- =====================================================
-- SEED DATA - AI EVALUATION METRICS
-- =====================================================

INSERT INTO ai_evaluation_metrics (metric_name, metric_type, description, calculation_method, target_value, unit, is_active) VALUES
('Answer Relevance', 'quality', 'Measures how relevant the answer is to the question', 'semantic_similarity', 0.85, 'score', true),
('Factual Accuracy', 'quality', 'Measures accuracy of facts in responses', 'fact_check', 0.90, 'score', true),
('Grounding Score', 'grounding', 'Measures how grounded the response is in retrieved context', 'citation_check', 0.80, 'score', true),
('Response Latency', 'performance', 'Time to generate first token', 'timer', 2000, 'ms', true),
('Token Efficiency', 'efficiency', 'Output tokens per request efficiency', 'token_ratio', 0.80, 'ratio', true),
('User Satisfaction', 'satisfaction', 'User feedback rating', 'user_rating', 4.0, 'rating', true),
('Task Completion', 'utility', 'Whether the task was completed successfully', 'outcome_check', 0.85, 'rate', true),
('Cost Efficiency', 'cost', 'Cost per successful task completion', 'cost_tracking', 0.05, 'USD', true);

-- =====================================================
-- SEED DATA - APPROVAL WORKFLOWS
-- =====================================================

INSERT INTO ai_approval_workflows (name, trigger_type, trigger_conditions, approver_roles, escalation_minutes, is_active) VALUES
('Legal Notice Approval', 'content_type', '{"content_types": ["legal_notice", "legal_letter"], "recipients": ">1"}', ARRAY['admin', 'legal'], 60, true),
('Bulk Customer Message', 'action_type', '{"action": "bulk_message", "recipients": ">50"}', ARRAY['admin', 'marketing'], 120, true),
('Financial Operation', 'action_type', '{"action": "financial", "amount": ">10000"}', ARRAY['admin', 'finance'], 30, true),
('Policy Change', 'action_type', '{"action": "policy_update"}', ARRAY['admin', 'owner'], 240, true);

-- =====================================================
-- SEED DATA - SAMPLE PROMPTS
-- =====================================================

INSERT INTO prompts (category_id, name, slug, description, content, variables, default_values, version, approval_status) VALUES
((SELECT id FROM prompt_categories WHERE slug = 'sales'), 'Lead Qualification', 'lead-qualification', 'Qualify a new lead based on provided information', 'You are a sales qualification assistant. Analyze the following lead information and provide:
1. Lead Score (1-100)
2. Recommended Next Steps
3. Key Pain Points Identified
4. Suggested Approach

Lead Information:
- Name: {{lead_name}}
- Company: {{company_name}}
- Industry: {{industry}}
- Source: {{lead_source}}
- Initial Inquiry: {{inquiry}}

Focus on understanding their needs and matching our services.', '["lead_name", "company_name", "industry", "lead_source", "inquiry"]', '{"lead_name": "Unknown", "company_name": "Not Provided"}', 1, 'approved'),
((SELECT id FROM prompt_categories WHERE slug = 'support'), 'Customer Support Response', 'customer-support-response', 'Generate a helpful customer support response', 'You are a friendly customer support agent for WebHoster AI Business OS.

Customer Issue: {{issue_description}}
Customer: {{customer_name}}
Priority: {{priority}}
Previous Interactions: {{previous_interactions}}

Generate a response that:
1. Acknowledges their concern
2. Provides clear next steps
3. Offers additional help if needed

Keep the tone professional yet warm. If unsure about technical details, suggest escalation.', '["issue_description", "customer_name", "priority", "previous_interactions"]', '{"priority": "normal"}', 1, 'approved'),
((SELECT id FROM prompt_categories WHERE slug = 'invoice'), 'Invoice Generation', 'invoice-generation', 'Generate professional invoice from service details', 'Generate a professional invoice description for:

Service: {{service_name}}
Quantity: {{quantity}}
Rate: {{rate}}
Customer: {{customer_name}}
Tax Category: {{tax_category}}

Create:
1. Line item description
2. Tax calculation summary
3. Notes section
4. Payment terms

Ensure all amounts are accurately calculated per Indian GST regulations.', '["service_name", "quantity", "rate", "customer_name", "tax_category"]', '{}', 1, 'approved'),
((SELECT id FROM prompt_categories WHERE slug = 'email'), 'Professional Email Composer', 'professional-email', 'Compose business emails with proper tone and structure', 'Compose a professional email with the following parameters:

Purpose: {{email_purpose}}
Recipient: {{recipient_name}}
Tone: {{tone}}
Key Points: {{key_points}}
Call to Action: {{call_to_action}}

Generate:
1. Subject line
2. Email body
3. Professional closing

Keep it concise and action-oriented. Use {{sender_name}} for the signature.', '["email_purpose", "recipient_name", "tone", "key_points", "call_to_action", "sender_name"]', '{"tone": "professional"}', 1, 'approved'),
((SELECT id FROM prompt_categories WHERE slug = 'reports'), 'Business Report Summary', 'business-report-summary', 'Summarize business reports with key insights', 'Analyze and summarize the following business report data:

Report Type: {{report_type}}
Time Period: {{time_period}}
Data: {{report_data}}

Provide:
1. Executive Summary (3-5 sentences)
2. Key Metrics Highlight
3. Trends and Patterns
4. Recommendations
5. Areas of Concern

Focus on actionable insights for business decision-makers.', '["report_type", "time_period", "report_data"]', '{}', 1, 'approved');