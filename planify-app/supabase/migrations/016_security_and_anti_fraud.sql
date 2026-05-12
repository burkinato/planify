-- KolayTahliye — Migration 016: Güvenlik ve Anti-Fraud Katmanı

-- 1. Profiles tablosuna oturum kontrolü için alan ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_session_id TEXT;

-- 2. Giriş Logları Tablosu
CREATE TABLE IF NOT EXISTS public.login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_suspicious BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kredi Harcama RPC Fonksiyonu (Server-side)
-- Bu fonksiyon krediyi frontend'den bağımsız olarak güvenli şekilde düşer.
CREATE OR REPLACE FUNCTION public.deduct_credits_secure(p_amount INTEGER, p_type TEXT, p_description TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    -- Bakiyeyi al ve kilitle (FOR UPDATE)
    SELECT balance INTO v_balance FROM public.user_credits WHERE user_id = auth.uid() FOR UPDATE;
    
    IF v_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Kredi İşlem Geçmişi Ekle
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (auth.uid(), -p_amount, p_type, p_description);
    
    -- Bakiyeyi Güncelle
    UPDATE public.user_credits 
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE user_id = auth.uid();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS ve Güvenlik
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar kendi login loglarını görebilir" ON public.login_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Kullanıcılar kendi login loglarını ekleyebilir" ON public.login_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs(created_at);
