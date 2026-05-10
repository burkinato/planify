'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
export { useShallow } from 'zustand/react/shallow';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type {
  EditorElement,
  EditorTool,
  LayerDef,
  ScaleConfig,
  EditorTheme,
  CustomSymbol,
  ProjectTemplate,
  PagePreset,
  TemplateLayout,
  TemplateModuleInstance,
  TemplateModuleType,
  TemplateState,
  TemplateRegionState,
  ProjectMetadata,
  ToolOptions,
  WallToolOptions,
  DoorToolOptions,
  WindowToolOptions,
  StairsToolOptions,
  ElevatorToolOptions,
  ColumnToolOptions,
  TextToolOptions,
  RouteToolOptions,
} from '@/types/editor';
import {
  sanitizeDebugEditorStatePayload,
  sanitizeEditorElements,
  sanitizeLayers,
  sanitizeScaleConfig,
  sanitizeTemplateModules,
  sanitizeTemplateState,
} from '@/lib/editor/sanitizeEditorState';
import {
  clampTemplateModule,
  createTemplateModuleInstance,
  getModuleDefinition,
  getTemplateModules,
  normalizePagePreset,
  normalizeTemplateLayout,
} from '@/lib/editor/templateLayouts';

// Samet (P1 Fix): Debounce utility for localStorage writes
let saveElementsTimer: ReturnType<typeof setTimeout> | null = null;
let saveLayersTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 500; // 500ms debounce for localStorage writes

const debouncedSaveElements = (elements: EditorElement[]) => {
  if (saveElementsTimer) clearTimeout(saveElementsTimer);
  saveElementsTimer = setTimeout(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('planify-elements', JSON.stringify(elements));
    }
  }, DEBOUNCE_DELAY);
};

const debouncedSaveLayers = (layers: LayerDef[]) => {
  if (saveLayersTimer) clearTimeout(saveLayersTimer);
  saveLayersTimer = setTimeout(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('planify-layers', JSON.stringify(layers));
    }
  }, DEBOUNCE_DELAY);
};

interface HistorySnapshot {
  elements: EditorElement[];
  layers: LayerDef[];
  templateModules?: TemplateModuleInstance[];
}

interface EditorState {
  elements: EditorElement[];
  layers: LayerDef[];
  customSymbols: CustomSymbol[];
  clipboard: EditorElement[];
  activeLayerId: string;
  selectedIds: string[];
  tool: EditorTool;
  zoom: number;
  pan: { x: number; y: number };
  gridVisible: boolean;
  selectedSymbol: string | null;
  scaleConfig: ScaleConfig;
  editorTheme: EditorTheme;
  projectTemplate: ProjectTemplate;
  templateLayoutId: string | null;
  activeTemplateLayout: TemplateLayout | null;
  pagePreset: PagePreset;
  templateModules: TemplateModuleInstance[];
  selectedTemplateModuleId: string | null;
  templateState: TemplateState;
  focusedRegionId: string | null;
  projectMetadata: ProjectMetadata;
  innerZoom: number;
  innerPan: { x: number; y: number };
  moduleSnapLines: Array<{ axis: 'x' | 'y'; pos: number }>;
  canUndo: boolean;
  canRedo: boolean;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  advancedType: 'title' | 'body' | 'meta' | 'content' | null;
  projectId: string | null;
  toolOptions: ToolOptions;
  recentTools: EditorTool[];
  language: 'tr' | 'en';
  onboardingVisible: boolean;
  hasCompletedOnboarding: boolean;
  tourVisible: boolean;
  tourStep: number;
  isModuleEditDrawerOpen: boolean;
  isModuleAddDrawerOpen: boolean;

