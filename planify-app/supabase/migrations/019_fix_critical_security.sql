-- ================================================================
-- KolayTahliye — Migration 019: Fix Critical Security Flaws
-- ================================================================

-- 1. Fix Privilege Escalation in Profiles
-- Prevent users from changing their own role, subscription_tier, or expiry.
CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- The service_role (backend/webhooks) can bypass this when it runs outside of standard user auth context,
  -- but typically service_role doesn't have an auth.jwt(). We can check if auth.uid() is null (meaning server).
  IF auth.uid() IS NULL THEN
    RETURN new;
  END IF;

  -- Enforce read-only for sensitive fields for normal users
  IF old.role IS DISTINCT FROM new.role THEN
    new.role = old.role;
  END IF;
  
  IF old.subscription_tier IS DISTINCT FROM new.subscription_tier THEN
    new.subscription_tier = old.subscription_tier;
  END IF;
  
  IF old.subscription_expires_at IS DISTINCT FROM new.subscription_expires_at THEN
    new.subscription_expires_at = old.subscription_expires_at;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_profile_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_escalation();

-- 2. Fix Credit Manipulation in user_credits
-- Revoke INSERT and UPDATE policies from standard users so they cannot manipulate their balance.
DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;

-- 3. Create Atomic RPC for Credit Updates (Prevents Race Conditions)
-- Safely increments user credits. Used by webhooks.
CREATE OR REPLACE FUNCTION public.increment_user_credits(p_user_id uuid, p_amount integer)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance, total_purchased, updated_at)
  VALUES (p_user_id, p_amount, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = public.user_credits.balance + p_amount,
      total_purchased = public.user_credits.total_purchased + p_amount,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Webhook Idempotency Table (For reliable serverless idempotency)
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  id varchar(255) PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Policy to restrict access to idempotency table to service role only
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;
