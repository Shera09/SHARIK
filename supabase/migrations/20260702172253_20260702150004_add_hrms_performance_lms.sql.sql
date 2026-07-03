-- Enterprise HRMS Module (Part 18) - Performance & LMS Tables

-- Performance Cycles
CREATE TABLE IF NOT EXISTS hr_performance_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_name varchar(200) NOT NULL,
  cycle_year int NOT NULL,
  cycle_type varchar(50) DEFAULT 'annual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  review_start_date date,
  review_end_date date,
  self_review_deadline date,
  manager_review_deadline date,
  calibration_date date,
  status review_cycle_status DEFAULT 'draft',
  include_360_review boolean DEFAULT false,
  include_okr boolean DEFAULT true,
  rating_scale varchar(50) DEFAULT '5_point',
  description text,
  created_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Performance Goals
CREATE TABLE IF NOT EXISTS hr_performance_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES hr_performance_cycles(id) ON DELETE SET NULL,
  goal_title varchar(300) NOT NULL,
  goal_description text,
  goal_type varchar(50) DEFAULT 'individual',
  category varchar(100),
  weight numeric(5,2) DEFAULT 100,
  target_value numeric(15,2),
  actual_value numeric(15,2),
  achievement_percent numeric(5,2),
  start_date date,
  end_date date,
  due_date date,
  status goal_status DEFAULT 'not_started',
  progress_numeric int DEFAULT 0,
  key_results jsonb,
  milestones jsonb,
  manager_feedback text,
  employee_comments text,
  visibility varchar(50) DEFAULT 'manager',
  aligned_to_goal_id uuid REFERENCES hr_performance_goals(id) ON DELETE SET NULL,
  created_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS hr_performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_number varchar(50) UNIQUE NOT NULL,
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES hr_performance_cycles(id) ON DELETE SET NULL,
  review_type varchar(50) DEFAULT 'annual',
  review_period varchar(100),
  self_rating numeric(3,2),
  self_review text,
  self_review_date date,
  manager_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  manager_rating numeric(3,2),
  manager_review text,
  manager_review_date date,
  final_rating numeric(3,2),
  calibrated_rating numeric(3,2),
  overall_score numeric(5,2),
  rating_category varchar(50),
  strengths text,
  areas_of_improvement text,
  achievements text,
  development_needs text,
  career_aspirations text,
  recommendation varchar(50),
  recommended_role varchar(200),
  recommended_increment numeric(5,2),
  status review_status DEFAULT 'draft',
  reviewed_by_calibrator uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  calibration_comments text,
  calibration_date date,
  hr_feedback text,
  hr_reviewed_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  hr_review_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employee Recognition
CREATE TABLE IF NOT EXISTS hr_employee_recognition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  recognition_type_id uuid REFERENCES recognition_types(id) ON DELETE SET NULL,
  title varchar(200) NOT NULL,
  description text,
  recognition_date date NOT NULL,
  awarded_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  points int DEFAULT 0,
  amount numeric(15,2),
  badge_url text,
  certificate_url text,
  is_public boolean DEFAULT true,
  status varchar(50) DEFAULT 'pending',
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS hr_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code varchar(50) UNIQUE NOT NULL,
  course_name varchar(300) NOT NULL,
  category_id uuid REFERENCES course_categories(id) ON DELETE SET NULL,
  description text,
  short_description text,
  thumbnail_url text,
  course_status course_status DEFAULT 'draft',
  difficulty course_difficulty DEFAULT 'beginner',
  duration_hours numeric(5,1) DEFAULT 0,
  total_modules int DEFAULT 0,
  total_lessons int DEFAULT 0,
  passing_score numeric(5,2) DEFAULT 70,
  max_attempts int DEFAULT 3,
  is_mandatory boolean DEFAULT false,
  is_self_paced boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  instructor_led boolean DEFAULT false,
  instructor_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  start_date date,
  end_date date,
  skills_covered text[],
  prerequisites text[],
  audience text[],
  language varchar(50) DEFAULT 'English',
  version varchar(20) DEFAULT '1.0',
  created_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course Modules
CREATE TABLE IF NOT EXISTS hr_course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES hr_courses(id) ON DELETE CASCADE,
  module_name varchar(200) NOT NULL,
  description text,
  order_sequence int NOT NULL,
  duration_minutes int DEFAULT 0,
  is_unlocked boolean DEFAULT false,
  unlock_after_module_id uuid REFERENCES hr_course_modules(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Course Lessons
CREATE TABLE IF NOT EXISTS hr_course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES hr_course_modules(id) ON DELETE CASCADE,
  lesson_name varchar(200) NOT NULL,
  content_type content_type NOT NULL,
  content_url text,
  content_body text,
  duration_minutes int DEFAULT 0,
  order_sequence int NOT NULL,
  is_preview boolean DEFAULT false,
  attachments jsonb,
  resources jsonb,
  created_at timestamptz DEFAULT now()
);

