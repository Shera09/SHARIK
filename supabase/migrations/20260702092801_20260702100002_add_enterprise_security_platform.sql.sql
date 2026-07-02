/*
# WebHoster AI Business OS — Enterprise Security Platform
Extends existing security infrastructure with comprehensive enterprise features
*/

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE auth_method AS ENUM ('password', 'mfa_totp', 'mfa_sms', 'mfa_email', 'passkey', 'sso', 'social', 'api_key');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('active', 'expired', 'terminated', 'locked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE threat_severity_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_status_type AS ENUM ('open', 'investigating', 'contained', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_priority_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_phase_type AS ENUM ('detection', 'classification', 'assignment', 'investigation', 'containment', 'recovery', 'post_incident', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE backup_status_type AS ENUM ('pending', 'running', 'completed', 'failed', 'verified');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE backup_type_enum AS ENUM ('full', 'incremental', 'differential');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_status_type AS ENUM ('compliant', 'non_compliant', 'partial', 'pending_review', 'exempt');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- SECURITY USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS security_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  department text,
  job_title text,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  tenant_id uuid,
  
  password_hash text,
  password_changed_at timestamptz,
  password_expires_at timestamptz,
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamptz,
  lockout_reason text,
  
  mfa_enabled boolean DEFAULT false,
  mfa_method text,
  mfa_secret_encrypted text,
  mfa_verified_at timestamptz,
  
  passkey_enabled boolean DEFAULT false,
  webauthn_credentials jsonb DEFAULT '[]',
  
  sso_provider text,
  sso_id text,
  
  status text NOT NULL DEFAULT 'active',
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  
  preferred_auth_method auth_method DEFAULT 'password',
  trusted_devices jsonb DEFAULT '[]',
  security_questions jsonb DEFAULT '[]',
  password_history jsonb DEFAULT '[]',
  
  last_login_at timestamptz,
  last_login_ip text,
  last_login_location text,
  last_login_user_agent text,
  last_activity_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE security_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_users_all_policy" ON security_users;
CREATE POLICY "sec_users_all_policy" ON security_users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_sec_users_email ON security_users(email);
CREATE INDEX IF NOT EXISTS idx_sec_users_status ON security_users(status);

-- ============================================================
-- SECURITY SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS security_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES security_users(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,
  refresh_token_hash text,
  
  ip_address text,
  user_agent text,
  device_fingerprint text,
  device_name text,
  device_type text,
  os text,
  browser text,
  location_city text,
  location_country text,
  geolocation jsonb,
  
  status session_status DEFAULT 'active',
  is_trusted_device boolean DEFAULT false,
  requires_mfa boolean DEFAULT false,
  mfa_completed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  terminated_at timestamptz,
  terminated_by uuid,
  termination_reason text,
  
  risk_score integer DEFAULT 0,
  risk_factors jsonb DEFAULT '[]'
);

ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_sessions_all_policy" ON security_sessions;
CREATE POLICY "sec_sessions_all_policy" ON security_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_sec_sessions_user ON security_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sec_sessions_status ON security_sessions(status);

-- ============================================================
-- USER ROLE ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES security_users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  
  tenant_id uuid,
  branch_id uuid,
  department_id text,
  
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  
  granted_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now(),
  
  is_active boolean DEFAULT true,
  revoked_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  revoke_reason text,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, role_id)
);

ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_role_assign_all_policy" ON user_role_assignments;
CREATE POLICY "user_role_assign_all_policy" ON user_role_assignments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SECURITY AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  actor_id uuid REFERENCES security_users(id) ON DELETE SET NULL,
  actor_email text,
  actor_name text,
  actor_role text,
  actor_ip text,
  actor_user_agent text,
  
  action text NOT NULL,
  action_category text NOT NULL,
  action_type text NOT NULL,
  action_result text,
  
  target_type text,
  target_id uuid,
  target_name text,
  
  description text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changes jsonb,
  
  session_id uuid,
  api_key_id uuid,
  request_id text,
  http_method text,
  http_path text,
  http_status integer,
  
  ip_address text,
  location_city text,
  location_country text,
  geolocation jsonb,
  
  risk_score integer DEFAULT 0,
  risk_factors jsonb DEFAULT '[]',
  is_sensitive boolean DEFAULT false,
  is_anonymized boolean DEFAULT false,
  
  tenant_id uuid,
  metadata jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now()
);

ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_audit_all_policy" ON security_audit_log;
CREATE POLICY "sec_audit_all_policy" ON security_audit_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_sec_audit_actor ON security_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_sec_audit_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_sec_audit_category ON security_audit_log(action_category);
CREATE INDEX IF NOT EXISTS idx_sec_audit_created ON security_audit_log(created_at DESC);

