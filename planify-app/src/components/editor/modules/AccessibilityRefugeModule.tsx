import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  AccessibilityRefugeModule — Erişilebilir Tahliye
 *  Engelli/yaşlı/gebe refakat bilgisi + erişim noktaları
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function AccessibilityRefugeModule({ region, content, compact }: Props) {
  const title = content.title || 'ERİŞİLEBİLİR TAHLİYE';
  const body = content.body || '';
  const lines = body.split('\n').filter(l => l.trim());

  return (
    <ModuleCard
      moduleType="AccessibilityRefuge"
      tone={region.tone || 'blue'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col p-2.5 gap-2 overflow-hidden">
        {/* ── Accessibility hero ── */}
        <div className="flex items-center gap-2.5 shrink-0 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-100/60">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="4" r="2" fill="white" />
              <path d="M12 8v4" />
              <path d="M8 14l4-2 4 2" />
              <circle cx="9" cy="19" r="2" />
              <circle cx="15" cy="19" r="2" />
              <path d="M9 17h6" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[8px] font-black uppercase tracking-wider text-blue-600">
              Engelli / Yaşlı / Gebe
            </div>
            <div className="text-[7px] font-bold text-blue-500/80">
              Refakat sorumlusu atanmalıdır
            </div>
          </div>
        </div>

        {/* ── Content lines ── */}
        <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
          {lines.map((line, i) => {
            const trimmed = line.trim();
            const parts = trimmed.split(/:(.*)/);
            if (parts.length >= 2) {
              return (
                <div key={i} className="flex items-baseline gap-1.5">
                  <span className="text-[7px] font-black uppercase tracking-wider text-blue-500 shrink-0">
                    {parts[0].trim()}:
                  </span>
                  <span className="text-[8px] font-bold text-slate-700 truncate">
                    {parts[1].trim() || '—'}
                  </span>
                </div>
              );
            }
            return (
              <p key={i} className="text-[8px] font-semibold text-slate-600 leading-snug">
                {trimmed}
              </p>
            );
          })}
        </div>
      </div>
    </ModuleCard>
  );
}