-- Quizzes
CREATE TABLE IF NOT EXISTS hr_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_name varchar(200) NOT NULL,
  course_id uuid REFERENCES hr_courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES hr_course_modules(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES hr_course_lessons(id) ON DELETE SET NULL,
  description text,
  instructions text,
  passing_score numeric(5,2) DEFAULT 70,
  time_limit_minutes int,
  max_attempts int DEFAULT 3,
  shuffle_questions boolean DEFAULT true,
  shuffle_options boolean DEFAULT true,
  show_correct_answers boolean DEFAULT false,
  show_score_after_submission boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Learning Paths
CREATE TABLE IF NOT EXISTS hr_learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_name varchar(200) NOT NULL,
  description text,
  thumbnail_url text,
  total_courses int DEFAULT 0,
  total_duration_hours numeric(5,1) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS hr_course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  course_id uuid REFERENCES hr_courses(id) ON DELETE CASCADE,
  enrollment_status enrollment_status DEFAULT 'enrolled',
  enrolled_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  enrolled_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  due_date date,
  access_expiry_date date,
  progress_percent int DEFAULT 0,
  time_spent_minutes int DEFAULT 0,
  current_module_id uuid REFERENCES hr_course_modules(id) ON DELETE SET NULL,
  current_lesson_id uuid REFERENCES hr_course_lessons(id) ON DELETE SET NULL,
  score numeric(5,2),
  attempts int DEFAULT 0,
  last_accessed_at timestamptz,
  certificate_url text,
  certificate_issued_at timestamptz,
  feedback text,
  rating numeric(3,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, course_id)
);

-- Skill Matrix
CREATE TABLE IF NOT EXISTS hr_skill_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  skill_name varchar(200) NOT NULL,
  skill_category varchar(100),
  current_level int DEFAULT 1,
  target_level int,
  assessed_at timestamptz,
  gap int,
  training_recommended uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exit Requests
CREATE TABLE IF NOT EXISTS hr_exit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  request_type varchar(50) NOT NULL,
  last_working_date date NOT NULL,
  reason text NOT NULL,
  category varchar(100),
  status varchar(50) DEFAULT 'pending',
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejected_reason text,
  withdrawal_reason text,
  withdrawn_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exit Interviews
CREATE TABLE IF NOT EXISTS hr_exit_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  exit_request_id uuid REFERENCES hr_exit_requests(id) ON DELETE SET NULL,
  interviewer_id uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  scheduled_date date,
  scheduled_time time,
  completed_date date,
  duration_minutes int,
  venue varchar(200),
  meeting_link text,
  status varchar(50) DEFAULT 'scheduled',
  feedback jsonb,
  primary_reason varchar(200),
  secondary_reasons text[],
  manager_feedback text,
  would_recommend boolean,
  would_return boolean,
  improvements_suggested text,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FNF Settlements
CREATE TABLE IF NOT EXISTS hr_fnf_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES hr_employees(id) ON DELETE CASCADE,
  exit_request_id uuid REFERENCES hr_exit_requests(id) ON DELETE SET NULL,
  settlement_month int,
  settlement_year int,
  last_working_date date NOT NULL,
  salary_paid_days numeric(4,1),
  salary_amount numeric(15,2),
  leave_encashment_days numeric(4,1),
  leave_encashment_amount numeric(15,2),
  gratuity_years numeric(5,2),
  gratuity_amount numeric(15,2),
  bonus numeric(15,2),
  incentive numeric(15,2),
  reimbursements numeric(15,2),
  other_earnings numeric(15,2),
  total_earnings numeric(15,2),
  pf_withdrawal numeric(15,2),
  loan_recovery numeric(15,2),
  advance_recovery numeric(15,2),
  notice_period_recovery numeric(15,2),
  other_deductions numeric(15,2),
  total_deductions numeric(15,2),
  net_payable numeric(15,2),
  status varchar(50) DEFAULT 'pending',
  processed_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  processed_at timestamptz,
  approved_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  approved_at timestamptz,
  paid_at timestamptz,
  payment_reference varchar(100),
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Announcements
CREATE TABLE IF NOT EXISTS hr_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(300) NOT NULL,
  content text NOT NULL,
  announcement_type varchar(50) DEFAULT 'general',
  priority varchar(20) DEFAULT 'normal',
  image_url text,
  attachment_url text,
  target_audience jsonb,
  publish_date date,
  expiry_date date,
  is_pinned boolean DEFAULT false,
  views int DEFAULT 0,
  created_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Surveys
CREATE TABLE IF NOT EXISTS hr_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_name varchar(200) NOT NULL,
  survey_type varchar(50) NOT NULL,
  description text,
  is_anonymous boolean DEFAULT true,
  start_date date NOT NULL,
  end_date date,
  status survey_status DEFAULT 'draft',
  target_audience jsonb,
  total_questions int DEFAULT 0,
  total_responses int DEFAULT 0,
  created_by uuid REFERENCES hr_employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE hr_performance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_skill_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_exit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_exit_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_fnf_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_surveys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "read_hr_performance_cycles" ON hr_performance_cycles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_performance_cycles" ON hr_performance_cycles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_performance_cycles" ON hr_performance_cycles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "read_hr_courses" ON hr_courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_courses" ON hr_courses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_courses" ON hr_courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "read_hr_course_enrollments" ON hr_course_enrollments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "write_hr_course_enrollments" ON hr_course_enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_hr_course_enrollments" ON hr_course_enrollments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
