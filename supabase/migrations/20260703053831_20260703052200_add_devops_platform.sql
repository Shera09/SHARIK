-- Enterprise DevOps Platform Tables

-- Infrastructure Resources
CREATE TABLE IF NOT EXISTS infrastructure_resources (
  resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_name TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('server', 'container', 'database', 'cache', 'queue', 'storage', 'cdn', 'load_balancer', 'api_gateway', 'ai_cluster')),
  provider TEXT CHECK (provider IN ('aws', 'azure', 'gcp', 'private', 'hybrid')),
  region TEXT,
  availability_zone TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('pending', 'running', 'stopped', 'degraded', 'failed', 'maintenance')),
  cpu_cores INTEGER,
  memory_gb DECIMAL(10,2),
  storage_gb DECIMAL(10,2),
  ip_address TEXT,
  endpoint_url TEXT,
  environment TEXT CHECK (environment IN ('development', 'qa', 'staging', 'pre-production', 'production', 'dr')),
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infra_resources_type ON infrastructure_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_infra_resources_status ON infrastructure_resources(status);
CREATE INDEX IF NOT EXISTS idx_infra_resources_env ON infrastructure_resources(environment);

-- Infrastructure Metrics
CREATE TABLE IF NOT EXISTS infrastructure_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES infrastructure_resources(resource_id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  unit TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infra_metrics_resource ON infrastructure_metrics(resource_id);
CREATE INDEX IF NOT EXISTS idx_infra_metrics_time ON infrastructure_metrics(recorded_at);

-- Deployments
CREATE TABLE IF NOT EXISTS deployments (
  deployment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_name TEXT NOT NULL,
  version TEXT NOT NULL,
  environment TEXT NOT NULL,
  deployment_type TEXT CHECK (deployment_type IN ('rolling', 'blue_green', 'canary', 'recreate')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'verifying', 'success', 'failed', 'rolled_back')),
  commit_sha TEXT,
  branch TEXT,
  triggered_by TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  rollback_from UUID REFERENCES deployments(deployment_id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_app ON deployments(application_name);
CREATE INDEX IF NOT EXISTS idx_deployments_env ON deployments(environment);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_time ON deployments(started_at);

-- Deployment Steps
CREATE TABLE IF NOT EXISTS deployment_steps (
  step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID REFERENCES deployments(deployment_id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  output TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_deployment_steps_dep ON deployment_steps(deployment_id);

-- Build Pipeline Runs
CREATE TABLE IF NOT EXISTS pipeline_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_name TEXT NOT NULL,
  trigger_type TEXT CHECK (trigger_type IN ('push', 'manual', 'schedule', 'api')),
  branch TEXT,
  commit_sha TEXT,
  commit_message TEXT,
  triggered_by TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_name ON pipeline_runs(pipeline_name);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_time ON pipeline_runs(started_at);

-- Pipeline Stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  stage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES pipeline_runs(run_id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  logs TEXT
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_run ON pipeline_stages(run_id);

-- Monitoring Alerts
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('infrastructure', 'application', 'security', 'performance', 'cost', 'backup', 'ai', 'custom')),
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  resource_id UUID REFERENCES infrastructure_resources(resource_id) ON DELETE SET NULL,
  metric_name TEXT,
  threshold_value DECIMAL(15,4),
  current_value DECIMAL(15,4),
  condition TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'firing' CHECK (status IN ('firing', 'resolved', 'acknowledged', 'silenced')),
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  labels JSONB DEFAULT '{}',
  annotations JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_type ON monitoring_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_status ON monitoring_alerts(status);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_time ON monitoring_alerts(triggered_at);

-- Alert Rules
CREATE TABLE IF NOT EXISTS alert_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  threshold_value DECIMAL(15,4) NOT NULL,
  duration_minutes INTEGER DEFAULT 5,
  severity TEXT NOT NULL,
  notification_channels JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Logs
CREATE TABLE IF NOT EXISTS application_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  environment TEXT NOT NULL,
  log_level TEXT CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  message TEXT NOT NULL,
  stack_trace TEXT,
  request_id TEXT,
  user_id UUID,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_logs_service ON application_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON application_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_app_logs_time ON application_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_app_logs_env ON application_logs(environment);

-- Audit Logs (Infrastructure)
CREATE TABLE IF NOT EXISTS infrastructure_audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES infrastructure_resources(resource_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor TEXT,
  ip_address TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infra_audit_resource ON infrastructure_audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_infra_audit_time ON infrastructure_audit_logs(created_at);

-- Backups
CREATE TABLE IF NOT EXISTS backups (
  backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT CHECK (backup_type IN ('full', 'incremental', ' differential')),
  backup_target TEXT NOT NULL CHECK (backup_target IN ('database', 'storage', 'ai_models', 'configurations', 'secrets', 'full_system')),
  environment TEXT,
  storage_location TEXT,
  size_bytes BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'verifying')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  is_encrypted BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 30,
  expires_at TIMESTAMPTZ,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_backups_type ON backups(backup_type);
CREATE INDEX IF NOT EXISTS idx_backups_target ON backups(backup_target);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_time ON backups(started_at);

-- Disaster Recovery Plans
CREATE TABLE IF NOT EXISTS disaster_recovery_plans (
  plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('failover', 'failback', 'region_migration', 'full_recovery')),
  rto_minutes INTEGER NOT NULL,
  rpo_minutes INTEGER NOT NULL,
  target_environment TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  last_success BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DR Runbooks
CREATE TABLE IF NOT EXISTS dr_runbooks (
  runbook_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES disaster_recovery_plans(plan_id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  estimated_duration_minutes INTEGER,
  required_approvals INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Tracking
CREATE TABLE IF NOT EXISTS infrastructure_costs (
  cost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES infrastructure_resources(resource_id) ON DELETE SET NULL,
  resource_name TEXT,
  provider TEXT,
  service_type TEXT,
  cost_date DATE NOT NULL,
  cost_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  usage_quantity DECIMAL(15,4),
  usage_unit TEXT,
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infra_costs_resource ON infrastructure_costs(resource_id);
CREATE INDEX IF NOT EXISTS idx_infra_costs_date ON infrastructure_costs(cost_date);

-- Cost Budgets
CREATE TABLE IF NOT EXISTS cost_budgets (
  budget_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_name TEXT NOT NULL,
  budget_type TEXT CHECK (budget_type IN ('monthly', 'quarterly', 'annually')),
  budget_amount DECIMAL(12,2) NOT NULL,
  alert_threshold_percent INTEGER DEFAULT 80,
  current_spend DECIMAL(12,2) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percent INTEGER DEFAULT 0 CHECK (rollout_percent >= 0 AND rollout_percent <= 100),
  target_environments TEXT[] DEFAULT '{}',
  target_users TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Windows
CREATE TABLE IF NOT EXISTS maintenance_windows (
  window_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  environment TEXT,
  resources_affected TEXT[] DEFAULT '{}',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'failed')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_time ON maintenance_windows(scheduled_start);

-- Enable RLS
ALTER TABLE infrastructure_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_recovery_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dr_runbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for infrastructure_resources
CREATE POLICY "select_all_resources" ON infrastructure_resources FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_resources_admin" ON infrastructure_resources FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_resources_admin" ON infrastructure_resources FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for monitoring_alerts
CREATE POLICY "select_all_alerts" ON monitoring_alerts FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_alerts_service" ON monitoring_alerts FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_alerts" ON monitoring_alerts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for deployments
CREATE POLICY "select_all_deployments" ON deployments FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_deployments" ON deployments FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_deployments" ON deployments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for backups
CREATE POLICY "select_all_backups" ON backups FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_backups" ON backups FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_backups" ON backups FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for feature_flags
CREATE POLICY "select_all_flags" ON feature_flags FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_flags" ON feature_flags FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_flags" ON feature_flags FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Insert default infrastructure resources for demo
INSERT INTO infrastructure_resources (resource_name, resource_type, provider, region, status, environment) VALUES
('prod-api-gateway', 'api_gateway', 'aws', 'us-east-1', 'running', 'production'),
('prod-app-cluster', 'server', 'aws', 'us-east-1', 'running', 'production'),
('prod-db-primary', 'database', 'aws', 'us-east-1', 'running', 'production'),
('prod-db-replica', 'database', 'aws', 'us-east-1', 'running', 'production'),
('prod-cache', 'cache', 'aws', 'us-east-1', 'running', 'production'),
('prod-queue', 'queue', 'aws', 'us-east-1', 'running', 'production'),
('prod-ai-cluster', 'ai_cluster', 'aws', 'us-east-1', 'running', 'production'),
('prod-storage', 'storage', 'aws', 'us-east-1', 'running', 'production'),
('prod-cdn', 'cdn', 'aws', 'global', 'running', 'production'),
('dr-api-gateway', 'api_gateway', 'aws', 'us-west-2', 'stopped', 'dr'),
('dr-db-replica', 'database', 'aws', 'us-west-2', 'running', 'dr'),
('staging-app', 'server', 'aws', 'us-east-1', 'running', 'staging'),
('staging-db', 'database', 'aws', 'us-east-1', 'running', 'staging')
ON CONFLICT DO NOTHING;
