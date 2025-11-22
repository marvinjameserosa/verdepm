-- Add simplified target tracking columns to project_targets table
-- This migration adds 4 columns for simplified emission and safety targets

ALTER TABLE project_targets 
ADD COLUMN IF NOT EXISTS scope_one DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS scope_two DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS scope_three DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS trir DECIMAL(10, 2);

COMMENT ON COLUMN project_targets.scope_one IS 'Scope 1 emissions target in tCO2e (logistics + equipment usage)';
COMMENT ON COLUMN project_targets.scope_two IS 'Scope 2 emissions target in tCO2e (electricity usage)';
COMMENT ON COLUMN project_targets.scope_three IS 'Scope 3 emissions target in tCO2e (waste + water consumption)';
COMMENT ON COLUMN project_targets.trir IS 'Total Recordable Incident Rate target (incidents per 200,000 hours worked)';
