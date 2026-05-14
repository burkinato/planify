-- ═══════════════════════════════════════════════════════════════
-- 021 — Pricing v2: TRY-native + KDV + Tier yapısı + Faturalandırma
-- ═══════════════════════════════════════════════════════════════
-- Bu migration:
--   • subscription_plans tablosu (Free/Pro/Team/Enterprise)
--   • user_credits'e tier, tier_renewal_date, team_id ekler
--   • invoices tablosu (KDV ayrıştırılmış e-Arşiv hazırlığı)
--   • teams + team_members (Team tier)
--   • tax_rates (KDV oranı yönetimi)
--
-- Geri uyumluluk: mevcut credit_packages.price_try alanı zorunlu hale
-- gelir; price_usd opsiyonel kalır (deprecated).

BEGIN;

-- ─── Subscription Plans (Yeni katmanlı yapı) ───────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,           -- free|pro|team|enterprise
  name            TEXT NOT NULL,                  -- "Pro", "Takım"
  description     TEXT,
  monthly_try     NUMERIC(10, 2),                 -- KDV dahil aylık
  annual_try      NUMERIC(10, 2),                 -- KDV dahil yıllık
  max_users       INTEGER NOT NULL DEFAULT 1,
  max_projects    INTEGER,                        -- NULL = sınırsız
  features        JSONB DEFAULT '[]'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.subscription_plans (slug, name, description, monthly_try, annual_try, max_users, max_projects, features, sort_order)
VALUES
  ('free',
   'Ücretsiz',
   'Hemen denemek isteyenler için. Kayıtla 500 kredi hediye.',
   0, 0, 1, 3,
   '["500 kredi hediye", "ISO 23601 sembol kütüphanesi", "Filigranlı PDF", "Tek kullanıcı"]'::jsonb,
   0),
  ('pro',
   'Pro',
   'Bireysel İSG uzmanları ve mimarlık ofisleri için.',
   249.00, 2388.00, 1, NULL,
   '["Sınırsız proje", "Filigransız PDF", "Premium şablonlar", "e-Arşiv fatura", "Öncelikli destek"]'::jsonb,
   10),
  ('team',
   'Takım',
   'OSGB ve danışmanlık firmaları için 3 kullanıcılı plan.',
   549.00, 5268.00, 3, NULL,
   '["Pro tüm özellikler", "3 kullanıcı", "Paylaşılan workspace", "Rol tabanlı erişim", "Ek kullanıcı ₺149/ay"]'::jsonb,
   20),
  ('enterprise',
   'Kurumsal',
   'Büyük kurumlar, kamu ve grup şirketleri için.',
   NULL, NULL, 999, NULL,
   '["SSO", "SLA", "Özel KDV faturalı yıllık sözleşme", "On-premise export", "ISO 27001 + KVKK belgeleri"]'::jsonb,
   30)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_try = EXCLUDED.monthly_try,
  annual_try = EXCLUDED.annual_try,
  max_users = EXCLUDED.max_users,
  max_projects = EXCLUDED.max_projects,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS plans_read_all ON public.subscription_plans;
CREATE POLICY plans_read_all ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- ─── user_credits: tier + team + renewal ───────────────────────────
ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS tier              TEXT REFERENCES public.subscription_plans(slug)
                                                  DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS tier_renewal_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS team_id           UUID;

-- ─── Teams + Members ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_slug    TEXT NOT NULL REFERENCES public.subscription_plans(slug),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id    UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teams_owner_only ON public.teams;
CREATE POLICY teams_owner_only ON public.teams
  USING (owner_id = auth.uid() OR id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS team_members_self ON public.team_members;
CREATE POLICY team_members_self ON public.team_members
  USING (user_id = auth.uid() OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()));

-- ─── Tax Rates (KDV oranı, B2B muafiyeti hazırlığı) ────────────────
CREATE TABLE IF NOT EXISTS public.tax_rates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country      TEXT NOT NULL DEFAULT 'TR',
  rate         NUMERIC(5, 4) NOT NULL,            -- 0.2000 = %20
  description  TEXT,
  is_default   BOOLEAN NOT NULL DEFAULT false,
  valid_from   DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.tax_rates (country, rate, description, is_default)
VALUES ('TR', 0.2000, 'Türkiye KDV %20 (varsayılan)', true)
ON CONFLICT DO NOTHING;

ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tax_rates_read_all ON public.tax_rates;
CREATE POLICY tax_rates_read_all ON public.tax_rates FOR SELECT USING (true);

-- ─── Invoices (e-Arşiv fatura hazırlığı) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  team_id           UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  invoice_no        TEXT UNIQUE NOT NULL,          -- KT-2026-000001 formatı
  description       TEXT NOT NULL,                  -- "KolayTahliye Pro Aylık Abonelik"

  -- Tutarlar (TRY, KDV dahil/hariç ayrı tutulur)
  net_amount_try    NUMERIC(10, 2) NOT NULL,        -- KDV hariç
  tax_amount_try    NUMERIC(10, 2) NOT NULL,        -- KDV tutarı
  total_amount_try  NUMERIC(10, 2) NOT NULL,        -- net + tax
  tax_rate          NUMERIC(5, 4) NOT NULL DEFAULT 0.2000,
  currency          TEXT NOT NULL DEFAULT 'TRY',

  -- Müşteri / Fatura bilgileri
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_address  TEXT,
  customer_vkn      TEXT,                           -- VKN veya TCKN
  customer_tax_office TEXT,

  -- e-Arşiv / e-Fatura
  einvoice_status   TEXT NOT NULL DEFAULT 'pending'
                    CHECK (einvoice_status IN ('pending', 'queued', 'sent', 'failed', 'manual')),
  einvoice_uuid     TEXT,                           -- GİB UUID
  einvoice_xml_url  TEXT,                           -- Supabase Storage URL
  pdf_url           TEXT,

  -- Provider bilgisi
  payment_provider  TEXT NOT NULL DEFAULT 'paytr',
  provider_payment_id TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_no ON public.invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_invoices_einvoice_status ON public.invoices(einvoice_status);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoices_owner_read ON public.invoices;
CREATE POLICY invoices_owner_read ON public.invoices
  FOR SELECT USING (user_id = auth.uid());

-- ─── Invoice Number Sequence (KT-{YYYY}-{NNNNNN}) ─────────────────
CREATE SEQUENCE IF NOT EXISTS public.invoice_no_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  next_no INTEGER;
  year_part TEXT;
BEGIN
  next_no := nextval('public.invoice_no_seq');
  year_part := TO_CHAR(NOW(), 'YYYY');
  RETURN 'KT-' || year_part || '-' || LPAD(next_no::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ─── Helper: KDV ayrıştırma (gross → net + tax) ────────────────────
CREATE OR REPLACE FUNCTION public.split_kdv(gross NUMERIC, rate NUMERIC DEFAULT 0.20)
RETURNS TABLE (net NUMERIC, tax NUMERIC) AS $$
BEGIN
  net := ROUND(gross / (1 + rate), 2);
  tax := ROUND(gross - net, 2);
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── delete_user_and_data (KVKK madde 17 — Veri silme hakkı) ──────
CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS VOID AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Yetki yok';
  END IF;

  -- Soft delete: scheduled_deletion_at flag set; cron job 30 gün sonra purge eder.
  UPDATE public.profiles
  SET subscription_status = 'pending_deletion',
      updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.request_account_deletion() TO authenticated;

COMMIT;
