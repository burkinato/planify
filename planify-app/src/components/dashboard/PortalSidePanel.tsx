import Link from 'next/link';
import { ArrowRight, BadgeCheck, FileDown, LayoutTemplate, ShieldCheck, Sparkles } from 'lucide-react';
import type { Profile } from '@/store/useAuthStore';
import type { ProjectExport } from '@/store/useProjectStore';
import type { TemplateLayout } from '@/types/editor';
import { formatPortalDate } from '@/lib/projects/compliance';

interface PortalSidePanelProps {
  profile: Profile | null;
  isPro: boolean;
  exports: ProjectExport[];
  templates: TemplateLayout[];
  onNewProject: () => void;
}

export function PortalSidePanel({ profile, isPro, exports, templates, onNewProject }: PortalSidePanelProps) {
  return (
    <aside className="space-y-4">
      <section className="bg-slate-950 text-white border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Portal Profili</p>
          <BadgeCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="mt-4 text-lg font-black">{profile?.company || 'Firma bilgisi bekliyor'}</h3>
        <p className="mt-1 text-xs font-semibold text-slate-400">{profile?.full_name || 'Kullanıcı'} · Tek kullanıcı çalışma alanı</p>
        <div className="mt-5 border border-white/10 bg-white/5 p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mevcut Plan</p>
            <p className="text-sm font-black mt-1 flex items-center gap-2">
              {isPro ? <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" /> : <ShieldCheck className="w-4 h-4 text-blue-300" />}
              {isPro ? 'Planify Pro' : 'Ücretsiz'}
            </p>
          </div>
          {!isPro && (
            <Link href="/dashboard/upgrade" className="px-3 py-2 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest">
              Yükselt
            </Link>
          )}
        </div>
      </section>

      <section id="templates" className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Hızlı Başlangıç</p>
            <h3 className="text-base font-black text-slate-950 mt-1">Resmi şablonlar</h3>
          </div>
          <LayoutTemplate className="w-5 h-5 text-slate-400" />
        </div>
        <div className="divide-y divide-slate-100">
          {templates.slice(0, 3).map((template) => (
            <button
              key={template.id}
              onClick={onNewProject}
              className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{template.name}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1 truncate">{template.category} · {template.page_preset}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ))}
          {templates.length === 0 && (
            <button onClick={onNewProject} className="w-full p-4 text-left hover:bg-slate-50">
              <p className="text-sm font-black text-slate-900">Yeni denetim dosyası oluştur</p>
              <p className="text-[11px] font-bold text-slate-500 mt-1">Şablonlar oluşturma akışında yüklenecek</p>
            </button>
          )}
        </div>
      </section>

      <section id="exports" className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Çıktılar</p>
            <h3 className="text-base font-black text-slate-950 mt-1">Son arşiv kayıtları</h3>
          </div>
          <FileDown className="w-5 h-5 text-slate-400" />
        </div>
        <div className="divide-y divide-slate-100">
          {exports.slice(0, 5).map((item) => (
            <div key={item.id} className="p-4">
              <p className="text-sm font-black text-slate-900 truncate">{item.projects?.title || item.file_name}</p>
              <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                {item.format} · {formatPortalDate(item.created_at)}
              </p>
            </div>
          ))}
          {exports.length === 0 && (
            <div className="p-5 text-sm font-semibold text-slate-500">
              Henüz PDF veya görsel çıktı arşivlenmedi.
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
