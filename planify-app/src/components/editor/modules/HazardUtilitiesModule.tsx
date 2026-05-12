import React from 'react';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  HazardUtilitiesModule — Risk / Utility Kesme Noktaları
 *  Tehlike ikonu + kesme noktaları listesi
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

const HAZARD_ICONS: Record<string, string> = {
  'elektrik': '⚡',
  'gaz': '🔥',
  'kimyasal': '☣️',
  'su': '💧',
  'tehlike': '⚠️',
  'electric': '⚡',
  'gas': '🔥',
  'chemical': '☣️',
  'water': '💧',
};

function getHazardIcon(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, icon] of Object.entries(HAZARD_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '⚠️';
}

export function HazardUtilitiesModule({ region, content, compact }: Props) {
  const title = content.title || 'RİSK VE KESME NOKTALARI';
  const body = content.body || '';
  const lines = body.split('\n').filter(l => l.trim());

  return (
    <ModuleCard
      moduleType="HazardUtilities"
      tone={region.tone || 'red'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col p-2.5 gap-1.5 overflow-hidden">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          const parts = trimmed.split(/:(.*)/);

          if (parts.length >= 2) {
            return (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-red-50/80 border border-red-100/60">
                <span className="text-sm shrink-0 mt-0.5">{getHazardIcon(parts[0])}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[7px] font-black uppercase tracking-wider text-red-500">
                    {parts[0].trim()}
                  </div>
                  <div className="text-[9px] font-bold text-slate-800 leading-snug">
                    {parts[1].trim() || '—'}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <p key={i} className="text-[8px] font-semibold text-slate-600 leading-snug px-1">
              {trimmed}
            </p>
          );
        })}
      </div>
    </ModuleCard>
  );
}
