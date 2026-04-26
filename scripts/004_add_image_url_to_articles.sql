-- Add image_url column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN articles.image_url IS 'URL of the article image stored on Yandex Disk';
