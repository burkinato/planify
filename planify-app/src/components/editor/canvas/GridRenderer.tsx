import React from 'react';
import { Group, Line } from 'react-konva';
import type { EditorTheme } from '@/types/editor';
import { THEME_CONFIGS } from '@/types/editor';

export interface GridRendererProps {
  gridVisible: boolean;
  themeConfig: (typeof THEME_CONFIGS)[EditorTheme];
  editorTheme: EditorTheme;
  gridSize: number;
  size?: number;
}

export const GridRenderer = React.memo(({ gridVisible, themeConfig, editorTheme, gridSize, size = 2000 }: GridRendererProps) => {
  if (!gridVisible) return null;
  return (
    <Group>
      {Array.from({ length: 81 }).map((_, i) => (
        <Group key={i}>
          <Line points={[(i - 40) * gridSize, -size, (i - 40) * gridSize, size]} stroke={themeConfig.grid} strokeWidth={1} opacity={editorTheme === 'blueprint' ? 0.3 : 0.5} />
          <Line points={[-size, (i - 40) * gridSize, size, (i - 40) * gridSize]} stroke={themeConfig.grid} strokeWidth={1} opacity={editorTheme === 'blueprint' ? 0.3 : 0.5} />
        </Group>
      ))}
    </Group>
  );
});
GridRenderer.displayName = 'GridRenderer';
