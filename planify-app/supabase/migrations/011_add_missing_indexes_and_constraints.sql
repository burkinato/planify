-- Planify Migration 011: Add missing indexes and constraints (Bora P1 fixes)
-- Run this in your Supabase SQL Editor or via Supabase CLI

-- 1. Add missing indexes for performance (Bora P1)
CREATE INDEX IF NOT EXISTS idx_projects_template_layout_id ON public.projects(template_layout_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON public.exchange_rates(from_currency, to_currency);

-- 2. Add unique constraint on exchange_rates (Bora P1)
-- This prevents duplicate exchange rate entries for the same currency pair
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_exchange_rate_pair'
  ) THEN
    ALTER TABLE public.exchange_rates
    ADD CONSTRAINT unique_exchange_rate_pair
    UNIQUE (from_currency, to_currency);
  END IF;
END
$$;

-- 3. Add constraint for one active subscription per user (Bora P1)
-- This requires a partial unique index for active subscriptions
DROP INDEX IF EXISTS idx_unique_active_subscription;
CREATE UNIQUE INDEX idx_unique_active_subscription
ON public.subscriptions(user_id)
WHERE status = 'active';

-- 4. Add missing RLS policy for storage.objects if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-thumbnails', 'project-thumbnails', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can only access their own project thumbnails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Users can view own project thumbnails'
  ) THEN
    CREATE POLICY "Users can view own project thumbnails"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'project-thumbnails'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END
$$;

-- 5. Add RLS policy for template-region-assets (Deva security check)
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-region-assets', 'template-region-assets', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Templates are publicly readable'
  ) THEN
    CREATE POLICY "Templates are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'template-region-assets');
  END IF;
END
$$;

-- 6. Add helpful comments
COMMENT ON INDEX idx_projects_template_layout_id IS 'Performance: Filter projects by template layout';
COMMENT ON INDEX idx_subscriptions_plan_id IS 'Performance: Filter subscriptions by plan';
COMMENT ON INDEX idx_unique_active_subscription IS 'Constraint: One active subscription per user';
COMMENT ON CONSTRAINT unique_exchange_rate_pair ON exchange_rates IS 'Constraint: Unique currency pair';
