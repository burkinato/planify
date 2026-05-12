import React, { useMemo } from 'react';
import { Group, Rect, Line, Text, Circle, Shape, Arrow } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { SYMBOLS, THEME_CONFIGS, type EditorElement, type EditorTheme } from '@/types/editor';
import { ISO_SYMBOLS } from '@/lib/editor/isoSymbols';
import { CustomSymbolImage, getHatchPattern } from './CanvasHelpers';
import {
  buildWallEndpointUpdates,
  buildWallMoveUpdates,
  computeRenderPoints,
  wallLength,
  wallPoints,
  type WallElement,
} from '@/lib/editor/wallGeometry';

type CanvasStageEvent = Konva.KonvaEventObject<MouseEvent>;

interface CanvasElementsRendererProps {
  elements: EditorElement[];
  layers: { id: string; name: string; visible: boolean; locked: boolean; order: number }[];
  selectedIds: string[];
  themeConfig: typeof THEME_CONFIGS[EditorTheme];
  editorTheme: EditorTheme;
  tool: string;
  isSpacePressed: boolean;
  customSymbols: { id: string; url: string; name: string }[];
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  updateElementsBatch: (updates: { id: string; changes: Partial<EditorElement> }[]) => void;
  removeElements: (ids: string[]) => void;
  setSelectedIds: (ids: string[]) => void;
  calculateSnapToWall: (el: EditorElement, newX: number, newY: number) => { snappedX: number; snappedY: number; rotation: number; wallId?: string };
}

