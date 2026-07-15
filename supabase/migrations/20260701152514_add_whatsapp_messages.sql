CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  direction text NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'template')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_whatsapp_messages" ON whatsapp_messages;
CREATE POLICY "anon_select_whatsapp_messages" ON whatsapp_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_whatsapp_messages" ON whatsapp_messages;
CREATE POLICY "anon_insert_whatsapp_messages" ON whatsapp_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_whatsapp_messages" ON whatsapp_messages;
CREATE POLICY "anon_update_whatsapp_messages" ON whatsapp_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_whatsapp_messages" ON whatsapp_messages;
CREATE POLICY "anon_delete_whatsapp_messages" ON whatsapp_messages FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages (phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages (created_at DESC);

DROP TRIGGER IF EXISTS trg_whatsapp_messages_updated ON whatsapp_messages;
CREATE TRIGGER trg_whatsapp_messages_updated BEFORE UPDATE ON whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
