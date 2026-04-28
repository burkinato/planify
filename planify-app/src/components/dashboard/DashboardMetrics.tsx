import { AlertTriangle, Archive, ClipboardCheck, FileCheck2 } from 'lucide-react';
import type { ProjectExport } from '@/store/useProjectStore';
import type { ProjectAudit } from '@/lib/projects/compliance';
import { formatPortalDate } from '@/lib/projects/compliance';

interface DashboardMetricsProps {
  projectCount: number;
  audits: ProjectAudit[];
  exports: ProjectExport[];
}

export function DashboardMetrics({ projectCount, audits, exports }: DashboardMetricsProps) {
  const readyCount = audits.filter((audit) => audit.status === 'ready' || audit.status === 'exported').length;
  const missingCount = audits.reduce((count, audit) => count + audit.missing.length, 0);
  const latestExport = exports[0]?.created_at;

  const metrics = [
    {
      label: 'Toplam Dosya',
      value: projectCount,
      helper: 'Aktif tahliye planı projesi',
      icon: Archive,
      tone: 'text-slate-700 bg-slate-100 border-slate-200',
    },
    {
      label: 'Denetime Hazır',
      value: readyCount,
      helper: 'Kontrol listesi tamamlanan dosya',
      icon: ClipboardCheck,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Eksik Kontrol',
      value: missingCount,
      helper: 'Tamamlanması gereken ISO maddesi',
      icon: AlertTriangle,
      tone: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      label: 'Son Çıktı',
      value: formatPortalDate(latestExport),
      helper: latestExport ? 'PDF / görsel arşiv kaydı' : 'Henüz çıktı alınmadı',
      icon: FileCheck2,
      tone: 'text-blue-700 bg-blue-50 border-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map(({ label, value, helper, icon: Icon, tone }) => (
        <div key={label} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950 tracking-tight">{value}</p>
            </div>
            <div className={`w-10 h-10 border flex items-center justify-center ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">{helper}</p>
        </div>
      ))}
    </div>
  );
}
