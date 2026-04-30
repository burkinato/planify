-- Planify Migration 012: Payment System Fixes (Samet — P0 Fix)
-- Run this in your Supabase SQL Editor or via Supabase CLI

-- 1. Add merchant_oid column to payment_history (store PayTR's merchant_oid)
ALTER TABLE public.payment_history
  ADD COLUMN IF NOT EXISTS merchant_oid TEXT UNIQUE;

-- 2. Add plan_id column to payment_history (for direct lookup in webhook)
ALTER TABLE public.payment_history
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);

-- 3. Add index for faster lookup by merchant_oid
CREATE INDEX IF NOT EXISTS idx_payment_history_merchant_oid
  ON public.payment_history(merchant_oid);

-- 4. Add index for faster lookup by user_id and status
CREATE INDEX IF NOT EXISTS idx_payment_history_user_status
  ON public.payment_history(user_id, status);

-- 5. Update existing payment_history records to populate plan_id from subscription
-- (This is a one-time fix for existing data)
UPDATE public.payment_history
SET plan_id = s.plan_id
FROM public.subscriptions s
WHERE payment_history.subscription_id = s.id
  AND payment_history.plan_id IS NULL;

-- 6. Add RLS policy for payment_history (users can only see their own)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payment_history'
    AND policyname = 'Users can view own payment history'
  ) THEN
    CREATE POLICY "Users can view own payment history"
    ON public.payment_history FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END
$$;

-- 7. Add RLS policy for inserting payment history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payment_history'
    AND policyname = 'Users can insert own payment history'
  ) THEN
    CREATE POLICY "Users can insert own payment history"
    ON public.payment_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- 8. Add helpful comments
COMMENT ON COLUMN public.payment_history.merchant_oid IS 'PayTR merchant_oid for webhook lookup';
COMMENT ON COLUMN public.payment_history.plan_id IS 'Direct reference to plan (for webhook processing)';
COMMENT ON COLUMN public.payment_history.provider_transaction_id IS 'Provider-specific transaction ID (PayTR merchant_oid)';
