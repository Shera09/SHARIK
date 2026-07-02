/*
# Enterprise Marketplace Platform - Enhanced Schema

## Summary
This migration enhances the existing marketplace_apps table and creates additional tables for the complete marketplace ecosystem:
- AI Agent Store tables
- Theme Store tables
- Template Library
- Developer Portal
- Extension permissions
- Reviews and ratings
- Monetization tracking

## Changes
1. Enhance marketplace_apps - add missing columns for marketplace v2
2. Create marketplace_categories
3. Create theme_listings, installed_themes
4. Create template_listings, cloned_templates
5. Create developer_profiles, developer_api_keys
6. Create marketplace_reviews, marketplace_purchases
7. Create extension_permissions
*/

-- Add missing columns to marketplace_apps
DO $$ BEGIN
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS short_description text;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS capabilities jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS banner_url text;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS support_url text;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS repository_url text;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS changelog_url text;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS subscription_price_monthly numeric(10, 2);
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS subscription_price_yearly numeric(10, 2);
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS trial_days integer DEFAULT 0;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS published_at timestamptz;
  ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS developer_id uuid;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Marketplace Categories
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  parent_id uuid REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  app_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- App Versions
CREATE TABLE IF NOT EXISTS marketplace_app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  version text NOT NULL,
  changelog text,
  download_url text,
  package_hash text,
  package_size bigint,
  platform_version_min text DEFAULT '1.0.0',
  platform_version_max text,
  is_compatible boolean DEFAULT true,
  is_prerelease boolean DEFAULT false,
  release_channel text DEFAULT 'stable' CHECK (release_channel IN ('stable', 'beta', 'preview')),
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(app_id, version)
);

-- Installed Apps
CREATE TABLE IF NOT EXISTS installed_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  tenant_id uuid,
  version text NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  permissions_granted jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'error', 'pending')),
  error_message text,
  installed_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_installed_apps_tenant ON installed_apps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_installed_apps_app ON installed_apps(app_id);

-- Theme Listings
CREATE TABLE IF NOT EXISTS theme_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  developer_id uuid,
  colors jsonb DEFAULT '{}'::jsonb,
  typography jsonb DEFAULT '{}'::jsonb,
  icons jsonb DEFAULT '{}'::jsonb,
  layout_config jsonb DEFAULT '{}'::jsonb,
  component_overrides jsonb DEFAULT '{}'::jsonb,
  preview_url text,
  thumbnail_url text,
  price numeric(10, 2) DEFAULT 0,
  is_free boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  is_published boolean DEFAULT false,
  rating_average numeric(3, 2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  install_count integer DEFAULT 0,
  version text DEFAULT '1.0.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Installed Themes
CREATE TABLE IF NOT EXISTS installed_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid REFERENCES theme_listings(id) ON DELETE CASCADE,
  tenant_id uuid,
  config_override jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  installed_at timestamptz DEFAULT now()
);

