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
  slate: 'bg-slate-100 text-slate-600 border-slate-200/50',
  amber: 'bg-amber-50 text-amber-600 border-amber-200/50',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
  blue: 'bg-blue-50 text-blue-600 border-blue-200/50',
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
    <section id="projects" className="space-y-6">
      {hasHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{eyebrow}</p>}
            {title && <h2 className="text-xl font-black text-slate-900">{title}</h2>}
            {description && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Dosya veya tesis ara..."
                  className="w-full sm:w-64 h-12 pl-12 pr-4 bg-white/60 backdrop-blur-xl border border-white rounded-2xl text-xs font-black text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
              </div>
            )}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="h-12 px-6 bg-white/60 backdrop-blur-xl border border-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:shadow-lg transition-all"
              >
                {viewAllLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-20 text-center bg-white/40 backdrop-blur-xl border border-white rounded-[40px] shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-sm font-black text-slate-900">Dosya Bulunamadı</p>
          <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Arama filtrenizi değiştirmeyi deneyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {items.map(({ project, audit }) => (
            <article key={project.id} className="group relative bg-white/60 backdrop-blur-xl border border-white rounded-[32px] overflow-hidden hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
              <div className="grid grid-cols-[140px_1fr] min-h-[180px]">
                {/* Thumbnail Area */}
                <div className="relative bg-slate-50 border-r border-white flex items-center justify-center overflow-hidden">
                  {project.thumbnail_url ? (
                    <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                  ) : (
                    <div className="w-20 h-28 bg-white/80 rounded-lg shadow-sm border border-slate-100 p-3 space-y-2 group-hover:rotate-3 transition-transform duration-500">
                      <div className="h-2 bg-slate-100 rounded w-full" />
                      <div className="h-1.5 bg-slate-50 rounded w-2/3" />
                      <div className="border border-dashed border-slate-200 h-14 rounded-md flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-200" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col min-w-0">
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
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none ring-4 ring-slate-900/5"
                        />
                        <button onClick={() => onRenameSubmit(project.id)} className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={onRenameCancel} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-white hover:shadow-md transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 space-y-1">
                          <h3 className="text-base font-black text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{project.title}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                            {[project.client_name, project.facility_name, project.floor_name].filter(Boolean).join(' · ') || 'Bilinmeyen Tesis'}
                          </p>
                        </div>
                        <div className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0', toneClasses[audit.statusTone])}>
                          {audit.statusLabel}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info Blocks - Minimal Style */}
                  <div className="mt-6 flex items-center gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Skor</p>
                      <p className="text-xs font-black text-slate-900">{audit.score}%</p>
                    </div>
                    <div className="w-px h-6 bg-slate-100" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Son Düzenleme</p>
                      <p className="text-xs font-black text-slate-900">{formatPortalDate(project.updated_at)}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                      <div className={cn("w-1.5 h-1.5 rounded-full", audit.missing.length ? "bg-amber-500" : "bg-emerald-500")} />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {audit.missing.length ? `${audit.missing.length} Eksik` : 'Uyumlu'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <Link href={`/editor?id=${project.id}`} className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Düzenle">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link href={`/editor?id=${project.id}`} className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Çıktı Al">
                        <Download className="w-4 h-4" />
                      </Link>
                      <button onClick={() => onRenameStart(project)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Ad Değiştir">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(project.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
