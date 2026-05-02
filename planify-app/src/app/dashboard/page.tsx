'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <div className="min-h-screen bg-surface-950 transition-colors">
        <DashboardPortal />
      </div>
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-48 space-y-4">
      <div className="w-16 h-16 bg-surface-900 rounded-lg shadow-xl flex items-center justify-center border border-surface-600">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">Portal Yükleniyor</p>
    </div>
  );
}

function DashboardPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    projects,
    isLoading,
    fetchProjects,
    fetchProjectExports,
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
    void fetchProjectExports();
    void fetchTemplateLayouts();
  }, [fetchProjects, fetchProjectExports, fetchTemplateLayouts]);

  useEffect(() => {
    const shouldOpenNewProject = searchParams.get('new') === '1';
    if (shouldOpenNewProject) {
      queueMicrotask(() => handleStartCreation());
      router.replace('/dashboard');
    }
  }, [searchParams, router, handleStartCreation]);

  const filteredAuditItems = useMemo(() => {
    const q = searchTerm.trim().toLocaleLowerCase('tr-TR');
    const items = projects.map(p => ({ project: p, audit: analyzeProjectCompliance(p) }));
    if (!q) return items;

    return items.filter(({ project }) => {
      const text = [
        project.title,
        project.client_name,
        project.facility_name,
        project.building_name,
        project.floor_name,
      ].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR');

      return text.includes(q);
    });
  }, [projects, searchTerm]);

  const recentAuditItems = useMemo(() => filteredAuditItems.slice(0, 10), [filteredAuditItems]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set('q', value.trim());
    else params.delete('q');
    router.replace(params.toString() ? `/dashboard?${params.toString()}` : '/dashboard');
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
      toast.error('Proje oluşturulamadı');
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
      toast.success('Proje adı güncellendi');
      setRenamingId(null);
    } catch {
      toast.error('Ad değiştirilemedi');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu denetim dosyasını silmek istediğinize emin misiniz?')) {
      void deleteProject(id);
    }
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 space-y-12 animate-in fade-in duration-1000">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-surface-200 tracking-tight">Denetim Merkezi</h1>
            <p className="mt-2 text-xs font-bold text-surface-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              {profile?.company || 'Planify'} İçin Aktif Denetim Dosyaları
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        {!isLoading && <DashboardMetrics projects={projects} />}

        {isLoading ? (
          <DashboardLoading />
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <ProjectDossierGrid
              items={recentAuditItems}
              searchTerm={searchTerm}
              showSearch={false}
              viewAllHref="/dashboard/archive"
              viewAllLabel="Tüm Arşivi Görüntüle"
              isCreating={isCreating}
              renamingId={renamingId}
              renamingTitle={renamingTitle}
              onSearchChange={handleSearchChange}
              onRenameStart={handleRenameStart}
              onRenameTitleChange={setRenamingTitle}
              onRenameCancel={() => setRenamingId(null)}
              onRenameSubmit={handleRename}
              onDelete={handleDelete}
            />
          </div>
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