-- ============================================================
-- SECURITY INCIDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  incident_number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  incident_type text NOT NULL,
  severity incident_priority_level NOT NULL,
  
  phase incident_phase_type DEFAULT 'detection',
  status incident_status_type DEFAULT 'open',
  
  detected_at timestamptz DEFAULT now(),
  detected_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  detection_method text,
  first_affected_at timestamptz,
  
  category text,
  subcategory text,
  
  impact_scope text,
  impact_description text,
  affected_systems jsonb DEFAULT '[]',
  affected_users jsonb DEFAULT '[]',
  affected_data_types jsonb DEFAULT '[]',
  data_records_affected integer DEFAULT 0,
  
  assigned_to uuid REFERENCES security_users(id) ON DELETE SET NULL,
  assigned_at timestamptz,
  team_assigned text,
  
  containment_started_at timestamptz,
  containment_completed_at timestamptz,
  containment_actions jsonb DEFAULT '[]',
  
  recovery_started_at timestamptz,
  recovery_completed_at timestamptz,
  recovery_actions jsonb DEFAULT '[]',
  
  root_cause text,
  contributing_factors jsonb DEFAULT '[]',
  
  lessons_learned text,
  recommendations jsonb DEFAULT '[]',
  follow_up_tasks jsonb DEFAULT '[]',
  
  timeline jsonb DEFAULT '[]',
  
  resolved_at timestamptz,
  resolved_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  closed_at timestamptz,
  closed_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  closure_notes text,
  
  time_to_detect integer,
  time_to_contain integer,
  time_to_resolve integer,
  
  related_events jsonb DEFAULT '[]',
  related_incidents jsonb DEFAULT '[]',
  
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_incidents_all_policy" ON security_incidents;
CREATE POLICY "sec_incidents_all_policy" ON security_incidents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_incidents_number ON security_incidents(incident_number);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON security_incidents(severity);

-- ============================================================
-- COMPLIANCE FRAMEWORKS
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  version text,
  
  framework_type text,
  jurisdiction text,
  authority text,
  
  requirements jsonb NOT NULL DEFAULT '[]',
  controls jsonb NOT NULL DEFAULT '[]',
  control_mappings jsonb DEFAULT '{}',
  
  assessment_frequency text,
  last_assessment_at timestamptz,
  next_assessment_at timestamptz,
  
  is_active boolean DEFAULT true,
  is_mandatory boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comp_fw_all_policy" ON compliance_frameworks;
CREATE POLICY "comp_fw_all_policy" ON compliance_frameworks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- COMPLIANCE ASSESSMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  tenant_id uuid,
  
  assessment_date date NOT NULL,
  assessed_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  assessment_method text,
  
  overall_status compliance_status_type DEFAULT 'pending_review',
  compliance_score integer,
  
  controls_assessed integer DEFAULT 0,
  controls_passed integer DEFAULT 0,
  controls_failed integer DEFAULT 0,
  controls_not_applicable integer DEFAULT 0,
  control_results jsonb DEFAULT '[]',
  
  findings jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  
  remediation_plan jsonb DEFAULT '[]',
  remediation_deadline date,
  
  evidence jsonb DEFAULT '[]',
  documentation text,
  
  status text DEFAULT 'in_progress',
  
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comp_assess_all_policy" ON compliance_assessments;
CREATE POLICY "comp_assess_all_policy" ON compliance_assessments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_comp_assessments_date ON compliance_assessments(assessment_date DESC);

