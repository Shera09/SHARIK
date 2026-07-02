/*
# WebHoster AI Business OS — Task & Project Management Module

## Overview
Adds project management, subtasks, task comments, and reminders on top of the
existing `tasks` table. This creates a full project-task-subtask hierarchy with
collaboration features.

## New Tables
1. `projects` — Project entities with timeline, budget, and status
2. `project_members` — Many-to-many association of employees to projects with roles
3. `subtasks` — Child tasks linked to parent `tasks` with checklist semantics
4. `task_comments` — Discussion threads on individual tasks
5. `reminders` — Time-based reminders linked to tasks, appointments, or standalone

## Relationships
- `project_members.project_id` → `projects(id)` ON DELETE CASCADE
- `project_members.employee_id` → `employees(id)` ON DELETE CASCADE
- `subtasks.task_id` → `tasks(id)` ON DELETE CASCADE
- `task_comments.task_id` → `tasks(id)` ON DELETE CASCADE
- `tasks` gets a new nullable `project_id` column linking to `projects(id)`

## Changes to Existing Tables
- `tasks` gets a new nullable `project_id` column to link tasks to projects

## Security
- RLS enabled on every new table with `TO anon, authenticated` policies (single-tenant)
- 4 CRUD policies per table

## Indexes
- `projects` indexed on `status` and `manager`
- `project_members` indexed on `(project_id, employee_id)` unique
- `subtasks` indexed on `task_id` and `status`
- `task_comments` indexed on `(task_id, created_at)` for threaded view
- `reminders` indexed on `remind_at` and `status`

## Notes
1. All tables use `gen_random_uuid()` for primary keys
2. `created_at` / `updated_at` timestamps on every table
3. The `project_id` column is added to `tasks` with IF NOT EXISTS for idempotency
4. CHECK constraints enforce valid status/priority values
5. Idempotent — safe to re-run
*/

-- ============================================================
-- PROJECTS (must be created before adding FK to tasks)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  manager text,
  start_date date,
  end_date date,
  budget numeric(14, 2) DEFAULT 0,
  spent numeric(14, 2) DEFAULT 0,
  progress integer DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  color text DEFAULT '#3b82f6',
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects (manager);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects (start_date, end_date);

-- ============================================================
-- Add project_id to existing tasks table (after projects exists)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'project_id') THEN
    ALTER TABLE tasks ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- PROJECT MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('manager', 'lead', 'member', 'observer')),
  allocated_hours numeric(6, 2) DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (project_id, employee_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_project_members" ON project_members;
CREATE POLICY "anon_select_project_members" ON project_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_project_members" ON project_members;
CREATE POLICY "anon_insert_project_members" ON project_members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_project_members" ON project_members;
CREATE POLICY "anon_update_project_members" ON project_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_project_members" ON project_members;
CREATE POLICY "anon_delete_project_members" ON project_members FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_employee_id ON project_members (employee_id);

-- ============================================================
-- SUBTASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by text,
  display_order integer DEFAULT 0,
  assignee text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subtasks" ON subtasks;
CREATE POLICY "anon_select_subtasks" ON subtasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subtasks" ON subtasks;
CREATE POLICY "anon_insert_subtasks" ON subtasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subtasks" ON subtasks;
CREATE POLICY "anon_update_subtasks" ON subtasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subtasks" ON subtasks;
CREATE POLICY "anon_delete_subtasks" ON subtasks FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks (task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks (is_completed);

-- ============================================================
-- TASK COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author text NOT NULL,
  comment text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_task_comments" ON task_comments;
CREATE POLICY "anon_select_task_comments" ON task_comments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_task_comments" ON task_comments;
CREATE POLICY "anon_insert_task_comments" ON task_comments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_task_comments" ON task_comments;
CREATE POLICY "anon_update_task_comments" ON task_comments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_task_comments" ON task_comments;
CREATE POLICY "anon_delete_task_comments" ON task_comments FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments (task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_created ON task_comments (task_id, created_at DESC);

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  remind_at timestamptz NOT NULL,
  related_type text CHECK (related_type IN ('task', 'appointment', 'lead', 'invoice', 'general')),
  related_id uuid,
  assigned_to text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'snoozed', 'dismissed')),
  snoozed_until timestamptz,
  notification_method text DEFAULT 'in_app' CHECK (notification_method IN ('in_app', 'email', 'whatsapp', 'sms', 'push')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reminders" ON reminders;
CREATE POLICY "anon_select_reminders" ON reminders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reminders" ON reminders;
CREATE POLICY "anon_insert_reminders" ON reminders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reminders" ON reminders;
CREATE POLICY "anon_update_reminders" ON reminders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reminders" ON reminders;
CREATE POLICY "anon_delete_reminders" ON reminders FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders (remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders (status);
CREATE INDEX IF NOT EXISTS idx_reminders_assigned_to ON reminders (assigned_to);
