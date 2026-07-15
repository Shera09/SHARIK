-- AI CEO & Digital Twin Platform Schema

-- ENUM Types
CREATE TYPE ceo_report_type AS ENUM ('morning_brief', 'weekly_summary', 'monthly_review', 'strategic_insight', 'risk_alert', 'opportunity');
CREATE TYPE prediction_category AS ENUM ('revenue', 'expenses', 'cash_flow', 'customer_churn', 'lead_conversion', 'employee_performance', 'market_trend', 'resource_utilization');
CREATE TYPE prediction_confidence AS ENUM ('low', 'medium', 'high', 'very_high');
CREATE TYPE twin_metric_type AS ENUM ('financial', 'operational', 'customer', 'employee', 'system', 'market');
CREATE TYPE simulation_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE coaching_session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE risk_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE risk_category AS ENUM ('financial', 'operational', 'compliance', 'security', 'market', 'resource', 'reputation');
CREATE TYPE alert_priority AS ENUM ('info', 'warning', 'critical', 'emergency');
CREATE TYPE decision_status AS ENUM ('pending', 'approved', 'rejected', 'implemented', 'archived');

-- Business Digital Twin Tables
CREATE TABLE digital_twin_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type twin_metric_type NOT NULL,
  metric_name TEXT NOT NULL,
  current_value DECIMAL(15,4) NOT NULL,
  previous_value DECIMAL(15,4),
  target_value DECIMAL(15,4),
  unit TEXT,
  trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
  trend_percentage DECIMAL(6,2),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  data_source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE digital_twin_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  overall_health_score INTEGER CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
  financial_health INTEGER CHECK (financial_health >= 0 AND financial_health <= 100),
  operational_health INTEGER CHECK (operational_health >= 0 AND operational_health <= 100),
  customer_health INTEGER CHECK (customer_health >= 0 AND customer_health <= 100),
  employee_health INTEGER CHECK (employee_health >= 0 AND employee_health <= 100),
  system_health INTEGER CHECK (system_health >= 0 AND system_health <= 100),
  insights JSONB DEFAULT '[]',
  alerts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI CEO Reports
