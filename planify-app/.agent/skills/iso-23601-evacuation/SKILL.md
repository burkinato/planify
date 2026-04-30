---
name: iso-23601-evacuation
description: >
  ISO 23601:2020 - Safety identification: Escape and evacuation plan signs.
  Tahliye planı tasarım standartları.
---

# ISO 23601:2020 Tahliye Planı İşaretleri

## Standart Hakkında

- **Referans:** ISO 23601:2020
- **Başlık:** Safety identification — Escape and evacuation plan signs
- **Kapsam:** Yangın güvenliği, tahliye ve kurtarma planları

---

## Plan Elemanları

### 1. Header (Üst Bilgi)
```
┌─────────────────────────────────┐
│ [Bina/Facility Name]             │
│ [Adres]                        │
│ Kat/Floor: Zemin Kat            │
│ Revizyon/Revision: 01.01.2026   │
└─────────────────────────────────┘
```

### 2. "You Are Here" İşareti
- Siyah kare içinde beyaz ok
- Kullanıcının mevcut konumu
- Ok yönü, kullanıcının baktığı yönü gösterir

### 3. Kaçış Rotaları

| Tip | Renk | Çizgi Tipi |
|-----|------|-----------|
| Yatay kaçış | Açık yeşil (#33CC00) | Kesikli çizgi |
| Dikey kaçış (merdiven) | Koyu yeşil (#006600) | Kesikli çizgi |
| Acil çıkış | Yeşil dolu ok | Ok ucu |

### 4. Acil Çıkış Kapıları
- Kapı sembolü (açık)
- Yeşil ok yönü
- Numara (opsiyonel)

### 5. Toplanma Alanı (Assembly Point)
```
🏠 ASEMBLY POINT
   ▼
┌─────────────┐
│  [X]        │  → Beyaz kare, yeşil kenarlık
└─────────────┘
```

### 6. Yangın Ekipmanı

| Ekipman | Sembol | Konum |
|--------|--------|------|
| Yangın söndürücü | 🔴 Kırmızı daire, beyaz "F" | Duvar monte |
| Yangın hortumu | 🔴 Kırmızı daire, hortum | Hortum dolabı |
| Alarm butonu | 🔴 Kırmızı daire, el | Duvar |
| İtfaiye bağlantısı | 🔴 Kırmızı, itfaiye aracı | Dış cephe |

### 7. İlk Yardım
```
┌──────┐
│  🟢  │  → Yeşil daire, beyaz haç
├──────┤
│  🔴  │
└──────┘
```

### 8. Merdiven Sembolü
```
┌───┐
│━━━│  → Basamak çizgileri
│ ↑ │
```

---

## Renk Kodları

| Renk | Hex | Kullanım |
|------|-----|---------|
| Açık yeşil | #33CC00 | Yatay kaçış yolu |
| Koyu yeşil | #006600 | Dikey kaçış (merdiven) |
| Mavi | #0000FF | Yapı sınırı (dış) |
| Siyah | #000000 | İç duvar, donanım |
| Beyaz | #FFFFFF | Arka plan |
| Kırmızı | #FF0000 | Yangın ekipmanı, tehlike |
| Sarı | #FFFF00 | Uyarı alanı |

---

## Duvar Çizgi Kalınlıkları

| Eleman | Kalınlık |
|--------|----------|
| Dış duvar | 2.0 pt |
| İç duvar | 1.0 pt |
| Bölme | 0.5 pt |
| Mobilyalar | 0.35 pt |

---

## Plan Boyutları (A4 Referans)

| Eleman | Min Boyut |
|--------|----------|
| Sembol | 3 mm |
| Yazı | 2.5 mm |
| Ok genişliği | 2 mm |
| Satır aralığı | 3 mm |

---

## Plan Elemanları Sırası

1. Header (kurumsal bilgi)
2. North arrow (kuzey)
3. "You are here" işareti
4. Overview plan (tüm kat)
5. Detail area (seçili alan)
6. Legend (sembol açıklaması)
7. Acil durum telefonları
8. Ekip bilgileri

---

## Örnek Plan Yapısı

```
╔════════════════════════════════════════════════╗
║  ÖZEL HASTANE / A-101 Bloğu         ║
║  Cad: Yeşilyol Sok. No:25          ║
║  Kat: 1. Kat                    ║
║  Rev: Ocak 2026                  ║
╠════════════════════════════════════════════════╣
║              ↑ KUZEY              ║
║  ┌─────────────────────────────┐  ║
║  │    ┌──┐                    │  ║
║  │ 🔴 │  │← Yangın              │  ║
║  │    └──┘  Extinguisher       │  ║
║  │    ┌──┐                    │  ║
║  │ 🟢 │  │← Acil Çıkış        │  ║
║─ │────│──│─────────────────    │  ║
║  │    │👤│ ←BURADASINIZ       │  ║
║  │    └──┘                    │  ║
║  │         🪜↓                │  ║
║  │    ┌──┐                    │  ║
║  │ 🏠 │  │← Toplanma         │  ║
║  └─────────────────────────────┘  ║
╠════════════════════════════════════════╣
║  LEGEND:                         ║
║  🟢 Kaçış yolu (yeşil ok)      ║
║  🔴 Yangın söndürücü            ║
║  🏠 Toplanma alanı               ║
║  👤 Buradasınız                  ║
║  🪜 Merdiven (aşağı)            ║
╠════════════════════════════════════════╣
║  ACİL: 112 İtfaiye              ║
║       155 Polis                 ║
║       154 Ambulans              ║
╠════════════════════════════════╣
║  SORUMLU: Ahmet Yılmaz (0532)   ║
║  YETKİLİ: Mehmet Demir (0533)    ║
╚════════════════════════════════════════╝
```

---

## Referanslar

- ISO 23601:2020
- ISO 7010 (güvenlik renkleri ve işaretleri)
- ISO 3864-1 (güvenlik renkleri)
- İşyerlerinde Acil Durumlar Hakkında Yönetmelik