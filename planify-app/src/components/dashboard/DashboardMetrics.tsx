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
    <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-surface-600/30 mb-12">
      {metrics.map((metric) => (
        <div 
          key={metric.label}
          className="flex-1 w-full px-6 py-2 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-900 rounded-lg border border-surface-600/30">
                {metric.icon}
              </div>
              <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{metric.label}</p>
            </div>
            <h4 className="text-3xl font-black tracking-tighter text-surface-100">{metric.value}</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${metric.dotColor}`} />
            <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest">
              {metric.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
