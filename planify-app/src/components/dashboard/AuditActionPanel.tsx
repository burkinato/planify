'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import type { Project } from '@/store/useProjectStore';
import type { ProjectAudit } from '@/lib/projects/compliance';
import { cn } from '@/lib/utils';

interface AuditActionPanelProps {
  items: Array<{ project: Project; audit: ProjectAudit }>;
}

export function AuditActionPanel({ items }: AuditActionPanelProps) {
  const actionItems = items
    .filter(({ audit }) => audit.status === 'missing' || audit.status === 'draft')
    .slice(0, 4);

  return (
    <section className="bg-surface-950 rounded-lg shadow-sm border border-surface-600 overflow-hidden p-2">
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-surface-200 uppercase tracking-widest">Aksiyon Bekleyenler</h2>
            <p className="text-[10px] font-medium text-surface-500 uppercase tracking-widest mt-0.5">Denetim kontrol listesi</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-surface-800 rounded-full text-[9px] font-bold text-surface-400 uppercase tracking-widest">
          {actionItems.length} Dosya
        </div>
      </div>

      {actionItems.length === 0 ? (
        <div className="mx-2 mb-2 p-8 flex flex-col items-center text-center bg-emerald-500/10 rounded border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
          <p className="text-sm font-medium text-emerald-400">Harika! Her Şey Yolunda</p>
          <p className="text-xs font-medium text-emerald-500/70 mt-1 uppercase tracking-wider">Tüm projeleriniz denetime hazır durumda.</p>
        </div>
      ) : (
        <div className="space-y-1 pb-2 px-2">
          {actionItems.map(({ project, audit }) => (
            <Link
              key={project.id}
              href={`/editor?id=${project.id}`}
              className="group p-4 flex items-center justify-between gap-4 bg-surface-900 hover:bg-surface-800 rounded-lg transition-all border border-transparent hover:border-surface-500 hover:shadow-lg hover:shadow-surface-900"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-surface-800 rounded flex items-center justify-center group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors shrink-0 text-surface-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-200 truncate">{project.title}</p>
                  <p className="text-[10px] font-medium text-surface-500 mt-0.5 uppercase tracking-wide truncate">
                    {audit.missing.length > 0 ? audit.missing.join(' · ') : 'İçerik planlaması bekleniyor'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-surface-200">{audit.score}%</span>
                  <div className="w-12 h-1 bg-surface-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${audit.score}%` }} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-600 group-hover:translate-x-1 group-hover:text-surface-200 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
