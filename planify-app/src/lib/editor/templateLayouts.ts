import type {
  PagePreset,
  TemplateLayout,
  TemplateModuleDefinition,
  TemplateModuleInstance,
  TemplateModuleType,
  TemplateRegion,
  TemplateState,
} from '@/types/editor';

type PageDefinition = { width: number; height: number; orientation: 'landscape' | 'portrait' };
type LayoutStyle =
  | 'auditMinimal'
  | 'corporateIso'
  | 'industrialPlant'
  | 'publicSchool'
  | 'mallVisitor'
  | 'healthAccessibility'
  | 'constructionSite'
  | 'premiumAudit';

export const PAGE_PRESETS: Record<PagePreset, PageDefinition> = {
  Landscape: { width: 1414, height: 1000, orientation: 'landscape' },
  Portrait: { width: 1000, height: 1414, orientation: 'portrait' },
};

const MODULE_IDS: Record<TemplateModuleType, string> = {
  Header: 'header',
  DrawingArea: 'drawing',
  EmergencyCall: 'emergency',
  EvacuationInstructions: 'instructions',
  FireInstructions: 'fireInstruction',
  Legend: 'legend',
  AssemblyMap: 'assembly',
  ApprovalRevision: 'approval',
  EmergencyTeams: 'team',
  HazardUtilities: 'hazards',
  AccessibilityRefuge: 'accessibility',
  FireEquipmentInventory: 'equipment',
  QrDocumentInfo: 'qr',
  Notes: 'notes',
};

