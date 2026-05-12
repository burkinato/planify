import React from 'react';
import { ModuleCard } from './ModuleCard';
import { Sparkles } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { SYMBOLS, type TemplateRegion, type TemplateRegionState, type SymbolTemplate } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  LegendModule — Lejand / Semboller Dizini
 *  Çizimde kullanılan sembolleri otomatik senkronize ederek listeler.
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

function getDynamicFontSize(text: string, baseSize: number, maxLength: number = 100) {
  if (!text) return `${baseSize}px`;
  const length = text.length;
  if (length <= maxLength) return `${baseSize}px`;
  const scaleFactor = Math.max(0.6, maxLength / length);
  return `${baseSize * scaleFactor}px`;
}

export function LegendModule({ region, content, compact }: Props) {
  const title = content.title || 'SEMBOLLER DİZİNİ';
  const { elements } = useEditorStore();

  const usedSymbolTypes = Array.from(new Set(
    elements
      .filter(el => el.type === 'symbol' && el.symbolType)
      .map(el => el.symbolType)
  ));

  const displaySymbols = usedSymbolTypes
    .map(type => SYMBOLS.find(s => s.id === type))
    .filter(Boolean) as SymbolTemplate[];

  return (
    <ModuleCard
      moduleType="Legend"
      tone={region.tone || 'info'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col p-2.5 overflow-hidden">
        {displaySymbols.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1 custom-scrollbar">
            {displaySymbols.map((symbol) => (
              <div key={symbol.id} className="flex items-center gap-2.5 group/legend-item">
                <div
                  className="h-6 w-6 rounded-lg flex-shrink-0 flex items-center justify-center border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.05)] transition-all group-hover/legend-item:scale-110"
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
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-30 py-4">
            <Sparkles className="w-7 h-7 mb-2 text-slate-400 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Sembol Ekleyin</span>
            <span className="text-[6px] font-bold uppercase tracking-widest text-slate-300 mt-1">Otomatik Senkronizasyon</span>
          </div>
        )}
      </div>
    </ModuleCard>
  );
}
