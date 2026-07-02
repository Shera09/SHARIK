-- Multi-Tenant SaaS Platform Schema

-- ENUM Types
CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended', 'cancelled', 'churned');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'expired', 'trialing', 'pending');
CREATE TYPE plan_type AS ENUM ('free', 'starter', 'professional', 'business', 'enterprise', 'custom');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly', 'lifetime');
CREATE TYPE domain_status AS ENUM ('pending', 'verified', 'failed', 'expired');
CREATE TYPE branch_type AS ENUM ('headquarters', 'franchise', 'branch', 'warehouse', 'store');
CREATE TYPE api_key_status AS ENUM ('active', 'revoked', 'expired');

-- Tenants (Businesses/Organizations)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status tenant_status DEFAULT 'trial',
  
  -- Company Profile
  legal_name TEXT,
  registration_number TEXT,
  gst_number TEXT,
  pan_number TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency TEXT DEFAULT 'INR',
  locale TEXT DEFAULT 'en-IN',
  
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#10B981',
  secondary_color TEXT DEFAULT '#6366F1',
  accent_color TEXT DEFAULT '#F59E0B',
  font_family TEXT DEFAULT 'Inter',
  theme_mode TEXT DEFAULT 'system',
  
  -- Custom Domain
  custom_domain TEXT,
  subdomain TEXT UNIQUE,
  
  -- Settings
  invoice_prefix TEXT DEFAULT 'INV',
  quotation_prefix TEXT DEFAULT 'QUO',
  invoice_template TEXT DEFAULT 'standard',
  email_template TEXT DEFAULT 'default',
  whatsapp_template TEXT DEFAULT 'default',
  
  -- Feature Flags
  features JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- AI Configuration
  ai_provider TEXT DEFAULT 'openai',
  ai_model TEXT DEFAULT 'gpt-4',
  ai_token_limit INTEGER DEFAULT 100000,
  ai_tokens_used INTEGER DEFAULT 0,
  
  -- Limits
  max_users INTEGER DEFAULT 5,
  max_customers INTEGER DEFAULT 1000,
  max_invoices INTEGER DEFAULT 500,
  max_storage_mb INTEGER DEFAULT 1000,
  
  -- Billing
  current_plan plan_type DEFAULT 'free',
  billing_cycle billing_cycle DEFAULT 'monthly',
  subscription_id UUID,
  billing_email TEXT,
  billing_address TEXT,
  
  -- Metadata
  owner_id UUID,
  franchise_parent_id UUID REFERENCES tenants(id),
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES tenants(id),
  
  -- Timestamps
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_type plan_type NOT NULL,
  description TEXT,
  
  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  yearly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  setup_fee DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  
  -- Features
  max_users INTEGER DEFAULT 1,
  max_customers INTEGER DEFAULT 100,
  max_invoices INTEGER DEFAULT 50,
  max_storage_mb INTEGER DEFAULT 100,
  max_branches INTEGER DEFAULT 1,
  max_ai_tokens INTEGER DEFAULT 10000,
  
  -- Feature Flags
  features JSONB DEFAULT '{}',
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  status subscription_status DEFAULT 'active',
  
  -- Billing
  billing_cycle billing_cycle NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Pricing
  amount DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(3,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Payment
  payment_method_id TEXT,
  last_payment_at TIMESTAMPTZ,
  next_payment_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (Platform Subscription Invoices)
CREATE TABLE platform_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_number TEXT NOT NULL UNIQUE,
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Status
  status TEXT DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  
  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- Payment
  payment_method TEXT,
  transaction_id TEXT,
  payment_gateway TEXT,
  
  -- PDF
  pdf_url TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches (Franchise System)
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  parent_branch_id UUID REFERENCES branches(id),
  
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  branch_type branch_type NOT NULL DEFAULT 'branch',
  
  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  
  -- WhatsApp
  whatsapp_number TEXT,
  whatsapp_api_key TEXT,
  
  -- Settings
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency TEXT DEFAULT 'INR',
  gst_number TEXT,
  
  -- Manager
  manager_id UUID,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Limits
  max_users INTEGER DEFAULT 5,
  max_customers INTEGER DEFAULT 500,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Domains
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  
  -- DNS Verification
  verification_token TEXT,
  verification_method TEXT,
  
  -- SSL
  ssl_issued_at TIMESTAMPTZ,
  ssl_expires_at TIMESTAMPTZ,
  ssl_provider TEXT,
  
  -- Status
  status domain_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  
  -- DNS Records
  dns_records JSONB DEFAULT '{}',
  
  -- Health
  last_health_check TIMESTAMPTZ,
  is_healthy BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  
  -- Permissions
  scopes JSONB DEFAULT '[]',
  
  -- Limits
  rate_limit INTEGER DEFAULT 1000,
  requests_count INTEGER DEFAULT 0,
  
  -- Status
  status api_key_status DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  
  -- Events
  events JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Stats
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Deliveries
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- Request
  request_headers JSONB,
  
  -- Response
  response_status INTEGER,
  response_body TEXT,
  
  -- Timing
  duration_ms INTEGER,
  
  -- Status
  success BOOLEAN DEFAULT FALSE,
  attempt_number INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Metrics
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  
  -- Counts
  users_count INTEGER DEFAULT 0,
  customers_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  invoices_count INTEGER DEFAULT 0,
  quotations_count INTEGER DEFAULT 0,
  
  -- AI Usage
  ai_tokens_used INTEGER DEFAULT 0,
  ai_requests_count INTEGER DEFAULT 0,
  
  -- Storage
  storage_used_mb DECIMAL(10,2) DEFAULT 0,
  
  -- Communication
  emails_sent INTEGER DEFAULT 0,
  whatsapp_messages_sent INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  
  -- API
  api_requests INTEGER DEFAULT 0,
  
  -- Revenue
  revenue_processed DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, metric_date)
);

