-- KolayTahliye — Migration 020: Mikro-Kredi Sistemine Geçiş
-- Bu migration ile 1 Kredi = 1 Proje mantığından İşlem Bazlı Mikro Kredi mantığına geçiş yapılır.
-- Mevcut bakiyeler, paketler ve işlem geçmişleri x10 yapılarak ölçeklenir.

-- 1. Kullanıcı Bakiyelerini Güncelle (x10)
UPDATE public.user_credits SET balance = balance * 10;
UPDATE public.user_credits SET total_purchased = total_purchased * 10;
UPDATE public.user_credits SET total_spent = total_spent * 10;

-- 2. Kredi Paketlerini Güncelle (x10)
UPDATE public.credit_packages SET credits = credits * 10;
UPDATE public.credit_packages SET name = REPLACE(name, '100 Kredi', '1000 Kredi') WHERE name LIKE '%100 Kredi%';
UPDATE public.credit_packages SET name = REPLACE(name, '300 Kredi', '3000 Kredi') WHERE name LIKE '%300 Kredi%';
UPDATE public.credit_packages SET name = REPLACE(name, '1000 Kredi', '10000 Kredi') WHERE name LIKE '%1000 Kredi%';

-- (Eğer ekstra yeni bir paket eklenecekse buraya INSERT edilebilir)

-- 3. Geçmiş İşlemleri Güncelle (x10)
UPDATE public.credit_transactions SET amount = amount * 10;

-- 4. Yeni Kayıt Kredi Bonusu Trigger'ını Güncelle (50 yerine 500 kredi)
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (new.id, 500);
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (new.id, 500, 'signup_bonus', 'Kayıt bonusu (500 Kredi)');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
