-- KolayTahliye — Migration 017: Admin CRM Genişletme

-- 1. Profiles tablosuna yasaklama alanı ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. RLS Politikası Güncelleme (Yasaklı kullanıcıların işlem yapmasını engellemek için)
-- Bu ileride auth middleware seviyesinde de kontrol edilmeli.

-- 3. Finans Tablosuna Yeni İşlem Türleri
-- (Örneğin manuel kredi eklemeleri loglamak için admin_finance'ı kullanabiliriz veya yeni bir tablo açabiliriz)
-- Şimdilik login_logs yeterli.

-- 4. Kredi Paketleri Fiyat Güncelleme (Plan gereği TRY bazlı)
-- Not: Bu veri migration 015'te zaten vardı ama isimleri 'KolayTahliye' olarak güncelleyelim.
UPDATE public.credit_packages 
SET price_try = CASE 
    WHEN credits = 10 THEN 490.00
    WHEN credits = 50 THEN 1990.00
    WHEN credits = 100 THEN 3490.00
    ELSE price_try
END,
name = CASE 
    WHEN credits = 10 THEN 'Başlangıç Paketi'
    WHEN credits = 50 THEN 'Profesyonel Paket'
    WHEN credits = 100 THEN 'Kurumsal Paket'
    ELSE name
END
WHERE is_active = true;

-- 5. Pro Plan Fiyat Güncelleme
UPDATE public.plans 
SET price_try = 990.00,
    name = 'KolayTahliye Pro (Aylık)'
WHERE slug = 'pro-monthly';
