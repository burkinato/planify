'use client';

import { FileText, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
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
  const completedAudits = projects.filter(p => p.audit_status === 'exported' || p.audit_status === 'approved').length;

  const metrics = [
    {
      label: 'Toplam Dosya',
      value: totalProjects,
      icon: <FileText className="w-5 h-5 text-primary-500" />,
      color: 'blue',
      description: 'Aktif denetim planları'
    },
    {
      label: 'Ortalama Uyumluluk',
      value: `${avgCompliance}%`,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      color: 'emerald',
      description: 'ISO 23601 skoru'
    },
    {
      label: 'Taslak Aşaması',
      value: activeDrafts,
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      color: 'amber',
      description: 'Düzenleme bekleyenler'
    },
    {
      label: 'Tamamlanan',
      value: completedAudits,
      icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
      color: 'indigo',
      description: 'Dışa aktarılanlar'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div 
          key={metric.label}
          className="bg-surface-900 border border-surface-600 rounded-2xl p-6 shadow-sm hover:border-surface-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl bg-surface-950 border border-surface-600 group-hover:scale-110 transition-transform duration-500`}>
              {metric.icon}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{metric.label}</p>
              <h4 className="text-2xl font-black text-surface-200 mt-1">{metric.value}</h4>
            </div>
          </div>
          <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-4">
            {metric.description}
          </p>
        </div>
      ))}
    </div>
  );
}
