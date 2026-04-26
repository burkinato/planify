-- ================================================================
-- Planify — Migration: Add new profile fields
-- Supabase SQL Editor'da çalıştırın
-- ================================================================

-- 1. Profiles tablosuna yeni kolonlar ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- 2. Trigger fonksiyonunu yeni alanları (phone, gender, consent) meta veriden alacak şekilde güncelle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, gender, marketing_consent)
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
    COALESCE((new.raw_user_meta_data->>'marketing_consent')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    gender = EXCLUDED.gender,
    marketing_consent = EXCLUDED.marketing_consent;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
