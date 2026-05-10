import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleCard } from './ModuleCard';
import { MapPin } from 'lucide-react';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  AssemblyMapModule — Toplanma Alanı / Vaziyet Krokisi
 *  Pin ikonu + konum bilgisi + mini harita placeholder
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function AssemblyMapModule({ region, content, compact }: Props) {
  const title = content.title || 'TOPLANMA ALANI';
  const body = content.body || 'Toplanma noktası bina dışında, güvenli uzaklıkta işaretlenmiş alanda bulunmaktadır.';

  return (
    <ModuleCard
      moduleType="AssemblyMap"
      tone={region.tone || 'blue'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col items-center justify-center p-3 gap-2 overflow-hidden">
        {/* ── Pin hero ── */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200/60 flex items-center justify-center shadow-inner">
            <MapPin className="w-7 h-7 text-blue-600" strokeWidth={2.2} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 8l3.5 3.5L13 5" />
            </svg>
          </div>
        </div>

        {/* ── Text ── */}
        <p className="text-center font-bold text-slate-700 leading-snug"
          style={{ fontSize: 'clamp(7px, 3cqw, 10px)' }}
        >
          {body}
        </p>

        {/* ── Hint bar ── */}
        <div className="w-full px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg mt-auto shrink-0">
          <span className="text-[7px] font-black uppercase tracking-wider text-blue-500 text-center block">
            📍 Toplanma noktası planda işaretlenmelidir
          </span>
        </div>
      </div>
    </ModuleCard>
  );
}
