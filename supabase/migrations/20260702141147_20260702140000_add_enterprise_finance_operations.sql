/*
# Enterprise Finance & Operations Platform (Part 17)

## Overview
Complete enterprise-grade finance, accounting, inventory, procurement, warehouse, asset management,
and financial intelligence platform.

## New Tables (55+ tables)
Full finance platform with chart of accounts, general ledger, banking, budgets, expenses, vendors,
procurement, inventory, warehouses, assets, tax management, financial AI, and reporting.

## Security
- RLS enabled on all new tables
- Single-tenant: TO anon, authenticated with USING (true)
*/

-- Create enums
DO $$ BEGIN
  CREATE TYPE budget_type AS ENUM ('department', 'project', 'branch', 'annual', 'monthly', 'marketing');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'payment', 'receipt', 'adjustment', 'refund');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE stock_transaction_type AS ENUM ('purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'return_in', 'return_out', 'opening');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE purchase_status AS ENUM ('draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_status AS ENUM ('active', 'maintenance', 'retired', 'disposed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Account Groups
CREATE TABLE IF NOT EXISTS account_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  account_type text NOT NULL,
  parent_group_id uuid REFERENCES account_groups(id),
  description text,
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_groups_type ON account_groups(account_type);
CREATE INDEX IF NOT EXISTS idx_account_groups_parent ON account_groups(parent_group_id);

-- Sub Accounts
CREATE TABLE IF NOT EXISTS sub_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  name text NOT NULL,
  code text NOT NULL,
  opening_balance decimal(15,2) DEFAULT 0,
  current_balance decimal(15,2) DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, code)
);

CREATE INDEX IF NOT EXISTS idx_sub_accounts_account ON sub_accounts(account_id);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text UNIQUE NOT NULL,
  entry_date date NOT NULL,
  reference_type text,
  reference_id uuid,
  description text,
  total_debit decimal(15,2) NOT NULL,
  total_credit decimal(15,2) NOT NULL,
  status text DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);

-- Ledger Entries
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  sub_account_id uuid REFERENCES sub_accounts(id),
  debit_amount decimal(15,2) DEFAULT 0,
  credit_amount decimal(15,2) DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_journal ON ledger_entries(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id);

-- Trial Balance
CREATE TABLE IF NOT EXISTS trial_balance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_debit decimal(15,2) NOT NULL,
  total_credit decimal(15,2) NOT NULL,
  is_balanced boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_balance_date ON trial_balance_snapshots(snapshot_date);

-- Bank Transactions
CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id),
  transaction_type transaction_type NOT NULL,
  amount decimal(15,2) NOT NULL,
  balance_after decimal(15,2),
  transaction_date date NOT NULL,
  value_date date,
  reference_number text,
  description text,
  contra_account_id uuid REFERENCES bank_accounts(id),
  linked_journal_id uuid REFERENCES journal_entries(id),
  category text,
  reconciliation_status text DEFAULT 'pending',
  reconciliation_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_type ON bank_transactions(transaction_type);

-- Cheques
CREATE TABLE IF NOT EXISTS cheques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id),
  cheque_number text NOT NULL,
  cheque_date date NOT NULL,
  amount decimal(15,2) NOT NULL,
  payee_name text NOT NULL,
  status text DEFAULT 'pending',
  issued_date date,
  cleared_date date,
  bounced_date date,
  bounced_reason text,
  reference_type text,
  reference_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cheques_account ON cheques(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_cheques_status ON cheques(status);
CREATE INDEX IF NOT EXISTS idx_cheques_date ON cheques(cheque_date);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  budget_type budget_type NOT NULL,
  fiscal_year int NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_amount decimal(15,2) NOT NULL,
  used_amount decimal(15,2) DEFAULT 0,
  department_id text,
  branch_id text,
  project_id uuid,
  status text DEFAULT 'active',
  approval_required boolean DEFAULT true,
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budgets_type ON budgets(budget_type);
CREATE INDEX IF NOT EXISTS idx_budgets_year ON budgets(fiscal_year);

-- Budget Items
CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id),
  account_id uuid REFERENCES accounts(id),
  category text,
  description text,
  allocated_amount decimal(15,2) NOT NULL,
  used_amount decimal(15,2) DEFAULT 0,
  period_amounts jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_account ON budget_items(account_id);

