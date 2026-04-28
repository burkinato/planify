import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { Project } from '@/store/useProjectStore';
import type { ProjectAudit } from '@/lib/projects/compliance';

interface AuditActionPanelProps {
  items: Array<{ project: Project; audit: ProjectAudit }>;
}

export function AuditActionPanel({ items }: AuditActionPanelProps) {
  const actionItems = items
    .filter(({ audit }) => audit.status === 'missing' || audit.status === 'draft')
    .slice(0, 4);

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Aksiyon Gerekiyor</p>
          <h2 className="text-lg font-black text-slate-950 mt-1">Denetim kontrol listesi</h2>
        </div>
        <ShieldCheck className="w-5 h-5 text-slate-400" />
      </div>

      {actionItems.length === 0 ? (
        <div className="p-6 flex items-start gap-4 bg-emerald-50/50">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-emerald-900">Açık denetim uyarısı yok</p>
            <p className="text-xs font-semibold text-emerald-700 mt-1">Projelerinizin mevcut kontrol maddeleri tamamlanmış görünüyor.</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {actionItems.map(({ project, audit }) => (
            <Link
              key={project.id}
              href={`/editor?id=${project.id}`}
              className="group p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{project.title}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1">
                    {audit.missing.length > 0 ? audit.missing.join(', ') : 'Plan içeriği henüz başlamadı'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                {audit.score}%
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
