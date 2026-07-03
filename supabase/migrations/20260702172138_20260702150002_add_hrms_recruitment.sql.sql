-- Enterprise HRMS Module (Part 18) - Recruitment Tables

-- Job Requisitions
CREATE TABLE IF NOT EXISTS hr_job_requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_number varchar(50) UNIQUE NOT NULL,
  job_title varchar(200) NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  designation_id uuid REFERENCES designations(id) ON DELETE SET NULL,
  reporting_to_id uuid REFERENCES designations(id) ON DELETE SET NULL,
  positions int DEFAULT 1,
  filled_positions int DEFAULT 0,
  employment_type employment_type DEFAULT 'full_time',
  work_location varchar(200),
  min_experience_years int DEFAULT 0,
  max_experience_years int,
  min_salary numeric(15,2),
  max_salary numeric(15,2),
  job_description text,
  requirements text,
  responsibilities text,
  skills_required text[],
  qualifications_required varchar(200),
  qualifications_preferred text,
  post_date date,
  expiry_date date,
  status job_status DEFAULT 'draft',
  priority varchar(20) DEFAULT 'medium',
  hiring_manager_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  hr_coordinator_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job Postings
CREATE TABLE IF NOT EXISTS hr_job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id uuid REFERENCES hr_job_requisitions(id) ON DELETE CASCADE,
  posting_code varchar(50) UNIQUE NOT NULL,
  job_title varchar(200) NOT NULL,
  posting_title varchar(200),
  job_description text,
  posting_description text,
  portal varchar(100),
  portal_job_id varchar(100),
  posting_url text,
  post_date date,
  expiry_date date,
  views int DEFAULT 0,
  applications int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidates
CREATE TABLE IF NOT EXISTS hr_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_code varchar(50) UNIQUE NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100),
  email varchar(200) NOT NULL,
  phone varchar(20),
  alternate_phone varchar(20),
  current_location varchar(200),
  preferred_location text[],
  current_company varchar(200),
  current_designation varchar(200),
  total_experience_years numeric(4,1) DEFAULT 0,
  relevant_experience_years numeric(4,1),
  current_salary numeric(15,2),
  expected_salary numeric(15,2),
  notice_period_days int,
  date_of_birth date,
  gender gender_type,
  resume_url text,
  linkedin_url text,
  portfolio_url text,
  source varchar(100),
  source_details jsonb,
  skills text[],
  education_summary text,
  summary text,
  status candidate_status DEFAULT 'new',
  rating numeric(3,2),
  tags text[],
  talent_pool_category varchar(100),
  is_internal boolean DEFAULT false,
  employee_referrer_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidate Applications
CREATE TABLE IF NOT EXISTS hr_candidate_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES hr_candidates(id) ON DELETE CASCADE,
  requisition_id uuid REFERENCES hr_job_requisitions(id) ON DELETE CASCADE,
  posting_id uuid REFERENCES hr_job_postings(id) ON DELETE SET NULL,
  application_date date DEFAULT CURRENT_DATE,
  cover_letter text,
  status candidate_status DEFAULT 'new',
  current_stage varchar(50),
  rating numeric(3,2),
  feedback text,
  rejection_reason text,
  withdrawn_reason text,
  withdrawn_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, requisition_id)
);

-- Interviews
CREATE TABLE IF NOT EXISTS hr_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES hr_candidate_applications(id) ON DELETE CASCADE,
  round_id uuid REFERENCES interview_rounds(id) ON DELETE SET NULL,
  interview_date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  venue varchar(200),
  meeting_link text,
  interview_type varchar(50) DEFAULT 'in_person',
  interviewer_ids uuid[],
  status interview_status DEFAULT 'scheduled',
  feedback jsonb,
  overall_rating numeric(3,2),
  recommendation varchar(50),
  notes text,
  rescheduled_from uuid REFERENCES hr_interviews(id) ON DELETE SET NULL,
  reschedule_reason text,
  cancelled_reason text,
  reminder_sent boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Interview Feedback
