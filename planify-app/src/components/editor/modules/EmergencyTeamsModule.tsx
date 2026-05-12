import React from 'react';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  EmergencyTeamsModule — Acil Durum Ekipleri
 *  Rol kartları: Söndürme, Kurtarma, Koruma, İlk Yardım
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

const ROLE_ICONS: Record<string, string> = {
  'tahliye': '🚪',
  'söndürme': '🧯',
  'kurtarma': '🛟',
  'ilk yardım': '🩹',
  'koruma': '🛡️',
  'iletişim': '📡',
  'evacuate': '🚪',
  'fire': '🧯',
  'rescue': '🛟',
  'first aid': '🩹',
};

function getRoleIcon(roleName: string): string {
  const lower = roleName.toLowerCase();
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '👤';
}

export function EmergencyTeamsModule({ region, content, compact }: Props) {
  const title = content.title || 'ACİL DURUM EKİBİ';
  const body = content.body || 'Tahliye: __________  |  Söndürme: __________';

  // Parse "Role: Name  |  Role: Name" format
  const entries = body.split(/[|\n]/).map(s => s.trim()).filter(Boolean);
  const parsed = entries.map(entry => {
    const match = entry.match(/^([^:]+):\s*(.*)$/);
    if (match) return { role: match[1].trim(), name: match[2].trim() || '—' };
    return { role: entry, name: '—' };
  });

  return (
    <ModuleCard
      moduleType="EmergencyTeams"
      tone={region.tone || 'neutral'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col p-2 gap-1.5 overflow-hidden">
        <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0">
          {parsed.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 group/team">
              <span className="text-sm shrink-0">{getRoleIcon(item.role)}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[7px] font-black uppercase tracking-wider text-slate-400 truncate">
                  {item.role}
                </div>
                <div className="text-[9px] font-bold text-slate-800 truncate">
                  {item.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModuleCard>
  );
}