export const MODULE_DEFINITIONS: TemplateModuleDefinition[] = [
  {
    id: 'mod-header',
    type: 'Header',
    label: 'Baslik / Kimlik',
    description: 'Logo, isyeri/proje adi, kat, tarih ve revizyon kimligi.',
    tone: 'green',
    requirement: 'required',
    defaultRegion: { x: 3, y: 3, w: 94, h: 10 },
    minW: 24,
    minH: 7,
    rendererVariant: 'official-title',
    auditTags: ['title', 'workplace', 'floor', 'date', 'revision'],
    defaultState: {
      title: 'ACIL DURUM TAHLİYE PLANI',
      body: 'Emergency Evacuation Plan',
      meta: 'Isyeri / Proje: __________  |  Kat/Bolum: __________  |  Revizyon: 00',
    },
  },
  {
    id: 'mod-drawing-area',
    type: 'DrawingArea',
    label: 'Cizim Alani',
    description: 'Konva tabanli mimari plan, rota ve sembol cizim alani.',
    tone: 'paper',
    requirement: 'required',
    defaultRegion: { x: 25, y: 16, w: 57, h: 62 },
    minW: 35,
    minH: 35,
    rendererVariant: 'cad-grid',
    auditTags: ['floorplan', 'route', 'you-are-here'],
    defaultState: { title: 'Ana Cizim Alani', body: '' },
  },
  {
    id: 'mod-emergency-call',
    type: 'EmergencyCall',
    label: 'Acil Numaralar',
    description: '112 ve yerel acil durum arama bilgileri.',
    tone: 'red',
    requirement: 'required',
    defaultRegion: { x: 3, y: 16, w: 19, h: 10 },
    minW: 13,
    minH: 8,
    rendererVariant: 'callout-red',
    auditTags: ['112', 'emergency-call', 'communication'],
    defaultState: {
      title: 'ACIL YARDIM NUMARASI',
      body: '112 - ACIL CAGRI MERKEZI\nItfaiye, Ambulans, Polis, Jandarma\n\nAramada bildirin:\n- Olayin turu\n- Tam adres ve konum\n- Yarali sayisi ve durum',
      meta: 'EMERGENCY CALL',
    },
  },
  {
    id: 'mod-evacuation-instructions',
    type: 'EvacuationInstructions',
    label: 'Tahliye Talimati',
    description: 'Alarm, tahliye, toplanma ve yoklama adimlari.',
    tone: 'green',
    requirement: 'required',
    defaultRegion: { x: 3, y: 28, w: 19, h: 24 },
    minW: 16,
    minH: 14,
    rendererVariant: 'numbered-green',
    auditTags: ['evacuation', 'no-elevator', 'assembly', 'accounting'],
    defaultState: {
      title: 'ACIL DURUM TALIMATI',
      body: '1. Sakin olun, panige kapilmayin.\n2. Alarm duyuldugunda alani derhal terk edin.\n3. Plandaki en yakin acil cikisa ilerleyin.\n4. Asansorleri kullanmayin, merdivenleri tercih edin.\n5. Duman varsa egilerek veya surunerek ilerleyin.\n6. Engelli, yasli ve hamile kisilere yardim edin.\n7. Toplanma alaninda yoklama tamamlanana kadar ayrilmayin.',
    },
  },
  {
    id: 'mod-fire-instructions',
    type: 'FireInstructions',
    label: 'Yangin Talimati',
    description: 'Alarm, 112, sondurucu ve guvenli tahliye adimlari.',
    tone: 'red',
    requirement: 'recommended',
    defaultRegion: { x: 3, y: 54, w: 19, h: 24 },
    minW: 16,
    minH: 14,
    rendererVariant: 'numbered-red',
    auditTags: ['fire', 'extinguisher', 'alarm'],
    defaultState: {
      title: 'YANGIN TALIMATI',
      body: '1. Yangini fark edince alarm butonuna basin.\n2. 112 numarasini arayarak itfaiyeyi bilgilendirin.\n3. Guvenliyse uygun sondurucu ile ilk mudahaleyi yapin.\n4. Sondurucu icin pimi cek, hedefe tut, tetiği sik ve supur.\n5. Kontrol altina alinamiyorsa tahliye edin.\n6. Kapilari kapatin ancak kilitlemeyin.\n7. Asansorleri kesinlikle kullanmayin.',
    },
  },
  {
    id: 'mod-legend',
    type: 'Legend',
    label: 'Lejand / Semboller',
    description: 'Rota ve ISO 7010 sembollerinin okunabilir dizini.',
    tone: 'info',
    requirement: 'required',
    defaultRegion: { x: 84, y: 16, w: 13, h: 28 },
    minW: 12,
    minH: 12,
    rendererVariant: 'symbol-index',
    auditTags: ['legend', 'symbols', 'iso-7010'],
    defaultState: {
      title: 'SEMBOLLER DIZINI',
      body: '-> Tahliye Yolu\n-- Alternatif Rota\nX Acil Cikis\n* Buradasiniz\nO Toplanma Alani\nFE Yangin Tupu\nFA Yangin Alarmi\n+ Ilk Yardim',
    },
  },
  {
    id: 'mod-assembly-map',
    type: 'AssemblyMap',
    label: 'Toplanma / Vaziyet',
    description: 'Bina disi toplanma noktasi veya vaziyet krokisi.',
    tone: 'blue',
    requirement: 'required',
    defaultRegion: { x: 84, y: 47, w: 13, h: 31 },
    minW: 12,
    minH: 12,
    rendererVariant: 'assembly-card',
    auditTags: ['assembly-area', 'site-plan'],
    defaultState: {
      title: 'TOPLANMA ALANI',
      body: 'Toplanma noktasi bina disinda, guvenli uzaklikta isaretlenmis alanda bulunmaktadir.',
    },
  },
  {
    id: 'mod-approval-revision',
    type: 'ApprovalRevision',
    label: 'Onay / Revizyon',
    description: 'Hazirlayan, kontrol, onaylayan, tarih ve revizyon kaydi.',
    tone: 'neutral',
    requirement: 'required',
    defaultRegion: { x: 3, y: 82, w: 94, h: 15 },
    minW: 26,
    minH: 10,
    rendererVariant: 'signature-grid',
    auditTags: ['approval', 'revision', 'signature'],
    defaultState: {
      title: 'REVIZYON VE ONAY',
      body: 'Hazirlayan: ____________________\nKontrol: ISG Uzmani\nOnaylayan: Isveren / Yetkili\nTarih: ____ / ____ / ______\nRevizyon No: 00',
    },
  },
  {
    id: 'mod-emergency-teams',
    type: 'EmergencyTeams',
    label: 'Acil Durum Ekipleri',
    description: 'Sondurme, kurtarma, koruma ve ilk yardim sorumlulari.',
    tone: 'neutral',
    requirement: 'recommended',
    defaultRegion: { x: 67, y: 68, w: 30, h: 10 },
    minW: 18,
    minH: 8,
    rendererVariant: 'team-strip',
    auditTags: ['teams', 'responsible-persons', 'communication'],
    defaultState: {
      title: 'ACIL DURUM EKIBI',
      body: 'Tahliye: __________  |  Sondurme: __________\nKurtarma: __________ | Ilk Yardim: __________',
    },
  },
  {
    id: 'mod-hazard-utilities',
    type: 'HazardUtilities',
    label: 'Risk / Utility',
    description: 'Gaz, elektrik kesme noktalari ve ozel risk alanlari.',
    tone: 'red',
    requirement: 'recommended',
    defaultRegion: { x: 67, y: 48, w: 30, h: 18 },
    minW: 18,
    minH: 10,
    rendererVariant: 'risk-utility',
    auditTags: ['hazards', 'gas-shutoff', 'electric-shutoff'],
    defaultState: {
      title: 'RISK VE KESME NOKTALARI',
      body: 'Elektrik ana kesici: __________\nDogalgaz/yanici gaz vanasi: __________\nKimyasal/parlama riski: __________\nTehlikeli alanlardan gecmeyen rota tercih edilmelidir.',
    },
  },
  {
    id: 'mod-accessibility-refuge',
    type: 'AccessibilityRefuge',
    label: 'Erisilebilirlik',
    description: 'Engelli, yasli, gebe refakat ve erisilebilir cikis bilgisi.',
    tone: 'blue',
    requirement: 'recommended',
    defaultRegion: { x: 67, y: 36, w: 30, h: 10 },
    minW: 18,
    minH: 8,
    rendererVariant: 'accessibility',
    auditTags: ['accessibility', 'refuge', 'wheelchair'],
    defaultState: {
      title: 'ERISILEBILIR TAHLİYE',
      body: 'Refakat sorumlusu: __________\nErisilebilir cikis/yardim noktasi planda isaretlenmelidir.',
    },
  },
  {
    id: 'mod-fire-equipment',
    type: 'FireEquipmentInventory',
    label: 'Yangin Ekipmani',
    description: 'Sondurucu, dolap, alarm, hidrant ve bakim notlari.',
    tone: 'red',
    requirement: 'recommended',
    defaultRegion: { x: 67, y: 24, w: 30, h: 10 },
    minW: 18,
    minH: 8,
    rendererVariant: 'equipment-list',
    auditTags: ['fire-equipment', 'alarm', 'hydrant'],
    defaultState: {
      title: 'YANGIN EKIPMANI',
      body: 'Yangin tupu: ___ adet\nYangin dolabi: ___ adet\nAlarm butonu: ___ adet\nHidrant: ___ adet',
    },
  },
  {
    id: 'mod-qr-info',
    type: 'QrDocumentInfo',
    label: 'QR / Belge Bilgisi',
    description: 'Belge no, gecerlilik, QR ve dijital dogrulama alani.',
    tone: 'info',
    requirement: 'optional',
    defaultRegion: { x: 84, y: 68, w: 13, h: 10 },
    minW: 10,
    minH: 8,
    rendererVariant: 'qr-document',
    auditTags: ['qr', 'document-control'],
    defaultState: {
      title: 'BELGE BILGISI',
      body: 'Belge No: PLN-____\nGecerlilik: ____ / ____ / ______\nQR dogrulama alani',
    },
  },
  {
    id: 'mod-notes',
    type: 'Notes',
    label: 'Notlar',
    description: 'Ziyaretci, alt isveren veya saha ozel bilgilendirme notlari.',
    tone: 'neutral',
    requirement: 'optional',
    defaultRegion: { x: 3, y: 70, w: 19, h: 8 },
    minW: 12,
    minH: 7,
    rendererVariant: 'notes',
    auditTags: ['notes', 'visitors'],
    defaultState: {
      title: 'OZEL NOTLAR',
      body: 'Ziyaretci ve alt isverenler tahliye sorumlusunun yonlendirmesine uymakla yukumludur.',
    },
  },
];

