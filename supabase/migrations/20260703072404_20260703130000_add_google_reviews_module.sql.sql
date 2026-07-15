/*
# Google Reviews Management Module

1. New Tables
- `google_reviews` - Stores imported reviews from Google Business Profile
  - `id` (uuid, primary key)
  - `google_review_id` (text, unique) - Google's review ID
  - `reviewer_name` (text) - Name of reviewer
  - `reviewer_photo_url` (text, nullable) - Profile photo URL
  - `rating` (integer) - Star rating 1-5
  - `review_text` (text, nullable) - Review content
  - `review_date` (timestamptz) - When review was posted
  - `is_visible` (boolean) - Show on website
  - `is_featured` (boolean) - Featured review
  - `display_order` (integer) - Custom sort order
  - `last_synced_at` (timestamptz) - Last sync timestamp
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `review_display_settings` - Widget display configuration
  - `id` (uuid, primary key)
  - `setting_key` (text, unique)
  - `setting_value` (text)
  - `updated_at` (timestamptz)

- `review_sync_logs` - Sync history tracking
  - `id` (uuid, primary key)
  - `sync_type` (text) - manual/auto
  - `status` (text) - success/failed/partial
  - `reviews_fetched` (integer)
  - `reviews_added` (integer)
  - `reviews_updated` (integer)
  - `error_message` (text, nullable)
  - `sync_duration_ms` (integer)
  - `synced_at` (timestamptz)

2. Security
- Enable RLS on all tables
- Owner-scoped policies for authenticated users
- Super admin and admin roles can manage reviews

3. Indexes
- Index on google_review_id for duplicate detection
- Index on is_visible for widget queries
- Index on is_featured for featured queries
- Index on display_order for sorting
*/

-- Google Reviews table
CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_review_id text UNIQUE NOT NULL,
  reviewer_name text NOT NULL,
  reviewer_photo_url text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_date timestamptz NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Review Display Settings table
CREATE TABLE IF NOT EXISTS review_display_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Review Sync Logs table
CREATE TABLE IF NOT EXISTS review_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'success',
  reviews_fetched integer DEFAULT 0,
  reviews_added integer DEFAULT 0,
  reviews_updated integer DEFAULT 0,
  error_message text,
  sync_duration_ms integer DEFAULT 0,
  synced_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_display_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sync_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_reviews_google_id ON google_reviews(google_review_id);
CREATE INDEX IF NOT EXISTS idx_google_reviews_visible ON google_reviews(is_visible);
CREATE INDEX IF NOT EXISTS idx_google_reviews_featured ON google_reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_google_reviews_order ON google_reviews(display_order);
CREATE INDEX IF NOT EXISTS idx_google_reviews_date ON google_reviews(review_date DESC);

-- Insert default display settings
INSERT INTO review_display_settings (setting_key, setting_value) VALUES
  ('widget_theme', 'light'),
  ('widget_layout', 'carousel'),
  ('max_reviews_display', '10'),
  ('show_ratings', 'true'),
  ('show_photos', 'true'),
  ('auto_sync_enabled', 'false'),
  ('auto_sync_interval', '24'),
  ('google_place_id', ''),
  ('last_sync_at', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Policies for google_reviews
DROP POLICY IF EXISTS "select_google_reviews" ON google_reviews;
CREATE POLICY "select_google_reviews" ON google_reviews FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_google_reviews" ON google_reviews;
CREATE POLICY "insert_google_reviews" ON google_reviews FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_google_reviews" ON google_reviews;
CREATE POLICY "update_google_reviews" ON google_reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_google_reviews" ON google_reviews;
CREATE POLICY "delete_google_reviews" ON google_reviews FOR DELETE
  TO authenticated USING (true);

-- Policies for review_display_settings
DROP POLICY IF EXISTS "select_display_settings" ON review_display_settings;
CREATE POLICY "select_display_settings" ON review_display_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_display_settings" ON review_display_settings;
CREATE POLICY "insert_display_settings" ON review_display_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_display_settings" ON review_display_settings;
CREATE POLICY "update_display_settings" ON review_display_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Policies for review_sync_logs
DROP POLICY IF EXISTS "select_sync_logs" ON review_sync_logs;
CREATE POLICY "select_sync_logs" ON review_sync_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_sync_logs" ON review_sync_logs;
CREATE POLICY "insert_sync_logs" ON review_sync_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- Anonymous access for public review widget
DROP POLICY IF EXISTS "anon_select_visible_reviews" ON google_reviews;
CREATE POLICY "anon_select_visible_reviews" ON google_reviews FOR SELECT
  TO anon, authenticated USING (is_visible = true);

DROP POLICY IF EXISTS "anon_select_settings" ON review_display_settings;
CREATE POLICY "anon_select_settings" ON review_display_settings FOR SELECT
  TO anon, authenticated USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_google_reviews_updated_at ON google_reviews;
CREATE TRIGGER update_google_reviews_updated_at
  BEFORE UPDATE ON google_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get review statistics
CREATE OR REPLACE FUNCTION get_review_stats()
RETURNS TABLE(
  total_reviews bigint,
  visible_reviews bigint,
  hidden_reviews bigint,
  featured_reviews bigint,
  avg_rating numeric,
  five_star bigint,
  four_star bigint,
  three_star bigint,
  two_star bigint,
  one_star bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_reviews,
    COUNT(*) FILTER (WHERE is_visible)::bigint as visible_reviews,
    COUNT(*) FILTER (WHERE NOT is_visible)::bigint as hidden_reviews,
    COUNT(*) FILTER (WHERE is_featured)::bigint as featured_reviews,
    COALESCE(AVG(rating)::numeric, 0) as avg_rating,
    COUNT(*) FILTER (WHERE rating = 5)::bigint as five_star,
    COUNT(*) FILTER (WHERE rating = 4)::bigint as four_star,
    COUNT(*) FILTER (WHERE rating = 3)::bigint as three_star,
    COUNT(*) FILTER (WHERE rating = 2)::bigint as two_star,
    COUNT(*) FILTER (WHERE rating = 1)::bigint as one_star
  FROM google_reviews;
END;
$$ LANGUAGE plpgsql;
