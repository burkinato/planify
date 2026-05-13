export type ElementType =
  | 'wall'
  | 'window'
  | 'door'
  | 'stairs'
  | 'elevator'
  | 'symbol'
  | 'route'
  | 'text'
  | 'rect'
  | 'rescue'
  | 'column';

export type EditorTheme = 'classic' | 'blueprint' | 'dark' | 'minimal';
export type ProjectTemplate = string;
export type PagePreset = 'Landscape' | 'Portrait';

export type TemplateRegionType =
  | 'header'
  | 'drawing'
  | 'instruction'
  | 'emergency'
  | 'legend'
  | 'assembly'
  | 'media'
  | 'approval'
  | 'team'
  | 'info';

export interface TemplateRegion {
  id: string;
  type: TemplateRegionType;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: 'green' | 'red' | 'blue' | 'info' | 'neutral' | 'paper';
}

export type TemplateModuleType =
  | 'Header'
  | 'Logo'
  | 'DrawingArea'
  | 'EmergencyCall'
  | 'EvacuationInstructions'
  | 'FireInstructions'
  | 'Legend'
  | 'AssemblyMap'
  | 'ApprovalRevision'
  | 'EmergencyTeams'
  | 'HazardUtilities'
  | 'AccessibilityRefuge'
  | 'FireEquipmentInventory'
  | 'QrDocumentInfo'
  | 'Notes';

export type TemplateModuleRequirement = 'required' | 'recommended' | 'optional';

export interface TemplateModuleGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TemplateModuleDefinition {
  id: string;
  type: TemplateModuleType;
  label: string;
  description: string;
  tone?: TemplateRegion['tone'];
  requirement: TemplateModuleRequirement;
  defaultRegion: TemplateModuleGeometry;
  minW: number;
  minH: number;
  rendererVariant: string;
  auditTags: string[];
  defaultState: TemplateRegionState;
}

export interface TemplateModuleInstance extends TemplateModuleGeometry {
  id: string;
  type: TemplateModuleType;
  label: string;
  tone?: TemplateRegion['tone'];
  zIndex: number;
  locked?: boolean;
  movable?: boolean;
  resizable?: boolean;
  rendererVariant?: string;
  requirement?: TemplateModuleRequirement;
}

export interface TemplateLayoutJson {
  id: string;
  style: string;
  accent: string;
  page: {
    preset: PagePreset;
    width: number;
    height: number;
    orientation: 'landscape' | 'portrait';
  };
  version?: 1 | 2;
  modules?: TemplateModuleInstance[];
  regions: TemplateRegion[];
}

export interface TemplateLayout {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  is_pro?: boolean;
  page_preset: PagePreset;
  orientation: 'landscape' | 'portrait';
  layout_json: TemplateLayoutJson;
  thumbnail_json: Record<string, unknown>;
  compliance_tags: string[];
  version: number;
  is_official: boolean;
}

export interface TemplateRegionState {
  title?: string;
  body?: string;
  meta?: string;
  imagePath?: string;
  imageUrl?: string;
  imageAlt?: string;
  mediaMode?: 'visual-first' | 'text-first';
  // Style properties
  titleSize?: number;
  titleWeight?: 'normal' | 'bold' | 'black';
  titleLetterSpacing?: number;
  titleLineHeight?: number;
  bodySize?: number;
  bodyWeight?: 'normal' | 'bold' | 'black';
  bodyLetterSpacing?: number;
  bodyLineHeight?: number;
  metaSize?: number;
  metaWeight?: 'normal' | 'bold' | 'black';
  metaLetterSpacing?: number;
  metaLineHeight?: number;
  gap?: number;
  titleColor?: string;
  bodyColor?: string;
  metaColor?: string;
}

export type TemplateState = Record<string, TemplateRegionState>;

export interface EditorElement {
  id: string;
  type: ElementType;
  layerId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  points?: number[];
  color?: string;
  label?: string;
  symbolType?: string;
  imageUrl?: string;
  startSymbol?: string;
  endSymbol?: string;
  routeType?: 'evacuation' | 'rescue';
  stairsType?: 'straight' | 'l-shape' | 'spiral' | 'core';
  wallStyle?: 'hatch' | 'solid' | 'double';
  columnShape?: 'rect' | 'circle';
  fontSize?: number;
  thickness?: number;
  doorSwing?: 'left' | 'right';
  windowPanes?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold' | 'black';
}

