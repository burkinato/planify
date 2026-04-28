import type { PagePreset, TemplateLayout, TemplateRegion, TemplateState } from '@/types/editor';

const PAGE_PRESETS: Record<PagePreset, { width: number; height: number; orientation: 'landscape' | 'portrait' }> = {
  'Landscape': { width: 1414, height: 1000, orientation: 'landscape' },
  'Portrait':  { width: 1000, height: 1414, orientation: 'portrait'  },
};

const FAMILIES = [
  ['classic-composite', 'TR Klasik Kompozit', 'GENEL', 'Üst başlık, sol bilgilendirme, sağ ekip rayı ve alt talimat blokları.', 'classic', '#00965e', false],
  ['left-instruction',  'TR Sol Talimat',      'GENEL', 'Sol tarafta geniş acil durum ve yangın talimat kolonları.', 'leftRail', '#00965e', false],
  ['right-equipment',   'TR Sağ Bilgi Rayı',    'GENEL', 'Sağ tarafta sembol dizini ve ekipman listesi vurgulu kompozisyon.', 'rightRail', '#0ea5e9', true],
  ['bottom-guidance',   'TR Alt Talimat Şeridi','GENEL', 'Alt bantta talimat, lejand ve onay alanları bulunan geniş çizim düzeni.', 'bottomBand', '#00965e', false],
  ['dual-instruction',  'Çift Talimat Paneli',  'KURUMSAL', 'Yangın ve acil durum talimatlarını iki dengeli kolonda verir.', 'dualRails', '#b91c1c', true],
  ['overview-plus',     'Vaziyet Planlı',       'SAHA', 'Ana kat planının yanında vaziyet/toplanma alanı için ayrılmış düzen.', 'overview', '#2563eb', true],
  ['approval-qr',       'Onay ve QR Alanlı',    'KURUMSAL', 'Revizyon, hazırlayan, onay ve QR alanları güçlü kurumsal çıktı.', 'approval', '#334155', true],
  ['compact-a4',        'Kompakt Talimatlı',    'SERBEST', 'A4 ve dar panolar için yoğun ama okunaklı yerleşim.', 'compact', '#00965e', false],
  ['panoramic-a3',      'Panoramik A3',         'ENDÜSTRİ', 'Büyük kat planına öncelik veren geniş panoramik kompozisyon.', 'panoramic', '#0284c7', true],
  ['public-board',      'Kamu Duyuru Panosu',   'KAMU', 'Kamu alanları için net başlık, duyuru ve talimat hiyerarşisi.', 'public', '#007a3d', true],
  ['minimal-iso',       'Minimal ISO Çerçeve',  'SERBEST', 'Beyaz alanı yüksek, sakin ve denetim odaklı resmi şablon.', 'minimal', '#00965e', false],
  ['technical-slate',   'Teknik Slate Kompozit','ENDÜSTRİ', 'Teknik tesisler için koyu başlık raylı endüstriyel kağıt düzeni.', 'technical', '#475569', true],
  ['wide-legend',       'Geniş Lejand Dizini',  'GENEL', 'Çok sembollü projelerde geniş lejand ve açıklama alanı sağlar.', 'legendHeavy', '#00965e', false],
  ['response-team',     'Ekip ve Sorumlu Alanlı','KURUMSAL', 'Acil durum sorumlusu, yangın sorumlusu ve ekip bilgisi alanları içerir.', 'team', '#dc2626', true],
  ['premium-audit',     'Premium Denetim',      'PREMIUM', 'Denetim skoru, acil telefon ve resmi onay blokları güçlü premium düzen.', 'premiumAudit', '#0f766e', true],
  ['site-overview-pro',  'Saha Vaziyet Premium', 'PREMIUM', 'Vaziyet/toplanma görseli ve ana tahliye planını dengeli sunan saha düzeni.', 'sitePremium', '#2563eb', true],
  ['corporate-3d-board', 'Kurumsal 3D Board',    'PREMIUM', 'Satış algısı yüksek, katmanlı resmi pano estetiği ve güçlü bilgi hiyerarşisi.', 'corporate3d', '#4f46e5', true],
] as const;

const r = (
  id: string, type: TemplateRegion['type'], label: string,
  x: number, y: number, w: number, h: number,
  tone: TemplateRegion['tone']
): TemplateRegion => ({ id, type, label, x, y, w, h, tone });