-- Template Library
CREATE TABLE IF NOT EXISTS template_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  category text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('invoice', 'quotation', 'email', 'whatsapp', 'report', 'landing_page', 'dashboard', 'form', 'workflow', 'automation', 'knowledge', 'contract', 'letter')),
  content jsonb NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  preview_data jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT true,
  is_premium boolean DEFAULT false,
  price numeric(10, 2) DEFAULT 0,
  creator_id uuid,
  icon_url text,
  use_count integer DEFAULT 0,
  rating_average numeric(3, 2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(slug, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON template_listings(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_category ON template_listings(category);

-- Cloned Templates
CREATE TABLE IF NOT EXISTS cloned_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template_listings(id) ON DELETE CASCADE,
  tenant_id uuid,
  name text,
  content_override jsonb,
  variables_override jsonb,
  is_shared boolean DEFAULT false,
  shared_with jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Developer Profiles
CREATE TABLE IF NOT EXISTS developer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  company_name text,
  display_name text NOT NULL,
  bio text,
  website_url text,
  logo_url text,
  banner_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  total_apps integer DEFAULT 0,
  total_downloads integer DEFAULT 0,
  total_revenue numeric(12, 2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  rating_average numeric(3, 2) DEFAULT 0,
  support_email text,
  contact_email text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Developer API Keys
CREATE TABLE IF NOT EXISTS developer_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES developer_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  permissions jsonb DEFAULT '[]'::jsonb,
  scopes jsonb DEFAULT '[]'::jsonb,
  rate_limit integer DEFAULT 1000,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_developer ON developer_api_keys(developer_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON developer_api_keys(key_prefix);

-- Developer Webhooks
CREATE TABLE IF NOT EXISTS developer_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES developer_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  secret_hash text,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  last_response_status integer,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_developer ON developer_webhooks(developer_id);

-- Developer Analytics
CREATE TABLE IF NOT EXISTS developer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES developer_profiles(id) ON DELETE CASCADE,
  app_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_developer ON developer_analytics(developer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_app ON developer_analytics(app_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON developer_analytics(event_type);

-- Extension Permissions
CREATE TABLE IF NOT EXISTS extension_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  requires_approval boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Marketplace Reviews
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  tenant_id uuid,
  user_id uuid,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  content text,
  is_verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  developer_response text,
  responded_at timestamptz,
  status text DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'removed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_app ON marketplace_reviews(app_id);

-- Marketplace Purchases
CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES marketplace_apps(id) ON DELETE SET NULL,
  tenant_id uuid,
  purchase_type text NOT NULL CHECK (purchase_type IN ('one_time', 'subscription', 'trial')),
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  license_key text,
  expires_at timestamptz,
  purchased_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_app ON marketplace_purchases(app_id);
CREATE INDEX IF NOT EXISTS idx_purchases_tenant ON marketplace_purchases(tenant_id);

-- Developer Earnings
CREATE TABLE IF NOT EXISTS developer_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES developer_profiles(id) ON DELETE CASCADE,
  app_id uuid,
  purchase_id uuid REFERENCES marketplace_purchases(id),
  amount numeric(10, 2) NOT NULL,
  fee_amount numeric(10, 2) NOT NULL,
  net_amount numeric(10, 2) NOT NULL,
  payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
  payout_id text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_earnings_developer ON developer_earnings(developer_id);

-- Enable RLS on all new tables
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloned_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "public_read_categories" ON marketplace_categories;
CREATE POLICY "public_read_categories" ON marketplace_categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_themes" ON theme_listings;
CREATE POLICY "public_read_themes" ON theme_listings FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "public_read_templates" ON template_listings;
CREATE POLICY "public_read_templates" ON template_listings FOR SELECT TO anon, authenticated USING (is_public = true);

DROP POLICY IF EXISTS "public_read_permissions" ON extension_permissions;
CREATE POLICY "public_read_permissions" ON extension_permissions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_reviews" ON marketplace_reviews;
CREATE POLICY "public_read_reviews" ON marketplace_reviews FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "developer_manage_own_profile" ON developer_profiles;
CREATE POLICY "developer_manage_own_profile" ON developer_profiles FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "developer_manage_own_keys" ON developer_api_keys;
CREATE POLICY "developer_manage_own_keys" ON developer_api_keys FOR ALL TO authenticated USING (developer_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "developer_manage_own_webhooks" ON developer_webhooks;
CREATE POLICY "developer_manage_own_webhooks" ON developer_webhooks FOR ALL TO authenticated USING (developer_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid()));

-- Insert default categories
INSERT INTO marketplace_categories (name, slug, description, icon, sort_order) VALUES
('CRM Extensions', 'crm', 'Extend CRM capabilities', 'users', 1),
('Accounting', 'accounting', 'Accounting and finance tools', 'calculator', 2),
('GST Tools', 'gst', 'GST compliance and filing', 'file-text', 3),
('HR & Payroll', 'hr', 'Human resources and payroll', 'users-2', 4),
('Loan Processing', 'loans', 'Loan and credit management', 'banknote', 5),
('Legal', 'legal', 'Legal and compliance', 'scale', 6),
('Marketing', 'marketing', 'Marketing automation', 'megaphone', 7),
('AI Tools', 'ai', 'AI-powered utilities', 'sparkles', 8),
('Automation Packs', 'automation', 'Workflow automation packs', 'workflow', 9),
('Analytics', 'analytics', 'Advanced analytics', 'chart-bar', 10),
('Dashboards', 'dashboards', 'Custom dashboard templates', 'layout-dashboard', 11),
('Themes', 'themes', 'UI themes and styles', 'palette', 12),
('Widgets', 'widgets', 'Dashboard widgets', 'grid-3x3', 13),
('Reports', 'reports', 'Report templates', 'file-bar-chart', 14),
('Integrations', 'integrations', 'Third-party integrations', 'plug', 15),
('Industry Templates', 'industry', 'Industry-specific templates', 'building', 16)
ON CONFLICT (slug) DO NOTHING;

-- Insert default permissions
INSERT INTO extension_permissions (name, category, description, risk_level, requires_approval) VALUES
('read_customers', 'data', 'Read customer data', 'medium', true),
('write_customers', 'data', 'Create and update customers', 'high', true),
('read_invoices', 'data', 'Read invoice data', 'medium', true),
('write_invoices', 'data', 'Create and update invoices', 'high', true),
('read_leads', 'data', 'Read lead data', 'medium', true),
('write_leads', 'data', 'Create and update leads', 'high', true),
('read_employees', 'data', 'Read employee data', 'high', true),
('send_emails', 'communication', 'Send emails on behalf', 'medium', false),
('send_whatsapp', 'communication', 'Send WhatsApp messages', 'medium', true),
('ai_access', 'ai', 'Access AI capabilities', 'low', false),
('ai_training', 'ai', 'Train AI models with data', 'high', true),
('webhook_receive', 'integration', 'Receive webhook events', 'low', false),
('webhook_send', 'integration', 'Send outgoing webhooks', 'medium', false),
('file_upload', 'storage', 'Upload files', 'low', false),
('api_read', 'api', 'Read access to API', 'low', false),
('api_write', 'api', 'Write access to API', 'medium', true),
('admin_actions', 'system', 'Perform administrative actions', 'critical', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample themes
INSERT INTO theme_listings (name, slug, description, colors, is_published, is_verified, install_count, rating_average, is_free) VALUES
('Ocean Blue', 'ocean-blue', 'Professional blue theme with clean aesthetics', '{"primary": "#0ea5e9", "secondary": "#0284c7", "accent": "#38bdf8", "background": "#f0f9ff", "surface": "#ffffff"}'::jsonb, true, true, 320, 4.7, true),
('Forest Green', 'forest-green', 'Nature-inspired green theme for eco-conscious brands', '{"primary": "#10b981", "secondary": "#059669", "accent": "#34d399", "background": "#f0fdf4", "surface": "#ffffff"}'::jsonb, true, true, 280, 4.6, true),
('Sunset Orange', 'sunset-orange', 'Vibrant orange theme for creative businesses', '{"primary": "#f97316", "secondary": "#ea580c", "accent": "#fb923c", "background": "#fff7ed", "surface": "#ffffff"}'::jsonb, true, true, 190, 4.5, true),
('Midnight Purple', 'midnight-purple', 'Elegant purple theme for premium feel', '{"primary": "#8b5cf6", "secondary": "#7c3aed", "accent": "#a78bfa", "background": "#faf5ff", "surface": "#ffffff"}'::jsonb, true, true, 150, 4.4, true),
('Professional Dark', 'professional-dark', 'Dark theme optimized for extended use', '{"primary": "#10b981", "secondary": "#6366f1", "accent": "#f59e0b", "background": "#0f172a", "surface": "#1e293b"}'::jsonb, true, true, 520, 4.8, true),
('Corporate Navy', 'corporate-navy', 'Professional navy blue for enterprise', '{"primary": "#1e40af", "secondary": "#1e3a8a", "accent": "#3b82f6", "background": "#f8fafc", "surface": "#ffffff"}'::jsonb, true, true, 340, 4.6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample templates
INSERT INTO template_listings (name, slug, description, category, template_type, content, is_public, use_count, rating_average) VALUES
('GST Invoice Standard', 'gst-invoice-standard', 'Standard GST-compliant invoice format', 'invoices', 'invoice', '{"sections": ["header", "customer_details", "items", "gst_breakup", "total", "terms"]}'::jsonb, true, 1200, 4.8),
('Professional Quotation', 'professional-quotation', 'Clean quotation template with terms', 'quotations', 'quotation', '{"sections": ["header", "client_info", "items", "pricing", "terms", "signature"]}'::jsonb, true, 890, 4.6),
('Welcome Email Sequence', 'welcome-email-sequence', '3-part customer onboarding email', 'emails', 'email', '{"parts": 3, "timing": ["immediate", "day 2", "day 5"]}'::jsonb, true, 650, 4.5),
('Payment Reminder WhatsApp', 'payment-reminder-whatsapp', 'Payment reminder message template', 'messaging', 'whatsapp', '{"tone": "friendly", "include_link": true}'::jsonb, true, 780, 4.7),
('Monthly Sales Dashboard', 'monthly-sales-dashboard', 'Sales performance dashboard template', 'sales', 'dashboard', '{"widgets": ["revenue", "orders", "customers", "products"]}'::jsonb, true, 420, 4.6),
('Employee Onboarding Workflow', 'employee-onboarding-workflow', 'Complete onboarding automation', 'hr', 'workflow', '{"steps": 8, "auto_assign": true}'::jsonb, true, 380, 4.5),
('Customer Registration Form', 'customer-registration-form', 'Customer signup form template', 'crm', 'form', '{"fields": ["name", "email", "phone", "address", "gst"]}'::jsonb, true, 560, 4.7)
ON CONFLICT DO NOTHING;
