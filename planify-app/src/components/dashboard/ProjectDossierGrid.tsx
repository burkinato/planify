import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock, Download, Edit3, ExternalLink, FileText, Plus, Search, Trash2, X } from 'lucide-react';
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
  onCreate: () => void;
  onRenameStart: (project: Project) => void;
  onRenameTitleChange: (value: string) => void;
  onRenameCancel: () => void;
  onRenameSubmit: (id: string) => void;
  onDelete: (id: string) => void;
}

const toneClasses: Record<ProjectAudit['statusTone'], string> = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function ProjectDossierGrid({
  items,
  searchTerm,
  eyebrow = 'Proje Dosyaları',
  title = 'Tahliye planı arşivi',
  description,
  showSearch = true,
  viewAllHref,
  viewAllLabel = 'Tüm arşivi aç',
  isCreating,
  renamingId,
  renamingTitle,
  onSearchChange,
  onCreate,
  onRenameStart,
  onRenameTitleChange,
  onRenameCancel,
  onRenameSubmit,
  onDelete,
}: ProjectDossierGridProps) {
  return (
    <section id="projects" className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          <h2 className="text-lg font-black text-slate-950 mt-1">{title}</h2>
          {description && <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {showSearch && (
            <label className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Proje, tesis veya kat ara"
                className="w-full sm:w-72 h-10 pl-10 pr-3 border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
              />
            </label>
          )}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="h-10 px-4 border border-slate-300 bg-white text-slate-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              {viewAllLabel}
            </Link>
          )}
          <button
            onClick={onCreate}
            disabled={isCreating}
            className="h-10 px-4 bg-slate-950 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Yeni Dosya
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <p className="mt-4 text-sm font-black text-slate-900">Kayıt bulunamadı</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Arama filtresini temizleyin veya yeni bir denetim dosyası oluşturun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-5">
          {items.map(({ project, audit }) => (
            <article key={project.id} className="group border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-slate-300 hover:shadow-lg transition-all">
              <div className="grid grid-cols-[132px_1fr] min-h-44">
                <div className="relative bg-slate-100 border-r border-slate-200 flex items-center justify-center overflow-hidden">
                  {project.thumbnail_url ? (
                    <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-20 h-28 bg-white border border-slate-300 shadow-sm p-3">
                      <div className="h-2 bg-slate-300 mb-2" />
                      <div className="h-1.5 bg-slate-200 mb-1.5" />
                      <div className="h-1.5 bg-slate-200 mb-4 w-2/3" />
                      <div className="border border-dashed border-slate-300 h-12 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-300" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    {renamingId === project.id ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          autoFocus
                          aria-label="Proje adını yeniden adlandır"
                          value={renamingTitle}
                          onChange={(event) => onRenameTitleChange(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') onRenameSubmit(project.id);
                            if (event.key === 'Escape') onRenameCancel();
                          }}
                          className="w-full border border-slate-300 px-2 py-1 text-sm font-bold text-slate-900 outline-none"
                        />
                        <button onClick={() => onRenameSubmit(project.id)} className="p-1 text-emerald-700 hover:bg-emerald-50">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={onRenameCancel} className="p-1 text-slate-500 hover:bg-slate-50">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <h3 className="text-base font-black text-slate-950 truncate">{project.title}</h3>
                          <p className="text-xs font-semibold text-slate-500 mt-1 truncate">
                            {[project.client_name, project.facility_name, project.floor_name].filter(Boolean).join(' / ') || 'Firma ve tesis bilgisi bekliyor'}
                          </p>
                        </div>
                        <span className={cn('border px-2 py-1 text-[10px] font-black uppercase tracking-widest shrink-0', toneClasses[audit.statusTone])}>
                          {audit.statusLabel}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <InfoBlock label="Skor" value={`${audit.score}%`} />
                    <InfoBlock label="Güncelleme" value={formatPortalDate(project.updated_at)} />
                    <InfoBlock label="Son Çıktı" value={formatPortalDate(project.last_exported_at)} />
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {audit.missing.length ? `${audit.missing.length} eksik madde` : 'Kontrol listesi tamam'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/editor?id=${project.id}`} className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50" title="Düzenle">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link href={`/editor?id=${project.id}`} className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50" title="Çıktı al">
                        <Download className="w-4 h-4" />
                      </Link>
                      <button onClick={() => onRenameStart(project)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100" title="Yeniden adlandır">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(project.id)} className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50" title="Sil">
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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 p-2 min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-[11px] font-bold text-slate-800 mt-1 truncate">{value}</p>
    </div>
  );
}
