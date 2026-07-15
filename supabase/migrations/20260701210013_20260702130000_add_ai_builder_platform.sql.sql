-- AI Builder Platform Schema

-- ENUM Types
CREATE TYPE builder_project_type AS ENUM ('website', 'dashboard', 'form', 'app', 'report', 'workflow');
CREATE TYPE project_status AS ENUM ('draft', 'generating', 'generated', 'published', 'archived');
CREATE TYPE component_category AS ENUM ('layout', 'hero', 'card', 'gallery', 'form', 'chart', 'table', 'button', 'text', 'media', 'navigation', 'footer', 'modal', 'widget');
CREATE TYPE template_category AS ENUM ('business', 'corporate', 'agency', 'portfolio', 'ecommerce', 'hospital', 'school', 'restaurant', 'hotel', 'realestate', 'finance', 'legal', 'travel', 'ngo', 'event', 'technology', 'medical', 'construction');
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Builder Projects
CREATE TABLE builder_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID,
  
  name TEXT NOT NULL,
  description TEXT,
  project_type builder_project_type NOT NULL,
  status project_status DEFAULT 'draft',
  
  -- AI Generation
  prompt TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  generation_status generation_status DEFAULT 'pending',
  
  -- Project Configuration
  config JSONB DEFAULT '{}',
  schema JSONB DEFAULT '{}',
  
  -- Pages/Components
  pages JSONB DEFAULT '[]',
  components JSONB DEFAULT '[]',
  
  -- Styling
  theme JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  
  -- Publishing
  published_url TEXT,
  published_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Versions
CREATE TABLE builder_project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  
  version_number INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  
  config JSONB NOT NULL,
  pages JSONB NOT NULL,
  components JSONB NOT NULL,
  schema JSONB DEFAULT '{}',
  
  change_summary TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, version_number)
);

-- AI Generation History
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  
  prompt TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  
  -- Generated Output
  generated_code JSONB DEFAULT '{}',
  generated_schema JSONB DEFAULT '{}',
  generated_components JSONB DEFAULT '[]',
  generated_pages JSONB DEFAULT '[]',
  
  -- AI Details
  model_used TEXT DEFAULT 'gpt-4',
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  
  status generation_status DEFAULT 'pending',
  error_message TEXT,
  
  -- Refinements
  refinements JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Component Library
CREATE TABLE builder_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category component_category NOT NULL,
  
  description TEXT,
  icon TEXT,
  
  -- Component Definition
  props_schema JSONB DEFAULT '{}',
  default_props JSONB DEFAULT '{}',
  template TEXT,
  
  -- Preview
  preview_image TEXT,
  preview_html TEXT,
  
  -- Styling
  default_styles JSONB DEFAULT '{}',
  style_options JSONB DEFAULT '{}',
  
  -- AI hints for generation
  ai_hints JSONB DEFAULT '{}',
  
  is_builtin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates
CREATE TABLE builder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category template_category NOT NULL,
  
  -- Thumbnail
  thumbnail_url TEXT,
  preview_url TEXT,
  
  -- Template Data
  project_type builder_project_type NOT NULL,
  config JSONB NOT NULL,
  pages JSONB NOT NULL,
  components JSONB NOT NULL,
  schema JSONB DEFAULT '{}',
  theme JSONB DEFAULT '{}',
  
  -- Pricing
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2) DEFAULT 0,
  
  -- Stats
  installs_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  
  -- Status
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Creator
  created_by UUID,
  creator_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Definitions
CREATE TABLE builder_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Form Schema
  fields JSONB NOT NULL DEFAULT '[]',
  validation_rules JSONB DEFAULT '{}',
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Integration
  webhook_url TEXT,
  email_recipients JSONB DEFAULT '[]',
  after_submit_action TEXT,
  
  -- Styling
  theme JSONB DEFAULT '{}',
  
  -- Stats
  submissions_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, slug)
);

-- Form Submissions
CREATE TABLE builder_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES builder_forms(id) ON DELETE CASCADE,
  
  data JSONB NOT NULL,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Status
  status TEXT DEFAULT 'new',
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Definitions
CREATE TABLE builder_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Dashboard Layout
  layout JSONB NOT NULL DEFAULT '[]',
  widgets JSONB NOT NULL DEFAULT '[]',
  
  -- Data Sources
  data_sources JSONB DEFAULT '[]',
  
  -- Filters
  filters JSONB DEFAULT '[]',
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Permissions
  is_public BOOLEAN DEFAULT FALSE,
  allowed_roles JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, slug)
);

