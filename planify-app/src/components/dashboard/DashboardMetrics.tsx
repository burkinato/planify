'use client';

import { FileText, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import type { Project } from '@/store/useProjectStore';

interface DashboardMetricsProps {
  projects: Project[];
}

export function DashboardMetrics({ projects }: DashboardMetricsProps) {
  const totalProjects = projects.length;
  const avgCompliance = totalProjects > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.compliance_score || 0), 0) / totalProjects)
    : 0;
  const activeDrafts = projects.filter(p => p.audit_status === 'draft' || !p.audit_status).length;
  const completedAudits = projects.filter(p => p.audit_status === 'exported').length;

  const metrics = [
    {
      label: 'Toplam Proje',
      value: totalProjects,
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      dotColor: 'bg-blue-500',
      description: 'Sistemde kayıtlı planlar'
    },
    {
      label: 'Ortalama Skor',
      value: `${avgCompliance}%`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      dotColor: 'bg-emerald-500',
      description: 'ISO 23601 uyumluluğu'
    },
    {
      label: 'Bekleyenler',
      value: activeDrafts,
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      dotColor: 'bg-amber-500',
      description: 'Aksiyon gerektirenler'
    },
    {
      label: 'Tamamlanan',
      value: completedAudits,
      icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
      dotColor: 'bg-indigo-500',
      description: 'Çıktısı alınanlar'
    }
  ];

  return (
    <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-surface-600/10 mb-8 px-1">
      {metrics.map((metric) => (
        <div 
          key={metric.label}
          className="flex-1 w-full px-6 py-4 flex flex-col group hover:bg-slate-50/50 dark:hover:bg-surface-900/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 dark:bg-surface-900 rounded-xl border border-slate-200/60 dark:border-surface-600/30 shadow-sm">
                {metric.icon}
              </div>
              <p className="text-[10px] font-black text-slate-500 dark:text-surface-400 uppercase tracking-[0.2em]">{metric.label}</p>
            </div>
            <h4 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-surface-100">{metric.value}</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${metric.dotColor} shadow-sm`} />
            <p className="text-[9px] font-bold text-slate-400 dark:text-surface-500 uppercase tracking-widest">
              {metric.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