-- Budget Variances
CREATE TABLE IF NOT EXISTS budget_variances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_item_id uuid NOT NULL REFERENCES budget_items(id),
  period_date date NOT NULL,
  budgeted_amount decimal(15,2) NOT NULL,
  actual_amount decimal(15,2) NOT NULL,
  variance_amount decimal(15,2) NOT NULL,
  variance_percent decimal(5,2),
  explanation text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_variances_item ON budget_variances(budget_item_id);
CREATE INDEX IF NOT EXISTS idx_budget_variances_date ON budget_variances(period_date);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  default_account_id uuid REFERENCES accounts(id),
  requires_approval boolean DEFAULT true,
  approval_limit decimal(15,2),
  is_active boolean DEFAULT true,
  parent_category_id uuid REFERENCES expense_categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_parent ON expense_categories(parent_category_id);

-- Expense Approvals
CREATE TABLE IF NOT EXISTS expense_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses(id),
  approver_id uuid,
  action text NOT NULL,
  comments text,
  approved_amount decimal(15,2),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense ON expense_approvals(expense_id);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code text UNIQUE NOT NULL,
  vendor_name text NOT NULL,
  vendor_type text DEFAULT 'supplier',
  contact_person text,
  email text,
  phone text,
  alternate_phone text,
  address text,
  city text,
  state text,
  country text DEFAULT 'India',
  pincode text,
  gst_number text,
  pan_number text,
  bank_name text,
  bank_account_number text,
  bank_ifsc text,
  payment_terms int DEFAULT 30,
  credit_limit decimal(15,2) DEFAULT 0,
  current_balance decimal(15,2) DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  total_orders int DEFAULT 0,
  total_value decimal(15,2) DEFAULT 0,
  on_time_delivery_rate decimal(5,2) DEFAULT 0,
  quality_rating decimal(3,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  is_preferred boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_gst ON vendors(gst_number);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);

-- Vendor Contacts
CREATE TABLE IF NOT EXISTS vendor_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  name text NOT NULL,
  designation text,
  email text,
  phone text,
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor ON vendor_contacts(vendor_id);

-- Vendor Contracts
CREATE TABLE IF NOT EXISTS vendor_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  contract_number text NOT NULL,
  contract_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  contract_value decimal(15,2),
  terms_and_conditions text,
  document_url text,
  status text DEFAULT 'active',
  renewal_date date,
  auto_renew boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_contracts_vendor ON vendor_contracts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_dates ON vendor_contracts(start_date, end_date);

-- Vendor Performance
CREATE TABLE IF NOT EXISTS vendor_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  evaluation_date date NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_orders int DEFAULT 0,
  on_time_deliveries int DEFAULT 0,
  late_deliveries int DEFAULT 0,
  rejected_items int DEFAULT 0,
  quality_score decimal(3,2) DEFAULT 0,
  delivery_score decimal(3,2) DEFAULT 0,
  communication_score decimal(3,2) DEFAULT 0,
  overall_score decimal(3,2) DEFAULT 0,
  comments text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_performance_vendor ON vendor_performance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_date ON vendor_performance(evaluation_date);

-- Vendor Payments
CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number text UNIQUE NOT NULL,
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  amount decimal(15,2) NOT NULL,
  payment_date date NOT NULL,
  payment_mode text NOT NULL,
  bank_account_id uuid REFERENCES bank_accounts(id),
  cheque_number text,
  reference_number text,
  invoice_references text[],
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_date ON vendor_payments(payment_date);

