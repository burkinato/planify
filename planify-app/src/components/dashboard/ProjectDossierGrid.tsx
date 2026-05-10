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
    <section id="projects" className="space-y-6">
      {hasHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
            {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.25em] text-surface-400">{eyebrow}</p>}
            {title && <h2 className="text-2xl font-black text-surface-100 tracking-tight">{title}</h2>}
            {description && <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{description}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {showSearch && (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Proje veya tesis ara..."
                  className="w-full sm:w-[280px] h-11 pl-11 pr-4 bg-surface-950 border border-surface-600/30 rounded-full text-sm font-medium text-surface-200 outline-none focus:border-blue-500/50 focus:shadow-sm transition-all"
                />
              </div>
            )}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="h-11 px-6 bg-surface-900/50 hover:bg-surface-900 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-surface-400 hover:text-surface-300 transition-colors"
              >
                {viewAllLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center relative">
          <div className="w-16 h-16 bg-surface-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-surface-400">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-surface-100 tracking-tight">Kayıtlı Proje Bulunamadı</h3>
          <p className="mt-1 text-xs font-medium text-surface-400 max-w-sm">
            Arama kriterlerinize uygun proje bulunamadı veya henüz bir proje oluşturmadınız.
          </p>
          <div className="mt-6">
            <button 
              onClick={() => window.location.href = '/dashboard?new=1'}
              className="px-6 py-2.5 bg-[#0b5cff] hover:bg-blue-600 text-white rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              İlk Projeni Başlat
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-surface-600/30 relative">
          
          {/* Invisible Backdrop for closing menus */}
          {openMenuId && (
            <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
          )}

          {items.map(({ project, audit }) => (
            <div key={project.id} className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-surface-900/30 transition-colors">
              
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-900 border border-surface-600/30 flex items-center justify-center shrink-0">
                  {project.thumbnail_url ? (
                     <div className="w-full h-full relative rounded-xl overflow-hidden">
                        <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover" unoptimized />
                     </div>
                  ) : (
                    <FileText className="w-5 h-5 text-surface-400" />
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
                        className="w-full h-8 bg-white border border-surface-600/50 rounded-lg px-3 text-sm font-bold text-surface-100 outline-none focus:border-blue-500 shadow-sm"
                      />
                      <button onClick={() => onRenameSubmit(project.id)} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={onRenameCancel} className="w-8 h-8 flex items-center justify-center bg-surface-800 text-surface-400 rounded-lg hover:bg-surface-700 hover:text-surface-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-base font-bold text-surface-100 truncate group-hover:text-blue-500 transition-colors">{project.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-surface-400 mt-0.5">
                        <span>{formatPortalDate(project.updated_at)}</span>
                        <span className="opacity-40">•</span>
                        <span className="truncate">{[project.client_name, project.facility_name].filter(Boolean).join(' · ') || 'Bilinmeyen Kurum'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Status & Actions */}
              <div className="flex items-center justify-end gap-6 sm:ml-auto shrink-0">
                
                {/* Score / Status (Hidden on very small mobile) */}
                <div className="hidden md:flex items-center gap-3">
                  <div className={cn('px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest', toneClasses[audit.statusTone])}>
                    {audit.statusLabel}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-surface-500">{audit.score}% Skor</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-surface-600/30 hidden sm:block" />

                {/* Actions */}
                <div className="flex items-center gap-2 relative z-30">
                  <Link 
                    href={`/editor?id=${project.id}`} 
                    className="h-9 px-4 bg-surface-900 hover:bg-[#0b5cff] text-surface-300 hover:text-white rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 border border-surface-600/30 hover:border-[#0b5cff]"
                  >
                    Aç <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(project.id, e)}
                      className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-lg transition-colors border",
                        openMenuId === project.id 
                          ? "bg-surface-800 border-surface-600 text-surface-100" 
                          : "bg-transparent border-transparent text-surface-400 hover:bg-surface-900 hover:text-surface-200"
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Functional Dropdown */}
                    {openMenuId === project.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-surface-600/30 rounded-xl shadow-lg p-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => {
                            setOpenMenuId(null);
                            onRenameStart(project);
                          }} 
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-surface-100 hover:bg-surface-900 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-surface-400" /> Adı Değiştir
                        </button>
                        <div className="w-full h-px bg-surface-600/20 my-1" />
                        <button 
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(project.id);
                          }} 
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" /> Projeyi Sil
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
