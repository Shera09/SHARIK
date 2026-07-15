-- Enterprise HRMS Module (Part 18) - HR Employee Tables
-- HR Employee Master (comprehensive profile)
CREATE TABLE IF NOT EXISTS hr_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code varchar(50) UNIQUE NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100),
  email varchar(200) UNIQUE NOT NULL,
  personal_email varchar(200),
  phone varchar(20),
  alternate_phone varchar(20),
  date_of_birth date,
  gender gender_type,
  marital_status marital_status_type,
  blood_group varchar(10),
  nationality varchar(50) DEFAULT 'Indian',
  aadhaar_number varchar(12),
  pan_number varchar(10),
  photograph_url text,
  present_address text,
  present_city varchar(100),
  present_state varchar(100),
  present_pincode varchar(10),
  permanent_address text,
  permanent_city varchar(100),
  permanent_state varchar(100),
  permanent_pincode varchar(10),
  emergency_contact_name varchar(200),
  emergency_contact_relation varchar(50),
  emergency_contact_phone varchar(20),
  father_name varchar(200),
  mother_name varchar(200),
  spouse_name varchar(200),
  employment_type employment_type DEFAULT 'full_time',
  employment_status employment_status DEFAULT 'active',
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  designation_id uuid REFERENCES designations(id) ON DELETE SET NULL,
  reporting_manager_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  cost_center_id uuid REFERENCES cost_centers(id) ON DELETE SET NULL,
  date_of_joining date NOT NULL,
  date_of_confirmation date,
  probation_months int DEFAULT 3,
  confirmation_date date,
  resignation_date date,
  last_working_date date,
  exit_type varchar(50),
  exit_reason text,
  work_location varchar(200),
  shift_id uuid REFERENCES shifts(id) ON DELETE SET NULL,
  bank_name varchar(100),
  bank_account_number varchar(50),
  bank_ifsc varchar(20),
  pf_account_number varchar(30),
  uan_number varchar(20),
  esi_number varchar(20),
  gratuity_eligible boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HR Employee Documents
CREATE TABLE IF NOT EXISTS hr_employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  document_type varchar(100) NOT NULL,
  document_name varchar(200) NOT NULL,
  document_number varchar(100),
  issue_date date,
  expiry_date date,
  issuing_authority varchar(200),
  document_url text,
  verification_status varchar(50) DEFAULT 'pending',
  verified_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  verified_at timestamptz,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HR Employee Education
CREATE TABLE IF NOT EXISTS hr_employee_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  education_type varchar(100) NOT NULL,
  institution_name varchar(300) NOT NULL,
  board_university varchar(300),
  course_name varchar(200),
  specialization varchar(200),
  passing_year int,
  percentage_grade numeric(5,2),
  certificate_url text,
  created_at timestamptz DEFAULT now()
);

-- HR Employee Experience
CREATE TABLE IF NOT EXISTS hr_employee_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  company_name varchar(300) NOT NULL,
  designation varchar(200) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  responsibilities text,
  reporting_manager varchar(200),
  contact_number varchar(20),
  location varchar(200),
  salary numeric(15,2),
  reason_for_leaving text,
  experience_cert_url text,
  created_at timestamptz DEFAULT now()
);

-- HR Employee Skills
CREATE TABLE IF NOT EXISTS hr_employee_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  skill_name varchar(200) NOT NULL,
  skill_category varchar(100),
  proficiency_level int DEFAULT 1,
  years_of_experience numeric(4,1) DEFAULT 0,
  certification_name varchar(200),
  certification_date date,
  certification_url text,
  last_used_date date,
  created_at timestamptz DEFAULT now()
);

-- Update teams with team_lead_id reference
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_team_lead_id_fkey;
ALTER TABLE teams ADD CONSTRAINT teams_team_lead_id_fkey FOREIGN KEY (team_lead_id) REFERENCES hr_employees(id) ON DELETE SET NULL;

-- Update departments with dept_head_id reference  
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_dept_head_id_fkey;
ALTER TABLE departments ADD CONSTRAINT departments_dept_head_id_fkey FOREIGN KEY (dept_head_id) REFERENCES hr_employees(id) ON DELETE SET NULL;

-- HR Employee Shifts
CREATE TABLE IF NOT EXISTS hr_employee_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  shift_id uuid REFERENCES shifts(id) ON DELETE SET NULL,
  effective_from date NOT NULL,
  effective_to date,
  is_current boolean DEFAULT true,
  assigned_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- HR Leave Balances
