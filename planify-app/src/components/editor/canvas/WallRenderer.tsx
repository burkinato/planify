'use client';

import React, { useMemo } from 'react';
import { Line, Group, Shape } from 'react-konva';
import { computeRenderPoints, wallPoints, wallLength, type WallElement } from '@/lib/editor/wallGeometry';
import type { EditorTheme, THEME_CONFIGS } from '@/types/editor';

interface WallRendererProps {
  walls: WallElement[];
  selectedIds: string[];
  themeConfig: (typeof THEME_CONFIGS)[EditorTheme];
  isLockedMap: Record<string, boolean>;
  tool: string;
  onSelect: (id: string, isLocked: boolean, e: any) => void;
  onUpdate: (id: string, updates: Partial<WallElement>) => void;
  onDragStart: (id: string, isLocked: boolean, e: any) => void;
  onRemove: (ids: string[]) => void;
  onUpdateBatch: (updates: any) => void;
  getHatchPattern: () => CanvasPattern | null;
  buildWallMoveUpdates: any;
}

export const WallRenderer = React.memo(({
  walls,
  selectedIds,
  themeConfig,
  isLockedMap,
  tool,
  onSelect,
  onUpdate,
  onDragStart,
  onRemove,
  onUpdateBatch,
  getHatchPattern,
  buildWallMoveUpdates
}: WallRendererProps) => {
  const wallData = useMemo(() => {
    return walls.map(el => ({
      el,
      rpts: computeRenderPoints(el, walls)
    }));
  }, [walls]);

  return (
    <Group>
      {/* Pass 1: Outer Stroke */}
      {wallData.map(({ el, rpts }) => {
        const style = el.wallStyle || 'hatch';
        if (style === 'double') return null;
        return (
          <Line
            key={`wall-stroke-${el.id}`}
            points={rpts}
            stroke={selectedIds.includes(el.id) ? themeConfig.accent : '#1e293b'}
            strokeWidth={el.thickness || 12}
            lineCap="square"
            listening={false}
          />
        );
      })}

      {/* Pass 2: Inner White Background */}
      {wallData.map(({ el, rpts }) => {
        const style = el.wallStyle || 'hatch';
        if (style === 'solid' || style === 'double') return null;
        return (
          <Line
            key={`wall-bg-${el.id}`}
            points={rpts}
            stroke="white"
            strokeWidth={Math.max(1, (el.thickness || 12) - 2)}
            lineCap="square"
            listening={false}
          />
        );
      })}

      {/* Pass 3: Hatch/Double Pattern & Interaction */}
      {wallData.map(({ el, rpts }) => {
        const style = el.wallStyle || 'hatch';
        const length = wallLength(rpts);
        const nx = length > 0 ? -(rpts[3] - rpts[1]) / length : 0;
        const ny = length > 0 ? (rpts[2] - rpts[0]) / length : 0;
        const doubleOffset = Math.max(3, (el.thickness || 12) / 2);
        const isLocked = isLockedMap[el.layerId];

        return (
          <Group
            key={`wall-hatch-${el.id}`}
            draggable={tool === 'select' && !isLocked}
            onClick={(e) => {
              if (tool === 'eraser') {
                onRemove([el.id]);
                return;
              }
              if (!isLocked) onSelect(el.id, false, e);
            }}
            onDragStart={(e) => {
              if (!isLocked && !selectedIds.includes(el.id)) {
                onDragStart(el.id, false, e);
              }
            }}
            onDragEnd={(e) => {
              const dx = e.target.x();
              const dy = e.target.y();
              e.target.position({ x: 0, y: 0 });
              onUpdateBatch(buildWallMoveUpdates(el, walls, dx, dy));
            }}
          >
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
                listening={false}
              />
            )}
            {style === 'double' && (
              <>
                <Line
                  points={[rpts[0] + nx * doubleOffset, rpts[1] + ny * doubleOffset, rpts[2] + nx * doubleOffset, rpts[3] + ny * doubleOffset]}
                  stroke={selectedIds.includes(el.id) ? themeConfig.accent : '#1e293b'}
                  strokeWidth={2}
                  lineCap="square"
                  listening={false}
                />
                <Line
                  points={[rpts[0] - nx * doubleOffset, rpts[1] - ny * doubleOffset, rpts[2] - nx * doubleOffset, rpts[3] - ny * doubleOffset]}
                  stroke={selectedIds.includes(el.id) ? themeConfig.accent : '#1e293b'}
                  strokeWidth={2}
                  lineCap="square"
                  listening={false}
                />
              </>
            )}
            {/* Hit box */}
            <Line
              points={rpts}
              stroke="transparent"
              strokeWidth={el.thickness || 12}
              lineCap="square"
            />
          </Group>
        );
      })}
    </Group>
  );
});

WallRenderer.displayName = 'WallRenderer';
