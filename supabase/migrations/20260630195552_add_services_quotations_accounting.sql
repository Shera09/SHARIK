/*
# Business OS — Services, Quotations & Accounting Tables

## Overview
Extends the existing schema with service catalog, GST slabs, quotations,
credit notes, and accounting tables. These power the Invoices, Payments,
and future Accounting modules.

## New Tables
1. `gst_slabs` — GST rate slabs (0%, 5%, 12%, 18%, 28%) with category labels
2. `services` — Service catalog (name, description, category, price, gst_slab, hsn_code)
3. `packages` — Bundled service packages (group of services at a price)
4. `quotations` — Pre-invoice quotations with line items as JSONB, GST, totals, validity
5. `credit_notes` — Credit notes against invoices (refunds, adjustments)
6. `expenses` — Business expense records (category, amount, date, payment method)
7. `bank_accounts` — Bank account ledger for accounting

## Security
- RLS enabled on every new table.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  — single-tenant app, no sign-in yet, anon-key client must read/write.

## Notes
1. `services.gst_slab_id` references `gst_slabs` for rate lookup.
2. `quotations.customer_id` references `customers`.
3. `credit_notes.invoice_id` references `invoices`.
4. `expenses` is standalone for basic accounting.
5. Indexes on frequently-queried columns (status, customer_id, invoice_id, category).
*/

-- ============================================================
-- GST SLABS
-- ============================================================
CREATE TABLE IF NOT EXISTS gst_slabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rate numeric(5, 2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gst_slabs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_gst_slabs" ON gst_slabs;
CREATE POLICY "anon_select_gst_slabs" ON gst_slabs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_gst_slabs" ON gst_slabs;
CREATE POLICY "anon_insert_gst_slabs" ON gst_slabs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_gst_slabs" ON gst_slabs;
CREATE POLICY "anon_update_gst_slabs" ON gst_slabs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_gst_slabs" ON gst_slabs;
CREATE POLICY "anon_delete_gst_slabs" ON gst_slabs FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  price numeric(12, 2) NOT NULL DEFAULT 0,
  gst_slab_id uuid REFERENCES gst_slabs (id) ON DELETE SET NULL,
  gst_rate numeric(5, 2) DEFAULT 18.0,
  hsn_code text,
  unit text DEFAULT 'each',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_services_category ON services (category);
CREATE INDEX IF NOT EXISTS idx_services_status ON services (status);

-- ============================================================
-- PACKAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  service_ids uuid[] DEFAULT '{}',
  price numeric(12, 2) NOT NULL DEFAULT 0,
  gst_rate numeric(5, 2) DEFAULT 18.0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_packages" ON packages;
CREATE POLICY "anon_select_packages" ON packages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_packages" ON packages;
CREATE POLICY "anon_insert_packages" ON packages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_packages" ON packages;
CREATE POLICY "anon_update_packages" ON packages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_packages" ON packages;
CREATE POLICY "anon_delete_packages" ON packages FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- QUOTATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers (id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  customer_gst text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12, 2) NOT NULL DEFAULT 0,
  gst_rate numeric(5, 2) DEFAULT 18.0,
  gst_amount numeric(12, 2) DEFAULT 0,
  total numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  valid_until date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_quotations" ON quotations;
CREATE POLICY "anon_select_quotations" ON quotations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quotations" ON quotations;
CREATE POLICY "anon_insert_quotations" ON quotations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quotations" ON quotations;
CREATE POLICY "anon_update_quotations" ON quotations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quotations" ON quotations;
CREATE POLICY "anon_delete_quotations" ON quotations FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations (customer_id);

-- ============================================================
-- CREDIT NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number text UNIQUE NOT NULL,
  invoice_id uuid REFERENCES invoices (id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers (id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  reason text,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'applied', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_credit_notes" ON credit_notes;
CREATE POLICY "anon_select_credit_notes" ON credit_notes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_credit_notes" ON credit_notes;
CREATE POLICY "anon_insert_credit_notes" ON credit_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_credit_notes" ON credit_notes;
CREATE POLICY "anon_update_credit_notes" ON credit_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_credit_notes" ON credit_notes;
CREATE POLICY "anon_delete_credit_notes" ON credit_notes FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice ON credit_notes (invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_customer ON credit_notes (customer_id);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  description text,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'bank_transfer' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'card', 'other')),
  vendor text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded', 'reimbursed', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (expense_date DESC);

-- ============================================================
-- BANK ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text,
  ifsc_code text,
  balance numeric(12, 2) DEFAULT 0,
  account_type text DEFAULT 'current' CHECK (account_type IN ('savings', 'current', 'od', 'cc')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_select_bank_accounts" ON bank_accounts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_insert_bank_accounts" ON bank_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_update_bank_accounts" ON bank_accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_delete_bank_accounts" ON bank_accounts FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- Triggers for updated_at on new tables
-- ============================================================
DROP TRIGGER IF EXISTS trg_services_updated ON services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_packages_updated ON packages;
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_quotations_updated ON quotations;
CREATE TRIGGER trg_quotations_updated BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_credit_notes_updated ON credit_notes;
CREATE TRIGGER trg_credit_notes_updated BEFORE UPDATE ON credit_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_expenses_updated ON expenses;
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bank_accounts_updated ON bank_accounts;
CREATE TRIGGER trg_bank_accounts_updated BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
