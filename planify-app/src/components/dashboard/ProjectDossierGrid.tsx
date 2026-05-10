'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock, Edit3, FileText, Search, Trash2, X, MoreVertical, Building2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/store/useProjectStore';
import type { ProjectAudit } from '@/lib/projects/compliance';
import { formatPortalDate } from '@/lib/projects/compliance';

interface ProjectDossierGridProps {
  items: Array<{ project: Project; audit: ProjectAudit }>;
  searchTerm: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  showSearch?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  isCreating: boolean;
  renamingId: string | null;
  renamingTitle: string;
  onSearchChange: (value: string) => void;
  onRenameStart: (project: Project) => void;
  onRenameTitleChange: (value: string) => void;
  onRenameCancel: () => void;
  onRenameSubmit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate?: () => void;
}

const toneClasses: Record<ProjectAudit['statusTone'], string> = {
  slate: 'bg-surface-800 text-surface-400',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
};

export function ProjectDossierGrid({
  items,
  searchTerm,
  eyebrow,
  title,
  description,
  showSearch = true,
  viewAllHref,
  viewAllLabel = 'Tüm Projeleri Görüntüle',
  isCreating,
  renamingId,
  renamingTitle,
  onSearchChange,
  onRenameStart,
  onRenameTitleChange,
  onRenameCancel,
  onRenameSubmit,
  onDelete,
}: ProjectDossierGridProps) {
  const hasHeader = title || eyebrow || showSearch || viewAllHref;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <section id="projects" className="space-y-8">
      {hasHeader && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-1">
          <div className="space-y-2">
            {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-1">{eyebrow}</p>}
            {title && <h2 className="text-3xl font-black text-slate-900 dark:text-surface-100 tracking-tighter">{title}</h2>}
            {description && <p className="text-[11px] font-bold text-slate-500 dark:text-surface-400 uppercase tracking-widest">{description}</p>}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {showSearch && (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Proje veya tesis ara..."
                  className="w-full sm:w-[320px] h-12 pl-12 pr-4 bg-white dark:bg-surface-950 border border-slate-200 dark:border-surface-600/30 rounded-2xl text-sm font-medium text-surface-900 dark:text-surface-200 outline-none focus:border-blue-600/50 shadow-sm transition-all"
                />
              </div>
            )}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="h-10 px-6 bg-slate-50 dark:bg-surface-900 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-surface-500 dark:text-surface-400 transition-colors border border-slate-200/60 dark:border-surface-600/30 shadow-sm"
              >
                {viewAllLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Empty State - Modern & Clean */}
      {items.length === 0 ? (
        <div className="py-32 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-slate-50 dark:bg-surface-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-surface-600 border border-slate-100 dark:border-surface-600/30 shadow-sm relative">
            <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full" />
            <Building2 className="w-10 h-10 relative z-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-surface-100 tracking-tight">Kayıtlı Proje Bulunmuyor</h3>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-surface-400 max-w-sm leading-relaxed">
            Henüz bir tahliye planı oluşturmadınız veya arama kriterlerinize uygun bir kayıt bulunamadı.
          </p>
          <div className="mt-8">
            <button 
              onClick={() => window.location.href = '/dashboard?new=1'}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Yeni Bir Plan Başlat
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col relative divide-y divide-surface-600/10">
          
          {/* Invisible Backdrop for closing menus */}
          {openMenuId && (
            <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
          )}

          {items.map(({ project, audit }) => (
            <div key={project.id} className="group p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:bg-slate-50/50 dark:hover:bg-surface-900/20 transition-colors">
              
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-surface-900 border border-slate-200/60 dark:border-surface-600/30 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {project.thumbnail_url ? (
                     <div className="w-full h-full relative">
                        <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover" unoptimized />
                     </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-surface-900 dark:to-surface-800">
                      <FileText className="w-6 h-6 text-slate-300 dark:text-surface-600" strokeWidth={1.5} />
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {renamingId === project.id ? (
                    <div className="flex items-center gap-2 max-w-sm z-30 relative">
                      <input
                        autoFocus
                        value={renamingTitle}
                        onChange={(event) => onRenameTitleChange(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') onRenameSubmit(project.id);
                          if (event.key === 'Escape') onRenameCancel();
                        }}
                        className="w-full h-10 bg-white dark:bg-surface-950 border border-slate-200 dark:border-surface-600/50 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm"
                      />
                      <button onClick={() => onRenameSubmit(project.id)} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm shrink-0">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-surface-100 truncate group-hover:text-blue-600 transition-colors tracking-tight">{project.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-surface-400 mt-1">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatPortalDate(project.updated_at)}</span>
                        <span className="opacity-40">•</span>
                        <span className="truncate flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {[project.client_name, project.facility_name].filter(Boolean).join(' · ') || 'Bilinmeyen Kurum'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Status & Actions */}
              <div className="flex items-center justify-end gap-6 sm:ml-auto shrink-0">
                
                <div className="hidden lg:flex items-center gap-6">
                  <div className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm', 
                    audit.statusTone === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    audit.statusTone === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    audit.statusTone === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-slate-50 text-slate-500 border-slate-100'
                  )}>
                    {audit.statusLabel}
                  </div>
                  <div className="flex flex-col items-end min-w-[70px]">
                    <span className="text-[11px] font-black text-surface-900 dark:text-surface-100 tracking-tighter leading-none">{audit.score}% Skor</span>
                    <div className="w-16 h-1 bg-slate-100 dark:bg-surface-800 rounded-full mt-2 overflow-hidden shadow-inner">
                      <div className={cn('h-full transition-all duration-1000', 
                        audit.score > 80 ? 'bg-emerald-500' : audit.score > 50 ? 'bg-amber-500' : 'bg-slate-300')} 
                        style={{ width: `${audit.score}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="w-px h-8 bg-surface-600/10 hidden sm:block" />

                {/* Actions */}
                <div className="flex items-center gap-2 relative z-30">
                  <Link 
                    href={`/editor?id=${project.id}`} 
                    className="h-10 px-5 bg-white dark:bg-surface-900 hover:bg-blue-600 text-slate-700 dark:text-surface-200 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-200 dark:border-surface-600/30 hover:border-blue-600 shadow-sm"
                  >
                    Düzenle <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(project.id, e)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl transition-all border shadow-sm",
                        openMenuId === project.id 
                          ? "bg-slate-100 border-slate-200 text-slate-900" 
                          : "bg-white dark:bg-transparent border-slate-200 dark:border-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-900 hover:text-slate-900"
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Functional Dropdown */}
                    {openMenuId === project.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-950 border border-slate-200 dark:border-surface-600/30 rounded-2xl shadow-xl p-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => {
                            setOpenMenuId(null);
                            onRenameStart(project);
                          }} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-surface-100 hover:bg-slate-50 dark:hover:bg-surface-900 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-slate-400" /> Adı Değiştir
                        </button>
                        <div className="w-full h-px bg-slate-100 dark:bg-surface-600/20 my-2" />
                        <button 
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(project.id);
                          }} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" /> Projeyi Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
