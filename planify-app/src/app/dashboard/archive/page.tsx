'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Archive, CheckCircle2, FileText, Loader2, TriangleAlert } from 'lucide-react';
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
    <div className="flex justify-center py-24 bg-white border border-slate-200 rounded-lg">
      <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
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
      <div className="space-y-6 animate-fade-in font-sans">
        <section className="bg-white border border-slate-200 rounded-lg p-6 lg:p-7">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                Denetim Merkezi / Arşiv
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Tahliye Planı Arşivi
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Kullanıcıya ait tüm tahliye planlarını, denetim durumlarını, son çıktı kayıtlarını
                ve proje kimlik bilgilerini geniş arşiv görünümünde yönetin.
              </p>
            </div>

            <button
              onClick={handleStartCreation}
              disabled={isCreating}
              className="h-11 px-5 bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 xl:self-start"
            >
              Yeni Denetim Dosyası
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ArchiveMetric icon={<Archive className="w-5 h-5" />} label="Toplam Plan" value={projects.length.toString()} />
          <ArchiveMetric icon={<CheckCircle2 className="w-5 h-5" />} label="Denetime Hazır" value={readyCount.toString()} tone="success" />
          <ArchiveMetric icon={<TriangleAlert className="w-5 h-5" />} label="Eksik Kontrol" value={missingCount.toString()} tone="warning" />
          <ArchiveMetric icon={<FileText className="w-5 h-5" />} label="Çıktı Alınan" value={exportedCount.toString()} />
        </div>

        {isLoading ? (
          <ArchiveLoading />
        ) : (
          <ProjectDossierGrid
            items={filteredAuditItems}
            searchTerm={searchTerm}
            eyebrow="Arşiv"
            title="Tüm tahliye planları"
            description={`${filteredAuditItems.length} kayıt listeleniyor.`}
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
  tone?: 'default' | 'success' | 'warning';
}) {
  const toneClass = tone === 'success'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : tone === 'warning'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className={`w-10 h-10 border rounded-lg flex items-center justify-center ${toneClass}`}>
        {icon}
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}
