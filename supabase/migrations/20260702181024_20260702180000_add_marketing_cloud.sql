-- AI Marketing Cloud Schema for WebHoster AI Business OS

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  campaign_status TEXT NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2) DEFAULT 0,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  target_audience JSONB,
  goals JSONB,
  channels TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Landing Pages
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  page_title TEXT,
  meta_description TEXT,
  page_content JSONB NOT NULL,
  page_status TEXT NOT NULL DEFAULT 'draft',
  template_id UUID,
  campaign_id UUID REFERENCES marketing_campaigns(id),
  forms JSONB,
  seo_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  view_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Forms
CREATE TABLE IF NOT EXISTS marketing_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name TEXT NOT NULL,
  form_type TEXT NOT NULL DEFAULT 'lead_capture',
  fields JSONB NOT NULL,
  submit_action TEXT,
  thank_you_message TEXT,
  redirect_url TEXT,
  notification_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
  landing_page_id UUID REFERENCES landing_pages(id),
  submission_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES marketing_forms(id),
  landing_page_id UUID REFERENCES landing_pages(id),
  lead_id UUID,
  submission_data JSONB NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  is_converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Marketing Campaigns
CREATE TABLE IF NOT EXISTS wa_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  campaign_name TEXT NOT NULL,
  template_name TEXT,
  body_content TEXT NOT NULL,
  header_content TEXT,
  footer_text TEXT,
  buttons JSONB,
  segment_id UUID,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  delivery_rate DECIMAL(5,2) DEFAULT 0,
  read_rate DECIMAL(5,2) DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Campaigns
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  campaign_name TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sender_id TEXT,
  segment_id UUID,
  message_type TEXT DEFAULT 'promotional',
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  delivery_rate DECIMAL(5,2) DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Templates
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT DEFAULT 'promotional',
  message_content TEXT NOT NULL,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  dlt_template_id TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Accounts
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_handle TEXT,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_type TEXT,
  is_connected BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Posts
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES social_media_accounts(id),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  post_content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  media_type TEXT,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentions TEXT[] DEFAULT ARRAY[]::TEXT[],
  post_link TEXT,
  post_status TEXT DEFAULT 'draft',
  platform_post_id TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_description TEXT,
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  content_status TEXT DEFAULT 'idea',
  scheduled_date DATE,
  scheduled_time TIME,
  assignee_id UUID,
  post_ids UUID[] DEFAULT ARRAY[]::UUID[],
  campaign_id UUID REFERENCES marketing_campaigns(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Segments
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name TEXT NOT NULL,
  segment_description TEXT,
  segment_type TEXT DEFAULT 'static',
  criteria JSONB NOT NULL,
  customer_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Segment Members
CREATE TABLE IF NOT EXISTS segment_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES customer_segments(id) ON DELETE CASCADE,
  customer_id UUID,
  lead_id UUID,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_reason TEXT,
  UNIQUE(segment_id, customer_id, lead_id)
);

-- Lead Scoring Rules
CREATE TABLE IF NOT EXISTS lead_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_description TEXT,
  criteria_type TEXT NOT NULL,
  criteria_config JSONB NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  max_points INTEGER,
  decay_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Scores
CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  total_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  fit_score INTEGER DEFAULT 0,
  behavior_score INTEGER DEFAULT 0,
  score_tier TEXT,
  score_history JSONB DEFAULT '[]'::JSONB,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lead_id)
);

-- Lead Score Events
CREATE TABLE IF NOT EXISTS lead_score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  rule_id UUID REFERENCES lead_scoring_rules(id),
  event_type TEXT NOT NULL,
  event_description TEXT,
  points_earned INTEGER DEFAULT 0,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Workflows
