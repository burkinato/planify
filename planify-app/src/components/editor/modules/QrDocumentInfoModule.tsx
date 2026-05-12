import React from 'react';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  QrDocumentInfoModule — QR Kod / Belge Bilgisi
 *  QR placeholder + belge numarası + geçerlilik tarihi
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function QrDocumentInfoModule({ region, content, compact }: Props) {
  const title = content.title || 'BELGE BİLGİSİ';
  const body = content.body || '';
  const lines = body.split('\n').filter(l => l.trim());

  return (
    <ModuleCard
      moduleType="QrDocumentInfo"
      tone={region.tone || 'info'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col items-center justify-center p-2.5 gap-2 overflow-hidden">
        {/* ── QR Code Placeholder ── */}
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 shrink-0">
          <svg viewBox="0 0 48 48" className="w-10 h-10 text-slate-300">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7" y="7" width="10" height="10" fill="currentColor" opacity=".3" />
            <rect x="28" y="4" width="16" height="16" rx="2" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" />
            <rect x="31" y="7" width="10" height="10" fill="currentColor" opacity=".3" />
            <rect x="4" y="28" width="16" height="16" rx="2" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7" y="31" width="10" height="10" fill="currentColor" opacity=".3" />
            <rect x="28" y="28" width="6" height="6" fill="currentColor" opacity=".3" />
            <rect x="36" y="28" width="6" height="6" fill="currentColor" opacity=".3" />
            <rect x="28" y="36" width="6" height="6" fill="currentColor" opacity=".3" />
            <rect x="38" y="38" width="6" height="6" fill="currentColor" opacity=".3" />
          </svg>
        </div>

        {/* ── Document info ── */}
        <div className="w-full flex flex-col gap-1">
          {lines.map((line, i) => {
            const trimmed = line.trim();
            const parts = trimmed.split(/:(.*)/);
            if (parts.length >= 2) {
              return (
                <div key={i} className="flex items-baseline justify-between gap-1">
                  <span className="text-[7px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                    {parts[0].trim()}
                  </span>
                  <span className="text-[8px] font-bold text-slate-700 truncate text-right">
                    {parts[1].trim() || '—'}
                  </span>
                </div>
              );
            }
            return (
              <p key={i} className="text-[7px] font-semibold text-slate-500 text-center">
                {trimmed}
              </p>
            );
          })}
        </div>
      </div>
    </ModuleCard>
  );
}
