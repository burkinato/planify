import { useState } from 'react';
import type Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { wallLength, type WallElement } from '@/lib/editor/wallGeometry';
import type { 
  EditorElement, 
  StairsToolOptions, 
  WallToolOptions, 
  DoorToolOptions, 
  WindowToolOptions, 
  ElevatorToolOptions, 
  ColumnToolOptions, 
  TextToolOptions 
} from '@/types/editor';

type CanvasStageEvent = Konva.KonvaEventObject<MouseEvent>;

export interface UseCanvasInteractionArgs {
  stageRef: React.RefObject<Konva.Stage | null>;
  infiniteHostRef: React.RefObject<HTMLDivElement | null>;
  isSpacePressedRef: React.MutableRefObject<boolean>;
  isInnerPanningRef: React.MutableRefObject<boolean>;
  innerPanStartRef: React.MutableRefObject<{ x: number; y: number; panX: number; panY: number }>;
  tool: string;
  toolOptions: Record<string, unknown>;
  wallElements: WallElement[];
  zoom: number;
  innerZoom: number;
  innerPan: { x: number; y: number };
  setInnerPan: (pan: { x: number; y: number }) => void;
  scaleConfig: Record<string, unknown>;
  setDimInput: React.Dispatch<React.SetStateAction<unknown>>;
  setScaleModal: React.Dispatch<React.SetStateAction<unknown>>;
  findSnapPoint: (pos: { x: number; y: number }, excludeWallId?: string) => { x: number; y: number };
  getRelativePointerPosition: (stage: Konva.Stage) => { x: number; y: number } | null;
  calculateSnapToWall: (el: EditorElement, newX: number, newY: number) => { points?: number[]; x: number; y: number; rotation?: number };
  toDisplayUnit: (pixels: number) => string;
}

export function useCanvasInteraction({
  stageRef,
  infiniteHostRef,
  isSpacePressedRef,
  isInnerPanningRef,
  innerPanStartRef,
  tool,
  toolOptions,
  wallElements,
  zoom,
  innerZoom,
  innerPan,
  setInnerPan,
  setDimInput,
  setScaleModal,
  findSnapPoint,
  getRelativePointerPosition,
  calculateSnapToWall,
  toDisplayUnit,
}: UseCanvasInteractionArgs) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[] | null>(null);
  const [orthoLine, setOrthoLine] = useState<{ axis: 'x' | 'y'; pos: number } | null>(null);
  const [alignLine, setAlignLine] = useState<{ axis: 'x' | 'y'; pos: number } | null>(null);

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

    const { setSelectedIds, addElement, setTool, selectedSymbol } = useEditorStore.getState();

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
          symbolType: selectedSymbol || 'exit',
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
    const { setTool } = useEditorStore.getState();
    setIsDrawing(false);
    setCurrentLine(null);
    setOrthoLine(null);
    setAlignLine(null);
    if (!['symbol', 'wall'].includes(tool)) setTool('select');
  };

  return {
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    isDrawing,
    currentLine,
    setCurrentLine,
    orthoLine,
    alignLine,
  };
}
