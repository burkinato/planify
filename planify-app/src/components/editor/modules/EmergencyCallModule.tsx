import React from 'react';
import { ModuleCard } from './ModuleCard';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';

/* ────────────────────────────────────────────────────────────────────────
 *  EmergencyCallModule — 112 Acil Çağrı Modülü
 *  Büyük numara hero + ikon destekli bilgi kartları
 * ──────────────────────────────────────────────────────────────────────── */

interface EmergencyCallModuleProps {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function EmergencyCallModule({ region, content, compact }: EmergencyCallModuleProps) {
  const title = content.title || 'ACİL YARDIM NUMARASI';
  const body = content.body || '112 - ACİL ÇAĞRI MERKEZİ\nİtfaiye, Ambulans, Polis';
  const lines = body.split('\n').filter(l => l.trim());

  return (
    <ModuleCard
      moduleType="EmergencyCall"
      tone={region.tone || 'red'}
      title={title}
      compact={compact}
    >
      <div className="h-full flex flex-col p-2.5 gap-2 overflow-hidden">
        {/* ── 112 Hero ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl shadow-lg shadow-red-500/25 shrink-0"
            style={{ width: 'min(56px, 30%)', height: 'min(56px, 30%)', minWidth: 36, minHeight: 36 }}
          >
            <span className="font-black leading-none" style={{ fontSize: 'clamp(14px, 6cqw, 22px)' }}>112</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-black uppercase tracking-tight text-red-700 leading-none truncate"
              style={{ fontSize: 'clamp(9px, 3.5cqw, 13px)' }}
            >
              ACİL ÇAĞRI MERKEZİ
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {['İtfaiye', 'Ambulans', 'Polis'].map((svc) => (
                <span key={svc} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0"
                  style={{ fontSize: 'clamp(6px, 2cqw, 8px)', fontWeight: 800 }}
                >
                  <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  {svc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── İçerik satırları ── */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-1">
          {lines.slice(1).map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            // Section headers ending with ':'
            if (trimmed.endsWith(':')) {
              return (
                <div key={i} className="mt-1">
                  <span className="font-black uppercase tracking-wider text-red-600"
                    style={{ fontSize: 'clamp(6px, 2.2cqw, 8px)' }}
                  >
                    {trimmed}
                  </span>
                </div>
              );
            }

            // Bullet items
            const bulletMatch = trimmed.match(/^[-—•►]\s*(.+)/);
            if (bulletMatch) {
              return (
                <div key={i} className="flex items-start gap-1.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-[5px] shrink-0" />
                  <span className="text-slate-700 leading-snug font-semibold"
                    style={{ fontSize: 'clamp(7px, 2.5cqw, 9px)' }}
                  >
                    {bulletMatch[1]}
                  </span>
                </div>
              );
            }

            // Regular text
            return (
              <p key={i} className="text-slate-700 leading-snug font-semibold"
                style={{ fontSize: 'clamp(7px, 2.5cqw, 9px)' }}
              >
                {trimmed}
              </p>
            );
          })}
        </div>
      </div>
    </ModuleCard>
  );
}
