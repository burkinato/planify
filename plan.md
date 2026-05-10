# PLANIFY — Kapsamlı Araştırma, Değerlendirme ve Geliştirme Planı
> Tarih: 2026-05-10 | Versiyon: 1.0 | Durum: ARAŞTIRMA & PLANLAMA

---

## 1. PROJE DEĞERLENDİRMESİ (MEVCUT DURUM)

### 1.1 Teknik Altyapı
| Bileşen | Teknoloji | Durum |
|---------|-----------|-------|
| Framework | Next.js 16.2.4 (Turbopack) | ✅ Güncel |
| UI | React 19.2.4 + TailwindCSS 4 | ✅ Güncel |
| Canvas | Konva + react-konva | ✅ Çalışıyor |
| State | Zustand 5 + subscribeWithSelector | ✅ Sağlam |
| Auth/DB | Supabase (Auth + Postgres + RLS) | ✅ Aktif |
| Export | jsPDF + html-to-image + html2canvas | ⚠️ İyileştirme gerekli |
| Ödeme | PayTR entegrasyonu (lib/paytr.ts) | ⚠️ Tamamlanmamış |
| Hosting | Supabase cloud (TR sunucu) | ✅ |

### 1.2 Tespit Edilen Sorunlar

#### 🔴 Kritik
- [ ] **Abonelik sistemi yarım**: `useSubscriptionStore` ve `plans` tablosu var ama ödeme akışı tamamlanmamış
- [ ] **Filigran sistemi eksik**: Export'ta `isPro` kontrolü var ama filigran ekleme kodu yok
- [ ] **Kredi sistemi yok**: Kullanıcı abonelik yerine kredi ile çalışacak — tüm monetizasyon mimarisi değişecek
- [ ] **EditorCanvas 148KB**: Tek dosyada ~4000+ satır — bakım, debug ve performans açısından kritik risk
- [ ] **localStorage bağımlılığı**: Proje verileri localStorage'da — tarayıcı temizliğinde kayıp riski

#### 🟡 Önemli
- [ ] Landing page "Sektör Liderleri" bölümü sahte veriler içeriyor (MetroİSTANBUL, Acıbadem vs.)
- [ ] "Demoyu İzle" butonu hiçbir yere yönlendirmiyor
- [ ] Footer linkleri tümü `#` — Kullanım Koşulları, KVKK, Gizlilik sayfaları yok
- [ ] Testimonials bölümü gerçek kullanıcı yorumu değil
- [ ] Blog bölümü içeriksiz placeholder
- [ ] Pricing sayfası hâlâ "abonelik" diliyle yazılı
- [ ] Modül paneli Türkçe karakter eksik (Baslik, Cizim, Lejand vs. — ö,ü,ç,ş,ğ,ı yok)
- [ ] SVG export "yakında" mesajıyla devre dışı

#### 🟢 İyi Yönler
- [x] ISO 7010 sembol kütüphanesi kapsamlı (60+ sembol, 8 kategori)
- [x] Modül sistemi iyi tasarlanmış (14 modül tipi, drag/drop, resize)
- [x] 8 farklı şablon ailesi (Landscape + Portrait = 16 varyant)
- [x] ComplianceChecker 21 denetim maddesi kontrol ediyor
- [x] Undo/Redo, katman sistemi, tema desteği çalışıyor
- [x] Responsive mobile drawer sistemi var

---

## 2. ULUSLARARASI ARAŞTIRMA — ACİL DURUM TAHLİYE PLANLARI

### 2.1 Standartlar ve Mevzuat

