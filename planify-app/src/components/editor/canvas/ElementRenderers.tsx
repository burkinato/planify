'use client';

import React from 'react';
import type Konva from 'konva';
import { Group, Rect, Line, Text, Circle, Shape } from 'react-konva';
import type { EditorElement, EditorTheme, THEME_CONFIGS } from '@/types/editor';

type ElementRendererProps = {
  el: EditorElement;
  isSelected: boolean;
  canInteract: boolean;
  isLocked: boolean;
  themeConfig: (typeof THEME_CONFIGS)[EditorTheme];
  onSelect: (id: string, isLocked: boolean, e: Konva.KonvaEventObject<Event>) => void;
  onDragStart: (id: string, isLocked: boolean, e: Konva.KonvaEventObject<DragEvent>) => void;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
};

type SnappingElementRendererProps = ElementRendererProps & {
  calculateSnapToWall: (el: EditorElement, x: number, y: number) => Partial<EditorElement>;
};

// STAIRS
export const StairRenderer = React.memo(({ el, isSelected, canInteract, isLocked, themeConfig, onSelect, onDragStart, onUpdate }: ElementRendererProps) => {
    const w = el.width || 100;
    const h = el.height || 120;
    const type = el.stairsType || 'straight';
    const sc = isSelected ? themeConfig.accent : '#1e293b';
    const sg = '#475569';
    
    const dragProps = {
      draggable: canInteract,
      onClick: (e: Konva.KonvaEventObject<Event>) => onSelect(el.id, isLocked, e),
      onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => onDragStart(el.id, isLocked, e),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onUpdate(el.id, { x: e.target.x(), y: e.target.y() }),
    };

    if (type === 'straight') {
      const steps = Math.max(4, Math.floor(h / 10));
      const stepH = h / steps;
      return (
        <Group x={el.x} y={el.y} rotation={el.rotation || 0} {...dragProps}>
          <Rect x={-w/2} y={-h/2} width={w} height={h} fill="white" stroke={sc} strokeWidth={1.8} cornerRadius={2} />
          {Array.from({ length: steps - 1 }).map((_, i) => (
            <Line key={i} points={[-w/2, -h/2 + stepH*(i+1), w/2, -h/2 + stepH*(i+1)]} stroke={sg} strokeWidth={0.8} />
          ))}
          <Line points={[0, h/2 - 8, 0, -h/2 + 16]} stroke={sc} strokeWidth={1.2} />
          <Shape sceneFunc={(ctx) => {
            ctx.beginPath(); ctx.moveTo(-5, -h/2 + 18); ctx.lineTo(0, -h/2 + 10); ctx.lineTo(5, -h/2 + 18); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
          }} />
          <Text text="DÜZ" x={-w/2} y={h/2 + 4} width={w} align="center" fontSize={8} fontStyle="bold" fill={sg} />
          {isSelected && <Rect x={-w/2-3} y={-h/2-3} width={w+6} height={h+6} stroke={themeConfig.accent} strokeWidth={1.5} dash={[5,3]} fill="transparent" cornerRadius={3} />}
        </Group>
      );
    }
    return null;
});
StairRenderer.displayName = 'StairRenderer';

// ELEVATOR
export const ElevatorRenderer = React.memo(({ el, isSelected, canInteract, isLocked, themeConfig, onSelect, onDragStart, onUpdate }: ElementRendererProps) => {
    const w = el.width || 80;
    const h = el.height || 80;
    return (
      <Group
        x={el.x} y={el.y} rotation={el.rotation || 0}
        draggable={canInteract}
        onClick={(e) => onSelect(el.id, isLocked, e)}
        onDragStart={(e) => onDragStart(el.id, isLocked, e)}
        onDragEnd={(e) => onUpdate(el.id, { x: e.target.x(), y: e.target.y() })}
      >
        <Rect x={-w/2} y={-h/2} width={w} height={h} fill="white" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        <Line points={[-w/2, -h/2, w/2, h/2]} stroke="#94a3b8" strokeWidth={1} />
        <Line points={[w/2, -h/2, -w/2, h/2]} stroke="#94a3b8" strokeWidth={1} />
        <Circle x={0} y={0} radius={8} fill="white" stroke="#1e293b" strokeWidth={1.5} />
        <Text text="E" x={-5} y={-6} fontSize={10} fontStyle="bold" fill="#1e293b" />
        {isSelected && <Rect x={-w/2-2} y={-h/2-2} width={w+4} height={h+4} stroke={themeConfig.accent} strokeWidth={2} dash={[6,3]} fill="transparent" />}
      </Group>
    );
});
ElevatorRenderer.displayName = 'ElevatorRenderer';

