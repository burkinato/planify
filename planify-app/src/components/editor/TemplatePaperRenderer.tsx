'use client';
import React from 'react';

import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mergeTemplateState } from '@/lib/editor/templateLayouts';
import type { TemplateLayout, TemplateState } from '@/types/editor';
import { ModuleDispatcher } from './modules/ModuleDispatcher';

interface TemplatePaperRendererProps {
  layout: TemplateLayout;
  templateState: TemplateState;
  focusedRegionId: string | null;
  onFocusRegion: (id: string | null) => void;
  drawingHostRef: React.RefObject<HTMLDivElement | null>;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

const toneStyles: Record<string, string> = {
  green: 'border-emerald-600/30 bg-emerald-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
  red: 'border-rose-600/30 bg-rose-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
  blue: 'border-blue-600/30 bg-blue-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
  info: 'border-slate-300 bg-slate-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]',
  neutral: 'border-slate-200 bg-white shadow-sm',
  paper: 'border-slate-300 bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]',
};

export function TemplatePaperRenderer({
  layout,
  templateState,
  focusedRegionId,
  onFocusRegion,
  drawingHostRef,
  exportRef,
  children,
}: TemplatePaperRendererProps) {
  const page = layout.layout_json.page;
  const state = mergeTemplateState(templateState);
  const regions = layout.layout_json.regions || [];
  const accent = layout.layout_json.accent || '#00965e';

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto p-3 md:p-6">
      <div
        ref={exportRef}
        data-template-paper="true"
        className="relative bg-white text-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.24)] ring-1 ring-slate-300/80 transition-all duration-300"
        style={{
          width: 'min(100%, 1280px)',
          aspectRatio: `${page.width} / ${page.height}`,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,.035)_1px,transparent_1px),linear-gradient(rgba(15,23,42,.035)_1px,transparent_1px)] bg-[length:24px_24px]" />
        {focusedRegionId && (
          <button
            onClick={() => onFocusRegion(null)}
            className="absolute left-4 top-4 z-40 flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-xl transition-transform hover:scale-[1.02]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Geri Gel
          </button>
        )}

        {regions.map((region) => {
          const focused = focusedRegionId === region.id;
          const dimmed = !!focusedRegionId && !focused;
          const content = state[region.id] || {};
          const isHeader = region.type === 'header';
          const isDrawing = region.type === 'drawing';

          return (
            <section
              key={region.id}
              id={`region-${region.id}`}
              ref={isDrawing ? drawingHostRef : undefined}
              onClick={isDrawing ? undefined : () => {
                if (!focused) {
                  onFocusRegion(region.id);
                }
              }}
              className={cn(
                'absolute rounded-[12px] border transition-all duration-500 ease-out',
                !focused && 'overflow-hidden',
                toneStyles[region.tone || 'neutral'],
                isHeader && 'border-none shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)]',
                focused && 'z-30 border-cyan-500 shadow-[0_0_0_8px_rgba(6,182,212,0.15),0_30px_70px_-15px_rgba(0,0,0,0.4)] scale-[1.02]',
                focused && 'ring-2 ring-cyan-500 ring-offset-4 ring-offset-white ring-opacity-100',
                dimmed && !isDrawing && 'pointer-events-none opacity-40 blur-[0.8px] saturate-[0.7] brightness-95',
                dimmed && isDrawing && 'opacity-80 brightness-95 pointer-events-auto',
                isDrawing && 'pointer-events-auto',
                !focused && !isDrawing && 'cursor-pointer hover:shadow-md hover:border-cyan-500/30'
              )}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.w}%`,
                height: `${region.h}%`,
                background: isHeader ? accent : undefined,
              }}
            >
              {isDrawing ? (
                <div className="h-full w-full">
                  {children}
                  {!focused && (
                    <div className="pointer-events-none absolute inset-0 flex items-start justify-start p-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {region.label}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-full w-full group/region">
                  <ModuleDispatcher
                    region={region}
                    content={content}
                    accent={accent}
                  />
                </div>
              )}

            </section>
          );
        })}
      </div>
    </div>
  );
}
