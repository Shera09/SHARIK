-- Enterprise HRMS Module (Part 18) - Base Tables
-- Drop policies first
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "read_public_%s" ON %s;', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "write_public_%s" ON %s;', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "update_public_%s" ON %s;', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "delete_public_%s" ON %s;', tbl, tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Create ENUM types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type') THEN
    CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern', 'consultant', 'freelance');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
    CREATE TYPE employment_status AS ENUM ('active', 'on_probation', 'confirmed', 'resigned', 'terminated', 'retired', 'on_break');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status_type') THEN
    CREATE TYPE marital_status_type AS ENUM ('single', 'married', 'divorced', 'widowed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('draft', 'open', 'on_hold', 'closed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_status') THEN
    CREATE TYPE candidate_status AS ENUM ('new', 'screening', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'offered', 'hired', 'rejected', 'withdrawn');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_status') THEN
    CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
    CREATE TYPE onboarding_status AS ENUM ('pending', 'in_progress', 'completed', 'on_hold');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'late', 'early_leave', 'on_leave', 'holiday', 'weekend', 'wfh', 'overtime');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'punch_type') THEN
    CREATE TYPE punch_type AS ENUM ('check_in', 'check_out', 'break_out', 'break_in');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_status') THEN
    CREATE TYPE payroll_status AS ENUM ('draft', 'processing', 'processed', 'approved', 'paid', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salary_component_type') THEN
    CREATE TYPE salary_component_type AS ENUM ('earning', 'deduction', 'reimbursement', 'benefit');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
    CREATE TYPE review_status AS ENUM ('draft', 'in_progress', 'submitted', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_status') THEN
    CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'cancelled', 'on_hold');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_cycle_status') THEN
    CREATE TYPE review_cycle_status AS ENUM ('draft', 'active', 'closed', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'dropped', 'expired');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
    CREATE TYPE content_type AS ENUM ('video', 'document', 'quiz', 'assignment', 'scorm', 'external');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_difficulty') THEN
    CREATE TYPE course_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'survey_status') THEN
    CREATE TYPE survey_status AS ENUM ('draft', 'active', 'closed', 'archived');
  END IF;
END $$;

-- Organization Structure Tables
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_code varchar(50) UNIQUE NOT NULL,
  org_name varchar(200) NOT NULL,
  legal_name varchar(300),
  gstin varchar(20),
  pan varchar(10),
  tan varchar(10),
  cin varchar(21),
  logo_url text,
  website varchar(200),
  industry varchar(100),
  employee_strength int DEFAULT 0,
  founded_date date,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  branch_code varchar(50) NOT NULL,
  branch_name varchar(200) NOT NULL,
  branch_type varchar(50) DEFAULT 'office',
  address text,
  city varchar(100),
  state varchar(100),
  country varchar(100) DEFAULT 'India',
  pincode varchar(10),
  phone varchar(20),
  email varchar(200),
  is_head_office boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, branch_code)
);

-- Departments with self-reference
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_code varchar(50) NOT NULL,
  dept_name varchar(200) NOT NULL,
  parent_dept_id uuid,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  dept_head_id uuid,
  description text,
  budget numeric(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add self-reference after table creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'departments_parent_dept_id_fkey') THEN
    ALTER TABLE departments ADD CONSTRAINT departments_parent_dept_id_fkey FOREIGN KEY (parent_dept_id) REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Designations with self-reference for reporting hierarchy
CREATE TABLE IF NOT EXISTS designations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designation_code varchar(50) UNIQUE NOT NULL,
  designation_name varchar(200) NOT NULL,
  level int DEFAULT 1,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  reports_to_id uuid,
  description text,
  min_salary numeric(15,2),
  max_salary numeric(15,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add self-reference after table creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'designations_reports_to_id_fkey') THEN
    ALTER TABLE designations ADD CONSTRAINT designations_reports_to_id_fkey FOREIGN KEY (reports_to_id) REFERENCES designations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name varchar(200) NOT NULL,
  team_code varchar(50),
  dept_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  team_lead_id uuid,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cost Centers
