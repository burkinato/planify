'use client';

import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import type { EditorElement, EditorTheme, THEME_CONFIGS, CustomSymbol } from '@/types/editor';
import { ISO_SYMBOLS } from '@/lib/editor/isoSymbols';
import { SYMBOLS } from '@/types/editor';
import { StairRenderer, ElevatorRenderer, ColumnRenderer, DoorRenderer, WindowRenderer } from './ElementRenderers';

interface ElementDispatcherProps {
  elements: EditorElement[];
  selectedIds: string[];
  layers: any[];
  tool: string;
  themeConfig: (typeof THEME_CONFIGS)[EditorTheme];
  customSymbols: CustomSymbol[];
  onSelect: (id: string, isLocked: boolean, e: any) => void;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onDragStart: (id: string, isLocked: boolean, e: any) => void;
  renderCorporateIcon: any;
  CustomSymbolImage: any;
  calculateSnapToWall: any;
}

export const ElementDispatcher = React.memo(({
  elements,
  selectedIds,
  layers,
  tool,
  themeConfig,
  customSymbols,
  onSelect,
  onUpdate,
  onDragStart,
  renderCorporateIcon,
  CustomSymbolImage,
  calculateSnapToWall
}: ElementDispatcherProps) => {
  return (
    <>
      {elements.map((el) => {
        const isSelected = selectedIds.includes(el.id);
        const isLocked = layers.find(l => l.id === el.layerId)?.locked;
        const canInteract = tool === 'select' && !isLocked;

        const commonProps = { el, isSelected, canInteract, isLocked, themeConfig, onSelect, onDragStart, onUpdate };

        if (el.type === 'rect') {
          return (
            <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}>
              <Rect
                width={el.width}
                height={el.height}
                x={-el.width! / 2}
                y={-el.height! / 2}
                fill={el.color || 'transparent'}
                opacity={el.color ? 0.2 : 1}
                stroke={isSelected ? themeConfig.accent : (el.color || themeConfig.text)}
                strokeWidth={2}
                draggable={canInteract}
                onClick={(e) => onSelect(el.id, isLocked, e)}
                onDragStart={(e) => onDragStart(el.id, isLocked, e)}
                onDragEnd={(e) => onUpdate(el.id, { x: e.target.x(), y: e.target.y() })}
              />
            </Group>
          );
        }

        if (el.type === 'stairs') return <StairRenderer key={el.id} {...commonProps} />;
        if (el.type === 'elevator') return <ElevatorRenderer key={el.id} {...commonProps} />;
        if (el.type === 'column') return <ColumnRenderer key={el.id} {...commonProps} calculateSnapToWall={calculateSnapToWall} />;
        if (el.type === 'door') return <DoorRenderer key={el.id} {...commonProps} calculateSnapToWall={calculateSnapToWall} />;
        if (el.type === 'window') return <WindowRenderer key={el.id} {...commonProps} calculateSnapToWall={calculateSnapToWall} />;

        if (el.type === 'route') {
          const pts = el.points || [0, 0, 0, 0];
          return (
            <Group
              key={el.id}
              draggable={canInteract}
              onClick={(e) => onSelect(el.id, isLocked, e)}
              onDragStart={(e) => onDragStart(el.id, isLocked, e)}
              onDragEnd={(e) => onUpdate(el.id, { x: e.target.x(), y: e.target.y() })}
            >
              <Line
                points={pts}
                stroke={isSelected ? themeConfig.accent : (el.color || themeConfig.text)}
                strokeWidth={el.thickness || 8}
                lineCap="round"
                dash={el.routeType === 'evacuation' ? [10, 6] : undefined}
                x={el.x || 0} y={el.y || 0}
              />
            </Group>
          );
        }

        if (el.type === 'symbol') {
          const sym = SYMBOLS.find(s => s.id === el.symbolType);
          const customSym = customSymbols.find(cs => cs.id === el.symbolType);
          const isoDataUrl = el.symbolType ? ISO_SYMBOLS[el.symbolType] : null;
          const sWidth = el.width || 36;
          return (
            <Group
              key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}
              draggable={canInteract}
              onClick={(e) => onSelect(el.id, isLocked, e)}
              onDragEnd={(e) => onUpdate(el.id, { x: e.target.x(), y: e.target.y() })}
            >
              {customSym ? (
                <CustomSymbolImage src={customSym.dataUrl} size={sWidth} isSelected={isSelected} />
              ) : isoDataUrl ? (
                <CustomSymbolImage src={isoDataUrl} size={sWidth} isSelected={isSelected} />
              ) : (
                renderCorporateIcon(el.symbolType || 'exit', sWidth, el.color || sym?.color || '#ef4444', isSelected)
              )}
              {isSelected && <Rect width={sWidth + 8} height={sWidth + 8} x={-sWidth / 2 - 4} y={-sWidth / 2 - 4} stroke={themeConfig.accent} strokeWidth={2} dash={[4, 2]} />}
            </Group>
          );
        }

        if (el.type === 'text') {
          return (
            <Text
              key={el.id}
              x={el.x} y={el.y}
              rotation={el.rotation || 0}
              width={el.width} height={el.height}
              text={el.label || ''}
              fill={isSelected ? themeConfig.accent : (el.color || themeConfig.text)}
              fontSize={el.fontSize || 14}
              fontStyle={el.fontWeight || 'bold'}
              align={el.textAlign || 'left'}
              draggable={canInteract}
              onClick={(e) => onSelect(el.id, isLocked, e)}
              onDragEnd={(e) => onUpdate(el.id, { x: e.target.x(), y: e.target.y() })}
            />
          );
        }

        return null;
      })}
    </>
  );
});

ElementDispatcher.displayName = 'ElementDispatcher';
