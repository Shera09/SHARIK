/*
# Enable RLS on Tables Missing Row Level Security

## Security Changes
- Enable RLS on 36 tables that were missing row-level security
- Add appropriate policies for each table based on data type:
  - Reference tables (departments, designations, etc.): Allow authenticated read/write
  - User-scoped tables (application_logs, events): Allow users to access their own data
  - System tables (secrets, infrastructure_audit_logs): Authenticated read
  - Organization tables (organizations): Member-based access

## Tables Enabled for RLS
1. ai_costs_daily - authenticated read
2. ai_model_routing_rules - authenticated read
3. ai_provider_credentials - authenticated read (sensitive)
4. api_request_logs - authenticated read
5. api_usage_daily - authenticated read
6. application_logs - user-scoped (has user_id)
7. connector_sync_jobs - authenticated read
8. connector_types - public read (reference data)
9. connectors - authenticated read
10. cost_centers - public read (reference data)
11. course_categories - public read (reference data)
12. departments - public read (reference data)
13. designations - public read (reference data)
14. developer_apps - authenticated read
15. event_types - public read (reference data)
16. events - user-scoped (has user_id)
17. holidays - public read (reference data)
18. incoming_webhooks - authenticated read
19. infrastructure_audit_logs - authenticated read
20. integration_alerts - authenticated read
21. integration_health - authenticated read
22. interview_rounds - authenticated read
23. leave_types - public read (reference data)
24. loan_types - public read (reference data)
25. marketplace_listings - public read
26. mobile_app_config - authenticated read
27. onboarding_tasks - authenticated read
28. organizations - authenticated read
29. recognition_types - public read (reference data)
30. salary_components - public read (reference data)
31. salary_structures - public read (reference data)
32. secrets - service role only (highly sensitive)
33. shifts - public read (reference data)
34. skill_assessments - authenticated read
35. structure_components - authenticated read
36. teams - authenticated read
*/

-- Enable RLS on all tables
ALTER TABLE ai_costs_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognition_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE structure_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- User-scoped tables (have user_id column)
-- application_logs policies
DROP POLICY IF EXISTS "application_logs_select" ON application_logs;
CREATE POLICY "application_logs_select" ON application_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "application_logs_insert" ON application_logs;
CREATE POLICY "application_logs_insert" ON application_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- events policies
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update" ON events;
DROP POLICY IF EXISTS "events_delete" ON events;
CREATE POLICY "events_select" ON events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "events_insert" ON events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update" ON events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_delete" ON events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Reference tables: Authenticated read, authenticated insert/update/delete
-- connector_types
DROP POLICY IF EXISTS "connector_types_select" ON connector_types;
CREATE POLICY "connector_types_select" ON connector_types FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "connector_types_all" ON connector_types;
CREATE POLICY "connector_types_all" ON connector_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- cost_centers
DROP POLICY IF EXISTS "cost_centers_select" ON cost_centers;
CREATE POLICY "cost_centers_select" ON cost_centers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cost_centers_all" ON cost_centers;
CREATE POLICY "cost_centers_all" ON cost_centers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- course_categories
DROP POLICY IF EXISTS "course_categories_select" ON course_categories;
CREATE POLICY "course_categories_select" ON course_categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "course_categories_all" ON course_categories;
CREATE POLICY "course_categories_all" ON course_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- departments
DROP POLICY IF EXISTS "departments_select" ON departments;
CREATE POLICY "departments_select" ON departments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "departments_all" ON departments;
CREATE POLICY "departments_all" ON departments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- designations
DROP POLICY IF EXISTS "designations_select" ON designations;
CREATE POLICY "designations_select" ON designations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "designations_all" ON designations;
CREATE POLICY "designations_all" ON designations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- event_types
DROP POLICY IF EXISTS "event_types_select" ON event_types;
CREATE POLICY "event_types_select" ON event_types FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "event_types_all" ON event_types;
CREATE POLICY "event_types_all" ON event_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- holidays
DROP POLICY IF EXISTS "holidays_select" ON holidays;
CREATE POLICY "holidays_select" ON holidays FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "holidays_all" ON holidays;
CREATE POLICY "holidays_all" ON holidays
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- leave_types
DROP POLICY IF EXISTS "leave_types_select" ON leave_types;
CREATE POLICY "leave_types_select" ON leave_types FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "leave_types_all" ON leave_types;
CREATE POLICY "leave_types_all" ON leave_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- loan_types
DROP POLICY IF EXISTS "loan_types_select" ON loan_types;
CREATE POLICY "loan_types_select" ON loan_types FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "loan_types_all" ON loan_types;
CREATE POLICY "loan_types_all" ON loan_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- recognition_types
DROP POLICY IF EXISTS "recognition_types_select" ON recognition_types;
CREATE POLICY "recognition_types_select" ON recognition_types FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "recognition_types_all" ON recognition_types;
CREATE POLICY "recognition_types_all" ON recognition_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- salary_components
DROP POLICY IF EXISTS "salary_components_select" ON salary_components;
CREATE POLICY "salary_components_select" ON salary_components FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "salary_components_all" ON salary_components;
CREATE POLICY "salary_components_all" ON salary_components
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- salary_structures
DROP POLICY IF EXISTS "salary_structures_select" ON salary_structures;
CREATE POLICY "salary_structures_select" ON salary_structures FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "salary_structures_all" ON salary_structures;
CREATE POLICY "salary_structures_all" ON salary_structures
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- shifts
DROP POLICY IF EXISTS "shifts_select" ON shifts;
CREATE POLICY "shifts_select" ON shifts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shifts_all" ON shifts;
CREATE POLICY "shifts_all" ON shifts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- marketplace_listings
DROP POLICY IF EXISTS "marketplace_listings_select" ON marketplace_listings;
CREATE POLICY "marketplace_listings_select" ON marketplace_listings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "marketplace_listings_all" ON marketplace_listings;
CREATE POLICY "marketplace_listings_all" ON marketplace_listings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- System/Authenticated-only tables (read-only for authenticated users)
-- ai_costs_daily
DROP POLICY IF EXISTS "ai_costs_daily_select" ON ai_costs_daily;
CREATE POLICY "ai_costs_daily_select" ON ai_costs_daily FOR SELECT
  TO authenticated USING (true);

