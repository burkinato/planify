-- ================================================================
-- Planify — Migration: Add subscription fields to profiles
-- ================================================================

-- 1. Profiles tablosuna abonelik alanlarını ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- 2. Mevcut kullanıcıları güncelle (isteğe bağlı, zaten default 'free')
UPDATE public.profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;
UPDATE public.profiles SET subscription_status = 'active' WHERE subscription_status IS NULL;

-- 3. handle_new_user fonksiyonunu güncelle (yeni kullanıcılar için varsayılan değerleri garantilemek adına)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone, 
    gender, 
    marketing_consent,
    subscription_tier,
    subscription_status
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(new.raw_user_meta_data->>'last_name', '')
      )
    ),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'gender',
    COALESCE((new.raw_user_meta_data->>'marketing_consent')::boolean, false),
    'free',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    gender = EXCLUDED.gender,
    marketing_consent = EXCLUDED.marketing_consent;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
