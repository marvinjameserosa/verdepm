-- Enable RLS on the material table
ALTER TABLE material ENABLE ROW LEVEL SECURITY;

-- Policy for viewing materials (allow authenticated users to view materials)
-- Ideally this should be scoped to project members, but for now we'll allow authenticated users
CREATE POLICY "Authenticated users can view materials"
ON material FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting materials (allow authenticated users to insert)
CREATE POLICY "Authenticated users can insert materials"
ON material FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Policy for updating materials (allow users to update materials they submitted or if they have permission)
-- For simplicity, allowing the submitter to update
CREATE POLICY "Users can update their own materials"
ON material FOR UPDATE
TO authenticated
USING (auth.uid() = submitted_by);

-- Policy for deleting materials (allow users to delete materials they submitted)
CREATE POLICY "Users can delete their own materials"
ON material FOR DELETE
TO authenticated
USING (auth.uid() = submitted_by);
