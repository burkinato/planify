-- ================================================================
-- Planify — Migration: Hibrit Abonelik + Kredi Sistemi (MASTER)
-- ================================================================
-- Bu dosya 015, 016 ve 017 numaralı migration'ların birleştirilmiş halidir.
-- Yeni sistem: $5/ay Abonelik + Proje başı 1 Kredi.
-- ================================================================

-- 1. EĞER YOKSA TEMEL TABLOLARI OLUŞTUR (Geriye dönük uyumluluk)
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL,
    credits integer NOT NULL,
    price_try numeric(10,2) NOT NULL,
    price_usd numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_credits (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    balance integer DEFAULT 0,
    total_purchased integer DEFAULT 0,
    total_spent integer DEFAULT 0,
    has_active_subscription boolean DEFAULT false,
    subscription_started_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL,
    transaction_type varchar(50) NOT NULL,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 2. VERİ TEMİZLİĞİ VE YENİ PAKETLERİN EKLENMESİ
TRUNCATE public.credit_packages CASCADE;
INSERT INTO public.credit_packages (name, credits, price_try, price_usd, sort_order, is_active) VALUES
  ('1 Proje', 1, 225.00, 5.00, 1, true),
  ('3 Proje', 3, 540.00, 12.00, 2, true),
  ('5 Proje', 5, 810.00, 18.00, 3, true),
  ('10 Proje', 10, 1350.00, 30.00, 4, true);

-- 3. ABONELİK PLANLARININ DÜZENLENMESİ
-- Sadece Pro planı kalsın, diğerlerini temizle.
DELETE FROM public.plans WHERE slug NOT IN ('pro-monthly');
UPDATE public.plans 
SET price_usd = 5.00, 
    price_try = 225.00,
    name = 'Planify Pro',
    features = '["1 Proje hakkı", "Filigransız çıktı", "HD Export", "Teknik Destek"]'::jsonb,
    is_active = true
WHERE slug = 'pro-monthly';

-- 4. TETİKLEYİCİLER VE OTOMASYON (Abonelik -> Kredi Senkronizasyonu)
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance, has_active_subscription)
  VALUES (new.id, 0, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_subscription_to_credits()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.user_credits
    SET has_active_subscription = (new.status = 'active'),
        subscription_started_at = CASE WHEN new.status = 'active' THEN new.current_period_start ELSE subscription_started_at END
    WHERE user_id = new.user_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.user_credits SET has_active_subscription = false WHERE user_id = old.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_change ON public.subscriptions;
CREATE TRIGGER on_subscription_change
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_subscription_to_credits();

-- 5. TABLO GÜNCELLEMELERİ VE GÜVENLİK (RLS)
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS has_active_subscription boolean DEFAULT false;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz;

ALTER TABLE public.payment_history ADD COLUMN IF NOT EXISTS payment_type varchar(50) DEFAULT 'credit_package';
ALTER TABLE public.payment_history ADD COLUMN IF NOT EXISTS merchant_oid varchar(255);
ALTER TABLE public.payment_history ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.payment_history ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- RLS Politikaları
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;
CREATE POLICY "Users can insert own credits" ON public.user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;
CREATE POLICY "Users can update own credits" ON public.user_credits FOR UPDATE USING (auth.uid() = user_id);

DROP VIEW IF EXISTS public.user_subscription_status;
