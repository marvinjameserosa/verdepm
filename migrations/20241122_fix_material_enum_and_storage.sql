-- Add 'Not Delivered' to the vetting_status enum
ALTER TYPE vetting_status ADD VALUE IF NOT EXISTS 'Not Delivered';

-- Ensure the materials bucket exists (this is usually done via UI/API but good to have in SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects if not already enabled (it usually is)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload to the materials bucket
CREATE POLICY "Authenticated users can upload materials files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials');

-- Policy to allow public access to read materials files (since we made the bucket public)
CREATE POLICY "Public can view materials files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'materials');

-- Policy to allow users to update/delete their own files
CREATE POLICY "Users can update their own materials files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'materials' AND owner = auth.uid());

CREATE POLICY "Users can delete their own materials files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'materials' AND owner = auth.uid());