export function buildRegions(style: string): TemplateRegion[] {
  if (style === 'premiumAudit') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   2,   2, 96,  9, 'green'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       2,  13, 68, 66, 'paper'),
    r('emergency',       'emergency',   '112 Acil Durum Telefonu',              72,  13, 26, 10, 'red'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                  72,  25, 26, 22, 'green'),
    r('legend',          'legend',      'Semboller Dizini',                     72,  49, 26, 18, 'info'),
    r('assembly',        'assembly',    'Toplanma / Vaziyet',                   72,  69, 26, 10, 'blue'),
    r('approval',        'approval',    'Revizyon ve Onay',                      2,  82, 96, 14, 'neutral'),
  ];
  if (style === 'sitePremium') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   2,   2, 96,  9, 'green'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       2,  13, 64, 62, 'paper'),
    r('assembly',        'assembly',    'Vaziyet / Toplanma Alanı',             68,  13, 30, 30, 'blue'),
    r('emergency',       'emergency',   '112 Acil Durum Telefonu',              68,  45, 30, 10, 'red'),
    r('legend',          'legend',      'Semboller Dizini',                     68,  57, 30, 18, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   2,  78, 45, 18, 'green'),
    r('approval',        'approval',    'Revizyon ve Onay',                     49,  78, 49, 18, 'neutral'),
  ];
  if (style === 'corporate3d') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   2,   2, 96, 10, 'green'),
    r('emergency',       'emergency',   '112 Acil Durum Telefonu',               2,  14, 18, 10, 'red'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   2,  26, 18, 29, 'green'),
    r('legend',          'legend',      'Semboller Dizini',                      2,  57, 18, 20, 'info'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      22,  14, 54, 63, 'paper'),
    r('assembly',        'assembly',    'Toplanma / Vaziyet',                   78,  14, 20, 29, 'blue'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                      78,  45, 20, 32, 'red'),
    r('approval',        'approval',    'Revizyon ve Onay',                      2,  80, 96, 16, 'neutral'),
  ];
  if (style === 'panoramic') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   2,   2, 96, 10, 'green'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      2,  14, 76, 68, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                     80, 14, 18, 32, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   80, 48, 18, 22, 'green'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       80, 72, 18, 18, 'blue'),
    r('approval',        'approval',    'Revizyon ve Onay',                     2,  82, 96, 16, 'neutral'),
  ];
  if (style === 'leftRail') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   3,   3, 94,  9, 'green'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   3,  15, 19, 35, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                       3,  52, 19, 28, 'red'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      25, 15, 70, 65, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                      3,  80, 44, 17, 'info'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       50, 80, 22, 17, 'blue'),
    r('approval',        'approval',    'Onay / Rev.',                          75, 80, 22, 17, 'neutral'),
  ];
  if (style === 'rightRail') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   3,   3, 94,  9, 'green'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       3,  15, 70, 65, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                     76,  15, 21, 35, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                  76,  52, 21, 28, 'green'),
    r('assembly',        'assembly',    'Toplanma Alanı',                        3,  80, 34, 17, 'blue'),
    r('approval',        'approval',    'Revizyon ve Onay',                     40,  80, 57, 17, 'neutral'),
  ];
  if (style === 'bottomBand') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   3,   3, 94, 10, 'green'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       3,  16, 94, 58, 'paper'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   3,  77, 30, 18, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                      35,  77, 30, 20, 'red'),
    r('legend',          'legend',      'Semboller Dizini',                     67,  77, 15, 20, 'info'),
    r('approval',        'approval',    'Onay / QR',                            84,  77, 13, 20, 'neutral'),
  ];
  if (style === 'dualRails') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   3,   3, 94, 10, 'green'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   3,  16, 17, 38, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                      80,  16, 17, 38, 'red'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      22,  16, 56, 62, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                      3,  57, 17, 38, 'info'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       22,  79, 35, 18, 'blue'),
    r('approval',        'approval',    'Sorumlu / Onay',                       59,  79, 38, 18, 'neutral'),
  ];
  return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   3,   3, 94, 10, 'green'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   3,  16, 18, 31, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                       3,  50, 18, 28, 'red'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      24, 16, 58, 62, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                     84,  16, 13, 31, 'info'),
    r('assembly',        'assembly',    'Toplanma / Vaziyet',                   84,  50, 13, 28, 'blue'),
    r('approval',        'approval',    'Revizyon ve Onay',                     3,  80, 94, 17, 'neutral'),
  ];
}

