import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  GenericModule — Bilinmeyen/fallback modül tipi
 *  Herhangi bir modül tipine eşleşmeyen bölgeler için.
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

function getDynamicFontSize(text: string, baseSize: number, maxLength: number = 150) {
  if (!text) return `${baseSize}px`;
  const length = text.length;
  if (length <= maxLength) return `${baseSize}px`;
  const scaleFactor = Math.max(0.6, maxLength / length);
  return `${baseSize * scaleFactor}px`;
}

export function GenericModule({ region, content, compact }: Props) {
  const title = content.title || region.label;
  const body = content.body || '';
  const meta = content.meta || '';

  return (
    <ModuleCard
      moduleType="Notes"
      tone={region.tone || 'neutral'}
      title={title}
      compact={compact}
    >
      <div className="h-full overflow-hidden p-3 flex flex-col">
        <div
          className="text-slate-700 overflow-y-auto custom-scrollbar flex flex-col"
          style={{
            fontSize: parseInt(getDynamicFontSize(body, 10, 150)),
            fontWeight: 600,
            lineHeight: 1.5,
            gap: '4px',
          }}
        >
          {body.split('\n').map((p, i) => (
            <p key={i} className={cn(p.trim() === '' ? 'h-2' : '')}>{p}</p>
          ))}
        </div>
        {meta && (
          <div
            className="uppercase tracking-widest text-slate-500 flex-shrink-0 mt-2"
            style={{
              fontSize: parseInt(getDynamicFontSize(meta, 9, 50)),
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </ModuleCard>
  );
}
