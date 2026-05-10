'use client';

import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage } from 'react-konva';

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
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);

  const r = size / 2;
  return (
    <Group shadowBlur={isSelected ? 0 : 2} shadowOpacity={0.15}>
      {image && <KonvaImage image={image} width={size} height={size} x={-r} y={-r} />}
    </Group>
  );
};

// ── Watermark Group (Konva) ───────────────────────────────────────────────────

export const WatermarkGroup = ({ width, height, tier, email }: { width: number; height: number; tier: string; email?: string }) => {
  return null;
};

// ── Branding Banner (Konva) ───────────────────────────────────────────────────

export const BrandingBanner = ({ width, height, tier }: { width: number; height: number; tier: string }) => {
  return null;
};