| Standart | Kapsam | Planify Uyumu |
|----------|--------|---------------|
| **ISO 23601:2020** | Kaçış ve tahliye planı tasarım ilkeleri | ✅ Uyumlu (semboller, rota, "buradasınız") |
| **ISO 7010:2019** | Güvenlik işaretleri — renk/şekil standardı | ✅ 60+ sembol mevcut |
| **ISO 3864** | Güvenlik renkleri ve tasarım | ⚠️ Kısmi — renk kodları doğru ama grafik stilizasyon eksik |
| **ISO 16069** | Fotolüminesan güvenlik yol gösterme sistemi | ❌ Henüz yok |
| **OSHA 29 CFR 1910.38** | ABD — Acil Eylem Planı minimum gereksinimleri | ✅ Uyumlu |
| **ASR A2.3 / DIN** | Almanya — Kaçış yolları ve kurtarma planları | ⚠️ Kısmi |
| **UK Regulatory Reform Order 2005** | İngiltere — Yangın risk değerlendirmesi | ⚠️ Kısmi |
| **TR 6331 sayılı İSG Kanunu** | İşverenin acil durum planı hazırlama yükümlülüğü | ✅ |
| **TR İşyerlerinde Acil Durumlar Yönetmeliği** | Tahliye planı, tatbikat, ekipman zorunlulukları | ✅ |
| **TR Binaların Yangından Korunması Yönetmeliği** | Yapı tasarımı ve yangın güvenliği | ⚠️ Kısmi |

### 2.2 Uluslararası Rakip Analizi

| Rakip | Model | Fiyat | Güçlü Yön | Zayıf Yön |
|-------|-------|-------|-----------|-----------|
| **SmartDraw** | Abonelik (Web) | ~$10-15/ay | Akıllı formatlama, otomatik hizalama | Tahliye planına özel değil |
| **EdrawMax** | Abo + Perpetual | ~$10/ay veya $245 tek seferlik | Dev şablon/sembol kütüphanesi | Genel amaçlı, ISO uyumu manuel |
| **RoomSketcher** | Freemium + Kredi | Ücretsiz + $49-99/proje | Görsel kalite, 3D görünüm | Tahliye planına özel değil |
| **ConceptDraw** | Perpetual | ~$199 | Teknik çizim kalitesi | Öğrenme eğrisi yüksek |
| **Lucidchart** | Abonelik | $7.95-15/ay | İşbirliği, bulut | Tahliye özel şablon az |
| **OSHA Map** | Ücretsiz | Ücretsiz | OSHA uyumlu | Çok basit, profesyonel değil |

### 2.3 Renk Kodları Standardı (ISO 7010 Zorunlu)

| Kategori | Renk | HEX | Kullanım |
|----------|------|-----|----------|
| **Güvenli Durum (E)** | Yeşil/Beyaz | `#008F4C` | Acil çıkış, ilk yardım, toplanma |
| **Yangın Koruma (F)** | Kırmızı/Beyaz | `#E81123` | Söndürücü, hortum, alarm |
| **Yasak (P)** | Kırmızı/Beyaz + Çizgi | `#E81123` | Sigara yasak, asansör kullanma |
| **Zorunluluk (M)** | Mavi/Beyaz | `#0066CC` | Koruyucu ekipman zorunlu |
| **Uyarı (W)** | Sarı/Siyah | `#FFD700` | Tehlike, kimyasal, elektrik |

### 2.4 Yurt Dışı En İyi Uygulamalar

1. **"Design Backwards"** — Toplanma alanından geriye doğru plan tasarla
2. **Yön oryantasyonu** — Plan, izleyicinin baktığı yöne göre döndürülmeli
3. **Sadeleştirme** — Mobilya/dekorasyon detayı ekleme, sadece sabit yapısal unsurlar
4. **PEEP (Personal Emergency Evacuation Plan)** — Engelli bireyler için kişisel tahliye planı
5. **Çoklu dil desteği** — Uluslararası sembollerin yanında İngilizce/Türkçe ikili metin
6. **Yıllık tatbikat kaydı** — Planda son tatbikat tarihi ve sonucu
7. **QR ile dijital doğrulama** — Güncelliği teyit eden QR bağlantısı

---

## 3. KREDİ SİSTEMİ MİMARİSİ (ABONELİK YERİNE)

### 3.1 Hibrit Model Önerisi

