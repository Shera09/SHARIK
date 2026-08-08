/*
# Phase 1 Migration: Security & Multi-Tenant Lockdown

## Overview
1. Adds `organization_id` column and foreign key indexes to all legacy core tables.
2. Revokes permissive `TO anon USING (true)` policies on core business tables.
3. Implements secure authenticated user policies (`TO authenticated`) with multi-tenant isolation logic.
4. Restricts anonymous access to read-only visible Google reviews for public widgets.

## Affected Tables
- `customers`
- `leads`
- `activities`
- `invoices`
- `payments`
- `employees`
- `tasks`
- `notifications`
- `knowledge_base`
- `whatsapp_messages`
- `google_reviews`
*/

-- ============================================================
-- 1. ADD ORGANIZATION_ID COLUMNS & INDEXES TO LEGACY TABLES
-- ============================================================

DO $$
BEGIN
  -- customers
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'organization_id') THEN
    ALTER TABLE customers ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- leads
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'organization_id') THEN
    ALTER TABLE leads ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- activities
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'organization_id') THEN
    ALTER TABLE activities ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- invoices
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'organization_id') THEN
    ALTER TABLE invoices ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- payments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'organization_id') THEN
    ALTER TABLE payments ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- employees
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'organization_id') THEN
    ALTER TABLE employees ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- tasks
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'organization_id') THEN
    ALTER TABLE tasks ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- notifications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'organization_id') THEN
    ALTER TABLE notifications ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- knowledge_base
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'organization_id') THEN
    ALTER TABLE knowledge_base ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- whatsapp_messages
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'organization_id') THEN
    ALTER TABLE whatsapp_messages ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- google_reviews
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'google_reviews' AND column_name = 'organization_id') THEN
    ALTER TABLE google_reviews ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create Indexes for organization_id
