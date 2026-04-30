'use client';

import { AlertTriangle, Archive, ClipboardCheck, FileCheck2, Sparkles } from 'lucide-react';
import type { ProjectExport } from '@/store/useProjectStore';
import type { ProjectAudit } from '@/lib/projects/compliance';
import { formatPortalDate } from '@/lib/projects/compliance';
import { cn } from '@/lib/utils';

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
      helper: 'Aktif tahliye planı',
      icon: Archive,
      color: 'bg-slate-500/5 text-slate-600',
    },
    {
      label: 'Denetime Hazır',
      value: readyCount,
      helper: 'Kontrolü tamamlanan',
      icon: ClipboardCheck,
      color: 'bg-emerald-500/5 text-emerald-600',
    },
    {
      label: 'Eksik Kontrol',
      value: missingCount,
      helper: 'Bekleyen ISO maddesi',
      icon: AlertTriangle,
      color: 'bg-amber-500/5 text-amber-600',
    },
    {
      label: 'Son Çıktı',
      value: latestExport ? formatPortalDate(latestExport) : '-',
      helper: latestExport ? 'Arşiv kayıt tarihi' : 'Henüz kayıt yok',
      icon: FileCheck2,
      color: 'bg-blue-500/5 text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map(({ label, value, helper, icon: Icon, color }) => (
        <div 
          key={label} 
          className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", color)}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-emerald-400 transition-colors" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{helper}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
