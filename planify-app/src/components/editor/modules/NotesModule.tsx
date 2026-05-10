import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  NotesModule — Özel Notlar
 *  Ziyaretçi, alt işveren veya saha bilgilendirme notları
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function NotesModule({ region, content, compact }: Props) {
  const title = content.title || 'ÖZEL NOTLAR';
  const body = content.body || '';

  return (
    <ModuleCard
      moduleType="Notes"
      tone={region.tone || 'neutral'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col p-2.5 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {body.split('\n').map((line, i) => (
            <p key={i} className={cn(
              line.trim() === '' ? 'h-2' : 'text-slate-700 leading-relaxed font-semibold'
            )} style={{ fontSize: 'clamp(7px, 2.8cqw, 10px)' }}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </ModuleCard>
  );
}