CREATE TABLE IF NOT EXISTS marketing_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  workflow_description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB,
  workflow_steps JSONB NOT NULL,
  workflow_status TEXT DEFAULT 'draft',
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Pages
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL UNIQUE,
  page_title TEXT,
  meta_title TEXT,
  meta_description TEXT,
  h1_text TEXT,
  canonical_url TEXT,
  robots_directive TEXT DEFAULT 'index, follow',
  schema_markup JSONB,
  focus_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  seo_score INTEGER DEFAULT 0,
  page_speed_score INTEGER,
  mobile_friendly_score INTEGER,
  word_count INTEGER DEFAULT 0,
  internal_links INTEGER DEFAULT 0,
  external_links INTEGER DEFAULT 0,
  broken_links INTEGER DEFAULT 0,
  image_count INTEGER DEFAULT 0,
  images_without_alt INTEGER DEFAULT 0,
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Keywords
CREATE TABLE IF NOT EXISTS seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  current_rank INTEGER,
  previous_rank INTEGER,
  best_rank INTEGER,
  search_intent TEXT,
  cpc_value DECIMAL(8,2),
  competitor_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  suggested_content_title TEXT,
  is_targeting BOOLEAN DEFAULT false,
  page_id UUID REFERENCES seo_pages(id),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Ad Campaigns
CREATE TABLE IF NOT EXISTS digital_ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  platform_campaign_id TEXT,
  marketing_campaign_id UUID REFERENCES marketing_campaigns(id),
  campaign_name TEXT NOT NULL,
  campaign_objective TEXT,
  budget_type TEXT,
  budget_amount DECIMAL(12,2) DEFAULT 0,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed DECIMAL(12,2) DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  cpc DECIMAL(8,2) DEFAULT 0,
  cpm DECIMAL(8,2) DEFAULT 0,
  cpa DECIMAL(8,2) DEFAULT 0,
  roas DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  targeting JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Journey Stages
CREATE TABLE IF NOT EXISTS customer_journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  stage_description TEXT,
  entry_criteria JSONB,
  exit_criteria JSONB,
  avg_time_in_stage INTEGER,
  conversion_rate_to_next DECIMAL(5,2) DEFAULT 0,
  drop_off_rate DECIMAL(5,2) DEFAULT 0,
  color_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Journey Instances
CREATE TABLE IF NOT EXISTS customer_journey_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  lead_id UUID,
  current_stage_id UUID REFERENCES customer_journey_stages(id),
  journey_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stage_entered_at TIMESTAMP WITH TIME ZONE,
  stage_history JSONB DEFAULT '[]'::JSONB,
  touchpoints JSONB DEFAULT '[]'::JSONB,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  predicted_next_stage UUID,
  predicted_conversion_probability DECIMAL(5,2)
);

-- Loyalty Programs
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  program_type TEXT DEFAULT 'points',
  program_description TEXT,
  points_per_rupee DECIMAL(5,2) DEFAULT 1,
  minimum_points_redemption INTEGER DEFAULT 0,
  points_expiry_months INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES loyalty_programs(id),
  tier_name TEXT NOT NULL,
  tier_level INTEGER NOT NULL,
  min_points INTEGER DEFAULT 0,
  max_points INTEGER,
  benefits JSONB,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  color_code TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Loyalty Accounts
CREATE TABLE IF NOT EXISTS customer_loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  program_id UUID REFERENCES loyalty_programs(id),
  current_tier_id UUID REFERENCES loyalty_tiers(id),
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  points_earned_this_year INTEGER DEFAULT 0,
  tier_start_date DATE,
  next_tier_id UUID REFERENCES loyalty_tiers(id),
  points_to_next_tier INTEGER,
  member_since DATE DEFAULT CURRENT_DATE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, program_id)
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES customer_loyalty_accounts(id),
  transaction_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  source_reference TEXT,
  invoice_id UUID,
  order_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Programs
