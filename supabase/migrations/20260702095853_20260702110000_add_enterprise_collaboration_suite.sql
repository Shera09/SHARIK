-- Enterprise Collaboration Suite
-- Part 16: Team Chat, Project Workspace, Meetings, Knowledge Base, Announcements

-- Enum types
DO $$ BEGIN CREATE TYPE channel_type AS ENUM ('public', 'private', 'direct', 'group', 'project', 'department', 'branch', 'announcement'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'video', 'audio', 'code', 'system', 'meeting', 'task', 'document'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE workspace_type AS ENUM ('project', 'department', 'branch', 'team', 'private_group', 'public_channel'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE knowledge_status AS ENUM ('draft', 'pending_review', 'approved', 'archived', 'deprecated'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high', 'urgent', 'emergency'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE participant_role AS ENUM ('owner', 'admin', 'member', 'guest', 'viewer'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE whiteboard_element_type AS ENUM ('sticky', 'text', 'shape', 'line', 'image', 'drawing', 'mindmap'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================
-- WORKSPACES & CHANNELS
-- ============================================

CREATE TABLE IF NOT EXISTS workspaces (
  workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workspace_type workspace_type NOT NULL DEFAULT 'team',
  icon VARCHAR(50),
  cover_image VARCHAR(500),
  owner_id UUID NOT NULL,
  branch_id UUID,
  department_id UUID,
  project_id UUID,
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
CREATE POLICY "workspaces_select" ON workspaces FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
CREATE POLICY "workspaces_insert" ON workspaces FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
CREATE POLICY "workspaces_update" ON workspaces FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS channels (
  channel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(workspace_id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel_type channel_type NOT NULL DEFAULT 'public',
  icon VARCHAR(50),
  topic VARCHAR(255),
  owner_id UUID NOT NULL,
  is_private BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  pinned_message_ids UUID[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  member_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "channels_select" ON channels;
CREATE POLICY "channels_select" ON channels FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "channels_insert" ON channels;
CREATE POLICY "channels_insert" ON channels FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "channels_update" ON channels;
CREATE POLICY "channels_update" ON channels FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS channel_members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role participant_role NOT NULL DEFAULT 'member',
  last_read_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  notifications_enabled BOOLEAN DEFAULT true,
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

DROP POLICY IF EXISTS "channel_members_select" ON channel_members;
CREATE POLICY "channel_members_select" ON channel_members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "channel_members_insert" ON channel_members;
CREATE POLICY "channel_members_insert" ON channel_members FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "channel_members_update" ON channel_members;
CREATE POLICY "channel_members_update" ON channel_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CHAT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS chat_messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(channel_id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(workspace_id),
  thread_id UUID REFERENCES chat_messages(message_id) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES chat_messages(message_id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  edited_content TEXT,
  edited_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  pinned_by UUID,
  pinned_at TIMESTAMPTZ,
  is_bookmarked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '{}',
  reply_count INTEGER DEFAULT 0,
  read_by UUID[] DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "chat_messages_select" ON chat_messages;
CREATE POLICY "chat_messages_select" ON chat_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;
CREATE POLICY "chat_messages_insert" ON chat_messages FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "chat_messages_update" ON chat_messages;
CREATE POLICY "chat_messages_update" ON chat_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROJECT WORKSPACES
-- ============================================

CREATE TABLE IF NOT EXISTS project_workspaces (
  project_workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(workspace_id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15,2),
  spent NUMERIC(15,2) DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  visibility VARCHAR(20) DEFAULT 'team',
  settings JSONB DEFAULT '{}',
  channel_id UUID REFERENCES channels(channel_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "proj_workspace_select" ON project_workspaces;
CREATE POLICY "proj_workspace_select" ON project_workspaces FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "proj_workspace_insert" ON project_workspaces;
CREATE POLICY "proj_workspace_insert" ON project_workspaces FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "proj_workspace_update" ON project_workspaces;
CREATE POLICY "proj_workspace_update" ON project_workspaces FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE project_workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_workspace_id UUID NOT NULL REFERENCES project_workspaces(project_workspace_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role participant_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_workspace_id, user_id)
);

DROP POLICY IF EXISTS "proj_members_select" ON project_members;
CREATE POLICY "proj_members_select" ON project_members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "proj_members_insert" ON project_members;
CREATE POLICY "proj_members_insert" ON project_members FOR INSERT TO authenticated WITH CHECK (true);
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS project_milestones (
  milestone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_workspace_id UUID NOT NULL REFERENCES project_workspaces(project_workspace_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  progress_percent INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "milestones_select" ON project_milestones;
CREATE POLICY "milestones_select" ON project_milestones FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "milestones_insert" ON project_milestones;
CREATE POLICY "milestones_insert" ON project_milestones FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "milestones_update" ON project_milestones;
CREATE POLICY "milestones_update" ON project_milestones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MEETINGS
-- ============================================

CREATE TABLE IF NOT EXISTS meetings (
  meeting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  agenda TEXT,
  meeting_type VARCHAR(50) DEFAULT 'standard',
  status meeting_status NOT NULL DEFAULT 'scheduled',
  organizer_id UUID NOT NULL,
  workspace_id UUID REFERENCES workspaces(workspace_id),
  project_workspace_id UUID REFERENCES project_workspaces(project_workspace_id),
  channel_id UUID REFERENCES channels(channel_id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  location VARCHAR(255),
  meeting_url VARCHAR(500),
  provider VARCHAR(50) DEFAULT 'internal',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule VARCHAR(100),
  parent_meeting_id UUID REFERENCES meetings(meeting_id),
  notes TEXT,
  ai_summary TEXT,
  recording_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "meetings_select" ON meetings;
CREATE POLICY "meetings_select" ON meetings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "meetings_insert" ON meetings;
CREATE POLICY "meetings_insert" ON meetings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "meetings_update" ON meetings;
CREATE POLICY "meetings_update" ON meetings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(meeting_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_required BOOLEAN DEFAULT true,
  response_status VARCHAR(20) DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  UNIQUE(meeting_id, user_id)
);

DROP POLICY IF EXISTS "meeting_part_select" ON meeting_participants;
CREATE POLICY "meeting_part_select" ON meeting_participants FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "meeting_part_insert" ON meeting_participants;
CREATE POLICY "meeting_part_insert" ON meeting_participants FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "meeting_part_update" ON meeting_participants;
CREATE POLICY "meeting_part_update" ON meeting_participants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS meeting_action_items (
  action_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(meeting_id) ON DELETE CASCADE,
  task_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID,
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "meeting_actions_select" ON meeting_action_items;
CREATE POLICY "meeting_actions_select" ON meeting_action_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "meeting_actions_insert" ON meeting_action_items;
CREATE POLICY "meeting_actions_insert" ON meeting_action_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "meeting_actions_update" ON meeting_action_items;
CREATE POLICY "meeting_actions_update" ON meeting_action_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- KNOWLEDGE BASE
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES knowledge_categories(category_id),
  icon VARCHAR(50),
  color VARCHAR(20),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "knowledge_cat_select" ON knowledge_categories;
CREATE POLICY "knowledge_cat_select" ON knowledge_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "knowledge_cat_insert" ON knowledge_categories;
CREATE POLICY "knowledge_cat_insert" ON knowledge_categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "knowledge_cat_update" ON knowledge_categories;
CREATE POLICY "knowledge_cat_update" ON knowledge_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS knowledge_articles (
  article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category_id UUID REFERENCES knowledge_categories(category_id),
  article_type VARCHAR(50) DEFAULT 'article',
  status knowledge_status NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL,
  reviewer_id UUID,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  parent_article_id UUID,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "knowledge_articles_select" ON knowledge_articles;
CREATE POLICY "knowledge_articles_select" ON knowledge_articles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "knowledge_articles_insert" ON knowledge_articles;
CREATE POLICY "knowledge_articles_insert" ON knowledge_articles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "knowledge_articles_update" ON knowledge_articles;
CREATE POLICY "knowledge_articles_update" ON knowledge_articles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS knowledge_article_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES knowledge_article_comments(comment_id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "kb_comments_select" ON knowledge_article_comments;
CREATE POLICY "kb_comments_select" ON knowledge_article_comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "kb_comments_insert" ON knowledge_article_comments;
CREATE POLICY "kb_comments_insert" ON knowledge_article_comments FOR INSERT TO authenticated WITH CHECK (true);
ALTER TABLE knowledge_article_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ANNOUNCEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  ai_summary TEXT,
  priority announcement_priority NOT NULL DEFAULT 'normal',
  category VARCHAR(50) DEFAULT 'general',
  author_id UUID NOT NULL,
  target_type VARCHAR(50) DEFAULT 'all',
  target_ids UUID[] DEFAULT '{}',
  channel_id UUID REFERENCES channels(channel_id),
  is_pinned BOOLEAN DEFAULT false,
  is_emergency BOOLEAN DEFAULT false,
  send_notification BOOLEAN DEFAULT true,
  send_email BOOLEAN DEFAULT false,
  send_whatsapp BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  acknowledgement_required BOOLEAN DEFAULT false,
  acknowledgement_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "announcements_select" ON announcements;
CREATE POLICY "announcements_select" ON announcements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "announcements_insert" ON announcements;
CREATE POLICY "announcements_insert" ON announcements FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "announcements_update" ON announcements;
CREATE POLICY "announcements_update" ON announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS announcement_acknowledgements (
  acknowledgement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(announcement_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

DROP POLICY IF EXISTS "ann_ack_select" ON announcement_acknowledgements;
CREATE POLICY "ann_ack_select" ON announcement_acknowledgements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ann_ack_insert" ON announcement_acknowledgements;
CREATE POLICY "ann_ack_insert" ON announcement_acknowledgements FOR INSERT TO authenticated WITH CHECK (true);
ALTER TABLE announcement_acknowledgements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WHITEBOARD
-- ============================================

CREATE TABLE IF NOT EXISTS whiteboards (
  whiteboard_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(workspace_id),
  project_workspace_id UUID REFERENCES project_workspaces(project_workspace_id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  board_type VARCHAR(50) DEFAULT 'freeform',
  background VARCHAR(50) DEFAULT 'blank',
  elements JSONB DEFAULT '[]',
  view_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "whiteboards_select" ON whiteboards;
CREATE POLICY "whiteboards_select" ON whiteboards FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "whiteboards_insert" ON whiteboards;
CREATE POLICY "whiteboards_insert" ON whiteboards FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "whiteboards_update" ON whiteboards;
CREATE POLICY "whiteboards_update" ON whiteboards FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EMPLOYEE DIRECTORY
-- ============================================

CREATE TABLE IF NOT EXISTS employee_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  employee_number VARCHAR(50),
  display_name VARCHAR(255),
  title VARCHAR(255),
  department VARCHAR(100),
  department_id UUID,
  branch_id UUID,
  manager_id UUID,
  bio TEXT,
  phone VARCHAR(50),
  extension VARCHAR(20),
  location VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  avatar_url VARCHAR(500),
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  hire_date DATE,
  birthday DATE,
  work_anniversary DATE,
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  status_message VARCHAR(255),
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "emp_profiles_select" ON employee_profiles;
CREATE POLICY "emp_profiles_select" ON employee_profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "emp_profiles_insert" ON employee_profiles;
CREATE POLICY "emp_profiles_insert" ON employee_profiles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "emp_profiles_update" ON employee_profiles;
CREATE POLICY "emp_profiles_update" ON employee_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ACTIVITY TIMELINE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  workspace_id UUID,
  channel_id UUID,
  project_workspace_id UUID,
  title VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "activity_events_select" ON activity_events;
CREATE POLICY "activity_events_select" ON activity_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "activity_events_insert" ON activity_events;
CREATE POLICY "activity_events_insert" ON activity_events FOR INSERT TO authenticated WITH CHECK (true);
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COLLABORATION ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS collaboration_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  workspace_id UUID,
  channel_id UUID,
  metric_type VARCHAR(100) NOT NULL,
  metric_value NUMERIC(15,4) NOT NULL,
  dimension_type VARCHAR(50),
  dimension_value VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(metric_date, workspace_id, channel_id, metric_type, dimension_type, dimension_value)
);

DROP POLICY IF EXISTS "collab_metrics_select" ON collaboration_metrics;
CREATE POLICY "collab_metrics_select" ON collaboration_metrics FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "collab_metrics_insert" ON collaboration_metrics;
CREATE POLICY "collab_metrics_insert" ON collaboration_metrics FOR INSERT TO authenticated WITH CHECK (true);
ALTER TABLE collaboration_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO knowledge_categories (name, description, icon, color) VALUES
('Getting Started', 'New user guides and onboarding materials', 'rocket', 'blue'),
('Policies', 'Company policies and compliance documents', 'shield', 'purple'),
('SOPs', 'Standard Operating Procedures', 'file-text', 'green'),
('FAQs', 'Frequently Asked Questions', 'help-circle', 'yellow'),
('Training', 'Training guides and tutorials', 'book', 'cyan'),
('Technical', 'Technical documentation', 'code', 'orange')
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
DO $$ BEGIN
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_proj_workspace_updated_at BEFORE UPDATE ON project_workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_knowledge_cat_updated_at BEFORE UPDATE ON knowledge_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_kb_comments_updated_at BEFORE UPDATE ON knowledge_article_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_whiteboards_updated_at BEFORE UPDATE ON whiteboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_emp_profiles_updated_at BEFORE UPDATE ON employee_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN null; END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent ON chat_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_meetings_start ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_activity_events_created ON activity_events(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published_at);