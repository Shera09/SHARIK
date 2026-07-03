-- Enable RLS and add policies for marketing tables
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_journey_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_marketing_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_campaigns_policy ON marketing_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY landing_pages_policy ON landing_pages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY marketing_forms_policy ON marketing_forms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY form_submissions_policy ON form_submissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY wa_marketing_campaigns_policy ON wa_marketing_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY sms_campaigns_policy ON sms_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY sms_templates_policy ON sms_templates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY social_media_accounts_policy ON social_media_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY social_media_posts_policy ON social_media_posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY content_calendar_policy ON content_calendar FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY customer_segments_policy ON customer_segments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY segment_members_policy ON segment_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY lead_scoring_rules_policy ON lead_scoring_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY lead_scores_policy ON lead_scores FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY lead_score_events_policy ON lead_score_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY marketing_workflows_policy ON marketing_workflows FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY seo_pages_policy ON seo_pages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY seo_keywords_policy ON seo_keywords FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY digital_ad_campaigns_policy ON digital_ad_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY customer_journey_stages_policy ON customer_journey_stages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY customer_journey_instances_policy ON customer_journey_instances FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY loyalty_programs_policy ON loyalty_programs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY loyalty_tiers_policy ON loyalty_tiers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY customer_loyalty_accounts_policy ON customer_loyalty_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY loyalty_transactions_policy ON loyalty_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY referral_programs_policy ON referral_programs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY referrals_policy ON referrals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY marketing_content_policy ON marketing_content FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY ai_marketing_recommendations_policy ON ai_marketing_recommendations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY marketing_metrics_daily_policy ON marketing_metrics_daily FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY marketing_consent_policy ON marketing_consent FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert journey stages
INSERT INTO customer_journey_stages (stage_name, stage_order, stage_description, color_code) VALUES
('Visitor', 1, 'Anonymous website visitor', 'gray'),
('Lead', 2, 'Captured contact information', 'blue'),
('Qualified Lead', 3, 'Meets ideal customer profile', 'cyan'),
('Opportunity', 4, 'Active sales conversation', 'yellow'),
('Customer', 5, 'Completed first purchase', 'green'),
('Repeat Customer', 6, 'Multiple purchases made', 'emerald'),
('Loyal Customer', 7, 'Regular engaged customer', 'teal'),
('Advocate', 8, 'Refers new customers', 'purple')
ON CONFLICT DO NOTHING;

-- Insert loyalty program
INSERT INTO loyalty_programs (program_name, program_type, program_description, points_per_rupee, is_active) VALUES
('WebHoster Rewards', 'tier', 'Earn points on every purchase and unlock exclusive benefits', 1, true)
ON CONFLICT DO NOTHING;

-- Insert loyalty tiers
INSERT INTO loyalty_tiers (program_id, tier_name, tier_level, min_points, benefits, discount_percent, color_code) 
SELECT id, 'Bronze', 1, 0, '{"discount": 0, "points_multiplier": 1}'::jsonb, 0, 'cd7f32'
FROM loyalty_programs WHERE program_name = 'WebHoster Rewards';

INSERT INTO loyalty_tiers (program_id, tier_name, tier_level, min_points, benefits, discount_percent, color_code)
SELECT id, 'Silver', 2, 1000, '{"discount": 5, "points_multiplier": 1.25}'::jsonb, 5, 'c0c0c0'
FROM loyalty_programs WHERE program_name = 'WebHoster Rewards';

INSERT INTO loyalty_tiers (program_id, tier_name, tier_level, min_points, benefits, discount_percent, color_code)
SELECT id, 'Gold', 3, 5000, '{"discount": 10, "points_multiplier": 1.5}'::jsonb, 10, 'ffd700'
FROM loyalty_programs WHERE program_name = 'WebHoster Rewards';

INSERT INTO loyalty_tiers (program_id, tier_name, tier_level, min_points, benefits, discount_percent, color_code)
SELECT id, 'Platinum', 4, 15000, '{"discount": 15, "points_multiplier": 2, "priority_support": true}'::jsonb, 15, 'e5e4e2'
FROM loyalty_programs WHERE program_name = 'WebHoster Rewards';

-- Insert lead scoring rules
INSERT INTO lead_scoring_rules (rule_name, rule_description, criteria_type, criteria_config, points) VALUES
('Website Visit', 'Points for each website visit', 'website_visit', '{"count": 1}', 5),
('Form Submission', 'Points for form submission', 'form_submission', '{"any": true}', 25),
('Email Open', 'Points for opening marketing email', 'email_open', '{"count": 1}', 3),
('Email Click', 'Points for clicking email link', 'email_click', '{"count": 1}', 10),
('Demo Request', 'Points for requesting demo', 'demo_request', '{"any": true}', 50),
('Purchase', 'Points for making purchase', 'purchase', '{"any": true}', 100)
ON CONFLICT DO NOTHING;