CREATE TABLE IF NOT EXISTS referral_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  program_description TEXT,
  referrer_reward_type TEXT,
  referrer_reward_value DECIMAL(10,2),
  referee_reward_type TEXT,
  referee_reward_value DECIMAL(10,2),
  reward_on TEXT DEFAULT 'first_purchase',
  minimum_purchase_amount DECIMAL(10,2),
  max_referrals_per_user INTEGER,
  reward_validity_days INTEGER,
  terms_and_conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES referral_programs(id),
  referrer_customer_id UUID NOT NULL,
  referrer_lead_id UUID,
  referee_customer_id UUID,
  referee_lead_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  referral_link TEXT,
  referral_status TEXT DEFAULT 'pending',
  referral_date DATE DEFAULT CURRENT_DATE,
  qualified_date DATE,
  rewarded_date DATE,
  referrer_reward_claimed BOOLEAN DEFAULT false,
  referee_reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Content
CREATE TABLE IF NOT EXISTS marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_status TEXT DEFAULT 'draft',
  content_body TEXT NOT NULL,
  content_excerpt TEXT,
  generated_by_ai BOOLEAN DEFAULT false,
  ai_model TEXT,
  ai_prompt TEXT,
  tone TEXT,
  target_language TEXT DEFAULT 'en',
  target_word_count INTEGER,
  actual_word_count INTEGER,
  seo_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  campaign_id UUID REFERENCES marketing_campaigns(id),
  published_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Marketing Recommendations
CREATE TABLE IF NOT EXISTS ai_marketing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_type TEXT NOT NULL,
  recommendation_title TEXT NOT NULL,
  recommendation_description TEXT NOT NULL,
  target_entity_type TEXT,
  target_entity_id UUID,
  reasoning TEXT,
  expected_impact TEXT,
  assumptions TEXT,
  confidence_score DECIMAL(5,2),
  priority INTEGER DEFAULT 0,
  recommendation_status TEXT DEFAULT 'pending',
  implemented_at TIMESTAMP WITH TIME ZONE,
  actual_impact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Metrics Daily
CREATE TABLE IF NOT EXISTS marketing_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  website_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  marketing_qualified_leads INTEGER DEFAULT 0,
  sales_qualified_leads INTEGER DEFAULT 0,
  opportunities_created INTEGER DEFAULT 0,
  customers_acquired INTEGER DEFAULT 0,
  revenue_attributed DECIMAL(12,2) DEFAULT 0,
  marketing_spend DECIMAL(12,2) DEFAULT 0,
  cost_per_lead DECIMAL(8,2) DEFAULT 0,
  cost_per_acquisition DECIMAL(8,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  email_sent INTEGER DEFAULT 0,
  email_opened INTEGER DEFAULT 0,
  email_clicked INTEGER DEFAULT 0,
  whatsapp_sent INTEGER DEFAULT 0,
  whatsapp_delivered INTEGER DEFAULT 0,
  whatsapp_read INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  sms_delivered INTEGER DEFAULT 0,
  social_posts INTEGER DEFAULT 0,
  social_engagement INTEGER DEFAULT 0,
  ad_impressions INTEGER DEFAULT 0,
  ad_clicks INTEGER DEFAULT 0,
  ad_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_date)
);

-- Marketing Consent
CREATE TABLE IF NOT EXISTS marketing_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  lead_id UUID,
  email_consent BOOLEAN DEFAULT false,
  email_consent_at TIMESTAMP WITH TIME ZONE,
  whatsapp_consent BOOLEAN DEFAULT false,
  whatsapp_consent_at TIMESTAMP WITH TIME ZONE,
  sms_consent BOOLEAN DEFAULT false,
  sms_consent_at TIMESTAMP WITH TIME ZONE,
  consent_source TEXT,
  ip_address TEXT,
  opt_out_email BOOLEAN DEFAULT false,
  opt_out_email_at TIMESTAMP WITH TIME ZONE,
  opt_out_whatsapp BOOLEAN DEFAULT false,
  opt_out_whatsapp_at TIMESTAMP WITH TIME ZONE,
  opt_out_sms BOOLEAN DEFAULT false,
  opt_out_sms_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);