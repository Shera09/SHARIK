-- Fix RLS Policies for builder_forms and all builder platform tables to allow public and authenticated insert/select/update/delete operations

ALTER TABLE IF EXISTS builder_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS builder_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS builder_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS builder_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS builder_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS builder_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS builder_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS published_sites ENABLE ROW LEVEL SECURITY;

-- builder_projects
DROP POLICY IF EXISTS "select_projects" ON builder_projects;
DROP POLICY IF EXISTS "insert_projects" ON builder_projects;
DROP POLICY IF EXISTS "update_projects" ON builder_projects;
DROP POLICY IF EXISTS "delete_projects" ON builder_projects;
DROP POLICY IF EXISTS "select_projects_public" ON builder_projects;
DROP POLICY IF EXISTS "insert_projects_public" ON builder_projects;
DROP POLICY IF EXISTS "update_projects_public" ON builder_projects;
DROP POLICY IF EXISTS "delete_projects_public" ON builder_projects;

CREATE POLICY "select_projects_public" ON builder_projects FOR SELECT TO public USING (true);
CREATE POLICY "insert_projects_public" ON builder_projects FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "update_projects_public" ON builder_projects FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "delete_projects_public" ON builder_projects FOR DELETE TO public USING (true);

-- builder_forms
DROP POLICY IF EXISTS "select_forms" ON builder_forms;
DROP POLICY IF EXISTS "insert_forms" ON builder_forms;
DROP POLICY IF EXISTS "update_forms" ON builder_forms;
DROP POLICY IF EXISTS "delete_forms" ON builder_forms;
DROP POLICY IF EXISTS "select_forms_public" ON builder_forms;
DROP POLICY IF EXISTS "insert_forms_public" ON builder_forms;
DROP POLICY IF EXISTS "update_forms_public" ON builder_forms;
DROP POLICY IF EXISTS "delete_forms_public" ON builder_forms;

CREATE POLICY "select_forms_public" ON builder_forms FOR SELECT TO public USING (true);
CREATE POLICY "insert_forms_public" ON builder_forms FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "update_forms_public" ON builder_forms FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "delete_forms_public" ON builder_forms FOR DELETE TO public USING (true);

-- builder_form_submissions
DROP POLICY IF EXISTS "select_submissions" ON builder_form_submissions;
DROP POLICY IF EXISTS "insert_submissions" ON builder_form_submissions;
DROP POLICY IF EXISTS "select_submissions_public" ON builder_form_submissions;
DROP POLICY IF EXISTS "insert_submissions_public" ON builder_form_submissions;

CREATE POLICY "select_submissions_public" ON builder_form_submissions FOR SELECT TO public USING (true);
CREATE POLICY "insert_submissions_public" ON builder_form_submissions FOR INSERT TO public WITH CHECK (true);

-- builder_dashboards
DROP POLICY IF EXISTS "select_dashboards" ON builder_dashboards;
DROP POLICY IF EXISTS "insert_dashboards" ON builder_dashboards;
DROP POLICY IF EXISTS "select_dashboards_public" ON builder_dashboards;
DROP POLICY IF EXISTS "insert_dashboards_public" ON builder_dashboards;

CREATE POLICY "select_dashboards_public" ON builder_dashboards FOR SELECT TO public USING (true);
CREATE POLICY "insert_dashboards_public" ON builder_dashboards FOR INSERT TO public WITH CHECK (true);

-- builder_apps
DROP POLICY IF EXISTS "select_apps" ON builder_apps;
DROP POLICY IF EXISTS "insert_apps" ON builder_apps;
DROP POLICY IF EXISTS "select_apps_public" ON builder_apps;
DROP POLICY IF EXISTS "insert_apps_public" ON builder_apps;

CREATE POLICY "select_apps_public" ON builder_apps FOR SELECT TO public USING (true);
CREATE POLICY "insert_apps_public" ON builder_apps FOR INSERT TO public WITH CHECK (true);

-- builder_reports
DROP POLICY IF EXISTS "select_reports" ON builder_reports;
DROP POLICY IF EXISTS "insert_reports" ON builder_reports;
DROP POLICY IF EXISTS "select_reports_public" ON builder_reports;
DROP POLICY IF EXISTS "insert_reports_public" ON builder_reports;

CREATE POLICY "select_reports_public" ON builder_reports FOR SELECT TO public USING (true);
CREATE POLICY "insert_reports_public" ON builder_reports FOR INSERT TO public WITH CHECK (true);

-- builder_workflows
DROP POLICY IF EXISTS "select_workflows" ON builder_workflows;
DROP POLICY IF EXISTS "insert_workflows" ON builder_workflows;
DROP POLICY IF EXISTS "select_workflows_public" ON builder_workflows;
DROP POLICY IF EXISTS "insert_workflows_public" ON builder_workflows;

CREATE POLICY "select_workflows_public" ON builder_workflows FOR SELECT TO public USING (true);
CREATE POLICY "insert_workflows_public" ON builder_workflows FOR INSERT TO public WITH CHECK (true);
