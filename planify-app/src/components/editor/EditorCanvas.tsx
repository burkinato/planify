'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type Konva from 'konva';
import '@/lib/editor/konva-init';
// Register Konva nodes for react-konva to prevent "Konva has no node with the type X" errors
import { Stage, Layer, Rect, Line, Text, Group, Circle, Image as KonvaImage, Shape, Arrow } from 'react-konva';
import { useEditorStore, useShallow } from '@/store/useEditorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SYMBOLS, SNAP_DISTANCE, GRID_SIZE, THEME_CONFIGS, type EditorElement, type EditorTheme, type WallToolOptions, type DoorToolOptions, type WindowToolOptions, type StairsToolOptions, type ElevatorToolOptions, type ColumnToolOptions, type TextToolOptions } from '@/types/editor';
import { ImageUp, Layers, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTemplateModules, mergeTemplateState, modulesToRegions } from '@/lib/editor/templateLayouts';
import { getTemplateRegionAssetUrl, uploadTemplateRegionAsset } from '@/lib/editor/templateAssets';
import { ISO_SYMBOLS } from '@/lib/editor/isoSymbols';
import { sanitizeDebugEditorStatePayload } from '@/lib/editor/sanitizeEditorState';
import {
  buildWallEndpointUpdates,
  buildWallMoveUpdates,
  computeRenderPoints,
  findWallSnap,
  wallAngleDegrees,
  wallLength,
  wallPoints,
  type WallElement,
} from '@/lib/editor/wallGeometry';
import { GridRenderer } from './canvas/GridRenderer';
import { getHatchPattern, LegendItem, CustomSymbolImage, WatermarkGroup, BrandingBanner } from './canvas/CanvasHelpers';
import { ModuleOverlay } from './canvas/ModuleOverlay';
import { calculateModuleSnap } from '@/lib/editor/moduleSnapping';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

type CanvasStageEvent = Konva.KonvaEventObject<MouseEvent>;
type CanvasWheelEvent = Konva.KonvaEventObject<WheelEvent>;
type DebugEditorWindow = Window & {
  __konvaInvalidChildren?: Array<Record<string, unknown>>;
};




interface EditorCanvasProps {
  id?: string;
  isPreview: boolean;
  mobileMenu: string | null;
  setMobileMenu: (m: 'tools' | 'properties' | null) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  setContainerNode: (node: HTMLDivElement | null) => void;
  projectId?: string | null;
}



const clampNumber = (value: number | undefined, min: number, max: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(min, Math.min(max, value));
};

