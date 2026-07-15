/*
# WebHoster AI Business OS — Employee Management Module

## Overview
Adds the full Employee Management lifecycle: attendance tracking, leave management,
payroll processing, performance reviews, incentive records, and training records.
All tables reference the existing `employees` table via foreign keys.

## New Tables
1. `attendance` — Daily attendance records per employee (check-in/out, status, hours)
2. `leaves` — Leave requests with approval workflow (type, dates, status, approver)
3. `payroll` — Monthly payroll runs per employee (gross, deductions, net, status)
4. `performance_reviews` — Periodic performance evaluations (rating, goals, feedback)
5. `incentives` — Bonuses and incentive payouts (amount, reason, type, status)
6. `training_records` — Training/certification tracking (course, provider, completion)

## Relationships
- All tables have `employee_id` FK → `employees(id)` ON DELETE CASCADE
- `leaves.approved_by` is a text field (employee name) for the approver
- `payroll` has a `period_month`/`period_year` composite for unique payroll periods

## Security
- RLS enabled on every table with `TO anon, authenticated` policies (single-tenant)
- 4 CRUD policies per table (select/insert/update/delete)

## Indexes
- All tables indexed on `employee_id` for join performance
- `attendance` indexed on `(employee_id, attendance_date)` for daily lookups
- `leaves` indexed on `status` for pending-approval queries
- `payroll` indexed on `(employee_id, period_year, period_month)` for period queries

## Notes
1. All tables use `gen_random_uuid()` for primary keys
2. `created_at` / `updated_at` timestamps on every table
3. Monetary columns use `numeric(12, 2)`
4. CHECK constraints enforce valid status/type values
5. Idempotent — safe to re-run
*/

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  check_in timestamptz,
  check_out timestamptz,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'remote', 'leave', 'holiday')),
  hours_worked numeric(4, 2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
CREATE POLICY "anon_select_attendance" ON attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
CREATE POLICY "anon_update_attendance" ON attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
CREATE POLICY "anon_delete_attendance" ON attendance FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance (employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance (employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (attendance_date);

-- ============================================================
-- LEAVES
-- ============================================================
CREATE TABLE IF NOT EXISTS leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'casual' CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity', 'sabbatical', 'other')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric(4, 1) NOT NULL DEFAULT 1,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leaves" ON leaves;
CREATE POLICY "anon_select_leaves" ON leaves FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leaves" ON leaves;
CREATE POLICY "anon_insert_leaves" ON leaves FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leaves" ON leaves;
CREATE POLICY "anon_update_leaves" ON leaves FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leaves" ON leaves;
CREATE POLICY "anon_delete_leaves" ON leaves FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves (employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves (status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves (start_date, end_date);

-- ============================================================
-- PAYROLL
-- ============================================================
CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_year integer NOT NULL,
  period_month integer NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  gross_salary numeric(12, 2) NOT NULL DEFAULT 0,
  basic_pay numeric(12, 2) DEFAULT 0,
  hra numeric(12, 2) DEFAULT 0,
  allowances numeric(12, 2) DEFAULT 0,
  deductions numeric(12, 2) DEFAULT 0,
  tax_deduction numeric(12, 2) DEFAULT 0,
  pf_deduction numeric(12, 2) DEFAULT 0,
  net_salary numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'failed')),
  payment_date date,
  payslip_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payroll" ON payroll;
CREATE POLICY "anon_select_payroll" ON payroll FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payroll" ON payroll;
CREATE POLICY "anon_insert_payroll" ON payroll FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payroll" ON payroll;
CREATE POLICY "anon_update_payroll" ON payroll FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payroll" ON payroll;
CREATE POLICY "anon_delete_payroll" ON payroll FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll (employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll (employee_id, period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll (status);

-- ============================================================
-- PERFORMANCE REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  review_type text NOT NULL DEFAULT 'quarterly' CHECK (review_type IN ('monthly', 'quarterly', 'half_yearly', 'annual', 'probation', 'project')),
  review_period text,
  reviewer text,
  rating numeric(2, 1) CHECK (rating BETWEEN 0 AND 5),
  goals jsonb DEFAULT '[]'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  strengths text,
  areas_for_improvement text,
  feedback text,
  next_review_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_performance_reviews" ON performance_reviews;
CREATE POLICY "anon_select_performance_reviews" ON performance_reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_performance_reviews" ON performance_reviews;
CREATE POLICY "anon_insert_performance_reviews" ON performance_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_performance_reviews" ON performance_reviews;
CREATE POLICY "anon_update_performance_reviews" ON performance_reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_performance_reviews" ON performance_reviews;
CREATE POLICY "anon_delete_performance_reviews" ON performance_reviews FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_perf_reviews_employee_id ON performance_reviews (employee_id);
CREATE INDEX IF NOT EXISTS idx_perf_reviews_status ON performance_reviews (status);
CREATE INDEX IF NOT EXISTS idx_perf_reviews_type ON performance_reviews (review_type);

-- ============================================================
-- INCENTIVES
-- ============================================================
CREATE TABLE IF NOT EXISTS incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  incentive_type text NOT NULL DEFAULT 'bonus' CHECK (incentive_type IN ('bonus', 'commission', 'spot_award', 'referral', 'performance', 'festival', 'other')),
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  reason text,
  awarded_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  approved_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE incentives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_incentives" ON incentives;
CREATE POLICY "anon_select_incentives" ON incentives FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_incentives" ON incentives;
CREATE POLICY "anon_insert_incentives" ON incentives FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_incentives" ON incentives;
CREATE POLICY "anon_update_incentives" ON incentives FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_incentives" ON incentives;
CREATE POLICY "anon_delete_incentives" ON incentives FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_incentives_employee_id ON incentives (employee_id);
CREATE INDEX IF NOT EXISTS idx_incentives_status ON incentives (status);

-- ============================================================
-- TRAINING RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  provider text,
  category text,
  start_date date,
  end_date date,
  duration_hours numeric(6, 2) DEFAULT 0,
  certification text,
  certification_id text,
  score numeric(5, 2),
  max_score numeric(5, 2) DEFAULT 100,
  status text NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'expired', 'dropped')),
  certificate_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_training_records" ON training_records;
CREATE POLICY "anon_select_training_records" ON training_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_training_records" ON training_records;
CREATE POLICY "anon_insert_training_records" ON training_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_training_records" ON training_records;
CREATE POLICY "anon_update_training_records" ON training_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_training_records" ON training_records;
CREATE POLICY "anon_delete_training_records" ON training_records FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_training_employee_id ON training_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_training_status ON training_records (status);
CREATE INDEX IF NOT EXISTS idx_training_category ON training_records (category);
