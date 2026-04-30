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
    <section className="bg-white/40 backdrop-blur-xl rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-white overflow-hidden p-2">
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Aksiyon Bekleyenler</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Denetim kontrol listesi</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
          {actionItems.length} Dosya
        </div>
      </div>

      {actionItems.length === 0 ? (
        <div className="mx-2 mb-2 p-8 flex flex-col items-center text-center bg-emerald-500/5 rounded-[32px] border border-emerald-500/10">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
          <p className="text-sm font-black text-emerald-900">Harika! Her Şey Yolunda</p>
          <p className="text-xs font-bold text-emerald-600/70 mt-1 uppercase tracking-wider">Tüm projeleriniz denetime hazır durumda.</p>
        </div>
      ) : (
        <div className="space-y-1 pb-2 px-2">
          {actionItems.map(({ project, audit }) => (
            <Link
              key={project.id}
              href={`/editor?id=${project.id}`}
              className="group p-4 flex items-center justify-between gap-4 bg-white/60 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{project.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide truncate">
                    {audit.missing.length > 0 ? audit.missing.join(' · ') : 'İçerik planlaması bekleniyor'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-900">{audit.score}%</span>
                  <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${audit.score}%` }} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
