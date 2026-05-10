-- Kredi Sistemi Tabloları ve RLS Politikaları

-- 1. Kredi Paketleri
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

-- Kredi paketlerini doldur
INSERT INTO public.credit_packages (name, credits, price_try, price_usd, sort_order) VALUES
('100 Kredi', 100, 149.00, 4.99, 1),
('300 Kredi', 300, 349.00, 11.99, 2),
('1000 Kredi', 1000, 899.00, 29.99, 3)
ON CONFLICT DO NOTHING;

-- 2. Kullanıcı Kredi Bakiyesi
CREATE TABLE IF NOT EXISTS public.user_credits (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    balance integer DEFAULT 50, -- 50 başlangıç kredisi
    total_purchased integer DEFAULT 0,
    total_spent integer DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

-- 3. Kredi İşlem Geçmişi
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL, -- pozitif: ekleme, negatif: harcama
    transaction_type varchar(50) NOT NULL, -- 'signup_bonus', 'purchase', 'export_pdf', 'export_png', 'premium_template'
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(transaction_type);

-- RLS Aktifleştirme
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları: credit_packages
-- Herkes görebilir
CREATE POLICY "Kredi paketlerini herkes görebilir" 
    ON public.credit_packages FOR SELECT 
    USING (is_active = true);

-- Sadece adminler değiştirebilir
CREATE POLICY "Kredi paketlerini sadece adminler yönetebilir" 
    ON public.credit_packages FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Politikaları: user_credits
-- Kullanıcı sadece kendi bakiyesini görebilir
CREATE POLICY "Kullanıcılar kendi bakiyelerini görebilir" 
    ON public.user_credits FOR SELECT 
    USING (user_id = auth.uid());

-- RLS Politikaları: credit_transactions
-- Kullanıcı sadece kendi işlemlerini görebilir
CREATE POLICY "Kullanıcılar kendi işlemlerini görebilir" 
    ON public.credit_transactions FOR SELECT 
    USING (user_id = auth.uid());

-- Kullanıcıların işlem eklemesi engellenir (sadece function veya service key ile eklenmeli)
-- Ancak şu anki frontend mimarisinde harcamayı istemciden yapacaksak, 
-- geçici olarak eklemeye izin vereceğiz (negatif harcamalar için).
CREATE POLICY "Kullanıcılar işlem kaydı oluşturabilir" 
    ON public.credit_transactions FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Kullanıcı yeni kayıt olduğunda otomatik user_credits oluşturacak trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (new.id, 50);
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (new.id, 50, 'signup_bonus', 'Kayıt bonusu (50 Kredi)');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profil oluşturulurken tetiklenecek
-- (profiles tablosuna yeni kayıt eklendiğinde çalışır)
DROP TRIGGER IF EXISTS on_profile_created_credits ON public.profiles;
CREATE TRIGGER on_profile_created_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Mevcut kullanıcılara kredi ekleme (eğer yoksa)
INSERT INTO public.user_credits (user_id, balance)
SELECT id, 50 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
