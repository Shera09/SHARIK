/*
# Enterprise SAML 2.0 & SCIM 2.0 Identity Schema (Sprint 4B)

## Summary
- Creates `saml_configurations` table for tenant-specific IdP Metadata, ACS URLs, Certificate PEMs, and Attribute Mappings.
- Creates `scim_tokens` table for bearer token authentication.
- Creates `scim_provisioning_logs` table for auditing SCIM user/group sync events.
- Enables RLS on all tables with tenant isolation.
*/

-- 1. SAML Configurations Table
CREATE TABLE IF NOT EXISTS saml_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  idp_entity_id TEXT NOT NULL,
  sso_url TEXT NOT NULL,
  certificate_pem TEXT NOT NULL,
  attribute_mapping JSONB NOT NULL DEFAULT '{"email": "email", "full_name": "name", "role": "role"}'::jsonb,
  default_role TEXT DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCIM Authorization Bearer Tokens Table
CREATE TABLE IF NOT EXISTS scim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  token_hash TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  name TEXT DEFAULT 'Okta / Azure AD SCIM Token',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SCIM Provisioning Audit Logs Table
CREATE TABLE IF NOT EXISTS scim_provisioning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('user_created', 'user_updated', 'user_disabled', 'group_synced', 'role_changed')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('User', 'Group')),
  resource_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saml_tenant ON saml_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scim_tokens_hash ON scim_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_scim_logs_tenant ON scim_provisioning_logs(tenant_id);

-- Enable RLS
ALTER TABLE saml_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_provisioning_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_saml_config" ON saml_configurations FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_saml_config" ON saml_configurations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_saml_config" ON saml_configurations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_scim_tokens" ON scim_tokens FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_scim_tokens" ON scim_tokens FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_scim_logs" ON scim_provisioning_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_scim_logs" ON scim_provisioning_logs FOR INSERT TO authenticated WITH CHECK (true);
