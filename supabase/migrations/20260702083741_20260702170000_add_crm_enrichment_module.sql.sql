/*
# WebHoster AI Business OS — CRM Enrichment Module

## Overview
Extends the CRM with lead activity tracking, lead source management, customer
interaction logs, opportunity/deal tracking, and a sales pipeline stage system.
These tables complement the existing `leads` and `customers` tables.

## New Tables
1. `lead_activities` — Timeline of actions on a lead (call, email, meeting, note, status change)
2. `lead_sources` — Catalog of lead acquisition channels with cost/conversion tracking
3. `customer_interactions` — Log of touchpoints with customers (call, email, meeting, support)
4. `opportunities` — Deal tracking with stage, value, probability, expected close date
5. `sales_pipeline_stages` — Configurable pipeline stages with order, color, and rules

## Relationships
- `lead_activities.lead_id` → `leads(id)` ON DELETE CASCADE
- `lead_sources` is standalone (catalog table)
- `customer_interactions.customer_id` → `customers(id)` ON DELETE CASCADE
- `opportunities.customer_id` → `customers(id)` ON DELETE SET NULL
- `opportunities.lead_id` → `leads(id)` ON DELETE SET NULL
- `sales_pipeline_stages` is standalone (configuration table)

## Security
- RLS enabled on every table with `TO anon, authenticated` policies (single-tenant)
- 4 CRUD policies per table

## Indexes
- `lead_activities` indexed on `(lead_id, created_at)` for timeline queries
- `customer_interactions` indexed on `(customer_id, created_at)` for interaction history
- `opportunities` indexed on `stage` and `expected_close_date` for pipeline views

## Notes
1. All tables use `gen_random_uuid()` for primary keys
2. `created_at` / `updated_at` timestamps on every table
3. JSONB used for flexible metadata (interaction details, opportunity requirements)
4. CHECK constraints enforce valid enum values
5. Idempotent — safe to re-run
*/

-- ============================================================
-- LEAD ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'demo', 'proposal_sent', 'status_change', 'follow_up', 'whatsapp', 'other')),
  title text NOT NULL,
  description text,
  outcome text,
  duration_minutes integer DEFAULT 0,
  performed_by text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lead_activities" ON lead_activities;
CREATE POLICY "anon_select_lead_activities" ON lead_activities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lead_activities" ON lead_activities;
CREATE POLICY "anon_insert_lead_activities" ON lead_activities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lead_activities" ON lead_activities;
CREATE POLICY "anon_update_lead_activities" ON lead_activities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lead_activities" ON lead_activities;
CREATE POLICY "anon_delete_lead_activities" ON lead_activities FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_created ON lead_activities (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities (activity_type);

-- ============================================================
-- LEAD SOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  channel text CHECK (channel IN ('direct', 'referral', 'website', 'social_media', 'whatsapp', 'cold_call', 'email_campaign', 'event', 'advertisement', 'marketplace', 'other')),
  description text,
  cost_per_lead numeric(10, 2) DEFAULT 0,
  monthly_budget numeric(10, 2) DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lead_sources" ON lead_sources;
CREATE POLICY "anon_select_lead_sources" ON lead_sources FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lead_sources" ON lead_sources;
CREATE POLICY "anon_insert_lead_sources" ON lead_sources FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lead_sources" ON lead_sources;
CREATE POLICY "anon_update_lead_sources" ON lead_sources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lead_sources" ON lead_sources;
CREATE POLICY "anon_delete_lead_sources" ON lead_sources FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lead_sources_channel ON lead_sources (channel);
CREATE INDEX IF NOT EXISTS idx_lead_sources_active ON lead_sources (is_active);

-- ============================================================
-- CUSTOMER INTERACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('call', 'email', 'meeting', 'support_ticket', 'whatsapp', 'sms', 'visit', 'demo', 'feedback', 'complaint', 'other')),
  subject text,
  description text,
  outcome text,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  handled_by text,
  duration_minutes integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customer_interactions" ON customer_interactions;
CREATE POLICY "anon_select_customer_interactions" ON customer_interactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_customer_interactions" ON customer_interactions;
CREATE POLICY "anon_insert_customer_interactions" ON customer_interactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_customer_interactions" ON customer_interactions;
CREATE POLICY "anon_update_customer_interactions" ON customer_interactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_customer_interactions" ON customer_interactions;
CREATE POLICY "anon_delete_customer_interactions" ON customer_interactions FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_created ON customer_interactions (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_type ON customer_interactions (interaction_type);

-- ============================================================
-- OPPORTUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  stage text NOT NULL DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  value numeric(12, 2) NOT NULL DEFAULT 0,
  probability integer DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date date,
  assigned_to text,
  decision_maker text,
  competitors text[],
  requirements jsonb DEFAULT '[]'::jsonb,
  loss_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_opportunities" ON opportunities;
CREATE POLICY "anon_select_opportunities" ON opportunities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_opportunities" ON opportunities;
CREATE POLICY "anon_insert_opportunities" ON opportunities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_opportunities" ON opportunities;
CREATE POLICY "anon_update_opportunities" ON opportunities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_opportunities" ON opportunities;
CREATE POLICY "anon_delete_opportunities" ON opportunities FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_opportunities_customer_id ON opportunities (customer_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities (lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities (stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_close_date ON opportunities (expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities (assigned_to);

-- ============================================================
-- SALES PIPELINE STAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage_key text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  color text DEFAULT '#3b82f6',
  is_won_stage boolean DEFAULT false,
  is_lost_stage boolean DEFAULT false,
  is_closed boolean DEFAULT false,
  probability integer DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales_pipeline_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sales_pipeline_stages" ON sales_pipeline_stages;
CREATE POLICY "anon_select_sales_pipeline_stages" ON sales_pipeline_stages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sales_pipeline_stages" ON sales_pipeline_stages;
CREATE POLICY "anon_insert_sales_pipeline_stages" ON sales_pipeline_stages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sales_pipeline_stages" ON sales_pipeline_stages;
CREATE POLICY "anon_update_sales_pipeline_stages" ON sales_pipeline_stages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sales_pipeline_stages" ON sales_pipeline_stages;
CREATE POLICY "anon_delete_sales_pipeline_stages" ON sales_pipeline_stages FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON sales_pipeline_stages (display_order);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_active ON sales_pipeline_stages (is_active);

-- Seed default pipeline stages
INSERT INTO sales_pipeline_stages (name, stage_key, display_order, color, probability) VALUES
  ('New', 'new', 1, '#6366f1', 10),
  ('Contacted', 'contacted', 2, '#0ea5e9', 25),
  ('Qualified', 'qualified', 3, '#06b6d4', 40),
  ('Proposal', 'proposal', 4, '#f59e0b', 60),
  ('Negotiation', 'negotiation', 5, '#f97316', 75),
  ('Won', 'won', 6, '#22c55e', 100),
  ('Lost', 'lost', 7, '#ef4444', 0)
ON CONFLICT (stage_key) DO NOTHING;
