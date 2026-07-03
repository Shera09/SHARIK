-- Mobile Ecosystem Tables

-- Device Registrations
CREATE TABLE IF NOT EXISTS device_registrations (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('android', 'ios', 'pwa', 'windows', 'macos', 'linux', 'tablet')),
  device_os TEXT,
  device_model TEXT,
  app_version TEXT,
  push_token TEXT,
  biometric_enabled BOOLEAN DEFAULT false,
  trusted_device BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  first_registered_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_registrations_user ON device_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_type ON device_registrations(device_type);
CREATE INDEX IF NOT EXISTS idx_device_registrations_active ON device_registrations(is_active);

-- Sync Queue (offline operations queue)
CREATE TABLE IF NOT EXISTS sync_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES device_registrations(device_id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  priority INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'completed', 'failed', 'conflict')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  created_offline BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);

-- Sync Conflicts
CREATE TABLE IF NOT EXISTS sync_conflicts (
  conflict_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES sync_queue(queue_id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  server_version JSONB,
  client_version JSONB,
  resolution_strategy TEXT CHECK (resolution_strategy IN ('server_wins', 'client_wins', 'manual', 'merge')),
  resolved_at TIMESTAMPTZ,
  resolved_version JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_entity ON sync_conflicts(entity_type, entity_id);

-- Push Notifications Queue
CREATE TABLE IF NOT EXISTS push_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES device_registrations(device_id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 5,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_type ON push_notifications(notification_type);

-- Push Notification Preferences
CREATE TABLE IF NOT EXISTS push_notification_preferences (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  lead_alerts BOOLEAN DEFAULT true,
  payment_alerts BOOLEAN DEFAULT true,
  invoice_alerts BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  meeting_reminders BOOLEAN DEFAULT true,
  support_tickets BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,
  marketing_updates BOOLEAN DEFAULT false,
  employee_notifications BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mobile Sessions
CREATE TABLE IF NOT EXISTS mobile_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES device_registrations(device_id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  location TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  biometric_used BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_mobile_sessions_user ON mobile_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_token ON mobile_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_active ON mobile_sessions(is_active);

-- Offline Data Cache Stats
CREATE TABLE IF NOT EXISTS offline_cache_stats (
  cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES device_registrations(device_id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  records_cached INTEGER DEFAULT 0,
  cache_size_bytes BIGINT DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  sync_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_offline_cache_device ON offline_cache_stats(device_id);

-- Mobile Activity Logs
CREATE TABLE IF NOT EXISTS mobile_activity_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES device_registrations(device_id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  is_offline BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mobile_activity_user ON mobile_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_activity_device ON mobile_activity_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_activity_type ON mobile_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_mobile_activity_time ON mobile_activity_logs(created_at);

-- AI Mobile Assistant History
CREATE TABLE IF NOT EXISTS ai_mobile_assistant_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES device_registrations(device_id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('voice', 'text', 'gesture')),
  query TEXT NOT NULL,
  response TEXT,
  context JSONB DEFAULT '{}',
  actions_taken JSONB DEFAULT '[]',
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_mobile_history_user ON ai_mobile_assistant_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_mobile_history_type ON ai_mobile_assistant_history(interaction_type);

-- Mobile App Configuration
CREATE TABLE IF NOT EXISTS mobile_app_config (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  platform TEXT CHECK (platform IN ('android', 'ios', 'pwa', 'windows', 'macos', 'linux', 'all')),
  min_app_version TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configurations
INSERT INTO mobile_app_config (config_key, config_value, platform) VALUES
('sync_interval_seconds', '{"default": 300, "wifi": 60, "cellular": 600}', 'all'),
('offline_cache_limit_mb', '{"default": 100, "premium": 500}', 'all'),
('biometric_timeout_minutes', '{"value": 30}', 'all'),
('max_offline_days', '{"value": 7}', 'all'),
('image_quality', '{"wifi": 100, "cellular": 70, "low": 50}', 'all'),
('push_batch_size', '{"value": 50}', 'all'),
('crash_report_enabled', '{"value": true}', 'all'),
('analytics_enabled', '{"value": true}', 'all')
ON CONFLICT (config_key) DO NOTHING;

-- Mobile Analytics Events
CREATE TABLE IF NOT EXISTS mobile_analytics_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES device_registrations(device_id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  session_duration_seconds INTEGER,
  is_offline BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mobile_analytics_event ON mobile_analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_time ON mobile_analytics_events(created_at);

-- Enable RLS
ALTER TABLE device_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_cache_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mobile_assistant_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for device_registrations
CREATE POLICY "select_own_devices" ON device_registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_devices" ON device_registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_devices" ON device_registrations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_devices" ON device_registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for sync_queue
CREATE POLICY "select_own_sync" ON sync_queue FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_sync" ON sync_queue FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_sync" ON sync_queue FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_sync" ON sync_queue FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for push_notifications
CREATE POLICY "select_own_notifications" ON push_notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_notifications" ON push_notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_notifications" ON push_notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mobile_sessions
CREATE POLICY "select_own_sessions" ON mobile_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_sessions" ON mobile_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_sessions" ON mobile_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for push_notification_preferences
CREATE POLICY "select_own_preferences" ON push_notification_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_preferences" ON push_notification_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_preferences" ON push_notification_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mobile_activity_logs
CREATE POLICY "select_own_activity" ON mobile_activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_activity" ON mobile_activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_mobile_assistant_history
CREATE POLICY "select_own_ai_history" ON ai_mobile_assistant_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_ai_history" ON ai_mobile_assistant_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mobile_analytics_events
CREATE POLICY "select_own_analytics" ON mobile_analytics_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_analytics" ON mobile_analytics_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS for offline_cache_stats
CREATE POLICY "select_own_cache" ON offline_cache_stats FOR SELECT
  TO authenticated USING (device_id IN (SELECT device_id FROM device_registrations WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_cache" ON offline_cache_stats FOR INSERT
  TO authenticated WITH CHECK (device_id IN (SELECT device_id FROM device_registrations WHERE user_id = auth.uid()));
CREATE POLICY "update_own_cache" ON offline_cache_stats FOR UPDATE
  TO authenticated USING (device_id IN (SELECT device_id FROM device_registrations WHERE user_id = auth.uid()));