// COLUMN
export const ColumnRenderer = React.memo(({ el, isSelected, canInteract, isLocked, themeConfig, onSelect, onDragStart, onUpdate, calculateSnapToWall }: SnappingElementRendererProps) => {
    const size = el.width || 30;
    return (
      <Group
        x={el.x} y={el.y} rotation={el.rotation || 0}
        draggable={canInteract}
        onClick={(e) => onSelect(el.id, isLocked, e)}
        onDragStart={(e) => onDragStart(el.id, isLocked, e)}
        onDragEnd={(e) => {
          const updates = calculateSnapToWall(el, e.target.x(), e.target.y());
          onUpdate(el.id, updates);
        }}
      >
        <Rect x={-size/2-2} y={-size/2-2} width={size+4} height={size+4} fill="white" />
        <Rect x={-size/2} y={-size/2} width={size} height={size} fill="#e2e8f0" stroke={isSelected ? themeConfig.accent : '#1e293b'} strokeWidth={2} />
        <Line points={[-size/2, -size/2, size/2, size/2]} stroke="#94a3b8" strokeWidth={0.8} />
        <Line points={[size/2, -size/2, -size/2, size/2]} stroke="#94a3b8" strokeWidth={0.8} />
        {isSelected && <Rect x={-size/2-4} y={-size/2-4} width={size+8} height={size+8} stroke={themeConfig.accent} strokeWidth={2} dash={[4,2]} fill="transparent" />}
      </Group>
    );
});
ColumnRenderer.displayName = 'ColumnRenderer';

// DOOR
export const DoorRenderer = React.memo(({ el, isSelected, canInteract, isLocked, themeConfig, onSelect, onDragStart, onUpdate, calculateSnapToWall }: SnappingElementRendererProps) => {
    const pts = el.points || [0,0,80,0];
    const dx = pts[2] - pts[0]; const dy = pts[3] - pts[1];
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return (
      <Group
        x={el.x || 0} y={el.y || 0}
        draggable={canInteract}
        onClick={(e) => onSelect(el.id, isLocked, e)}
        onDragStart={(e) => onDragStart(el.id, isLocked, e)}
        onDragEnd={(e) => {
          const updates = calculateSnapToWall(el, e.target.x(), e.target.y());
          onUpdate(el.id, updates);
        }}
      >
        <Line points={pts} stroke="white" strokeWidth={16} lineCap="square" />
        <Group x={pts[0]} y={pts[1]} rotation={angle}>
          <Line points={[0, -6, 0, 6]} stroke="#1e293b" strokeWidth={2} />
          <Line points={[length, -6, length, 6]} stroke="#1e293b" strokeWidth={2} />
          <Line points={[0, 0, 0, length]} stroke={isSelected ? themeConfig.accent : (el.color || '#f59e0b')} strokeWidth={3} />
          <Shape
            sceneFunc={(ctx) => {
              ctx.beginPath(); ctx.arc(0, 0, length, 0, Math.PI/2);
              ctx.strokeStyle = el.color || '#f59e0b'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.stroke();
            }}
          />
        </Group>
        {isSelected && <Circle x={pts[0] + dx/2} y={pts[1] + dy/2} radius={length/2 + 15} stroke={themeConfig.accent} strokeWidth={1.5} dash={[4,4]} />}
      </Group>
    );
});
DoorRenderer.displayName = 'DoorRenderer';

// WINDOW
export const WindowRenderer = React.memo(({ el, isSelected, canInteract, isLocked, themeConfig, onSelect, onDragStart, onUpdate, calculateSnapToWall }: SnappingElementRendererProps) => {
    const pts = el.points || [0,0,0,0];
    const dx = pts[2] - pts[0]; const dy = pts[3] - pts[1];
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return (
      <Group
        x={el.x || 0} y={el.y || 0}
        draggable={canInteract}
        onClick={(e) => onSelect(el.id, isLocked, e)}
        onDragStart={(e) => onDragStart(el.id, isLocked, e)}
        onDragEnd={(e) => {
          const updates = calculateSnapToWall(el, e.target.x(), e.target.y());
          onUpdate(el.id, updates);
        }}
      >
        <Line points={pts} stroke="white" strokeWidth={16} lineCap="square" />
        <Group x={pts[0]} y={pts[1]} rotation={angle}>
          <Line points={[0, -6, 0, 6]} stroke="#1e293b" strokeWidth={2} />
          <Line points={[length, -6, length, 6]} stroke="#1e293b" strokeWidth={2} />
          <Rect x={0} y={-4} width={length} height={8} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
          <Line points={[0, 0, length, 0]} stroke="#3b82f6" strokeWidth={2} />
        </Group>
        {isSelected && <Rect x={Math.min(pts[0], pts[2])-10} y={Math.min(pts[1], pts[3])-10} width={Math.abs(dx)+20} height={Math.abs(dy)+20} stroke={themeConfig.accent} strokeWidth={1.5} dash={[4,4]} fill="transparent" />}
      </Group>
    );
});
WindowRenderer.displayName = 'WindowRenderer';