CREATE TABLE IF NOT EXISTS cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_center_code varchar(50) UNIQUE NOT NULL,
  cost_center_name varchar(200) NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  budget numeric(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_code varchar(50) UNIQUE NOT NULL,
  shift_name varchar(100) NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  grace_minutes int DEFAULT 15,
  half_day_late_minutes int DEFAULT 120,
  break_duration_minutes int DEFAULT 60,
  is_night_shift boolean DEFAULT false,
  is_flexible boolean DEFAULT false,
  flexible_start_minutes int,
  flexible_end_minutes int,
  is_rotational boolean DEFAULT false,
  rotation_cycle_days int,
  week_off_days int[] DEFAULT '{6,0}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_type_code varchar(50) UNIQUE NOT NULL,
  leave_type_name varchar(100) NOT NULL,
  description text,
  annual_quota int DEFAULT 0,
  monthly_quota int,
  per_month_accrual int,
  carry_forward_limit int DEFAULT 0,
  carry_forward_expiry_months int,
  is_paid boolean DEFAULT true,
  is_encashable boolean DEFAULT false,
  max_consecutive_days int,
  min_notice_days int,
  require_document boolean DEFAULT false,
  document_after_days int,
  applicable_for text[],
  gender_specific gender_type,
  min_days int DEFAULT 1,
  max_days int,
  half_day_allowed boolean DEFAULT true,
  sandwich_rule boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Salary Components
CREATE TABLE IF NOT EXISTS salary_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_code varchar(50) UNIQUE NOT NULL,
  component_name varchar(200) NOT NULL,
  component_type salary_component_type NOT NULL,
  calculation_type varchar(50) DEFAULT 'fixed',
  calculation_formula text,
  default_value numeric(15,2),
  min_value numeric(15,2),
  max_value numeric(15,2),
  is_taxable boolean DEFAULT true,
  is_epf_wages boolean DEFAULT false,
  is_esi_wages boolean DEFAULT false,
  is_pt_wages boolean DEFAULT true,
  include_in_ctc boolean DEFAULT true,
  is_recurring boolean DEFAULT true,
  pay_frequency varchar(50) DEFAULT 'monthly',
  max_occurrences int,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Salary Structures
CREATE TABLE IF NOT EXISTS salary_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_name varchar(200) NOT NULL,
  structure_code varchar(50) UNIQUE NOT NULL,
  description text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  designation_id uuid REFERENCES designations(id) ON DELETE SET NULL,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  effective_from date NOT NULL,
  effective_to date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Structure Components
CREATE TABLE IF NOT EXISTS structure_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid REFERENCES salary_structures(id) ON DELETE CASCADE,
  component_id uuid REFERENCES salary_components(id) ON DELETE CASCADE,
  value_type varchar(50) DEFAULT 'fixed',
  value numeric(15,2),
  percentage_of varchar(50),
  percentage numeric(5,2),
  order_sequence int DEFAULT 0,
  is_mandatory boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(structure_id, component_id)
);

-- Loan Types
CREATE TABLE IF NOT EXISTS loan_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_type_name varchar(100) NOT NULL,
  loan_type_code varchar(50) UNIQUE NOT NULL,
  description text,
  min_amount numeric(15,2),
  max_amount numeric(15,2),
  interest_rate numeric(5,2) DEFAULT 0,
  max_tenure_months int,
  emi_calculation_type varchar(50) DEFAULT 'flat',
  eligibility_criteria jsonb,
  documents_required text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Recognition Types
CREATE TABLE IF NOT EXISTS recognition_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_name varchar(100) NOT NULL,
  type_code varchar(50) UNIQUE NOT NULL,
  description text,
  points int DEFAULT 0,
  is_monetary boolean DEFAULT false,
  default_amount numeric(15,2),
  approval_required boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Course Categories
