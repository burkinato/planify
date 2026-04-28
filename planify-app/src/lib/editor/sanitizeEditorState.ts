import type {
  EditorElement,
  LayerDef,
  PagePreset,
  ProjectTemplate,
  ScaleConfig,
  TemplateRegionState,
  TemplateState,
  ProjectMetadata,
} from '@/types/editor';

const DEFAULT_LAYER_ID = 'default';

const VALID_ELEMENT_TYPES = new Set<EditorElement['type']>([
  'wall',
  'window',
  'door',
  'stairs',
  'elevator',
  'symbol',
  'route',
  'text',
  'rect',
  'rescue',
  'column',
]);

const VALID_ROUTE_TYPES = new Set<NonNullable<EditorElement['routeType']>>([
  'evacuation',
  'rescue',
]);

const VALID_STAIRS_TYPES = new Set<NonNullable<EditorElement['stairsType']>>([
  'straight',
  'l-shape',
  'spiral',
  'core',
]);

const VALID_WALL_STYLES = new Set<NonNullable<EditorElement['wallStyle']>>([
  'hatch',
  'solid',
  'double',
]);

const VALID_COLUMN_SHAPES = new Set<NonNullable<EditorElement['columnShape']>>([
  'rect',
  'circle',
]);

const VALID_FONT_WEIGHTS = new Set<NonNullable<EditorElement['fontWeight']>>([
  'normal',
  'bold',
  'black',
]);

const VALID_TEXT_ALIGN = new Set<NonNullable<EditorElement['textAlign']>>([
  'left',
  'center',
  'right',
]);

const VALID_PAGE_PRESETS = new Set<PagePreset>(['Landscape', 'Portrait']);
const VALID_SCALE_UNITS = new Set<ScaleConfig['unit']>(['mm', 'cm', 'm']);

type UnknownRecord = Record<string, unknown>;

export interface DebugEditorStatePayload {
  elements: EditorElement[];
  layers: LayerDef[];
  scaleConfig: ScaleConfig;
  projectTemplate: ProjectTemplate;
  templateLayoutId: string | null;
  pagePreset: PagePreset;
  templateState: TemplateState;
  projectMetadata: ProjectMetadata;
  innerZoom: number;
  innerPan: { x: number; y: number };
  selectedIds: string[];
  invalidChildren: Array<Record<string, unknown>>;
  invalidChildrenText: string | null;
  location: string | null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asFiniteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asPositiveNumber(value: unknown, fallback: number | undefined = undefined) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function asEnumValue<T extends string>(value: unknown, values: Set<T>): T | undefined {
  return typeof value === 'string' && values.has(value as T) ? (value as T) : undefined;
}

function sanitizePoints(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const points = value.filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry));
  return points.length >= 4 ? points : undefined;
}

function sanitizeTemplateRegionState(value: unknown): TemplateRegionState {
  if (!isRecord(value)) return {};

  const nextState: TemplateRegionState = {};

  if (typeof value.title === 'string') nextState.title = value.title;
  if (typeof value.body === 'string') nextState.body = value.body;
  if (typeof value.meta === 'string') nextState.meta = value.meta;
  if (typeof value.imagePath === 'string') nextState.imagePath = value.imagePath;
  if (typeof value.imageUrl === 'string') nextState.imageUrl = value.imageUrl;
  if (typeof value.imageAlt === 'string') nextState.imageAlt = value.imageAlt;
  if (value.mediaMode === 'visual-first' || value.mediaMode === 'text-first') {
    nextState.mediaMode = value.mediaMode;
  }

  return nextState;
}

export function sanitizeTemplateState(value: unknown): TemplateState {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => typeof key === 'string' && key.length > 0)
      .map(([key, regionValue]) => [key, sanitizeTemplateRegionState(regionValue)])
  );
}

export function sanitizeProjectMetadata(value: unknown): ProjectMetadata {
  const raw = isRecord(value) ? value : {};
  return {
    name: asString(raw.name, 'İSİMSİZ PROJE'),
    author: asString(raw.author, ''),
    date: asString(raw.date, new Date().toLocaleDateString('tr-TR')),
    revision: asString(raw.revision, '00'),
    logoUrl: asNullableString(raw.logoUrl) ?? undefined,
  };
}

export function sanitizeLayers(value: unknown): LayerDef[] {
  const source = Array.isArray(value) ? value : [];

  const sanitized = source
    .map((entry, index): LayerDef | null => {
      if (!isRecord(entry)) return null;

      const id = asString(entry.id);
      if (!id) return null;

      return {
        id,
        name: asString(entry.name, `Katman ${index + 1}`),
        visible: entry.visible !== false,
        locked: entry.locked === true,
        order: asFiniteNumber(entry.order, index),
      };
    })
    .filter((layer): layer is LayerDef => layer !== null);

  if (!sanitized.some((layer) => layer.id === DEFAULT_LAYER_ID)) {
    sanitized.unshift({
      id: DEFAULT_LAYER_ID,
      name: 'Ana Katman',
      visible: true,
      locked: false,
      order: 0,
    });
  }

  return sanitized
    .sort((left, right) => left.order - right.order)
    .map((layer, index) => ({ ...layer, order: index }));
}

export function sanitizeScaleConfig(value: unknown): ScaleConfig {
  const raw = isRecord(value) ? value : {};
  const unit = asEnumValue(raw.unit, VALID_SCALE_UNITS) ?? 'm';
  const pixelsPerMeter = asPositiveNumber(raw.pixelsPerMeter, 50) ?? 50;

  return { unit, pixelsPerMeter };
}

