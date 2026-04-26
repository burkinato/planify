-- ================================================================
-- Planify — Migration: Professional Subscription System
-- ================================================================

-- 1. Plans tablosu (Fiyat ve plan detayları)
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  price_try NUMERIC(10,2),
  billing_interval TEXT NOT NULL DEFAULT 'month',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subscriptions tablosu (Kullanıcı abonelikleri)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'inactive',
  payment_provider TEXT DEFAULT 'paytr',
  provider_subscription_id TEXT,
  provider_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'expired', 'inactive'))
);

-- 3. Payment history (Ödeme geçmişi & audit trail)
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_usd NUMERIC(10,2),
  amount_try NUMERIC(10,2),
  currency TEXT DEFAULT 'TRY',
  status TEXT NOT NULL DEFAULT 'pending',
  provider_transaction_id TEXT,
  provider_response JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_payment_status CHECK (status IN ('success', 'failed', 'refunded', 'pending'))
);

-- 4. Exchange rates (cached)
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL DEFAULT 'USD',
  to_currency TEXT NOT NULL DEFAULT 'TRY',
  rate NUMERIC(10,4) NOT NULL,
  source TEXT DEFAULT 'manual',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON public.exchange_rates(from_currency, to_currency);

-- 6. Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Plans: herkes okuyabilir
CREATE POLICY "Plans are viewable by everyone"
  ON public.plans FOR SELECT USING (true);

-- Subscriptions: kendi verisini görebilir
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Payment history: kendi verisini görebilir
CREATE POLICY "Users can view own payments"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Exchange rates: herkes okuyabilir
CREATE POLICY "Exchange rates are public"
  ON public.exchange_rates FOR SELECT USING (true);

-- 8. Seed: Pro Monthly plan
INSERT INTO public.plans (name, slug, price_usd, price_try, billing_interval, sort_order, features)
VALUES (
  'Pro Aylık',
  'pro-monthly',
  10.00,
  450.00,
  'month',
  1,
  '["Filigransız profesyonel çıktı","Yüksek çözünürlüklü PDF (A3 & A4)","Sınırsız export indirme","Öncelikli teknik destek","Tüm şablon ve layout erişimi"]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 8b. Seed: Pro Yearly plan (2 ay hediye — 10 aylık fiyat)
INSERT INTO public.plans (name, slug, price_usd, price_try, billing_interval, sort_order, features)
VALUES (
  'Pro Yıllık',
  'pro-yearly',
  100.00,
  4500.00,
  'year',
  2,
  '["Filigransız profesyonel çıktı","Yüksek çözünürlüklü PDF (A3 & A4)","Sınırsız export indirme","Öncelikli teknik destek","Tüm şablon ve layout erişimi","2 ay hediye — yıllık avantaj"]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 9. Seed: Initial exchange rate (open.er-api.com — 25 Nisan 2026)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, source)
VALUES ('USD', 'TRY', 45.02, 'open.er-api.com');

-- 10. Convenience view: user subscription status
CREATE OR REPLACE VIEW public.user_subscription_status AS
SELECT
  p.id AS user_id,
  COALESCE(s.status, 'inactive') AS subscription_status,
  CASE
    WHEN s.status = 'active' THEN true
    WHEN s.status = 'trialing' AND s.trial_end > NOW() THEN true
    WHEN s.status = 'canceled' AND s.current_period_end > NOW() THEN true
    ELSE false
  END AS has_pro_access,
  s.current_period_end,
  s.cancel_at_period_end,
  s.canceled_at,
  s.trial_end,
  pl.name AS plan_name,
  pl.slug AS plan_slug,
  pl.price_usd,
  pl.price_try
FROM public.profiles p
LEFT JOIN public.subscriptions s
  ON s.user_id = p.id
  AND s.status IN ('active', 'trialing', 'canceled')
LEFT JOIN public.plans pl ON pl.id = s.plan_id;