-- ============================================================
-- PRIVACY SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid UNIQUE,
  
  data_retention_days integer DEFAULT 365,
  audit_log_retention_days integer DEFAULT 2555,
  ai_conversation_retention_days integer DEFAULT 90,
  document_retention_days integer DEFAULT 2555,
  deleted_data_retention_days integer DEFAULT 30,
  
  consent_required boolean DEFAULT true,
  consent_version text,
  default_consent_preferences jsonb DEFAULT '{}',
  
  ai_data_usage_allowed boolean DEFAULT true,
  ai_model_training_allowed boolean DEFAULT false,
  analytics_tracking_allowed boolean DEFAULT true,
  third_party_sharing_allowed boolean DEFAULT false,
  
  allow_data_export boolean DEFAULT true,
  allow_data_deletion boolean DEFAULT true,
  allow_data_correction boolean DEFAULT true,
  deletion_requires_approval boolean DEFAULT true,
  
  auto_anonymize_days integer,
  anonymization_method text,
  
  allow_cross_border_transfer boolean DEFAULT false,
  approved_destinations jsonb DEFAULT '[]',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "privacy_all_policy" ON privacy_settings;
CREATE POLICY "privacy_all_policy" ON privacy_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- DATA SUBJECT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  
  request_type text NOT NULL,
  request_method text,
  
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  requester_verification jsonb,
  is_verified boolean DEFAULT false,
  
  subject_user_id uuid REFERENCES security_users(id) ON DELETE SET NULL,
  subject_email text NOT NULL,
  
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES security_users(id) ON DELETE SET NULL,
  
  requested_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  processing_started_at timestamptz,
  completed_at timestamptz,
  deadline timestamptz,
  
  response_type text,
  response_data jsonb,
  response_notes text,
  
  rejection_reason text,
  rejection_details text,
  
  audit_trail jsonb DEFAULT '[]',
  
  tenant_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dsr_all_policy" ON data_subject_requests;
CREATE POLICY "dsr_all_policy" ON data_subject_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_dsr_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_dsr_deadline ON data_subject_requests(deadline);

-- ============================================================
-- AI SECURITY SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid UNIQUE,
  
  prompt_injection_detection boolean DEFAULT true,
  prompt_injection_threshold integer DEFAULT 50,
  prompt_injection_action text DEFAULT 'block',
  
  sensitive_data_filtering boolean DEFAULT true,
  sensitive_data_patterns jsonb DEFAULT '[]',
  pii_detection_enabled boolean DEFAULT true,
  pci_detection_enabled boolean DEFAULT true,
  
  output_validation_enabled boolean DEFAULT true,
  output_filters jsonb DEFAULT '[]',
  max_response_length integer DEFAULT 10000,
  
  context_validation_enabled boolean DEFAULT true,
  max_context_age_minutes integer DEFAULT 60,
  context_encryption_enabled boolean DEFAULT true,
  
  allowed_models jsonb DEFAULT '[]',
  blocked_models jsonb DEFAULT '[]',
  model_fallback_enabled boolean DEFAULT true,
  
  ai_rate_limit_per_minute integer DEFAULT 60,
  ai_rate_limit_per_hour integer DEFAULT 1000,
  ai_rate_limit_per_day integer DEFAULT 10000,
  
  log_all_ai_requests boolean DEFAULT true,
  log_sensitive_content boolean DEFAULT false,
  
  permission_checking_enabled boolean DEFAULT true,
  cross_tenant_isolation boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_security_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_sec_all_policy" ON ai_security_settings;
CREATE POLICY "ai_sec_all_policy" ON ai_security_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- AI SECURITY EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type text NOT NULL,
  severity text NOT NULL,
  
  user_id uuid REFERENCES security_users(id) ON DELETE SET NULL,
  session_id uuid,
  request_id text,
  
  ai_agent_id uuid,
  model_used text,
  conversation_id uuid,
  message_id uuid,
  
  prompt_content text,
  prompt_hash text,
  detected_patterns jsonb DEFAULT '[]',
  matched_rules jsonb DEFAULT '[]',
  
  action_taken text,
  sanitized_content text,
  
  is_false_positive boolean DEFAULT false,
  reviewed_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  
  tenant_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_sec_events_all_policy" ON ai_security_events;
