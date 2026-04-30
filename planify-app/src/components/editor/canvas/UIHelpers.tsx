'use client';

import React from 'react';
import { Group, Text, Rect, Line, Image as KonvaImage } from 'react-konva';
import type { EditorTheme, THEME_CONFIGS } from '@/types/editor';

export const LegendItem = ({ color, label, type = 'line' }: { color: string; label: string; type?: 'line' | 'dash' | 'bold' }) => {
  return (
    <div className="flex items-center gap-3 mb-2 animate-slide-right">
      <div className="w-6 flex items-center justify-center shrink-0">
        {type === 'line' && <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: color }} />}
        {type === 'dash' && <div className="w-full h-0.5" style={{ backgroundImage: `linear-gradient(to right, ${color} 50%, transparent 50%)`, backgroundSize: '8px 100%' }} />}
        {type === 'bold' && <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: color }} />}
      </div>
      <span className="text-[9px] font-black uppercase tracking-wider text-surface-900">{label}</span>
    </div>
  );
};

export const WatermarkGroup = React.memo(({ width, height, tier }: { width: number; height: number; tier: string }) => {
  if (tier !== 'free') return null;

  const patternSize = 300;
  const rows = Math.ceil(height / patternSize) + 1;
  const cols = Math.ceil(width / patternSize) + 1;

  return (
    <Group opacity={0.12} listening={false}>
      {Array.from({ length: rows }).map((_, r) => (
        Array.from({ length: cols }).map((_, c) => (
          <Text
            key={`${r}-${c}`}
            text="PLANIFY"
            x={c * patternSize}
            y={r * patternSize}
            fontSize={40}
            fontStyle="900"
            fill="#64748b"
            rotation={-45}
            align="center"
            verticalAlign="middle"
            width={patternSize}
            height={patternSize}
          />
        ))
      ))}
    </Group>
  );
});
WatermarkGroup.displayName = 'WatermarkGroup';

export const CustomSymbolImage = React.memo(({ src, size, isSelected }: { src: string, size: number, isSelected: boolean }) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  React.useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImage(img);
    // Samet (P0 Fix): Memory leak önleme - cleanup on unmount/src change
    return () => {
      img.onload = null;
      img.src = '';
    };
  }, [src]);

  const r = size / 2;
  return (
    <Group shadowBlur={isSelected ? 0 : 2} shadowOpacity={0.15}>
      {image && <KonvaImage image={image} width={size} height={size} x={-r} y={-r} /> }
    </Group>
  );
});
CustomSymbolImage.displayName = 'CustomSymbolImage';

export const renderCorporateIcon = (symbolId: string, size: number, color: string, isSelected: boolean = false) => {
  const r = size / 2;
  return (
    <Group shadowBlur={isSelected ? 0 : 2} shadowOpacity={0.15}>
      <Rect width={size} height={size} x={-r} y={-r} fill={color} cornerRadius={4} stroke="white" strokeWidth={0.5} />
      <Text text={symbolId.substring(0,2).toUpperCase()} fill="white" fontSize={size*0.4} fontStyle="bold" align="center" verticalAlign="middle" width={size} height={size} x={-r} y={-r} />
    </Group>
  );
};

type MemoizedGridProps = {
  gridVisible: boolean;
  themeConfig: (typeof THEME_CONFIGS)[EditorTheme];
  editorTheme: EditorTheme;
  gridSize: number;
  size?: number;
};

export const MemoizedGrid = React.memo(({ gridVisible, themeConfig, editorTheme, gridSize, size = 2000 }: MemoizedGridProps) => {
  if (!gridVisible) return null;
  return (
    <Group listening={false}>
      {Array.from({ length: 81 }).map((_, i) => (
        <Group key={i}>
          <Line points={[(i - 40) * gridSize, -size, (i - 40) * gridSize, size]} stroke={themeConfig.grid} strokeWidth={1} opacity={editorTheme === 'blueprint' ? 0.3 : 0.5} />
          <Line points={[-size, (i - 40) * gridSize, size, (i - 40) * gridSize]} stroke={themeConfig.grid} strokeWidth={1} opacity={editorTheme === 'blueprint' ? 0.3 : 0.5} />
        </Group>
      ))}
    </Group>
  );
});
MemoizedGrid.displayName = 'MemoizedGrid';