```
┌─────────────────────────────────────────────┐
│           PLANIFY KREDİ SİSTEMİ             │
├─────────────────────────────────────────────┤
│                                             │
│  ÜCRETSİZ KATMAN (Kayıt ile)               │
│  • 50 başlangıç kredisi                     │
│  • Temel CAD araçları                       │
│  • 3 proje limiti                           │
│  • Filigran'lı PDF export                   │
│  • Temel sembol kütüphanesi                 │
│                                             │
│  KREDİ PAKETLERİ                            │
│  • 100 Kredi  →  ₺149                       │
│  • 300 Kredi  →  ₺349 (en popüler)         │
│  • 1000 Kredi →  ₺899 (kurumsal)           │
│                                             │
│  KREDİ HARCAMA                              │
│  • PDF Export (filigransız)  → 5 kredi      │
│  • PNG Export (HD)           → 3 kredi      │
│  • Premium şablon kullanımı  → 10 kredi     │
│  • AI özellikler (gelecek)   → 15 kredi     │
│  • Toplu export (5+ plan)    → 20 kredi     │
│                                             │
│  KURUMSAL PAKET (Aylık)                     │
│  • Sınırsız kredi            → ₺499/ay     │
│  • 5+ kullanıcı              → ₺399/kişi   │
│  • Özel antet/logo           → Dahil        │
│  • Öncelikli destek          → Dahil        │
│                                             │
└─────────────────────────────────────────────┘
```

### 3.2 Teknik Gereksinimler

- [ ] `credits` tablosu: `user_id`, `balance`, `total_purchased`, `total_spent`
- [ ] `credit_transactions` tablosu: `user_id`, `amount`, `type`, `description`, `created_at`
- [ ] `credit_packages` tablosu: `id`, `name`, `credits`, `price_try`, `price_usd`, `is_active`
- [ ] Supabase RLS politikaları
- [ ] PayTR entegrasyonu (kredi paketi satın alma)
- [ ] Real-time bakiye kontrolü (export öncesi)
- [ ] Düşük bakiye uyarıları (10 kredi altı)

---

## 4. MODÜL SİSTEMİ İYİLEŞTİRMELERİ

### 4.1 Hazır Modül Varyantları (Her modül tipi için 3-6 stil)

#### Header Modülü — 5 Varyant
1. **Resmi Denetim**: Yeşil üst şerit, büyük başlık, kat/revizyon grid
2. **Kurumsal Logo**: Logo alanı sol, başlık orta, bilgi sağ
3. **Minimal Çizgi**: İnce alt çizgi, küçük yazı, geniş alan
4. **Çift Dil**: TR üst / EN alt, resmi kurum formatı
5. **Renkli Bant**: Tam genişlik yeşil bant, beyaz yazı

#### Talimat Modülü — 4 Varyant
1. **Numaralı Liste**: Yeşil/kırmızı numaralı adımlar
2. **İkon Bazlı**: Her adımda mini ikon
3. **Kompakt Grid**: 2 sütunlu, kısa maddeler
4. **Görsel Akış**: Ok işaretli flowchart tarzı

#### Onay/Revizyon Modülü — 3 Varyant
1. **Tablo Grid**: 4 sütunlu imza alanı
2. **Yatay Şerit**: Tek satırlık kompakt onay
3. **Resmi Belge**: Kaşe alanı + tarih + revizyon tablosu

### 4.2 Modül Arka Plan Renkleri (Yönetmeliğe Uygun)

