'use client';
import React from 'react';
import Image from 'next/image';

import { ArrowLeft, BadgeCheck, ClipboardList, Flame, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';
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
  const { elements, projectMetadata, advancedType, focusedRegionId } = useEditorStore();

  const getFocusStyle = (type: string) => {
    if (advancedType !== type) return "";
    return "ring-2 ring-cyan-500 ring-offset-2 ring-offset-white bg-cyan-50/50 rounded-md px-1.5 py-0.5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]";
  };

  const isRegionFocused = focusedRegionId === region.id;

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
    const isFireInstruction = region.id?.toLowerCase().includes('fire');
    const accentColor = region.tone === 'red' || isFireInstruction ? 'rose' : region.tone === 'green' ? 'emerald' : 'slate';
    
    // Parse body into structured items
    const lines = (body || 'Talimatlar buraya gelecek...').split('\n');
    const validLineCount = lines.filter(l => l.trim() !== '').length || 1;
    const computedBaseSize = bodySize || Math.max(5.5, Math.min(8.5, 95 / validLineCount));
    
    const renderLine = (line: string, i: number) => {
      const trimmed = line.trim();
      if (trimmed === '') return <div key={i} className="h-1.5" />;
      
      // Numbered items (e.g., "1. Something")
      const numberedMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        const [, num, text] = numberedMatch;
        return (
          <div key={i} className="flex items-start gap-2 group/item">
            <div 
              className={cn(
                "flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white mt-[1px] shadow-sm",
                accentColor === 'rose' ? "bg-rose-500" : accentColor === 'emerald' ? "bg-emerald-500" : "bg-slate-600"
              )}
              style={{ fontSize: 7, fontWeight: 900 }}
            >
              {num}
            </div>
            <span 
              className="text-slate-800 leading-snug flex-1"
              style={{ 
                fontSize: computedBaseSize, 
                fontWeight: bodyWeight || 600,
                letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : '-0.01em',
                color: bodyColor || undefined,
              }}
            >
              {text}
            </span>
          </div>
        );
      }
      
      // Sub-items with indent (e.g., "   Ç — something")
      if (line.startsWith('   ') || line.startsWith('\t')) {
        return (
          <div key={i} className="ml-6 flex items-start gap-1.5">
            <span 
              className={cn(
                "text-slate-600 leading-snug",
                accentColor === 'rose' ? "text-rose-700" : accentColor === 'emerald' ? "text-emerald-700" : "text-slate-600"
              )}
              style={{ 
                fontSize: computedBaseSize - 0.5, 
                fontWeight: 700,
                color: bodyColor || undefined,
              }}
            >
              {trimmed}
            </span>
          </div>
        );
      }
      
      // Bullet items (e.g., "• Something" or "— Something")
      const bulletMatch = trimmed.match(/^[•\-—►]\s*(.+)/);
      if (bulletMatch) {
        return (
          <div key={i} className="flex items-start gap-1.5 ml-1">
            <span className={cn(
              "mt-[2px] text-[6px]",
              accentColor === 'rose' ? "text-rose-400" : accentColor === 'emerald' ? "text-emerald-400" : "text-slate-400"
            )}>●</span>
            <span 
              className="text-slate-700 leading-snug flex-1"
              style={{ 
                fontSize: computedBaseSize - 0.5, 
                fontWeight: bodyWeight || 600,
                color: bodyColor || undefined,
              }}
            >
              {bulletMatch[1]}
            </span>
          </div>
        );
      }
      
      // Phone number lines (e.g., "112 — Something")
      const phoneMatch = trimmed.match(/^(\d{3})\s*[—\-–]\s*(.+)/);
      if (phoneMatch && isEmergency) {
        const [, phoneNum, desc] = phoneMatch;
        return (
          <div key={i} className="flex items-center gap-2 py-[1px]">
            <span 
              className={cn(
                "font-[1000] text-white rounded px-1 py-[1px] shadow-sm",
                phoneNum === '112' ? "bg-rose-600" : phoneNum === '110' ? "bg-orange-500" : "bg-slate-600"
              )}
              style={{ fontSize: 7 }}
            >
              {phoneNum}
            </span>
            <span 
              className="text-slate-700 leading-snug flex-1"
              style={{ 
                fontSize: computedBaseSize - 0.5, 
                fontWeight: 700,
                color: bodyColor || undefined,
              }}
            >
              {desc}
            </span>
          </div>
        );
      }
      
      // Section headers (e.g., "Aramada bildirin:")
      if (trimmed.endsWith(':')) {
        return (
          <div key={i} className="mt-1">
            <span 
              className={cn(
                "uppercase tracking-wider font-[900]",
                accentColor === 'rose' ? "text-rose-600" : accentColor === 'emerald' ? "text-emerald-600" : "text-slate-600"
              )}
              style={{ fontSize: 7 }}
            >
              {trimmed}
            </span>
          </div>
        );
      }
      
      // Regular text
      return (
        <p 
          key={i} 
          className="text-slate-700 leading-snug"
          style={{ 
            fontSize: computedBaseSize, 
            fontWeight: bodyWeight || 600,
            color: bodyColor || undefined,
          }}
        >
          {trimmed}
        </p>
      );
    };

    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-inner">
        {/* Title Bar */}
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
                color: titleColor || 'white'
              }}
            >
              {title || region.label}
            </span>
          </div>
        </div>
        
        {/* Content Body */}
        <div 
          className="flex-1 px-2.5 pt-2 pb-6 flex flex-col overflow-hidden"
          style={{ gap: gap !== undefined ? `${gap/2}px` : '3px' }}
        >
          {lines.map((line, i) => renderLine(line, i))}
        </div>

        {/* Bottom accent bar */}
        <div className={cn(
          "h-[3px] w-full shrink-0",
          accentColor === 'rose' ? "bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500" : 
          accentColor === 'emerald' ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" :
          "bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400"
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
            className={cn(
              "text-emerald-950 uppercase tracking-[-0.01em] drop-shadow-sm pt-1 transition-all duration-200",
              isRegionFocused && "ring-2 ring-blue-500 ring-offset-4 ring-offset-white rounded-md px-2 py-1 bg-blue-50/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]",
              getFocusStyle('title')
            )}
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
            {isRegionFocused && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500 text-white animate-pulse">
                DÜZENLENİYOR
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  "text-emerald-800 uppercase whitespace-nowrap opacity-95 transition-all duration-200",
                  focusedRegionId === region.id && advancedType === 'body' && "ring-2 ring-blue-400 ring-offset-2 ring-offset-white rounded px-1 bg-blue-50/30",
                  getFocusStyle('body')
                )}
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
                className={cn(
                  "text-emerald-800 uppercase whitespace-nowrap opacity-95 transition-all duration-200",
                  focusedRegionId === region.id && advancedType === 'meta' && "ring-2 ring-blue-400 ring-offset-2 ring-offset-white rounded px-1 bg-blue-50/30",
                  getFocusStyle('meta')
                )}
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
          className="flex-1 grid auto-cols-fr grid-flow-col divide-x divide-slate-200"
          style={{ gap: gap !== undefined ? `${gap/4}px` : '0px' }}
        >
          {(body || '').split('\n').filter(l => l.trim() !== '').map((line, i, arr) => {
            const parts = line.split(/:(.*)/);
            const isLast = i === arr.length - 1;
            
            if (parts.length >= 2) {
              return (
                <div key={i} className={cn("flex flex-col justify-center px-3 py-2", isLast && "bg-slate-50/50")}>
                  <span className={cn("text-slate-400 uppercase tracking-widest", getFocusStyle('meta'))} style={{ fontSize: metaSize || 7, fontWeight: metaWeight || 'black', letterSpacing: metaLetterSpacing !== undefined ? `${metaLetterSpacing}px` : undefined, color: metaColor || undefined }}>{parts[0].trim()}</span>
                  <div className="flex items-baseline gap-1 mt-[1px]">
                    <span className={cn("text-slate-800 uppercase truncate", getFocusStyle('body'))} style={{ fontSize: isLast ? (bodySize ? bodySize + 2 : 12) : (bodySize || 9), fontWeight: bodyWeight || 'black', letterSpacing: bodyLetterSpacing !== undefined ? `${bodyLetterSpacing}px` : undefined, color: bodyColor || undefined }}>{parts[1].trim() || '—'}</span>
                    {isLast && <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter ml-1">Current</span>}
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="flex flex-col justify-center px-3 py-2">
                <span className={cn("text-slate-800 uppercase truncate", getFocusStyle('body'))} style={{ fontSize: bodySize || 9, fontWeight: bodyWeight || 'black', color: bodyColor || undefined }}>{line}</span>
              </div>
            );
          })}
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

            </section>
          );
        })}
      </div>
    </div>
  );
}