export interface LayerDef {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

export type MeasurementUnit = 'mm' | 'cm' | 'm';

export interface ScaleConfig {
  pixelsPerMeter: number;
  unit: MeasurementUnit;
}

export interface ProjectMetadata {
  name: string;
  author: string;
  date: string;
  revision: string;
  logoUrl?: string;
  floor?: string;
  scale?: string;
}

export type EditorTool =
  | 'select'
  | 'wall'
  | 'window'
  | 'door'
  | 'stairs'
  | 'elevator'
  | 'rect'
  | 'column'
  | 'evacuation-route'
  | 'rescue-route'
  | 'symbol'
  | 'text'
  | 'eraser'
  | 'scale';

export type StairType = 'straight' | 'l-shape' | 'spiral' | 'core';

export interface WallToolOptions {
  style: 'hatch' | 'solid' | 'double';
  thickness: number;
}

export interface DoorToolOptions {
  width: number;
  swingDirection: 'left' | 'right' | 'double';
  doorType: 'single' | 'double';
}

export interface WindowToolOptions {
  width: number;
  height: number;
  panes: number;
}

export interface StairsToolOptions {
  stairsType: StairType;
  width: number;
  height: number;
}

export interface ElevatorToolOptions {
  width: number;
  height: number;
  elevatorType: 'passenger' | 'freight';
}

export interface ColumnToolOptions {
  size: number;
  shape: 'round' | 'square';
}

export interface TextToolOptions {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'black';
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface RouteToolOptions {
  lineStyle: 'solid' | 'dashed';
  width: number;
  color: string;
}

export interface ToolOptions {
  wall: WallToolOptions;
  door: DoorToolOptions;
  window: WindowToolOptions;
  stairs: StairsToolOptions;
  elevator: ElevatorToolOptions;
  column: ColumnToolOptions;
  text: TextToolOptions;
  'evacuation-route': RouteToolOptions;
  'rescue-route': RouteToolOptions;
  rect: { width: number; height: number; color: string };
  symbol: { symbolId: string | null };
  scale: { pixelsPerMeter: number; unit: MeasurementUnit };
  eraser: Record<string, never>;
  select: Record<string, never>;
}

export type SymbolCategory = 'E_ACIL' | 'F_YANGIN' | 'E_SAGLIK' | 'W_TEHLIKE' | 'P_YASAK' | 'M_ZORUNLU' | 'N_NAVIGASYON' | 'X_OPERASYON';

export interface SymbolTemplate {
  id: string;
  name: string;
  nameEn?: string;
  color: string;
  shape: 'square' | 'circle' | 'here' | 'none';
  category: SymbolCategory;
  iconName?: string;
}

export interface CustomSymbol {
  id: string;
  name: string;
  nameEn?: string;
  dataUrl: string;
  width?: number;
  height?: number;
}

export const SYMBOLS: SymbolTemplate[] = [
  { id: 'E001', name: 'Çıkış (Sağ)', nameEn: 'Exit (Right)', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'ArrowRightSquare' },
  { id: 'E002', name: 'Çıkış (Sol)', nameEn: 'Exit (Left)', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'ArrowLeftSquare' },
  { id: 'E003', name: 'Acil Çıkış Kapısı', nameEn: 'Emergency Exit Door', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'DoorOpen' },
  { id: 'E004', name: 'Buradasınız', nameEn: 'You Are Here', color: '#050b16', shape: 'square', category: 'E_ACIL', iconName: 'MapPin' },
  { id: 'E005', name: 'Çıkış (Yukarı)', nameEn: 'Exit (Up)', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'ArrowUpSquare' },
  { id: 'E006', name: 'Çıkış (Aşağı)', nameEn: 'Exit (Down)', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'ArrowDownSquare' },
  { id: 'E007', name: 'Toplanma Noktası', nameEn: 'Assembly Point', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'Users' },
  { id: 'E008', name: 'Acil Telefon', nameEn: 'Emergency Phone', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'PhoneCall' },
  { id: 'E009', name: 'Acil Sedye', nameEn: 'Stretcher', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'Bed' },
  { id: 'E010', name: 'Yön Oku', nameEn: 'Direction Arrow', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'ArrowRight' },
  { id: 'E011', name: 'Engelli Alanı', nameEn: 'Accessibility Area', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'Accessibility' },
  { id: 'E012', name: 'Acil Asansör', nameEn: 'Emergency Elevator', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'ArrowUpDown' },
  { id: 'E013', name: 'Acil Aydınlatma', nameEn: 'Emergency Lighting', color: '#008F4C', shape: 'square', category: 'E_ACIL', iconName: 'Lightbulb' },
  { id: 'F001', name: 'Yangın Söndürücü', nameEn: 'Fire Extinguisher', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Flame' },
  { id: 'F002', name: 'Yangın Hortumu', nameEn: 'Fire Hose', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Waves' },
  { id: 'F003', name: 'Yangın Merdiveni', nameEn: 'Fire Escape', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'List' },
  { id: 'F004', name: 'Alarm Butonu', nameEn: 'Alarm Button', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Bell' },
  { id: 'F005', name: 'Yangın Hidrantı', nameEn: 'Fire Hydrant', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Droplet' },
  { id: 'F006', name: 'Yangın Dolabı', nameEn: 'Fire Cabinet', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Archive' },
  { id: 'F007', name: 'Sprinkler', nameEn: 'Sprinkler', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'CloudRain' },
  { id: 'F008', name: 'Yangın Paneli', nameEn: 'Fire Panel', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Activity' },
  { id: 'F009', name: 'Yangın Battaniyesi', nameEn: 'Fire Blanket', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Layers' },
  { id: 'F010', name: 'Köpük Söndürücü', nameEn: 'Foam Extinguisher', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'SprayCan' },
  { id: 'F011', name: 'CO2 Tüpü', nameEn: 'CO2 Cylinder', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Cylinder' },
  { id: 'F012', name: 'Gaz Kesme Vanası', nameEn: 'Gas Shut-off Valve', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Wrench' },
  { id: 'F013', name: 'Duman Dedektörü', nameEn: 'Smoke Detector', color: '#E81123', shape: 'square', category: 'F_YANGIN', iconName: 'Radar' },
  { id: 'E020', name: 'İlk Yardım', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'Cross' },
  { id: 'E021', name: 'İlk Yardım Dolabı', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'BriefcaseMedical' },
  { id: 'E022', name: 'İlk Yardım Çantası', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'Bandage' },
  { id: 'E023', name: 'Göz Yıkama', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'Eye' },
  { id: 'E024', name: 'Acil Duş', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'ShowerHead' },
  { id: 'E025', name: 'Defibrilatör', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'HeartPulse' },
  { id: 'E026', name: 'Sedye', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'Bed' },
  { id: 'E027', name: 'Medikal Oda', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'Hospital' },
  { id: 'E028', name: 'Oksijen Tüpü', color: '#008F4C', shape: 'square', category: 'E_SAGLIK', iconName: 'Wind' },
  { id: 'W001', name: 'Yanıcı Madde', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'Flame' },
  { id: 'W002', name: 'Patlayıcı', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'Bomb' },
  { id: 'W003', name: 'Toksik', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'Skull' },
  { id: 'W004', name: 'Aşındırıcı', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'Droplet' },
  { id: 'W005', name: 'Biyolojik', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'Biohazard' },
  { id: 'W006', name: 'Radyasyon', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'Radiation' },
  { id: 'W007', name: 'Elektrik Tehlikesi', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'Zap' },
  { id: 'W008', name: 'Kaygan Zemin', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'AlertTriangle' },
  { id: 'W009', name: 'Düşme Tehlikesi', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'ArrowDown' },
  { id: 'W010', name: 'Kimyasal Depo', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE', iconName: 'FlaskConical' },
  // P Serisi — Yasak İşaretleri (ISO 7010)
  { id: 'P001', name: 'Sigara İçilmez', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'CigaretteOff' },
  { id: 'P002', name: 'Açık Alev Yasak', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'Flame' },
  { id: 'P003', name: 'Yaya Geçişi Yasak', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'PersonStanding' },
  { id: 'P004', name: 'Su İle Söndürme Yasak', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'Droplet' },
  { id: 'P005', name: 'İçme Suyu Değil', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'CupSoda' },
  { id: 'P006', name: 'Asansör Kullanma', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'ArrowUpDown' },
  { id: 'P007', name: 'Forklift Geçişi Yasak', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'Truck' },
  { id: 'P008', name: 'Dokunma Yasak', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'Hand' },
  { id: 'P009', name: 'Cep Telefonu Yasak', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'PhoneOff' },
  { id: 'P010', name: 'Giriş Yasak', color: '#E81123', shape: 'circle', category: 'P_YASAK', iconName: 'Ban' },
  // M Serisi — Zorunluluk İşaretleri (ISO 7010)
  { id: 'M001', name: 'Koruyucu Gözlük', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'Glasses' },
  { id: 'M002', name: 'Baret Tak', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'HardHat' },
  { id: 'M003', name: 'Kulaklık Tak', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'Headphones' },
  { id: 'M004', name: 'Gaz Maskesi Tak', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'Mask' },
  { id: 'M005', name: 'Koruyucu Eldiven', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'Hand' },
  { id: 'M006', name: 'Koruyucu Ayakkabı', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'Footprints' },
  { id: 'M007', name: 'Koruyucu Giysi', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'Shirt' },
  { id: 'M008', name: 'Yüz Siperi', color: '#0066CC', shape: 'circle', category: 'M_ZORUNLU', iconName: 'Shield' },
  // N Serisi — Navigasyon / Plan Unsurları
  { id: 'N001', name: 'Kuzey Oku', color: '#1e293b', shape: 'none', category: 'N_NAVIGASYON', iconName: 'Compass' },
  { id: 'N002', name: 'Ölçek Çubuğu', color: '#1e293b', shape: 'none', category: 'N_NAVIGASYON', iconName: 'Ruler' },
  { id: 'N003', name: 'Acil Çıkış Kapısı', color: '#008F4C', shape: 'square', category: 'N_NAVIGASYON', iconName: 'DoorOpen' },
  { id: 'N004', name: 'Engelli Rampa', color: '#0066CC', shape: 'square', category: 'N_NAVIGASYON', iconName: 'Accessibility' },
  { id: 'N005', name: 'Merdiven Yönü', color: '#008F4C', shape: 'square', category: 'N_NAVIGASYON', iconName: 'ArrowUp' },
  // X Serisi — Operasyon & Tesis
  { id: 'X001', name: 'Acil Durum Kiti', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'FirstAid' },
  { id: 'X002', name: 'Deprem Kiti', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Package' },
  { id: 'X003', name: 'Kimyasal Müdahale', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'FlaskConical' },
  { id: 'X004', name: 'Biyolojik Kit', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Biohazard' },
  { id: 'X005', name: 'Elektrik Müdahale', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Zap' },
  { id: 'X010', name: 'Elektrik Panosu', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Server' },
  { id: 'X011', name: 'Server Odası', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Server' },
  { id: 'X012', name: 'CCTV Kamera', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Cctv' },
  { id: 'X013', name: 'Güvenlik Odası', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'ShieldCheck' },
  { id: 'X014', name: 'Kartlı Geçiş', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'CreditCard' },
  { id: 'X020', name: 'Jeneratör', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'BatteryCharging' },
  { id: 'X021', name: 'UPS', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Battery' },
  { id: 'X022', name: 'Gaz Vanası', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Wrench' },
  { id: 'X023', name: 'Su Vanası', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Droplet' },
  { id: 'X024', name: 'HVAC', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Fan' },
  { id: 'X030', name: 'Forklift Alanı', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Truck' },
  { id: 'X031', name: 'Yükleme Alanı', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Package' },
  { id: 'X032', name: 'Depo Alanı', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Archive' },
  { id: 'X033', name: 'Tehlikeli Atık', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Trash2' },
  { id: 'X034', name: 'Kimyasal Tank', color: '#00539C', shape: 'square', category: 'X_OPERASYON', iconName: 'Cylinder' },
];

export const SNAP_DISTANCE = 15;
export const GRID_SIZE = 50;

export const THEME_CONFIGS = {
  classic: { bg: '#ffffff', grid: '#f1f5f9', text: '#050b16', accent: '#008F4C' },
  blueprint: { bg: '#050b16', grid: '#1e293b', text: '#ffffff', accent: '#00539C' },
  dark: { bg: '#06060a', grid: '#10101c', text: '#94a3b8', accent: '#008F4C' },
  minimal: { bg: '#f8fafc', grid: 'transparent', text: '#334155', accent: '#050b16' }
};