CREATE TABLE ceo_morning_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  executive_summary TEXT NOT NULL,
  revenue_yesterday DECIMAL(15,2),
  revenue_mtd DECIMAL(15,2),
  revenue_target DECIMAL(15,2),
  new_leads INTEGER DEFAULT 0,
  converted_leads INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  open_tickets INTEGER DEFAULT 0,
  resolved_tickets INTEGER DEFAULT 0,
  cash_position DECIMAL(15,2),
  receivables DECIMAL(15,2),
  payables DECIMAL(15,2),
  key_wins JSONB DEFAULT '[]',
  key_concerns JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  ai_health_score INTEGER CHECK (ai_health_score >= 0 AND ai_health_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ceo_strategic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  insight_type ceo_report_type NOT NULL,
  content TEXT NOT NULL,
  impact_analysis TEXT,
  recommended_actions JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_sources JSONB DEFAULT '[]',
  is_actioned BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 5,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictive Analytics
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category prediction_category NOT NULL,
  prediction_text TEXT NOT NULL,
  predicted_value DECIMAL(15,4),
  predicted_date DATE,
  confidence prediction_confidence NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  model_used TEXT,
  input_features JSONB DEFAULT '{}',
  contributing_factors JSONB DEFAULT '[]',
  actual_value DECIMAL(15,4),
  accuracy_score DECIMAL(3,2),
  is_validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

-- Business Simulations
CREATE TABLE business_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL,
  status simulation_status DEFAULT 'pending',
  base_metrics JSONB NOT NULL,
  scenario_parameters JSONB NOT NULL,
  projected_outcomes JSONB,
  risk_assessment JSONB,
  recommendations JSONB,
  roi_projection DECIMAL(10,2),
  time_to_impact INTEGER,
  confidence_level DECIMAL(3,2),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- AI Coaching System
CREATE TABLE coaching_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_role TEXT,
  skills_focus JSONB DEFAULT '[]',
  duration_weeks INTEGER DEFAULT 4,
  total_sessions INTEGER DEFAULT 4,
  ai_approach TEXT,
  learning_objectives JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES coaching_programs(id) ON DELETE CASCADE,
  employee_id UUID,
  session_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  status coaching_session_status DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  ai_coach_notes TEXT,
  employee_reflections TEXT,
  key_learnings JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  progress_score INTEGER CHECK (progress_score >= 0 AND progress_score <= 100),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Management
CREATE TABLE business_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category risk_category NOT NULL,
  severity risk_severity NOT NULL,
  probability DECIMAL(3,2) CHECK (probability >= 0 AND probability <= 1),
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  affected_areas JSONB DEFAULT '[]',
  mitigation_strategies JSONB DEFAULT '[]',
  contingency_plan TEXT,
  owner TEXT,
  status TEXT DEFAULT 'active',
  identified_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart Alerts
CREATE TABLE smart_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  priority alert_priority NOT NULL,
  source_metric TEXT,
  threshold_value DECIMAL(15,4),
  current_value DECIMAL(15,4),
  deviation_percentage DECIMAL(6,2),
  affected_entity TEXT,
  recommended_actions JSONB DEFAULT '[]',
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  auto_escalate_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Decision Engine
CREATE TABLE ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type TEXT NOT NULL,
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  options JSONB NOT NULL,
  selected_option TEXT,
  rationale TEXT,
  impact_assessment JSONB,
  confidence_score DECIMAL(3,2),
  status decision_status DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  outcome_metrics JSONB,
  lessons_learned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Board Meeting
CREATE TABLE board_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date DATE NOT NULL,
  meeting_type TEXT NOT NULL,
  agenda JSONB DEFAULT '[]',
  attendees JSONB DEFAULT '[]',
  ai_ceo_report TEXT,
  key_metrics JSONB DEFAULT '{}',
  strategic_recommendations JSONB DEFAULT '[]',
  risk_assessment JSONB DEFAULT '{}',
  decisions_made JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  next_meeting_date DATE,
  status TEXT DEFAULT 'scheduled',
  meeting_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Self-Learning Layer
CREATE TABLE ai_learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  insight_gained TEXT,
  model_adjustments JSONB DEFAULT '{}',
  accuracy_before DECIMAL(3,2),
  accuracy_after DECIMAL(3,2),
  feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
  is_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Strategy Engine
CREATE TABLE strategic_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  start_date DATE,
  target_end_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  key_results JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  resources_required JSONB DEFAULT '{}',
  risks JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  ai_recommendation TEXT,
  status TEXT DEFAULT 'planning',
  owner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Health Index
CREATE TABLE ai_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_date DATE NOT NULL UNIQUE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  prediction_accuracy DECIMAL(3,2),
  automation_efficiency DECIMAL(3,2),
  response_quality DECIMAL(3,2),
  learning_rate DECIMAL(3,2),
  error_rate DECIMAL(5,4),
  uptime_percentage DECIMAL(5,2),
  interactions_count INTEGER DEFAULT 0,
  successful_interactions INTEGER DEFAULT 0,
  model_version TEXT,
  improvement_areas JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE digital_twin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_morning_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_strategic_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_health_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_own_twin_metrics" ON digital_twin_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own_twin_metrics" ON digital_twin_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_own_twin_metrics" ON digital_twin_metrics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_twin_metrics" ON digital_twin_metrics FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_twin_snapshot" ON digital_twin_snapshot FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_twin_snapshot" ON digital_twin_snapshot FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_twin_snapshot" ON digital_twin_snapshot FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_twin_snapshot" ON digital_twin_snapshot FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_ceo_reports" ON ceo_morning_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_ceo_reports" ON ceo_morning_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_ceo_reports" ON ceo_morning_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_ceo_reports" ON ceo_morning_reports FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_ceo_insights" ON ceo_strategic_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_ceo_insights" ON ceo_strategic_insights FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_ceo_insights" ON ceo_strategic_insights FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_ceo_insights" ON ceo_strategic_insights FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_predictions" ON predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_predictions" ON predictions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_predictions" ON predictions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_predictions" ON predictions FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_simulations" ON business_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_simulations" ON business_simulations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_simulations" ON business_simulations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_simulations" ON business_simulations FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_coaching_programs" ON coaching_programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_coaching_programs" ON coaching_programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_coaching_programs" ON coaching_programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_coaching_programs" ON coaching_programs FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_coaching_sessions" ON coaching_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_coaching_sessions" ON coaching_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_coaching_sessions" ON coaching_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_coaching_sessions" ON coaching_sessions FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_risks" ON business_risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_risks" ON business_risks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_risks" ON business_risks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_risks" ON business_risks FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_alerts" ON smart_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_alerts" ON smart_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_alerts" ON smart_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_alerts" ON smart_alerts FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_decisions" ON ai_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_decisions" ON ai_decisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_decisions" ON ai_decisions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_decisions" ON ai_decisions FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_board_meetings" ON board_meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_board_meetings" ON board_meetings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_board_meetings" ON board_meetings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_board_meetings" ON board_meetings FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_learning_events" ON ai_learning_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_learning_events" ON ai_learning_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_learning_events" ON ai_learning_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_learning_events" ON ai_learning_events FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_initiatives" ON strategic_initiatives FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_initiatives" ON strategic_initiatives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_initiatives" ON strategic_initiatives FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_initiatives" ON strategic_initiatives FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_health_history" ON ai_health_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_health_history" ON ai_health_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_health_history" ON ai_health_history FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_health_history" ON ai_health_history FOR DELETE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_twin_metrics_type ON digital_twin_metrics(metric_type);
CREATE INDEX idx_twin_metrics_date ON digital_twin_metrics(last_updated DESC);
CREATE INDEX idx_twin_snapshot_date ON digital_twin_snapshot(snapshot_date DESC);
CREATE INDEX idx_ceo_reports_date ON ceo_morning_reports(report_date DESC);
CREATE INDEX idx_predictions_category ON predictions(category);
CREATE INDEX idx_predictions_date ON predictions(created_at DESC);
CREATE INDEX idx_simulations_status ON business_simulations(status);
CREATE INDEX idx_coaching_sessions_status ON coaching_sessions(status);
CREATE INDEX idx_risks_severity ON business_risks(severity);
CREATE INDEX idx_alerts_priority ON smart_alerts(priority);
CREATE INDEX idx_alerts_created ON smart_alerts(created_at DESC);
CREATE INDEX idx_decisions_status ON ai_decisions(status);
CREATE INDEX idx_health_history_date ON ai_health_history(health_date DESC);