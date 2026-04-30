'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, FileDown, LayoutTemplate, ShieldCheck, Sparkles, User, Settings, LogOut } from 'lucide-react';
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
    <aside className="space-y-8">
      {/* Profile Section - Softer & Lighter */}
      <section className="bg-white/60 backdrop-blur-xl border border-white rounded-[40px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center border-4 border-white shadow-xl transition-transform duration-500 group-hover:rotate-6">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            {isPro && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-amber-400/20">
                <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-black text-slate-950 leading-tight">{profile?.company || 'Yeni Firma'}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {profile?.full_name || 'Uzman Kullanıcı'}
            </p>
          </div>

          <div className="w-full pt-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Lisans</span>
                <span className={isPro ? "text-amber-600" : "text-blue-600"}>
                  {isPro ? <Sparkles className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-black text-slate-800">{isPro ? 'Premium Plan' : 'Başlangıç'}</span>
                {!isPro && (
                  <Link href="/dashboard/upgrade" className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
                    Yükselt
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Templates - Modern List */}
      <section className="bg-white/40 backdrop-blur-xl border border-white rounded-[40px] p-2 shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Hızlı Şablonlar</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Resmi Formatlar</p>
          </div>
          <LayoutTemplate className="w-4 h-4 text-slate-300" />
        </div>
        <div className="space-y-1">
          {templates.slice(0, 3).map((template) => (
            <button
              key={template.id}
              onClick={onNewProject}
              className="w-full p-4 text-left hover:bg-white rounded-[24px] flex items-center justify-between gap-4 transition-all group"
            >
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">{template.name}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate uppercase tracking-tight">{template.category}</p>
              </div>
              <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Exports Arhive - Simplified */}
      <section className="bg-white/40 backdrop-blur-xl border border-white rounded-[40px] p-2 shadow-sm">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Son Çıktılar</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PDF Arşivi</p>
          </div>
          <FileDown className="w-4 h-4 text-slate-300" />
        </div>
        <div className="space-y-1">
          {exports.slice(0, 3).map((item) => (
            <div key={item.id} className="p-4 rounded-[24px] hover:bg-white transition-all group cursor-pointer">
              <p className="text-xs font-black text-slate-800 truncate">{item.projects?.title || item.file_name}</p>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                {formatPortalDate(item.created_at)} · {item.format}
              </p>
            </div>
          ))}
          {exports.length === 0 && (
            <div className="p-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Henüz çıktı yok
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
