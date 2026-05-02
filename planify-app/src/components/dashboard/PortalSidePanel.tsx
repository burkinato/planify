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
      <section className="bg-surface-950 border border-surface-600 rounded-lg p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-20 h-20 bg-surface-900 rounded-lg flex items-center justify-center border-4 border-surface-600 shadow-xl transition-transform duration-500 group-hover:rotate-6">
              <User className="w-10 h-10 text-surface-500" />
            </div>
            {isPro && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500 rounded flex items-center justify-center border-4 border-surface-600 shadow-lg shadow-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-surface-200 fill-surface-200" />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-surface-200 leading-tight">{profile?.company || 'Yeni Firma'}</h3>
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-1">
              {profile?.full_name || 'Uzman Kullanıcı'}
            </p>
          </div>

          <div className="w-full pt-4">
            <div className="bg-surface-900 rounded p-4 border border-surface-600">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-surface-500 uppercase tracking-[0.2em]">Lisans</span>
                <span className={isPro ? "text-amber-500" : "text-blue-500"}>
                  {isPro ? <Sparkles className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-surface-200">{isPro ? 'Premium Plan' : 'Başlangıç'}</span>
                {!isPro && (
                  <Link href="/dashboard/upgrade" className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest hover:underline">
                    Yükselt
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Templates - Modern List */}
      <section className="bg-surface-950 border border-surface-600 rounded-lg p-2 shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-surface-200 uppercase tracking-widest">Hızlı Şablonlar</h3>
            <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest mt-0.5">Resmi Formatlar</p>
          </div>
          <LayoutTemplate className="w-4 h-4 text-surface-500" />
        </div>
        <div className="space-y-1">
          {templates.slice(0, 3).map((template) => (
            <button
              key={template.id}
              onClick={onNewProject}
              className="w-full p-4 text-left hover:bg-surface-900 rounded flex items-center justify-between gap-4 transition-all group"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-surface-200 truncate">{template.name}</p>
                <p className="text-[9px] font-bold text-surface-500 mt-0.5 truncate uppercase tracking-tight">{template.category}</p>
              </div>
              <div className="w-8 h-8 bg-surface-800 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Exports Arhive - Simplified */}
      <section className="bg-surface-950 border border-surface-600 rounded-lg p-2 shadow-sm">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-surface-200 uppercase tracking-widest">Son Çıktılar</h3>
            <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest mt-0.5">PDF Arşivi</p>
          </div>
          <FileDown className="w-4 h-4 text-surface-500" />
        </div>
        <div className="space-y-1">
          {exports.slice(0, 3).map((item) => (
            <div key={item.id} className="p-4 rounded hover:bg-surface-900 transition-all group cursor-pointer">
              <p className="text-xs font-medium text-surface-200 truncate">{item.projects?.title || item.file_name}</p>
              <p className="text-[9px] font-bold text-surface-500 mt-1 uppercase tracking-widest">
                {formatPortalDate(item.created_at)} · {item.format}
              </p>
            </div>
          ))}
          {exports.length === 0 && (
            <div className="p-8 text-center text-[10px] font-bold text-surface-500 uppercase tracking-widest">
              Henüz çıktı yok
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
