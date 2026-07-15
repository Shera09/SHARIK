/*
# Enterprise Auth Extensions

Add missing auth tables: auth_profiles, user_sessions, otp_codes, mfa_settings, password_resets, security_logs

Using existing tables: login_history, user_role_assignments
*/

-- Auth profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS auth_profiles (
  id uuid PRIMARY KEY,
  organization_id uuid,
  workspace_id uuid,
  full_name text,
  phone text,
  avatar_url text,
  job_title text,
  department text,
  timezone text DEFAULT 'Asia/Kolkata',
  locale text DEFAULT 'en',
  theme text DEFAULT 'system',
  theme_color text DEFAULT 'default',
  notifications_email boolean DEFAULT true,
  notifications_push boolean DEFAULT true,
  notifications_sms boolean DEFAULT false,
  last_login_at timestamptz,
  last_login_ip text,
  last_login_device text,
  onboarding_completed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text UNIQUE NOT NULL,
  device_name text,
  device_type text,
  browser text,
  os text,
  ip_address text,
  user_agent text,
  location_country text,
  location_city text,
  is_active boolean DEFAULT true,
  is_current boolean DEFAULT false,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- OTP codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  phone text,
  otp_code text NOT NULL,
  otp_type text DEFAULT 'email',
  purpose text NOT NULL,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '10 minutes'),
  verified_at timestamptz
);

-- MFA settings
CREATE TABLE IF NOT EXISTS mfa_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  mfa_enabled boolean DEFAULT false,
  mfa_type text DEFAULT 'email',
  totp_secret text,
  backup_codes jsonb DEFAULT '[]'::jsonb,
  trusted_devices jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Password resets
CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour')
);

-- Security logs
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_description text,
  ip_address text,
  user_agent text,
  severity text DEFAULT 'low',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Organization invitations
CREATE TABLE IF NOT EXISTS organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  workspace_id uuid,
  email text NOT NULL,
  role text DEFAULT 'employee',
  invited_by uuid,
  token text UNIQUE NOT NULL,
  accepted boolean DEFAULT false,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE auth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Auth profile policies
DROP POLICY IF EXISTS "profile_select_own" ON auth_profiles;
CREATE POLICY "profile_select_own" ON auth_profiles FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "profile_insert_own" ON auth_profiles;
CREATE POLICY "profile_insert_own" ON auth_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profile_update_own" ON auth_profiles;
CREATE POLICY "profile_update_own" ON auth_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User sessions policies
DROP POLICY IF EXISTS "session_select_own" ON user_sessions;
CREATE POLICY "session_select_own" ON user_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "session_insert_own" ON user_sessions;
CREATE POLICY "session_insert_own" ON user_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "session_update_own" ON user_sessions;
CREATE POLICY "session_update_own" ON user_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "session_delete_own" ON user_sessions;
CREATE POLICY "session_delete_own" ON user_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- OTP policies
DROP POLICY IF EXISTS "otp_select_own" ON otp_codes;
CREATE POLICY "otp_select_own" ON otp_codes FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "otp_insert_own" ON otp_codes;
CREATE POLICY "otp_insert_own" ON otp_codes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "otp_update_own" ON otp_codes;
CREATE POLICY "otp_update_own" ON otp_codes FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- MFA policies
DROP POLICY IF EXISTS "mfa_select_own" ON mfa_settings;
CREATE POLICY "mfa_select_own" ON mfa_settings FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "mfa_insert_own" ON mfa_settings;
CREATE POLICY "mfa_insert_own" ON mfa_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "mfa_update_own" ON mfa_settings;
CREATE POLICY "mfa_update_own" ON mfa_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Password reset policies
DROP POLICY IF EXISTS "reset_select_own" ON password_resets;
CREATE POLICY "reset_select_own" ON password_resets FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Security log policies
DROP POLICY IF EXISTS "log_select_own" ON security_logs;
CREATE POLICY "log_select_own" ON security_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Organization invitation policies
DROP POLICY IF EXISTS "inv_select_own" ON organization_invitations;
CREATE POLICY "inv_select_own" ON organization_invitations FOR SELECT TO authenticated USING (invited_by = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_profiles_user ON auth_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_user ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id);
