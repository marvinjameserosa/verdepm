-- Add supplier-facing approval workflow fields to sourcing tables
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'preconstruction_material'
  ) THEN
    ALTER TABLE public.preconstruction_material
      ADD COLUMN IF NOT EXISTS submitted_by uuid,
      ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS approved_by uuid,
      ADD COLUMN IF NOT EXISTS approved_at timestamptz;
  END IF;
END $$;

create index if not exists idx_preconstruction_material_approval_status
  on public.preconstruction_material (approval_status);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'preconstruction_esg_target'
  ) THEN
    ALTER TABLE public.preconstruction_esg_target
      ADD COLUMN IF NOT EXISTS submitted_by uuid,
      ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS approved_by uuid,
      ADD COLUMN IF NOT EXISTS approved_at timestamptz;
  END IF;
END $$;

create index if not exists idx_preconstruction_esg_target_approval_status
  on public.preconstruction_esg_target (approval_status);

