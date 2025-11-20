-- Migration: Add document columns to organizations table
-- Date: 2025-11-20
-- Description: Adds columns to store document file paths and URLs for compliance documents

-- Add SEC/DTI Certificate columns
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS sec_dti_storage_path TEXT,
ADD COLUMN IF NOT EXISTS sec_dti_file_url TEXT,
ADD COLUMN IF NOT EXISTS sec_dti_uploaded_at TIMESTAMPTZ;

-- Add Mayor's Permit columns
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS mayors_permit_storage_path TEXT,
ADD COLUMN IF NOT EXISTS mayors_permit_file_url TEXT,
ADD COLUMN IF NOT EXISTS mayors_permit_uploaded_at TIMESTAMPTZ;

-- Add BIR Certificate columns
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS bir_storage_path TEXT,
ADD COLUMN IF NOT EXISTS bir_file_url TEXT,
ADD COLUMN IF NOT EXISTS bir_uploaded_at TIMESTAMPTZ;

-- Add Organization Details columns
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS primary_region TEXT;

-- Add comments for documentation
COMMENT ON COLUMN organizations.sec_dti_storage_path IS 'Storage path for SEC/DTI Certificate document';
COMMENT ON COLUMN organizations.mayors_permit_storage_path IS 'Storage path for Mayors Permit document';
COMMENT ON COLUMN organizations.bir_storage_path IS 'Storage path for BIR Certificate document';
COMMENT ON COLUMN organizations.registration_number IS 'SEC or DTI registration number';
COMMENT ON COLUMN organizations.contact_email IS 'Primary organizational contact email';
COMMENT ON COLUMN organizations.primary_region IS 'Primary region of operation';
