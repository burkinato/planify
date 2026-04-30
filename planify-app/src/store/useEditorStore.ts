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
  sanitizeTemplateState,
} from '@/lib/editor/sanitizeEditorState';
import { normalizePagePreset, normalizeTemplateLayout } from '@/lib/editor/templateLayouts';

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
  templateState: TemplateState;
  focusedRegionId: string | null;
  projectMetadata: ProjectMetadata;
  innerZoom: number;
  innerPan: { x: number; y: number };
  canUndo: boolean;
  canRedo: boolean;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  advancedType: 'title' | 'body' | 'meta' | 'content' | null;
  projectId: string | null;
  toolOptions: ToolOptions;
  recentTools: EditorTool[];

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
  setTemplateState: (state: TemplateState) => void;
  updateTemplateRegion: (regionId: string, updates: TemplateRegionState) => void;
  setProjectMetadata: (metadata: Partial<ProjectMetadata>) => void;
  setFocusedRegionId: (id: string | null) => void;
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
      templateState: {} as TemplateState,
      projectMetadata: { name: 'PROJE DOSYASI', author: '', date: new Date().toLocaleDateString('tr-TR'), revision: '00', floor: '', scale: '100' },
      innerZoom: 1,
      innerPan: { x: 0, y: 0 },
      projectId: null as string | null,
      toolOptions: getDefaultToolOptions(),
      recentTools: [] as EditorTool[],
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
    templateState: sanitizeTemplateState(JSON.parse(localStorage.getItem('planify-template-state') || '{}')),
    projectMetadata: JSON.parse(localStorage.getItem('planify-project-metadata') || JSON.stringify({ name: 'PROJE DOSYASI', author: '', date: new Date().toLocaleDateString('tr-TR'), revision: '00', floor: '', scale: '100' })),
    innerZoom: parseFloat(localStorage.getItem('planify-inner-zoom') || '1') || 1,
    innerPan: JSON.parse(localStorage.getItem('planify-inner-pan') || '{"x":0,"y":0}'),
    projectId: null as string | null,
    toolOptions: getDefaultToolOptions(),
    recentTools: [] as EditorTool[],
  };
};

// Samet (P1 Fix): Now using debounced versions to prevent excessive localStorage writes
const saveElements = (elements: EditorElement[]) => {
  debouncedSaveElements(elements);
};

const saveLayers = (layers: LayerDef[]) => {
  debouncedSaveLayers(layers);
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
      set({
        activeTemplateLayout: normalizedLayout,
        templateLayoutId: normalizedLayout?.id || null,
        projectTemplate: normalizedLayout?.slug || 'blank',
        pagePreset: normalizedLayout?.page_preset || get().pagePreset,
        focusedRegionId: null,
      });
      if (typeof window !== 'undefined') {
        if (normalizedLayout) {
          localStorage.setItem('planify-template-layout-id', normalizedLayout.id);
          localStorage.setItem('planify-template', normalizedLayout.slug);
          localStorage.setItem('planify-preset', normalizedLayout.page_preset);
        } else {
          localStorage.removeItem('planify-template-layout-id');
          localStorage.setItem('planify-template', 'blank');
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
      selectedIds: focusedRegionId ? [] : state.selectedIds,
    })),

    setActiveLayer: (activeLayerId) => set({ activeLayerId }),

    toggleLayerVisibility: (id) => {
      const { elements, layers, past } = get();
      const newLayers = layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l));
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, canUndo: true });
      saveLayers(newLayers);
    },

    toggleLayerLock: (id) => {
      const { elements, layers, past } = get();
      const newLayers = layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l));
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, canUndo: true });
      saveLayers(newLayers);
    },

    addLayer: (name) => {
      const { elements, layers, past } = get();
      const newLayer: LayerDef = { id: uuidv4(), name, visible: true, locked: false, order: layers.length };
      const newLayers = [...layers, newLayer];
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, activeLayerId: newLayer.id, canUndo: true });
      saveLayers(newLayers);
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
      saveLayers(newLayers);
      saveElements(newElements);
    },

    renameLayer: (id, name) => {
      const { elements, layers, past } = get();
      const newLayers = layers.map((l) => (l.id === id ? { ...l, name } : l));
      const newPast = [...past, { elements, layers }].slice(-20);
      set({ past: newPast, layers: newLayers, canUndo: true });
      saveLayers(newLayers);
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
      saveElements(newElements);
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
        saveElements(newElements);
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
      saveElements(newElements);
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
      saveElements(newElements);
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
      saveElements(newElements);
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
      saveElements(newElements);
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
            templateState: data.templateState,
            projectMetadata: data.projectMetadata || { name: 'PROJE DOSYASI', author: '', date: new Date().toLocaleDateString('tr-TR'), revision: '00' },
            pagePreset: data.pagePreset,
            innerZoom: data.innerZoom || 1,
            innerPan: data.innerPan || { x: 0, y: 0 },
            activeLayerId: data.layers[0]?.id || DEFAULT_LAYER.id,
            focusedRegionId: null,
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
          });
          saveElements(data.elements);
          if (typeof window !== 'undefined') {
            localStorage.setItem('planify-scale', JSON.stringify(data.scaleConfig));
            if (data.projectTemplate) localStorage.setItem('planify-template', data.projectTemplate);
            if (data.templateLayoutId) localStorage.setItem('planify-template-layout-id', data.templateLayoutId);
            else localStorage.removeItem('planify-template-layout-id');
            if (data.templateState) localStorage.setItem('planify-template-state', JSON.stringify(data.templateState));
            if (data.projectMetadata) localStorage.setItem('planify-project-metadata', JSON.stringify(data.projectMetadata));
            if (data.pagePreset) localStorage.setItem('planify-preset', data.pagePreset);
            saveLayers(data.layers);
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
      const { past, elements, future, layers } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      set({
        past: newPast,
        elements: previous.elements,
        layers: previous.layers,
        future: [{ elements, layers }, ...future],
        canUndo: newPast.length > 0,
        canRedo: true,
      });
      saveElements(previous.elements);
      saveLayers(previous.layers);
    },

    redo: () => {
      const { past, elements, future, layers } = get();
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      set({
        past: [...past, { elements, layers }],
        elements: next.elements,
        layers: next.layers,
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
      saveElements(next.elements);
      saveLayers(next.layers);
    },
    setAdvancedType: (advancedType) => set({ advancedType }),
  };
}));