export function sanitizeEditorElement(
  value: unknown,
  validLayerIds: Set<string>
): EditorElement | null {
  if (!isRecord(value)) return null;

  const rawType = asString(value.type);
  const normalizedType = rawType === 'rescue' ? 'route' : rawType;

  if (!VALID_ELEMENT_TYPES.has(rawType as EditorElement['type']) && normalizedType !== 'route') {
    return null;
  }

  const id = asString(value.id);
  if (!id) return null;

  const layerId = validLayerIds.has(asString(value.layerId)) ? asString(value.layerId) : DEFAULT_LAYER_ID;
  const points = sanitizePoints(value.points);
  const type = (normalizedType === 'route' ? 'route' : normalizedType) as EditorElement['type'];

  if ((type === 'wall' || type === 'window' || type === 'door' || type === 'route') && !points) {
    return null;
  }

  const nextElement: EditorElement = {
    id,
    type,
    layerId,
    x: asFiniteNumber(value.x, 0),
    y: asFiniteNumber(value.y, 0),
  };

  if (typeof value.width === 'number' && Number.isFinite(value.width)) nextElement.width = value.width;
  if (typeof value.height === 'number' && Number.isFinite(value.height)) nextElement.height = value.height;
  if (typeof value.rotation === 'number' && Number.isFinite(value.rotation)) nextElement.rotation = value.rotation;
  if (points) nextElement.points = points;
  if (typeof value.color === 'string') nextElement.color = value.color;
  if (typeof value.label === 'string') nextElement.label = value.label;
  if (typeof value.symbolType === 'string') nextElement.symbolType = value.symbolType;
  if (typeof value.imageUrl === 'string') nextElement.imageUrl = value.imageUrl;
  if (typeof value.startSymbol === 'string') nextElement.startSymbol = value.startSymbol;
  if (typeof value.endSymbol === 'string') nextElement.endSymbol = value.endSymbol;
  if (typeof value.fontSize === 'number' && Number.isFinite(value.fontSize)) nextElement.fontSize = value.fontSize;
  if (typeof value.thickness === 'number' && Number.isFinite(value.thickness)) nextElement.thickness = value.thickness;
  if (typeof value.windowPanes === 'number' && Number.isFinite(value.windowPanes)) nextElement.windowPanes = value.windowPanes;

  const routeType = asEnumValue(value.routeType, VALID_ROUTE_TYPES);
  if (type === 'route') nextElement.routeType = routeType ?? (rawType === 'rescue' ? 'rescue' : 'evacuation');

  const stairsType = asEnumValue(value.stairsType, VALID_STAIRS_TYPES);
  if (stairsType) nextElement.stairsType = stairsType;

  const wallStyle = asEnumValue(value.wallStyle, VALID_WALL_STYLES);
  if (wallStyle) nextElement.wallStyle = wallStyle;

  const columnShape = asEnumValue(value.columnShape, VALID_COLUMN_SHAPES);
  if (columnShape) nextElement.columnShape = columnShape;

  if (value.doorSwing === 'left' || value.doorSwing === 'right') nextElement.doorSwing = value.doorSwing;

  const textAlign = asEnumValue(value.textAlign, VALID_TEXT_ALIGN);
  if (textAlign) nextElement.textAlign = textAlign;

  const fontWeight = asEnumValue(value.fontWeight, VALID_FONT_WEIGHTS);
  if (fontWeight) nextElement.fontWeight = fontWeight;

  return nextElement;
}

export function sanitizeEditorElements(value: unknown, layers: LayerDef[]): EditorElement[] {
  const validLayerIds = new Set(layers.map((layer) => layer.id));
  const source = Array.isArray(value) ? value : [];

  return source
    .map((entry) => sanitizeEditorElement(entry, validLayerIds))
    .filter((element): element is EditorElement => element !== null);
}

export function sanitizeDebugEditorStatePayload(value: unknown): DebugEditorStatePayload {
  const raw = isRecord(value) ? value : {};
  const layers = sanitizeLayers(raw.layers);
  const elements = sanitizeEditorElements(raw.elements, layers);
  const elementIds = new Set(elements.map((element) => element.id));

  const invalidChildren = Array.isArray(raw.invalidChildren)
    ? raw.invalidChildren.filter(isRecord).map((entry) => ({ ...entry }))
    : [];

  const selectedIds = Array.isArray(raw.selectedIds)
    ? raw.selectedIds.filter((entry): entry is string => typeof entry === 'string' && elementIds.has(entry))
    : [];

  return {
    elements,
    layers,
    scaleConfig: sanitizeScaleConfig(raw.scaleConfig),
    projectTemplate: asString(raw.projectTemplate, 'blank'),
    templateLayoutId: asNullableString(raw.templateLayoutId),
    pagePreset: VALID_PAGE_PRESETS.has(raw.pagePreset as PagePreset) ? (raw.pagePreset as PagePreset) : 'Landscape',
    templateState: sanitizeTemplateState(raw.templateState),
    projectMetadata: sanitizeProjectMetadata(raw.projectMetadata),
    innerZoom: asPositiveNumber(raw.innerZoom, 1) ?? 1,
    innerPan: isRecord(raw.innerPan) ? {
      x: asFiniteNumber(raw.innerPan.x, 0),
      y: asFiniteNumber(raw.innerPan.y, 0)
    } : { x: 0, y: 0 },
    selectedIds,
    invalidChildren,
    invalidChildrenText: asNullableString(raw.invalidChildrenText),
    location: asNullableString(raw.location),
  };
}
