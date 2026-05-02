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
      color: 'bg-surface-800 text-surface-400',
    },
    {
      label: 'Denetime Hazır',
      value: readyCount,
      helper: 'Kontrolü tamamlanan',
      icon: ClipboardCheck,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Eksik Kontrol',
      value: missingCount,
      helper: 'Bekleyen ISO maddesi',
      icon: AlertTriangle,
      color: 'bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Son Çıktı',
      value: latestExport ? formatPortalDate(latestExport) : '-',
      helper: latestExport ? 'Arşiv kayıt tarihi' : 'Henüz kayıt yok',
      icon: FileCheck2,
      color: 'bg-blue-500/10 text-blue-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map(({ label, value, helper, icon: Icon, color }) => (
        <div 
          key={label} 
          className="relative overflow-hidden bg-surface-950 rounded-lg p-6 border border-surface-600 group hover:bg-surface-900 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">{label}</p>
              <p className="text-2xl font-medium text-surface-200 tracking-tight">{value}</p>
            </div>
            <div className={cn("w-12 h-12 rounded flex items-center justify-center transition-transform duration-300 group-hover:scale-110", color)}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-surface-600 group-hover:bg-primary-500 transition-colors" />
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{helper}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