-- App Definitions
CREATE TABLE builder_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- App Structure
  modules JSONB NOT NULL DEFAULT '[]',
  navigation JSONB DEFAULT '{}',
  
  -- Database Schema
  tables JSONB DEFAULT '[]',
  relationships JSONB DEFAULT '[]',
  
  -- Permissions
  roles JSONB DEFAULT '[]',
  permissions JSONB DEFAULT '{}',
  
  -- Features
  features JSONB DEFAULT '{}',
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, slug)
);

-- Report Definitions
CREATE TABLE builder_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Report Config
  data_source JSONB NOT NULL,
  filters JSONB DEFAULT '[]',
  columns JSONB NOT NULL DEFAULT '[]',
  charts JSONB DEFAULT '[]',
  
  -- Scheduling
  schedule_enabled BOOLEAN DEFAULT FALSE,
  schedule_cron TEXT,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  
  -- Delivery
  delivery_methods JSONB DEFAULT '[]',
  email_recipients JSONB DEFAULT '[]',
  
  -- Export
  export_formats JSONB DEFAULT '["pdf", "excel"]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, slug)
);

-- Workflow Definitions (No-Code)
CREATE TABLE builder_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Workflow Definition
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  
  -- Triggers
  triggers JSONB DEFAULT '[]',
  
  -- Variables
  variables JSONB DEFAULT '{}',
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Published Sites
CREATE TABLE published_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  domain TEXT,
  subdomain TEXT UNIQUE,
  
  -- Deployment
  deployment_status TEXT DEFAULT 'pending',
  deployed_at TIMESTAMPTZ,
  
  -- SSL
  ssl_issued BOOLEAN DEFAULT FALSE,
  ssl_expires_at TIMESTAMPTZ,
  
  -- CDN
  cdn_enabled BOOLEAN DEFAULT TRUE,
  
  -- Performance
  last_build_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration
CREATE TABLE builder_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  role TEXT DEFAULT 'viewer',
  
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

-- Comments
CREATE TABLE builder_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES builder_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  content TEXT NOT NULL,
  
  -- Position (for visual comments)
  position_x INTEGER,
  position_y INTEGER,
  element_id TEXT,
  page_id TEXT,
  
  -- Thread
  parent_id UUID REFERENCES builder_comments(id) ON DELETE CASCADE,
  
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE builder_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_projects" ON builder_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_projects" ON builder_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_projects" ON builder_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_projects" ON builder_projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_versions" ON builder_project_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_versions" ON builder_project_versions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_generations" ON ai_generations FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_generations" ON ai_generations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_generations" ON ai_generations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_components" ON builder_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_components" ON builder_components FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_components" ON builder_components FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_templates" ON builder_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_templates" ON builder_templates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_forms" ON builder_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_forms" ON builder_forms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_forms" ON builder_forms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_forms" ON builder_forms FOR DELETE TO authenticated USING (true);

CREATE POLICY "select_submissions" ON builder_form_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_submissions" ON builder_form_submissions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_dashboards" ON builder_dashboards FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_dashboards" ON builder_dashboards FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_apps" ON builder_apps FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_apps" ON builder_apps FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_reports" ON builder_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_reports" ON builder_reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_workflows" ON builder_workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_workflows" ON builder_workflows FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_sites" ON published_sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_sites" ON published_sites FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_collaborators" ON builder_collaborators FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_collaborators" ON builder_collaborators FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_comments" ON builder_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_comments" ON builder_comments FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_projects_tenant ON builder_projects(tenant_id);
CREATE INDEX idx_projects_type ON builder_projects(project_type);
CREATE INDEX idx_projects_status ON builder_projects(status);
CREATE INDEX idx_templates_category ON builder_templates(category);
CREATE INDEX idx_templates_installs ON builder_templates(installs_count DESC);
CREATE INDEX idx_forms_tenant ON builder_forms(tenant_id);
CREATE INDEX idx_submissions_form ON builder_form_submissions(form_id);
CREATE INDEX idx_submissions_created ON builder_form_submissions(created_at DESC);
CREATE INDEX idx_dashboards_tenant ON builder_dashboards(tenant_id);
CREATE INDEX idx_generations_status ON ai_generations(status);

