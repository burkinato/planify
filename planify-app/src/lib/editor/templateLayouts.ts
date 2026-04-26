import type { PagePreset, TemplateLayout, TemplateRegion, TemplateState } from '@/types/editor';

const PAGE_PRESETS: Record<PagePreset, { width: number; height: number; orientation: 'landscape' | 'portrait' }> = {
  'Landscape': { width: 1414, height: 1000, orientation: 'landscape' },
  'Portrait':  { width: 1000, height: 1414, orientation: 'portrait'  },
};

const FAMILIES = [
  ['iso-standard',    'ISO Standart (Tam Çerçeve)', 'STANDART',  'Tüm bilgiler dış çerçevede, ana odak devasa kat planı. En yaygın endüstri standardı.', '#00965e', false],
  ['cad-right-rail',  'CAD Sağ Sütun (Antet)',      'TEKNİK',    'Klasik AutoCAD antet yapısı. Sol tamamen çizim, sağ dikey sütunda tüm bilgiler.', '#1e293b', true],
  ['cad-bottom-rail', 'CAD Alt Sütun (Yatay)',      'TEKNİK',    'Üstte çizim, altta yatay bir teknik antet bloğu. Tüm bilgiler tek hizada.', '#1d4ed8', true],
  ['corporate-framed','Kurumsal Çift Sütun',        'KURUMSAL',  'Ortada kat planı, sağ ve sol yanlarda simetrik talimat ve lejand dizilimi.', '#b91c1c', true],
  ['hotel-minimal',   'Minimalist (Otel/Kapı arkası)','MİNİMAL',   'Büyük çizim, sadece "Buradasınız" ve çok sade lejand/onay kutuları.', '#0f172a', false],
  ['hospital-clinic', 'Sağlık Tesisi (Geniş)',      'KURUMSAL',  'Geniş talimat alanları. Sol sütun tamamen talimat, sağ sütun lejand ve ekip.', '#0284c7', true],
  ['school-dormitory','Okul / Yurt (Görsel Odak)',  'STANDART',  'Merkezde büyük kat planı, alt kısımda üç eşit bloka bölünmüş net talimatlar.', '#ea580c', false],
  ['industrial-complex','Endüstriyel Tesis (Kapsamlı)', 'TEKNİK',  'Ekip ve onay listeleri için ekstra alanlı, sanayi tesisleri için detaylı yerleşim.', '#475569', true],
  ['commercial-wide', 'AVM / Ticari (Yatay Akış)',  'KURUMSAL',  'Çok geniş çizim alanı. Tüm lejand ve onay blokları alt kenara şerit halinde yayılmış.', '#7c3aed', true],
  ['compact-a4',      'Kompakt Dar Alan (A4)',      'MİNİMAL',   'Yer sıkıntısı olan dar koridor panoları için her şeyin iç içe geçtiği kompakt tasarım.', '#059669', false],
] as const;

const r = (
  id: string, type: TemplateRegion['type'], label: string,
  x: number, y: number, w: number, h: number,
  tone: TemplateRegion['tone']
): TemplateRegion => ({ id, type, label, x, y, w, h, tone });