CREATE TABLE IF NOT EXISTS course_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name varchar(200) NOT NULL,
  parent_id uuid,
  description text,
  icon varchar(50),
  order_sequence int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add self-reference
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'course_categories_parent_id_fkey') THEN
    ALTER TABLE course_categories ADD CONSTRAINT course_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES course_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Interview Rounds
CREATE TABLE IF NOT EXISTS interview_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_name varchar(100) NOT NULL,
  round_type varchar(50) NOT NULL,
  round_order int DEFAULT 1,
  description text,
  duration_minutes int DEFAULT 30,
  interviewers_required int DEFAULT 1,
  evaluation_criteria jsonb,
  is_mandatory boolean DEFAULT true,
  auto_advance boolean DEFAULT false,
  pass_score numeric(5,2),
  max_candidates_per_day int,
  created_at timestamptz DEFAULT now()
);

-- Onboarding Tasks
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name varchar(200) NOT NULL,
  task_type varchar(50) NOT NULL,
  description text,
  assignee_type varchar(50) DEFAULT 'employee',
  assignee_role varchar(100),
  due_days_from_start int DEFAULT 0,
  form_id uuid,
  document_required varchar(200),
  is_mandatory boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Holidays
CREATE TABLE IF NOT EXISTS holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_name varchar(200) NOT NULL,
  holiday_date date NOT NULL,
  holiday_type varchar(50) DEFAULT 'national',
  is_optional boolean DEFAULT false,
  branch_ids uuid[],
  is_recurring boolean DEFAULT false,
  state varchar(100),
  country varchar(100) DEFAULT 'India',
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(holiday_date, holiday_name)
);

-- Skill Assessments
CREATE TABLE IF NOT EXISTS skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_name varchar(200) NOT NULL,
  description text,
  skills_assessed text[],
  assessment_type varchar(50) DEFAULT 'quiz',
  quiz_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed data
INSERT INTO leave_types (leave_type_code, leave_type_name, description, annual_quota, per_month_accrual, carry_forward_limit, is_paid, is_encashable, require_document) VALUES
('CL', 'Casual Leave', 'For personal and casual purposes', 12, 1, 0, true, false, false),
('SL', 'Sick Leave', 'For medical and health reasons', 6, 0.5, 0, true, false, true),
('EL', 'Earned Leave', 'Annual privilege leave', 21, 1.75, 15, true, true, false),
('MAT', 'Maternity Leave', 'Maternity leave for female employees', 182, 0, 0, true, false, true),
('PAT', 'Paternity Leave', 'Paternity leave for male employees', 5, 0, 0, true, false, false),
('COMP', 'Compensatory Leave', 'Leave for working on holidays/weekends', 0, 0, 30, true, true, false)
ON CONFLICT (leave_type_code) DO NOTHING;

INSERT INTO shifts (shift_code, shift_name, start_time, end_time, grace_minutes, half_day_late_minutes, break_duration_minutes, is_night_shift, week_off_days) VALUES
('GEN', 'General Shift', '09:00:00', '18:00:00', 15, 120, 60, false, '{0,6}'),
('MORN', 'Morning Shift', '06:00:00', '14:00:00', 10, 90, 30, false, '{0,6}'),
('EVE', 'Evening Shift', '14:00:00', '22:00:00', 10, 90, 30, false, '{0,6}'),
('NIGHT', 'Night Shift', '22:00:00', '06:00:00', 10, 90, 30, true, '{0,6}'),
('FLEX', 'Flexible Shift', '10:00:00', '19:00:00', 30, 150, 60, false, '{0,6}')
ON CONFLICT (shift_code) DO NOTHING;

