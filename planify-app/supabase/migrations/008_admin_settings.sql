-- ================================================================
-- Planify — Migration: Admin Settings & Pricing
-- ================================================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only access (using our existing is_admin() function)
CREATE POLICY "Admins can manage settings"
ON public.admin_settings
FOR ALL
USING (public.is_admin());

-- Public can read specific settings (like pricing)
-- We'll allow public to read all for now, but we can restrict keys later.
CREATE POLICY "Public can view settings"
ON public.admin_settings
FOR SELECT
TO public
USING (true);

-- 1. Seed initial pricing settings
INSERT INTO public.admin_settings (key, value)
VALUES 
    ('pricing_config', '{
        "pro_price_usd": 10.00,
        "usd_to_try_rate": 32.50,
        "display_currency": "TRY",
        "show_both_currencies": true
    }'::jsonb)
ON CONFLICT (key) DO NOTHING;