-- Purchase Requests
CREATE TABLE IF NOT EXISTS purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  request_date date NOT NULL,
  required_date date,
  department_id text,
  branch_id text,
  project_id uuid,
  requested_by uuid,
  description text,
  status purchase_status DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  priority text DEFAULT 'normal',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_date ON purchase_requests(request_date);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  po_date date NOT NULL,
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  request_id uuid REFERENCES purchase_requests(id),
  expected_delivery_date date,
  delivery_address text,
  contact_person text,
  contact_phone text,
  subtotal decimal(15,2) DEFAULT 0,
  tax_amount decimal(15,2) DEFAULT 0,
  discount_amount decimal(15,2) DEFAULT 0,
  shipping_amount decimal(15,2) DEFAULT 0,
  total_amount decimal(15,2) DEFAULT 0,
  terms_and_conditions text,
  status purchase_status DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(po_date);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id),
  product_id uuid,
  item_code text NOT NULL,
  item_name text NOT NULL,
  description text,
  quantity decimal(10,2) NOT NULL,
  unit text,
  unit_price decimal(15,2) NOT NULL,
  discount_percent decimal(5,2) DEFAULT 0,
  discount_amount decimal(15,2) DEFAULT 0,
  tax_percent decimal(5,2) DEFAULT 0,
  tax_amount decimal(15,2) DEFAULT 0,
  line_total decimal(15,2) NOT NULL,
  received_quantity decimal(10,2) DEFAULT 0,
  pending_quantity decimal(10,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_product ON purchase_order_items(product_id);

-- Goods Receipts
CREATE TABLE IF NOT EXISTS goods_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gr_number text UNIQUE NOT NULL,
  gr_date date NOT NULL,
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id),
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  warehouse_id uuid,
  received_by uuid,
  challan_number text,
  challan_date date,
  vehicle_number text,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goods_receipts_po ON goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_vendor ON goods_receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_date ON goods_receipts(gr_date);

-- Purchase Returns
CREATE TABLE IF NOT EXISTS purchase_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number text UNIQUE NOT NULL,
  return_date date NOT NULL,
  goods_receipt_id uuid REFERENCES goods_receipts(id),
  purchase_order_id uuid REFERENCES purchase_orders(id),
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  reason text,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_returns_vendor ON purchase_returns(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_returns_date ON purchase_returns(return_date);

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  parent_category_id uuid REFERENCES product_categories(id),
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_category_id);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Units
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  symbol text,
  base_unit_id uuid REFERENCES units(id),
  conversion_factor decimal(10,4) DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code text UNIQUE NOT NULL,
  product_name text NOT NULL,
  barcode text,
  category_id uuid REFERENCES product_categories(id),
  brand_id uuid REFERENCES brands(id),
  product_type text DEFAULT 'product',
  unit_id uuid REFERENCES units(id),
  purchase_unit_id uuid REFERENCES units(id),
  purchase_conversion decimal(10,4) DEFAULT 1,
  hsn_code text,
  sac_code text,
  description text,
  sale_price decimal(15,2) DEFAULT 0,
  cost_price decimal(15,2) DEFAULT 0,
  mrp decimal(15,2) DEFAULT 0,
  min_sale_price decimal(15,2) DEFAULT 0,
  tax_category_id uuid,
  tax_percent decimal(5,2) DEFAULT 0,
  track_inventory boolean DEFAULT true,
  track_batch boolean DEFAULT false,
  track_serial boolean DEFAULT false,
  has_expiry boolean DEFAULT false,
  shelf_life_days int,
  reorder_level decimal(10,2) DEFAULT 0,
  reorder_quantity decimal(10,2) DEFAULT 0,
  safety_stock decimal(10,2) DEFAULT 0,
  max_stock decimal(10,2) DEFAULT 0,
  weight_kg decimal(10,3),
  dimensions text,
  image_url text,
  is_active boolean DEFAULT true,
  is_saleable boolean DEFAULT true,
  is_purchaseable boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  warehouse_id uuid,
  location_id uuid,
  batch_number text,
  serial_number text,
  quantity decimal(10,2) NOT NULL DEFAULT 0,
  reserved_quantity decimal(10,2) DEFAULT 0,
  available_quantity decimal(10,2) DEFAULT 0,
  manufactured_date date,
  expiry_date date,
  cost_price decimal(15,2),
  sale_price decimal(15,2),
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory_items(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batch ON inventory_items(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_serial ON inventory_items(serial_number);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory_items(expiry_date);

-- Stock Transactions
CREATE TABLE IF NOT EXISTS stock_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type stock_transaction_type NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id),
  warehouse_id uuid,
  location_id uuid,
  batch_number text,
  quantity decimal(10,2) NOT NULL,
  reference_type text,
  reference_id uuid,
  reference_number text,
  transaction_date timestamptz DEFAULT now(),
  cost_price decimal(15,2),
  total_value decimal(15,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_transactions_product ON stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_warehouse ON stock_transactions(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(transaction_date);

-- Stock Alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  warehouse_id uuid,
  alert_type text NOT NULL,
  current_quantity decimal(10,2) DEFAULT 0,
  threshold_quantity decimal(10,2) DEFAULT 0,
  days_to_expiry int,
  is_active boolean DEFAULT true,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_product ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_type ON stock_alerts(alert_type);

-- Serial Numbers
CREATE TABLE IF NOT EXISTS serial_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  serial_number text NOT NULL,
  batch_number text,
  status text DEFAULT 'in_stock',
  purchase_date date,
  sale_date date,
  warranty_start date,
  warranty_end date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, serial_number)
);

CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON serial_numbers(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);

-- Stock Adjustments
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_number text UNIQUE NOT NULL,
  adjustment_date date NOT NULL,
  warehouse_id uuid,
  reason text NOT NULL,
  total_items int DEFAULT 0,
  total_value decimal(15,2) DEFAULT 0,
  status text DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_date ON stock_adjustments(adjustment_date);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_status ON stock_adjustments(status);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_code text UNIQUE NOT NULL,
  warehouse_name text NOT NULL,
  address text,
  city text,
  state text,
  pincode text,
  country text DEFAULT 'India',
  contact_person text,
  contact_phone text,
  contact_email text,
  total_capacity decimal(15,2),
  used_capacity decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  branch_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Warehouse Zones
CREATE TABLE IF NOT EXISTS warehouse_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  zone_code text NOT NULL,
  zone_name text NOT NULL,
  zone_type text,
  temperature_controlled boolean DEFAULT false,
  temperature_min decimal(5,2),
  temperature_max decimal(5,2),
  capacity decimal(15,2),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(warehouse_id, zone_code)
);