export function normalizePagePreset(value: unknown, fallback: PagePreset = 'Landscape'): PagePreset {
  if (typeof value !== 'string') return fallback;
  const normalized = value.toLowerCase();
  if (normalized.includes('portrait')) return 'Portrait';
  if (normalized.includes('landscape')) return 'Landscape';
  if (normalized === 'dikey') return 'Portrait';
  if (normalized === 'yatay') return 'Landscape';
  return fallback;
}

export function getModuleDefinition(type: TemplateModuleType): TemplateModuleDefinition {
  return MODULE_DEFINITIONS.find((definition) => definition.type === type) ?? MODULE_DEFINITIONS[0];
}

export function createTemplateModuleInstance(
  type: TemplateModuleType,
  overrides: Partial<TemplateModuleInstance> = {}
): TemplateModuleInstance {
  const definition = getModuleDefinition(type);
  const base = definition.defaultRegion;
  return clampTemplateModule({
    id: overrides.id ?? MODULE_IDS[type],
    type,
    label: overrides.label ?? definition.label,
    tone: overrides.tone ?? definition.tone,
    x: overrides.x ?? base.x,
    y: overrides.y ?? base.y,
    w: overrides.w ?? base.w,
    h: overrides.h ?? base.h,
    zIndex: overrides.zIndex ?? (type === 'DrawingArea' ? 10 : 20),
    locked: overrides.locked ?? type === 'DrawingArea',
    movable: overrides.movable ?? type !== 'DrawingArea',
    resizable: overrides.resizable ?? true,
    rendererVariant: overrides.rendererVariant ?? definition.rendererVariant,
    requirement: overrides.requirement ?? definition.requirement,
  });
}

