-- Add author_name and author_id columns to articles table
-- These columns track who created each article

-- Add author_name column (required field)
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'Неизвестный';

-- Add author_id column (optional field for linking to users table)
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS author_id TEXT;

-- Create an index on author_id for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);

-- Update the default for author_name to remove it after adding the column
-- This allows new articles to require author_name without a default
ALTER TABLE articles
ALTER COLUMN author_name DROP DEFAULT;