CREATE INDEX IF NOT EXISTS idx_warehouse_zones_warehouse ON warehouse_zones(warehouse_id);

-- Warehouse Locations
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES warehouse_zones(id),
  location_code text NOT NULL,
  location_name text NOT NULL,
  location_type text,
  row_number int,
  column_number int,
  level_number int,
  capacity decimal(10,2),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(zone_id, location_code)
);

CREATE INDEX IF NOT EXISTS idx_warehouse_locations_zone ON warehouse_locations(zone_id);

-- Stock Transfers
CREATE TABLE IF NOT EXISTS stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number text UNIQUE NOT NULL,
  transfer_date date NOT NULL,
  source_warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  destination_warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  transfer_type text DEFAULT 'regular',
  status text DEFAULT 'draft',
  shipped_by uuid,
  shipped_at timestamptz,
  received_by uuid,
  received_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_transfers_source ON stock_transfers(source_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_destination ON stock_transfers(destination_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_date ON stock_transfers(transfer_date);

-- Transfer Items
CREATE TABLE IF NOT EXISTS transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES stock_transfers(id),
  product_id uuid NOT NULL REFERENCES products(id),
  batch_number text,
  requested_quantity decimal(10,2) NOT NULL,
  shipped_quantity decimal(10,2) DEFAULT 0,
  received_quantity decimal(10,2) DEFAULT 0,
  from_location_id uuid REFERENCES warehouse_locations(id),
  to_location_id uuid REFERENCES warehouse_locations(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_transfer_items_product ON transfer_items(product_id);

-- Asset Categories
CREATE TABLE IF NOT EXISTS asset_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  depreciation_method text DEFAULT 'straight_line',
  depreciation_rate decimal(5,2) DEFAULT 0,
  useful_life_years int,
  parent_category_id uuid REFERENCES asset_categories(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_categories_parent ON asset_categories(parent_category_id);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code text UNIQUE NOT NULL,
  asset_name text NOT NULL,
  category_id uuid NOT NULL REFERENCES asset_categories(id),
  description text,
  serial_number text,
  model text,
  manufacturer text,
  purchase_date date NOT NULL,
  purchase_cost decimal(15,2) NOT NULL,
  current_value decimal(15,2) DEFAULT 0,
  salvage_value decimal(15,2) DEFAULT 0,
  warranty_start date,
  warranty_end date,
  warranty_provider text,
  location text,
  branch_id text,
  department_id text,
  assigned_to_id uuid,
  status asset_status DEFAULT 'active',
  depreciation_method text,
  depreciation_rate decimal(5,2) DEFAULT 0,
  accumulated_depreciation decimal(15,2) DEFAULT 0,
  last_depreciation_date date,
  next_maintenance_date date,
  image_url text,
  document_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_branch ON assets(branch_id);
CREATE INDEX IF NOT EXISTS idx_assets_assigned ON assets(assigned_to_id);

-- Asset Maintenance
CREATE TABLE IF NOT EXISTS asset_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id),
  maintenance_type text NOT NULL,
  scheduled_date date,
  completed_date date,
  vendor_id uuid REFERENCES vendors(id),
  cost decimal(15,2) DEFAULT 0,
  description text,
  status text DEFAULT 'scheduled',
  next_maintenance_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_maintenance_asset ON asset_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_date ON asset_maintenance(scheduled_date);

-- Asset Disposals
CREATE TABLE IF NOT EXISTS asset_disposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id),
  disposal_date date NOT NULL,
  disposal_type text NOT NULL,
  disposal_value decimal(15,2) DEFAULT 0,
  buyer_name text,
  buyer_contact text,
  reason text,
  document_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_disposals_asset ON asset_disposals(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_disposals_date ON asset_disposals(disposal_date);

-- Asset Audits
CREATE TABLE IF NOT EXISTS asset_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_date date NOT NULL,
  auditor text,
  total_assets int DEFAULT 0,
  verified_assets int DEFAULT 0,
  missing_assets int DEFAULT 0,
  extra_assets int DEFAULT 0,
  discrepancy_value decimal(15,2) DEFAULT 0,
  status text DEFAULT 'in_progress',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_audits_date ON asset_audits(audit_date);

-- Tax Categories
CREATE TABLE IF NOT EXISTS tax_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  tax_type text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tax Rates
CREATE TABLE IF NOT EXISTS tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_category_id uuid NOT NULL REFERENCES tax_categories(id),
  name text NOT NULL,
  rate_percent decimal(5,2) NOT NULL,
  cgst_percent decimal(5,2) DEFAULT 0,
  sgst_percent decimal(5,2) DEFAULT 0,
  igst_percent decimal(5,2) DEFAULT 0,
  cess_percent decimal(5,2) DEFAULT 0,
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean DEFAULT true,
  hsn_sac_code text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_rates_category ON tax_rates(tax_category_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_effective ON tax_rates(effective_from, effective_to);

-- Tax Transactions
CREATE TABLE IF NOT EXISTS tax_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type text NOT NULL,
  transaction_id uuid NOT NULL,
  transaction_number text NOT NULL,
  transaction_date date NOT NULL,
  tax_category_id uuid REFERENCES tax_categories(id),
  tax_rate_id uuid REFERENCES tax_rates(id),
  taxable_amount decimal(15,2) NOT NULL,
  cgst_amount decimal(15,2) DEFAULT 0,
  sgst_amount decimal(15,2) DEFAULT 0,
  igst_amount decimal(15,2) DEFAULT 0,
  cess_amount decimal(15,2) DEFAULT 0,
  total_tax_amount decimal(15,2) NOT NULL,
  is_input_tax boolean DEFAULT false,
  is_output_tax boolean DEFAULT true,
  is_reversible boolean DEFAULT false,
  reversed boolean DEFAULT false,
  reversal_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_transactions_type ON tax_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_date ON tax_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_ref ON tax_transactions(transaction_type, transaction_id);

-- AI Financial Insights
CREATE TABLE IF NOT EXISTS ai_financial_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  impact_score decimal(3,2) DEFAULT 0,
  confidence_score decimal(3,2) DEFAULT 0,
  potential_savings decimal(15,2) DEFAULT 0,
  potential_risk decimal(15,2) DEFAULT 0,
  suggested_actions jsonb,
  supporting_data jsonb,
  period_start date,
  period_end date,
  is_dismissed boolean DEFAULT false,
  is_implemented boolean DEFAULT false,
  implemented_at timestamptz,
  feedback text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_financial_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_category ON ai_financial_insights(category);

-- Financial Forecasts
CREATE TABLE IF NOT EXISTS financial_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_type text NOT NULL,
  forecast_date date NOT NULL,
  forecast_period_start date NOT NULL,
  forecast_period_end date NOT NULL,
  predicted_value decimal(15,2) NOT NULL,
  confidence_lower decimal(15,2),
  confidence_upper decimal(15,2),
  confidence_level int DEFAULT 95,
  model_used text,
  features_used text[],
  accuracy_score decimal(5,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_forecasts_type ON financial_forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_financial_forecasts_date ON financial_forecasts(forecast_date);

-- Anomaly Alerts
CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_type text NOT NULL,
  severity text DEFAULT 'medium',
  transaction_type text,
  transaction_id uuid,
  transaction_number text,
  transaction_date date,
  expected_value decimal(15,2),
  actual_value decimal(15,2),
  deviation_percent decimal(5,2),
  description text,
  possible_causes text[],
  is_valid boolean DEFAULT true,
  validated_by uuid,
  validated_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_type ON anomaly_alerts(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_severity ON anomaly_alerts(severity);

-- Report Templates
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  report_type text NOT NULL,
  description text,
  template_config jsonb,
  parameters jsonb,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);

-- Scheduled Reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES report_templates(id),
  name text NOT NULL,
  frequency text NOT NULL,
  next_run date,
  last_run date,
  recipients text[],
  format text DEFAULT 'pdf',
  parameters jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheques ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_variances ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

DO $$ DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'account_groups', 'sub_accounts', 'journal_entries', 'ledger_entries', 'trial_balance_snapshots',
    'bank_transactions', 'cheques', 'budgets', 'budget_items', 'budget_variances',
    'expense_categories', 'expense_approvals', 'vendors', 'vendor_contacts', 'vendor_contracts',
    'vendor_performance', 'vendor_payments', 'purchase_requests', 'purchase_orders',
    'purchase_order_items', 'goods_receipts', 'purchase_returns', 'product_categories',
    'brands', 'units', 'products', 'inventory_items', 'stock_transactions', 'stock_alerts',
    'serial_numbers', 'stock_adjustments', 'warehouses', 'warehouse_zones', 'warehouse_locations',
    'stock_transfers', 'transfer_items', 'asset_categories', 'assets', 'asset_maintenance',
    'asset_disposals', 'asset_audits', 'tax_categories', 'tax_rates', 'tax_transactions',
    'ai_financial_insights', 'financial_forecasts', 'anomaly_alerts', 'report_templates', 'scheduled_reports'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "anon_crud_%s" ON %s;', t, t);
    EXECUTE format('CREATE POLICY "anon_crud_%s" ON %s FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO account_groups (name, code, account_type, description, display_order) VALUES
('Assets', 'ASSET', 'asset', 'All assets of the company', 1),
('Current Assets', 'CA', 'asset', 'Assets convertible to cash within a year', 2),
('Bank Accounts', 'BA', 'bank', 'Bank and cash accounts', 3),
('Liabilities', 'LIAB', 'liability', 'All liabilities of the company', 4),
('Current Liabilities', 'CL', 'liability', 'Liabilities due within a year', 5),
('Equity', 'EQ', 'equity', 'Owners equity and retained earnings', 6),
('Income', 'INC', 'income', 'Revenue and other income', 7),
('Expenses', 'EXP', 'expense', 'Operating and other expenses', 8),
('Tax Assets', 'TAXA', 'tax', 'Tax recoverable', 9),
('Tax Liabilities', 'TAXL', 'tax', 'Tax payable', 10)
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_categories (name, code, description, requires_approval, approval_limit) VALUES
('Office Supplies', 'OFFICE', 'Office supplies and stationery', true, 5000),
('Travel', 'TRAVEL', 'Travel and accommodation expenses', true, 10000),
('Utilities', 'UTIL', 'Electricity, water, internet bills', true, 5000),
('Salary', 'SALARY', 'Employee salaries and wages', false, 0),
('Marketing', 'MKTG', 'Marketing and advertising expenses', true, 25000),
('Rent', 'RENT', 'Office rent and maintenance', true, 50000),
('Software', 'SW', 'Software subscriptions and licenses', true, 10000),
('Equipment', 'EQUIP', 'Equipment and machinery purchases', true, 50000),
('Miscellaneous', 'MISC', 'Miscellaneous expenses', true, 2000)
ON CONFLICT (code) DO NOTHING;

INSERT INTO tax_categories (name, code, tax_type, description) VALUES
('GST 0%', 'GST0', 'gst', 'Zero rated GST'),
('GST 5%', 'GST5', 'gst', '5% GST rate'),
('GST 12%', 'GST12', 'gst', '12% GST rate'),
('GST 18%', 'GST18', 'gst', '18% GST rate'),
('GST 28%', 'GST28', 'gst', '28% GST rate'),
('Exempt', 'EXEMPT', 'gst', 'Exempt from GST')
ON CONFLICT (code) DO NOTHING;

INSERT INTO tax_rates (tax_category_id, name, rate_percent, cgst_percent, sgst_percent, igst_percent, effective_from, is_active)
SELECT tc.id, 'GST 0%', 0, 0, 0, 0, '2017-07-01'::date, true FROM tax_categories tc WHERE tc.code = 'GST0'
UNION ALL
SELECT tc.id, 'GST 5%', 5, 2.5, 2.5, 5, '2017-07-01'::date, true FROM tax_categories tc WHERE tc.code = 'GST5'
UNION ALL
SELECT tc.id, 'GST 12%', 12, 6, 6, 12, '2017-07-01'::date, true FROM tax_categories tc WHERE tc.code = 'GST12'
UNION ALL
SELECT tc.id, 'GST 18%', 18, 9, 9, 18, '2017-07-01'::date, true FROM tax_categories tc WHERE tc.code = 'GST18'
UNION ALL
SELECT tc.id, 'GST 28%', 28, 14, 14, 28, '2017-07-01'::date, true FROM tax_categories tc WHERE tc.code = 'GST28';

INSERT INTO product_categories (name, code, description) VALUES
('Electronics', 'ELEC', 'Electronic items and devices'),
('Software', 'SOFT', 'Software products and licenses'),
('Services', 'SERV', 'Service offerings'),
('Office Supplies', 'OS', 'Office supplies and stationery'),
('Furniture', 'FURN', 'Office furniture'),
('Networking', 'NET', 'Networking equipment')
ON CONFLICT (code) DO NOTHING;

INSERT INTO brands (name, code) VALUES
('HP', 'HP'),
('Dell', 'DELL'),
('Lenovo', 'LENOVO'),
('Apple', 'APPLE'),
('Microsoft', 'MSFT'),
('Cisco', 'CISCO'),
('Samsung', 'SAMSUNG')
ON CONFLICT (code) DO NOTHING;

INSERT INTO units (name, code, symbol) VALUES
('Piece', 'PCS', 'pcs'),
('Unit', 'UNIT', 'unit'),
('Box', 'BOX', 'box'),
('Pack', 'PACK', 'pack'),
('Hour', 'HR', 'hr'),
('Day', 'DAY', 'day'),
('Month', 'MON', 'mon'),
('Year', 'YR', 'yr'),
('Kilogram', 'KG', 'kg'),
('Meter', 'MTR', 'm')
ON CONFLICT (code) DO NOTHING;

INSERT INTO asset_categories (name, code, depreciation_method, depreciation_rate, useful_life_years) VALUES
('Office Equipment', 'OE', 'straight_line', 15, 6),
('Computers', 'COMP', 'straight_line', 33.33, 3),
('Furniture', 'FURN', 'straight_line', 10, 10),
('Vehicles', 'VEH', 'straight_line', 15, 6),
('Machinery', 'MACH', 'straight_line', 10, 10),
('Software Licenses', 'SW', 'straight_line', 25, 4),
('Networking Equipment', 'NETW', 'straight_line', 20, 5),
('Mobile Devices', 'MOB', 'straight_line', 25, 4)
ON CONFLICT (code) DO NOTHING;