-- Insert default components
INSERT INTO builder_components (name, slug, category, description, icon, default_props, ai_hints, is_builtin) VALUES
('Hero Section', 'hero-section', 'hero', 'Full-width hero section with heading, subheading, and CTA', 'LayoutDashboard', '{"title": "Welcome", "subtitle": "Your subtitle here", "ctaText": "Get Started", "ctaLink": "#"}', '{"purpose": "landing-page-header", "elements": ["heading", "subheading", "button"]}', true),
('Card Grid', 'card-grid', 'card', 'Responsive grid of content cards', 'LayoutGrid', '{"columns": 3, "cards": []}', '{"purpose": "content-grid", "responsive": true}', true),
('Contact Form', 'contact-form', 'form', 'Standard contact form with validation', 'Mail', '{"fields": ["name", "email", "phone", "message"], "submitText": "Send Message"}', '{"purpose": "contact", "validation": true, "spam_protection": true}', true),
('Navigation Bar', 'navbar', 'navigation', 'Responsive navigation bar with logo and links', 'Menu', '{"links": [], "logo": "", "sticky": true}', '{"purpose": "site-navigation", "responsive": true}', true),
('Footer', 'footer', 'footer', 'Website footer with links and social icons', 'LayoutTemplate', '{"columns": 3, "links": [], "social": []}', '{"purpose": "site-footer"}', true),
('Chart Widget', 'chart-widget', 'chart', 'Interactive chart component', 'BarChart3', '{"type": "line", "data": [], "options": {}}', '{"purpose": "data-visualization"}', true),
('Data Table', 'data-table', 'table', 'Sortable, filterable data table', 'Table', '{"columns": [], "data": [], "pagination": true}', '{"purpose": "data-display", "features": ["sort", "filter", "pagination"]}', true),
('Testimonials', 'testimonials', 'widget', 'Customer testimonials carousel', 'Quote', '{"testimonials": [], "autoplay": true}', '{"purpose": "social-proof"}', true),
('Pricing Table', 'pricing-table', 'card', 'Pricing plans comparison table', 'CreditCard', '{"plans": []}', '{"purpose": "pricing-display"}', true),
('FAQ Accordion', 'faq-accordion', 'widget', 'Frequently asked questions accordion', 'HelpCircle', '{"faqs": []}', '{"purpose": "information-display"}', true);

-- Insert sample templates
INSERT INTO builder_templates (name, slug, description, category, project_type, config, pages, components, theme, is_free, is_featured) VALUES
('Business Landing', 'business-landing', 'Professional business landing page with hero, services, testimonials', 'business', 'website', '{}', '[{"id": "home", "name": "Home", "sections": ["hero", "services", "testimonials", "cta"]}]', '[]', '{"primaryColor": "#10B981", "secondaryColor": "#6366F1"}', true, true),
('Real Estate CRM', 'real-estate-crm', 'Complete CRM for real estate agents with property listings', 'realestate', 'app', '{}', '[{"id": "dashboard", "name": "Dashboard"}, {"id": "properties", "name": "Properties"}, {"id": "clients", "name": "Clients"}]', '[]', '{"primaryColor": "#3B82F6"}', true, true),
('Restaurant Website', 'restaurant-website', 'Modern restaurant website with menu, reservations, gallery', 'restaurant', 'website', '{}', '[{"id": "home", "name": "Home"}, {"id": "menu", "name": "Menu"}, {"id": "reservations", "name": "Reservations"}]', '[]', '{"primaryColor": "#F59E0B"}', true, false),
('Hospital Dashboard', 'hospital-dashboard', 'Hospital management dashboard with appointments, patients, staff', 'hospital', 'dashboard', '{}', '[{"id": "overview", "name": "Overview"}, {"id": "patients", "name": "Patients"}, {"id": "appointments", "name": "Appointments"}]', '[]', '{"primaryColor": "#EF4444"}', true, true),
('Finance Dashboard', 'finance-dashboard', 'Financial analytics dashboard with revenue, expenses, projections', 'finance', 'dashboard', '{}', '[{"id": "overview", "name": "Overview"}, {"id": "revenue", "name": "Revenue"}, {"id": "expenses", "name": "Expenses"}]', '[]', '{"primaryColor": "#6366F1"}', true, true);
