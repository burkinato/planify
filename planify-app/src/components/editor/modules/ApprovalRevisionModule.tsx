import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  ApprovalRevisionModule — Onay / Revizyon
 *  İmza grid + tarih + revizyon numarası — tablo görünümü
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function ApprovalRevisionModule({ region, content, compact }: Props) {
  const title = content.title || 'REVİZYON VE ONAY';
  const body = content.body || 'Hazırlayan: ____\nKontrol: İSG Uzmanı\nOnaylayan: İşveren\nTarih: __/__/____\nRevizyon No: 00';
  const isColoredTone = region.tone === 'red' || region.tone === 'green' || region.tone === 'blue';

  const bodyLines = body.split('\n').filter(l => l.trim() !== '');

  return (
    <ModuleCard
      moduleType="ApprovalRevision"
      tone={region.tone || 'neutral'}
      title={title}
      compact={compact}
      showHeader={true}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Grid of approval fields ── */}
        <div className="flex-1 grid auto-cols-fr grid-flow-col divide-x divide-slate-200">
          {bodyLines.map((line, i) => {
            const parts = line.split(/:(.*)/);
            const isLast = i === bodyLines.length - 1;

            if (parts.length >= 2) {
              return (
                <div key={i} className={cn(
                  'flex flex-col justify-center px-3 py-2',
                  isLast && (isColoredTone ? 'bg-white/10' : 'bg-slate-50/50')
                )}>
                  <span className={cn(
                    'uppercase tracking-widest',
                    isColoredTone ? 'text-white/70' : 'text-slate-400'
                  )} style={{ fontSize: 7, fontWeight: 900 }}>
                    {parts[0].trim()}
                  </span>
                  <div className="flex items-baseline gap-1 mt-[1px]">
                    <span className={cn(
                      'uppercase truncate',
                      isColoredTone ? 'text-white' : 'text-slate-800'
                    )} style={{ fontSize: isLast ? 12 : 9, fontWeight: 900 }}>
                      {parts[1].trim() || '—'}
                    </span>
                    {isLast && (
                      <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter ml-1">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className="flex flex-col justify-center px-3 py-2">
                <span className={cn(
                  'uppercase truncate',
                  isColoredTone ? 'text-white' : 'text-slate-800'
                )} style={{ fontSize: 9, fontWeight: 900 }}>
                  {line}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-1.5 bg-slate-100/50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter italic">
            © KOLAYTAHL�YE TECH — TÜM HAKLARI SAKLIDIR
          </span>
          <div className="flex gap-4">
            <span className="text-[7px] font-black text-slate-600 uppercase">ISO 23601</span>
            <span className="text-[7px] font-black text-slate-600 uppercase">RESMİ BELGE</span>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
}
