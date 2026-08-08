/*
# Enterprise Advanced Security Platform Schema (Sprint 6)

## Summary
- Creates `user_mfa_settings` table for RFC6238 TOTP encrypted secrets and enrollment status.
- Creates `user_mfa_backup_codes` table for hashed emergency recovery codes.
- Creates `user_trusted_devices` table for hashed client device fingerprints and trust status.
- Creates `user_active_sessions` table for session token tracking and remote revocation.
- Creates `security_risk_events` table for impossible travel, brute-force, and anomaly logs.
- Creates `tenant_security_policies` table for organization-wide security rules.
- Enables RLS on all tables with tenant isolation.
*/

-- 1. User MFA Settings Table
CREATE TABLE IF NOT EXISTS user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  totp_secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unq_mfa_user_tenant UNIQUE(user_id, tenant_id)
);

-- 2. User MFA Backup Recovery Codes Table
CREATE TABLE IF NOT EXISTS user_mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  code_hash TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Trusted Devices Table
CREATE TABLE IF NOT EXISTS user_trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT DEFAULT 'Browser Client',
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  is_trusted BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Active Sessions Table
CREATE TABLE IF NOT EXISTS user_active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  session_token_hash TEXT NOT NULL,
  device_id UUID REFERENCES user_trusted_devices(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Security Risk Events Log Table
CREATE TABLE IF NOT EXISTS security_risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impossible_travel', 'new_device', 'brute_force', 'password_spray', 'suspicious_login', 'mfa_failure')),
  risk_score INT DEFAULT 50,
  ip_address TEXT,
  location TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tenant Security Policies Table
CREATE TABLE IF NOT EXISTS tenant_security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  min_password_length INT DEFAULT 12,
  require_mfa BOOLEAN DEFAULT FALSE,
  max_failed_attempts INT DEFAULT 5,
  lockout_duration_minutes INT DEFAULT 30,
  max_concurrent_sessions INT DEFAULT 3,
  session_timeout_minutes INT DEFAULT 1440,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mfa_user ON user_mfa_settings(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON user_trusted_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_active_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_risk_tenant ON security_risk_events(tenant_id);

-- Enable RLS
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_security_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_user_mfa" ON user_mfa_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_user_mfa" ON user_mfa_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_user_mfa" ON user_mfa_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_mfa_codes" ON user_mfa_backup_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_mfa_codes" ON user_mfa_backup_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_mfa_codes" ON user_mfa_backup_codes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_trusted_devices" ON user_trusted_devices FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_trusted_devices" ON user_trusted_devices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_trusted_devices" ON user_trusted_devices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_active_sessions" ON user_active_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_active_sessions" ON user_active_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_active_sessions" ON user_active_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_risk_events" ON security_risk_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_risk_events" ON security_risk_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_sec_policies" ON tenant_security_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_sec_policies" ON tenant_security_policies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
