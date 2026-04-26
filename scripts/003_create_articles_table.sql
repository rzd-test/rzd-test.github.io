-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view articles for their role" ON articles;
DROP POLICY IF EXISTS "Management can create articles" ON articles;
DROP POLICY IF EXISTS "Management can update articles" ON articles;
DROP POLICY IF EXISTS "Management can delete articles" ON articles;
DROP POLICY IF EXISTS "Users can view published articles" ON articles;
DROP POLICY IF EXISTS "Management can manage articles" ON articles;

-- Drop existing table to recreate with correct schema
DROP TABLE IF EXISTS articles CASCADE;

-- Create articles table for news and updates
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'news',
  allowed_roles TEXT[] DEFAULT ARRAY['Руководство', 'Заместитель', 'Старший Состав', 'ЦдУД', 'ПТО']
);

-- Create indexes for faster queries
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_published ON articles(is_published);
CREATE INDEX idx_articles_allowed_roles ON articles USING GIN(allowed_roles);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy: All users can view published articles
CREATE POLICY "Users can view published articles"
  ON articles
  FOR SELECT
  USING (is_published = true);

-- Policy: Allow all operations for management (handled by app logic)
CREATE POLICY "Management can manage articles"
  ON articles
  FOR ALL
  USING (true)
  WITH CHECK (true);