-- Audit Logs (Platform Level)
CREATE TABLE platform_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID,
  
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons & Discounts
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount_amount DECIMAL(10,2),
  
  -- Validity
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  
  -- Limits
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Applicable Plans
  applicable_plans JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon Redemptions
CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id),
  tenant_id UUID REFERENCES tenants(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  discount_amount DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Apps
CREATE TABLE marketplace_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  -- Media
  icon_url TEXT,
  screenshots JSONB DEFAULT '[]',
  documentation_url TEXT,
  
  -- Installation
  install_command TEXT,
  config_schema JSONB DEFAULT '{}',
  
  -- Pricing
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2) DEFAULT 0,
  price_type TEXT DEFAULT 'one_time',
  
  -- Stats
  installs_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  developer_name TEXT,
  developer_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Installed Apps
CREATE TABLE installed_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  app_id UUID REFERENCES marketplace_apps(id),
  
  config JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT TRUE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, app_id)
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_apps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY "select_tenants" ON tenants FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_tenants" ON tenants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_tenants" ON tenants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_tenants" ON tenants FOR DELETE TO authenticated USING (true);

-- RLS Policies for subscription_plans
CREATE POLICY "select_plans" ON subscription_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_plans" ON subscription_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_plans" ON subscription_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_plans" ON subscription_plans FOR DELETE TO authenticated USING (true);

-- RLS Policies for subscriptions
CREATE POLICY "select_subscriptions" ON subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_subscriptions" ON subscriptions FOR DELETE TO authenticated USING (true);

-- RLS Policies for platform_invoices
CREATE POLICY "select_platform_invoices" ON platform_invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_platform_invoices" ON platform_invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_platform_invoices" ON platform_invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_platform_invoices" ON platform_invoices FOR DELETE TO authenticated USING (true);

-- RLS Policies for branches
CREATE POLICY "select_branches" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_branches" ON branches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_branches" ON branches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_branches" ON branches FOR DELETE TO authenticated USING (true);

