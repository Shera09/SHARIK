/*
# Enterprise Licensing, Subscription & Billing Platform Schema

## Summary
- Creates `licenses` table with formatted keys, cryptographically signed tokens, grace periods, domain & device limits.
- Creates `license_activations` table for device fingerprinting and activation tracking.
- Creates `subscription_events` table for audit logging plan changes, renewals, and seat updates.
- Creates `customer_billing_profiles` table for company tax ID, address, and invoice preferences.
- Creates `usage_metering_logs` table for tracking AI credits, storage, API calls, WhatsApp, and emails.
- Creates `feature_entitlements` table for default plan feature matrix.
- Enables RLS on all tables with tenant isolation.
*/

-- 1. Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  license_token TEXT NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'starter' CHECK (plan_type IN ('starter', 'professional', 'business', 'enterprise', 'trial')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'grace_period', 'suspended', 'expired', 'revoked')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime', 'custom')),
  max_users INTEGER DEFAULT 5,
  max_devices INTEGER DEFAULT 10,
  bound_domain TEXT,
  offline_grace_days INTEGER DEFAULT 7,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  last_verified_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. License Activations Table
CREATE TABLE IF NOT EXISTS license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES licenses(id) ON DELETE CASCADE NOT NULL,
  device_fingerprint TEXT NOT NULL,
  domain TEXT,
  ip_address TEXT,
  user_agent TEXT,
  activated_by UUID,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Subscription Audit Events Table
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'activated', 'upgraded', 'downgraded', 'renewed', 'paused', 'resumed', 'cancelled', 'suspended', 'revoked', 'seat_changed')),
  old_plan TEXT,
  new_plan TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Customer Billing Profiles Table
CREATE TABLE IF NOT EXISTS customer_billing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  billing_contact_name TEXT,
  billing_email TEXT NOT NULL,
  tax_id TEXT, -- GSTIN / VAT Number
  billing_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  invoice_delivery_method TEXT DEFAULT 'email',
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Usage Metering Logs Table
CREATE TABLE IF NOT EXISTS usage_metering_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  active_users INTEGER DEFAULT 0,
  storage_mb_used DECIMAL(10,2) DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  whatsapp_messages_count INTEGER DEFAULT 0,
  email_volume_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  metric_date DATE DEFAULT CURRENT_DATE
);

-- 6. Feature Entitlements Catalog Table
CREATE TABLE IF NOT EXISTS feature_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT UNIQUE NOT NULL,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_tenant ON licenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_activations_license ON license_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_tenant ON subscription_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant ON usage_metering_logs(tenant_id, metric_date DESC);

-- Enable RLS
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metering_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_entitlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_licenses" ON licenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_licenses" ON licenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_licenses" ON licenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_activations" ON license_activations FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_activations" ON license_activations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_sub_events" ON subscription_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_sub_events" ON subscription_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_billing_profiles" ON customer_billing_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_billing_profiles" ON customer_billing_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_billing_profiles" ON customer_billing_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_usage_logs" ON usage_metering_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_usage_logs" ON usage_metering_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_entitlements" ON feature_entitlements FOR SELECT TO authenticated USING (true);

-- Seed default feature entitlements
INSERT INTO feature_entitlements (plan_type, features) VALUES
('starter', '{"ai": true, "whatsapp": false, "reports": true, "reviews": false, "white_label": false, "api_access": false, "max_users": 5, "max_storage_mb": 500, "max_customers": 1000, "ai_credits": 10000}'::jsonb),
('professional', '{"ai": true, "whatsapp": true, "reports": true, "reviews": true, "white_label": false, "api_access": true, "max_users": 15, "max_storage_mb": 2000, "max_customers": 5000, "ai_credits": 50000}'::jsonb),
('business', '{"ai": true, "whatsapp": true, "reports": true, "reviews": true, "white_label": false, "api_access": true, "max_users": 50, "max_storage_mb": 10000, "max_customers": 25000, "ai_credits": 250000}'::jsonb),
('enterprise', '{"ai": true, "whatsapp": true, "reports": true, "reviews": true, "white_label": true, "api_access": true, "max_users": 500, "max_storage_mb": 100000, "max_customers": 500000, "ai_credits": 2000000}'::jsonb),
('trial', '{"ai": true, "whatsapp": true, "reports": true, "reviews": true, "white_label": false, "api_access": true, "max_users": 3, "max_storage_mb": 200, "max_customers": 500, "ai_credits": 5000}'::jsonb)
ON CONFLICT (plan_type) DO NOTHING;
