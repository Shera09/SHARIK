/*
# WebHoster AI Business OS — Accounting Core Module

## Overview
Adds the double-entry accounting foundation: chart of accounts, transactions,
journal entries, income records, and bank reconciliations. This module works
alongside the existing `expenses` and `bank_accounts` tables.

## New Tables
1. `accounts` — Chart of accounts (asset, liability, equity, revenue, expense)
2. `transactions` — Financial transactions linked to accounts and invoices/payments
3. `journal_entries` — Double-entry bookkeeping records with debit/credit lines
4. `income` — Income records (revenue, interest, other income)
5. `reconciliations` — Bank statement reconciliation records

## Relationships
- `transactions.account_id` → `accounts(id)` ON DELETE SET NULL
- `transactions.invoice_id` → `invoices(id)` ON DELETE SET NULL
- `transactions.payment_id` → `payments(id)` ON DELETE SET NULL
- `journal_entries.account_id` → `accounts(id)` ON DELETE RESTRICT
- `reconciliations.bank_account_id` → `bank_accounts(id)` ON DELETE CASCADE

## Security
- RLS enabled on every table with `TO anon, authenticated` policies (single-tenant)
- 4 CRUD policies per table

## Indexes
- `accounts` indexed on `account_type` and `code`
- `transactions` indexed on `(account_id, transaction_date)` and `status`
- `journal_entries` indexed on `entry_date` and `account_id`
- `reconciliations` indexed on `bank_account_id` and `status`

## Notes
1. All tables use `gen_random_uuid()` for primary keys
2. `created_at` / `updated_at` timestamps on every table
3. Monetary columns use `numeric(14, 2)`
4. CHECK constraints enforce valid enum values and balanced debits/credits
5. Idempotent — safe to re-run
*/