export function EditorCanvas({ id, isPreview, mobileMenu, setMobileMenu, stageRef, setContainerNode, projectId }: EditorCanvasProps) {
  const DEFAULT_PLAN_HEADER = 'ACİL DURUM TAHLİYE PLANI';
  const ISO_HEADER_GREEN = '#008F4C';
  const { profile, user } = useAuthStore();
  const subscriptionTier = profile?.subscription_tier || 'free';

  const {
    elements, layers, tool, toolOptions, zoom, pan, gridVisible, selectedIds, customSymbols,
    addElement, updateElement, updateElementsBatch, removeElements, setSelectedIds, scaleConfig, setScaleConfig, setTool,
    editorTheme, setZoom, setPan, activeTemplateLayout, projectTemplate, templateLayoutId, templateModules, selectedTemplateModuleId, templateState, focusedRegionId, setFocusedRegionId, setSelectedTemplateModuleId, addTemplateModule, updateTemplateModule, updateTemplateRegion, removeTemplateModule,
    innerZoom, innerPan, setInnerZoom, setInnerPan, projectMetadata, setProjectMetadata,
    moduleSnapLines, setModuleSnapLines, setIsModuleEditDrawerOpen
  } = useEditorStore(useShallow((s) => ({
    elements: s.elements,
    layers: s.layers,
    tool: s.tool,
    toolOptions: s.toolOptions,
    zoom: s.zoom,
    pan: s.pan,
    gridVisible: s.gridVisible,
    selectedIds: s.selectedIds,
    customSymbols: s.customSymbols,
    addElement: s.addElement,
    updateElement: s.updateElement,
    updateElementsBatch: s.updateElementsBatch,
    removeElements: s.removeElements,
    setSelectedIds: s.setSelectedIds,
    scaleConfig: s.scaleConfig,
    setScaleConfig: s.setScaleConfig,
    setTool: s.setTool,
    editorTheme: s.editorTheme,
    setZoom: s.setZoom,
    setPan: s.setPan,
    activeTemplateLayout: s.activeTemplateLayout,
    projectTemplate: s.projectTemplate,
    templateLayoutId: s.templateLayoutId,
    templateModules: s.templateModules,
    selectedTemplateModuleId: s.selectedTemplateModuleId,
    templateState: s.templateState,
    focusedRegionId: s.focusedRegionId,
    setFocusedRegionId: s.setFocusedRegionId,
    setSelectedTemplateModuleId: s.setSelectedTemplateModuleId,
    addTemplateModule: s.addTemplateModule,
    updateTemplateModule: s.updateTemplateModule,
    updateTemplateRegion: s.updateTemplateRegion,
    innerZoom: s.innerZoom,
    innerPan: s.innerPan,
    setInnerZoom: s.setInnerZoom,
    setInnerPan: s.setInnerPan,
    projectMetadata: s.projectMetadata,
    setProjectMetadata: s.setProjectMetadata,
    removeTemplateModule: s.removeTemplateModule,
    moduleSnapLines: s.moduleSnapLines,
    setModuleSnapLines: s.setModuleSnapLines,
    setIsModuleEditDrawerOpen: s.setIsModuleEditDrawerOpen,
  })));

  const [confirmDeleteDrawingId, setConfirmDeleteDrawingId] = useState<string | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const themeConfig = THEME_CONFIGS[editorTheme];
  const stageHostRef = useRef<HTMLDivElement>(null);
  const infiniteHostRef = useRef<HTMLDivElement>(null);
  // Middle-mouse pan state
  const isPanningRef = useRef(false);
  const isSpacePressedRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const lastMouseMovePosRef = useRef({ x: 0, y: 0 });

  const [scaleModal, setScaleModal] = useState<{ pixels: number } | null>(null);
  const [scaleValue, setScaleValue] = useState('1');
  const lastDebugPayloadRef = useRef<string | null>(null);
  const signedAssetPathRef = useRef(new Set<string>());
  const [uploadingRegionId, setUploadingRegionId] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(false);

  // Dimension input overlay: activated after mouseup on wall/window/door/route
  const [dimInput, setDimInput] = useState<{
    screenX: number;
    screenY: number;
    frozenLine: number[];    // the mouse-drawn line (before precision override)
    finalX: number;
    finalY: number;
    elementData: Partial<EditorElement>;
    value: string;
  } | null>(null);
  const dimInputRef = useRef<HTMLInputElement>(null);
  const previousToolRef = useRef(tool);

  // ── Unit helpers ────────────────────────────────────────────────────────
  const toDisplayUnit = (pixels: number): string => {
    const meters = pixels / scaleConfig.pixelsPerMeter;
    if (scaleConfig.unit === 'mm') return (meters * 1000).toFixed(0);
    if (scaleConfig.unit === 'cm') return (meters * 100).toFixed(1);
    return meters.toFixed(2);
  };

  const fromDisplayUnit = (value: string): number => {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0) return 0;
    if (scaleConfig.unit === 'mm') return (v / 1000) * scaleConfig.pixelsPerMeter;
    if (scaleConfig.unit === 'cm') return (v / 100) * scaleConfig.pixelsPerMeter;
    return v * scaleConfig.pixelsPerMeter;
  };

  const commitDimInput = (overridePixels?: number) => {
    if (!dimInput) return;
    const { frozenLine, finalX, finalY, elementData } = dimInput;
    let pts = frozenLine;
    if (overridePixels && overridePixels > 0) {
      const [x1, y1, x2, y2] = frozenLine;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const currentLen = Math.sqrt(dx * dx + dy * dy);
      if (currentLen > 0) {
        const ratio = overridePixels / currentLen;
        pts = [x1, y1, x1 + dx * ratio, y1 + dy * ratio];
      }
    }
    addElement({ ...elementData, points: pts, x: finalX, y: finalY });
    setDimInput(null);
  };

  const visibleLayers = layers.filter(l => l.visible).map(l => l.id);
  const visibleElements = elements.filter(el => visibleLayers.includes(el.layerId));
  const wallElements = visibleElements.filter((el): el is WallElement => el.type === 'wall' && !!el.points && el.points.length >= 4);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[] | null>(null);
  const [orthoLine, setOrthoLine] = useState<{ axis: 'x' | 'y', pos: number } | null>(null);
  const [alignLine, setAlignLine] = useState<{ axis: 'x' | 'y', pos: number } | null>(null);
  const [isFocused, setIsFocused] = useState(true);
  const isInnerPanningRef = useRef(false);
  const innerPanStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // ── Manual Coordinate Engine ──────────────────────────────────────────
  const getRelativePointerPosition = (stage: Konva.Stage): { x: number, y: number } | null => {
    // Konva's getPointerPosition() is automatically relative to the stage container
    // and correctly accounts for the CSS scale of the container (e.g. from parent zoom).
    const pos = stage.getPointerPosition();
    if (!pos) return null;

    // Convert from Stage Units to the inner Drawing space (accounting for internal zoom/pan)
    return {
      x: (pos.x - innerPan.x) / innerZoom,
      y: (pos.y - innerPan.y) / innerZoom
    };
  };

  const page = activeTemplateLayout?.layout_json.page;
  const paperWidth = activeTemplateLayout && page ? page.width : 2000;
  const paperHeight = activeTemplateLayout && page ? page.height : 2000;
  const activeTemplateModules = useMemo(() => {
    if (!activeTemplateLayout) return [];
    return templateModules.length > 0 ? templateModules : getTemplateModules(activeTemplateLayout);
  }, [activeTemplateLayout, templateModules]);
  const paperRegions = useMemo(() => modulesToRegions(activeTemplateModules), [activeTemplateModules]);
  const drawingRegion = paperRegions.find(r => r.type === 'drawing');
  // Subtract 12px (6px inset per side) to match the container CSS `calc(...% - 12px)`
  // This ensures 1 Konva unit = 1 CSS pixel, eliminating coordinate distortion in editor and exports.
  const REGION_INSET = 12;
  const stageWidth = drawingRegion ? Math.round(paperWidth * (drawingRegion.w / 100) - REGION_INSET) : 2000;
  const stageHeight = drawingRegion ? Math.round(paperHeight * (drawingRegion.h / 100) - REGION_INSET) : 2000;


  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
      if (subscriptionTier === 'free') {
        setIsFocused(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [subscriptionTier]);

  // Auto-focus dim input when it appears
  useEffect(() => {
    if (dimInput && dimInputRef.current) {
      dimInputRef.current.focus();
      dimInputRef.current.select();
    }
  }, [dimInput]);

  // Dismiss dimInput if tool changes
  useEffect(() => {
    if (previousToolRef.current !== tool && dimInput) {
      const timeoutId = window.setTimeout(() => {
        commitDimInput();
        setCurrentLine(null);
      }, 0);
      previousToolRef.current = tool;
      return () => window.clearTimeout(timeoutId);
    }

    previousToolRef.current = tool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, dimInput]);


  // Infinite canvas: wheel = zoom, middle-mouse = pan
  useEffect(() => {
    const host = infiniteHostRef.current;
    if (!host) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return;

      const state = useEditorStore.getState();

      // Figma-like Undo / Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        state.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.code === 'KeyZ') || e.code === 'KeyY')) {
        e.preventDefault();
        state.redo();
        return;
      }

      // Figma-like Copy / Paste / Duplicate
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
        e.preventDefault();
        state.copySelection();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {
        e.preventDefault();
        state.pasteSelection();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyD') {
        e.preventDefault();
        if (state.selectedIds.length > 0) state.duplicateElements(state.selectedIds);
        return;
      }

      // Tool Shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        if (e.code === 'KeyV') { e.preventDefault(); state.setTool('select'); return; }
        if (e.code === 'KeyT') { e.preventDefault(); state.setTool('text'); return; }
        if (e.code === 'KeyR') { e.preventDefault(); state.setTool('rect'); return; }
        if (e.code === 'KeyL') { e.preventDefault(); state.setTool('wall'); return; }
      }

      // Space pan
      if (e.code === 'Space') {
        if (!isSpacePressedRef.current) {
          isSpacePressedRef.current = true;
          setIsSpacePressed(true);
          if (host) host.style.cursor = 'grab';
          const stage = stageRef.current;
          if (stage) stage.container().style.cursor = 'grab';
        }
        e.preventDefault();
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (state.selectedIds.length > 0) {
          state.removeElements(state.selectedIds);
          state.setSelectedIds([]);
        } else if (state.selectedTemplateModuleId) {
          state.removeTemplateModule(state.selectedTemplateModuleId);
        }
        return;
      }

      if (e.key === 'Escape') {
        state.setSelectedIds([]);
        state.setSelectedTemplateModuleId(null);
        return;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        setIsSpacePressed(false);
        if (host && !isPanningRef.current) {
          host.style.cursor = '';
        }
        const stage = stageRef.current;
        if (stage && !isPanningRef.current) {
          stage.container().style.cursor = '';
        }
      }
    };

    const onBlur = () => {
      // isSpacePressedRef.current = false; // REMOVED: Aggressive reset on blur was breaking panning during auto-save toasts
      if (host) host.style.cursor = '';
    };

    const onWheel = (e: WheelEvent) => {
      const state = useEditorStore.getState();
      const target = e.target as HTMLElement;

      const isScrollableEl = (el: HTMLElement | null): boolean => {
        if (!el) return false;
        const tag = el.tagName.toLowerCase();
        if (tag === 'textarea' || tag === 'input') return true;
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return true;
        if (el.parentElement && el !== host) return isScrollableEl(el.parentElement);
        return false;
      };

      if (isScrollableEl(target)) return;

      const activeModules = state.templateModules.length > 0 
        ? state.templateModules 
        : (state.activeTemplateLayout ? getTemplateModules(state.activeTemplateLayout) : []);
      const dRegion = activeModules.find(m => m.type === 'DrawingArea');

      const overDrawing = !!(target as HTMLElement).closest('.drawing-region-wrapper');
      const drawingFocused = state.focusedRegionId === dRegion?.id;
      if (overDrawing && drawingFocused) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        const scaleBy = 1.08;
        const rect = host.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const direction = e.deltaY < 0 ? 1 : -1;
        
        const currentZoom = state.zoom;
        const currentPan = state.pan;
        
        const newZoom = Math.max(0.08, Math.min(8, currentZoom * (direction > 0 ? scaleBy : 1 / scaleBy)));
        const newPanX = mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom);
        const newPanY = mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom);
        
        state.setZoom(newZoom);
        state.setPan({ x: newPanX, y: newPanY });
      } else {
        const panX = e.shiftKey ? e.deltaY : e.deltaX;
        const panY = e.shiftKey ? e.deltaX : e.deltaY;
        state.setPan((prev) => ({
          x: prev.x - panX,
          y: prev.y - panY,
        }));
      }
    };


    const onMouseDown = (e: MouseEvent) => {
      const state = useEditorStore.getState();
      const target = e.target as HTMLElement;

      if (e.button === 1 || (e.button === 0 && (e.altKey || isSpacePressedRef.current))) {
        e.preventDefault();
        isPanningRef.current = true;
        const currentPan = state.pan;
        panStartRef.current = { x: e.clientX, y: e.clientY, panX: currentPan.x, panY: currentPan.y };
        host.style.cursor = 'grabbing';
        const stage = stageRef.current;
        if (stage) stage.container().style.cursor = 'grabbing';
        return;
      }

      const activeModules = state.templateModules.length > 0 
        ? state.templateModules 
        : (state.activeTemplateLayout ? getTemplateModules(state.activeTemplateLayout) : []);
      const dRegion = activeModules.find(m => m.type === 'DrawingArea');

      if (target.closest('.drawing-region-wrapper') && state.focusedRegionId === dRegion?.id) {
        return;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const state = useEditorStore.getState();
      lastMouseMovePosRef.current = { x: e.clientX, y: e.clientY };

      // Emergency check: If panning is true but mouse buttons are released, force stop panning
      // e.buttons === 0 means no mouse button is currently held down
      if (isPanningRef.current && e.buttons === 0) {
        isPanningRef.current = false;
        host.style.cursor = isSpacePressedRef.current ? 'grab' : '';
        const stage = stageRef.current;
        if (stage) stage.container().style.cursor = isSpacePressedRef.current ? 'grab' : '';
        return;
      }

      if (!isPanningRef.current) return;
      
      const totalDx = e.clientX - panStartRef.current.x;
      const totalDy = e.clientY - panStartRef.current.y;
      state.setPan({ x: panStartRef.current.panX + totalDx, y: panStartRef.current.panY + totalDy });
    };

    const onMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        host.style.cursor = isSpacePressedRef.current ? 'grab' : '';
        const stage = stageRef.current;
        if (stage) stage.container().style.cursor = isSpacePressedRef.current ? 'grab' : '';
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    host.addEventListener('wheel', onWheel, { passive: false });
    host.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      host.removeEventListener('wheel', onWheel);
      host.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [stageRef]);

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const findSnapPoint = (pos: { x: number, y: number }, excludeWallId?: string) => {
    let bestPoint = { ...pos };
    let minDist = SNAP_DISTANCE;

    if (gridVisible) {
      const gx = snapToGrid(pos.x);
      const gy = snapToGrid(pos.y);
      const d = Math.sqrt((pos.x - gx) ** 2 + (pos.y - gy) ** 2);
      if (d < minDist) {
        bestPoint = { x: gx, y: gy };
        minDist = d;
      }
    }

    visibleElements.forEach(el => {
      if (el.type !== 'wall' && el.points) {
        for (let i = 0; i < el.points.length; i += 2) {
          const px = el.points[i] + (el.x || 0);
          const py = el.points[i + 1] + (el.y || 0);
          const d = Math.sqrt((pos.x - px) ** 2 + (pos.y - py) ** 2);
          if (d < minDist) {
            bestPoint = { x: px, y: py };
            minDist = d;
          }
        }
      }
    });

    const wallSnap = findWallSnap(bestPoint, wallElements, { excludeId: excludeWallId });
    return wallSnap.kind === 'free' ? bestPoint : wallSnap.point;
  };

  const handleStageMouseDown = (e: CanvasStageEvent) => {
    const stage = e.target.getStage();
    if (e.evt.button === 1 || (e.evt.button === 0 && (e.evt.altKey || isSpacePressedRef.current))) {
      e.evt.preventDefault();
      isInnerPanningRef.current = true;
      innerPanStartRef.current = { x: e.evt.clientX, y: e.evt.clientY, panX: innerPan.x, panY: innerPan.y };
      if (stage) {
        stage.container().style.cursor = 'grabbing';
        if (infiniteHostRef.current) infiniteHostRef.current.style.cursor = 'grabbing';
      }
      return;
    }

    if (tool === 'eraser') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) setSelectedIds([]);
      return;
    }

    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) setSelectedIds([]);
      return;
    }
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;
    const snapped = findSnapPoint(pos);

    if (['wall', 'window', 'door', 'evacuation-route', 'rescue-route', 'scale'].includes(tool)) {
      setIsDrawing(true);
      setCurrentLine([snapped.x, snapped.y, snapped.x, snapped.y]);
      return;
    }

    if (['symbol', 'rect', 'text', 'stairs', 'elevator', 'column'].includes(tool as string)) {
      const typeMap = { symbol: 'symbol', rect: 'rect', text: 'text', stairs: 'stairs', elevator: 'elevator', column: 'column' } as const;
      const canvasTool = tool as keyof typeof typeMap;

      const baseElement: Record<string, unknown> = {
        type: typeMap[canvasTool],
        x: snapped.x,
        y: snapped.y,
      };

      // Use toolOptions for tool-specific properties
      if (tool === 'stairs') {
        const opts = toolOptions.stairs as StairsToolOptions;
        Object.assign(baseElement, {
          width: opts.width || 100,
          height: opts.height || 130,
          stairsType: opts.stairsType || 'straight',
          color: '#94a3b8',
        });
      } else if (tool === 'wall') {
        const opts = toolOptions.wall as WallToolOptions;
        Object.assign(baseElement, {
          width: 200,
          height: 10,
          wallStyle: opts.style || 'hatch',
          thickness: opts.thickness || 12,
        });
      } else if (tool === 'door') {
        const opts = toolOptions.door as DoorToolOptions;
        Object.assign(baseElement, {
          width: opts.width || 80,
          doorSwing: opts.swingDirection || 'right',
        });
      } else if (tool === 'window') {
        const opts = toolOptions.window as WindowToolOptions;
        Object.assign(baseElement, {
          width: opts.width || 100,
          height: opts.height || 10,
          windowPanes: opts.panes || 2,
        });
      } else if (tool === 'elevator') {
        const opts = toolOptions.elevator as ElevatorToolOptions;
        Object.assign(baseElement, {
          width: opts.width || 150,
          height: opts.height || 150,
          label: 'ASANSÖR',
        });
      } else if (tool === 'column') {
        const opts = toolOptions.column as ColumnToolOptions;
        Object.assign(baseElement, {
          width: opts.size || 40,
          height: opts.size || 40,
          columnShape: opts.shape || 'square',
        });
      } else if (tool === 'text') {
        const opts = toolOptions.text as TextToolOptions;
        Object.assign(baseElement, {
          label: 'METİN EKLE',
          fontSize: opts.fontSize || 16,
          fontWeight: opts.fontWeight || 'bold',
          color: opts.color || '#050b16',
          textAlign: opts.textAlign || 'left',
        });
      } else if (tool === 'symbol') {
        Object.assign(baseElement, {
          symbolType: useEditorStore.getState().selectedSymbol || 'exit',
        });
      } else if (tool === 'rect') {
        const opts = toolOptions.rect;
        Object.assign(baseElement, {
          width: opts.width || 100,
          height: opts.height || 100,
          color: opts.color || '#050b16',
        });
      }

      addElement(baseElement as Partial<EditorElement>);
      if (tool !== 'symbol') setTool('select');
    }
  };

  const handleStageMouseMove = (e: CanvasStageEvent) => {
    // Safety check for inner panning
    if (isInnerPanningRef.current && e.evt.buttons === 0) {
      isInnerPanningRef.current = false;
      const stage = e.target.getStage();
      if (stage) stage.container().style.cursor = isSpacePressedRef.current ? 'grab' : 'default';
      return;
    }

    if (isInnerPanningRef.current) {
      const dx = e.evt.clientX - innerPanStartRef.current.x;
      const dy = e.evt.clientY - innerPanStartRef.current.y;
      setInnerPan({
        x: innerPanStartRef.current.panX + dx / zoom,
        y: innerPanStartRef.current.panY + dy / zoom
      });
      return;
    }

    if (!isDrawing || !currentLine) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;
    const snapped = findSnapPoint(pos);

    // Magnetic alignment logic (Smart Guides)
    let magneticAxis: { axis: 'x' | 'y', pos: number } | null = null;
    if (!e.evt.shiftKey) {
      const minAlignDist = 15 / (zoom * innerZoom);
      for (const w of wallElements) {
        if (!w.points) continue;
        for (let i = 0; i < w.points.length; i += 2) {
          const px = w.points[i] + (w.x || 0);
          const py = w.points[i + 1] + (w.y || 0);
          // Skip if this is the start point of the current line
          if (Math.abs(px - currentLine[0]) < 0.1 && Math.abs(py - currentLine[1]) < 0.1) continue;

          if (Math.abs(snapped.x - px) < minAlignDist) {
            snapped.x = px;
            magneticAxis = { axis: 'x', pos: px };
          }
          if (Math.abs(snapped.y - py) < minAlignDist) {
            snapped.y = py;
            magneticAxis = { axis: 'y', pos: py };
          }
        }
      }
    }
    setAlignLine(magneticAxis);

    // Ortho Snap Logic (Shift key or auto-snap near straight lines)
    const dx = snapped.x - currentLine[0];
    const dy = snapped.y - currentLine[1];
    const angle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);

    if (e.evt.shiftKey) {
      if (angle < 45 || angle > 135) {
        snapped.y = currentLine[1]; // Force horizontal
        setOrthoLine({ axis: 'y', pos: currentLine[1] });
      } else {
        snapped.x = currentLine[0]; // Force vertical
        setOrthoLine({ axis: 'x', pos: currentLine[0] });
      }
    } else {
      // Auto-ortho if within 5 degrees
      if (angle < 5 || angle > 175 || (angle > 175 && angle < 185)) {
        snapped.y = currentLine[1];
        setOrthoLine({ axis: 'y', pos: currentLine[1] });
      } else if (Math.abs(angle - 90) < 5 || Math.abs(angle - 270) < 5) {
        snapped.x = currentLine[0];
        setOrthoLine({ axis: 'x', pos: currentLine[0] });
      } else {
        setOrthoLine(null);
      }
    }

    setCurrentLine([...currentLine.slice(0, 2), snapped.x, snapped.y]);
  };

  const calculateSnapToWall = (el: EditorElement, newX: number, newY: number) => {
    const points = el.points ?? [0, 0, newX, newY];
    const isPointBased = points.length >= 4;
    // Center of the element in canvas space (accounting for drag offset)
    const elCx = isPointBased ? (points[0] + points[2]) / 2 + newX : newX;
    const elCy = isPointBased ? (points[1] + points[3]) / 2 + newY : newY;

    const walls = elements.filter(e => e.type === 'wall' && e.layerId === el.layerId && e.id !== el.id);
    let minDistance = 60; // 60px snap threshold
    let snapPoint: { x: number; y: number } | null = null;
    let wallAngle = 0;

    walls.forEach(w => {
      if (!w.points) return;
      const [wx1, wy1, wx2, wy2] = wallPoints(w);

      const l2 = (wx1 - wx2) ** 2 + (wy1 - wy2) ** 2;
      if (l2 === 0) return;

      let t = ((elCx - wx1) * (wx2 - wx1) + (elCy - wy1) * (wy2 - wy1)) / l2;
      t = Math.max(0.05, Math.min(0.95, t)); // keep 5% from endpoints
      const projX = wx1 + t * (wx2 - wx1);
      const projY = wy1 + t * (wy2 - wy1);

      const dist = Math.sqrt((elCx - projX) ** 2 + (elCy - projY) ** 2);
      if (dist < minDistance) {
        minDistance = dist;
        snapPoint = { x: projX, y: projY };
        wallAngle = Math.atan2(wy2 - wy1, wx2 - wx1);
      }
    });

    if (snapPoint) {
      const sp = snapPoint as { x: number; y: number };
      if (isPointBased) {
        let L = Math.sqrt((points[0] - points[2]) ** 2 + (points[1] - points[3]) ** 2);
        if (L < 20) L = 80;

        // Preserve door/window orientation relative to wall direction
        const diff = ((wallAngle - Math.atan2(points[3] - points[1], points[2] - points[0])) + Math.PI * 2) % (Math.PI * 2);
        const targetAngle = (diff > Math.PI / 2 && diff < 3 * Math.PI / 2) ? wallAngle + Math.PI : wallAngle;

        const newPts = [
          sp.x - Math.cos(targetAngle) * L / 2,
          sp.y - Math.sin(targetAngle) * L / 2,
          sp.x + Math.cos(targetAngle) * L / 2,
          sp.y + Math.sin(targetAngle) * L / 2,
        ];
        return { points: newPts, x: 0, y: 0 };
      } else {
        return { x: sp.x, y: sp.y, rotation: wallAngle * 180 / Math.PI };
      }
    }
    // No snap — keep the dragged position
    return { x: newX, y: newY };
  };


  const handleStageMouseUp = (e: CanvasStageEvent) => {
    if (isInnerPanningRef.current) {
      isInnerPanningRef.current = false;
      const stage = e?.target?.getStage();
      if (stage) {
        stage.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair');
        if (infiniteHostRef.current) infiniteHostRef.current.style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair');
      }
      return;
    }

    if (isDrawing && currentLine) {
      if (tool === 'scale') {
        const pixels = Math.sqrt((currentLine[0] - currentLine[2]) ** 2 + (currentLine[1] - currentLine[3]) ** 2);
        if (pixels > 10) setScaleModal({ pixels });
        setIsDrawing(false);
        setCurrentLine(null);
        return;
      }

      if (['wall', 'window', 'door', 'evacuation-route', 'rescue-route'].includes(tool)) {
        const drawingTool = tool as 'wall' | 'window' | 'door' | 'evacuation-route' | 'rescue-route';
        let finalPoints = currentLine;
        let finalX = 0;
        let finalY = 0;

        if (wallLength(finalPoints) < 6) {
          setIsDrawing(false);
          setCurrentLine(null);
          setOrthoLine(null);
          setAlignLine(null);
          return;
        }

        if (drawingTool === 'window' || drawingTool === 'door') {
          const snapResult = calculateSnapToWall(
            { points: currentLine, layerId: useEditorStore.getState().activeLayerId, type: drawingTool, id: 'temp', x: 0, y: 0 },
            0, 0
          );
          if (snapResult.points) {
            finalPoints = snapResult.points;
            finalX = snapResult.x;
            finalY = snapResult.y;
          }
        }

        const elementType: EditorElement['type'] =
          drawingTool === 'evacuation-route' || drawingTool === 'rescue-route'
            ? 'route'
            : drawingTool;

        const elementData: Partial<EditorElement> = {
          type: elementType,
          color: drawingTool === 'wall' ? '#1e293b' : drawingTool === 'window' ? '#3b82f6' : drawingTool === 'door' ? '#f59e0b' : drawingTool === 'evacuation-route' ? '#00A550' : '#ef4444',
          routeType: drawingTool === 'evacuation-route' ? 'evacuation' : drawingTool === 'rescue-route' ? 'rescue' : undefined,
          wallStyle: drawingTool === 'wall' ? 'hatch' : undefined,
          thickness: drawingTool === 'window' || drawingTool === 'door' ? 8 : (drawingTool === 'wall' ? 12 : 4)
        };

        // Show dimension input overlay instead of committing immediately
        const [x1, y1, x2, y2] = finalPoints;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const stage = stageRef.current;
        if (!stage) return;

        const stageX = (midX + (finalX || 0)) * innerZoom + innerPan.x;
        const stageY = (midY + (finalY || 0)) * innerZoom + innerPan.y;
        
        // Use container's actual CSS scale for accurate screen positioning
        const container = stage.container();
        const stageRect = container.getBoundingClientRect();
        const cssScaleX = stageRect.width / stage.width();
        const cssScaleY = stageRect.height / stage.height();
        const screenX = stageRect.left + stageX * cssScaleX;
        const screenY = stageRect.top + stageY * cssScaleY;

        const drawnPixels = wallLength(finalPoints);
        const displayVal = toDisplayUnit(drawnPixels);

        setDimInput({
          screenX,
          screenY: screenY - 60,
          frozenLine: finalPoints,
          finalX,
          finalY,
          elementData,
          value: displayVal,
        });
        // Keep the preview line visible while input is open
        setIsDrawing(false);
        setCurrentLine(finalPoints);
        setOrthoLine(null);
        setAlignLine(null);
        return;
      }
    }
    setIsDrawing(false);
    setCurrentLine(null);
    setOrthoLine(null);
    setAlignLine(null);
    if (!['symbol', 'wall'].includes(tool)) setTool('select');
  };

  // handleWheel is called by the Konva Stage's onWheel prop.
  // When focused on the drawing region, apply inner zoom anchored to mouse position.
  const handleWheel = (e: CanvasWheelEvent) => {
    e.evt.preventDefault();
    const drawingFocused = focusedRegionId === drawingRegion?.id;
    if (!drawingFocused) return;

    const scaleBy = 1.10;
    const stage = stageRef.current;
    if (!stage) return;

    const oldZoom = innerZoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newZoom = Math.max(0.05, Math.min(20, oldZoom * (direction > 0 ? scaleBy : 1 / scaleBy)));

    // Anchor: keep the point under mouse fixed
    const mousePointTo = {
      x: (pointer.x - innerPan.x) / oldZoom,
      y: (pointer.y - innerPan.y) / oldZoom,
    };
    const newPanX = pointer.x - mousePointTo.x * newZoom;
    const newPanY = pointer.y - mousePointTo.y * newZoom;

    setInnerZoom(newZoom);
    setInnerPan({ x: newPanX, y: newPanY });
  };

  const selectOrErase = (id: string, isLocked?: boolean, e?: CanvasStageEvent) => {
    if (isLocked) return;
    if (focusedRegionId) setFocusedRegionId(null);
    if (tool === 'eraser') {
      removeElements([id]);
      return;
    }
    if (e && e.evt && e.evt.shiftKey) {
      const { selectedIds, setSelectedIds } = useEditorStore.getState();
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

  // ── CAD-grade element renderers ──

  const renderStairs = (el: EditorElement, isSelected: boolean, canInteract: boolean, isLocked?: boolean) => {
    const w = el.width || 100;
    const h = el.height || 120;
    const type = el.stairsType || 'straight';
    const sc = isSelected ? themeConfig.accent : '#1e293b';
    const sg = '#475569';
    const dragProps = {
      draggable: canInteract,
      onClick: (e: CanvasStageEvent) => selectOrErase(el.id, isLocked, e),
      onDragStart: () => !isLocked && setSelectedIds([el.id]),
      onDragEnd: (e: CanvasStageEvent) => updateElement(el.id, { x: e.target.x(), y: e.target.y() }),
      onMouseEnter: (e: CanvasStageEvent) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } },
      onMouseLeave: (e: CanvasStageEvent) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); },
    };

    /* ─── STRAIGHT ──────────────────────────────────────────── */
    if (type === 'straight') {
      const steps = Math.max(4, Math.floor(h / 10));
      const stepH = h / steps;
      return (
        <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="white" stroke={sc} strokeWidth={1.8} cornerRadius={2} />
          {Array.from({ length: steps - 1 }).map((_, i) => (
            <Line key={i} points={[-w / 2, -h / 2 + stepH * (i + 1), w / 2, -h / 2 + stepH * (i + 1)]} stroke={sg} strokeWidth={0.8} />
          ))}
          {/* Center axis line */}
          <Line points={[0, h / 2 - 8, 0, -h / 2 + 16]} stroke={sc} strokeWidth={1.2} />
          {/* Arrow head at top */}
          <Line points={[-5, -h / 2 + 22, 0, -h / 2 + 16, 5, -h / 2 + 22]} stroke={sc} strokeWidth={1.5} />
          <Line points={[0, -h / 2 + 16, 0, -h / 2 + 14]} stroke={sc} strokeWidth={1.5} />
          <Shape sceneFunc={(ctx) => {
            ctx.beginPath();
            ctx.moveTo(-5, -h / 2 + 18);
            ctx.lineTo(0, -h / 2 + 10);
            ctx.lineTo(5, -h / 2 + 18);
            ctx.closePath();
            ctx.fillStyle = sc;
            ctx.fill();
          }} />
          {/* Label */}
          <Text text="DÜZ" x={-w / 2} y={h / 2 + 4} width={w} align="center" fontSize={8} fontStyle="bold" fill={sg} />
          {isSelected && <Rect x={-w / 2 - 3} y={-h / 2 - 3} width={w + 6} height={h + 6} stroke={themeConfig.accent} strokeWidth={1.5} dash={[5, 3]} fill="transparent" cornerRadius={3} />}
        </Group>
      );
    }

    /* ─── L-SHAPE ───────────────────────────────────────────── */
    if (type === 'l-shape') {
      const vW = w * 0.42;
      const hH = h * 0.42;
      const landW = w - vW;
      const landH = h - hH;
      const vSteps = Math.max(3, Math.floor(hH / 10));
      const hSteps = Math.max(3, Math.floor(vW / 10));
      return (
        <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          {/* Outer bounding box */}
          <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="transparent" stroke={sc} strokeWidth={1.5} cornerRadius={2} />
          {/* Vertical flight - bottom left */}
          {Array.from({ length: vSteps - 1 }).map((_, i) => (
            <Line key={`v${i}`}
              points={[-w / 2, -h / 2 + landH + (hH / vSteps) * (i + 1), -w / 2 + vW, -h / 2 + landH + (hH / vSteps) * (i + 1)]}
              stroke={sg} strokeWidth={0.9}
            />
          ))}
          <Line points={[-w / 2 + vW / 2, h / 2 - 4, -w / 2 + vW / 2, -h / 2 + landH + 4]} stroke={sc} strokeWidth={1.1} />
          <Shape sceneFunc={(ctx) => {
            const ax = -w / 2 + vW / 2; const ay = -h / 2 + landH + 8;
            ctx.beginPath(); ctx.moveTo(ax - 4, ay + 8); ctx.lineTo(ax, ay); ctx.lineTo(ax + 4, ay + 8); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          {/* Landing platform */}
          <Rect x={-w / 2} y={-h / 2} width={vW} height={landH} fill="#f8fafc" stroke={sg} strokeWidth={0.8} />
          <Rect x={-w / 2} y={-h / 2} width={vW} height={landH} fill="transparent" stroke={sg} strokeWidth={0.5} />
          {/* Horizontal flight - top right */}
          {Array.from({ length: hSteps - 1 }).map((_, i) => (
            <Line key={`h${i}`}
              points={[-w / 2 + vW + (landW / hSteps) * (i + 1), -h / 2, -w / 2 + vW + (landW / hSteps) * (i + 1), -h / 2 + hH]}
              stroke={sg} strokeWidth={0.9}
            />
          ))}
          <Line points={[w / 2 - 4, -h / 2 + hH / 2, -w / 2 + vW + 4, -h / 2 + hH / 2]} stroke={sc} strokeWidth={1.1} />
          <Shape sceneFunc={(ctx) => {
            const ax = w / 2 - 8; const ay = -h / 2 + hH / 2;
            ctx.beginPath(); ctx.moveTo(ax - 8, ay - 4); ctx.lineTo(ax, ay); ctx.lineTo(ax - 8, ay + 4); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          <Text text="L" x={-w / 2} y={h / 2 + 4} width={w} align="center" fontSize={8} fontStyle="bold" fill={sg} />
          {isSelected && <Rect x={-w / 2 - 3} y={-h / 2 - 3} width={w + 6} height={h + 6} stroke={themeConfig.accent} strokeWidth={1.5} dash={[5, 3]} fill="transparent" cornerRadius={3} />}
        </Group>
      );
    }

    /* ─── SPIRAL ─────────────────────────────────────────────── */
    if (type === 'spiral') {
      const r = Math.min(w, h) / 2;
      const innerR = r * 0.15;
      const segCount = 14;
      return (
        <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          {/* Outer circle */}
          <Circle radius={r} fill="white" stroke={sc} strokeWidth={1.8} />
          {/* Inner core circle */}
          <Circle radius={innerR} fill="#e2e8f0" stroke={sc} strokeWidth={1.2} />
          <Circle x={0} y={0} radius={2.5} fill={sc} />
          {/* Radial step lines */}
          {Array.from({ length: segCount }).map((_, i) => {
            const angle = (i / segCount) * Math.PI * 2 - Math.PI / 2;
            return (
              <Line key={i}
                points={[Math.cos(angle) * innerR, Math.sin(angle) * innerR, Math.cos(angle) * r, Math.sin(angle) * r]}
                stroke={sg} strokeWidth={0.8}
              />
            );
          })}
          {/* Direction arc + arrow (like reference image) */}
          <Shape sceneFunc={(ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.55, -Math.PI * 0.1, Math.PI * 0.5);
            ctx.strokeStyle = sc;
            ctx.lineWidth = 1.3;
            ctx.stroke();
            // Arrow tip
            const tipAngle = Math.PI * 0.5;
            const tx = Math.cos(tipAngle) * r * 0.55;
            const ty = Math.sin(tipAngle) * r * 0.55;
            ctx.beginPath();
            ctx.moveTo(tx - 4, ty - 6);
            ctx.lineTo(tx + 2, ty);
            ctx.lineTo(tx + 7, ty - 5);
            ctx.strokeStyle = sc;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }} />
          <Text text="SP" x={-r} y={r + 4} width={r * 2} align="center" fontSize={8} fontStyle="bold" fill={sg} />
          {isSelected && <Circle radius={r + 3} stroke={themeConfig.accent} strokeWidth={1.5} dash={[5, 3]} fill="transparent" />}
        </Group>
      );
    }

    /* ─── CORE (Apartman Boşluğu) ───────────────────────────── */
    if (type === 'core') {
      const flightW = w * 0.28;
      const voidW = w * 0.44;
      const voidH = h * 0.5;
      const leftX = -w / 2;
      const rightX = w / 2 - flightW;
      const steps = Math.max(4, Math.floor(h / 14));
      const stepH = h / steps;
      return (
        <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          {/* Outer box */}
          <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="white" stroke={sc} strokeWidth={1.8} cornerRadius={2} />
          {/* Central void (dashed) */}
          <Rect x={-voidW / 2} y={-voidH / 2} width={voidW} height={voidH} fill="transparent" stroke={sg} strokeWidth={0.8} dash={[4, 2.5]} />
          <Text text="BOŞLUK" x={-voidW / 2} y={-6} width={voidW} align="center" fontSize={7} fill={sg} />
          {/* Left flight - going UP, fish-bone style */}
          {Array.from({ length: steps - 1 }).map((_, i) => (
            <Line key={`ll${i}`}
              points={[leftX, -h / 2 + stepH * (i + 1), leftX + flightW, -h / 2 + stepH * (i + 1)]}
              stroke={sg} strokeWidth={0.9}
            />
          ))}
          {Array.from({ length: steps - 1 }).map((_, i) => (
            <Line key={`lb${i}`}
              points={[leftX + flightW * 0.3, -h / 2 + stepH * (i + 1), leftX - 4, -h / 2 + stepH * (i + 1) + 5]}
              stroke={sg} strokeWidth={0.7}
            />
          ))}
          <Line points={[leftX + flightW / 2, h / 2 - 6, leftX + flightW / 2, -h / 2 + 16]} stroke={sc} strokeWidth={1.2} />
          <Shape sceneFunc={(ctx) => {
            const ax = leftX + flightW / 2; const ay = -h / 2 + 18;
            ctx.beginPath(); ctx.moveTo(ax - 4, ay + 8); ctx.lineTo(ax, ay); ctx.lineTo(ax + 4, ay + 8); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          {/* Right flight - going DOWN */}
          {Array.from({ length: steps - 1 }).map((_, i) => (
            <Line key={`rl${i}`}
              points={[rightX, -h / 2 + stepH * (i + 1), rightX + flightW, -h / 2 + stepH * (i + 1)]}
              stroke={sg} strokeWidth={0.9}
            />
          ))}
          {Array.from({ length: steps - 1 }).map((_, i) => (
            <Line key={`rb${i}`}
              points={[rightX + flightW * 0.7, -h / 2 + stepH * (i + 1), rightX + flightW + 4, -h / 2 + stepH * (i + 1) + 5]}
              stroke={sg} strokeWidth={0.7}
            />
          ))}
          <Line points={[rightX + flightW / 2, -h / 2 + 6, rightX + flightW / 2, h / 2 - 16]} stroke={sc} strokeWidth={1.2} />
          <Shape sceneFunc={(ctx) => {
            const ax = rightX + flightW / 2; const ay = h / 2 - 18;
            ctx.beginPath(); ctx.moveTo(ax - 4, ay - 8); ctx.lineTo(ax, ay); ctx.lineTo(ax + 4, ay - 8); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          <Text text="CORE" x={-w / 2} y={h / 2 + 4} width={w} align="center" fontSize={8} fontStyle="bold" fill={sg} />
          {isSelected && <Rect x={-w / 2 - 3} y={-h / 2 - 3} width={w + 6} height={h + 6} stroke={themeConfig.accent} strokeWidth={1.5} dash={[5, 3]} fill="transparent" cornerRadius={3} />}
        </Group>
      );
    }

    return null;
  };




  const renderElevator = (el: EditorElement, isSelected: boolean, canInteract: boolean, isLocked?: boolean) => {
    const w = el.width || 80;
    const h = el.height || 80;
    return (
      <Group
        key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}
        draggable={canInteract}
        onClick={(e) => selectOrErase(el.id, isLocked, e)}
        onDragStart={(e: CanvasStageEvent) => { if (!isLocked && !selectedIds.includes(el.id)) { setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]); } }}
        onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
        onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        {/* Elevator box */}
        <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="white" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        {/* Diagonal cross */}
        <Line points={[-w / 2, -h / 2, w / 2, h / 2]} stroke="#94a3b8" strokeWidth={1} />
        <Line points={[w / 2, -h / 2, -w / 2, h / 2]} stroke="#94a3b8" strokeWidth={1} />
        {/* Center circle */}
        <Circle x={0} y={0} radius={8} fill="white" stroke="#1e293b" strokeWidth={1.5} />
        <Text text="E" x={-5} y={-6} fontSize={10} fontStyle="bold" fill="#1e293b" />
        {isSelected && <Rect x={-w / 2 - 2} y={-h / 2 - 2} width={w + 4} height={h + 4} stroke={themeConfig.accent} strokeWidth={2} dash={[6, 3]} fill="transparent" />}
      </Group>
    );
  };

  const renderColumn = (el: EditorElement, isSelected: boolean, canInteract: boolean, isLocked?: boolean) => {
    const size = el.width || 30;
    return (
      <Group
        key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}
        draggable={canInteract}
        onClick={(e) => selectOrErase(el.id, isLocked, e)}
        onDragStart={(e: CanvasStageEvent) => { if (!isLocked && !selectedIds.includes(el.id)) { setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]); } }}
        onDragEnd={(e) => {
          const updates = calculateSnapToWall(el, e.target.x(), e.target.y());
          updateElement(el.id, updates);
        }}
        onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        {/* White mask behind column to trim the wall */}
        {el.columnShape === 'circle' ? (
          <Circle radius={size / 2 + 2} fill="white" />
        ) : (
          <Rect x={-size / 2 - 2} y={-size / 2 - 2} width={size + 4} height={size + 4} fill="white" />
        )}
        {/* Column Fill */}
        {el.columnShape === 'circle' ? (
          <Circle radius={size / 2} fill="#e2e8f0" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        ) : (
          <Rect x={-size / 2} y={-size / 2} width={size} height={size} fill="#e2e8f0" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        )}
        {/* Cross hatch for column */}
        <Group>
          <Line points={[-size / 2, -size / 2, size / 2, size / 2]} stroke="#94a3b8" strokeWidth={0.8} />
          <Line points={[size / 2, -size / 2, -size / 2, size / 2]} stroke="#94a3b8" strokeWidth={0.8} />
        </Group>
        {isSelected && <Rect x={-size / 2 - 4} y={-size / 2 - 4} width={size + 8} height={size + 8} stroke={themeConfig.accent} strokeWidth={2} dash={[4, 2]} fill="transparent" />}
      </Group>
    );
  };

  const renderDoorArc = (el: EditorElement, isSelected: boolean, canInteract: boolean, isLocked?: boolean) => {
    const pts = el.points || [0, 0, 80, 0];
    const dx = pts[2] - pts[0];
    const dy = pts[3] - pts[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const xOffset = el.x || 0;
    const yOffset = el.y || 0;

    return (
      <Group
        key={el.id} x={xOffset} y={yOffset}
        draggable={canInteract}
        onClick={(e) => selectOrErase(el.id, isLocked, e)}
        onDragStart={(e: CanvasStageEvent) => { if (!isLocked && !selectedIds.includes(el.id)) { setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]); } }}
        onDragEnd={(e) => {
          const updates = calculateSnapToWall(el, e.target.x(), e.target.y());
          updateElement(el.id, updates);
        }}
        onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        {/* White mask behind door to trim wall */}
        <Line points={pts} stroke="white" strokeWidth={16} lineCap="square" />

        <Group x={pts[0]} y={pts[1]} rotation={angle}>
          {/* Wall Caps (Jambs) to seal the trimmed wall */}
          <Line points={[0, -6, 0, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />
          <Line points={[length, -6, length, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />

          {/* Door leaf (drawn open at 90 degrees) */}
          <Line points={[0, 0, 0, length]} stroke={isSelected ? themeConfig.accent : (el.color || '#f59e0b')} strokeWidth={3} lineCap="round" />

          {/* Door swing arc */}
          <Shape
            sceneFunc={(ctx, shape) => {
              ctx.beginPath();
              ctx.arc(0, 0, length, 0, Math.PI / 2);
              ctx.strokeStyle = el.color || '#f59e0b';
              ctx.lineWidth = 1.5;
              ctx.setLineDash([5, 4]);
              ctx.stroke();
              ctx.fillStrokeShape(shape);
            }}
          />
        </Group>

        {isSelected && <Circle x={pts[0] + dx / 2} y={pts[1] + dy / 2} radius={length / 2 + 15} stroke={themeConfig.accent} strokeWidth={1.5} dash={[4, 4]} />}
      </Group>
    );
  };

  const renderWindow = (el: EditorElement, isSelected: boolean, canInteract: boolean, isLocked?: boolean) => {
    const pts = el.points || [0, 0, 0, 0];
    const dx = pts[2] - pts[0];
    const dy = pts[3] - pts[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const xOffset = el.x || 0;
    const yOffset = el.y || 0;

    return (
      <Group
        key={el.id} x={xOffset} y={yOffset}
        draggable={canInteract}
        onClick={(e) => selectOrErase(el.id, isLocked, e)}
        onDragStart={(e: CanvasStageEvent) => { if (!isLocked && !selectedIds.includes(el.id)) { setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]); } }}
        onDragEnd={(e) => {
          const updates = calculateSnapToWall(el, e.target.x(), e.target.y());
          updateElement(el.id, updates);
        }}
        onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        {/* White mask behind window to trim wall */}
        <Line points={pts} stroke="white" strokeWidth={16} lineCap="square" />

        <Group x={pts[0]} y={pts[1]} rotation={angle}>
          {/* Wall Caps (Jambs) to seal the trimmed wall */}
          <Line points={[0, -6, 0, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />
          <Line points={[length, -6, length, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />

          {/* Window Frame outer */}
          <Rect x={0} y={-4} width={length} height={8} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
          {/* Window Glass inner */}
          <Line points={[0, 0, length, 0]} stroke="#3b82f6" strokeWidth={2} />
          <Line points={[0, -2, length, -2]} stroke="#bfdbfe" strokeWidth={1} />
          <Line points={[0, 2, length, 2]} stroke="#bfdbfe" strokeWidth={1} />
        </Group>

        {isSelected && <Rect x={Math.min(pts[0], pts[2]) - 10} y={Math.min(pts[1], pts[3]) - 10} width={Math.abs(dx) + 20} height={Math.abs(dy) + 20} stroke={themeConfig.accent} strokeWidth={1.5} dash={[4, 4]} fill="transparent" />}
      </Group>
    );
  };

  const renderCorporateIcon = (symbolId: string, size: number, color: string, isSelected: boolean = false) => {
    const r = size / 2;
    // Basic rectangle fallback for now - will be expanded with actual SVGs or Konva primitives
    return (
      <Group shadowBlur={isSelected ? 0 : 2} shadowOpacity={0.15}>
        <Rect width={size} height={size} x={-r} y={-r} fill={color} cornerRadius={4} stroke="white" strokeWidth={0.5} />
        <Text text={symbolId.substring(0, 2).toUpperCase()} fill="white" fontSize={size * 0.4} fontStyle="bold" align="center" verticalAlign="middle" width={size} height={size} x={-r} y={-r} />
      </Group>
    );
  };

  const mergedTemplateState = mergeTemplateState(templateState);

  useEffect(() => {
    const missingSignedUrls = Object.entries(templateState).filter(([, value]) => value.imagePath && !signedAssetPathRef.current.has(value.imagePath));
    if (missingSignedUrls.length === 0) return;

    let cancelled = false;
    missingSignedUrls.forEach(([regionId, value]) => {
      if (!value.imagePath) return;
      signedAssetPathRef.current.add(value.imagePath);
      void getTemplateRegionAssetUrl(value.imagePath)
        .then((signedUrl) => {
          if (!cancelled) updateTemplateRegion(regionId, { imageUrl: signedUrl });
        })
        .catch((error) => {
          console.error('Template region signed URL failed:', error);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [templateState, updateTemplateRegion]);

  const handleRegionImageUpload = async (regionId: string, file: File | null) => {
    if (!file || !user?.id) return;
    if (!projectId) {
      updateTemplateRegion(regionId, {
        imageUrl: URL.createObjectURL(file),
        imageAlt: file.name,
        mediaMode: 'visual-first',
      });
      return;
    }

    setUploadingRegionId(regionId);
    try {
      const { path, signedUrl } = await uploadTemplateRegionAsset({
        file,
        userId: user.id,
        projectId,
        regionId,
      });
      updateTemplateRegion(regionId, {
        imagePath: path,
        imageUrl: signedUrl,
        imageAlt: file.name,
        mediaMode: 'visual-first',
      });
    } catch (error) {
      console.error('Template region asset upload failed:', error);
    } finally {
      setUploadingRegionId(null);
    }
  };

  const clearRegionImage = (regionId: string) => {
    updateTemplateRegion(regionId, {
      imagePath: '',
      imageUrl: '',
      imageAlt: '',
      mediaMode: 'visual-first',
    });
  };

  const handleProjectLogoUpload = async (file: File | null) => {
    if (!file) return;
    setIsLogoLoading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      if (dataUrl) {
        setProjectMetadata({ logoUrl: dataUrl });
      }
    } catch (error) {
      console.error('Project logo upload failed:', error);
    } finally {
      setIsLogoLoading(false);
    }
  };

  const setCanvasHostRef = (node: HTMLDivElement | null) => {
    stageHostRef.current = node;
    setContainerNode(node);
  };

  const getPaperDropPlacement = (
    event: React.DragEvent<HTMLDivElement>,
    offset: { x: number; y: number } = { x: 0, y: 0 }
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100 - offset.x;
    const y = ((event.clientY - rect.top) / rect.height) * 100 - offset.y;
    return {
      x: Math.max(0, Math.min(92, x)),
      y: Math.max(0, Math.min(92, y)),
    };
  };

  const handlePaperDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (
      event.dataTransfer.types.includes('application/planify-module') ||
      event.dataTransfer.types.includes('application/planify-existing-module')
    ) {
      event.preventDefault();
      event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/planify-existing-module') ? 'move' : 'copy';
    }
  };

  const handlePaperDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const moduleType = event.dataTransfer.getData('application/planify-module');
    const existingModuleId = event.dataTransfer.getData('application/planify-existing-module');
    if (!moduleType && !existingModuleId) return;

    event.preventDefault();
    event.stopPropagation();

    let offset = { x: 0, y: 0 };
    try {
      const rawOffset = event.dataTransfer.getData('application/planify-module-offset');
      if (rawOffset) offset = JSON.parse(rawOffset) as { x: number; y: number };
    } catch {
      offset = { x: 0, y: 0 };
    }

    const placement = getPaperDropPlacement(event, offset);
    if (existingModuleId) {
      updateTemplateModule(existingModuleId, placement);
      setSelectedTemplateModuleId(existingModuleId);
      return;
    }

    addTemplateModule(moduleType as Parameters<typeof addTemplateModule>[0], placement);
  };

  const handleModuleDragPointerDown = (event: React.PointerEvent<HTMLDivElement>, regionId: string) => {
    const templateModule = activeTemplateModules.find(m => m.id === regionId);
    const paperNode = stageHostRef.current;
    if (!templateModule || !paperNode || templateModule.movable === false || isPreview) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedTemplateModuleId(regionId);

    const paperRect = paperNode.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startModX = templateModule.x;
    const startModY = templateModule.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / paperRect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / paperRect.height) * 100;
      
      const res = calculateModuleSnap(
        'drag', '',
        startModX + deltaX, startModY + deltaY,
        templateModule.w, templateModule.h,
        activeTemplateModules, regionId
      );

      setModuleSnapLines(res.lines);
      updateTemplateModule(regionId, { x: res.x, y: res.y });
    };

    const handlePointerUp = () => {
      setModuleSnapLines([]);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleModuleResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    regionId: string,
    direction: string = 'se'
  ) => {
    const templateModule = activeTemplateModules.find(m => m.id === regionId);
    const paperNode = stageHostRef.current;
    if (!templateModule || !paperNode || templateModule.resizable === false || isPreview) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedTemplateModuleId(regionId);

    const paperRect = paperNode.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = templateModule.w;
    const startH = templateModule.h;
    const startModX = templateModule.x;
    const startModY = templateModule.y;
    const aspect = startW / startH;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaW = ((moveEvent.clientX - startX) / paperRect.width) * 100;
      const deltaH = ((moveEvent.clientY - startY) / paperRect.height) * 100;
      
      let newW = startW;
      let newH = startH;
      let newX = startModX;
      let newY = startModY;

      if (direction.includes('e')) newW = startW + deltaW;
      if (direction.includes('s')) newH = startH + deltaH;
      if (direction.includes('w')) {
        newW = startW - deltaW;
        newX = startModX + deltaW;
      }
      if (direction.includes('n')) {
        newH = startH - deltaH;
        newY = startModY + deltaH;
      }

      if (moveEvent.shiftKey && direction.length === 2) {
        if (Math.abs(newW / aspect) > Math.abs(newH)) {
          newH = newW / aspect;
        } else {
          newW = newH * aspect;
        }
        if (direction.includes('w')) newX = startModX + (startW - newW);
        if (direction.includes('n')) newY = startModY + (startH - newH);
      }

      if (newW < 2) { newW = 2; if (direction.includes('w')) newX = startModX + startW - 2; }
      if (newH < 2) { newH = 2; if (direction.includes('n')) newY = startModY + startH - 2; }

      const res = calculateModuleSnap(
        'resize', direction,
        newX, newY, newW, newH,
        activeTemplateModules, regionId
      );

      setModuleSnapLines(res.lines);
      updateTemplateModule(regionId, { x: res.x, y: res.y, w: res.w, h: res.h });
    };

    const handlePointerUp = () => {
      setModuleSnapLines([]);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Auto-center and fit paper when template is applied
  useEffect(() => {
    const host = infiniteHostRef.current;
    if (!host || !activeTemplateLayout || !page) return;
    const hw = host.offsetWidth;
    const hh = host.offsetHeight;

    const PAPER_MARGIN = 40;
    const maxPW = hw - PAPER_MARGIN * 2;
    const maxPH = hh - PAPER_MARGIN * 2;

    // Scale the absolute paper size so it fits inside the available viewport margin
    const fitZoom = Math.min(1.5, maxPW / page.width, maxPH / page.height);

    const centeredPanX = (hw - page.width * fitZoom) / 2;
    const centeredPanY = (hh - page.height * fitZoom) / 2;

    setZoom(fitZoom);
    setPan({ x: centeredPanX, y: centeredPanY });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplateLayout?.id, activeTemplateLayout?.page_preset]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
      return;
    }

    if (!window.location.pathname.startsWith('/editor')) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const debugWindow = window as DebugEditorWindow;
      const payload = sanitizeDebugEditorStatePayload({
        elements,
        layers,
        scaleConfig,
        projectTemplate,
        templateLayoutId,
        pagePreset: activeTemplateLayout?.page_preset,
        templateModules,
        templateState,
        selectedIds,
        invalidChildren: debugWindow.__konvaInvalidChildren ?? [],
        invalidChildrenText: document.documentElement.dataset.konvaInvalidChild ?? null,
        location: window.location.href,
      });
      const serializedPayload = JSON.stringify(payload);

      if (serializedPayload === lastDebugPayloadRef.current) {
        return;
      }

      lastDebugPayloadRef.current = serializedPayload;

      void fetch('/api/debug/editor-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializedPayload,
        keepalive: true,
      }).catch(() => {
        // Dev-only capture should never affect editing.
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeTemplateLayout?.page_preset,
    elements,
    layers,
    projectTemplate,
    scaleConfig,
    selectedIds,
    templateLayoutId,
    templateModules,
    templateState,
  ]);

  const memoizedWallData = wallElements.map(el => ({
    el,
    rpts: computeRenderPoints(el, wallElements)
  }));

  const renderedOtherElements = useMemo(() => {
    return visibleElements.filter(el => el.type !== 'wall').map((el) => {
      const isSelected = selectedIds.includes(el.id);
      const isLocked = layers.find(l => l.id === el.layerId)?.locked;
      const canInteract = tool === 'select' && !isLocked && !isSpacePressed;

      if (el.type === 'rect') {
        return (
          <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}>
            <Rect width={el.width} height={el.height} x={-el.width! / 2} y={-el.height! / 2} fill={el.color || 'transparent'} opacity={el.color ? 0.2 : 1} stroke={isSelected ? themeConfig.accent : (el.color || themeConfig.text)} strokeWidth={2} draggable={canInteract} onClick={(e) => selectOrErase(el.id, isLocked, e)} onDragStart={(e: CanvasStageEvent) => { if (!isLocked && !selectedIds.includes(el.id)) { setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]); } }} onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
              onMouseEnter={(e: CanvasStageEvent) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
              onMouseLeave={(e: CanvasStageEvent) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
            />
          </Group>
        );
      }
      if (el.type === 'stairs') {
        return renderStairs(el, isSelected, canInteract, isLocked);
      }
      if (el.type === 'elevator') {
        return renderElevator(el, isSelected, canInteract, isLocked);
      }
      if (el.type === 'column') {
        return renderColumn(el, isSelected, canInteract, isLocked);
      }
      if (el.type === 'door') {
        return renderDoorArc(el, isSelected, canInteract, isLocked);
      }
      if (el.type === 'window') {
        return renderWindow(el, isSelected, canInteract, isLocked);
      }
      if (el.type === 'route') {
        const pts = el.points || [0, 0, 0, 0];

        return (
          <Group
            key={el.id}
            draggable={canInteract}
            onClick={(e) => selectOrErase(el.id, isLocked, e)}
            onDragStart={(e: CanvasStageEvent) => { if (!isLocked && !selectedIds.includes(el.id)) { setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]); } }}
            onDragEnd={(e) => {
              updateElement(el.id, { x: e.target.x(), y: e.target.y() });
            }}
            onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
            onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
          >
            <Arrow
              points={pts}
              stroke={isSelected ? themeConfig.accent : (el.color || themeConfig.text)}
              strokeWidth={el.thickness || 8}
              fill={isSelected ? themeConfig.accent : (el.color || themeConfig.text)}
              pointerLength={12}
              pointerWidth={12}
              pointerAtBeginning={false}
              lineCap="round"
              dash={el.routeType === 'evacuation' ? [10, 6] : undefined}
              x={el.x || 0} y={el.y || 0}
            />
          </Group>
        )
      }
      if (el.type === 'symbol') {
        const sym = SYMBOLS.find(s => s.id === el.symbolType);
        const customSym = customSymbols.find(cs => cs.id === el.symbolType);
        const symId = el.symbolType || 'exit';
        const isoDataUrl = ISO_SYMBOLS[symId] || ISO_SYMBOLS[symId.toUpperCase()] || null;
        const sWidth = el.width || 36;
        return (
          <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} draggable={canInteract} onClick={(e) => selectOrErase(el.id, isLocked, e)} onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
            onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
            onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
          >
            {customSym ? (
              <CustomSymbolImage src={customSym.dataUrl} size={sWidth} isSelected={isSelected} />
            ) : isoDataUrl ? (
              <CustomSymbolImage src={isoDataUrl} size={sWidth} isSelected={isSelected} />
            ) : (
              renderCorporateIcon(symId, sWidth, el.color || sym?.color || '#ef4444', isSelected)
            )}
            {isSelected && <Rect width={sWidth + 8} height={sWidth + 8} x={-sWidth / 2 - 4} y={-sWidth / 2 - 4} stroke={themeConfig.accent} strokeWidth={2} dash={[4, 2]} />}
          </Group>
        )
      }
      if (el.type === 'text') {
        return (
          <Text
            key={el.id}
            x={el.x}
            y={el.y}
            rotation={el.rotation || 0}
            width={el.width}
            height={el.height}
            text={el.label || ''}
            fill={isSelected ? themeConfig.accent : (el.color || themeConfig.text)}
            fontSize={el.fontSize || 14}
            fontStyle={el.fontWeight || 'bold'}
            align={el.textAlign || 'left'}
            draggable={canInteract}
            onClick={(e) => selectOrErase(el.id, isLocked, e)}
            onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
            onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
            onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
          />
        );
      }
      return null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleElements, selectedIds, layers, tool, themeConfig, customSymbols, editorTheme]);

  const wallEndpointHandles = wallElements
    .filter((el) => selectedIds.includes(el.id))
    .flatMap((el) => {
      const pts = wallPoints(el);

      return ([0, 1] as const).map((endpointIndex) => {
        const x = pts[endpointIndex * 2];
        const y = pts[endpointIndex * 2 + 1];

        return (
          <Circle
            key={`wall-handle-${el.id}-${endpointIndex}`}
            x={x}
            y={y}
            radius={7}
            fill="white"
            stroke={themeConfig.accent}
            strokeWidth={2}
            shadowBlur={6}
            shadowOpacity={0.25}
            draggable={tool === 'select' && !layers.find(l => l.id === el.layerId)?.locked && !isSpacePressed}
            onDragMove={(e) => {
              if (e.evt.shiftKey) {
                const otherX = pts[(1 - endpointIndex) * 2];
                const otherY = pts[(1 - endpointIndex) * 2 + 1];
                const dx = e.target.x() - otherX;
                const dy = e.target.y() - otherY;

                if (Math.abs(dx) > Math.abs(dy)) {
                  e.target.y(otherY);
                } else {
                  e.target.x(otherX);
                }
              }
            }}
            onDragEnd={(e) => {
              const originalX = pts[endpointIndex * 2];
              const originalY = pts[endpointIndex * 2 + 1];
              const { updates } = buildWallEndpointUpdates(
                el,
                wallElements,
                endpointIndex,
                { x: e.target.x(), y: e.target.y() }
              );

              if (updates.length > 0) updateElementsBatch(updates);
              else e.target.position({ x: originalX, y: originalY });
            }}
          />
        );
      });
    });

  return (
    <main
      className="flex-1 relative overflow-hidden bg-slate-200"
      onClick={() => {
        if (mobileMenu) setMobileMenu(null);
        if (focusedRegionId) setFocusedRegionId(null);
        if (selectedIds.length > 0) setSelectedIds([]);
      }}
    >
      {/* Infinite canvas host — fills main, handles wheel+pan */}
      <div
        ref={infiniteHostRef}
        className="absolute inset-0"
        style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
      >
        {/* Dot-grid background pattern fixed in place */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: `${pan.x % 24}px ${pan.y % 24}px`,
            opacity: 0.35,
          }}
        />

        {/* Transform wrapper — everything moves together */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '0 0',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            willChange: 'transform',
          }}
        >
          {activeTemplateLayout && page ? (
            /* ── TEMPLATE MODE: HTML paper at absolute pixel size ── */
            <div
              ref={setCanvasHostRef}
              data-template-paper="true"
              onDragOver={handlePaperDragOver}
              onDrop={handlePaperDrop}
              style={{
                position: 'relative',
                width: paperWidth,
                height: paperHeight,
                background: 'white',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 50px -10px rgba(15,23,42,0.25), 0 0 0 1px rgba(148,163,184,0.3)',
                borderRadius: 3,
                overflow: 'hidden',
                fontSize: `${Math.max(14, paperWidth * 0.0125)}px`,
                touchAction: 'none',
              }}
            >
              {/* Fine grid overlay on paper */}
              <div className="template-grid-overlay absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,.03)_1px,transparent_1px),linear-gradient(rgba(15,23,42,.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />

              {/* "Geri Gel" button when a region is focused */}
              {focusedRegionId && (
                <button
                  onClick={(event) => { event.stopPropagation(); setFocusedRegionId(null); }}
                  className="absolute left-1/2 -translate-x-1/2 top-6 z-40 flex items-center gap-2 rounded-full bg-slate-900/95 backdrop-blur-md px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 group border border-white/10"
                >
                  <svg className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  Görünüme Dön
                </button>
              )}

                            {/* Module Snapping Guides */}
              {moduleSnapLines.map((line, i) => (
                <div
                  key={`snap-line-${i}`}
                  className="absolute z-[100] pointer-events-none"
                  style={{
                    [line.axis === 'x' ? 'left' : 'top']: `${line.pos}%`,
                    [line.axis === 'x' ? 'top' : 'left']: '0',
                    [line.axis === 'x' ? 'width' : 'height']: '1px',
                    [line.axis === 'x' ? 'height' : 'width']: '100%',
                    backgroundColor: '#0ea5e9', // cyan-500
                    boxShadow: '0 0 4px #0ea5e9',
                  }}
                />
              ))}

              <ModuleOverlay
                paperRegions={paperRegions}
                mergedTemplateState={mergedTemplateState}
                isPreview={isPreview}
                stageHostRef={stageHostRef}
                isLogoLoading={isLogoLoading}
                uploadingRegionId={uploadingRegionId}
                projectMetadata={projectMetadata}
                setProjectMetadata={setProjectMetadata}
                handleModuleResizePointerDown={handleModuleResizePointerDown}
                handleProjectLogoUpload={handleProjectLogoUpload}
                handleRegionImageUpload={handleRegionImageUpload}
                clearRegionImage={clearRegionImage}
                logoFileInputRef={logoFileInputRef}
                visibleElements={visibleElements}
              />
              {/* Drawing Region Wrapper and Konva Stage */}
              {drawingRegion && (() => {
                const isSelected = selectedTemplateModuleId === drawingRegion.id;
                const isFocused = focusedRegionId === drawingRegion.id;
                
                return (
                  <div
                    onClick={(event) => {
                      event.stopPropagation();
                      if (selectedIds.length > 0) setSelectedIds([]);
                      if (!isFocused) setFocusedRegionId(drawingRegion.id);
                      setSelectedTemplateModuleId(drawingRegion.id);
                    }}
                    className={cn(
                      "drawing-region-wrapper absolute z-20 bg-transparent rounded-[12px] box-border",
                      !isFocused && !isSelected && "overflow-hidden",
                      !focusedRegionId ? "border border-slate-300 hover:shadow-lg hover:border-cyan-400 cursor-pointer" : "",
                      isFocused ? "z-30 scale-[1.015] shadow-[0_20px_50px_rgba(8,145,178,0.3)] ring-4 ring-cyan-500/30 border-2 border-cyan-500" : "border-2 border-transparent",
                      focusedRegionId && !isFocused ? "pointer-events-none opacity-25 grayscale" : "",
                      isSelected && "outline outline-2 outline-offset-2 outline-cyan-400/80"
                    )}
                    style={{
                      left: `calc(${drawingRegion.x}% + 6px)`, top: `calc(${drawingRegion.y}% + 6px)`,
                      width: `calc(${drawingRegion.w}% - 12px)`, height: `calc(${drawingRegion.h}% - 12px)`,
                    }}
                  >
                    {!isPreview && isSelected && (
                      <>
                        {/* Floating toolbar above the drawing region */}
                        <div className="absolute -top-11 left-0 right-0 z-50 flex items-center justify-between pointer-events-none">
                          {/* Left: Move handle */}
                          <div
                            // eslint-disable-next-line react-hooks/refs
                            onPointerDown={(event) => handleModuleDragPointerDown(event, drawingRegion.id)}
                            className="pointer-events-auto h-8 w-8 flex items-center justify-center cursor-move rounded-lg border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-slate-600 hover:text-cyan-600 hover:border-cyan-400 hover:shadow-[0_4px_16px_rgba(8,145,178,0.2)] transition-all"
                            title="Taşı (Tutup Sürükleyin)"
                          >
                            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
                          </div>
                           {/* Right: Delete Only (No drawer editing for drawing area) */}
                          <div className="pointer-events-auto flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteDrawingId(drawingRegion.id); }}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-red-400 hover:text-red-600 hover:border-red-400 hover:bg-red-50 hover:shadow-[0_4px_16px_rgba(239,68,68,0.2)] transition-all"
                              title="Modülü Sil"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          </div>
                        </div>

                        {activeTemplateModules.find(m => m.id === drawingRegion.id)?.resizable !== false && (
                          <>
                            {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map(dir => {
                              const positions: Record<string, string> = {
                                nw: '-top-1.5 -left-1.5 cursor-nwse-resize',
                                n: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                                ne: '-top-1.5 -right-1.5 cursor-nesw-resize',
                                e: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize',
                                se: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                                s: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                                sw: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                                w: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize'
                              };
                              return (
                                <div
                                  key={dir}
                                  onPointerDown={(event) => handleModuleResizePointerDown(event, drawingRegion.id, dir)}
                                  className={cn(
                                    "absolute z-50 h-3.5 w-3.5 rounded-full border-2 border-white bg-cyan-500 shadow-md hover:scale-125 transition-transform",
                                    positions[dir]
                                  )}
                                  title={dir.length === 2 ? "Shift ile orantılı ölçeklendir" : "Boyutlandır"}
                                />
                              );
                            })}
                          </>
                        )}
                      </>
                    )}
                  <Stage
                    ref={stageRef}
                    width={stageWidth}
                    height={stageHeight}
                    onWheel={handleWheel}
                    onMouseDown={(e) => {
                      if (activeTemplateLayout && focusedRegionId !== drawingRegion.id) {
                        setFocusedRegionId(drawingRegion.id);
                        setSelectedTemplateModuleId(drawingRegion.id);
                        if (selectedIds.length > 0) setSelectedIds([]);
                      }
                      // eslint-disable-next-line react-hooks/refs
                      handleStageMouseDown(e);
                    }}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                    className="drawing-region-wrapper"
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: (!focusedRegionId || focusedRegionId === drawingRegion.id) ? 'auto' : 'none',
                      filter: (focusedRegionId && focusedRegionId !== drawingRegion.id) ? 'blur(20px)' : 'none',
                      transition: 'filter 0.3s ease-in-out',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <Layer clipX={0} clipY={0} clipWidth={stageWidth} clipHeight={stageHeight}>
                      {/* Drawing Content - Transformable */}
                      <Group
                        scaleX={innerZoom}
                        scaleY={innerZoom}
                        x={innerPan.x}
                        y={innerPan.y}
                      >
                        <GridRenderer gridVisible={gridVisible} themeConfig={themeConfig} editorTheme={editorTheme} gridSize={GRID_SIZE} size={2000} />

                        {/* Wall Rendering Passes (CAD-like) */}
                        {/* Pass 1: Outer Stroke (Black outline) */}
                        {memoizedWallData.map(({ el, rpts }) => {
                          const style = el.wallStyle || 'hatch';
                          if (style === 'double') return null;
                          return (
                            <Line
                              key={`wall-stroke-${el.id}`}
                              points={rpts}
                              stroke={selectedIds.includes(el.id) ? themeConfig.accent : '#1e293b'}
                              strokeWidth={el.thickness || 12}
                              lineCap="square"
                            />
                          );
                        })}

                        {/* Pass 2: Inner White Background */}
                        {memoizedWallData.map(({ el, rpts }) => {
                          const style = el.wallStyle || 'hatch';
                          if (style === 'solid' || style === 'double') return null;
                          return (
                            <Line
                              key={`wall-bg-${el.id}`}
                              points={rpts}
                              stroke="white"
                              strokeWidth={Math.max(1, (el.thickness || 12) - 2)}
                              lineCap="square"
                            />
                          );
                        })}

                        {/* Pass 3: Hatch/Double Pattern & Interaction */}
                        {memoizedWallData.map(({ el, rpts }) => {
                          const style = el.wallStyle || 'hatch';
                          const length = wallLength(rpts);
                          const nx = length > 0 ? -(rpts[3] - rpts[1]) / length : 0;
                          const ny = length > 0 ? (rpts[2] - rpts[0]) / length : 0;
                          const doubleOffset = Math.max(3, (el.thickness || 12) / 2);
                          return (
                            <Group
                              key={`wall-hatch-${el.id}`}
                              draggable={tool === 'select' && !layers.find(l => l.id === el.layerId)?.locked && !isSpacePressed}
                              onClick={(e) => {
                                if (tool === 'eraser') {
                                  removeElements([el.id]);
                                  return;
                                }
                                if (!layers.find(l => l.id === el.layerId)?.locked) selectOrErase(el.id, false, e);
                              }}
                              onDragStart={(e) => {
                                if (!layers.find(l => l.id === el.layerId)?.locked && !selectedIds.includes(el.id)) {
                                  setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]);
                                }
                              }}
                              onDragEnd={(e) => {
                                const dx = e.target.x();
                                const dy = e.target.y();
                                e.target.position({ x: 0, y: 0 });
                                updateElementsBatch(buildWallMoveUpdates(el, wallElements, dx, dy));
                              }}
                              onMouseEnter={(e) => { if (tool === 'select' && !isSpacePressed) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
                              onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressedRef.current ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
                            >
                              {/* Invisible hit area for better selection */}
                              <Line points={rpts} stroke="transparent" strokeWidth={(el.thickness || 12) + 6} hitStrokeWidth={(el.thickness || 12) + 12} />
                              {style === 'hatch' && (
                                <Shape
                                  sceneFunc={(context, shape) => {
                                    const pattern = getHatchPattern();
                                    if (pattern) {
                                      context.beginPath();
                                      context.moveTo(rpts[0], rpts[1]);
                                      context.lineTo(rpts[2], rpts[3]);
                                      context.strokeStyle = pattern;
                                      context.lineWidth = Math.max(1, (el.thickness || 12) - 2);
                                      context.lineCap = 'square';
                                      context.stroke();
                                    }
                                    context.fillStrokeShape(shape);
                                  }}
                                />
                              )}
                              {style === 'double' && (
                                <>
                                  <Line
                                    points={[rpts[0] + nx * doubleOffset, rpts[1] + ny * doubleOffset, rpts[2] + nx * doubleOffset, rpts[3] + ny * doubleOffset]}
                                    stroke={selectedIds.includes(el.id) ? themeConfig.accent : '#1e293b'}
                                    strokeWidth={2}
                                    lineCap="square"
                                  />
                                  <Line
                                    points={[rpts[0] - nx * doubleOffset, rpts[1] - ny * doubleOffset, rpts[2] - nx * doubleOffset, rpts[3] - ny * doubleOffset]}
                                    stroke={selectedIds.includes(el.id) ? themeConfig.accent : '#1e293b'}
                                    strokeWidth={2}
                                    lineCap="square"
                                  />
                                </>
                              )}
                              {/* Invisible hit box for easier clicking */}
                              <Line
                                points={rpts}
                                stroke="transparent"
                                strokeWidth={el.thickness || 12}
                                lineCap="square"
                              />
                            </Group>
                          );
                        })}

                        {/* Selected wall endpoint handles */}
                        {wallEndpointHandles}

                        {/* Other Elements */}
                        {renderedOtherElements}

                        {(isDrawing || dimInput) && currentLine && (() => {
                          const [x1, y1, x2, y2] = currentLine;
                          const px = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
                          const meters = toDisplayUnit(px);
                          const angle = wallAngleDegrees(currentLine);
                          const midX = (x1 + x2) / 2;
                          const midY = (y1 + y2) / 2;
                          const isWallPreview = tool === 'wall';
                          return (
                            <Group>
                              {/* Outer stroke */}
                              {isWallPreview && (
                                <Line
                                  points={currentLine}
                                  stroke="#1e293b"
                                  strokeWidth={12}
                                  opacity={0.4}
                                  lineCap="square"
                                />
                              )}
                              {/* Main preview line */}
                              {tool === 'evacuation-route' || tool === 'rescue-route' ? (
                                <Arrow
                                  points={currentLine}
                                  stroke={themeConfig.accent}
                                  strokeWidth={isWallPreview ? 10 : 3}
                                  fill={themeConfig.accent}
                                  pointerLength={10}
                                  pointerWidth={10}
                                  opacity={0.6}
                                  dash={[10, 6]}
                                  lineCap="round"
                                />
                              ) : (
                                <Line
                                  points={currentLine}
                                  stroke={themeConfig.accent}
                                  strokeWidth={isWallPreview ? 10 : 3}
                                  opacity={0.6}
                                  dash={undefined}
                                  lineCap="square"
                                />
                              )}
                              {/* Endpoint dots */}
                              <Circle x={x1} y={y1} radius={4} fill={themeConfig.accent} opacity={0.8} />
                              <Circle x={x2} y={y2} radius={4} fill={themeConfig.accent} opacity={0.8} />
                              {/* Live dimension label */}
                              {px > 20 && (
                                <Group x={midX} y={midY - 16 / zoom} scaleX={1 / zoom} scaleY={1 / zoom}>
                                  <Rect x={-46} y={-10} width={92} height={20} fill="#1e293b" cornerRadius={4} opacity={0.88} />
                                  <Text
                                    text={`${meters}${scaleConfig.unit}  ${angle}°`}
                                    x={-45} y={-7}
                                    fontSize={11}
                                    fontStyle="bold"
                                    fill="white"
                                    width={90}
                                    align="center"
                                  />
                                </Group>
                              )}
                            </Group>
                          );
                        })()}

                        {/* Alignment Guide Line (Smart Guides) */}
                        {alignLine && (
                          <Line
                            points={
                              alignLine.axis === 'y'
                                ? [-5000, alignLine.pos, 5000, alignLine.pos] // Horizontal tracking line
                                : [alignLine.pos, -5000, alignLine.pos, 5000] // Vertical tracking line
                            }
                            stroke="#3b82f6"
                            strokeWidth={1 / zoom}
                            dash={[5 / zoom, 5 / zoom]}
                            opacity={0.5}
                          />
                        )}

                        {/* Ortho Guide Line (AutoCAD tracking) */}
                        {orthoLine && (
                          <Line
                            points={
                              orthoLine.axis === 'y'
                                ? [-5000, orthoLine.pos, 5000, orthoLine.pos] // Horizontal tracking line
                                : [orthoLine.pos, -5000, orthoLine.pos, 5000] // Vertical tracking line
                            }
                            stroke={themeConfig.accent}
                            strokeWidth={1.5}
                            dash={[10, 10]}
                            opacity={0.5}
                          />
                        )}
                        <WatermarkGroup
                          width={paperWidth}
                          height={paperHeight}
                          tier={subscriptionTier}
                          email={user?.email}
                        />
                      </Group>

                      {/* Branding Banner - Fixed UI Layer */}
                      <BrandingBanner
                        width={stageWidth}
                        height={stageHeight}
                        tier={subscriptionTier}
                      />
                    </Layer>
                  </Stage>
                </div>
                );
              })()}
            </div>
          ) : (
            /* ── BLANK MODE: Stage fills the infinite space ── */
            <div
              ref={setCanvasHostRef}
              style={{
                position: 'relative',
                width: Math.max(4000, stageWidth * 4),
                height: Math.max(3000, stageHeight * 4),
              }}
            >
              <Stage
                ref={stageRef}
                width={Math.max(4000, stageWidth * 4)}
                height={Math.max(3000, stageHeight * 4)}
                scaleX={1}
                scaleY={1}
                x={0}
                y={0}
                onWheel={handleWheel}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                className="drawing-region-wrapper"
                style={{ backgroundColor: themeConfig.bg }}
              >
                <Layer>
                  <Group>
                    <GridRenderer gridVisible={gridVisible} themeConfig={themeConfig} editorTheme={editorTheme} gridSize={GRID_SIZE} size={4000} />
                    <WatermarkGroup
                      width={Math.max(4000, stageWidth * 4)}
                      height={Math.max(3000, stageHeight * 4)}
                      tier={subscriptionTier}
                      email={user?.email}
                    />
                  </Group>
                </Layer>
              </Stage>
            </div>
          )}
        </div>
      </div>

      {/* Fixed overlays — outside transform, always visible */}
      {!activeTemplateLayout && (
        <>
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border-b-4 border-surface-900 shadow-2xl z-20 text-center animate-fade-in rounded-b-xl transition-all",
            isPreview ? "top-10 w-80 p-4" : "top-3 w-72 p-2 opacity-90"
          )}>
            <h1 className={cn(
              "font-black uppercase text-surface-900 border-b border-surface-200",
              isPreview ? "text-sm tracking-[0.2em] pb-2 mb-2" : "text-[10px] tracking-[0.16em] pb-1 mb-1"
            )}>ACİL DURUM TAHLİYE PLANI</h1>
            <div className="flex justify-between items-center px-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kat: <span className="text-surface-900">Zemin</span></div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ölçek: <span className="text-surface-900">1:100</span></div>
            </div>
          </div>

          <div className={cn(
            "absolute right-6 bg-white/95 backdrop-blur-md border border-surface-200 shadow-2xl z-20 rounded-xl transition-all",
            isPreview ? "bottom-16 w-64 p-5" : "bottom-5 w-52 p-3 opacity-90"
          )}>
            <p className="text-[10px] font-black text-surface-900 uppercase tracking-widest mb-4 border-b border-surface-200 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> LEJAND / LEGEND
            </p>
            <div className="space-y-3">
              <LegendItem color="#00A550" label="TAHLİYE ROTASI" type="dash" />
              <LegendItem color="#ef4444" label="YANGIN MÜDAHALE" type="line" />
              <LegendItem color="#000000" label="YAPISAL DUVAR" type="bold" />
            </div>
          </div>
        </>
      )}

      {scaleModal && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-6 border border-white/10">
            <h2 className="text-xl font-black text-slate-800 text-center">Ölçek Belirle</h2>
            <p className="text-sm text-slate-500 text-center">Çizdiğiniz bu referans çizgisi gerçekte kaç metredir?</p>
            <input type="number" step="0.1" autoFocus className="w-full text-center text-3xl font-black p-4 rounded-xl bg-white border-slate-200 text-slate-800 outline-none border border-slate-200 focus:border-accent-indigo" value={scaleValue} onChange={(e) => setScaleValue(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const meters = parseFloat(scaleValue);
                if (meters > 0) { setScaleConfig({ pixelsPerMeter: scaleModal.pixels / meters, unit: 'm' }); setScaleModal(null); }
              }
            }} />
            <div className="flex gap-3">
              <button onClick={() => setScaleModal(null)} className="flex-1 py-3 text-xs font-bold bg-white border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100">İptal</button>
              <button onClick={() => {
                const meters = parseFloat(scaleValue);
                if (meters > 0) { setScaleConfig({ pixelsPerMeter: scaleModal.pixels / meters, unit: 'm' }); setScaleModal(null); }
              }} className="flex-1 py-3 text-xs font-bold bg-accent-indigo text-white rounded-xl hover:bg-accent-indigo/90 glow-accent">Uygula</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dimension Input Overlay (AutoCAD-style) ── */}
      {dimInput && (
        <>
          {/* Backdrop — click outside to commit as-drawn */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => { commitDimInput(); setCurrentLine(null); }}
          />
          <div
            className="fixed z-[9999] animate-fade-in"
            style={{ left: dimInput.screenX, top: dimInput.screenY, transform: 'translateX(-50%)' }}
          >
            <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-2.5 w-48">
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KESİN ÖLÇÜ</div>
                  <div className="text-[10px] font-bold text-white mt-0.5">
                    {dimInput.elementData.type === 'wall' ? 'Duvar Uzunluğu' :
                      dimInput.elementData.type === 'window' ? 'Pencere Genişliği' :
                        dimInput.elementData.type === 'door' ? 'Kapı Genişliği' : 'Çizgi Uzunluğu'}
                  </div>
                </div>
                <button
                  onClick={() => { commitDimInput(); setCurrentLine(null); }}
                  className="text-[9px] font-bold text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded-md transition-all"
                >
                  ESC
                </button>
              </div>

              {/* Input Row */}
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 relative">
                  <input
                    ref={dimInputRef}
                    autoFocus
                    type="number"
                    step={scaleConfig.unit === 'mm' ? '1' : scaleConfig.unit === 'cm' ? '0.1' : '0.01'}
                    min="0.01"
                    value={dimInput.value}
                    onChange={(e) => setDimInput(prev => prev ? { ...prev, value: e.target.value } : null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const pixels = fromDisplayUnit(dimInput.value);
                        commitDimInput(pixels > 0 ? pixels : undefined);
                        setCurrentLine(null);
                      }
                      if (e.key === 'Escape') {
                        commitDimInput(); // commit as-drawn
                        setCurrentLine(null);
                      }
                    }}
                    className="w-full bg-white/10 text-white text-lg font-black text-center py-1.5 rounded-lg outline-none border border-white/20 focus:border-accent-indigo focus:bg-white/15 transition-all pr-10 placeholder-white/30"
                    placeholder="0"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-accent-indigo">
                    {scaleConfig.unit}
                  </span>
                </div>
              </div>

              {/* Unit switcher */}
              <div className="flex gap-1 mt-1.5">
                {(['mm', 'cm', 'm'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      // Convert current display value to new unit
                      const pixels = fromDisplayUnit(dimInput.value);
                      setScaleConfig({ ...scaleConfig, unit: u });
                      // Recalculate display value for new unit
                      const newMeters = pixels / scaleConfig.pixelsPerMeter;
                      const newVal = u === 'mm' ? (newMeters * 1000).toFixed(0) :
                        u === 'cm' ? (newMeters * 100).toFixed(1) :
                          newMeters.toFixed(2);
                      setDimInput(prev => prev ? { ...prev, value: newVal } : null);
                    }}
                    className={cn(
                      "flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                      scaleConfig.unit === u
                        ? "bg-accent-indigo text-white shadow-md shadow-accent-indigo/30"
                        : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>

              {/* Confirm button */}
              <button
                onClick={() => {
                  const pixels = fromDisplayUnit(dimInput.value);
                  commitDimInput(pixels > 0 ? pixels : undefined);
                  setCurrentLine(null);
                }}
                className="w-full mt-1.5 py-1.5 bg-gradient-to-r from-accent-indigo to-accent-violet text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-md glow-accent"
              >
                Uygula ↵
              </button>
              <p className="text-[8px] text-white/40 text-center mt-1.5">Enter → Uygula &nbsp;|&nbsp; Esc → Geç</p>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteDrawingId}
        onClose={() => setConfirmDeleteDrawingId(null)}
        onConfirm={() => {
          if (confirmDeleteDrawingId) {
            removeTemplateModule(confirmDeleteDrawingId);
            setConfirmDeleteDrawingId(null);
          }
        }}
        title="Çizim Alanını Sil"
        message="Bu çizim alanını silmek istediğinize emin misiniz? Tüm çizimleriniz kaybolacaktır."
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
      />
    </main>
  );
}
