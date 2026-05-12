'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectCreationModal, type ProjectCreationDraft } from '@/components/dashboard/ProjectCreationModal';
import { ProjectDossierGrid } from '@/components/dashboard/ProjectDossierGrid';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
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
      <div className="max-w-[1400px] mx-auto space-y-12 animate-fade-in font-sans pb-12">
        {/* Compact Header */}
        <section className="px-1 pt-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                Sistem / Arşiv
              </p>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-surface-100">
                Proje Arşivi
              </h1>
            </div>

            <button
              onClick={handleStartCreation}
              disabled={isCreating}
              className="h-10 px-8 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Yeni Proje Başlat
            </button>
          </div>
        </section>

        {/* Using Unified DashboardMetrics */}
        {!isLoading && <DashboardMetrics projects={projects} />}

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