export const CanvasElementsRenderer: React.FC<CanvasElementsRendererProps> = ({
  elements,
  layers,
  selectedIds,
  themeConfig,
  editorTheme,
  tool,
  isSpacePressed,
  customSymbols,
  updateElement,
  updateElementsBatch,
  removeElements,
  setSelectedIds,
  calculateSnapToWall,
}) => {
  const visibleLayers = layers.filter(l => l.visible).map(l => l.id);
  const visibleElements = elements.filter(el => visibleLayers.includes(el.layerId));
  const wallElements = visibleElements.filter((el): el is WallElement => el.type === 'wall' && !!el.points && el.points.length >= 4);

  const selectOrErase = (id: string, isLocked?: boolean, e?: CanvasStageEvent) => {
    if (isLocked) return;
    const state = useEditorStore.getState();
    if (state.focusedRegionId) state.setFocusedRegionId(null);
    if (tool === 'eraser') {
      removeElements([id]);
      return;
    }
    if (e && e.evt && e.evt.shiftKey) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

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
      onMouseLeave: (e: CanvasStageEvent) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); },
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
          <Line points={[0, h / 2 - 8, 0, -h / 2 + 16]} stroke={sc} strokeWidth={1.2} />
          <Line points={[-5, -h / 2 + 22, 0, -h / 2 + 16, 5, -h / 2 + 22]} stroke={sc} strokeWidth={1.5} />
          <Line points={[0, -h / 2 + 16, 0, -h / 2 + 14]} stroke={sc} strokeWidth={1.5} />
          <Shape sceneFunc={(ctx) => {
            ctx.beginPath(); ctx.moveTo(-5, -h / 2 + 18); ctx.lineTo(0, -h / 2 + 10); ctx.lineTo(5, -h / 2 + 18); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          <Text text="DÜZ" x={-w / 2} y={h / 2 + 4} width={w} align="center" fontSize={8} fontStyle="bold" fill={sg} />
          {isSelected && <Rect x={-w / 2 - 3} y={-h / 2 - 3} width={w + 6} height={h + 6} stroke={themeConfig.accent} strokeWidth={1.5} dash={[5, 3]} fill="transparent" cornerRadius={3} />}
        </Group>
      );
    }

    /* ─── L-SHAPE ───────────────────────────────────────────── */
    if (type === 'l-shape') {
      const vW = w * 0.42; const hH = h * 0.42; const landW = w - vW; const landH = h - hH;
      const vSteps = Math.max(3, Math.floor(hH / 10)); const hSteps = Math.max(3, Math.floor(vW / 10));
      return (
        <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="transparent" stroke={sc} strokeWidth={1.5} cornerRadius={2} />
          {Array.from({ length: vSteps - 1 }).map((_, i) => (
            <Line key={`v${i}`} points={[-w / 2, -h / 2 + landH + (hH / vSteps) * (i + 1), -w / 2 + vW, -h / 2 + landH + (hH / vSteps) * (i + 1)]} stroke={sg} strokeWidth={0.9} />
          ))}
          <Line points={[-w / 2 + vW / 2, h / 2 - 4, -w / 2 + vW / 2, -h / 2 + landH + 4]} stroke={sc} strokeWidth={1.1} />
          <Shape sceneFunc={(ctx) => {
            const ax = -w / 2 + vW / 2; const ay = -h / 2 + landH + 8;
            ctx.beginPath(); ctx.moveTo(ax - 4, ay + 8); ctx.lineTo(ax, ay); ctx.lineTo(ax + 4, ay + 8); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          <Rect x={-w / 2} y={-h / 2} width={vW} height={landH} fill="#f8fafc" stroke={sg} strokeWidth={0.8} />
          <Rect x={-w / 2} y={-h / 2} width={vW} height={landH} fill="transparent" stroke={sg} strokeWidth={0.5} />
          {Array.from({ length: hSteps - 1 }).map((_, i) => (
            <Line key={`h${i}`} points={[-w / 2 + vW + (landW / hSteps) * (i + 1), -h / 2, -w / 2 + vW + (landW / hSteps) * (i + 1), -h / 2 + hH]} stroke={sg} strokeWidth={0.9} />
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
      const r = Math.min(w, h) / 2; const innerR = r * 0.15; const segCount = 14;
      return (
        <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          <Circle radius={r} fill="white" stroke={sc} strokeWidth={1.8} />
          <Circle radius={innerR} fill="#e2e8f0" stroke={sc} strokeWidth={1.2} />
          <Circle x={0} y={0} radius={2.5} fill={sc} />
          {Array.from({ length: segCount }).map((_, i) => {
            const angle = (i / segCount) * Math.PI * 2 - Math.PI / 2;
            return <Line key={i} points={[Math.cos(angle) * innerR, Math.sin(angle) * innerR, Math.cos(angle) * r, Math.sin(angle) * r]} stroke={sg} strokeWidth={0.8} />
          })}
          <Shape sceneFunc={(ctx) => {
            ctx.beginPath(); ctx.arc(0, 0, r * 0.55, -Math.PI * 0.1, Math.PI * 0.5); ctx.strokeStyle = sc; ctx.lineWidth = 1.3; ctx.stroke();
            const tipAngle = Math.PI * 0.5; const tx = Math.cos(tipAngle) * r * 0.55; const ty = Math.sin(tipAngle) * r * 0.55;
            ctx.beginPath(); ctx.moveTo(tx - 4, ty - 6); ctx.lineTo(tx + 2, ty); ctx.lineTo(tx + 7, ty - 5); ctx.strokeStyle = sc; ctx.lineWidth = 1.3; ctx.stroke();
          }} />
          <Text text="SP" x={-r} y={r + 4} width={r * 2} align="center" fontSize={8} fontStyle="bold" fill={sg} />
          {isSelected && <Circle radius={r + 3} stroke={themeConfig.accent} strokeWidth={1.5} dash={[5, 3]} fill="transparent" />}
        </Group>
      );
    }

    /* ─── CORE ───────────────────────────── */
    if (type === 'core') {
      const flightW = w * 0.28; const voidW = w * 0.44; const voidH = h * 0.5;
      const leftX = -w / 2; const rightX = w / 2 - flightW; const steps = Math.max(4, Math.floor(h / 14)); const stepH = h / steps;
      return (
        <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="white" stroke={sc} strokeWidth={1.8} cornerRadius={2} />
          <Rect x={-voidW / 2} y={-voidH / 2} width={voidW} height={voidH} fill="transparent" stroke={sg} strokeWidth={0.8} dash={[4, 2.5]} />
          <Text text="BOŞLUK" x={-voidW / 2} y={-6} width={voidW} align="center" fontSize={7} fill={sg} />
          {Array.from({ length: steps - 1 }).map((_, i) => <Line key={`ll${i}`} points={[leftX, -h / 2 + stepH * (i + 1), leftX + flightW, -h / 2 + stepH * (i + 1)]} stroke={sg} strokeWidth={0.9} />)}
          {Array.from({ length: steps - 1 }).map((_, i) => <Line key={`lb${i}`} points={[leftX + flightW * 0.3, -h / 2 + stepH * (i + 1), leftX - 4, -h / 2 + stepH * (i + 1) + 5]} stroke={sg} strokeWidth={0.7} />)}
          <Line points={[leftX + flightW / 2, h / 2 - 6, leftX + flightW / 2, -h / 2 + 16]} stroke={sc} strokeWidth={1.2} />
          <Shape sceneFunc={(ctx) => {
            const ax = leftX + flightW / 2; const ay = -h / 2 + 18;
            ctx.beginPath(); ctx.moveTo(ax - 4, ay + 8); ctx.lineTo(ax, ay); ctx.lineTo(ax + 4, ay + 8); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          {Array.from({ length: steps - 1 }).map((_, i) => <Line key={`rl${i}`} points={[rightX, -h / 2 + stepH * (i + 1), rightX + flightW, -h / 2 + stepH * (i + 1)]} stroke={sg} strokeWidth={0.9} />)}
          {Array.from({ length: steps - 1 }).map((_, i) => <Line key={`rb${i}`} points={[rightX + flightW * 0.7, -h / 2 + stepH * (i + 1), rightX + flightW + 4, -h / 2 + stepH * (i + 1) + 5]} stroke={sg} strokeWidth={0.7} />)}
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
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="white" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        <Line points={[-w / 2, -h / 2, w / 2, h / 2]} stroke="#94a3b8" strokeWidth={1} />
        <Line points={[w / 2, -h / 2, -w / 2, h / 2]} stroke="#94a3b8" strokeWidth={1} />
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
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        {el.columnShape === 'circle' ? (
          <Circle radius={size / 2 + 2} fill="white" />
        ) : (
          <Rect x={-size / 2 - 2} y={-size / 2 - 2} width={size + 4} height={size + 4} fill="white" />
        )}
        {el.columnShape === 'circle' ? (
          <Circle radius={size / 2} fill="#e2e8f0" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        ) : (
          <Rect x={-size / 2} y={-size / 2} width={size} height={size} fill="#e2e8f0" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        )}
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
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        <Line points={pts} stroke="white" strokeWidth={16} lineCap="square" />
        <Group x={pts[0]} y={pts[1]} rotation={angle}>
          <Line points={[0, -6, 0, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />
          <Line points={[length, -6, length, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />
          <Line points={[0, 0, 0, length]} stroke={isSelected ? themeConfig.accent : (el.color || '#f59e0b')} strokeWidth={3} lineCap="round" />
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
        onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
      >
        <Line points={pts} stroke="white" strokeWidth={16} lineCap="square" />
        <Group x={pts[0]} y={pts[1]} rotation={angle}>
          <Line points={[0, -6, 0, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />
          <Line points={[length, -6, length, 6]} stroke="#1e293b" strokeWidth={2} lineCap="square" />
          <Rect x={0} y={-4} width={length} height={8} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
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
    return (
      <Group shadowBlur={isSelected ? 0 : 2} shadowOpacity={0.15}>
        <Rect width={size} height={size} x={-r} y={-r} fill={color} cornerRadius={4} stroke="white" strokeWidth={0.5} />
        <Text text={symbolId.substring(0, 2).toUpperCase()} fill="white" fontSize={size * 0.4} fontStyle="bold" align="center" verticalAlign="middle" width={size} height={size} x={-r} y={-r} />
      </Group>
    );
  };

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
              onMouseLeave={(e: CanvasStageEvent) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
            />
          </Group>
        );
      }
      if (el.type === 'stairs') return renderStairs(el, isSelected, canInteract, isLocked);
      if (el.type === 'elevator') return renderElevator(el, isSelected, canInteract, isLocked);
      if (el.type === 'column') return renderColumn(el, isSelected, canInteract, isLocked);
      if (el.type === 'door') return renderDoorArc(el, isSelected, canInteract, isLocked);
      if (el.type === 'window') return renderWindow(el, isSelected, canInteract, isLocked);
      if (el.type === 'route') {
        const pts = el.points || [0, 0, 0, 0];
        return (
          <Group
            key={el.id}
            draggable={canInteract}
            onClick={(e) => selectOrErase(el.id, isLocked, e)}
            onDragStart={(e: CanvasStageEvent) => { if (!isLocked && !selectedIds.includes(el.id)) { setSelectedIds(e.evt.shiftKey ? [...selectedIds, el.id] : [el.id]); } }}
            onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
            onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
            onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
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
            onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
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
            key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}
            width={el.width} height={el.height} text={el.label || ''}
            fill={isSelected ? themeConfig.accent : (el.color || themeConfig.text)}
            fontSize={el.fontSize || 14} fontStyle={el.fontWeight || 'bold'} align={el.textAlign || 'left'}
            draggable={canInteract} onClick={(e) => selectOrErase(el.id, isLocked, e)}
            onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
            onMouseEnter={(e) => { if (canInteract) { const s = e.target.getStage(); if (s) s.container().style.cursor = 'move'; } }}
            onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
          />
        );
      }
      return null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleElements, selectedIds, layers, tool, themeConfig, customSymbols, editorTheme, isSpacePressed]);

  const wallEndpointHandles = useMemo(() => {
    return wallElements
      .filter((el) => selectedIds.includes(el.id))
      .flatMap((el) => {
        const pts = wallPoints(el);
        return ([0, 1] as const).map((endpointIndex) => {
          const x = pts[endpointIndex * 2];
          const y = pts[endpointIndex * 2 + 1];
          return (
            <Circle
              key={`wall-handle-${el.id}-${endpointIndex}`}
              x={x} y={y} radius={7} fill="white" stroke={themeConfig.accent} strokeWidth={2} shadowBlur={6} shadowOpacity={0.25}
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
  }, [wallElements, selectedIds, tool, layers, isSpacePressed, themeConfig.accent, updateElementsBatch]);

  const memoizedWallData = useMemo(() => {
    return wallElements.map(el => ({
      el,
      rpts: computeRenderPoints(el, wallElements)
    }));
  }, [wallElements]);

  return (
    <>
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
            onMouseLeave={(e) => { const s = e.target.getStage(); if (s) s.container().style.cursor = isSpacePressed ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }}
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
    </>
  );
};