function clampRegion(region: TemplateRegion): TemplateRegion {
  const x = Math.max(0, Math.min(98, region.x));
  const y = Math.max(0, Math.min(98, region.y));
  const w = Math.max(6, Math.min(region.w, 100 - x));
  const h = Math.max(6, Math.min(region.h, 100 - y));
  return { ...region, x, y, w, h };
}

export function validateTemplateLayout(layout: TemplateLayout): TemplateLayout {
  return {
    ...layout,
    layout_json: {
      ...layout.layout_json,
      regions: (layout.layout_json.regions || []).map(clampRegion),
    },
  };
}

export const FALLBACK_TEMPLATE_LAYOUTS: TemplateLayout[] = FAMILIES.flatMap(
  ([slug, name, category, description, style, accent, is_pro], familyIndex) =>
    (Object.keys(PAGE_PRESETS) as PagePreset[]).map((preset, presetIndex) => {
      const page = PAGE_PRESETS[preset];
      const fullSlug = `${slug}-a3-${preset.toLowerCase()}`;
      return validateTemplateLayout({
        id: `fallback-${familyIndex}-${presetIndex}`,
        slug: fullSlug,
        name: `${name} (${preset === 'Landscape' ? 'Yatay' : 'Dikey'})`,
        description,
        category,
        is_pro,
        page_preset: preset,
        orientation: preset.toLowerCase() as 'landscape' | 'portrait',
        layout_json: {
          id: fullSlug,
          style,
          accent,
          page: {
            preset,
            width: page.width,
            height: page.height,
            orientation: preset.toLowerCase() as 'landscape' | 'portrait',
          },
          regions: buildRegions(style),
        },
        thumbnail_json: {},
        compliance_tags: ['ISO 23601:2020', 'ISO 7010:2019', 'TR BYKHY', 'Sağlık Güvenlik İşaretleri'],
        version: 1,
        is_official: true,
      });
    })
);

export function getDefaultTemplateState(): TemplateState {
  return {
    header: {
      title: 'ACİL DURUM VE YANGIN TAHLİYE PLANI',
      body:  'Emergency and Fire Evacuation Plan',
      meta:  'Kat: Zemin Kat  |  Ölçek: 1:100  |  Rev: 00',
    },
    instructions: {
      title: 'ACİL DURUM TALİMATI',
      body: '1. Sakin kalın, paniğe kapılmayın.\n2. En yakın çıkışa yönelin.\n3. Toplanma alanına gidin.\n4. Asansör kullanmayın.',
    },
    emergency: {
      title: '112 ACİL DURUM TELEFONU',
      body: 'Yangın, sağlık, güvenlik veya tahliye acil durumlarında 112 aranmalıdır.',
      meta: 'EMERGENCY CALL',
    },
    fireInstruction: {
      title: 'YANGIN TALİMATI',
      body: '1. Yangın alarmını çalıştırın.\n2. Yetkilileri 110 ile bilgilendirin.\n3. En yakın yangın tüpünü kullanın.\n4. Dumana karşı alçakta kalın.\n5. Asansörü kesinlikle kullanmayın.',
    },
    legend: {
      title: 'SEMBOLLER DİZİNİ',
      body: '→  Tahliye Yolu\n✕  Acil Çıkış\n⊕  Toplanma Alanı\n🔥  Yangın Tüpü\n🔔  Yangın Alarm Butonu\n⛑  İlk Yardım Kutusu\n★  Buradasınız',
    },
    assembly: {
      title: 'TOPLANMA ALANI',
      body: 'Toplanma noktası bina dışında, güvenli uzaklıkta işaretlenmiş alanda bulunmaktadır.',
    },
    approval: {
      title: 'REVİZYON VE ONAY',
      body: 'Hazırlayan : ________________________\nKontrol     : İSG Uzmanı\nOnaylayan  : İşveren / Yetkili\nTarih        : _____ / _____ / _______\nRevizyon No: 00',
    },
    team: {
      title: 'ACİL DURUM EKİBİ',
      body: 'Tahliye Sorumlusu: ___________   |   Yedek Sorumlu: ___________   |   İlk Yardım Sorumlusu: ___________',
    },
  };
}

export function mergeTemplateState(state?: TemplateState | null): TemplateState {
  const defaultState = getDefaultTemplateState();
  if (!state) return defaultState;

  const merged: TemplateState = { ...defaultState };
  for (const key in state) {
    merged[key] = {
      ...(defaultState[key] || {}),
      ...(state[key] || {}),
    };
  }
  return merged;
}