CREATE POLICY "ai_sec_events_all_policy" ON ai_security_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_ai_sec_events_type ON ai_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_sec_events_created ON ai_security_events(created_at DESC);

-- ============================================================
-- SECURITY BACKUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS security_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name text NOT NULL,
  description text,
  backup_type backup_type_enum NOT NULL,
  
  backup_scope text,
  tables_included jsonb DEFAULT '[]',
  tenant_id uuid,
  
  storage_type text,
  storage_path text NOT NULL,
  storage_encryption_key_id text,
  file_size_bytes bigint,
  compressed boolean DEFAULT true,
  encrypted boolean DEFAULT true,
  
  schedule_cron text,
  next_scheduled_at timestamptz,
  
  status backup_status_type DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  
  verified_at timestamptz,
  verified_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  verification_checksum text,
  verification_passed boolean,
  
  retention_days integer DEFAULT 30,
  delete_after timestamptz,
  
  rpo_minutes integer,
  rto_minutes integer,
  
  records_backed_up bigint,
  tables_backed_up integer,
  
  error_message text,
  retry_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES security_users(id) ON DELETE SET NULL
);

ALTER TABLE security_backups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_backups_all_policy" ON security_backups;
CREATE POLICY "sec_backups_all_policy" ON security_backups FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_sec_backups_status ON security_backups(status);

-- ============================================================
-- SECURITY RESTORE LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS security_restore_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id uuid REFERENCES security_backups(id) ON DELETE SET NULL,
  
  status backup_status_type DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  
  restore_point timestamptz,
  tables_restored jsonb DEFAULT '[]',
  overwrite_existing boolean DEFAULT false,
  
  records_restored bigint,
  tables_restored_count integer,
  validation_passed boolean,
  validation_errors jsonb DEFAULT '[]',
  
  initiated_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES security_users(id) ON DELETE SET NULL,
  
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE security_restore_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_restore_all_policy" ON security_restore_log;
CREATE POLICY "sec_restore_all_policy" ON security_restore_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- CERTIFICATE MANAGEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS security_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name text NOT NULL,
  description text,
  certificate_type text,
  
  subject_dn text NOT NULL,
  issuer_dn text NOT NULL,
  serial_number text NOT NULL,
  public_key_algorithm text,
  signature_algorithm text,
  
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  is_expired boolean DEFAULT false,
  is_self_signed boolean DEFAULT false,
  
  certificate_pem text,
  chain_pem text,
  
  deployed_to jsonb DEFAULT '[]',
  domains jsonb DEFAULT '[]',
  
  auto_renew boolean DEFAULT true,
  renewal_days_before integer DEFAULT 30,
  last_renewed_at timestamptz,
  next_renewal_at timestamptz,
  
  status text DEFAULT 'active',
  
  alert_sent_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES security_users(id) ON DELETE SET NULL
);

ALTER TABLE security_certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_certs_all_policy" ON security_certificates;
CREATE POLICY "sec_certs_all_policy" ON security_certificates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_sec_certs_valid_until ON security_certificates(valid_until);
CREATE INDEX IF NOT EXISTS idx_sec_certs_status ON security_certificates(status);

-- ============================================================
-- DOCUMENT SECURITY SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL UNIQUE,
  
  access_level text DEFAULT 'restricted',
  allowed_users jsonb DEFAULT '[]',
  allowed_roles jsonb DEFAULT '[]',
  
  share_enabled boolean DEFAULT false,
  share_expiry timestamptz,
  share_password text,
  share_link_hash text UNIQUE,
  share_access_count integer DEFAULT 0,
  share_max_access integer,
  
  download_allowed boolean DEFAULT true,
  print_allowed boolean DEFAULT true,
  copy_allowed boolean DEFAULT true,
  edit_allowed boolean DEFAULT false,
  
  watermark_enabled boolean DEFAULT false,
  watermark_text text,
  watermark_position text DEFAULT 'diagonal',
  
  version_locked boolean DEFAULT false,
  max_versions integer DEFAULT 10,
  
  encrypted boolean DEFAULT true,
  encryption_key_id text,
  requires_mfa boolean DEFAULT false,
  
  access_log_enabled boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES security_users(id) ON DELETE SET NULL
);