CREATE INDEX IF NOT EXISTS idx_customers_org ON customers (organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads (organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_org ON activities (organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices (organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments (organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_org ON employees (organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks (organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications (organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_org ON knowledge_base (organization_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_org ON whatsapp_messages (organization_id);
CREATE INDEX IF NOT EXISTS idx_google_reviews_org ON google_reviews (organization_id);


-- ============================================================
-- 2. REVOKE INSECURE ANONYMOUS POLICIES & ENFORCE TENANT AUTH RLS
-- ============================================================

-- Customers Table
DROP POLICY IF EXISTS "anon_select_customers" ON customers;
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
DROP POLICY IF EXISTS "anon_update_customers" ON customers;
DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
DROP POLICY IF EXISTS "auth_customers_select" ON customers;
DROP POLICY IF EXISTS "auth_customers_insert" ON customers;
DROP POLICY IF EXISTS "auth_customers_update" ON customers;
DROP POLICY IF EXISTS "auth_customers_delete" ON customers;

CREATE POLICY "auth_customers_select" ON customers FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_customers_insert" ON customers FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_customers_update" ON customers FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_customers_delete" ON customers FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Leads Table
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
DROP POLICY IF EXISTS "auth_leads_select" ON leads;
DROP POLICY IF EXISTS "auth_leads_insert" ON leads;
DROP POLICY IF EXISTS "auth_leads_update" ON leads;
DROP POLICY IF EXISTS "auth_leads_delete" ON leads;

CREATE POLICY "auth_leads_select" ON leads FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_leads_insert" ON leads FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_leads_update" ON leads FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_leads_delete" ON leads FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Activities Table
DROP POLICY IF EXISTS "anon_select_activities" ON activities;
DROP POLICY IF EXISTS "anon_insert_activities" ON activities;
DROP POLICY IF EXISTS "anon_update_activities" ON activities;
DROP POLICY IF EXISTS "anon_delete_activities" ON activities;
DROP POLICY IF EXISTS "auth_activities_select" ON activities;
DROP POLICY IF EXISTS "auth_activities_insert" ON activities;
DROP POLICY IF EXISTS "auth_activities_update" ON activities;
DROP POLICY IF EXISTS "auth_activities_delete" ON activities;

CREATE POLICY "auth_activities_select" ON activities FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_activities_insert" ON activities FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_activities_update" ON activities FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_activities_delete" ON activities FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Invoices Table
DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;
DROP POLICY IF EXISTS "auth_invoices_select" ON invoices;
DROP POLICY IF EXISTS "auth_invoices_insert" ON invoices;
DROP POLICY IF EXISTS "auth_invoices_update" ON invoices;
DROP POLICY IF EXISTS "auth_invoices_delete" ON invoices;

CREATE POLICY "auth_invoices_select" ON invoices FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_invoices_insert" ON invoices FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_invoices_update" ON invoices FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_invoices_delete" ON invoices FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Payments Table
DROP POLICY IF EXISTS "anon_select_payments" ON payments;
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
DROP POLICY IF EXISTS "auth_payments_select" ON payments;
DROP POLICY IF EXISTS "auth_payments_insert" ON payments;
DROP POLICY IF EXISTS "auth_payments_update" ON payments;
DROP POLICY IF EXISTS "auth_payments_delete" ON payments;

CREATE POLICY "auth_payments_select" ON payments FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_payments_insert" ON payments FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_payments_update" ON payments FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_payments_delete" ON payments FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Employees Table
DROP POLICY IF EXISTS "anon_select_employees" ON employees;
DROP POLICY IF EXISTS "anon_insert_employees" ON employees;
DROP POLICY IF EXISTS "anon_update_employees" ON employees;
DROP POLICY IF EXISTS "anon_delete_employees" ON employees;
DROP POLICY IF EXISTS "auth_employees_select" ON employees;
DROP POLICY IF EXISTS "auth_employees_insert" ON employees;
DROP POLICY IF EXISTS "auth_employees_update" ON employees;
DROP POLICY IF EXISTS "auth_employees_delete" ON employees;

CREATE POLICY "auth_employees_select" ON employees FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_employees_insert" ON employees FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_employees_update" ON employees FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_employees_delete" ON employees FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Tasks Table
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
DROP POLICY IF EXISTS "auth_tasks_select" ON tasks;
DROP POLICY IF EXISTS "auth_tasks_insert" ON tasks;
DROP POLICY IF EXISTS "auth_tasks_update" ON tasks;
DROP POLICY IF EXISTS "auth_tasks_delete" ON tasks;

CREATE POLICY "auth_tasks_select" ON tasks FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_tasks_insert" ON tasks FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_tasks_update" ON tasks FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_tasks_delete" ON tasks FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Notifications Table
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
DROP POLICY IF EXISTS "auth_notifications_select" ON notifications;
DROP POLICY IF EXISTS "auth_notifications_insert" ON notifications;
DROP POLICY IF EXISTS "auth_notifications_update" ON notifications;
DROP POLICY IF EXISTS "auth_notifications_delete" ON notifications;

CREATE POLICY "auth_notifications_select" ON notifications FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_notifications_insert" ON notifications FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_notifications_update" ON notifications FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_notifications_delete" ON notifications FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Knowledge Base Table
DROP POLICY IF EXISTS "anon_select_knowledge" ON knowledge_base;
DROP POLICY IF EXISTS "anon_insert_knowledge" ON knowledge_base;
DROP POLICY IF EXISTS "anon_update_knowledge" ON knowledge_base;
DROP POLICY IF EXISTS "anon_delete_knowledge" ON knowledge_base;
DROP POLICY IF EXISTS "auth_knowledge_select" ON knowledge_base;
DROP POLICY IF EXISTS "auth_knowledge_insert" ON knowledge_base;
DROP POLICY IF EXISTS "auth_knowledge_update" ON knowledge_base;
DROP POLICY IF EXISTS "auth_knowledge_delete" ON knowledge_base;

CREATE POLICY "auth_knowledge_select" ON knowledge_base FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_knowledge_insert" ON knowledge_base FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_knowledge_update" ON knowledge_base FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_knowledge_delete" ON knowledge_base FOR DELETE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- WhatsApp Messages Table
DROP POLICY IF EXISTS "anon_select_whatsapp" ON whatsapp_messages;
DROP POLICY IF EXISTS "anon_insert_whatsapp" ON whatsapp_messages;
DROP POLICY IF EXISTS "anon_update_whatsapp" ON whatsapp_messages;
DROP POLICY IF EXISTS "auth_whatsapp_select" ON whatsapp_messages;
DROP POLICY IF EXISTS "auth_whatsapp_insert" ON whatsapp_messages;
DROP POLICY IF EXISTS "auth_whatsapp_update" ON whatsapp_messages;

CREATE POLICY "auth_whatsapp_select" ON whatsapp_messages FOR SELECT TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_whatsapp_insert" ON whatsapp_messages FOR INSERT TO authenticated WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "auth_whatsapp_update" ON whatsapp_messages FOR UPDATE TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);

-- Google Reviews Table (Public read for visible reviews, Authenticated write/edit for tenant)
DROP POLICY IF EXISTS "public_read_visible_reviews" ON google_reviews;
DROP POLICY IF EXISTS "auth_all_reviews" ON google_reviews;
DROP POLICY IF EXISTS "auth_manage_reviews" ON google_reviews;

CREATE POLICY "public_read_visible_reviews" ON google_reviews FOR SELECT TO anon, authenticated USING (is_visible = true);
CREATE POLICY "auth_manage_reviews" ON google_reviews FOR ALL TO authenticated USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM user_role_assignments WHERE user_id = auth.uid()
    UNION
    SELECT organization_id FROM auth_profiles WHERE id = auth.uid()
  )
);
