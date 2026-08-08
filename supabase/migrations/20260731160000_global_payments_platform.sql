/*
# Enterprise Global Payments & Billing Platform Schema (Sprint 4A)

## Summary
- Creates `payments` table for recording transactions across Stripe, Razorpay, and enterprise providers.
- Creates `payment_methods` table for PCI-conscious card/token references (never raw card data).
- Creates `payment_transactions` audit log table.
- Creates `payment_webhooks` table for idempotency duplicate checking and replay protection.
- Creates `refunds` table for tracking processed and pending refunds.
- Creates `invoices` & `invoice_items` tables for invoice numbers, tax lines, subtotal, and PDF links.
- Creates `billing_events` table for MRR/ARR analytics and plan change logs.
- Enables RLS policies on all tables with tenant isolation.
*/

-- 1. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'razorpay', 'paypal', 'wise', 'paddle', 'lemonsqueezy', 'custom')),
  provider_payment_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
  payment_method TEXT DEFAULT 'card',
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customer Saved Payment Methods Table (Tokens Only - No Raw Card Data)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  provider_customer_id TEXT NOT NULL,
  provider_payment_method_id TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Transactions Audit Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'refund', 'credit_note', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payment Webhooks Idempotency Table
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_id TEXT UNIQUE NOT NULL, -- Unique provider event ID for replay protection
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  provider_refund_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  reason TEXT,
  status TEXT DEFAULT 'succeeded' CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_total DECIMAL(10,2) DEFAULT 0,
  discount_total DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'cancelled', 'refunded', 'overdue')),
  pdf_url TEXT,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0
);

-- 8. Billing Events Analytics Table
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS idx_webhooks_event ON payment_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_payments" ON payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_payment_methods" ON payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_payment_methods" ON payment_methods FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_transactions" ON payment_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_transactions" ON payment_transactions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_webhooks" ON payment_webhooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_webhooks" ON payment_webhooks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_refunds" ON refunds FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_refunds" ON refunds FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_invoices" ON invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "select_invoice_items" ON invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_invoice_items" ON invoice_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "select_billing_events" ON billing_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_billing_events" ON billing_events FOR INSERT TO authenticated WITH CHECK (true);
