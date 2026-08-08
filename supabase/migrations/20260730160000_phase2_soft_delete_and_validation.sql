/*
# Phase 2 Migration: Soft Delete Pattern & Organization Settings Table

## Overview
1. Adds `deleted_at timestamptz DEFAULT NULL` column to core tables for soft deletion.
2. Creates `organization_settings` table for persistent company, regional, billing, and notification configurations.
3. Enables RLS on `organization_settings` with authenticated policies.
*/

-- ============================================================
-- 1. ADD DELETED_AT COLUMN & INDEXES TO CORE TABLES
-- ============================================================

DO $$
BEGIN
  -- customers
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'deleted_at') THEN
    ALTER TABLE customers ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- leads
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'deleted_at') THEN
    ALTER TABLE leads ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- activities
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'deleted_at') THEN
    ALTER TABLE activities ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- invoices
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deleted_at') THEN
    ALTER TABLE invoices ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- payments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'deleted_at') THEN
    ALTER TABLE payments ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- employees
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'deleted_at') THEN
    ALTER TABLE employees ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- tasks
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'deleted_at') THEN
    ALTER TABLE tasks ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- notifications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'deleted_at') THEN
    ALTER TABLE notifications ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- knowledge_base
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'deleted_at') THEN
    ALTER TABLE knowledge_base ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- whatsapp_messages
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'deleted_at') THEN
    ALTER TABLE whatsapp_messages ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  -- google_reviews
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'google_reviews' AND column_name = 'deleted_at') THEN
    ALTER TABLE google_reviews ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Indexes for soft deletion filtering
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_deleted ON leads (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_deleted ON payments (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_deleted ON employees (deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- 2. CREATE ORGANIZATION SETTINGS TABLE FOR PERSISTENT SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, setting_key)
);

ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_org_settings_select" ON organization_settings;
DROP POLICY IF EXISTS "auth_org_settings_insert" ON organization_settings;
DROP POLICY IF EXISTS "auth_org_settings_update" ON organization_settings;

CREATE POLICY "auth_org_settings_select" ON organization_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_org_settings_insert" ON organization_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_org_settings_update" ON organization_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
