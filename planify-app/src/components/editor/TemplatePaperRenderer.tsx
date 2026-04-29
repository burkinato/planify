'use client';
import React, { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

import { ArrowLeft, BadgeCheck, ClipboardList, Flame, MapPinned, ShieldCheck, ChevronRight, Settings2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { mergeTemplateState } from '@/lib/editor/templateLayouts';
import { SYMBOLS } from '@/types/editor';
import type { TemplateLayout, TemplateRegion, TemplateState, SymbolTemplate } from '@/types/editor';

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

function RegionIcon({ region }: { region: TemplateRegion }) {
  if (region.type === 'header') return <ShieldCheck className="h-4 w-4" />;
  if (region.id.toLowerCase().includes('fire')) return <Flame className="h-4 w-4" />;
  if (region.type === 'assembly') return <MapPinned className="h-4 w-4" />;
  if (region.type === 'approval') return <BadgeCheck className="h-4 w-4" />;
  return <ClipboardList className="h-4 w-4" />;
}

function getDynamicFontSize(text: string, baseSize: number, maxLength: number = 100) {
  if (!text) return `${baseSize}px`;
  const length = text.length;
  if (length <= maxLength) return `${baseSize}px`;
  const scaleFactor = Math.max(0.6, maxLength / length);
  return `${baseSize * scaleFactor}px`;
}

function ReadOnlyRegion({ 
  region, title, body, meta, 
  titleSize, titleWeight, titleLetterSpacing, titleLineHeight,
  bodySize, bodyWeight, bodyLetterSpacing, bodyLineHeight,
  metaSize, metaWeight, metaLetterSpacing, metaLineHeight,
  gap, titleColor, bodyColor, metaColor
}: { 
  region: TemplateRegion; 
  title?: string; body?: string; meta?: string;
  titleSize?: number; titleWeight?: string; titleLetterSpacing?: number; titleLineHeight?: number;
  bodySize?: number; bodyWeight?: string; bodyLetterSpacing?: number; bodyLineHeight?: number;
  metaSize?: number; metaWeight?: string; metaLetterSpacing?: number; metaLineHeight?: number;
  gap?: number;
  titleColor?: string;
  bodyColor?: string;
  metaColor?: string;
}) {
  const { elements, projectMetadata, advancedType } = useEditorStore();

  const getFocusStyle = (type: string) => {
    if (advancedType !== type) return "";
    return "ring-2 ring-cyan-500 ring-offset-2 ring-offset-white bg-cyan-50/30 rounded-sm px-1 transition-all animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.2)]";
  };

  if (region.type === 'legend') {
    const usedSymbolTypes = Array.from(new Set(
      elements
        .filter(el => el.type === 'symbol' && el.symbolType)
        .map(el => el.symbolType)
    ));

    const displaySymbols = usedSymbolTypes
      .map(type => SYMBOLS.find(s => s.id === type))
      .filter(Boolean) as SymbolTemplate[];

    return (
      <div className="h-full overflow-hidden p-3 flex flex-col">
        <div 
          className={cn("flex items-center gap-2 uppercase tracking-widest text-slate-700 flex-shrink-0", getFocusStyle('title'))}
          style={{ 
            fontSize: titleSize || 10,
            fontWeight: titleWeight || 'black',
            letterSpacing: titleLetterSpacing !== undefined ? `${titleLetterSpacing}px` : undefined,
            lineHeight: titleLineHeight || 1.2,
            marginBottom: gap !== undefined ? `${gap}px` : '8px',
            color: titleColor || undefined
          }}
        >
          <RegionIcon region={region} />
          {title || region.label}
        </div>
        <div 
          className="grid grid-cols-1 overflow-y-auto pr-1 custom-scrollbar"
          style={{ gap: gap !== undefined ? `${gap/2}px` : '10px' }}
        >
          {displaySymbols.length > 0 ? (
            displaySymbols.map((symbol) => (
              <div key={symbol.id} className="flex items-center gap-3 group/legend-item">
                 <div 
                  className="h-6 w-6 rounded-lg flex-shrink-0 flex items-center justify-center border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.05)] transition-all group-hover/legend-item:scale-110 group-hover/legend-item:shadow-md"
                  style={{ backgroundColor: symbol.color }}
                >
                  <div className="w-2.5 h-2.5 bg-white/40 backdrop-blur-[1px] rounded-[3px] rotate-45 border border-white/20 shadow-sm" />
                </div>
                <span 
                  className="font-black text-slate-800 truncate uppercase tracking-tight"
                  style={{ fontSize: getDynamicFontSize(symbol.name, 9.5, 24) }}
                >
                  {symbol.name}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 py-8 animate-pulse">
              <Sparkles className="w-8 h-8 mb-2 text-slate-400" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Sembol Ekleyin</span>
              <span className="text-[6px] font-bold uppercase tracking-widest text-slate-300 mt-1">Otomatik Senkronizasyon Aktif</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (region.type === 'instruction' || region.type === 'emergency') {
    const isEmergency = region.type === 'emergency';
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-inner">
        <div className={cn(
          "flex shrink-0 items-center justify-between border-b px-3 py-1.5",
          region.tone === 'green' ? "bg-emerald-600 border-emerald-700/30" :
          region.tone === 'red' ? "bg-rose-600 border-rose-700/30" :
          "bg-slate-800 border-slate-900/30"
        )}>
          <div className={cn("flex items-center gap-2", getFocusStyle('title'))}>
            <RegionIcon region={region} />
            <span 
              className="uppercase tracking-[0.2em] text-white/90"
              style={{ 
                fontSize: titleSize || 9,
                fontWeight: titleWeight || 'black',
                letterSpacing: titleLetterSpacing !== undefined ? `${titleLetterSpacing}px` : '0.15em',
                lineHeight: titleLineHeight || 1.2,
                marginBottom: gap !== undefined ? `${gap}px` : undefined,
                color: titleColor || 'white'
              }}
            >
              {title || region.label}
            </span>
          </div>
        </div>
        
        <div 
          className="flex-1 p-2 flex flex-col overflow-y-auto scrollbar-hide"
          style={{ gap: gap !== undefined ? `${gap/2}px` : '4px' }}
        >
           {isEmergency && (
             <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 flex items-center gap-3 shrink-0">
               <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-white font-[1000] text-[10px] shadow-lg ring-2 ring-rose-500/20">112</div>
               <div className="flex flex-col -space-y-0.5">
                 <div className="text-[9px] font-[1000] uppercase tracking-wider text-rose-700">ACİL DURUM TELEFONU</div>
                 <div className="text-[7px] font-black uppercase tracking-[0.15em] text-rose-400">EMERGENCY CALL</div>
               </div>
             </div>
           )}
           <div 
              className={cn("text-slate-800 tracking-tight px-1 flex flex-col", getFocusStyle('body'))}
              style={{ 
                fontSize: bodySize || parseInt(getDynamicFontSize(body || '', 10, 220)),
                fontWeight: bodyWeight || 'semibold',
                letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : undefined,
                lineHeight: bodyLineHeight || 1.5,
                gap: gap !== undefined ? `${gap/4}px` : '4px',
                color: bodyColor || undefined
              }}
            >
              {(body || 'Talimatlar buraya gelecek...').split('\n').map((p, i) => (
                <p key={i} className={cn(p.trim() === '' ? 'h-2' : '')}>{p}</p>
              ))}
            </div>
        </div>

        <div className={cn(
          "h-1 w-full opacity-30",
          isEmergency ? "bg-rose-600" : "bg-emerald-600"
        )} />
      </div>
    );
  }

  if (region.type === 'header') {
    return (
      <div className="flex h-full w-full items-center justify-between px-6 py-2">
        {projectMetadata.logoUrl ? (
          <div className="flex-shrink-0 flex items-center justify-center h-3/4 aspect-square rounded-2xl bg-slate-50/50 border border-slate-200/50 shadow-inner group/logo relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            <Image src={projectMetadata.logoUrl} alt="Logo" fill className="object-contain drop-shadow-md p-1" style={{ imageRendering: 'auto' }} />
          </div>
        ) : (
          <div className="flex-shrink-0 w-[80px]" />
        )}

        <div className="flex-1 flex flex-col items-center justify-center px-12 relative h-full">
          <div 
            className={cn("text-emerald-950 uppercase tracking-[-0.01em] drop-shadow-sm pt-1", getFocusStyle('title'))}
            style={{ 
              fontSize: titleSize || 32, 
              fontWeight: titleWeight || 'black',
              letterSpacing: titleLetterSpacing !== undefined ? `${titleLetterSpacing}px` : undefined,
              lineHeight: titleLineHeight || 1.2,
              marginBottom: gap !== undefined ? `${gap}px` : '12px',
              color: titleColor || undefined
            }}
          >
            {title || region.label}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span 
                className={cn("text-emerald-800 uppercase whitespace-nowrap opacity-95", getFocusStyle('body'))}
                style={{ 
                  fontSize: bodySize || 14,
                  fontWeight: bodyWeight || 'black',
                  letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : '0.25em',
                  lineHeight: bodyLineHeight || 1.2,
                  color: bodyColor || undefined
                }}
              >
                {body !== undefined ? body : (projectMetadata.name || 'İSİMSİZ PROJE')}
              </span>
              {( (body !== undefined ? body : projectMetadata.name) && (meta !== undefined ? meta : projectMetadata.floor) ) && (
                <span className="text-emerald-300/50 mx-1">|</span>
              )}
              <span 
                className={cn("text-emerald-800 uppercase whitespace-nowrap opacity-95", getFocusStyle('meta'))}
                style={{ 
                  fontSize: metaSize || bodySize || 14,
                  fontWeight: metaWeight || bodyWeight || 'black',
                  letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : '0.25em',
                  lineHeight: metaLineHeight || 1.2,
                  color: metaColor || bodyColor || undefined
                }}
              >
                {meta !== undefined ? meta : (projectMetadata.floor || 'ZEMİN KAT')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 w-[80px]" />
      </div>
    );
  }

  if (region.type === 'approval') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-white shrink-0">
          <div className="p-1 rounded bg-white/10">
            <ClipboardList className="w-3 h-3" />
          </div>
          <span 
            className={cn("uppercase tracking-[0.25em]", getFocusStyle('title'))}
            style={{ 
              fontSize: titleSize || 10,
              fontWeight: titleWeight || 'black',
              letterSpacing: titleLetterSpacing !== undefined ? `${titleLetterSpacing}px` : undefined,
              lineHeight: titleLineHeight || 1.2,
              color: titleColor || undefined
            }}
          >
            {title || region.label}
          </span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <div 
          className="flex-1 grid grid-cols-5 divide-x divide-slate-200"
          style={{ gap: gap !== undefined ? `${gap/4}px` : '0px' }}
        >
          <div className="flex flex-col justify-center px-4 py-2">
            <span className={cn("text-slate-400 uppercase tracking-widest", getFocusStyle('meta'))} style={{ fontSize: metaSize || 7, fontWeight: metaWeight || 'black', letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : undefined, color: metaColor || undefined }}>Düzenleyen / Prepared By</span>
            <span className={cn("text-slate-800 uppercase", getFocusStyle('body'))} style={{ fontSize: bodySize || 10, fontWeight: bodyWeight || 'black', letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : undefined, color: bodyColor || undefined }}>{projectMetadata.author || 'İSİM SOYİSİM'}</span>
          </div>
          <div className="flex flex-col justify-center px-4 py-2">
            <span className={cn("text-slate-400 uppercase tracking-widest", getFocusStyle('meta'))} style={{ fontSize: metaSize || 7, fontWeight: metaWeight || 'black', letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : undefined, color: metaColor || undefined }}>Ölçek / Scale</span>
            <span className={cn("text-slate-800", getFocusStyle('body'))} style={{ fontSize: bodySize || 10, fontWeight: bodyWeight || 'black', letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : undefined, color: bodyColor || undefined }}>1:{projectMetadata.scale || '100'}</span>
          </div>
          <div className="flex flex-col justify-center px-4 py-2">
            <span className={cn("text-slate-400 uppercase tracking-widest", getFocusStyle('meta'))} style={{ fontSize: metaSize || 7, fontWeight: metaWeight || 'black', letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : undefined, color: metaColor || undefined }}>Onaylayan / Approved By</span>
            <span className={cn("text-slate-800 uppercase", getFocusStyle('body'))} style={{ fontSize: bodySize || 10, fontWeight: bodyWeight || 'black', letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : undefined, color: bodyColor || undefined }}>YÖNETİM KURULU</span>
          </div>
          <div className="flex flex-col justify-center px-4 py-2">
            <span className={cn("text-slate-400 uppercase tracking-widest", getFocusStyle('meta'))} style={{ fontSize: metaSize || 7, fontWeight: metaWeight || 'black', letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : undefined, color: metaColor || undefined }}>Tarih / Date</span>
            <span className={cn("text-slate-800", getFocusStyle('body'))} style={{ fontSize: bodySize || 10, fontWeight: bodyWeight || 'black', letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : undefined, color: bodyColor || undefined }}>{projectMetadata.date || '28.04.2026'}</span>
          </div>
          <div className="flex flex-col justify-center px-4 py-2 bg-slate-50/50">
            <span className={cn("text-slate-400 uppercase tracking-widest", getFocusStyle('meta'))} style={{ fontSize: metaSize || 7, fontWeight: metaWeight || 'black', letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : undefined }}>Revizyon / Revision</span>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-slate-950", getFocusStyle('body'))} style={{ fontSize: (bodySize ? bodySize + 4 : 14), fontWeight: '1000' }}>{projectMetadata.revision || '00'}</span>
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Current</span>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-1.5 bg-slate-100/50 border-t border-slate-100 flex justify-between items-center shrink-0">
           <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter italic">© PLANIFY TECH SOLUTIONS - TÜM HAKLARI SAKLIDIR / ALL RIGHTS RESERVED</span>
           <div className="flex gap-4">
             <span className="text-[7px] font-black text-slate-600 uppercase">ISO 23601 COMPLIANT</span>
             <span className="text-[7px] font-black text-slate-600 uppercase">OFFICIAL DOCUMENT</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden p-3 flex flex-col">
      <div 
        className={cn("flex items-center gap-2 uppercase tracking-widest text-slate-800 flex-shrink-0", getFocusStyle('title'))}
        style={{ 
          fontSize: titleSize || 10,
          fontWeight: titleWeight || 'black',
          letterSpacing: titleLetterSpacing !== undefined ? `${titleLetterSpacing}px` : undefined,
          lineHeight: titleLineHeight || 1.2,
          marginBottom: gap !== undefined ? `${gap}px` : '8px'
        }}
      >
        <RegionIcon region={region} />
        {title || region.label}
      </div>
      <div 
        className={cn("text-slate-700 overflow-y-auto custom-scrollbar flex flex-col", getFocusStyle('body'))}
        style={{ 
          fontSize: bodySize || parseInt(getDynamicFontSize(body || '', 10, 150)),
          fontWeight: bodyWeight || 'semibold',
          letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : undefined,
          lineHeight: bodyLineHeight || 1.5,
          gap: gap !== undefined ? `${gap/4}px` : '4px'
        }}
      >
        {(body || '').split('\n').map((p, i) => (
          <p key={i} className={cn(p.trim() === '' ? 'h-2' : '')}>{p}</p>
        ))}
      </div>
      {meta && (
        <div 
          className={cn("uppercase tracking-widest text-slate-500 flex-shrink-0", getFocusStyle('meta'))}
          style={{ 
            fontSize: metaSize || parseInt(getDynamicFontSize(meta, 9, 50)),
            fontWeight: metaWeight || 'bold',
            letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : undefined,
            lineHeight: metaLineHeight || 1.2,
            marginTop: gap !== undefined ? `${gap}px` : '8px'
          }}
        >
          {meta}
        </div>
      )}
    </div>
  );
}

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
  const [hintRect, setHintRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!focusedRegionId || typeof document === 'undefined') {
      return;
    }
    
    let frameId: number;
    const update = () => {
      const el = document.getElementById(`region-${focusedRegionId}`);
      if (el) {
        setHintRect(el.getBoundingClientRect());
      }
      frameId = requestAnimationFrame(update);
    };
    
    update();
    return () => {
      cancelAnimationFrame(frameId);
      setHintRect(null);
    };
  }, [focusedRegionId]);

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
                  {focused && (
                    <div className="absolute inset-0 pointer-events-none z-50 border-4 border-cyan-500/20 animate-pulse rounded-sm" />
                  )}
                  <ReadOnlyRegion 
                    region={region} 
                    title={content.title} 
                    body={content.body} 
                    meta={content.meta} 
                    titleSize={content.titleSize}
                    titleWeight={content.titleWeight}
                    titleLetterSpacing={content.titleLetterSpacing}
                    titleLineHeight={content.titleLineHeight}
                    bodySize={content.bodySize}
                    bodyWeight={content.bodyWeight}
                    bodyLetterSpacing={content.bodyLetterSpacing}
                    bodyLineHeight={content.bodyLineHeight}
                    metaSize={content.metaSize}
                    metaWeight={content.metaWeight}
                    metaLetterSpacing={content.metaLetterSpacing}
                    metaLineHeight={content.metaLineHeight}
                    gap={content.gap}
                    titleColor={content.titleColor}
                    bodyColor={content.bodyColor}
                    metaColor={content.metaColor}
                  />
                </div>
              )}

              {focused && hintRect && typeof document !== 'undefined' && createPortal(
                <div 
                  className="fixed z-[10000] flex items-center pointer-events-none animate-in fade-in slide-in-from-left-4 duration-300"
                  style={{
                    left: `${hintRect.right}px`,
                    top: `${hintRect.top + hintRect.height / 2}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <div className="w-10 h-[1.5px] bg-gradient-to-r from-cyan-500 to-cyan-500/50 rounded-full" />
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-xl shadow-2xl border border-white/10 ring-1 ring-white/5">
                      <Settings2 className="w-3 h-3 text-cyan-400 animate-[spin_4s_linear_infinite]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap">AYARLAR SAĞ PANELDE</span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    </div>
                    <span className="text-[7px] font-black text-cyan-600 uppercase tracking-widest pl-1 opacity-80">Düzenleme Modu Aktif</span>
                  </div>
                </div>,
                document.body
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
