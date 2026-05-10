'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectCreationModal, type ProjectCreationDraft } from '@/components/dashboard/ProjectCreationModal';
import { ProjectDossierGrid } from '@/components/dashboard/ProjectDossierGrid';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { TemplateSelectorModal } from '@/components/editor/TemplateSelectorModal';
import { analyzeProjectCompliance } from '@/lib/projects/compliance';
import { useAuthStore } from '@/store/useAuthStore';
import { type Project, useProjectStore } from '@/store/useProjectStore';
import { useCreditStore } from '@/store/useCreditStore';
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
    <div className="flex flex-col items-center justify-center py-48 space-y-4 animate-in fade-in duration-1000">
      <div className="w-12 h-12 bg-surface-950/50 backdrop-blur-sm border border-surface-600/20 rounded-full flex items-center justify-center shadow-sm">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      </div>
      <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest animate-pulse">
        Planify Hazırlanıyor
      </p>
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
      // Kredi kontrolü (1 kredi = 1 proje hakkı = $5)
      const { deductCredits, canCreateProject } = useCreditStore.getState();
      const CREDIT_COST = 1; // 1 proje = 1 kredi
      
      if (!canCreateProject()) {
        toast.error('Yeni proje oluşturmak için yeterli hakkınız bulunmuyor.', {
          description: 'Aboneliğinizi başlatın veya ek paket satın alın.',
          action: {
            label: 'Paketlere Göz At',
            onClick: () => router.push('/dashboard/upgrade')
          }
        });
        setIsCreating(false);
        return;
      }

      // Kredi düşme işlemi
      const success = await deductCredits(CREDIT_COST, 'project_creation', `${draft.title} projesi oluşturuldu`);
      
      if (!success) {
        toast.error('İşlem başarısız oldu, lütfen tekrar deneyin.');
        setIsCreating(false);
        return;
      }

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
      toast.error('Proje oluşturulurken bir hata oluştu');
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
      toast.error('Ad değiştirilemedi');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu projeyi kalıcı olarak silmek istediğinize emin misiniz?')) {
      void deleteProject(id);
    }
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-1000">
        {/* Welcome Header removed per user request */}

        {/* Metrics Row */}
        {!isLoading && <DashboardMetrics projects={projects} />}

        {isLoading ? (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-surface-600/30 mb-12 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-1 w-full px-6 py-2 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-800/50" />
                      <div className="w-16 h-3 bg-surface-800/50 rounded" />
                    </div>
                    <div className="w-10 h-6 bg-surface-800/50 rounded" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1 h-1 rounded-full bg-surface-800/50" />
                     <div className="w-24 h-2 bg-surface-800/50 rounded" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col divide-y divide-surface-600/30 relative animate-pulse mt-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-surface-800/50 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="w-48 h-4 bg-surface-800/50 rounded" />
                      <div className="w-32 h-2.5 bg-surface-800/50 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-6 sm:ml-auto shrink-0">
                    <div className="hidden md:flex items-center gap-3">
                       <div className="w-20 h-5 bg-surface-800/50 rounded-md" />
                       <div className="w-10 h-3 bg-surface-800/50 rounded" />
                    </div>
                    <div className="w-px h-8 bg-surface-600/30 hidden sm:block" />
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-9 bg-surface-800/50 rounded-lg" />
                       <div className="w-9 h-9 bg-surface-800/50 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
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