  // Actions
  setProjectId: (id: string | null) => void;
  setTool: (tool: EditorTool) => void;
  setSelectedIds: (ids: string[]) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setInnerZoom: (zoom: number) => void;
  setInnerPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setGridVisible: (visible: boolean) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  setScaleConfig: (config: ScaleConfig) => void;
  setEditorTheme: (theme: EditorTheme) => void;
  setProjectTemplate: (template: ProjectTemplate) => void;
  setTemplateLayout: (layout: TemplateLayout | null) => void;
  setPagePreset: (preset: PagePreset) => void;
  setTemplateModules: (modules: TemplateModuleInstance[]) => void;
  addTemplateModule: (type: TemplateModuleType, placement?: Partial<Pick<TemplateModuleInstance, 'x' | 'y' | 'w' | 'h'>>) => void;
  updateTemplateModule: (id: string, updates: Partial<TemplateModuleInstance>) => void;
  removeTemplateModule: (id: string) => void;
  setSelectedTemplateModuleId: (id: string | null) => void;
  setTemplateState: (state: TemplateState) => void;
  updateTemplateRegion: (regionId: string, updates: TemplateRegionState) => void;
  setProjectMetadata: (metadata: Partial<ProjectMetadata>) => void;
  setFocusedRegionId: (id: string | null) => void;
  setIsModuleEditDrawerOpen: (open: boolean) => void;
  setIsModuleAddDrawerOpen: (open: boolean) => void;
  setModuleSnapLines: (lines: Array<{ axis: 'x' | 'y'; pos: number }>) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  addLayer: (name: string) => void;
  removeLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  addCustomSymbol: (symbol: CustomSymbol) => void;
  addElement: (element: Partial<EditorElement>) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  updateElementsBatch: (updates: { id: string; changes: Partial<EditorElement> }[]) => void;
  removeElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  copySelection: () => void;
  pasteSelection: () => void;
  loadProject: (json: string) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  setAdvancedType: (type: 'title' | 'body' | 'meta' | 'content' | null) => void;
  updateToolOptions: (tool: EditorTool, options: Partial<Record<string, unknown>>) => void;
  updateRecentTools: (tool: EditorTool) => void;
  setLanguage: (lang: 'tr' | 'en') => void;
  setOnboardingVisible: (visible: boolean) => void;
  completeOnboarding: () => void;
  setTourVisible: (visible: boolean) => void;
  setTourStep: (step: number) => void;
}

const DEFAULT_LAYER: LayerDef = {
  id: 'default',
  name: 'Ana Katman',
  visible: true,
  locked: false,
  order: 0,
};

