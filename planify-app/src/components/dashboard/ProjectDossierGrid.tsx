'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock, Download, Edit3, ExternalLink, FileText, Search, Trash2, X, MoreVertical } from 'lucide-react';
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
  slate: 'bg-surface-800 text-surface-300 border-surface-600',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function ProjectDossierGrid({
  items,
  searchTerm,
  eyebrow,
  title,
  description,
  showSearch = true,
  viewAllHref,
  viewAllLabel = 'Tüm Arşivi Görüntüle',
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

  return (
    <section id="projects" className="space-y-8">
      {hasHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500">{eyebrow}</p>}
            {title && <h2 className="text-2xl font-black text-surface-200 tracking-tight">{title}</h2>}
            {description && <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{description}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Dosya veya tesis ara..."
                  className="w-full sm:w-64 h-12 pl-12 pr-4 bg-surface-900 border border-surface-600 rounded-xl text-xs font-medium text-surface-200 outline-none focus:bg-surface-800 focus:border-primary-500 transition-all shadow-sm"
                />
              </div>
            )}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="h-12 px-6 bg-surface-900 border border-surface-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-800 hover:text-surface-200 text-surface-300 transition-all shadow-sm"
              >
                {viewAllLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-24 text-center bg-surface-900/50 border border-surface-600 border-dashed rounded-3xl">
          <div className="w-20 h-20 bg-surface-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-surface-500 border border-surface-600 shadow-xl">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-black text-surface-200 tracking-tight">Kayıtlı Plan Bulunamadı</h3>
          <p className="mt-2 text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em]">Arama filtrenizi değiştirmeyi veya yeni bir proje oluşturmayı deneyin.</p>
          <div className="mt-8">
            <button 
              onClick={() => window.location.href = '/dashboard?new=1'}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20"
            >
              İlk Projeni Başlat
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {items.map(({ project, audit }) => (
            <article key={project.id} className="group relative bg-surface-900 border border-surface-600 rounded-3xl overflow-hidden hover:border-surface-500 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/5">
              <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] min-h-[220px]">
                {/* Thumbnail Area */}
                <div className="relative h-48 sm:h-auto bg-surface-950 border-b sm:border-b-0 sm:border-r border-surface-600 flex items-center justify-center overflow-hidden">
                  {project.thumbnail_url ? (
                    <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                  ) : (
                    <div className="relative w-24 h-32 bg-surface-900 rounded-lg shadow-2xl border border-surface-600 p-4 flex flex-col justify-between group-hover:-rotate-3 transition-transform duration-500">
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-surface-600 rounded-full w-full" />
                        <div className="h-1.5 bg-surface-600 rounded-full w-2/3 opacity-50" />
                      </div>
                      <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-full border border-dashed border-surface-600 flex items-center justify-center text-surface-500">
                          <FileText className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="h-1.5 bg-primary-500/20 rounded-full w-full" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950/40 to-transparent" />
                  
                  {/* Score Indicator Ring */}
                  <div className="absolute top-4 left-4">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" className="stroke-surface-800 fill-none" strokeWidth="4" />
                        <circle 
                          cx="24" cy="24" r="20" 
                          className={cn("fill-none transition-all duration-1000", 
                            audit.score > 80 ? "stroke-emerald-500" : audit.score > 50 ? "stroke-amber-500" : "stroke-red-500"
                          )} 
                          strokeWidth="4" 
                          strokeDasharray={126}
                          strokeDashoffset={126 - (126 * audit.score) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black text-surface-200">{audit.score}%</span>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    {renamingId === project.id ? (
                      <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-300">
                        <input
                          autoFocus
                          value={renamingTitle}
                          onChange={(event) => onRenameTitleChange(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') onRenameSubmit(project.id);
                            if (event.key === 'Escape') onRenameCancel();
                          }}
                          className="w-full bg-surface-950 border border-surface-600 rounded-xl px-4 py-3 text-sm font-medium text-surface-200 outline-none focus:border-primary-500"
                        />
                        <button onClick={() => onRenameSubmit(project.id)} className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={onRenameCancel} className="p-3 bg-surface-800 text-surface-400 rounded-xl hover:bg-surface-700 hover:text-surface-200 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 space-y-1.5">
                          <h3 className="text-lg font-black text-surface-200 truncate group-hover:text-primary-500 transition-colors tracking-tight">{project.title}</h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-surface-500 uppercase tracking-widest truncate">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatPortalDate(project.updated_at)}</span>
                            <span>·</span>
                            <span className="truncate">{[project.client_name, project.facility_name].filter(Boolean).join(' · ') || 'Bilinmeyen Tesis'}</span>
                          </div>
                        </div>
                        <div className={cn('px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0 shadow-sm', toneClasses[audit.statusTone])}>
                          {audit.statusLabel}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="mt-8 pt-8 border-t border-surface-600 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-surface-500 uppercase tracking-widest">Durum</span>
                        <div className="flex items-center gap-2 mt-1">
                           <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", audit.missing.length ? "bg-amber-500 shadow-amber-500/40" : "bg-emerald-500 shadow-emerald-500/40")} />
                           <span className="text-[10px] font-black text-surface-300 uppercase tracking-widest">
                             {audit.missing.length ? `${audit.missing.length} Eksik` : 'Uyumlu'}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/editor?id=${project.id}`} 
                        className="px-5 py-2.5 bg-surface-800 hover:bg-primary-500 text-surface-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Düzenle
                      </Link>
                      
                      <div className="relative group/menu">
                        <button className="p-2.5 bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-surface-200 rounded-xl transition-all border border-transparent hover:border-surface-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Hover Dropdown */}
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface-900 border border-surface-600 rounded-2xl shadow-2xl p-2 opacity-0 translate-y-2 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-300 z-30">
                          <button onClick={() => onRenameStart(project)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-xl transition-all">
                            <Edit3 className="w-4 h-4" /> Ad Değiştir
                          </button>
                          <button onClick={() => onDelete(project.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" /> Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