-- RLS Policies for custom_domains
CREATE POLICY "select_domains" ON custom_domains FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_domains" ON custom_domains FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_domains" ON custom_domains FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_domains" ON custom_domains FOR DELETE TO authenticated USING (true);

-- RLS Policies for api_keys
CREATE POLICY "select_api_keys" ON api_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_api_keys" ON api_keys FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_api_keys" ON api_keys FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_api_keys" ON api_keys FOR DELETE TO authenticated USING (true);

-- RLS Policies for webhooks
CREATE POLICY "select_webhooks" ON webhooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_webhooks" ON webhooks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_webhooks" ON webhooks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_webhooks" ON webhooks FOR DELETE TO authenticated USING (true);

-- RLS Policies for webhook_deliveries
CREATE POLICY "select_webhook_deliveries" ON webhook_deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_webhook_deliveries" ON webhook_deliveries FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for usage_metrics
CREATE POLICY "select_usage_metrics" ON usage_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_usage_metrics" ON usage_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_usage_metrics" ON usage_metrics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for platform_audit_logs
CREATE POLICY "select_audit_logs" ON platform_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_audit_logs" ON platform_audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for coupons
CREATE POLICY "select_coupons" ON coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_coupons" ON coupons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_coupons" ON coupons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_coupons" ON coupons FOR DELETE TO authenticated USING (true);

-- RLS Policies for coupon_redemptions
CREATE POLICY "select_redemptions" ON coupon_redemptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_redemptions" ON coupon_redemptions FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for marketplace_apps
CREATE POLICY "select_marketplace" ON marketplace_apps FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_marketplace" ON marketplace_apps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_marketplace" ON marketplace_apps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_marketplace" ON marketplace_apps FOR DELETE TO authenticated USING (true);

-- RLS Policies for installed_apps
CREATE POLICY "select_installed" ON installed_apps FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_installed" ON installed_apps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_installed" ON installed_apps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_installed" ON installed_apps FOR DELETE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_branches_tenant ON branches(tenant_id);
CREATE INDEX idx_domains_tenant ON custom_domains(tenant_id);
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id);
CREATE INDEX idx_usage_tenant_date ON usage_metrics(tenant_id, metric_date DESC);
CREATE INDEX idx_audit_tenant ON platform_audit_logs(tenant_id);
CREATE INDEX idx_audit_created ON platform_audit_logs(created_at DESC);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, plan_type, description, monthly_price, yearly_price, max_users, max_customers, max_invoices, max_storage_mb, max_branches, max_ai_tokens, features, is_active) VALUES
('Free Trial', 'free-trial', 'free', '14-day free trial to explore all features', 0, 0, 3, 100, 25, 100, 1, 5000, '{"ai_assistant": true, "crm": true, "invoicing": true, "whatsapp": false}', true),
('Starter', 'starter', 'starter', 'Perfect for small businesses starting out', 999, 9999, 5, 500, 100, 500, 1, 25000, '{"ai_assistant": true, "crm": true, "invoicing": true, "whatsapp": true, "reports": true}', true),
('Professional', 'professional', 'professional', 'For growing businesses with advanced needs', 2499, 24999, 10, 2000, 500, 2000, 3, 100000, '{"ai_assistant": true, "crm": true, "invoicing": true, "whatsapp": true, "reports": true, "api": true, "automation": true}', true),
('Business', 'business', 'business', 'Complete solution for established businesses', 4999, 49999, 25, 10000, 2000, 5000, 10, 500000, '{"ai_assistant": true, "crm": true, "invoicing": true, "whatsapp": true, "reports": true, "api": true, "automation": true, "white_label": false, "multi_branch": true}', true),
('Enterprise', 'enterprise', 'enterprise', 'Full-featured platform for large organizations', 9999, 99999, 100, 50000, 10000, 20000, 50, 2000000, '{"ai_assistant": true, "crm": true, "invoicing": true, "whatsapp": true, "reports": true, "api": true, "automation": true, "white_label": true, "multi_branch": true, "sso": true, "custom_domain": true}', true);
