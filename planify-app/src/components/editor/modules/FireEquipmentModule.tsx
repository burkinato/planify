import React from 'react';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  FireEquipmentModule — Yangın Ekipmanı Envanteri
 *  Ekipman sayaç kartları: tüp, dolap, alarm, hidrant
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

const EQUIPMENT_ICONS: Record<string, string> = {
  'tüp': '🧯',
  'dolap': '🚿',
  'alarm': '🔔',
  'hidrant': '🔴',
  'hortum': '🚿',
  'söndürücü': '🧯',
  'battaniye': '🟫',
  'sprinkler': '💦',
  'extinguisher': '🧯',
  'cabinet': '🚿',
  'button': '🔔',
  'hydrant': '🔴',
};

function getEquipmentIcon(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, icon] of Object.entries(EQUIPMENT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '📋';
}

export function FireEquipmentModule({ region, content, compact }: Props) {
  const title = content.title || 'YANGIN EKİPMANI';
  const body = content.body || '';
  const lines = body.split('\n').filter(l => l.trim());

  return (
    <ModuleCard
      moduleType="FireEquipmentInventory"
      tone={region.tone || 'red'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col p-2 gap-1.5 overflow-hidden">
        <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0 content-start">
          {lines.map((line, i) => {
            const trimmed = line.trim();
            const parts = trimmed.split(/:(.*)/);

            if (parts.length >= 2) {
              const name = parts[0].trim();
              const value = parts[1].trim();
              return (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-50/80 border border-red-100/50">
                  <span className="text-sm shrink-0">{getEquipmentIcon(name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[7px] font-black uppercase tracking-wider text-red-500 truncate">
                      {name}
                    </div>
                    <div className="text-[10px] font-black text-slate-800">
                      {value || '—'}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className="col-span-2 text-[8px] font-semibold text-slate-600">
                {trimmed}
              </div>
            );
          })}
        </div>
      </div>
    </ModuleCard>
  );
}