ALTER TABLE document_security_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doc_sec_all_policy" ON document_security_settings;
CREATE POLICY "doc_sec_all_policy" ON document_security_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- DOCUMENT ACCESS LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS document_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  
  user_id uuid REFERENCES security_users(id) ON DELETE SET NULL,
  access_type text NOT NULL,
  
  session_id uuid,
  ip_address text,
  user_agent text,
  
  share_link_hash text,
  is_external_access boolean DEFAULT false,
  
  access_granted boolean DEFAULT true,
  denial_reason text,
  
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doc_access_all_policy" ON document_access_log;
CREATE POLICY "doc_access_all_policy" ON document_access_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_doc_access_document ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_created ON document_access_log(created_at DESC);

-- ============================================================
-- THREAT INTELLIGENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS threat_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  indicator_type text NOT NULL,
  indicator_value text NOT NULL,
  indicator_hash text UNIQUE NOT NULL,
  
  threat_type text,
  threat_family text,
  
  confidence_score integer,
  source text,
  source_reliability text,
  
  description text,
  tags jsonb DEFAULT '[]',
  ext_references jsonb DEFAULT '[]',
  
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  expires_at timestamptz,
  
  is_active boolean DEFAULT true,
  is_false_positive boolean DEFAULT false,
  
  recommended_action text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "threat_intel_all_policy" ON threat_intelligence;
CREATE POLICY "threat_intel_all_policy" ON threat_intelligence FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_threat_intel_hash ON threat_intelligence(indicator_hash);
CREATE INDEX IF NOT EXISTS idx_threat_intel_active ON threat_intelligence(is_active);

-- ============================================================
-- SECURITY METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS security_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  tenant_id uuid,
  
  total_logins integer DEFAULT 0,
  successful_logins integer DEFAULT 0,
  failed_logins integer DEFAULT 0,
  unique_users_logged_in integer DEFAULT 0,
  mfa_verifications integer DEFAULT 0,
  mfa_failures integer DEFAULT 0,
  
  active_sessions integer DEFAULT 0,
  peak_concurrent_sessions integer DEFAULT 0,
  avg_session_duration_minutes integer DEFAULT 0,
  sessions_terminated integer DEFAULT 0,
  
  security_events_total integer DEFAULT 0,
  security_events_critical integer DEFAULT 0,
  security_events_high integer DEFAULT 0,
  security_events_medium integer DEFAULT 0,
  security_events_low integer DEFAULT 0,
  events_blocked integer DEFAULT 0,
  false_positives integer DEFAULT 0,
  
  incidents_opened integer DEFAULT 0,
  incidents_closed integer DEFAULT 0,
  incidents_critical integer DEFAULT 0,
  avg_time_to_detect integer,
  avg_time_to_contain integer,
  avg_time_to_resolve integer,
  
  api_requests_total bigint DEFAULT 0,
  api_requests_blocked integer DEFAULT 0,
  api_rate_limit_hits integer DEFAULT 0,
  api_key_usage integer DEFAULT 0,
  
  ai_requests_total integer DEFAULT 0,
  ai_requests_blocked integer DEFAULT 0,
  prompt_injection_attempts integer DEFAULT 0,
  sensitive_data_filtered integer DEFAULT 0,
  
  compliance_score integer,
  assessments_completed integer DEFAULT 0,
  findings_open integer DEFAULT 0,
  
  backups_completed integer DEFAULT 0,
  backups_failed integer DEFAULT 0,
  restores_completed integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(metric_date, tenant_id)
);

