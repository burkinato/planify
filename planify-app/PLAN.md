# KOLAYTAHLİYE — Güvenli, Suistimale Kapalı ve Türkiye Odaklı SaaS Planı

> **AI AGENT KESİN TALİMATI (CRITICAL DIRECTIVE):**
> 1. Her görev sonunda `npm run lint && npm run build` ile testi zorunludur.
> 2. Tasarım (UI/UX) "Premium Dark" kalacak ancak "KolayTahliye" olan tüm metinler, logolar ve tınılar "KolayTahliye" olarak güncellenecek.
> 3. Suistimal önleme (Anti-Fraud) mekanizmaları her faza entegre edilecek.

---

## 0. MARKA VE GÜVENLİK STRATEJİSİ (Anti-Fraud & Rebranding)

**Marka:** KolayTahliye (Sloganı: "En Hızlı, En Güvenli Tahliye Planı Çözümü")
**Monetizasyon:** Ücretsiz deneme YOK. Kullanıcı içeriği görebilir ama ilk çizimini kaydetmek/çıktı almak için paket almalıdır.

**🛡️ Suistimal Önleme Protokolleri:**
- **Konaktif Oturum Kontrolü (Single Session):** Bir hesap aynı anda sadece bir IP/Cihaz üzerinden aktif olabilir. İkinci bir giriş olduğunda ilki otomatik sonlandırılır (Zorunlu Logout).
- **IP & User-Agent Takibi:** Şüpheli (çok hızlı yer değiştiren veya VPN) girişler loglanır ve admin paneline "Riskli Kullanıcı" uyarısı düşer.
- **Rate Limiting:** Export (Çıktı alma) ve Kaydetme işlemlerine saniyelik limitler konularak bot saldırıları engellenir.
- **Kredi Suistimali:** Kredi harcama işlemleri Supabase RPC (Server-side) üzerinden yapılarak frontend manipülasyonu imkansız hale getirilir.

---

## 1. AGENT 1: REBRANDING VE LOGO REWORK (Görsel Kimlik)

- [x] **1.1. Metin ve İsim Değişimi:**
  - Tüm kod tabanında (Components, SEO, Metadata, Emails) "KolayTahliye" kelimesini "KolayTahliye" olarak değiştir.
  - _Test:_ Tüm projede `grep` ile "KolayTahliye" araması yap, 0 sonuç kalmalı.
- [x] **1.2. Logo ve Favicon:**
  - Mevcut SVG logoları "KolayTahliye" tınısına uygun (Tahliye rotasını andıran oklar ve ev ikonu birleşimi) modernize et.
  - Renk paletini bozmadan (Surface-950 tabanlı) logoyu güncelle.
- [x] **1.3. Onboarding Kaldırma:**
  - Yeni kullanıcılara kredi veren trigger'ları sil. Bakiye varsayılan 0 başlasın.

---

## 2. AGENT 2: GÜVENLİK VE OTURUM YÖNETİMİ (Anti-Fraud Logic)

- [x] **2.1. Single Session Entegrasyonu:**
  - `useAuthStore.ts` ve Supabase `auth.onAuthStateChange` kullanarak son giriş yapılan cihazın `session_id`'sini `profiles` tablosuna yaz.
  - Eğer mevcut `session_id` veritabanındakiyle eşleşmiyorsa kullanıcıyı logout yap.
  - _Test:_ İki farklı tarayıcıdan aynı hesapla gir, ilk tarayıcının düştüğünü doğrula.
- [x] **2.2. IP Loglama Sistemi:**
  - Kullanıcının her login işleminde IP adresini ve User-Agent bilgisini `login_logs` tablosuna kaydet.
- [x] **2.3. Server-Side Kredi Kontrolü:**
  - Kredi düşme işlemini frontend'den (Zustand) alıp bir Supabase Veritabanı Fonksiyonuna (RPC) taşı.
  - _Test:_ Frontend'den manuel kredi arttırmayı dene, veritabanının bunu reddettiğini gör.

---

## 3. AGENT 3: ADMIN PANELİ (Gelişmiş Denetim)

- [x] **3.1. Güvenlik Dashboard'u:**
  - "Şüpheli Girişler" listesi oluştur (Aynı gün 3'ten fazla farklı IP kullananlar).
  - Kullanıcıyı "Banla" (Ban) butonunu aktif et.
- [x] **3.2. Finansal Takip:**
  - PayTR'den gelen başarılı ödemeleri, TRY bazlı paket satışlarını admin özet ekranında göster.
- [x] **3.3. Manuel Müdahale:**
  - Kullanıcı detay sayfasında; aktif oturumlarını gör, kredilerini yönet.

---

## 4. AGENT 4: FİYATLANDIRMA VE LİİMİTLER (TR Standartları)

- [x] **4.1. TRY Bazlı Paketler:**
  - 10 Kredi: 490 TL | 50 Kredi: 1.990 TL | 100 Kredi: 3.490 TL.
  - PRO Üyelik (Aylık): 990 TL.
  - _Test:_ `UpgradePage.tsx` içerisinde fiyatların ve paket içeriklerinin doğruluğunu kontrol et.
- [x] **4.2. Sınırsız Paket Koruması:**
  - PRO (Sınırsız) üyeler için günlük/aylık "Makul Kullanım Limiti" (Fair Usage Policy) belirle (Örn: Günlük max 50 export).
  - Bu limit aşılırsa admin onayına düşür.

---

## 5. AGENT 5: EDİTÖR VE DENETİM (ISO Standartları)

- [x] **5.1. Sync Indicator:** Header'da "Kaydedildi" durumunu göster.
- [x] **5.2. Live Compliance:** Sağ panelde ISO uyumluluk checklist'i (Buradasınız işareti, Rota kontrolü).
- [x] **5.3. Layer UI:** Katman yönetimi panelini sol sidebar'a ekle.

---
> **İş Akışı Talimatı:** Her adımda ilgili Agent'ı çağır (invoke_agent) ve iş sonunda rapor iste. İlk adım: **1.1. Metin ve İsim Değişimi.**