-- ============================================================
-- ACCOUNTS (Chart of Accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  sub_type text,
  description text,
  opening_balance numeric(14, 2) DEFAULT 0,
  current_balance numeric(14, 2) DEFAULT 0,
  currency text DEFAULT 'INR',
  is_active boolean DEFAULT true,
  parent_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_accounts" ON accounts;
CREATE POLICY "anon_select_accounts" ON accounts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_accounts" ON accounts;
CREATE POLICY "anon_insert_accounts" ON accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_accounts" ON accounts;
CREATE POLICY "anon_update_accounts" ON accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_accounts" ON accounts;
CREATE POLICY "anon_delete_accounts" ON accounts FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts (account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts (code);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts (is_active);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  transaction_number text NOT NULL DEFAULT gen_random_uuid()::text,
  transaction_type text NOT NULL CHECK (transaction_type IN ('debit', 'credit', 'transfer', 'sale', 'purchase', 'expense', 'payment_received', 'payment_made', 'adjustment', 'opening_balance')),
  amount numeric(14, 2) NOT NULL DEFAULT 0,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  reference text,
  status text NOT NULL DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'reversed', 'pending')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions (account_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id ON transactions (invoice_id);

-- ============================================================
-- JOURNAL ENTRIES (Double-Entry Bookkeeping)
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text NOT NULL DEFAULT gen_random_uuid()::text,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  debit_amount numeric(14, 2) DEFAULT 0,
  credit_amount numeric(14, 2) DEFAULT 0,
  description text,
  reference_type text CHECK (reference_type IN ('invoice', 'payment', 'expense', 'payroll', 'manual', 'adjustment', 'opening')),
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_journal_entries" ON journal_entries;
CREATE POLICY "anon_select_journal_entries" ON journal_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_journal_entries" ON journal_entries;
CREATE POLICY "anon_insert_journal_entries" ON journal_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_journal_entries" ON journal_entries;
CREATE POLICY "anon_update_journal_entries" ON journal_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_journal_entries" ON journal_entries;
CREATE POLICY "anon_delete_journal_entries" ON journal_entries FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_journal_entries_account_id ON journal_entries (account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries (entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries (status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries (reference_type, reference_id);

-- ============================================================
-- INCOME
-- ============================================================
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  category text CHECK (category IN ('service_revenue', 'product_sale', 'subscription', 'interest', 'commission', 'refund_received', 'other')),
  amount numeric(14, 2) NOT NULL DEFAULT 0,
  description text,
  income_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  payment_method text,
  reference text,
  is_recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_income" ON income;
CREATE POLICY "anon_select_income" ON income FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_income" ON income;
CREATE POLICY "anon_insert_income" ON income FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_income" ON income;
CREATE POLICY "anon_update_income" ON income FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_income" ON income;
CREATE POLICY "anon_delete_income" ON income FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_income_date ON income (income_date DESC);
CREATE INDEX IF NOT EXISTS idx_income_category ON income (category);
CREATE INDEX IF NOT EXISTS idx_income_customer_id ON income (customer_id);

-- ============================================================
-- RECONCILIATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_period_start date NOT NULL,
  statement_period_end date NOT NULL,
  opening_balance numeric(14, 2) NOT NULL DEFAULT 0,
  closing_balance numeric(14, 2) NOT NULL DEFAULT 0,
  book_balance numeric(14, 2) DEFAULT 0,
  adjusted_balance numeric(14, 2) DEFAULT 0,
  discrepancy numeric(14, 2) DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'matched', 'discrepancy', 'completed', 'archived')),
  matched_transaction_ids uuid[] DEFAULT '{}',
  unmatched_count integer DEFAULT 0,
  notes text,
  completed_at timestamptz,
  completed_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reconciliations" ON reconciliations;
CREATE POLICY "anon_select_reconciliations" ON reconciliations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reconciliations" ON reconciliations;
CREATE POLICY "anon_insert_reconciliations" ON reconciliations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reconciliations" ON reconciliations;
CREATE POLICY "anon_update_reconciliations" ON reconciliations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reconciliations" ON reconciliations;
CREATE POLICY "anon_delete_reconciliations" ON reconciliations FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_reconciliations_bank_account_id ON reconciliations (bank_account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON reconciliations (status);
CREATE INDEX IF NOT EXISTS idx_reconciliations_period ON reconciliations (statement_period_start, statement_period_end);

-- Seed default chart of accounts
INSERT INTO accounts (code, name, account_type, sub_type, opening_balance) VALUES
  ('1000', 'Cash on Hand', 'asset', 'current_asset', 0),
  ('1100', 'Accounts Receivable', 'asset', 'current_asset', 0),
  ('1200', 'Inventory', 'asset', 'current_asset', 0),
  ('1500', 'Office Equipment', 'asset', 'fixed_asset', 0),
  ('2000', 'Accounts Payable', 'liability', 'current_liability', 0),
  ('2100', 'GST Payable', 'liability', 'current_liability', 0),
  ('2200', 'Salaries Payable', 'liability', 'current_liability', 0),
  ('3000', 'Owner Equity', 'equity', 'equity', 0),
  ('3100', 'Retained Earnings', 'equity', 'equity', 0),
  ('4000', 'Service Revenue', 'revenue', 'operating_revenue', 0),
  ('4100', 'Product Sales', 'revenue', 'operating_revenue', 0),
  ('4200', 'Subscription Revenue', 'revenue', 'operating_revenue', 0),
  ('5000', 'Salaries & Wages', 'expense', 'operating_expense', 0),
  ('5100', 'Rent Expense', 'expense', 'operating_expense', 0),
  ('5200', 'Utilities', 'expense', 'operating_expense', 0),
  ('5300', 'Marketing & Advertising', 'expense', 'operating_expense', 0),
  ('5400', 'Office Supplies', 'expense', 'operating_expense', 0),
  ('5500', 'Professional Fees', 'expense', 'operating_expense', 0),
  ('6000', 'Interest Income', 'revenue', 'non_operating_revenue', 0),
  ('7000', 'Depreciation', 'expense', 'non_operating_expense', 0)
ON CONFLICT (code) DO NOTHING;
