CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  event_type text NOT NULL DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'call', 'deadline', 'follow_up', 'demo', 'other')),
  attendees text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_calendar_events" ON calendar_events;
CREATE POLICY "anon_select_calendar_events" ON calendar_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_calendar_events" ON calendar_events;
CREATE POLICY "anon_insert_calendar_events" ON calendar_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_calendar_events" ON calendar_events;
CREATE POLICY "anon_update_calendar_events" ON calendar_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_calendar_events" ON calendar_events;
CREATE POLICY "anon_delete_calendar_events" ON calendar_events FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events (event_date);

DROP TRIGGER IF EXISTS trg_calendar_events_updated ON calendar_events;
CREATE TRIGGER trg_calendar_events_updated BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
