/*
# WebHoster AI Business OS — RBAC & Security Module

## Overview
Adds the Role-Based Access Control foundation: roles, permissions, the
role-permission junction, login history, and two-factor authentication settings.
These tables define the security model for the platform and are used by the
existing audit_logs table for tracking security events.

## New Tables
1. `roles` — Role definitions (admin, manager, employee, accountant, etc.)
2. `permissions` — Granular permission catalog (module + action pairs)
3. `role_permissions` — Junction table mapping roles to permissions
4. `login_history` — Authentication event log (login, logout, failed attempts)
5. `two_factor_settings` — 2FA configuration per user/employee

## Relationships
- `role_permissions.role_id` → `roles(id)` ON DELETE CASCADE
- `role_permissions.permission_id` → `permissions(id)` ON DELETE CASCADE
- `two_factor_settings.employee_id` → `employees(id)` ON DELETE CASCADE
- `login_history` is standalone (references employee by name for audit trail)

## Security
- RLS enabled on every table with `TO anon, authenticated` policies (single-tenant)
- 4 CRUD policies per table

## Indexes
- `roles` indexed on `role_key` (unique)
- `permissions` indexed on `(module, action)` for lookups
- `role_permissions` indexed on `(role_id, permission_id)` unique
- `login_history` indexed on `login_at` and `status`
- `two_factor_settings` indexed on `employee_id`

## Notes
1. All tables use `gen_random_uuid()` for primary keys
2. `created_at` / `updated_at` timestamps on every table
3. Seed data: 6 default roles, 40+ permissions across 10 modules, and role-permission mappings for admin
4. Idempotent — safe to re-run
*/

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role_key text NOT NULL UNIQUE,
  description text,
  is_system_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  level integer DEFAULT 0,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_roles" ON roles;
CREATE POLICY "anon_select_roles" ON roles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_roles" ON roles;
CREATE POLICY "anon_insert_roles" ON roles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_roles" ON roles;
CREATE POLICY "anon_update_roles" ON roles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_roles" ON roles;
CREATE POLICY "anon_delete_roles" ON roles FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export', 'import', 'approve', 'manage')),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (module, action)
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_permissions" ON permissions;
CREATE POLICY "anon_select_permissions" ON permissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_permissions" ON permissions;
CREATE POLICY "anon_insert_permissions" ON permissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_permissions" ON permissions;
CREATE POLICY "anon_update_permissions" ON permissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_permissions" ON permissions;
CREATE POLICY "anon_delete_permissions" ON permissions FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions (module, action);

-- ============================================================
-- ROLE PERMISSIONS (Junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (role_id, permission_id)
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_role_permissions" ON role_permissions;
CREATE POLICY "anon_select_role_permissions" ON role_permissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_role_permissions" ON role_permissions;
CREATE POLICY "anon_insert_role_permissions" ON role_permissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_role_permissions" ON role_permissions;
CREATE POLICY "anon_update_role_permissions" ON role_permissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_role_permissions" ON role_permissions;
CREATE POLICY "anon_delete_role_permissions" ON role_permissions FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions (role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions (permission_id);

-- ============================================================
-- LOGIN HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text,
  employee_name text,
  ip_address text,
  user_agent text,
  login_at timestamptz NOT NULL DEFAULT now(),
  logout_at timestamptz,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'locked', 'expired', 'logout')),
  failure_reason text,
  session_duration_seconds integer,
  device_type text,
  location text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_login_history" ON login_history;
CREATE POLICY "anon_select_login_history" ON login_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_login_history" ON login_history;
CREATE POLICY "anon_insert_login_history" ON login_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_login_history" ON login_history;
CREATE POLICY "anon_update_login_history" ON login_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_login_history" ON login_history;
CREATE POLICY "anon_delete_login_history" ON login_history FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history (login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_status ON login_history (status);
CREATE INDEX IF NOT EXISTS idx_login_history_username ON login_history (username);

-- ============================================================
-- TWO FACTOR SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS two_factor_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT false,
  method text DEFAULT 'totp' CHECK (method IN ('totp', 'sms', 'email', 'backup_codes')),
  secret_encrypted text,
  backup_codes jsonb DEFAULT '[]'::jsonb,
  last_verified_at timestamptz,
  enabled_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (employee_id)
);