const getDefaultToolOptions = (): ToolOptions => ({
  wall: { style: 'hatch', thickness: 12 },
  door: { width: 80, swingDirection: 'right', doorType: 'single' },
  window: { width: 100, height: 10, panes: 2 },
  stairs: { stairsType: 'straight', width: 100, height: 130 },
  elevator: { width: 150, height: 150, elevatorType: 'passenger' },
  column: { size: 40, shape: 'square' },
  text: { fontSize: 16, fontWeight: 'bold', color: '#050b16', textAlign: 'left' },
  'evacuation-route': { lineStyle: 'solid', width: 3, color: '#008F4C' },
  'rescue-route': { lineStyle: 'dashed', width: 3, color: '#E81123' },
  rect: { width: 100, height: 100, color: '#050b16' },
  symbol: { symbolId: null },
  scale: { pixelsPerMeter: 50, unit: 'm' },
  eraser: {},
  select: {},
});

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      elements: [] as EditorElement[],
      layers: [DEFAULT_LAYER],
      clipboard: [] as EditorElement[],
      customSymbols: [] as CustomSymbol[],
      scaleConfig: { pixelsPerMeter: 50, unit: 'm' } as ScaleConfig,
      editorTheme: 'dark' as EditorTheme,
      projectTemplate: 'blank' as ProjectTemplate,
      templateLayoutId: null as string | null,
      activeTemplateLayout: null as TemplateLayout | null,
      pagePreset: 'Landscape' as PagePreset,
      templateModules: [] as TemplateModuleInstance[],
      selectedTemplateModuleId: null as string | null,
      templateState: {} as TemplateState,
      projectMetadata: { name: 'PROJE DOSYASI', author: '', date: new Date().toLocaleDateString('tr-TR'), revision: '00', floor: '', scale: '100' },
      innerZoom: 1,
      innerPan: { x: 0, y: 0 },
      moduleSnapLines: [],
      projectId: null as string | null,
      toolOptions: getDefaultToolOptions(),
      recentTools: [] as EditorTool[],
      language: 'tr' as const,
      onboardingVisible: false,
      hasCompletedOnboarding: false,
      tourVisible: false,
      tourStep: 0,
      isModuleEditDrawerOpen: false,
      isModuleAddDrawerOpen: false,
    };
  }

  // Migration code removed - was non-functional (oldKey and newKey were identical)

  const layers = sanitizeLayers(JSON.parse(localStorage.getItem('planify-layers') || JSON.stringify([DEFAULT_LAYER])));

  return {
    elements: sanitizeEditorElements(JSON.parse(localStorage.getItem('planify-elements') || '[]'), layers),
    layers,
    customSymbols: JSON.parse(localStorage.getItem('planify-custom-symbols') || '[]'),
    scaleConfig: sanitizeScaleConfig(JSON.parse(localStorage.getItem('planify-scale') || JSON.stringify({ pixelsPerMeter: 50, unit: 'm' }))),
    editorTheme: (localStorage.getItem('planify-theme') as EditorTheme) || 'dark',
    projectTemplate: (localStorage.getItem('planify-template') as ProjectTemplate) || 'blank',
    templateLayoutId: localStorage.getItem('planify-template-layout-id'),
    activeTemplateLayout: null as TemplateLayout | null,
    pagePreset: normalizePagePreset(localStorage.getItem('planify-preset')),
    templateModules: sanitizeTemplateModules(JSON.parse(localStorage.getItem('planify-template-modules') || '[]')),
    selectedTemplateModuleId: null as string | null,
    templateState: sanitizeTemplateState(JSON.parse(localStorage.getItem('planify-template-state') || '{}')),
    projectMetadata: JSON.parse(localStorage.getItem('planify-project-metadata') || JSON.stringify({ name: 'PROJE DOSYASI', author: '', date: new Date().toLocaleDateString('tr-TR'), revision: '00', floor: '', scale: '100' })),
    innerZoom: parseFloat(localStorage.getItem('planify-inner-zoom') || '1') || 1,
    innerPan: JSON.parse(localStorage.getItem('planify-inner-pan') || '{"x":0,"y":0}'),
    moduleSnapLines: [],
    projectId: null as string | null,
    toolOptions: getDefaultToolOptions(),
    recentTools: [] as EditorTool[],
    language: (localStorage.getItem('planify-language') as 'tr' | 'en') || 'tr',
    onboardingVisible: false,
    hasCompletedOnboarding: localStorage.getItem('planify-onboarding-done') === 'true',
    tourVisible: false,
    tourStep: 0,
    isModuleEditDrawerOpen: false,
    isModuleAddDrawerOpen: false,
  };
};

// Persistence helpers
const saveElements = (elements: EditorElement[], projectId: string | null) => {
  if (typeof window === 'undefined') return;
  const key = projectId ? `planify-elements-${projectId}` : 'planify-elements';
  
  if (saveElementsTimer) clearTimeout(saveElementsTimer);
  saveElementsTimer = setTimeout(() => {
    localStorage.setItem(key, JSON.stringify(elements));
  }, DEBOUNCE_DELAY);
};

const saveLayers = (layers: LayerDef[], projectId: string | null) => {
  if (typeof window === 'undefined') return;
  const key = projectId ? `planify-layers-${projectId}` : 'planify-layers';
  localStorage.setItem(key, JSON.stringify(layers));
};

