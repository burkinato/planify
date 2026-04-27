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
] as const;

const r = (
  id: string, type: TemplateRegion['type'], label: string,
  x: number, y: number, w: number, h: number,
  tone: TemplateRegion['tone']
): TemplateRegion => ({ id, type, label, x, y, w, h, tone });

export function buildRegions(style: string): TemplateRegion[] {
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

export const FALLBACK_TEMPLATE_LAYOUTS: TemplateLayout[] = FAMILIES.flatMap(
  ([slug, name, category, description, style, accent, is_pro], familyIndex) =>
    (Object.keys(PAGE_PRESETS) as PagePreset[]).map((preset, presetIndex) => {
      const page = PAGE_PRESETS[preset];
      const fullSlug = `${slug}-a3-${preset.toLowerCase()}`;
      return {
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
      };
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
      body: '1. Sakin kalın, paniğe kapılmayın.\n2. 112 numarasını arayın.\n3. En yakın çıkışa yönelin.\n4. Toplanma alanına gidin.\n5. Asansör kullanmayın.',
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
