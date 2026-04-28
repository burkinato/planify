-- Planify Dashboard Portal metadata and export archive.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS facility_name TEXT,
  ADD COLUMN IF NOT EXISTS building_name TEXT,
  ADD COLUMN IF NOT EXISTS audit_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS last_exported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS compliance_score INT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND constraint_name = 'projects_audit_status_check'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_audit_status_check
      CHECK (audit_status IN ('draft', 'missing', 'ready', 'exported'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.project_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_exports_format_check CHECK (format IN ('pdf', 'png', 'jpeg', 'svg'))
);

CREATE INDEX IF NOT EXISTS idx_project_exports_user_created
  ON public.project_exports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_exports_project_created
  ON public.project_exports (project_id, created_at DESC);

ALTER TABLE public.project_exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own project exports" ON public.project_exports;
CREATE POLICY "Users can view own project exports"
  ON public.project_exports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own project exports" ON public.project_exports;
CREATE POLICY "Users can insert own project exports"
  ON public.project_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);
