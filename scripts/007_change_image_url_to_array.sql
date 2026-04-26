-- Change image_url from text to text array to support multiple images
ALTER TABLE articles 
ALTER COLUMN image_url TYPE text[] USING ARRAY[image_url]::text[];

-- Update existing NULL values to empty arrays
UPDATE articles 
SET image_url = ARRAY[]::text[] 
WHERE image_url IS NULL;
