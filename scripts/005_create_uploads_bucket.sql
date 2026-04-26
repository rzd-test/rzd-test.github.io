-- Create the uploads bucket for storing article images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  4194304, -- 4MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files from the uploads bucket (public access)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Allow authenticated users to upload files to the uploads bucket
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads');