CREATE TABLE IF NOT EXISTS hr_leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  leave_type_id uuid REFERENCES leave_types(id) ON DELETE CASCADE,
  financial_year int NOT NULL,
  opening_balance numeric(4,1) DEFAULT 0,
  accrued numeric(4,1) DEFAULT 0,
  used numeric(4,1) DEFAULT 0,
  encashed numeric(4,1) DEFAULT 0,
  carry_forward numeric(4,1) DEFAULT 0,
  closing_balance numeric(4,1) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, financial_year)
);

-- HR Leave Requests
CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number varchar(50) UNIQUE NOT NULL,
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  leave_type_id uuid REFERENCES leave_types(id) ON DELETE SET NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  from_half boolean DEFAULT false,
  to_half boolean DEFAULT false,
  total_days numeric(4,1) NOT NULL,
  reason text NOT NULL,
  contact_number varchar(20),
  substitute_employee_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  document_url text,
  status varchar(50) DEFAULT 'pending',
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejected_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  rejected_at timestamptz,
  rejection_reason text,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HR Leave Ledger
CREATE TABLE IF NOT EXISTS hr_leave_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  leave_type_id uuid REFERENCES leave_types(id) ON DELETE CASCADE,
  transaction_type varchar(50) NOT NULL,
  reference_id uuid,
  reference_type varchar(50),
  transaction_date date NOT NULL,
  days numeric(4,1) NOT NULL,
  balance_after numeric(4,1),
  financial_year int,
  description text,
  created_at timestamptz DEFAULT now()
);

-- HR Attendance Records
CREATE TABLE IF NOT EXISTS hr_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  shift_id uuid REFERENCES shifts(id) ON DELETE SET NULL,
  check_in_time timestamp,
  check_out_time timestamp,
  in_ip_address varchar(45),
  out_ip_address varchar(45),
  in_location varchar(200),
  out_location varchar(200),
  in_source varchar(50),
  out_source varchar(50),
  total_work_hours numeric(4,2),
  total_break_hours numeric(4,2),
  overtime_hours numeric(4,2),
  status attendance_status DEFAULT 'present',
  is_late boolean DEFAULT false,
  late_minutes int DEFAULT 0,
  early_departure_minutes int DEFAULT 0,
  is_half_day boolean DEFAULT false,
  is_wfh boolean DEFAULT false,
  remarks text,
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- HR Attendance Punches
CREATE TABLE IF NOT EXISTS hr_attendance_punches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  punch_time timestamp NOT NULL,
  punch_type punch_type NOT NULL,
  ip_address varchar(45),
  location varchar(200),
  latitude numeric(10,8),
  longitude numeric(11,8),
  device_id varchar(100),
  source varchar(50),
  verification_method varchar(50),
  photo_url text,
  is_valid boolean DEFAULT true,
  remarks text,
  created_at timestamptz DEFAULT now()
);

-- HR Attendance Corrections
CREATE TABLE IF NOT EXISTS hr_attendance_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  attendance_id uuid REFERENCES hr_attendance(id) ON DELETE SET NULL,
  request_type varchar(50) NOT NULL,
  current_check_in timestamp,
  current_check_out timestamp,
  requested_check_in timestamp,
  requested_check_out timestamp,
  reason text NOT NULL,
  supporting_document_url text,
  status varchar(50) DEFAULT 'pending',
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_leave_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_attendance_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_attendance_corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "read_hr_employees" ON hr_employees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_employees" ON hr_employees FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_employees" ON hr_employees FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_employees" ON hr_employees FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_employee_documents" ON hr_employee_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_employee_documents" ON hr_employee_documents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_employee_documents" ON hr_employee_documents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_employee_documents" ON hr_employee_documents FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_employee_education" ON hr_employee_education FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_employee_education" ON hr_employee_education FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_employee_education" ON hr_employee_education FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_employee_education" ON hr_employee_education FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_employee_experience" ON hr_employee_experience FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_employee_experience" ON hr_employee_experience FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_employee_experience" ON hr_employee_experience FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_employee_experience" ON hr_employee_experience FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_employee_skills" ON hr_employee_skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_employee_skills" ON hr_employee_skills FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_employee_skills" ON hr_employee_skills FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_employee_skills" ON hr_employee_skills FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_leave_requests" ON hr_leave_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_leave_requests" ON hr_leave_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_leave_requests" ON hr_leave_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_leave_requests" ON hr_leave_requests FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_attendance" ON hr_attendance FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_attendance" ON hr_attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_attendance" ON hr_attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_attendance" ON hr_attendance FOR DELETE TO anon, authenticated USING (true);