export function getDefaultModuleId(type: TemplateModuleType): string {
  return MODULE_IDS[type];
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function moduleTypeToRegionType(type: TemplateModuleType): TemplateRegion['type'] {
  if (type === 'Header') return 'header';
  if (type === 'DrawingArea') return 'drawing';
  if (type === 'EmergencyCall') return 'emergency';
  if (type === 'Legend') return 'legend';
  if (type === 'AssemblyMap') return 'assembly';
  if (type === 'ApprovalRevision') return 'approval';
  if (type === 'EmergencyTeams') return 'team';
  if (type === 'QrDocumentInfo') return 'info';
  if (type === 'HazardUtilities' || type === 'AccessibilityRefuge' || type === 'FireEquipmentInventory' || type === 'Notes') return 'info';
  return 'instruction';
}

function regionToModuleType(region: TemplateRegion): TemplateModuleType {
  if (region.type === 'header') return 'Header';
  if (region.type === 'drawing') return 'DrawingArea';
  if (region.type === 'emergency') return 'EmergencyCall';
  if (region.type === 'legend') return 'Legend';
  if (region.type === 'assembly' || region.type === 'media') return 'AssemblyMap';
  if (region.type === 'approval') return 'ApprovalRevision';
  if (region.type === 'team') return 'EmergencyTeams';
  if (region.id.toLowerCase().includes('fire')) return 'FireInstructions';
  if (region.id.toLowerCase().includes('hazard')) return 'HazardUtilities';
  if (region.id.toLowerCase().includes('access')) return 'AccessibilityRefuge';
  if (region.id.toLowerCase().includes('equipment')) return 'FireEquipmentInventory';
  if (region.id.toLowerCase().includes('qr')) return 'QrDocumentInfo';
  if (region.type === 'info') return 'Notes';
  return 'EvacuationInstructions';
}

function clampBox(
  box: { x: number; y: number; w: number; h: number },
  minW: number,
  minH: number
) {
  const x = Math.max(0, Math.min(99 - minW, toFiniteNumber(box.x, 0)));
  const y = Math.max(0, Math.min(99 - minH, toFiniteNumber(box.y, 0)));
  const w = Math.max(minW, Math.min(toFiniteNumber(box.w, minW), 100 - x));
  const h = Math.max(minH, Math.min(toFiniteNumber(box.h, minH), 100 - y));
  return { x, y, w, h };
}

export function clampTemplateModule(module: TemplateModuleInstance): TemplateModuleInstance {
  const definition = getModuleDefinition(module.type);
  const box = clampBox(module, definition.minW, definition.minH);
  return {
    ...module,
    label: module.label || definition.label,
    tone: module.tone ?? definition.tone,
    ...box,
    zIndex: Number.isFinite(module.zIndex) ? module.zIndex : 20,
    rendererVariant: module.rendererVariant ?? definition.rendererVariant,
    requirement: module.requirement ?? definition.requirement,
  };
}

function clampRegion(region: TemplateRegion): TemplateRegion {
  const box = clampBox(region, 6, 6);
  return { ...region, ...box };
}

export function moduleToRegion(module: TemplateModuleInstance): TemplateRegion {
  const definition = getModuleDefinition(module.type);
  return clampRegion({
    id: module.id,
    type: moduleTypeToRegionType(module.type),
    label: module.label || definition.label,
    tone: module.tone ?? definition.tone,
    x: module.x,
    y: module.y,
    w: module.w,
    h: module.h,
  });
}

export function modulesToRegions(modules: TemplateModuleInstance[]): TemplateRegion[] {
  return modules
    .slice()
    .sort((left, right) => left.zIndex - right.zIndex)
    .map(moduleToRegion);
}

export function regionsToModules(regions: TemplateRegion[] = []): TemplateModuleInstance[] {
  const modules = regions.map((region, index) => {
    const type = regionToModuleType(region);
    const definition = getModuleDefinition(type);
    return createTemplateModuleInstance(type, {
      id: region.id || MODULE_IDS[type],
      label: region.label || definition.label,
      tone: region.tone ?? definition.tone,
      x: region.x,
      y: region.y,
      w: region.w,
      h: region.h,
      zIndex: type === 'DrawingArea' ? 10 : 20 + index,
      locked: type === 'DrawingArea',
      movable: type !== 'DrawingArea',
      resizable: true,
    });
  });

  return ensureDrawingModule(modules);
}

function ensureDrawingModule(modules: TemplateModuleInstance[]): TemplateModuleInstance[] {
  const next = modules.slice();
  if (!next.some((module) => module.type === 'DrawingArea')) {
    next.unshift(createTemplateModuleInstance('DrawingArea'));
  }
  return next
    .map(clampTemplateModule)
    .sort((left, right) => left.zIndex - right.zIndex);
}

function normalizeRawModules(layout: TemplateLayout): TemplateModuleInstance[] {
  const rawModules = Array.isArray(layout.layout_json?.modules) ? layout.layout_json.modules : null;
  if (rawModules) {
    return ensureDrawingModule(
      rawModules
        .filter((module): module is TemplateModuleInstance => Boolean(module && module.type))
        .map((module) => createTemplateModuleInstance(module.type, module))
    );
  }
  return regionsToModules(layout.layout_json?.regions || []);
}

export function getTemplateModules(layout: TemplateLayout | null | undefined): TemplateModuleInstance[] {
  if (!layout) return [];
  return normalizeRawModules(layout);
}

export function normalizeTemplateLayout(layout: TemplateLayout): TemplateLayout {
  const pagePreset = normalizePagePreset(layout.page_preset, layout.orientation === 'portrait' ? 'Portrait' : 'Landscape');
  const pageDefinition = PAGE_PRESETS[pagePreset];
  const sourcePage = layout.layout_json?.page;
  const modules = normalizeRawModules(layout);

  return {
    ...layout,
    page_preset: pagePreset,
    orientation: sourcePage?.orientation || pageDefinition.orientation,
    layout_json: {
      ...layout.layout_json,
      id: layout.layout_json?.id || layout.slug,
      version: 2,
      page: {
        preset: normalizePagePreset(sourcePage?.preset, pagePreset),
        width: toFiniteNumber(sourcePage?.width, pageDefinition.width),
        height: toFiniteNumber(sourcePage?.height, pageDefinition.height),
        orientation: sourcePage?.orientation || pageDefinition.orientation,
      },
      modules,
      regions: modulesToRegions(modules),
    },
  };
}

export function validateTemplateLayout(layout: TemplateLayout): TemplateLayout {
  return normalizeTemplateLayout(layout);
}

const m = (
  type: TemplateModuleType,
  x: number,
  y: number,
  w: number,
  h: number,
  zIndex: number,
  overrides: Partial<TemplateModuleInstance> = {}
) => createTemplateModuleInstance(type, { x, y, w, h, zIndex, ...overrides });

function buildLandscapeModules(style: LayoutStyle): TemplateModuleInstance[] {
  if (style === 'auditMinimal') {
    return [
      m('Header', 3, 3, 94, 10, 20),
      m('EmergencyCall', 3, 16, 19, 10, 21),
      m('EvacuationInstructions', 3, 28, 19, 24, 22),
      m('FireInstructions', 3, 54, 19, 24, 23),
      m('DrawingArea', 25, 16, 57, 62, 10),
      m('Legend', 84, 16, 13, 28, 24),
      m('AssemblyMap', 84, 47, 13, 31, 25),
      m('ApprovalRevision', 3, 82, 94, 15, 26),
    ];
  }

  if (style === 'corporateIso') {
    return [
      m('Header', 3, 3, 94, 12, 20),
      m('DrawingArea', 4, 18, 65, 58, 10),
      m('Legend', 72, 18, 25, 17, 21),
      m('EmergencyCall', 72, 37, 25, 10, 22),
      m('EvacuationInstructions', 72, 49, 25, 27, 23),
      m('QrDocumentInfo', 4, 79, 16, 17, 24),
      m('EmergencyTeams', 22, 79, 35, 17, 25),
      m('ApprovalRevision', 59, 79, 38, 17, 26),
    ];
  }

  if (style === 'industrialPlant') {
    return [
      m('Header', 2, 2, 96, 9, 20),
      m('EmergencyCall', 2, 13, 18, 10, 21),
      m('HazardUtilities', 2, 25, 18, 19, 22),
      m('FireEquipmentInventory', 2, 46, 18, 16, 23),
      m('FireInstructions', 2, 64, 18, 16, 24),
      m('DrawingArea', 22, 13, 50, 67, 10),
      m('Legend', 74, 13, 24, 18, 25),
      m('AssemblyMap', 74, 33, 24, 18, 26),
      m('EmergencyTeams', 74, 53, 24, 13, 27),
      m('ApprovalRevision', 22, 83, 76, 14, 28),
    ];
  }

  if (style === 'publicSchool') {
    return [
      m('Header', 3, 3, 94, 10, 20),
      m('EmergencyCall', 3, 16, 20, 10, 21),
      m('EvacuationInstructions', 3, 28, 20, 32, 22),
      m('AccessibilityRefuge', 3, 62, 20, 15, 23),
      m('DrawingArea', 26, 16, 54, 61, 10),
      m('Legend', 82, 16, 15, 26, 24),
      m('AssemblyMap', 82, 44, 15, 33, 25),
      m('ApprovalRevision', 3, 81, 94, 16, 26),
    ];
  }

  if (style === 'mallVisitor') {
    return [
      m('Header', 2, 2, 96, 10, 20),
      m('EvacuationInstructions', 2, 14, 20, 20, 21),
      m('EmergencyCall', 2, 36, 20, 9, 22),
      m('Notes', 2, 47, 20, 13, 23),
      m('Legend', 2, 62, 20, 16, 24),
      m('DrawingArea', 24, 14, 55, 64, 10),
      m('AssemblyMap', 81, 14, 17, 30, 25),
      m('AccessibilityRefuge', 81, 46, 17, 16, 26),
      m('ApprovalRevision', 2, 82, 96, 15, 27),
    ];
  }

  if (style === 'healthAccessibility') {
    return [
      m('Header', 3, 3, 94, 10, 20),
      m('EmergencyCall', 3, 16, 19, 10, 21),
      m('AccessibilityRefuge', 3, 28, 19, 24, 22),
      m('EmergencyTeams', 3, 54, 19, 24, 23),
      m('DrawingArea', 25, 16, 55, 62, 10),
      m('Legend', 82, 16, 15, 22, 24),
      m('AssemblyMap', 82, 40, 15, 21, 25),
      m('EvacuationInstructions', 82, 63, 15, 15, 26),
      m('ApprovalRevision', 3, 82, 94, 15, 27),
    ];
  }

  if (style === 'constructionSite') {
    return [
      m('Header', 2, 2, 96, 9, 20),
      m('AssemblyMap', 2, 13, 23, 25, 21),
      m('HazardUtilities', 2, 40, 23, 21, 22),
      m('EmergencyCall', 2, 63, 23, 15, 23),
      m('DrawingArea', 27, 13, 47, 65, 10),
      m('Legend', 76, 13, 22, 18, 24),
      m('FireEquipmentInventory', 76, 33, 22, 17, 25),
      m('EvacuationInstructions', 76, 52, 22, 26, 26),
      m('ApprovalRevision', 2, 82, 96, 15, 27),
    ];
  }

  return [
    m('Header', 2, 2, 96, 9, 20),
    m('EmergencyCall', 2, 13, 18, 10, 21),
    m('QrDocumentInfo', 2, 25, 18, 13, 22),
    m('EvacuationInstructions', 2, 40, 18, 20, 23),
    m('FireInstructions', 2, 62, 18, 16, 24),
    m('DrawingArea', 22, 13, 50, 65, 10),
    m('Legend', 74, 13, 24, 16, 25),
    m('HazardUtilities', 74, 31, 24, 16, 26),
    m('AccessibilityRefuge', 74, 49, 24, 13, 27),
    m('EmergencyTeams', 74, 64, 24, 14, 28),
    m('ApprovalRevision', 2, 82, 96, 15, 29),
  ];
}

function buildPortraitModules(style: LayoutStyle): TemplateModuleInstance[] {
  if (style === 'premiumAudit' || style === 'industrialPlant' || style === 'constructionSite') {
    return [
      m('Header', 4, 2, 92, 8, 20),
      m('EmergencyCall', 4, 12, 26, 8, 21),
      m('Legend', 32, 12, 30, 8, 22),
      m('QrDocumentInfo', 64, 12, 32, 8, 23),
      m('DrawingArea', 4, 22, 92, 45, 10),
      m('HazardUtilities', 4, 69, 30, 12, 24),
      m('FireEquipmentInventory', 36, 69, 28, 12, 25),
      m('EmergencyTeams', 66, 69, 30, 12, 26),
      m('EvacuationInstructions', 4, 83, 44, 10, 27),
      m('ApprovalRevision', 50, 83, 46, 10, 28),
    ];
  }

  if (style === 'healthAccessibility' || style === 'publicSchool') {
    return [
      m('Header', 4, 2, 92, 8, 20),
      m('EmergencyCall', 4, 12, 28, 8, 21),
      m('AccessibilityRefuge', 34, 12, 30, 8, 22),
      m('Legend', 66, 12, 30, 8, 23),
      m('DrawingArea', 4, 22, 92, 47, 10),
      m('EvacuationInstructions', 4, 71, 44, 12, 24),
      m('AssemblyMap', 50, 71, 46, 12, 25),
      m('ApprovalRevision', 4, 85, 92, 10, 26),
    ];
  }

  return [
    m('Header', 4, 2, 92, 8, 20),
    m('EmergencyCall', 4, 12, 28, 8, 21),
    m('Legend', 34, 12, 30, 8, 22),
    m('AssemblyMap', 66, 12, 30, 8, 23),
    m('DrawingArea', 4, 22, 92, 48, 10),
    m('EvacuationInstructions', 4, 72, 44, 11, 24),
    m('FireInstructions', 50, 72, 46, 11, 25),
    m('ApprovalRevision', 4, 85, 92, 10, 26),
  ];
}

function buildTemplateModules(style: LayoutStyle, preset: PagePreset): TemplateModuleInstance[] {
  return preset === 'Portrait' ? buildPortraitModules(style) : buildLandscapeModules(style);
}

export function buildRegions(style: string): TemplateRegion[] {
  const safeStyle = isLayoutStyle(style) ? style : 'auditMinimal';
  return modulesToRegions(buildTemplateModules(safeStyle, 'Landscape'));
}

function isLayoutStyle(value: string): value is LayoutStyle {
  return [
    'auditMinimal',
    'corporateIso',
    'industrialPlant',
    'publicSchool',
    'mallVisitor',
    'healthAccessibility',
    'constructionSite',
    'premiumAudit',
  ].includes(value);
}

const TEMPLATE_FAMILIES: Array<{
  slug: string;
  name: string;
  category: string;
  description: string;
  style: LayoutStyle;
  accent: string;
  isPro: boolean;
  tags: string[];
}> = [
  {
    slug: 'audit-minimal',
    name: 'Denetim Minimal',
    category: 'DENETIM',
    description: 'Genis cizim alani, net onay, acil numara, talimat ve lejand dengesi.',
    style: 'auditMinimal',
    accent: '#059669',
    isPro: false,
    tags: ['ISO 23601:2020', 'ISO 7010:2019', 'OSHA EAP', 'TR Acil Durum'],
  },
  {
    slug: 'corporate-iso',
    name: 'Kurumsal ISO',
    category: 'KURUMSAL',
    description: 'Logo ve baslik agirlikli, resmi kurum dili ve belge kontrolu guclu yerlesim.',
    style: 'corporateIso',
    accent: '#0f766e',
    isPro: true,
    tags: ['ISO 23601:2020', 'ISO 7010:2019', 'Belge Kontrol'],
  },
  {
    slug: 'industrial-plant',
    name: 'Endustriyel Tesis',
    category: 'ENDUSTRI',
    description: 'Risk, utility, yangin ekipmani ve ekip modulleri onde olan tesis sablonu.',
    style: 'industrialPlant',
    accent: '#dc2626',
    isPro: true,
    tags: ['Risk', 'Utility', 'Yangin Ekipmani', 'ISO 7010:2019'],
  },
  {
    slug: 'public-school',
    name: 'Kamu / Okul',
    category: 'KAMU',
    description: 'Okunabilir talimatlar, toplanma alani ve erisilebilirlik bilgisi oncelikli.',
    style: 'publicSchool',
    accent: '#2563eb',
    isPro: false,
    tags: ['Kamu', 'Okul', 'Toplanma Alani', 'Erisilebilirlik'],
  },
  {
    slug: 'mall-visitor',
    name: 'AVM / Coklu Ziyaretci',
    category: 'ZIYARETCI',
    description: 'Ziyaretci yonlendirme, primary/secondary rota ve not alanlari vurgulu.',
    style: 'mallVisitor',
    accent: '#0284c7',
    isPro: true,
    tags: ['Ziyaretci', 'Alternatif Rota', 'Toplanma Alani'],
  },
  {
    slug: 'health-accessibility',
    name: 'Saglik / Erisilebilirlik',
    category: 'SAGLIK',
    description: 'Refakat, erisilebilir cikis, yardim noktasi ve ekip sorumlulugu one cikar.',
    style: 'healthAccessibility',
    accent: '#0891b2',
    isPro: true,
    tags: ['Erisilebilirlik', 'Refakat', 'Ilk Yardim', 'OSHA EAP'],
  },
  {
    slug: 'construction-site',
    name: 'Santiye / Gecici Alan',
    category: 'SAHA',
    description: 'Vaziyet, dis toplanma, risk ve kesme noktalari icin saha odakli kompozisyon.',
    style: 'constructionSite',
    accent: '#ea580c',
    isPro: true,
    tags: ['Santiye', 'Vaziyet', 'Risk', 'Utility'],
  },
  {
    slug: 'premium-audit',
    name: 'Premium Denetim',
    category: 'PREMIUM',
    description: 'QR, revizyon, ekip, risk ve checklist yogun resmi denetim sablonu.',
    style: 'premiumAudit',
    accent: '#0f172a',
    isPro: true,
    tags: ['Premium', 'QR', 'Revizyon', 'Denetim'],
  },
];

export const FALLBACK_TEMPLATE_LAYOUTS: TemplateLayout[] = TEMPLATE_FAMILIES.flatMap(
  (family, familyIndex) =>
    (Object.keys(PAGE_PRESETS) as PagePreset[]).map((preset, presetIndex) => {
      const page = PAGE_PRESETS[preset];
      const modules = buildTemplateModules(family.style, preset);
      const fullSlug = `${family.slug}-a3-${preset.toLowerCase()}`;

      return validateTemplateLayout({
        id: `fallback-v2-${familyIndex}-${presetIndex}`,
        slug: fullSlug,
        name: `${family.name} (${preset === 'Landscape' ? 'Yatay' : 'Dikey'})`,
        description: family.description,
        category: family.category,
        is_pro: family.isPro,
        page_preset: preset,
        orientation: page.orientation,
        layout_json: {
          id: fullSlug,
          style: family.style,
          accent: family.accent,
          version: 2,
          page: {
            preset,
            width: page.width,
            height: page.height,
            orientation: page.orientation,
          },
          modules,
          regions: modulesToRegions(modules),
        },
        thumbnail_json: {},
        compliance_tags: family.tags,
        version: 2,
        is_official: true,
      });
    })
);

export function getDefaultTemplateState(): TemplateState {
  return MODULE_DEFINITIONS.reduce<TemplateState>((state, definition) => {
    state[MODULE_IDS[definition.type]] = { ...definition.defaultState };
    return state;
  }, {});
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