export function buildRegions(style: string): TemplateRegion[] {
  if (style === 'iso-standard') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   0,   0, 100,  8, 'green'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   0,   8,  20, 46, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                       0,  54,  20, 46, 'red'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      20,   8,  60, 92, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                     80,   8,  20, 52, 'info'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       80,  60,  20, 20, 'blue'),
    r('approval',        'approval',    'Revizyon ve Onay',                     80,  80,  20, 20, 'neutral'),
  ];
  if (style === 'cad-right-rail') return [
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       0,   0,  75, 100, 'paper'),
    r('header',          'header',      'ACİL DURUM TAHLİYE PLANI',             75,   0,  25,  12, 'neutral'),
    r('legend',          'legend',      'Semboller Dizini',                     75,  12,  25,  33, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                  75,  45,  25,  20, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                      75,  65,  25,  20, 'red'),
    r('approval',        'approval',    'Revizyon ve Onay',                     75,  85,  25,  15, 'neutral'),
  ];
  if (style === 'cad-bottom-rail') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   0,   0, 100,   8, 'blue'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       0,   8, 100,  72, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                      0,  80,  25,  20, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                  25,  80,  25,  20, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                      50,  80,  25,  20, 'red'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       75,  80,  12,  20, 'blue'),
    r('approval',        'approval',    'Onay / Rev.',                          87,  80,  13,  20, 'neutral'),
  ];
  if (style === 'corporate-framed') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   0,   0, 100,   8, 'red'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   0,   8,  18,  46, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                       0,  54,  18,  46, 'red'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      18,   8,  64,  92, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                     82,   8,  18,  52, 'neutral'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       82,  60,  18,  20, 'blue'),
    r('approval',        'approval',    'Revizyon ve Onay',                     82,  80,  18,  20, 'neutral'),
  ];
  if (style === 'hotel-minimal') return [
    r('header',          'header',      'TAHLİYE PLANI / ESCAPE PLAN',          0,   0, 100,   8, 'neutral'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       0,   8, 100,  92, 'paper'),
    r('instructions',    'instruction', 'Talimatlar',                            2,  55,  22,  43, 'green'),
    r('legend',          'legend',      'Semboller / Legend',                   76,  55,  22,  30, 'info'),
    r('approval',        'approval',    'Oda Bilgisi / Onay',                   76,  85,  22,  13, 'neutral'),
  ];
  if (style === 'hospital-clinic') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   0,   0, 100,  8, 'blue'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                   0,   8,  20, 46, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                       0,  54,  20, 46, 'red'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                      20,   8,  60, 92, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                     80,   8,  20, 42, 'info'),
    r('team',            'team',        'Acil Durum Ekibi',                     80,  50,  20, 20, 'neutral'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       80,  70,  20, 15, 'blue'),
    r('approval',        'approval',    'Onay',                                 80,  85,  20, 15, 'neutral'),
  ];
  if (style === 'school-dormitory') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   0,   0, 100,  8, 'red'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       0,   8, 100, 67, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                      0,  75,  30, 25, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                  30,  75,  30, 25, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                      60,  75,  25, 25, 'red'),
    r('approval',        'approval',    'Revizyon ve Onay',                     85,  75,  15, 25, 'neutral'),
  ];
  if (style === 'industrial-complex') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   0,   0,  75, 10, 'neutral'),
    r('approval',        'approval',    'Revizyon ve Onay',                     75,   0,  25, 10, 'neutral'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       0,  10,  75, 90, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                     75,  10,  25, 40, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                  75,  50,  25, 20, 'green'),
    r('fireInstruction', 'instruction', 'Yangın Talimatı',                      75,  70,  25, 20, 'red'),
    r('team',            'team',        'Acil Durum Ekibi',                     75,  90,  25, 10, 'neutral'),
  ];
  if (style === 'commercial-wide') return [
    r('header',          'header',      'ACİL DURUM VE YANGIN TAHLİYE PLANI',   0,   0, 100,  6, 'green'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       0,   6, 100, 74, 'paper'),
    r('legend',          'legend',      'Semboller Dizini',                      0,  80,  40, 20, 'info'),
    r('instructions',    'instruction', 'Acil Durum Talimatı',                  40,  80,  30, 20, 'green'),
    r('assembly',        'assembly',    'Toplanma Alanı',                       70,  80,  15, 20, 'blue'),
    r('approval',        'approval',    'Rev. ve Onay',                         85,  80,  15, 20, 'neutral'),
  ];
  if (style === 'compact-a4') return [
    r('header',          'header',      'ACİL DURUM TAHLİYE PLANI',             0,   0, 100,  8, 'neutral'),
    r('drawing',         'drawing',     'Ana Çizim Alanı',                       0,   8, 100, 62, 'paper'),
    r('instructions',    'instruction', 'Talimatlar',                            0,  70,  33, 30, 'green'),
    r('legend',          'legend',      'Semboller Dizini',                     33,  70,  34, 30, 'info'),
    r('team',            'team',        'Acil Durum Ekibi',                     67,  70,  33, 15, 'neutral'),
    r('approval',        'approval',    'Onay',                                 67,  85,  33, 15, 'neutral'),
  ];
  return buildRegions('iso-standard');
}

export const FALLBACK_TEMPLATE_LAYOUTS: TemplateLayout[] = FAMILIES.flatMap(
  ([slug, name, category, description, accent, is_pro], familyIndex) =>
    (Object.keys(PAGE_PRESETS) as PagePreset[]).map((preset, presetIndex) => {
      const page = PAGE_PRESETS[preset];
      const fullSlug = `${slug}-${preset.toLowerCase()}`;
      return {
        id: `fallback-${familyIndex}-${presetIndex}`,
        slug: fullSlug,
        name: name,
        description,
        category,
        page_preset: preset,
        orientation: page.orientation,
        is_pro,
        layout_json: {
          id: fullSlug,
          style: slug,
          accent,
          page: { preset, ...page },
          regions: buildRegions(slug),
        },
        thumbnail_json: { accent, style: slug },
        compliance_tags: ['ISO 23601:2020', 'ISO 7010:2019', 'TR BYKHY 2015'],
        version: 2,
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
