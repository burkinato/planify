import React, { useMemo } from 'react';
import type Konva from 'konva';
import { Circle } from 'react-konva';
import { useEditorStore } from '@/store/useEditorStore';
import { THEME_CONFIGS, type EditorElement, type EditorTheme } from '@/types/editor';
import { CustomSymbolImage, getHatchPattern } from './CanvasHelpers';
import {
  buildWallEndpointUpdates,
  buildWallMoveUpdates,
  wallPoints,
  type WallElement,
} from '@/lib/editor/wallGeometry';
import { ElementDispatcher } from './ElementDispatcher';
import { WallRenderer } from './WallRenderer';

type CanvasStageEvent = Konva.KonvaEventObject<MouseEvent>;

interface CanvasElementsRendererProps {
  elements: EditorElement[];
  layers: { id: string; name: string; visible: boolean; locked: boolean; order: number }[];
  selectedIds: string[];
  themeConfig: typeof THEME_CONFIGS[EditorTheme];
  editorTheme: EditorTheme;
  tool: string;
  isSpacePressed: boolean;
  customSymbols: { id: string; url: string; name: string; dataUrl: string }[];
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
  const otherElements = visibleElements.filter((el) => el.type !== 'wall');

  const isLockedMap = useMemo(() => {
    return layers.reduce((acc, l) => ({ ...acc, [l.id]: l.locked }), {} as Record<string, boolean>);
  }, [layers]);

  const selectOrErase = (id: string, isLocked?: boolean, e?: Konva.KonvaEventObject<Event>) => {
    if (isLocked) return;
    const state = useEditorStore.getState();
    if (state.focusedRegionId) state.setFocusedRegionId(null);
    if (tool === 'eraser') {
      removeElements([id]);
      return;
    }
    if (e && e.evt && (e.evt as MouseEvent).shiftKey) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

  const handleDragStart = (id: string, isLocked: boolean, e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isLocked && !selectedIds.includes(id)) {
      setSelectedIds(e.evt.shiftKey ? [...selectedIds, id] : [id]);
    }
  };

  // Build an adapter for WallRenderer's batch update to match useEditorStore's batch update signature
  const handleWallUpdateBatch = (updates: Record<string, Partial<WallElement>>) => {
    const batched = Object.entries(updates).map(([id, changes]) => ({ id, changes }));
    updateElementsBatch(batched);
  };

  const renderCorporateIcon = (symbolId: string, size: number, color: string, isSelected: boolean = false) => {
    // This exists in the original file, we pass it down to ElementDispatcher
    const r = size / 2;
    return (
      <React.Fragment key="corporate-icon">
        <rect width={size} height={size} x={-r} y={-r} fill={color} stroke="white" strokeWidth={0.5} rx={4} ry={4} />
        <text fill="white" fontSize={size * 0.4} fontWeight="bold" textAnchor="middle" dominantBaseline="central" x={0} y={0}>
          {symbolId.substring(0, 2).toUpperCase()}
        </text>
      </React.Fragment>
    );
  };

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
              draggable={tool === 'select' && !isLockedMap[el.layerId] && !isSpacePressed}
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
  }, [wallElements, selectedIds, tool, isLockedMap, isSpacePressed, themeConfig.accent, updateElementsBatch]);

  return (
    <>
      <WallRenderer
        walls={wallElements}
        selectedIds={selectedIds}
        themeConfig={themeConfig}
        isLockedMap={isLockedMap}
        tool={tool}
        onSelect={selectOrErase}
        onUpdate={updateElement}
        onDragStart={handleDragStart}
        onRemove={removeElements}
        onUpdateBatch={handleWallUpdateBatch}
        getHatchPattern={getHatchPattern}
        buildWallMoveUpdates={buildWallMoveUpdates}
      />

      {wallEndpointHandles}

      <ElementDispatcher
        elements={otherElements}
        selectedIds={selectedIds}
        layers={layers}
        tool={tool}
        themeConfig={themeConfig}
        customSymbols={customSymbols as any}
        onSelect={selectOrErase}
        onUpdate={updateElement}
        onDragStart={handleDragStart}
        renderCorporateIcon={renderCorporateIcon as any}
        CustomSymbolImage={CustomSymbolImage}
        calculateSnapToWall={calculateSnapToWall}
      />
    </>
  );
};
