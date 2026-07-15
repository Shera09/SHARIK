-- Enterprise HRMS Module (Part 18) - Payroll Tables

-- Employee Salary Structure
CREATE TABLE IF NOT EXISTS hr_employee_salary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  structure_id uuid REFERENCES salary_structures(id) ON DELETE SET NULL,
  effective_from date NOT NULL,
  effective_to date,
  ctc numeric(15,2),
  gross_salary numeric(15,2),
  net_salary numeric(15,2),
  is_current boolean DEFAULT true,
  revised_from uuid REFERENCES hr_employee_salary(id) ON DELETE SET NULL,
  revision_reason text,
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employee Salary Components
CREATE TABLE IF NOT EXISTS hr_employee_salary_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_salary_id uuid REFERENCES hr_employee_salary(id) ON DELETE CASCADE,
  component_id uuid REFERENCES salary_components(id) ON DELETE SET NULL,
  amount numeric(15,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payroll Periods
CREATE TABLE IF NOT EXISTS hr_payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name varchar(100) NOT NULL,
  financial_year int NOT NULL,
  month int NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  payment_date date,
  lock_date date,
  status payroll_status DEFAULT 'draft',
  total_employees int DEFAULT 0,
  processed_employees int DEFAULT 0,
  total_gross numeric(15,2) DEFAULT 0,
  total_net numeric(15,2) DEFAULT 0,
  total_deductions numeric(15,2) DEFAULT 0,
  created_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  processed_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  processed_at timestamptz,
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(financial_year, month)
);

-- Payroll Runs
CREATE TABLE IF NOT EXISTS hr_payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number varchar(50) UNIQUE NOT NULL,
  period_id uuid REFERENCES hr_payroll_periods(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  salary_id uuid REFERENCES hr_employee_salary(id) ON DELETE SET NULL,
  days_in_month int,
  days_worked numeric(4,1),
  paid_days numeric(4,1),
  unpaid_leave_days numeric(4,1),
  loss_of_pay_days numeric(4,1),
  gross_earnings numeric(15,2) DEFAULT 0,
  gross_deductions numeric(15,2) DEFAULT 0,
  reimbursements numeric(15,2) DEFAULT 0,
  arrears numeric(15,2) DEFAULT 0,
  overtime_amount numeric(15,2) DEFAULT 0,
  bonus numeric(15,2) DEFAULT 0,
  incentive numeric(15,2) DEFAULT 0,
  tax_deduction numeric(15,2) DEFAULT 0,
  pf_deduction numeric(15,2) DEFAULT 0,
  esi_deduction numeric(15,2) DEFAULT 0,
  pt_deduction numeric(15,2) DEFAULT 0,
  lop_deduction numeric(15,2) DEFAULT 0,
  loan_deduction numeric(15,2) DEFAULT 0,
  other_deductions numeric(15,2) DEFAULT 0,
  net_salary numeric(15,2) DEFAULT 0,
  status payroll_status DEFAULT 'draft',
  processed_at timestamptz,
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  payment_mode varchar(50),
  payment_reference varchar(100),
  paid_at timestamptz,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(period_id, employee_id)
);

-- Payslips
CREATE TABLE IF NOT EXISTS hr_payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_number varchar(50) UNIQUE NOT NULL,
  payroll_run_id uuid REFERENCES hr_payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  period_id uuid REFERENCES hr_payroll_periods(id) ON DELETE SET NULL,
  payslip_month int,
  payslip_year int,
  gross_earnings numeric(15,2),
  gross_deductions numeric(15,2),
  net_salary numeric(15,2),
  payslip_url text,
  generated_at timestamptz,
  sent_to_employee boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Employee Loans
CREATE TABLE IF NOT EXISTS hr_employee_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  loan_type_id uuid REFERENCES loan_types(id) ON DELETE SET NULL,
  loan_number varchar(50) UNIQUE NOT NULL,
  principal_amount numeric(15,2) NOT NULL,
  interest_rate numeric(5,2) DEFAULT 0,
  tenure_months int NOT NULL,
  emi_amount numeric(15,2),
  total_interest numeric(15,2),
  total_amount numeric(15,2),
  disbursed_amount numeric(15,2),
  disbursement_date date,
  start_deduction_month int,
  start_deduction_year int,
  status varchar(50) DEFAULT 'pending',
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  disbursed_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  disbursed_at timestamptz,
  closed_at timestamptz,
  outstanding_balance numeric(15,2),
  emis_paid int DEFAULT 0,
  emis_remaining int,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loan Repayments
CREATE TABLE IF NOT EXISTS hr_loan_repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES hr_employee_loans(id) ON DELETE CASCADE,
  emi_number int NOT NULL,
  due_date date NOT NULL,
  emi_amount numeric(15,2) NOT NULL,
  principal_component numeric(15,2),
  interest_component numeric(15,2),
  paid_amount numeric(15,2) DEFAULT 0,
  balance_amount numeric(15,2),
  paid_date date,
  payroll_run_id uuid REFERENCES hr_payroll_runs(id) ON DELETE SET NULL,
  status varchar(50) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(loan_id, emi_number)
);

-- Enable RLS
ALTER TABLE hr_employee_salary ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_loan_repayments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "read_hr_employee_salary" ON hr_employee_salary FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_employee_salary" ON hr_employee_salary FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_employee_salary" ON hr_employee_salary FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_employee_salary" ON hr_employee_salary FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_payroll_runs" ON hr_payroll_runs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_payroll_runs" ON hr_payroll_runs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_payroll_runs" ON hr_payroll_runs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_payroll_runs" ON hr_payroll_runs FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_payslips" ON hr_payslips FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_payslips" ON hr_payslips FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_payslips" ON hr_payslips FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_payslips" ON hr_payslips FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_employee_loans" ON hr_employee_loans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_employee_loans" ON hr_employee_loans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_employee_loans" ON hr_employee_loans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_employee_loans" ON hr_employee_loans FOR DELETE TO anon, authenticated USING (true);
