'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Archive, CheckCircle2, FileText, Loader2, TriangleAlert, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectCreationModal, type ProjectCreationDraft } from '@/components/dashboard/ProjectCreationModal';
import { ProjectDossierGrid } from '@/components/dashboard/ProjectDossierGrid';
import { TemplateSelectorModal } from '@/components/editor/TemplateSelectorModal';
import { analyzeProjectCompliance } from '@/lib/projects/compliance';
import { useAuthStore } from '@/store/useAuthStore';
import { type Project, useProjectStore } from '@/store/useProjectStore';
import type { PagePreset, TemplateLayout } from '@/types/editor';

const DEFAULT_DRAFT: ProjectCreationDraft = {
  title: 'Yeni Tahliye Planı',
  clientName: '',
  facilityName: '',
  buildingName: '',
  floorName: 'Zemin Kat',
};

export default function ArchivePage() {
  return (
    <Suspense fallback={<ArchiveLoading />}>
      <ArchivePortal />
    </Suspense>
  );
}

function ArchiveLoading() {
  return (
    <div className="flex justify-center py-24 dash-card">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin relative z-10" />
      </div>
    </div>
  );
}

function ArchivePortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    projects,
    isLoading,
    fetchProjects,
    fetchTemplateLayouts,
    createProject,
    deleteProject,
    updateProject,
  } = useProjectStore();
  const { profile } = useAuthStore();

  const [isCreating, setIsCreating] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [draft, setDraft] = useState<ProjectCreationDraft>(DEFAULT_DRAFT);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const handleStartCreation = useCallback(() => {
    setDraft({
      ...DEFAULT_DRAFT,
      clientName: profile?.company || '',
    });
    setShowIdentityModal(true);
  }, [profile?.company]);

  useEffect(() => {
    void fetchProjects();
    void fetchTemplateLayouts();
  }, [fetchProjects, fetchTemplateLayouts]);

  const auditItems = useMemo(() => {
    return projects.map((project) => ({
      project,
      audit: analyzeProjectCompliance(project),
    }));
  }, [projects]);

  const filteredAuditItems = useMemo(() => {
    const q = searchTerm.trim().toLocaleLowerCase('tr-TR');
    if (!q) return auditItems;

    return auditItems.filter(({ project }) => {
      const text = [
        project.title,
        project.client_name,
        project.facility_name,
        project.building_name,
        project.floor_name,
      ].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR');

      return text.includes(q);
    });
  }, [auditItems, searchTerm]);

  const readyCount = useMemo(
    () => auditItems.filter(({ audit }) => audit.status === 'ready' || audit.status === 'exported').length,
    [auditItems]
  );

  const missingCount = useMemo(
    () => auditItems.reduce((total, item) => total + item.audit.missing.length, 0),
    [auditItems]
  );

  const exportedCount = useMemo(
    () => projects.filter((project) => Boolean(project.last_exported_at)).length,
    [projects]
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set('q', value.trim());
    else params.delete('q');
    router.replace(params.toString() ? `/dashboard/archive?${params.toString()}` : '/dashboard/archive');
  };

  const handleIdentitySubmit = () => {
    if (!draft.title.trim()) {
      toast.error('Proje başlığı zorunludur.');
      return;
    }
    setShowIdentityModal(false);
    setShowTemplateModal(true);
  };

  const handleCreateNew = async (layout: TemplateLayout | null, preset: PagePreset) => {
    setIsCreating(true);
    setShowTemplateModal(false);

    try {
      const newProject = await createProject({
        title: draft.title.trim(),
        client_name: draft.clientName.trim() || null,
        facility_name: draft.facilityName.trim() || null,
        building_name: draft.buildingName.trim() || null,
        floor_name: draft.floorName.trim() || 'Zemin Kat',
        canvas_data: null,
        scale_config: { pixelsPerMeter: 50, unit: 'm' },
        page_preset: preset,
        template_state: {},
        audit_status: 'draft',
        compliance_score: 0,
      });

      if (newProject) {
        router.push(`/editor?id=${newProject.id}${layout ? `&template=${layout.slug}` : ''}`);
      }
    } catch {
      toast.error('Proje oluşturulurken hata meydana geldi.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameStart = (project: Project) => {
    setRenamingId(project.id);
    setRenamingTitle(project.title);
  };

  const handleRename = async (id: string) => {
    if (!renamingTitle.trim()) return;
    try {
      await updateProject(id, { title: renamingTitle.trim() });
      toast.success('Proje adı başarıyla güncellendi');
      setRenamingId(null);
    } catch {
      toast.error('Proje adı değiştirilemedi');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu projeyi kalıcı olarak silmek istediğinize emin misiniz?')) {
      void deleteProject(id);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in font-sans pb-12">
        <section className="dash-header-gradient border border-surface-600/50 rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-surface-900 border border-surface-600 rounded-2xl flex items-center justify-center shadow-xl shrink-0 mt-1">
                <FolderKanban className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 mb-1">
                  Kontrol Paneli / Arşiv
                </p>
                <h1 className="text-3xl font-black tracking-tight text-surface-100">
                  Proje Arşivi
                </h1>
                <p className="mt-2.5 max-w-2xl text-sm font-medium leading-relaxed text-surface-400">
                  Tüm tahliye planlarınızı, denetim durumlarını ve son çıktısını aldığınız belgeleri 
                  buradan yönetebilir, eski projelerinizi kolayca bulabilirsiniz.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartCreation}
              disabled={isCreating}
              className="h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[11px] font-black uppercase tracking-widest hover:from-primary-600 hover:to-primary-700 rounded-xl disabled:opacity-50 xl:self-start transition-all duration-300 shadow-lg shadow-primary-500/20 active:scale-[0.98]"
            >
              Yeni Proje Başlat
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 dash-stagger">
          <ArchiveMetric icon={<Archive className="w-5 h-5" />} label="Toplam Kayıt" value={projects.length.toString()} />
          <ArchiveMetric icon={<CheckCircle2 className="w-5 h-5" />} label="Denetime Hazır" value={readyCount.toString()} tone="success" />
          <ArchiveMetric icon={<TriangleAlert className="w-5 h-5" />} label="Eksik Bilgi" value={missingCount.toString()} tone="warning" />
          <ArchiveMetric icon={<FileText className="w-5 h-5" />} label="Dışa Aktarılan" value={exportedCount.toString()} tone="blue" />
        </div>

        {isLoading ? (
          <ArchiveLoading />
        ) : (
          <ProjectDossierGrid
            items={filteredAuditItems}
            searchTerm={searchTerm}
            eyebrow="Tüm Kayıtlar"
            title="Sistemdeki Projeler"
            description={`${filteredAuditItems.length} proje listeleniyor`}
            isCreating={isCreating}
            renamingId={renamingId}
            renamingTitle={renamingTitle}
            onSearchChange={handleSearchChange}
            onCreate={handleStartCreation}
            onRenameStart={handleRenameStart}
            onRenameTitleChange={setRenamingTitle}
            onRenameCancel={() => setRenamingId(null)}
            onRenameSubmit={handleRename}
            onDelete={handleDelete}
          />
        )}
      </div>

      {showIdentityModal && (
        <ProjectCreationModal
          draft={draft}
          onChange={setDraft}
          onCancel={() => setShowIdentityModal(false)}
          onSubmit={handleIdentitySubmit}
        />
      )}

      {showTemplateModal && (
        <TemplateSelectorModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleCreateNew}
        />
      )}
    </>
  );
}

function ArchiveMetric({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'blue';
}) {
  const toneMap = {
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', shadow: 'shadow-amber-500/10' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', shadow: 'shadow-blue-500/10' },
    default: { bg: 'bg-surface-800', text: 'text-surface-300', border: 'border-surface-600', shadow: 'shadow-none' },
  };

  const currentTone = toneMap[tone];

  return (
    <div className="dash-card p-6 group hover:shadow-xl transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${currentTone.bg} ${currentTone.text} ${currentTone.border} shadow-lg ${currentTone.shadow} group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="mt-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">{label}</p>
        <p className="mt-1 text-3xl font-black text-surface-100 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