const saveTemplateModules = (modules: TemplateModuleInstance[], projectId: string | null) => {
  if (typeof window !== 'undefined') {
    const key = projectId ? `planify-template-modules-${projectId}` : 'planify-template-modules';
    localStorage.setItem(key, JSON.stringify(modules));
  }
};

const createUniqueModuleId = (baseId: string, modules: TemplateModuleInstance[]) => {
  const existingIds = new Set(modules.map((module) => module.id));
  if (!existingIds.has(baseId)) return baseId;

  let index = 2;
  while (existingIds.has(`${baseId}-${index}`)) index += 1;
  return `${baseId}-${index}`;
};

export const useEditorStore = create<EditorState>()(subscribeWithSelector((set, get) => {
  const initial = getInitialState();

  return {
    ...initial,
    clipboard: [],
    activeLayerId: 'default',
    selectedIds: [],
    tool: 'select',
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridVisible: true,
    selectedSymbol: null,
    focusedRegionId: null,
    canUndo: false,
    canRedo: false,
    past: [],
    future: [],
    advancedType: null,
    projectId: null,
    language: 'tr',

    setProjectId: (projectId) => set({ projectId }),
    setTool: (tool) => set((state) => {
      const recentTools = tool === 'select' ? state.recentTools :
        [tool, ...state.recentTools.filter(t => t !== tool)].slice(0, 5);
      return {
        tool,
        selectedSymbol: tool === 'symbol' ? 'exit' : null,
        recentTools,
      };
    }),
    updateToolOptions: (tool, options) => set((state) => ({
      toolOptions: {
        ...state.toolOptions,
        [tool]: { ...state.toolOptions[tool as keyof ToolOptions], ...options },
      } as ToolOptions,
    })),
    updateRecentTools: (tool) => set((state) => ({
      recentTools: [tool, ...state.recentTools.filter(t => t !== tool)].slice(0, 5),
    })),
    setSelectedIds: (selectedIds) => set((state) => ({
      selectedIds,
      focusedRegionId: selectedIds.length > 0 ? null : state.focusedRegionId,
      selectedTemplateModuleId: selectedIds.length > 0 ? null : state.selectedTemplateModuleId,
    })),
    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
    setPan: (panUpdate) => set((state) => ({ 
      pan: typeof panUpdate === 'function' ? panUpdate(state.pan) : panUpdate 
    })),
    setInnerZoom: (innerZoom) => set({ innerZoom: Math.max(0.05, Math.min(20, innerZoom)) }),
    setInnerPan: (innerPanUpdate) => set((state) => ({ 
      innerPan: typeof innerPanUpdate === 'function' ? innerPanUpdate(state.innerPan) : innerPanUpdate 
    })),
    setGridVisible: (gridVisible) => set({ gridVisible }),
    setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),

    setScaleConfig: (scaleConfig) => {
      set({ scaleConfig });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-scale', JSON.stringify(scaleConfig));
      }
    },

    setEditorTheme: (theme) => {
      set({ editorTheme: theme });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-theme', theme);
      }
    },

    setProjectTemplate: (template) => {
      set({ projectTemplate: template });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-template', template);
      }
    },

    setTemplateLayout: (layout) => {
      const normalizedLayout = layout ? normalizeTemplateLayout(layout) : null;
      const current = get();
      const keepExistingModules = Boolean(
        normalizedLayout &&
        current.templateModules.length > 0 &&
        (current.templateLayoutId === normalizedLayout.id || current.projectTemplate === normalizedLayout.slug)
      );
      const templateModules = normalizedLayout
        ? (keepExistingModules ? current.templateModules : getTemplateModules(normalizedLayout))
        : [];
      set({
        activeTemplateLayout: normalizedLayout,
        templateLayoutId: normalizedLayout?.id || null,
        projectTemplate: normalizedLayout?.slug || 'blank',
        pagePreset: normalizedLayout?.page_preset || get().pagePreset,
        templateModules,
        focusedRegionId: null,
        selectedTemplateModuleId: null,
      });
      if (typeof window !== 'undefined') {
        if (normalizedLayout) {
          localStorage.setItem('planify-template-layout-id', normalizedLayout.id);
          localStorage.setItem('planify-template', normalizedLayout.slug);
          localStorage.setItem('planify-preset', normalizedLayout.page_preset);
      saveTemplateModules(templateModules, get().projectId);
        } else {
          localStorage.removeItem('planify-template-layout-id');
          localStorage.setItem('planify-template', 'blank');
          localStorage.removeItem('planify-template-modules');
        }
      }
    },

    setPagePreset: (preset) => {
      const pagePreset = normalizePagePreset(preset);
      set({ pagePreset });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-preset', pagePreset);
      }
    },

    setTemplateModules: (modules) => {
      const templateModules = modules.map(clampTemplateModule).sort((left, right) => left.zIndex - right.zIndex);
      set({ templateModules });
      saveTemplateModules(templateModules, get().projectId);
    },

    addTemplateModule: (type, placement = {}) => {
      const { elements, layers, past, templateModules, templateState } = get();

      if (type === 'DrawingArea' && templateModules.some((module) => module.type === 'DrawingArea')) {
        const existing = templateModules.find((module) => module.type === 'DrawingArea');
        set({
          focusedRegionId: existing?.id ?? 'drawing',
          selectedTemplateModuleId: existing?.id ?? 'drawing',
          selectedIds: [],
        });
        toast.info('Cizim alani tek instance olarak tutulur.');
        return;
      }

      const base = createTemplateModuleInstance(type, placement);
      const maxZIndex = templateModules.reduce((max, module) => Math.max(max, module.zIndex), 20);
      const newModule = clampTemplateModule({
        ...base,
        id: createUniqueModuleId(base.id, templateModules),
        zIndex: type === 'DrawingArea' ? 10 : maxZIndex + 1,
      });
      const definition = getModuleDefinition(type);
      const nextModules = [...templateModules, newModule].sort((left, right) => left.zIndex - right.zIndex);
      const nextTemplateState = {
        ...templateState,
        [newModule.id]: {
          ...definition.defaultState,
          ...(templateState[newModule.id] || {}),
        },
      };

      set({
        past: [...past, { elements, layers, templateModules }].slice(-20),
        templateModules: nextModules,
        templateState: nextTemplateState,
        focusedRegionId: newModule.id,
        selectedTemplateModuleId: newModule.id,
        selectedIds: [],
        future: [],
        canUndo: true,
        canRedo: false,
      });
      saveTemplateModules(nextModules, get().projectId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-template-state', JSON.stringify(nextTemplateState));
      }
    },

    updateTemplateModule: (id, updates) => {
      const { elements, layers, past, templateModules } = get();
      const nextModules = templateModules
        .map((module) => (module.id === id ? clampTemplateModule({ ...module, ...updates }) : module))
        .sort((left, right) => left.zIndex - right.zIndex);

      set({
        past: [...past, { elements, layers, templateModules }].slice(-20),
        templateModules: nextModules,
        future: [],
        canUndo: true,
        canRedo: false,
      });
      saveTemplateModules(nextModules, get().projectId);
    },

    removeTemplateModule: (id) => {
      const { elements, layers, past, templateModules, selectedTemplateModuleId, focusedRegionId, activeTemplateLayout } = get();
      
      let currentModules = templateModules;
      if (currentModules.length === 0 && activeTemplateLayout) {
         currentModules = getTemplateModules(activeTemplateLayout);
      }

      const target = currentModules.find((module) => module.id === id);
      if (!target) return;

      if (target.type === 'DrawingArea') {
        toast.warning(elements.length > 0 ? 'CAD icerigi varken cizim alani silinemez.' : 'Cizim alani sablonun zorunlu modulu olarak tutulur.');
        return;
      }

      const nextModules = currentModules.filter((module) => module.id !== id);
      set({
        past: [...past, { elements, layers, templateModules: currentModules }].slice(-20),
        templateModules: nextModules,
        selectedTemplateModuleId: selectedTemplateModuleId === id ? null : selectedTemplateModuleId,
        focusedRegionId: focusedRegionId === id ? null : focusedRegionId,
        future: [],
        canUndo: true,
        canRedo: false,
      });
      saveTemplateModules(nextModules, get().projectId);
    },

    setSelectedTemplateModuleId: (selectedTemplateModuleId) => set({
      selectedTemplateModuleId,
      focusedRegionId: selectedTemplateModuleId,
      selectedIds: [],
    }),

    setTemplateState: (templateState) => {
      set({ templateState });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-template-state', JSON.stringify(templateState));
      }
    },

    updateTemplateRegion: (regionId, updates) => {
      const templateState = {
        ...get().templateState,
        [regionId]: {
          ...(get().templateState[regionId] || {}),
          ...updates,
        },
      };
      set({ templateState });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-template-state', JSON.stringify(templateState));
      }
    },

    setProjectMetadata: (updates) => {
      const projectMetadata = { ...get().projectMetadata, ...updates };
      set({ projectMetadata });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-project-metadata', JSON.stringify(projectMetadata));
      }
    },

    setFocusedRegionId: (focusedRegionId) => set((state) => ({
      focusedRegionId,
      selectedTemplateModuleId: focusedRegionId,
      selectedIds: focusedRegionId ? [] : state.selectedIds,
    })),

    setIsModuleEditDrawerOpen: (isModuleEditDrawerOpen) => set({ isModuleEditDrawerOpen }),

    setIsModuleAddDrawerOpen: (isModuleAddDrawerOpen) => set({ isModuleAddDrawerOpen }),

    setModuleSnapLines: (moduleSnapLines) => set({ moduleSnapLines }),

    setActiveLayer: (activeLayerId) => set({ activeLayerId }),

    toggleLayerVisibility: (id) => {
      const { elements, layers, past } = get();
      const newLayers = layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l));
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, canUndo: true });
      saveLayers(newLayers, get().projectId);
    },

    toggleLayerLock: (id) => {
      const { elements, layers, past } = get();
      const newLayers = layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l));
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, canUndo: true });
      saveLayers(newLayers, get().projectId);
    },

    addLayer: (name) => {
      const { elements, layers, past } = get();
      const newLayer: LayerDef = { id: uuidv4(), name, visible: true, locked: false, order: layers.length };
      const newLayers = [...layers, newLayer];
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, activeLayerId: newLayer.id, canUndo: true });
      saveLayers(newLayers, get().projectId);
    },

    removeLayer: (id) => {
      const { elements, layers, past, activeLayerId } = get();
      const newLayers = layers.filter((l) => l.id !== id);
      const newElements = elements.filter((e) => e.layerId !== id);
      const newPast = [...past, { elements, layers }].slice(-20);
      set({
        past: newPast,
        layers: newLayers,
        elements: newElements,
        activeLayerId: activeLayerId === id ? 'default' : activeLayerId,
        canUndo: true,
      });
      saveLayers(newLayers, get().projectId);
      saveElements(newElements, get().projectId);
    },

    renameLayer: (id, name) => {
      const { elements, layers, past } = get();
      const newLayers = layers.map((l) => (l.id === id ? { ...l, name } : l));
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, canUndo: true });
      saveLayers(newLayers, get().projectId);
    },

    addCustomSymbol: (symbol) => {
      const newCustomSymbols = [...get().customSymbols, symbol];
      set({ customSymbols: newCustomSymbols });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-custom-symbols', JSON.stringify(newCustomSymbols));
      }
    },

    addElement: (element) => {
      const { elements, layers, past, activeLayerId } = get();
      const newEl = {
        ...element,
        id: uuidv4(),
        layerId: element.layerId || activeLayerId,
      } as EditorElement;

      const newElements = [...elements, newEl];
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, elements: newElements, future: [], canUndo: true, canRedo: false });
      saveElements(newElements, get().projectId);
    },

    updateElement: (id, updates) => {
      const { elements, layers, past } = get();
      // Samet (P1 Fix): Use Map for efficient element updates (avoid full array mapping)
      const elementMap = new Map(elements.map(el => [el.id, el]));
      const existing = elementMap.get(id);
      if (existing) {
        elementMap.set(id, { ...existing, ...updates });
        const newElements = Array.from(elementMap.values());
        const newPast = [...past, { elements, layers }].slice(-20);
        set({ past: newPast, elements: newElements, future: [], canUndo: true, canRedo: false });
        saveElements(newElements, get().projectId);
      }
    },

    updateElementsBatch: (updates) => {
      const { elements, layers, past } = get();
      const updateMap = new Map(updates.map((u) => [u.id, u.changes]));
      const newElements = elements.map((e) => {
        const changes = updateMap.get(e.id);
        if (!changes) return e;
        return { ...e, ...changes };
      });
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, elements: newElements, future: [], canUndo: true, canRedo: false });
      saveElements(newElements, get().projectId);
    },

    removeElements: (ids) => {
      const { elements, layers, past, selectedIds } = get();
      const newElements = elements.filter((e) => !ids.includes(e.id));
      const newPast = [...past, { elements, layers }].slice(-20);
      set({
        past: newPast,
        elements: newElements,
        selectedIds: selectedIds.filter(sid => !ids.includes(sid)),
        future: [],
        canUndo: true,
        canRedo: false,
      });
      saveElements(newElements, get().projectId);
    },

    duplicateElements: (ids) => {
      const { elements, layers, past } = get();
      const duplicatedElements = ids.map(id => elements.find((e) => e.id === id)).filter(Boolean) as EditorElement[];
      if (duplicatedElements.length === 0) return;

      const newEls = duplicatedElements.map(element => ({
        ...element,
        id: uuidv4(),
        x: element.x + 20,
        y: element.y + 20,
      }));
      
      const newElements = [...elements, ...newEls];
      const newPast = [...past, { elements, layers }].slice(-20);
      set({
        past: newPast,
        elements: newElements,
        selectedIds: newEls.map(e => e.id),
        future: [],
        canUndo: true,
        canRedo: false,
      });
      saveElements(newElements, get().projectId);
    },

    copySelection: () => {
      const { elements, selectedIds } = get();
      if (selectedIds.length === 0) return;
      const elementsToCopy = elements.filter((e) => selectedIds.includes(e.id));
      if (elementsToCopy.length > 0) {
        set({ clipboard: elementsToCopy });
      }
    },

    pasteSelection: () => {
      const { elements, layers, past, clipboard, activeLayerId } = get();
      if (clipboard.length === 0) return;

      const newElementsToPaste = clipboard.map((el) => {
        const id = uuidv4();
        return {
          ...el,
          id,
          x: el.x + 20,
          y: el.y + 20,
          layerId: activeLayerId, // Paste to active layer
        };
      });

      const newElements = [...elements, ...newElementsToPaste];
      const newPast = [...past, { elements, layers }].slice(-20);
      
      set({
        past: newPast,
        elements: newElements,
        selectedIds: newElementsToPaste.map(e => e.id),
        future: [],
        canUndo: true,
        canRedo: false,
      });
      saveElements(newElements, get().projectId);
    },

    loadProject: (json) => {
      try {
        const rawData = JSON.parse(json);
        const data = sanitizeDebugEditorStatePayload(rawData);
        if (rawData && typeof rawData === 'object' && 'elements' in rawData && 'scaleConfig' in rawData) {
          set({
            elements: data.elements,
            scaleConfig: data.scaleConfig,
            layers: data.layers,
            projectTemplate: data.projectTemplate || get().projectTemplate,
            templateLayoutId: data.templateLayoutId,
            templateModules: data.templateModules,
            templateState: data.templateState,
            projectMetadata: data.projectMetadata || { name: 'PROJE DOSYASI', author: '', date: new Date().toLocaleDateString('tr-TR'), revision: '00' },
            pagePreset: data.pagePreset,
            innerZoom: data.innerZoom || 1,
            innerPan: data.innerPan || { x: 0, y: 0 },
            activeLayerId: data.layers[0]?.id || DEFAULT_LAYER.id,
            focusedRegionId: null,
            selectedTemplateModuleId: null,
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
          });
          saveElements(data.elements, get().projectId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('planify-scale', JSON.stringify(data.scaleConfig));
            if (data.projectTemplate) localStorage.setItem('planify-template', data.projectTemplate);
            if (data.templateLayoutId) localStorage.setItem('planify-template-layout-id', data.templateLayoutId);
            else localStorage.removeItem('planify-template-layout-id');
            if (data.templateState) localStorage.setItem('planify-template-state', JSON.stringify(data.templateState));
            saveTemplateModules(data.templateModules, get().projectId);
            if (data.projectMetadata) localStorage.setItem('planify-project-metadata', JSON.stringify(data.projectMetadata));
            if (data.pagePreset) localStorage.setItem('planify-preset', data.pagePreset);
            saveLayers(data.layers, get().projectId);
          }
          toast.success('Proje başarıyla yüklendi');
        } else {
          toast.error('Geçersiz proje dosyası formatı');
        }
      } catch (e) {
        console.error('Failed to load project', e);
        toast.error('Proje yüklenirken hata oluştu');
      }
    },

    clearAll: () => {
      const { elements, past, layers } = get();
      set({
        past: [...past, { elements, layers }],
        elements: [],
        selectedIds: [],
        future: [],
        canUndo: false,  // Samet (P1 Fix): clearAll should reset undo state
        canRedo: false,
      });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('planify-elements');
      }
    },

    undo: () => {
      const { past, elements, future, layers, templateModules } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const restoredTemplateModules = previous.templateModules ?? templateModules;
      set({
        past: newPast,
        elements: previous.elements,
        layers: previous.layers,
        templateModules: restoredTemplateModules,
        future: [{ elements, layers, templateModules }, ...future],
        canUndo: newPast.length > 0,
        canRedo: true,
      });
      saveElements(previous.elements, get().projectId);
      saveLayers(previous.layers, get().projectId);
      saveTemplateModules(restoredTemplateModules, get().projectId);
    },

    redo: () => {
      const { past, elements, future, layers, templateModules } = get();
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      const restoredTemplateModules = next.templateModules ?? templateModules;
      set({
        past: [...past, { elements, layers, templateModules }],
        elements: next.elements,
        layers: next.layers,
        templateModules: restoredTemplateModules,
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
      saveElements(next.elements, get().projectId);
      saveLayers(next.layers, get().projectId);
      saveTemplateModules(restoredTemplateModules, get().projectId);
    },
    setAdvancedType: (advancedType) => set({ advancedType }),
    setLanguage: (language) => {
      set({ language });
      if (typeof window !== 'undefined') {
        localStorage.setItem('planify-language', language);
      }
    },
    setOnboardingVisible: (visible) => set({ onboardingVisible: visible }),
    completeOnboarding: () => {
      localStorage.setItem('planify-onboarding-done', 'true');
      set({ hasCompletedOnboarding: true, onboardingVisible: false, tourVisible: true });
    },
    setTourVisible: (tourVisible) => set({ tourVisible }),
    setTourStep: (tourStep) => set({ tourStep }),
  };
}));
