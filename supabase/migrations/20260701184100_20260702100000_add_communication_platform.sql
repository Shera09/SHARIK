-- AI Communication Platform Schema
-- Unified communications, AI receptionist, voice assistant, appointments

-- Communication Channels
CREATE TYPE comm_channel AS ENUM ('voice', 'whatsapp', 'email', 'chat', 'sms', 'internal');
CREATE TYPE comm_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE comm_status AS ENUM ('pending', 'active', 'completed', 'failed', 'transferred', 'escalated');
CREATE TYPE sentiment_type AS ENUM ('positive', 'neutral', 'frustrated', 'angry', 'happy', 'confused', 'urgent');
CREATE TYPE intent_type AS ENUM ('inquiry', 'purchase', 'support', 'complaint', 'appointment', 'payment', 'information', 'feedback', 'other');

-- Conversations (Unified Thread)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  lead_id UUID,
  subject TEXT,
  status comm_status DEFAULT 'active',
  primary_channel comm_channel DEFAULT 'chat',
  assigned_employee_id UUID,
  sentiment sentiment_type DEFAULT 'neutral',
  detected_intent intent_type,
  ai_confidence_score NUMERIC DEFAULT 0,
  is_ai_handled BOOLEAN DEFAULT TRUE,
  transferred_to_employee_id UUID,
  transferred_at TIMESTAMPTZ,
  resolution_summary TEXT,
  satisfaction_score INTEGER,
  first_response_time_seconds INTEGER,
  total_duration_seconds INTEGER,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Messages
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  channel comm_channel NOT NULL,
  direction comm_direction NOT NULL,
  sender_type TEXT NOT NULL,
  sender_id TEXT,
  sender_name TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  transcription TEXT,
  audio_url TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  confidence_score NUMERIC,
  detected_intent TEXT,
  detected_entities JSONB DEFAULT '{}'::jsonb,
  language_detected TEXT DEFAULT 'en',
  sentiment sentiment_type,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation ON conversation_messages(conversation_id);

-- Voice Calls
CREATE TABLE voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  call_sid TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  direction comm_direction NOT NULL,
  status TEXT DEFAULT 'initiated',
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  transcription TEXT,
  ai_summary TEXT,
  ai_action_items JSONB DEFAULT '[]'::jsonb,
  sentiment sentiment_type,
  detected_intent intent_type,
  lead_id UUID,
  customer_id UUID,
  employee_id UUID,
  is_ai_answered BOOLEAN DEFAULT TRUE,
  transferred_to TEXT,
  transfer_reason TEXT,
  hangup_cause TEXT,
  call_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);
CREATE INDEX idx_calls_conversation ON voice_calls(conversation_id);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  customer_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  employee_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT DEFAULT 'meeting',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  location_type TEXT DEFAULT 'video',
  location_url TEXT,
  location_address TEXT,
  notes TEXT,
  google_calendar_event_id TEXT,
  outlook_event_id TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment Reminders
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  channel comm_channel NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Receptionist Configuration
CREATE TABLE ai_receptionist_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  greetings JSONB NOT NULL DEFAULT '{}'::jsonb,
  supported_languages TEXT[] DEFAULT ARRAY['en', 'hi'],
  transfer_threshold NUMERIC DEFAULT 0.6,
  working_hours_start TEXT DEFAULT '09:00',
  working_hours_end TEXT DEFAULT '18:00',
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  voicemail_message TEXT,
  after_hours_message TEXT,
  faq_knowledge JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Voice Commands Log
CREATE TABLE voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  voice_call_id UUID REFERENCES voice_calls(id) ON DELETE SET NULL,
  transcription TEXT NOT NULL,
  detected_command TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC,
  executed BOOLEAN DEFAULT FALSE,
  execution_result JSONB,
  response_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Analytics
CREATE TABLE communication_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  channel comm_channel,
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  answered_calls INTEGER DEFAULT 0,
  missed_calls INTEGER DEFAULT 0,
  avg_duration_seconds INTEGER DEFAULT 0,
  avg_first_response_seconds INTEGER DEFAULT 0,
  ai_resolution_count INTEGER DEFAULT 0,
  human_escalation_count INTEGER DEFAULT 0,
  avg_satisfaction_score NUMERIC DEFAULT 0,
  total_appointments_booked INTEGER DEFAULT 0,
  leads_created INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, channel)
);

-- Smart Routing Rules
CREATE TABLE routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Availability Status
CREATE TABLE agent_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  status TEXT DEFAULT 'offline',
  current_conversation_id UUID REFERENCES conversations(id),
  active_channels TEXT[] DEFAULT '{}',
  max_concurrent INTEGER DEFAULT 3,
  current_count INTEGER DEFAULT 0,
  last_ping_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_receptionist_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "allow_all_conversations" ON conversations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_conversation_messages" ON conversation_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_voice_calls" ON voice_calls FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_appointments" ON appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_appointment_reminders" ON appointment_reminders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ai_receptionist_config" ON ai_receptionist_config FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_voice_commands" ON voice_commands FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_communication_analytics" ON communication_analytics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_routing_rules" ON routing_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_agent_availability" ON agent_availability FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Updated at triggers
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_receptionist_config_updated_at BEFORE UPDATE ON ai_receptionist_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routing_rules_updated_at BEFORE UPDATE ON routing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_availability_updated_at BEFORE UPDATE ON agent_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed AI Receptionist Config
INSERT INTO ai_receptionist_config (name, greetings, supported_languages) VALUES
('Default Receptionist', '{"en": "Hello! Welcome to WebHoster. I am your AI assistant. How may I help you today?", "hi": "Namaskar! WebHoster mein aapka swagat hai. Main aapki AI sahayak hoon. Aaj main aapki kaise madad kar sakti hoon?"}'::jsonb, ARRAY['en', 'hi']);

-- Seed Routing Rules
INSERT INTO routing_rules (name, description, priority, conditions, actions) VALUES
('High Value Sales', 'Route high-value sales inquiries to senior sales team', 10,
 '{"intent": "purchase", "lead_value": {"greater_than": 50000}}'::jsonb,
 '{"assign_department": "sales", "priority": "high", "notify": ["sales_manager"]}'::jsonb),
('Support Escalation', 'Route frustrated customers to human agent', 20,
 '{"sentiment": {"in": ["frustrated", "angry"]}}'::jsonb,
 '{"assign_type": "human", "notify": ["support_team"]}'::jsonb),
('After Hours Voicemail', 'Send to voicemail after business hours', 30,
 '{"business_hours": false}'::jsonb,
 '{"action": "voicemail", "message": "Our business hours are 9 AM to 6 PM. Please leave a message."}'::jsonb);