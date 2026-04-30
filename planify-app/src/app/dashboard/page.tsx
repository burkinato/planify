'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <div className="min-h-screen bg-[#fcfdfe]">
        <DashboardPortal />
      </div>
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-48 space-y-4">
      <div className="w-16 h-16 bg-white rounded-[32px] shadow-xl flex items-center justify-center border border-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Portal Yükleniyor</p>
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
        {/* Top Search Area Only */}
        <div className="flex justify-end">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Dosya veya tesis ara..."
              className="w-full sm:w-80 h-14 pl-12 pr-6 bg-white/60 backdrop-blur-xl border border-white rounded-[24px] text-xs font-black text-slate-900 outline-none focus:bg-white focus:ring-8 focus:ring-slate-900/5 transition-all shadow-sm"
            />
          </div>
        </div>

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