ALTER TABLE two_factor_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_two_factor_settings" ON two_factor_settings;
CREATE POLICY "anon_select_two_factor_settings" ON two_factor_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_two_factor_settings" ON two_factor_settings;
CREATE POLICY "anon_insert_two_factor_settings" ON two_factor_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_two_factor_settings" ON two_factor_settings;
CREATE POLICY "anon_update_two_factor_settings" ON two_factor_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_two_factor_settings" ON two_factor_settings;
CREATE POLICY "anon_delete_two_factor_settings" ON two_factor_settings FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_two_factor_employee_id ON two_factor_settings (employee_id);

-- ============================================================
-- SEED DATA: Default Roles
-- ============================================================
INSERT INTO roles (name, role_key, description, is_system_role, level) VALUES
  ('Super Admin', 'super_admin', 'Full platform access including multi-tenant management', true, 100),
  ('Admin', 'admin', 'Full access to all modules within a tenant', true, 90),
  ('Manager', 'manager', 'Manage teams, approve workflows, view all data', true, 70),
  ('Accountant', 'accountant', 'Manage invoices, payments, accounting, expenses', true, 60),
  ('Employee', 'employee', 'Standard access to tasks, calendar, CRM (read)', true, 40),
  ('Viewer', 'viewer', 'Read-only access to dashboards and reports', true, 20)
ON CONFLICT (role_key) DO NOTHING;

-- ============================================================
-- SEED DATA: Default Permissions
-- ============================================================
INSERT INTO permissions (module, action, description) VALUES
  ('crm', 'view', 'View CRM data'), ('crm', 'create', 'Create leads/customers'), ('crm', 'update', 'Update CRM data'), ('crm', 'delete', 'Delete CRM records'), ('crm', 'export', 'Export CRM data'),
  ('invoices', 'view', 'View invoices'), ('invoices', 'create', 'Create invoices'), ('invoices', 'update', 'Update invoices'), ('invoices', 'delete', 'Delete invoices'), ('invoices', 'export', 'Export invoices'),
  ('payments', 'view', 'View payments'), ('payments', 'create', 'Record payments'), ('payments', 'update', 'Update payments'), ('payments', 'delete', 'Delete payment records'),
  ('accounting', 'view', 'View accounting'), ('accounting', 'create', 'Create transactions'), ('accounting', 'update', 'Update accounts'), ('accounting', 'manage', 'Manage chart of accounts'),
  ('employees', 'view', 'View employees'), ('employees', 'create', 'Add employees'), ('employees', 'update', 'Update employee records'), ('employees', 'delete', 'Remove employees'), ('employees', 'manage', 'Manage HR settings'),
  ('tasks', 'view', 'View tasks'), ('tasks', 'create', 'Create tasks'), ('tasks', 'update', 'Update tasks'), ('tasks', 'delete', 'Delete tasks'),
  ('ai', 'view', 'View AI features'), ('ai', 'create', 'Use AI features'), ('ai', 'manage', 'Configure AI settings'), ('ai', 'approve', 'Approve AI actions'),
  ('automation', 'view', 'View workflows'), ('automation', 'create', 'Create workflows'), ('automation', 'update', 'Update workflows'), ('automation', 'delete', 'Delete workflows'),
  ('marketplace', 'view', 'Browse marketplace'), ('marketplace', 'create', 'Publish apps'), ('marketplace', 'manage', 'Manage listings'),
  ('settings', 'view', 'View settings'), ('settings', 'manage', 'Modify settings'), ('settings', 'approve', 'Approve setting changes'),
  ('reports', 'view', 'View reports'), ('reports', 'export', 'Export reports')
ON CONFLICT (module, action) DO NOTHING;

-- ============================================================
-- SEED DATA: Admin role gets all permissions
-- ============================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_key = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager gets view/create/update on most modules
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_key = 'manager' AND p.action IN ('view', 'create', 'update') AND p.module IN ('crm', 'invoices', 'payments', 'accounting', 'employees', 'tasks', 'ai', 'automation', 'reports')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Accountant gets finance-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_key = 'accountant' AND p.module IN ('invoices', 'payments', 'accounting', 'expenses', 'reports') AND p.action IN ('view', 'create', 'update', 'export')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Employee gets basic view + task management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_key = 'employee' AND (
  (p.module IN ('crm', 'invoices', 'tasks', 'reports') AND p.action = 'view') OR
  (p.module = 'tasks' AND p.action IN ('create', 'update')) OR
  (p.module = 'ai' AND p.action IN ('view', 'create'))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer gets view-only on dashboards/reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_key = 'viewer' AND p.action = 'view'
ON CONFLICT (role_id, permission_id) DO NOTHING;
