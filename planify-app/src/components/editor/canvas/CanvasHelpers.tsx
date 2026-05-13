'use client';

import React, { useState, useEffect } from 'react';
import { Group, Image as KonvaImage } from 'react-konva';
import { renderToStaticMarkup } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';
import { SYMBOLS } from '@/types/editor';

// ── Vector Symbol Generator ───────────────────────────────────────────────────

const iconCache: Record<string, string> = {};

export const getVectorSymbolDataUrl = (symbolId: string, customColor?: string) => {
  const cacheKey = `${symbolId}-${customColor || 'default'}`;
  if (iconCache[cacheKey]) return iconCache[cacheKey];

  const sym = SYMBOLS.find(s => s.id === symbolId);
  if (!sym) return null;

  const IconComponent = sym.iconName ? (LucideIcons as any)[sym.iconName] : LucideIcons.HelpCircle;
  if (!IconComponent) return null;

  const bgColor = customColor || sym.color;
  const isWhiteIcon = sym.shape !== 'none' && sym.category !== 'W_TEHLIKE';
  const iconColor = isWhiteIcon ? '#ffffff' : (sym.category === 'W_TEHLIKE' ? '#000000' : bgColor);

  let bgMarkup = '';
  if (sym.shape === 'circle') {
    if (sym.category === 'P_YASAK') {
      // Red circle with white inside and slash
      bgMarkup = `
        <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="${bgColor}" stroke-width="10" />
        <line x1="20" y1="20" x2="80" y2="80" stroke="${bgColor}" stroke-width="10" />
      `;
    } else {
      bgMarkup = `<circle cx="50" cy="50" r="48" fill="${bgColor}" />`;
    }
  } else if (sym.shape === 'square') {
    if (sym.category === 'W_TEHLIKE') {
      // Yellow triangle with black border
      bgMarkup = `
        <polygon points="50,10 90,85 10,85" fill="${bgColor}" stroke="#000000" stroke-width="6" stroke-linejoin="round" />
      `;
    } else {
      bgMarkup = `<rect width="100" height="100" rx="12" fill="${bgColor}" />`;
    }
  }

  // Lucide SVG inner paths
  const rawSvg = renderToStaticMarkup(<IconComponent color={iconColor} size={24} strokeWidth={2.5} />);
  const innerPaths = rawSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

  // For triangles, push the icon slightly down
  const yOffset = sym.category === 'W_TEHLIKE' ? 30 : 25;
  const xOffset = 25;

  const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      ${bgMarkup}
      <g transform="translate(${xOffset}, ${yOffset}) scale(2.08)">
        ${innerPaths}
      </g>
    </svg>
  `;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fullSvg.trim())}`;
  iconCache[cacheKey] = dataUrl;
  return dataUrl;
};

// ── Hatch Pattern (Canvas-based) ──────────────────────────────────────────────

let hatchPattern: CanvasPattern | null = null;
export const getHatchPattern = () => {
  if (typeof window === 'undefined') return null;
  if (hatchPattern) return hatchPattern;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(16, 0);
    // Draw corners to make it tile perfectly
    ctx.moveTo(-8, 8);
    ctx.lineTo(8, -8);
    ctx.moveTo(8, 24);
    ctx.lineTo(24, 8);
    ctx.stroke();
    hatchPattern = ctx.createPattern(canvas, 'repeat');
  }
  return hatchPattern;
};

// ── Legend Item (HTML) ────────────────────────────────────────────────────────

export function LegendItem({ color, label, type = 'line' }: { color: string; label: string; type?: 'line' | 'dash' | 'bold' }) {
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
}

// ── Custom Symbol Image (Konva) ───────────────────────────────────────────────

export const CustomSymbolImage = ({ src, size, isSelected }: { src: string, size: number, isSelected: boolean }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (isMounted) setImage(img);
    };
    return () => {
      isMounted = false;
    };
  }, [src]);

  const r = size / 2;
  return (
    <Group shadowBlur={isSelected ? 0 : 2} shadowOpacity={0.15}>
      {image && <KonvaImage image={image} width={size} height={size} x={-r} y={-r} />}
    </Group>
  );
};

// ── Watermark Group (Konva) ───────────────────────────────────────────────────

export const WatermarkGroup = () => {
  return null;
};

// ── Branding Banner (Konva) ───────────────────────────────────────────────────

export const BrandingBanner = () => {
  return null;
};