| Modül | Arka Plan | Gerekçe |
|-------|-----------|---------|
| Header | Yeşil (#008F4C) şerit | ISO 23601 — güvenli durum rengi |
| Tahliye Talimatı | Açık yeşil arka plan | Güvenli durum bilgisi |
| Yangın Talimatı | Açık kırmızı arka plan | Yangın koruma rengi |
| Acil Numaralar | Kırmızı başlık | Acil durum vurgusu |
| Lejand | Nötr/beyaz | Okunabilirlik |
| Toplanma | Açık mavi | Bilgi/yönlendirme |
| Onay | Nötr/gri border | Resmi belge görünümü |

---

## 5. FAZLAR VE CHECKLIST

### FAZ 1: TEMELLERİ DÜZELT (Hafta 1-2)
> Öncelik: Mevcut sistemi satılabilir hale getir

- [x] **F1.1** Landing page sahte verileri temizle
  - [x] "Sektör Liderleri" bölümünü kaldır veya "Hedef Sektörler" yap
  - [x] Testimonials'ı kaldır veya "Beta Kullanıcı Yorumları" yap
  - [x] Blog bölümünü "Yakında" ile değiştir veya 2-3 gerçek makale yaz
  - [x] "Demoyu İzle" butonunu demo video veya editör tour'a bağla
  - [x] Footer linklerini gerçek sayfalara yönlendir (KVKK, Gizlilik, Kullanım)
  - [x] ✅ Test: Tüm linkler çalışıyor, sahte içerik yok

- [x] **F1.2** Hukuki sayfaları oluştur
  - [x] KVKK Aydınlatma Metni
  - [x] Gizlilik Politikası
  - [x] Kullanım Koşulları
  - [x] Çerez Politikası
  - [x] ✅ Test: /legal/kvkk, /legal/privacy, /legal/terms, /legal/cookies erişilebilir

- [x] **F1.3** Modül panelinde Türkçe karakter düzelt
  - [x] "Baslik" → "Başlık", "Cizim" → "Çizim", "Lejand" → "Lejant" vs.
  - [x] defaultState metinlerinde Türkçe karakter düzelt
  - [x] ✅ Test: Tüm modül etiketleri doğru Türkçe

- [x] **F1.4** Filigran sistemi ekle
  - [x] Ücretsiz kullanıcılar için export'a "Planify.com.tr" filigranı
  - [x] Canvas preview'da hafif filigran göster
  - [x] Kredi harcandığında filigran kaldır
  - [x] ✅ Test: Free user export → filigran var, kredi harcama → filigran yok

### FAZ 2: KREDİ SİSTEMİ (Hafta 2-3)

- [x] **F2.1** Veritabanı migrasyonu
  - [x] `credit_packages` tablosu oluştur
  - [x] `user_credits` tablosu oluştur
  - [x] `credit_transactions` tablosu oluştur
  - [x] RLS politikaları
  - [x] ✅ Test: Migration başarılı, RLS çalışıyor

- [x] **F2.2** Kredi store oluştur
  - [x] `useCreditStore.ts` — bakiye, paketler, işlem geçmişi
  - [x] Export öncesi kredi kontrolü
  - [x] Yetersiz kredi uyarı modal'ı (veya uyarısı)
  - [x] ✅ Test: Bakiye sorgulama, düşme, yetersiz uyarı

- [x] **F2.3** Landing page fiyatlandırma güncelle
  - [x] Abonelik kartlarını kredi paketlerine dönüştür
  - [x] "Ücretsiz" → "50 Başlangıç Kredisi"
  - [x] SSS'leri kredi sistemine uyarla
  - [x] ✅ Test: Fiyatlandırma sayfası doğru gösteriyor

- [x] **F2.4** Ödeme entegrasyonu
  - [x] PayTR ile kredi paketi satın alma akışı
  - [x] Başarılı ödeme → kredi ekleme
  - [x] Fatura/makbuz oluşturma
  - [x] ✅ Test: Test ödemesi → kredi bakiyeye eklendi

### FAZ 3: MODÜL & ŞABLON ZENGİNLEŞTİRME (Hafta 3-4)

- [x] **F3.1** Modül varyantları ekle
  - [x] Header modülü: 5 farklı stil
  - [x] Talimat modülü: 4 farklı stil
  - [x] Onay modülü: 3 farklı stil
  - [x] Her modüle varyant seçici ekle
  - [x] ✅ Test: Varyant değiştirme sorunsuz, export'ta doğru görünüm

- [x] **F3.2** Modül arka plan renklerini yönetmeliğe uyumlu yap
  - [x] Yeşil: Header, Tahliye talimatı, Toplanma
  - [x] Kırmızı: Yangın talimatı, Acil numara, Risk
  - [x] Mavi: Erişilebilirlik, Zorunluluk
  - [x] ✅ Test: Renk kodları ISO 7010 ile uyumlu

- [x] **F3.3** Sektöre özel şablon paketleri
  - [x] Hastane / Sağlık Tesisi paketi
  - [x] Okul / Eğitim Kurumu paketi
  - [x] AVM / Ticaret Merkezi paketi
  - [x] Fabrika / Endüstriyel Tesis paketi
  - [x] Otel / Konaklama paketi
  - [x] ✅ Test: Her paket doğru modüllerle yükleniyor

### FAZ 4: EDİTÖR İYİLEŞTİRMELERİ (Hafta 4-5)

- [x] **F4.1** EditorCanvas bölme (refactor)
  - [x] `GridRenderer.tsx` — Konva grid çizimi (27 satır)
  - [x] `CanvasHelpers.tsx` — WatermarkGroup, BrandingBanner, LegendItem, CustomSymbolImage (146 satır)
  - [x] `ModuleOverlay.tsx` — Şablon modül HTML overlay'leri (688 satır)
  - [ ] KonvaRenderer, InteractionHandler (closure bağımlılıkları nedeniyle ileri aşamada)
  - [x] EditorCanvas 149KB → 95KB'a düşürüldü
  - [x] ✅ Test: npm run build başarılı, 0 hata

- [x] **F4.2** Gerçek sembol grafikleri
  - [x] ISO 7010 sembol SVG'leri oluştur/entegre et
  - [x] Şu an harf kısaltmaları var (E001, F001) — gerçek ikonlara geç
  - [x] ✅ Test: Tüm semboller doğru renk/şekilde render ediliyor

- [x] **F4.3** localStorage → Supabase geçişi
  - [x] Proje verilerini Supabase'e kaydet (autosave)
  - [x] localStorage'ı sadece cache olarak kullan
  - [x] Çoklu cihaz senkronizasyonu
  - [x] ✅ Test: Farklı tarayıcıda aynı proje açılıyor

- [x] **F4.4** Çoklu dil desteği altyapısı (TR/EN)
  - [x] Modül başlıkları TR/EN
  - [x] Export'ta dil seçeneği
  - [x] ✅ Test: EN seçildiğinde tüm modül metinleri İngilizce

### FAZ 5: SATIŞ & PAZARLAMA (Hafta 5-6)

- [x] **F5.1** SEO optimizasyonu
  - [x] Meta taglar, Open Graph, Twitter Card
  - [x] Sitemap.xml
  - [x] robots.txt
  - [x] Yapılandırılmış veri (Schema.org)
  - [x] ✅ Test: Lighthouse SEO skoru 90+

- [x] **F5.2** Demo/Onboarding akışı
  - [x] İlk giriş wizard'ı (3 adım)
  - [x] Editör içi interaktif tur
  - [x] Demo proje şablonu (önceden çizilmiş)
  - [x] ✅ Test: Yeni kullanıcı sorunsuz onboarding geçiyor

- [x] **F5.3** İçerik pazarlama
  - [x] "Acil Durum Tahliye Planı Nasıl Hazırlanır?" blog yazısı
  - [x] "ISO 23601 Nedir?" rehber sayfası
  - [x] "İSG Uzmanları İçin Dijital Araçlar" karşılaştırma
  - [x] ✅ Test: Blog sayfaları yayında, SEO uyumlu

- [x] **F5.4** Analytics ve dönüşüm
  - [x] Google Analytics 4 entegrasyonu
  - [x] Dönüşüm hedefleri (kayıt, kredi satın alma, export)
  - [x] Kullanıcı davranış izleme (hangi özellikler kullanılıyor)
  - [x] ✅ Test: Events doğru tetikleniyor

---

## 6. HUKUKİ UYUMLULUK RULES

### RULE 1: KVKK Uyumluluğu
- [ ] Açık rıza metni (kayıt sırasında checkbox)
- [ ] Veri işleme envanteri hazırla
- [ ] Kişisel veri silme mekanizması (hesap silme)
- [ ] Çerez onay banner'ı

### RULE 2: Tüketici Hakları
- [ ] 14 gün cayma hakkı bilgilendirmesi
- [ ] Mesafeli satış sözleşmesi
- [ ] Fatura/makbuz otomatik gönderimi
- [ ] İade politikası (kullanılmamış kredi iadesi)

### RULE 3: Mesleki Sorumluluk
- [ ] "Bu yazılım mesleki danışmanlık hizmeti yerine geçmez" uyarısı
- [ ] "Tahliye planlarınızı yetkili ISG uzmanına onaylatın" hatırlatması
- [ ] Yazılım hizmet sözleşmesi

### RULE 4: ISO Uyumluluk Beyanı
- [ ] "ISO 7010 sembol kütüphanesi kullanılmaktadır" beyanı
- [ ] "ISO 23601 tasarım ilkeleri referans alınmıştır" beyanı
- [ ] Sertifikasyon iddiası yapılmamalı — "uyumlu araç" denmeli

---

## 7. TEKNİK KURALLAR (RULES)

### RULE T1: Her değişiklik sonrası
```bash
npm run lint    # Lint hatası 0 olmalı
npm run build   # Build başarılı olmalı
```

### RULE T2: Mevcut projelerin korunması
- Eski projeler açılabilmeli
- Template migration kodu çalışmalı
- localStorage → Supabase geçişinde veri kaybı olmamalı

### RULE T3: Export doğrulama
- PDF: A3 yatay/dikey boyutları doğru
- PNG: 300 DPI minimum
- Metin okunabilirliği kontrol
- Filigran doğru pozisyonda

### RULE T4: Erişilebilirlik
- ARIA etiketleri tüm interaktif öğelerde
- Klavye navigasyonu çalışmalı
- Renk kontrastı WCAG AA seviyesi
- Screen reader uyumu

### RULE T5: Performans
- Lighthouse Performance 80+
- First Contentful Paint < 1.5s
- Canvas 60fps render hedefi
- Bundle size monitoring

---

## 8. BAŞARI METRİKLERİ

| Metrik | Hedef (3 ay) | Hedef (6 ay) |
|--------|-------------|-------------|
| Kayıtlı kullanıcı | 500 | 2000 |
| Aylık aktif | 100 | 500 |
| Kredi satışı (aylık) | ₺5,000 | ₺25,000 |
| Oluşturulan plan | 1,000 | 10,000 |
| PDF export | 500 | 5,000 |
| NPS skoru | 40+ | 60+ |

---

## 9. REKABETÇİ AVANTAJLAR

1. **Türkiye'ye özel**: TR mevzuatı, Türkçe içerik, ₺ fiyatlandırma, PayTR
2. **Tahliye planına özel**: Genel çizim aracı değil, ISG odaklı
3. **Denetim odaklı**: ComplianceChecker ile anlık uyumluluk kontrolü
4. **Modüler sistem**: Sürükle-bırak modüllerle hızlı plan oluşturma
5. **Fiyat avantajı**: Rakipler $10-15/ay, Planify kredi bazlı ve daha esnek
6. **Web tabanlı**: Kurulum gerektirmez, her cihazdan erişim

---

## 10. RİSK MATRİSİ

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Ödeme entegrasyonu gecikme | Yüksek | Kritik | PayTR sandbox ile erken test |
| EditorCanvas refactor bozulma | Orta | Yüksek | Aşamalı bölme, her adımda test |
| Kullanıcı kredi sistemini anlamama | Orta | Orta | Basit UI, tooltip, onboarding |
| SEO ile organik trafik gecikmesi | Yüksek | Orta | Paralel olarak ücretli reklam |
| Rakip platform Türkiye'ye giriş | Düşük | Yüksek | Hızlı iterasyon, niş odak |

---

> **SONRAKİ ADIM**: Bu plan onaylandığında FAZ 1'den başlayarak çalışmaya geçilecek.
> Her faz tamamlandığında ilgili checklist maddeleri ✅ olarak işaretlenecek.
> Her faz sonunda `npm run lint && npm run build` ile doğrulama yapılacak.
