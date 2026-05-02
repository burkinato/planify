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
    <section id="projects" className="space-y-6">
      {hasHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-surface-400">{eyebrow}</p>}
            {title && <h2 className="text-xl font-medium text-surface-200">{title}</h2>}
            {description && <p className="text-[11px] font-medium text-surface-400 uppercase tracking-widest">{description}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Dosya veya tesis ara..."
                  className="w-full sm:w-64 h-12 pl-12 pr-4 bg-surface-900 border border-surface-600 rounded text-xs font-medium text-surface-200 outline-none focus:bg-surface-800 focus:border-primary-500 transition-all"
                />
              </div>
            )}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="h-12 px-6 bg-surface-900 border border-surface-600 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-800 hover:text-surface-200 text-surface-300 transition-all"
              >
                {viewAllLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-20 text-center bg-surface-900 border border-surface-600 rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-surface-800 rounded flex items-center justify-center mx-auto mb-6 text-surface-400">
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-surface-200">Dosya Bulunamadı</p>
          <p className="mt-2 text-xs font-medium text-surface-400 uppercase tracking-widest">Arama filtrenizi değiştirmeyi deneyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {items.map(({ project, audit }) => (
            <article key={project.id} className="group relative bg-surface-950 border border-surface-600 rounded-lg overflow-hidden hover:bg-surface-900 transition-all duration-300">
              <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] min-h-[180px]">
                {/* Thumbnail Area */}
                <div className="relative h-40 sm:h-auto bg-surface-900 border-b sm:border-b-0 sm:border-r border-surface-600 flex items-center justify-center overflow-hidden">
                  {project.thumbnail_url ? (
                    <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  ) : (
                    <div className="w-20 h-28 bg-surface-800 rounded shadow-sm border border-surface-600 p-3 space-y-2">
                      <div className="h-2 bg-surface-600 rounded w-full" />
                      <div className="h-1.5 bg-surface-900 rounded w-2/3" />
                      <div className="border border-dashed border-surface-600 h-14 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-surface-400" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
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
                          className="w-full bg-surface-950 border border-surface-600 rounded px-3 py-2 text-sm font-medium text-surface-200 outline-none focus:border-primary-500"
                        />
                        <button onClick={() => onRenameSubmit(project.id)} className="p-2 bg-primary-500 text-white rounded hover:bg-primary-600">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={onRenameCancel} className="p-2 bg-surface-800 text-surface-400 rounded hover:bg-surface-700 hover:text-surface-200 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 space-y-1">
                          <h3 className="text-base font-medium text-surface-200 truncate group-hover:text-primary-500 transition-colors">{project.title}</h3>
                          <p className="text-[10px] font-medium text-surface-400 uppercase tracking-widest truncate">
                            {[project.client_name, project.facility_name, project.floor_name].filter(Boolean).join(' · ') || 'Bilinmeyen Tesis'}
                          </p>
                        </div>
                        <div className={cn('px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border shrink-0', toneClasses[audit.statusTone])}>
                          {audit.statusLabel}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info Blocks - Minimal Style */}
                  <div className="mt-6 flex items-center gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-surface-500 uppercase tracking-[0.2em]">Skor</p>
                      <p className="text-xs font-medium text-surface-200">{audit.score}%</p>
                    </div>
                    <div className="w-px h-6 bg-surface-600" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-surface-500 uppercase tracking-[0.2em]">Son Düzenleme</p>
                      <p className="text-xs font-medium text-surface-200">{formatPortalDate(project.updated_at)}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-800 rounded group-hover:bg-surface-700 transition-colors">
                      <div className={cn("w-1.5 h-1.5 rounded-full", audit.missing.length ? "bg-amber-500" : "bg-emerald-500")} />
                      <span className="text-[9px] font-medium text-surface-300 uppercase tracking-widest">
                        {audit.missing.length ? `${audit.missing.length} Eksik` : 'Uyumlu'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Link href={`/editor?id=${project.id}`} className="p-2.5 text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 rounded transition-all" title="Düzenle">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link href={`/editor?id=${project.id}`} className="p-2.5 text-surface-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-all" title="Çıktı Al">
                        <Download className="w-4 h-4" />
                      </Link>
                      <button onClick={() => onRenameStart(project)} className="p-2.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded transition-all" title="Ad Değiştir">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(project.id)} className="p-2.5 text-surface-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-all" title="Sil">
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