CREATE TABLE IF NOT EXISTS hr_interview_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES hr_interviews(id) ON DELETE CASCADE,
  interviewer_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  feedback_date timestamptz DEFAULT now(),
  criteria_ratings jsonb,
  overall_score numeric(3,2),
  strengths text,
  weaknesses text,
  technical_skills numeric(3,2),
  communication_skills numeric(3,2),
  cultural_fit numeric(3,2),
  recommendation varchar(50) NOT NULL,
  recommendation_reason text,
  hiring_decision varchar(50),
  created_at timestamptz DEFAULT now(),
  UNIQUE(interview_id, interviewer_id)
);

-- Job Offers
CREATE TABLE IF NOT EXISTS hr_job_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_number varchar(50) UNIQUE NOT NULL,
  application_id uuid REFERENCES hr_candidate_applications(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES hr_candidates(id) ON DELETE CASCADE,
  requisition_id uuid REFERENCES hr_job_requisitions(id) ON DELETE SET NULL,
  designation varchar(200) NOT NULL,
  department varchar(200),
  reporting_to varchar(200),
  employment_type employment_type DEFAULT 'full_time',
  start_date date NOT NULL,
  end_date date,
  is_contract boolean DEFAULT false,
  salary_offered numeric(15,2) NOT NULL,
  salary_breakdown jsonb,
  ctc numeric(15,2),
  variable_pay numeric(15,2),
  joining_bonus numeric(15,2),
  relocation_bonus numeric(15,2),
  stock_options text,
  benefits jsonb,
  probation_months int DEFAULT 3,
  work_location varchar(200),
  work_mode varchar(50) DEFAULT 'onsite',
  notice_period_days int,
  is_negotiable boolean DEFAULT false,
  valid_till_date date,
  offer_status varchar(50) DEFAULT 'pending',
  offered_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  offer_date date DEFAULT CURRENT_DATE,
  acceptance_date date,
  accepted_by_candidate boolean DEFAULT false,
  rejected_reason text,
  withdrawn_reason text,
  approval_status varchar(50) DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  offer_letter_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Onboarding Plans
CREATE TABLE IF NOT EXISTS hr_onboarding_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name varchar(200) NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  designation_id uuid REFERENCES designations(id) ON DELETE SET NULL,
  description text,
  duration_days int DEFAULT 30,
  checklist jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employee Onboarding
CREATE TABLE IF NOT EXISTS hr_employee_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  offer_id uuid REFERENCES hr_job_offers(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES hr_onboarding_plans(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  target_end_date date,
  actual_end_date date,
  status onboarding_status DEFAULT 'pending',
  progress_percent int DEFAULT 0,
  buddy_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  mentor_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  equipment_assigned jsonb,
  accounts_created jsonb,
  orientation_completed boolean DEFAULT false,
  documents_submitted boolean DEFAULT false,
  welcome_email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Onboarding Tasks
CREATE TABLE IF NOT EXISTS hr_onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid REFERENCES hr_employee_onboarding(id) ON DELETE CASCADE,
  task_id uuid REFERENCES onboarding_tasks(id) ON DELETE SET NULL,
  task_name varchar(200) NOT NULL,
  assignee_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  due_date date,
  completed_date date,
  status varchar(50) DEFAULT 'pending',
  remarks text,
  attachments jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hr_job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_onboarding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "read_hr_job_requisitions" ON hr_job_requisitions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_job_requisitions" ON hr_job_requisitions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_job_requisitions" ON hr_job_requisitions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_job_requisitions" ON hr_job_requisitions FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_candidates" ON hr_candidates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_candidates" ON hr_candidates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_candidates" ON hr_candidates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_candidates" ON hr_candidates FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_interviews" ON hr_interviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_interviews" ON hr_interviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_interviews" ON hr_interviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_interviews" ON hr_interviews FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "read_hr_job_offers" ON hr_job_offers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_job_offers" ON hr_job_offers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_job_offers" ON hr_job_offers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hr_job_offers" ON hr_job_offers FOR DELETE TO anon, authenticated USING (true);
