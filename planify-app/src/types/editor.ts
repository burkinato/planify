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

export type SymbolCategory = 'E_ACIL' | 'F_YANGIN' | 'E_SAGLIK' | 'W_TEHLIKE' | 'X_OPERASYON';

export interface SymbolTemplate {
  id: string;
  name: string;
  color: string;
  shape: 'square' | 'circle' | 'here' | 'none';
  category: SymbolCategory;
}

export interface CustomSymbol {
  id: string;
  name: string;
  dataUrl: string;
  width?: number;
  height?: number;
}

export const SYMBOLS: SymbolTemplate[] = [
  { id: 'E001', name: 'Çıkış (Sağ)', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E002', name: 'Çıkış (Sol)', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E003', name: 'Acil Çıkış Kapısı', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E004', name: 'Buradasınız', color: '#050b16', shape: 'square', category: 'E_ACIL' },
  { id: 'E005', name: 'Çıkış (Yukarı)', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E006', name: 'Çıkış (Aşağı)', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E007', name: 'Toplanma Noktası', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E008', name: 'Acil Telefon', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E009', name: 'Acil Sedye', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E010', name: 'Yön Oku', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E011', name: 'Engelli Alanı', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E012', name: 'Acil Asansör', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'E013', name: 'Acil Aydınlatma', color: '#008F4C', shape: 'square', category: 'E_ACIL' },
  { id: 'F001', name: 'Yangın Söndürücü', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F002', name: 'Yangın Hortumu', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F003', name: 'Yangın Merdiveni', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F004', name: 'Alarm Butonu', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F005', name: 'Yangın Hidrantı', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F006', name: 'Yangın Dolabı', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F007', name: 'Sprinkler', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F008', name: 'Yangın Paneli', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F009', name: 'Yangın Battaniyesi', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F010', name: 'Köpük Söndürücü', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F011', name: 'CO2 Tüpü', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F012', name: 'Gaz Kesme Vanası', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'F013', name: 'Duman Dedektörü', color: '#E81123', shape: 'square', category: 'F_YANGIN' },
  { id: 'E020', name: 'İlk Yardım', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E021', name: 'İlk Yardım Dolabı', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E022', name: 'İlk Yardım Çantası', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E023', name: 'Göz Yıkama', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E024', name: 'Acil Duş', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E025', name: 'Defibrilatör', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E026', name: 'Sedye', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E027', name: 'Medikal Oda', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'E028', name: 'Oksijen Tüpü', color: '#008F4C', shape: 'square', category: 'E_SAGLIK' },
  { id: 'W001', name: 'Yanıcı Madde', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W002', name: 'Patlayıcı', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W003', name: 'Toksik', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W004', name: 'Aşındırıcı', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W005', name: 'Biyolojik', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W006', name: 'Radyasyon', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W007', name: 'Elektrik Tehlikesi', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W008', name: 'Kaygan Zemin', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W009', name: 'Düşme Tehlikesi', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'W010', name: 'Kimyasal Depo', color: '#FFD700', shape: 'square', category: 'W_TEHLIKE' },
  { id: 'X001', name: 'Acil Durum Kiti', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X002', name: 'Deprem Kiti', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X003', name: 'Kimyasal Müdahale', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X004', name: 'Biyolojik Kit', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X005', name: 'Elektrik Müdahale', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X010', name: 'Elektrik Panosu', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X011', name: 'Server Odası', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X012', name: 'CCTV Kamera', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X013', name: 'Güvenlik Odası', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X014', name: 'Kartlı Geçiş', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X020', name: 'Jeneratör', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X021', name: 'UPS', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X022', name: 'Gaz Vanası', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X023', name: 'Su Vanası', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X024', name: 'HVAC', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X030', name: 'Forklift Alanı', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X031', name: 'Yükleme Alanı', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X032', name: 'Depo Alanı', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X033', name: 'Tehlikeli Atık', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
  { id: 'X034', name: 'Kimyasal Tank', color: '#00539C', shape: 'square', category: 'X_OPERASYON' },
];

export const SNAP_DISTANCE = 15;
export const GRID_SIZE = 50;

export const THEME_CONFIGS = {
  classic: { bg: '#ffffff', grid: '#f1f5f9', text: '#050b16', accent: '#008F4C' },
  blueprint: { bg: '#050b16', grid: '#1e293b', text: '#ffffff', accent: '#00539C' },
  dark: { bg: '#06060a', grid: '#10101c', text: '#94a3b8', accent: '#008F4C' },
  minimal: { bg: '#f8fafc', grid: 'transparent', text: '#334155', accent: '#050b16' }
};