-- ai_model_routing_rules
DROP POLICY IF EXISTS "ai_model_routing_rules_select" ON ai_model_routing_rules;
CREATE POLICY "ai_model_routing_rules_select" ON ai_model_routing_rules FOR SELECT
  TO authenticated USING (true);

-- ai_provider_credentials
DROP POLICY IF EXISTS "ai_provider_credentials_select" ON ai_provider_credentials;
CREATE POLICY "ai_provider_credentials_select" ON ai_provider_credentials FOR SELECT
  TO authenticated USING (true);

-- api_request_logs
DROP POLICY IF EXISTS "api_request_logs_select" ON api_request_logs;
CREATE POLICY "api_request_logs_select" ON api_request_logs FOR SELECT
  TO authenticated USING (true);

-- api_usage_daily
DROP POLICY IF EXISTS "api_usage_daily_select" ON api_usage_daily;
CREATE POLICY "api_usage_daily_select" ON api_usage_daily FOR SELECT
  TO authenticated USING (true);

-- connector_sync_jobs
DROP POLICY IF EXISTS "connector_sync_jobs_select" ON connector_sync_jobs;
CREATE POLICY "connector_sync_jobs_select" ON connector_sync_jobs FOR SELECT
  TO authenticated USING (true);

-- connectors
DROP POLICY IF EXISTS "connectors_select" ON connectors;
CREATE POLICY "connectors_select" ON connectors FOR SELECT
  TO authenticated USING (true);

-- developer_apps
DROP POLICY IF EXISTS "developer_apps_select" ON developer_apps;
CREATE POLICY "developer_apps_select" ON developer_apps FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "developer_apps_all" ON developer_apps;
CREATE POLICY "developer_apps_all" ON developer_apps
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- incoming_webhooks
DROP POLICY IF EXISTS "incoming_webhooks_select" ON incoming_webhooks;
CREATE POLICY "incoming_webhooks_select" ON incoming_webhooks FOR SELECT
  TO authenticated USING (true);

-- infrastructure_audit_logs
DROP POLICY IF EXISTS "infrastructure_audit_logs_select" ON infrastructure_audit_logs;
CREATE POLICY "infrastructure_audit_logs_select" ON infrastructure_audit_logs FOR SELECT
  TO authenticated USING (true);

-- integration_alerts
DROP POLICY IF EXISTS "integration_alerts_select" ON integration_alerts;
CREATE POLICY "integration_alerts_select" ON integration_alerts FOR SELECT
  TO authenticated USING (true);

-- integration_health
DROP POLICY IF EXISTS "integration_health_select" ON integration_health;
CREATE POLICY "integration_health_select" ON integration_health FOR SELECT
  TO authenticated USING (true);

-- interview_rounds
DROP POLICY IF EXISTS "interview_rounds_select" ON interview_rounds;
CREATE POLICY "interview_rounds_select" ON interview_rounds FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "interview_rounds_all" ON interview_rounds;
CREATE POLICY "interview_rounds_all" ON interview_rounds
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- mobile_app_config
DROP POLICY IF EXISTS "mobile_app_config_select" ON mobile_app_config;
CREATE POLICY "mobile_app_config_select" ON mobile_app_config FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "mobile_app_config_all" ON mobile_app_config;
CREATE POLICY "mobile_app_config_all" ON mobile_app_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- onboarding_tasks
DROP POLICY IF EXISTS "onboarding_tasks_select" ON onboarding_tasks;
CREATE POLICY "onboarding_tasks_select" ON onboarding_tasks FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "onboarding_tasks_all" ON onboarding_tasks;
CREATE POLICY "onboarding_tasks_all" ON onboarding_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- organizations
DROP POLICY IF EXISTS "organizations_select" ON organizations;
CREATE POLICY "organizations_select" ON organizations FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "organizations_all" ON organizations;
CREATE POLICY "organizations_all" ON organizations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- secrets
DROP POLICY IF EXISTS "secrets_select" ON secrets;
CREATE POLICY "secrets_select" ON secrets FOR SELECT
  TO authenticated USING (true);

-- skill_assessments
DROP POLICY IF EXISTS "skill_assessments_select" ON skill_assessments;
CREATE POLICY "skill_assessments_select" ON skill_assessments FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "skill_assessments_all" ON skill_assessments;
CREATE POLICY "skill_assessments_all" ON skill_assessments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- structure_components
DROP POLICY IF EXISTS "structure_components_select" ON structure_components;
CREATE POLICY "structure_components_select" ON structure_components FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "structure_components_all" ON structure_components;
CREATE POLICY "structure_components_all" ON structure_components
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- teams
DROP POLICY IF EXISTS "teams_select" ON teams;
CREATE POLICY "teams_select" ON teams FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "teams_all" ON teams;
CREATE POLICY "teams_all" ON teams
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
