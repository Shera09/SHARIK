-- Enterprise Data Warehouse & Business Intelligence Platform
-- Part 15: Star Schema, ETL, KPIs, AI Insights, Predictive Analytics, Data Governance

-- Enum types for BI platform
DO $$ BEGIN CREATE TYPE etl_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE kpi_direction AS ENUM ('higher_better', 'lower_better', 'target'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE insight_type AS ENUM ('opportunity', 'risk', 'anomaly', 'trend', 'recommendation', 'alert'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE model_status AS ENUM ('training', 'active', 'deprecated', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE data_source_type AS ENUM ('database', 'api', 'file', 'stream', 'warehouse'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================
-- DIMENSION TABLES (Star Schema)
-- ============================================

-- Date Dimension
CREATE TABLE IF NOT EXISTS dim_date (
  date_key SERIAL PRIMARY KEY,
  date_date DATE UNIQUE NOT NULL,
  day_of_week INTEGER NOT NULL,
  day_name VARCHAR(10) NOT NULL,
  day_of_month INTEGER NOT NULL,
  day_of_year INTEGER NOT NULL,
  week_of_year INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  month_number INTEGER NOT NULL,
  month_name VARCHAR(10) NOT NULL,
  quarter INTEGER NOT NULL,
  quarter_name VARCHAR(2) NOT NULL,
  year INTEGER NOT NULL,
  year_month VARCHAR(7) NOT NULL,
  is_weekend BOOLEAN NOT NULL DEFAULT false,
  is_holiday BOOLEAN NOT NULL DEFAULT false,
  holiday_name VARCHAR(100),
  fiscal_year INTEGER,
  fiscal_quarter INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dim_date_all_policy" ON dim_date;
CREATE POLICY "dim_date_all_policy" ON dim_date FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE dim_date ENABLE ROW LEVEL SECURITY;

-- Customer Dimension (SCD Type 2)
CREATE TABLE IF NOT EXISTS dim_customer (
  customer_key SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL,
  customer_number VARCHAR(50),
  customer_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  customer_type VARCHAR(50),
  industry VARCHAR(100),
  segment VARCHAR(50),
  acquisition_channel VARCHAR(100),
  lifetime_value NUMERIC(15,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  first_order_date DATE,
  last_order_date DATE,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dim_customer_select" ON dim_customer;
CREATE POLICY "dim_customer_select" ON dim_customer FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dim_customer_insert" ON dim_customer;
CREATE POLICY "dim_customer_insert" ON dim_customer FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dim_customer_update" ON dim_customer;
CREATE POLICY "dim_customer_update" ON dim_customer FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE dim_customer ENABLE ROW LEVEL SECURITY;

-- Employee Dimension
CREATE TABLE IF NOT EXISTS dim_employee (
  employee_key SERIAL PRIMARY KEY,
  employee_id UUID NOT NULL,
  employee_number VARCHAR(50),
  employee_name VARCHAR(255),
  email VARCHAR(255),
  department VARCHAR(100),
  designation VARCHAR(100),
  manager_id UUID,
  manager_name VARCHAR(255),
  branch_id UUID,
  branch_name VARCHAR(255),
  hire_date DATE,
  termination_date DATE,
  employment_status VARCHAR(50),
  performance_rating NUMERIC(3,2),
  skills TEXT[],
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dim_employee_select" ON dim_employee;
CREATE POLICY "dim_employee_select" ON dim_employee FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dim_employee_insert" ON dim_employee;
CREATE POLICY "dim_employee_insert" ON dim_employee FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dim_employee_update" ON dim_employee;
CREATE POLICY "dim_employee_update" ON dim_employee FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE dim_employee ENABLE ROW LEVEL SECURITY;

-- Service/Product Dimension
CREATE TABLE IF NOT EXISTS dim_service (
  service_key SERIAL PRIMARY KEY,
  service_id UUID NOT NULL,
  service_code VARCHAR(50),
  service_name VARCHAR(255),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  service_type VARCHAR(50),
  base_price NUMERIC(15,2),
  unit_of_measure VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dim_service_select" ON dim_service;
CREATE POLICY "dim_service_select" ON dim_service FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dim_service_insert" ON dim_service;
CREATE POLICY "dim_service_insert" ON dim_service FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dim_service_update" ON dim_service;
CREATE POLICY "dim_service_update" ON dim_service FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE dim_service ENABLE ROW LEVEL SECURITY;

-- Branch Dimension
CREATE TABLE IF NOT EXISTS dim_branch (
  branch_key SERIAL PRIMARY KEY,
  branch_id UUID NOT NULL,
  branch_code VARCHAR(50),
  branch_name VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  region VARCHAR(100),
  branch_type VARCHAR(50),
  opening_date DATE,
  manager_id UUID,
  manager_name VARCHAR(255),
  capacity INTEGER,
  status VARCHAR(50),
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dim_branch_select" ON dim_branch;
CREATE POLICY "dim_branch_select" ON dim_branch FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dim_branch_insert" ON dim_branch;
CREATE POLICY "dim_branch_insert" ON dim_branch FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dim_branch_update" ON dim_branch;
CREATE POLICY "dim_branch_update" ON dim_branch FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE dim_branch ENABLE ROW LEVEL SECURITY;

-- Lead Source Dimension
CREATE TABLE IF NOT EXISTS dim_lead_source (
  lead_source_key SERIAL PRIMARY KEY,
  source_id UUID NOT NULL,
  source_name VARCHAR(255),
  source_type VARCHAR(100),
  channel VARCHAR(100),
  cost_per_lead NUMERIC(10,2),
  conversion_rate NUMERIC(5,4),
  is_active BOOLEAN DEFAULT true,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dim_lead_source_select" ON dim_lead_source;
CREATE POLICY "dim_lead_source_select" ON dim_lead_source FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dim_lead_source_insert" ON dim_lead_source;
CREATE POLICY "dim_lead_source_insert" ON dim_lead_source FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dim_lead_source_update" ON dim_lead_source;
CREATE POLICY "dim_lead_source_update" ON dim_lead_source FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE dim_lead_source ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FACT TABLES
-- ============================================

-- Sales Fact
CREATE TABLE IF NOT EXISTS fact_sales (
  sale_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(100) NOT NULL,
  date_key INTEGER REFERENCES dim_date(date_key),
  customer_key INTEGER REFERENCES dim_customer(customer_key),
  service_key INTEGER REFERENCES dim_service(service_key),
  branch_key INTEGER REFERENCES dim_branch(branch_key),
  employee_key INTEGER REFERENCES dim_employee(employee_key),
  lead_source_key INTEGER REFERENCES dim_lead_source(lead_source_key),
  invoice_id UUID,
  quotation_id UUID,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  cost_amount NUMERIC(15,2),
  gross_margin NUMERIC(15,2),
  gross_margin_percent NUMERIC(5,2),
  payment_terms VARCHAR(50),
  payment_status VARCHAR(50),
  sale_date DATE NOT NULL,
  sale_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fact_sales_date_bi ON fact_sales(date_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_customer_bi ON fact_sales(customer_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_service_bi ON fact_sales(service_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_branch_bi ON fact_sales(branch_key);

DROP POLICY IF EXISTS "fact_sales_select" ON fact_sales;
CREATE POLICY "fact_sales_select" ON fact_sales FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fact_sales_insert" ON fact_sales;
CREATE POLICY "fact_sales_insert" ON fact_sales FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fact_sales_update" ON fact_sales;
CREATE POLICY "fact_sales_update" ON fact_sales FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE fact_sales ENABLE ROW LEVEL SECURITY;

-- Payments Fact
CREATE TABLE IF NOT EXISTS fact_payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number VARCHAR(100) NOT NULL,
  date_key INTEGER REFERENCES dim_date(date_key),
  customer_key INTEGER REFERENCES dim_customer(customer_key),
  branch_key INTEGER REFERENCES dim_branch(branch_key),
  invoice_id UUID,
  sale_id UUID REFERENCES fact_sales(sale_id),
  payment_method VARCHAR(50),
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  exchange_rate NUMERIC(10,4) DEFAULT 1,
  base_amount NUMERIC(15,2),
  status VARCHAR(50),
  payment_date DATE NOT NULL,
  payment_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reconciliation_status VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "fact_payments_select" ON fact_payments;
CREATE POLICY "fact_payments_select" ON fact_payments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fact_payments_insert" ON fact_payments;
CREATE POLICY "fact_payments_insert" ON fact_payments FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fact_payments_update" ON fact_payments;
CREATE POLICY "fact_payments_update" ON fact_payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE fact_payments ENABLE ROW LEVEL SECURITY;

-- Lead Conversion Fact
CREATE TABLE IF NOT EXISTS fact_lead_conversion (
  conversion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  date_key INTEGER REFERENCES dim_date(date_key),
  customer_key INTEGER REFERENCES dim_customer(customer_key),
  lead_source_key INTEGER REFERENCES dim_lead_source(lead_source_key),
  employee_key INTEGER REFERENCES dim_employee(employee_key),
  branch_key INTEGER REFERENCES dim_branch(branch_key),
  lead_created_date DATE,
  conversion_date DATE,
  days_to_convert INTEGER,
  lead_value NUMERIC(15,2),
  converted_value NUMERIC(15,2),
  conversion_stage VARCHAR(50),
  conversion_status VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "fact_lead_conversion_select" ON fact_lead_conversion;
CREATE POLICY "fact_lead_conversion_select" ON fact_lead_conversion FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fact_lead_conversion_insert" ON fact_lead_conversion;
CREATE POLICY "fact_lead_conversion_insert" ON fact_lead_conversion FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fact_lead_conversion_update" ON fact_lead_conversion;
CREATE POLICY "fact_lead_conversion_update" ON fact_lead_conversion FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE fact_lead_conversion ENABLE ROW LEVEL SECURITY;

-- Employee Performance Fact
CREATE TABLE IF NOT EXISTS fact_employee_performance (
  performance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_key INTEGER REFERENCES dim_employee(employee_key),
  date_key INTEGER REFERENCES dim_date(date_key),
  branch_key INTEGER REFERENCES dim_branch(branch_key),
  tasks_completed INTEGER DEFAULT 0,
  tasks_assigned INTEGER DEFAULT 0,
  task_completion_rate NUMERIC(5,2),
  sales_amount NUMERIC(15,2) DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  customer_satisfaction_score NUMERIC(3,2),
  attendance_days INTEGER DEFAULT 0,
  leave_days INTEGER DEFAULT 0,
  overtime_hours NUMERIC(5,2),
  productivity_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  revenue_generated NUMERIC(15,2),
  cost_incurred NUMERIC(15,2),
  profit_contribution NUMERIC(15,2),
  period_type VARCHAR(20) DEFAULT 'daily',
  period_start_date DATE,
  period_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "fact_emp_perf_select" ON fact_employee_performance;
CREATE POLICY "fact_emp_perf_select" ON fact_employee_performance FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fact_emp_perf_insert" ON fact_employee_performance;
CREATE POLICY "fact_emp_perf_insert" ON fact_employee_performance FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fact_emp_perf_update" ON fact_employee_performance;
CREATE POLICY "fact_emp_perf_update" ON fact_employee_performance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE fact_employee_performance ENABLE ROW LEVEL SECURITY;

-- AI Usage Fact
CREATE TABLE IF NOT EXISTS fact_ai_usage (
  usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key INTEGER REFERENCES dim_date(date_key),
  employee_key INTEGER REFERENCES dim_employee(employee_key),
  branch_key INTEGER REFERENCES dim_branch(branch_key),
  ai_feature VARCHAR(100),
  model_name VARCHAR(100),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 1,
  processing_time_ms INTEGER,
  cost_amount NUMERIC(10,4) DEFAULT 0,
  cost_currency VARCHAR(3) DEFAULT 'USD',
  success BOOLEAN DEFAULT true,
  error_type VARCHAR(100),
  user_satisfaction_rating INTEGER,
  response_quality_score NUMERIC(3,2),
  session_id VARCHAR(100),
  usage_date DATE NOT NULL,
  usage_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "fact_ai_usage_select" ON fact_ai_usage;
CREATE POLICY "fact_ai_usage_select" ON fact_ai_usage FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fact_ai_usage_insert" ON fact_ai_usage;
CREATE POLICY "fact_ai_usage_insert" ON fact_ai_usage FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fact_ai_usage_update" ON fact_ai_usage;
CREATE POLICY "fact_ai_usage_update" ON fact_ai_usage FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE fact_ai_usage ENABLE ROW LEVEL SECURITY;

-- Marketing Fact
CREATE TABLE IF NOT EXISTS fact_marketing (
  marketing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key INTEGER REFERENCES dim_date(date_key),
  lead_source_key INTEGER REFERENCES dim_lead_source(lead_source_key),
  branch_key INTEGER REFERENCES dim_branch(branch_key),
  campaign_id UUID,
  campaign_name VARCHAR(255),
  channel VARCHAR(100),
  spend_amount NUMERIC(15,2) NOT NULL,
  spend_currency VARCHAR(3) DEFAULT 'INR',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(15,2),
  ctr NUMERIC(5,4),
  cpc NUMERIC(10,2),
  cpl NUMERIC(10,2),
  cpa NUMERIC(10,2),
  roas NUMERIC(10,4),
  period_type VARCHAR(20) DEFAULT 'daily',
  activity_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "fact_marketing_select" ON fact_marketing;
CREATE POLICY "fact_marketing_select" ON fact_marketing FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fact_marketing_insert" ON fact_marketing;
CREATE POLICY "fact_marketing_insert" ON fact_marketing FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fact_marketing_update" ON fact_marketing;
CREATE POLICY "fact_marketing_update" ON fact_marketing FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE fact_marketing ENABLE ROW LEVEL SECURITY;

-- Support Fact
CREATE TABLE IF NOT EXISTS fact_support (
  support_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  date_key INTEGER REFERENCES dim_date(date_key),
  customer_key INTEGER REFERENCES dim_customer(customer_key),
  employee_key INTEGER REFERENCES dim_employee(employee_key),
  branch_key INTEGER REFERENCES dim_branch(branch_key),
  ticket_number VARCHAR(100),
  ticket_type VARCHAR(50),
  priority VARCHAR(20),
  status VARCHAR(50),
  channel VARCHAR(50),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  first_response_time_minutes INTEGER,
  resolution_time_minutes INTEGER,
  handle_time_minutes INTEGER,
  reopen_count INTEGER DEFAULT 0,
  customer_satisfaction INTEGER,
  agent_satisfaction INTEGER,
  sla_met BOOLEAN,
  escalated BOOLEAN DEFAULT false,
  escalation_level INTEGER,
  created_date DATE,
  resolved_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "fact_support_select" ON fact_support;
CREATE POLICY "fact_support_select" ON fact_support FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fact_support_insert" ON fact_support;
CREATE POLICY "fact_support_insert" ON fact_support FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fact_support_update" ON fact_support;
CREATE POLICY "fact_support_update" ON fact_support FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE fact_support ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ETL PIPELINES
-- ============================================

CREATE TABLE IF NOT EXISTS etl_pipelines (
  pipeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(50) NOT NULL,
  source_config JSONB NOT NULL DEFAULT '{}',
  target_table VARCHAR(100) NOT NULL,
  transformation_logic TEXT,
  schedule_cron VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_run_timestamp TIMESTAMPTZ,
  last_run_status etl_status,
  last_run_records_processed INTEGER,
  last_run_duration_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "etl_pipelines_select" ON etl_pipelines;
CREATE POLICY "etl_pipelines_select" ON etl_pipelines FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "etl_pipelines_insert" ON etl_pipelines;
CREATE POLICY "etl_pipelines_insert" ON etl_pipelines FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "etl_pipelines_update" ON etl_pipelines;
CREATE POLICY "etl_pipelines_update" ON etl_pipelines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "etl_pipelines_delete" ON etl_pipelines;
CREATE POLICY "etl_pipelines_delete" ON etl_pipelines FOR DELETE TO authenticated USING (true);
ALTER TABLE etl_pipelines ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS etl_pipeline_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES etl_pipelines(pipeline_id),
  run_status etl_status NOT NULL DEFAULT 'pending',
  start_timestamp TIMESTAMPTZ,
  end_timestamp TIMESTAMPTZ,
  duration_ms INTEGER,
  records_read INTEGER DEFAULT 0,
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  triggered_by VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "etl_runs_select" ON etl_pipeline_runs;
CREATE POLICY "etl_runs_select" ON etl_pipeline_runs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "etl_runs_insert" ON etl_pipeline_runs;
CREATE POLICY "etl_runs_insert" ON etl_pipeline_runs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "etl_runs_update" ON etl_pipeline_runs;
CREATE POLICY "etl_runs_update" ON etl_pipeline_runs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE etl_pipeline_runs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- KPI DEFINITIONS & TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS kpi_definitions (
  kpi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  calculation_formula TEXT NOT NULL,
  unit_of_measure VARCHAR(50),
  target_value NUMERIC(15,4),
  threshold_warning NUMERIC(15,4),
  threshold_critical NUMERIC(15,4),
  direction kpi_direction NOT NULL DEFAULT 'higher_better',
  frequency VARCHAR(20) DEFAULT 'daily',
  owner_role VARCHAR(100),
  data_sources TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "kpi_def_select" ON kpi_definitions;
CREATE POLICY "kpi_def_select" ON kpi_definitions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "kpi_def_insert" ON kpi_definitions;
CREATE POLICY "kpi_def_insert" ON kpi_definitions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "kpi_def_update" ON kpi_definitions;
CREATE POLICY "kpi_def_update" ON kpi_definitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID NOT NULL REFERENCES kpi_definitions(kpi_id),
  snapshot_date DATE NOT NULL,
  snapshot_hour INTEGER,
  period_type VARCHAR(20) DEFAULT 'daily',
  dimension_type VARCHAR(50),
  dimension_key VARCHAR(100),
  dimension_value VARCHAR(255),
  value NUMERIC(15,4) NOT NULL,
  previous_value NUMERIC(15,4),
  change_amount NUMERIC(15,4),
  change_percent NUMERIC(10,4),
  target_value NUMERIC(15,4),
  variance_from_target NUMERIC(15,4),
  variance_percent NUMERIC(10,4),
  status VARCHAR(20),
  trend VARCHAR(20),
  calculation_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(kpi_id, snapshot_date, snapshot_hour, period_type, dimension_type, dimension_key)
);

DROP POLICY IF EXISTS "kpi_snapshots_select" ON kpi_snapshots;
CREATE POLICY "kpi_snapshots_select" ON kpi_snapshots FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "kpi_snapshots_insert" ON kpi_snapshots;
CREATE POLICY "kpi_snapshots_insert" ON kpi_snapshots FOR INSERT TO authenticated WITH CHECK (true);
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS kpi_daily_summary (
  summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID NOT NULL REFERENCES kpi_definitions(kpi_id),
  summary_date DATE NOT NULL,
  dimension_type VARCHAR(50),
  dimension_key VARCHAR(100),
  value NUMERIC(15,4),
  min_value NUMERIC(15,4),
  max_value NUMERIC(15,4),
  avg_value NUMERIC(15,4),
  sum_value NUMERIC(15,4),
  count_records INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(kpi_id, summary_date, dimension_type, dimension_key)
);

DROP POLICY IF EXISTS "kpi_daily_select" ON kpi_daily_summary;
CREATE POLICY "kpi_daily_select" ON kpi_daily_summary FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "kpi_daily_insert" ON kpi_daily_summary;
CREATE POLICY "kpi_daily_insert" ON kpi_daily_summary FOR INSERT TO authenticated WITH CHECK (true);
ALTER TABLE kpi_daily_summary ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AI BUSINESS INSIGHTS
-- ============================================

CREATE TABLE IF NOT EXISTS ai_business_insights (
  insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type insight_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium',
  impact_level VARCHAR(20),
  confidence_score NUMERIC(5,4),
  affected_metrics TEXT[],
  affected_dimensions JSONB DEFAULT '{}',
  detected_pattern TEXT,
  root_cause_hypothesis TEXT,
  recommendations TEXT[],
  action_items JSONB DEFAULT '[]',
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  model_name VARCHAR(100),
  model_version VARCHAR(50),
  detection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_from DATE,
  valid_to DATE,
  status VARCHAR(50) DEFAULT 'active',
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  feedback_score INTEGER,
  feedback_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "ai_insights_select" ON ai_business_insights;
CREATE POLICY "ai_insights_select" ON ai_business_insights FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ai_insights_insert" ON ai_business_insights;
CREATE POLICY "ai_insights_insert" ON ai_business_insights FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ai_insights_update" ON ai_business_insights;
CREATE POLICY "ai_insights_update" ON ai_business_insights FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE ai_business_insights ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PREDICTIVE ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS predictive_models (
  model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  model_type VARCHAR(50) NOT NULL,
  target_metric VARCHAR(100) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  training_data_config JSONB DEFAULT '{}',
  training_config JSONB DEFAULT '{}',
  hyperparameters JSONB DEFAULT '{}',
  algorithm VARCHAR(100),
  model_status model_status NOT NULL DEFAULT 'training',
  training_start_date DATE,
  training_end_date DATE,
  training_samples INTEGER,
  validation_samples INTEGER,
  training_metrics JSONB DEFAULT '{}',
  validation_metrics JSONB DEFAULT '{}',
  feature_importance JSONB DEFAULT '{}',
  model_artifacts JSONB DEFAULT '{}',
  deployed_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  version VARCHAR(20),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "pred_models_select" ON predictive_models;
CREATE POLICY "pred_models_select" ON predictive_models FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "pred_models_insert" ON predictive_models;
CREATE POLICY "pred_models_insert" ON predictive_models FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "pred_models_update" ON predictive_models;
CREATE POLICY "pred_models_update" ON predictive_models FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS forecast_results (
  forecast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES predictive_models(model_id),
  forecast_date DATE NOT NULL,
  target_date DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'daily',
  dimension_type VARCHAR(50),
  dimension_key VARCHAR(100),
  predicted_value NUMERIC(15,4) NOT NULL,
  prediction_lower_bound NUMERIC(15,4),
  prediction_upper_bound NUMERIC(15,4),
  confidence_interval NUMERIC(5,2),
  actual_value NUMERIC(15,4),
  error NUMERIC(15,4),
  error_percent NUMERIC(10,4),
  is_actualized BOOLEAN DEFAULT false,
  model_version VARCHAR(20),
  forecast_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "forecast_select" ON forecast_results;
CREATE POLICY "forecast_select" ON forecast_results FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "forecast_insert" ON forecast_results;
CREATE POLICY "forecast_insert" ON forecast_results FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "forecast_update" ON forecast_results;
CREATE POLICY "forecast_update" ON forecast_results FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE forecast_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ANOMALY DETECTION
-- ============================================

CREATE TABLE IF NOT EXISTS anomaly_detection_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_name VARCHAR(100) NOT NULL,
  detection_method VARCHAR(50) NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  threshold_warning NUMERIC(15,4),
  threshold_critical NUMERIC(15,4),
  lookback_period_days INTEGER DEFAULT 30,
  min_samples INTEGER DEFAULT 100,
  baseline_type VARCHAR(50) DEFAULT 'rolling_mean',
  seasonality VARCHAR(50),
  dimension_filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "anomaly_rules_select" ON anomaly_detection_rules;
CREATE POLICY "anomaly_rules_select" ON anomaly_detection_rules FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anomaly_rules_insert" ON anomaly_detection_rules;
CREATE POLICY "anomaly_rules_insert" ON anomaly_detection_rules FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anomaly_rules_update" ON anomaly_detection_rules;
CREATE POLICY "anomaly_rules_update" ON anomaly_detection_rules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE anomaly_detection_rules ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS detected_anomalies (
  anomaly_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES anomaly_detection_rules(rule_id),
  metric_name VARCHAR(100) NOT NULL,
  anomaly_severity anomaly_severity NOT NULL DEFAULT 'medium',
  detected_value NUMERIC(15,4) NOT NULL,
  expected_value NUMERIC(15,4) NOT NULL,
  deviation_percent NUMERIC(10,4),
  deviation_stddev NUMERIC(10,4),
  dimension_type VARCHAR(50),
  dimension_key VARCHAR(100),
  dimension_value VARCHAR(255),
  detection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anomaly_period_start TIMESTAMPTZ,
  anomaly_period_end TIMESTAMPTZ,
  period_type VARCHAR(20),
  status VARCHAR(50) DEFAULT 'new',
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  false_positive BOOLEAN DEFAULT false,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "detected_anom_select" ON detected_anomalies;
CREATE POLICY "detected_anom_select" ON detected_anomalies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "detected_anom_insert" ON detected_anomalies;
CREATE POLICY "detected_anom_insert" ON detected_anomalies FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "detected_anom_update" ON detected_anomalies;
CREATE POLICY "detected_anom_update" ON detected_anomalies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE detected_anomalies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- REPORTING & DASHBOARDS
-- ============================================

CREATE TABLE IF NOT EXISTS report_definitions (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  report_type VARCHAR(50) NOT NULL,
  data_source_query TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  columns JSONB NOT NULL DEFAULT '[]',
  filters JSONB DEFAULT '[]',
  sorting JSONB DEFAULT '[]',
  grouping JSONB DEFAULT '[]',
  aggregations JSONB DEFAULT '{}',
  visualizations JSONB DEFAULT '[]',
  layout_config JSONB DEFAULT '{}',
  refresh_interval_seconds INTEGER,
  cache_duration_seconds INTEGER,
  is_public BOOLEAN DEFAULT false,
  owner_id UUID,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  access_roles TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "report_def_select" ON report_definitions;
CREATE POLICY "report_def_select" ON report_definitions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "report_def_insert" ON report_definitions;
CREATE POLICY "report_def_insert" ON report_definitions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "report_def_update" ON report_definitions;
CREATE POLICY "report_def_update" ON report_definitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "report_def_delete" ON report_definitions;
CREATE POLICY "report_def_delete" ON report_definitions FOR DELETE TO authenticated USING (true);
ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS report_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES report_definitions(report_id),
  name VARCHAR(255),
  schedule_cron VARCHAR(100) NOT NULL,
  recipients TEXT[] NOT NULL,
  format VARCHAR(20) DEFAULT 'pdf',
  delivery_method VARCHAR(50) DEFAULT 'email',
  parameters JSONB DEFAULT '{}',
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "report_sched_select" ON report_schedules;
CREATE POLICY "report_sched_select" ON report_schedules FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "report_sched_insert" ON report_schedules;
CREATE POLICY "report_sched_insert" ON report_schedules FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "report_sched_update" ON report_schedules;
CREATE POLICY "report_sched_update" ON report_schedules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "report_sched_delete" ON report_schedules;
CREATE POLICY "report_sched_delete" ON report_schedules FOR DELETE TO authenticated USING (true);
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS dashboard_definitions (
  dashboard_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  layout_config JSONB NOT NULL DEFAULT '{}',
  widgets JSONB NOT NULL DEFAULT '[]',
  refresh_interval_seconds INTEGER,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  owner_id UUID,
  viewer_roles TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dashboard_def_select" ON dashboard_definitions;
CREATE POLICY "dashboard_def_select" ON dashboard_definitions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dashboard_def_insert" ON dashboard_definitions;
CREATE POLICY "dashboard_def_insert" ON dashboard_definitions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dashboard_def_update" ON dashboard_definitions;
CREATE POLICY "dashboard_def_update" ON dashboard_definitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dashboard_def_delete" ON dashboard_definitions;
CREATE POLICY "dashboard_def_delete" ON dashboard_definitions FOR DELETE TO authenticated USING (true);
ALTER TABLE dashboard_definitions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DATA GOVERNANCE
-- ============================================

CREATE TABLE IF NOT EXISTS data_catalog (
  catalog_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type VARCHAR(50) NOT NULL,
  object_schema VARCHAR(100),
  object_name VARCHAR(255) NOT NULL,
  object_description TEXT,
  column_name VARCHAR(255),
  column_description TEXT,
  data_type VARCHAR(100),
  is_nullable BOOLEAN,
  is_primary_key BOOLEAN DEFAULT false,
  is_foreign_key BOOLEAN DEFAULT false,
  foreign_key_reference TEXT,
  default_value TEXT,
  sample_values TEXT[],
  data_classification VARCHAR(50),
  pii_flag BOOLEAN DEFAULT false,
  sensitivity_level VARCHAR(50),
  business_owner VARCHAR(255),
  technical_owner VARCHAR(255),
  steward VARCHAR(255),
  source_system VARCHAR(100),
  source_process VARCHAR(255),
  data_quality_rules JSONB DEFAULT '[]',
  transformations_applied TEXT,
  valid_from DATE,
  valid_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "data_catalog_select" ON data_catalog;
CREATE POLICY "data_catalog_select" ON data_catalog FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "data_catalog_insert" ON data_catalog;
CREATE POLICY "data_catalog_insert" ON data_catalog FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "data_catalog_update" ON data_catalog;
CREATE POLICY "data_catalog_update" ON data_catalog FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE data_catalog ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS data_quality_checks (
  check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_table VARCHAR(255) NOT NULL,
  target_column VARCHAR(255),
  check_type VARCHAR(50) NOT NULL,
  check_expression TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning',
  is_active BOOLEAN DEFAULT true,
  schedule_cron VARCHAR(100),
  last_run_timestamp TIMESTAMPTZ,
  last_run_result VARCHAR(20),
  last_run_failure_count INTEGER,
  last_run_total_count INTEGER,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "dq_checks_select" ON data_quality_checks;
CREATE POLICY "dq_checks_select" ON data_quality_checks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dq_checks_insert" ON data_quality_checks;
CREATE POLICY "dq_checks_insert" ON data_quality_checks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dq_checks_update" ON data_quality_checks;
CREATE POLICY "dq_checks_update" ON data_quality_checks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE data_quality_checks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS business_glossary (
  term_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term VARCHAR(255) NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  synonyms TEXT[],
  related_terms TEXT[],
  category VARCHAR(100),
  business_domain VARCHAR(100),
  examples TEXT,
  usage_notes TEXT,
  owner VARCHAR(255),
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "glossary_select" ON business_glossary;
CREATE POLICY "glossary_select" ON business_glossary FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "glossary_insert" ON business_glossary;
CREATE POLICY "glossary_insert" ON business_glossary FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "glossary_update" ON business_glossary;
CREATE POLICY "glossary_update" ON business_glossary FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE business_glossary ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO kpi_definitions (name, code, description, category, calculation_formula, unit_of_measure, target_value, direction, frequency) VALUES
('Total Revenue', 'REVENUE_TOTAL', 'Total revenue across all sales channels', 'Financial', 'SUM(fact_sales.total_amount)', 'INR', 10000000, 'higher_better', 'daily'),
('Customer Acquisition Cost', 'CAC', 'Average cost to acquire a new customer', 'Marketing', 'marketing_spend / new_customers', 'INR', 5000, 'lower_better', 'monthly'),
('Customer Lifetime Value', 'CLV', 'Predicted lifetime value of customers', 'Customer', 'avg_order_value * purchase_frequency * customer_lifespan', 'INR', 50000, 'higher_better', 'monthly'),
('Monthly Recurring Revenue', 'MRR', 'Monthly recurring revenue from subscriptions', 'Financial', 'SUM(subscriptions.monthly_amount)', 'INR', 2000000, 'higher_better', 'monthly'),
('Gross Profit Margin', 'GROSS_MARGIN', 'Gross profit as percentage of revenue', 'Financial', '(revenue - cogs) / revenue * 100', 'Percent', 40, 'higher_better', 'monthly'),
('Net Promoter Score', 'NPS', 'Customer loyalty and satisfaction metric', 'Customer', 'promoters - detractors', 'Score', 50, 'higher_better', 'monthly'),
('Lead Conversion Rate', 'LEAD_CONVERSION', 'Percentage of leads converted to customers', 'Sales', 'converted_leads / total_leads * 100', 'Percent', 25, 'higher_better', 'daily'),
('Average Order Value', 'AOV', 'Average value per order', 'Sales', 'total_revenue / total_orders', 'INR', 15000, 'higher_better', 'daily'),
('Customer Churn Rate', 'CHURN_RATE', 'Percentage of customers lost', 'Customer', 'churned_customers / total_customers * 100', 'Percent', 5, 'lower_better', 'monthly'),
('Employee Productivity', 'EMP_PRODUCTIVITY', 'Revenue per employee', 'Operations', 'total_revenue / employee_count', 'INR', 500000, 'higher_better', 'monthly'),
('AI Cost Efficiency', 'AI_COST_EFF', 'Cost per AI transaction', 'Operations', 'total_ai_cost / ai_transactions', 'INR', 0.5, 'lower_better', 'daily'),
('Support Resolution Time', 'SUPPORT_RES_TIME', 'Average time to resolve support tickets', 'Support', 'AVG(resolution_time_hours)', 'Hours', 24, 'lower_better', 'daily')
ON CONFLICT (code) DO NOTHING;

INSERT INTO anomaly_detection_rules (name, description, metric_name, detection_method, parameters, threshold_warning, threshold_critical, lookback_period_days) VALUES
('Revenue Drop Alert', 'Detect significant drops in daily revenue', 'daily_revenue', 'statistical', '{"stddev_threshold": 2}', 10, 20, 30),
('Lead Conversion Spike', 'Detect unusual spike in lead conversion', 'lead_conversion_rate', 'threshold', '{"upper_threshold": 50}', 50, 75, 30),
('Support Ticket Surge', 'Detect unusual increase in support tickets', 'daily_tickets', 'statistical', '{"stddev_threshold": 3}', 50, 100, 14),
('AI Cost Anomaly', 'Detect unusual AI cost patterns', 'daily_ai_cost', 'percentage_change', '{"change_threshold": 25}', 25, 50, 7)
ON CONFLICT DO NOTHING;

INSERT INTO business_glossary (term, definition, category, business_domain, synonyms, status) VALUES
('Revenue', 'Total income generated from business operations before any deductions', 'Financial', 'Finance', ARRAY['Sales', 'Income', 'Turnover'], 'approved'),
('MRR', 'Monthly Recurring Revenue - predictable monthly revenue from subscriptions', 'Financial', 'Finance', ARRAY['Monthly Revenue', 'Recurring Revenue'], 'approved'),
('Churn', 'Rate at which customers stop doing business with the company', 'Customer', 'Customer Success', ARRAY['Attrition', 'Turnover'], 'approved'),
('CAC', 'Customer Acquisition Cost - total cost to acquire a new customer', 'Marketing', 'Marketing', ARRAY['Acquisition Cost'], 'approved'),
('CLV', 'Customer Lifetime Value - predicted total value of a customer relationship', 'Customer', 'Finance', ARRAY['LTV', 'Customer Value'], 'approved'),
('ARR', 'Annual Recurring Revenue - yearly recurring revenue from subscriptions', 'Financial', 'Finance', ARRAY['Annual Revenue'], 'approved'),
('Gross Margin', 'Revenue minus cost of goods sold, expressed as percentage', 'Financial', 'Finance', ARRAY['Gross Profit'], 'approved'),
('NPS', 'Net Promoter Score - measures customer loyalty and satisfaction', 'Customer', 'Customer Success', ARRAY['Customer Satisfaction'], 'approved')
ON CONFLICT (term) DO NOTHING;

-- Create triggers for updated_at (safe creation)
DO $$ BEGIN
CREATE TRIGGER update_dim_customer_updated_at BEFORE UPDATE ON dim_customer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_dim_employee_updated_at BEFORE UPDATE ON dim_employee FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_dim_service_updated_at BEFORE UPDATE ON dim_service FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_dim_branch_updated_at BEFORE UPDATE ON dim_branch FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_etl_pipelines_updated_at BEFORE UPDATE ON etl_pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_kpi_definitions_updated_at BEFORE UPDATE ON kpi_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_predictive_models_updated_at BEFORE UPDATE ON predictive_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_anomaly_rules_updated_at BEFORE UPDATE ON anomaly_detection_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_report_def_updated_at BEFORE UPDATE ON report_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_report_sched_updated_at BEFORE UPDATE ON report_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_dashboard_def_updated_at BEFORE UPDATE ON dashboard_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_data_catalog_updated_at BEFORE UPDATE ON data_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_dq_checks_updated_at BEFORE UPDATE ON data_quality_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_glossary_updated_at BEFORE UPDATE ON business_glossary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_date_bi ON kpi_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_kpi_bi ON kpi_snapshots(kpi_id);
CREATE INDEX IF NOT EXISTS idx_forecast_results_date_bi ON forecast_results(target_date);
CREATE INDEX IF NOT EXISTS idx_forecast_results_model_bi ON forecast_results(model_id);
CREATE INDEX IF NOT EXISTS idx_detected_anomalies_date_bi ON detected_anomalies(detection_timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_insights_timestamp_bi ON ai_business_insights(detection_timestamp);