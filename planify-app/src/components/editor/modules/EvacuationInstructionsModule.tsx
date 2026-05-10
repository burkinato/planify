import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  EvacuationInstructionsModule — Tahliye Talimatı
 *  Numaralı adımlar, her adıma ikon destekli görsel tasarım
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function EvacuationInstructionsModule({ region, content, compact }: Props) {
  const title = content.title || 'ACIL DURUM TALIMATI';
  const body = content.body || '';
  const lines = body.split('\n');
  const validLines = lines.filter(l => l.trim() !== '');
  const baseFontSize = Math.max(6, Math.min(9, 90 / (validLines.length || 1)));
  const isColoredTone = region.tone === 'green' || region.tone === 'red' || region.tone === 'blue';
  const accentColor = region.tone === 'red' ? 'rose' : region.tone === 'blue' ? 'blue' : 'emerald';

  return (
    <ModuleCard
      moduleType="EvacuationInstructions"
      tone={region.tone || 'green'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col px-2.5 pt-2 pb-1 gap-1 overflow-hidden">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (trimmed === '') return <div key={i} className="h-1" />;

          // Numbered items: "1. Text"
          const numberedMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
          if (numberedMatch) {
            const [, num, text] = numberedMatch;
            return (
              <div key={i} className="flex items-start gap-2 group/step">
                <div className={cn(
                  'flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white shadow-sm',
                  accentColor === 'rose' ? 'bg-rose-500' :
                  accentColor === 'blue' ? 'bg-blue-500' :
                  'bg-emerald-500'
                )} style={{ fontSize: 7, fontWeight: 900 }}>
                  {num}
                </div>
                <span className={cn(
                  'leading-snug flex-1',
                  isColoredTone ? 'text-white' : 'text-slate-800'
                )} style={{
                  fontSize: baseFontSize,
                  fontWeight: 600,
                }}>
                  {text}
                </span>
              </div>
            );
          }

          // Indented sub-items
          if (line.startsWith('   ') || line.startsWith('\t')) {
            return (
              <div key={i} className="ml-[26px] flex items-start gap-1.5">
                <span className={cn('w-1 h-1 rounded-full mt-[5px] shrink-0',
                  accentColor === 'rose' ? 'bg-rose-400' :
                  accentColor === 'blue' ? 'bg-blue-400' :
                  'bg-emerald-400'
                )} />
                <span className={cn('leading-snug',
                  isColoredTone ? 'text-white/85' : 'text-slate-600'
                )} style={{ fontSize: baseFontSize - 0.5, fontWeight: 600 }}>
                  {trimmed}
                </span>
              </div>
            );
          }

          // Bullet items
          const bulletMatch = trimmed.match(/^[•\-—►]\s*(.+)/);
          if (bulletMatch) {
            return (
              <div key={i} className="flex items-start gap-1.5 ml-1">
                <span className={cn('text-[6px] mt-[3px]',
                  accentColor === 'rose' ? 'text-rose-400' :
                  accentColor === 'blue' ? 'text-blue-400' :
                  'text-emerald-400'
                )}>●</span>
                <span className={cn('leading-snug flex-1',
                  isColoredTone ? 'text-white' : 'text-slate-700'
                )} style={{ fontSize: baseFontSize - 0.5, fontWeight: 600 }}>
                  {bulletMatch[1]}
                </span>
              </div>
            );
          }

          // Section headers
          if (trimmed.endsWith(':')) {
            return (
              <div key={i} className="mt-1">
                <span className={cn('uppercase tracking-wider font-[900]',
                  isColoredTone ? 'text-white/90' :
                  accentColor === 'rose' ? 'text-rose-600' :
                  accentColor === 'blue' ? 'text-blue-600' :
                  'text-emerald-600'
                )} style={{ fontSize: 7 }}>
                  {trimmed}
                </span>
              </div>
            );
          }

          // Regular text
          return (
            <p key={i} className={cn('leading-snug',
              isColoredTone ? 'text-white' : 'text-slate-700'
            )} style={{ fontSize: baseFontSize, fontWeight: 600 }}>
              {trimmed}
            </p>
          );
        })}
      </div>
    </ModuleCard>
  );
}