ALTER TABLE security_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_metrics_all_policy" ON security_metrics;
CREATE POLICY "sec_metrics_all_policy" ON security_metrics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_sec_metrics_date ON security_metrics(metric_date DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS trg_sec_users_updated ON security_users;
CREATE TRIGGER trg_sec_users_updated BEFORE UPDATE ON security_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sec_incidents_updated ON security_incidents;
CREATE TRIGGER trg_sec_incidents_updated BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_comp_frameworks_updated ON compliance_frameworks;
CREATE TRIGGER trg_comp_frameworks_updated BEFORE UPDATE ON compliance_frameworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_privacy_settings_updated ON privacy_settings;
CREATE TRIGGER trg_privacy_settings_updated BEFORE UPDATE ON privacy_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ai_sec_updated ON ai_security_settings;
CREATE TRIGGER trg_ai_sec_updated BEFORE UPDATE ON ai_security_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sec_certs_updated ON security_certificates;
CREATE TRIGGER trg_sec_certs_updated BEFORE UPDATE ON security_certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_doc_sec_updated ON document_security_settings;
CREATE TRIGGER trg_doc_sec_updated BEFORE UPDATE ON document_security_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_threat_intel_updated ON threat_intelligence;
CREATE TRIGGER trg_threat_intel_updated BEFORE UPDATE ON threat_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO compliance_frameworks (name, display_name, description, framework_type, jurisdiction, requirements, controls) VALUES
('gdpr', 'GDPR - General Data Protection Regulation', 'European Union data protection regulation', 'gdpr', 'EU', '[{"id": "art5", "title": "Principles relating to processing of personal data"}, {"id": "art6", "title": "Lawfulness of processing"}, {"id": "art7", "title": "Conditions for consent"}, {"id": "art15", "title": "Right of access by the data subject"}, {"id": "art17", "title": "Right to erasure"}, {"id": "art32", "title": "Security of processing"}]', '[{"id": "encrypt_data", "title": "Data encryption at rest and in transit"}, {"id": "access_control", "title": "Role-based access control"}, {"id": "audit_logging", "title": "Comprehensive audit logging"}, {"id": "consent_mgmt", "title": "Consent management system"}, {"id": "data_retention", "title": "Data retention policies"}, {"id": "breach_notification", "title": "72-hour breach notification"}]'),
('soc2', 'SOC 2 Type II', 'Service Organization Controls for security, availability, processing integrity, confidentiality, and privacy', 'soc2', 'US', '[{"id": "cc6.1", "title": "Logical and physical access controls"}, {"id": "cc6.2", "title": "System component boundaries"}, {"id": "cc6.3", "title": "Access control policies"}, {"id": "cc6.6", "title": "Transmission protection"}, {"id": "cc7.1", "title": "Threat detection"}, {"id": "cc7.2", "title": "Vulnerability management"}]', '[{"id": "access_reviews", "title": "Periodic access reviews"}, {"id": "change_mgmt", "title": "Change management process"}, {"id": "incident_response", "title": "Incident response plan"}, {"id": "vuln_scanning", "title": "Vulnerability scanning"}, {"id": "monitoring", "title": "Security monitoring"}, {"id": "backup", "title": "Backup and recovery"}]'),
('iso27001', 'ISO/IEC 27001:2022', 'Information Security Management System', 'iso27001', 'Global', '[{"id": "a.5.1", "title": "Policies for information security"}, {"id": "a.5.2", "title": "Information security roles and responsibilities"}, {"id": "a.5.3", "title": "Segregation of duties"}, {"id": "a.8.1", "title": "User endpoint devices"}, {"id": "a.8.2", "title": "Privileged access rights"}, {"id": "a.12.4", "title": "Logging and monitoring"}]', '[{"id": "ism_policy", "title": "Information security policy"}, {"id": "asset_mgmt", "title": "Asset management"}, {"id": "access_mgmt", "title": "Access management"}, {"id": "crypto", "title": "Cryptography controls"}, {"id": "ops_sec", "title": "Operational security"}, {"id": "compliance", "title": "Compliance monitoring"}]')
ON CONFLICT (name) DO NOTHING;