INSERT INTO recognition_types (type_name, type_code, description, points, is_monetary, default_amount) VALUES
('Employee of the Month', 'EOM', 'Monthly recognition for outstanding performance', 500, true, 10000),
('Spot Award', 'SPOT', 'Instant recognition for exceptional work', 100, true, 2000),
('Team Excellence', 'TEAM', 'Recognition for team achievements', 200, true, 5000),
('Customer Champion', 'CUST', 'Outstanding customer service', 300, true, 5000),
('Innovation Award', 'INNO', 'For innovative ideas and solutions', 400, true, 10000)
ON CONFLICT (type_code) DO NOTHING;

INSERT INTO salary_components (component_code, component_name, component_type, calculation_type, default_value, is_taxable, is_epf_wages, is_esi_wages, include_in_ctc) VALUES
('BASIC', 'Basic Salary', 'earning', 'fixed', 0, true, true, true, true),
('HRA', 'House Rent Allowance', 'earning', 'percentage', 0, true, false, false, true),
('DA', 'Dearness Allowance', 'earning', 'percentage', 0, true, true, true, true),
('SA', 'Special Allowance', 'earning', 'fixed', 0, true, false, false, true),
('CA', 'Conveyance Allowance', 'earning', 'fixed', 0, true, false, false, true),
('MA', 'Medical Allowance', 'earning', 'fixed', 0, true, false, false, true),
('LTA', 'Leave Travel Allowance', 'earning', 'fixed', 0, true, false, false, true),
('BONUS', 'Performance Bonus', 'earning', 'percentage', 0, true, false, false, true),
('PF', 'Provident Fund', 'deduction', 'percentage', 0, false, false, false, true),
('ESI', 'Employee State Insurance', 'deduction', 'percentage', 0, false, false, false, true),
('PT', 'Professional Tax', 'deduction', 'fixed', 0, false, false, false, true),
('TDS', 'Income Tax (TDS)', 'deduction', 'slab', 0, false, false, false, false),
('LOP', 'Loss of Pay Deduction', 'deduction', 'fixed', 0, false, false, false, false)
ON CONFLICT (component_code) DO NOTHING;

INSERT INTO designations (designation_code, designation_name, level, min_salary, max_salary, description) VALUES
('JSE', 'Junior Software Engineer', 1, 300000, 600000, 'Entry-level software development role'),
('SSE', 'Senior Software Engineer', 2, 600000, 1200000, 'Experienced software developer'),
('TL', 'Tech Lead', 3, 1200000, 1800000, 'Technical leader for development teams'),
('ARCH', 'Architect', 4, 1800000, 2500000, 'Solution and system architect'),
('MGR', 'Manager', 4, 1500000, 2500000, 'People management role'),
('SRMGR', 'Senior Manager', 5, 2500000, 3500000, 'Senior management position'),
('DIR', 'Director', 6, 3500000, 5000000, 'Director level position'),
('VP', 'Vice President', 7, 5000000, 8000000, 'VP level leadership'),
('AVP', 'Assistant Vice President', 6, 4000000, 6000000, 'Assistant VP position')
ON CONFLICT (designation_code) DO NOTHING;

INSERT INTO course_categories (category_name, description, icon, order_sequence) VALUES
('Technical Skills', 'Programming, tools, and technical competencies', 'code', 1),
('Leadership', 'Leadership and management skills', 'crown', 2),
('Communication', 'Communication and presentation skills', 'message-square', 3),
('Domain Knowledge', 'Industry and domain expertise', 'briefcase', 4),
('Compliance', 'Policy, compliance, and ethics training', 'shield', 5),
('Onboarding', 'New employee orientation and onboarding', 'user-plus', 6),
('Sales & Marketing', 'Sales techniques and marketing skills', 'target', 7),
('HR & People Skills', 'HR processes and people management', 'users', 8),
('Project Management', 'Project planning and execution', 'folder-kanban', 9),
('Soft Skills', 'Personal development and soft skills', 'heart', 10)
ON CONFLICT DO NOTHING;
