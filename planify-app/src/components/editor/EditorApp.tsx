'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type Konva from 'konva';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { EditorHeader } from './EditorHeader';
import { EditorLeftSidebar } from './EditorLeftSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { TemplateSelectorModal } from './TemplateSelectorModal';
import { ExportModal } from './ExportModal';
import { TemplateModulePanel } from './TemplateModulePanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { FALLBACK_TEMPLATE_LAYOUTS } from '@/lib/editor/templateLayouts';
import { analyzeProjectCompliance } from '@/lib/projects/compliance';
import type { TemplateModuleInstance } from '@/types/editor';

type PersistedCanvasData = {
  elements?: typeof useEditorStore.getState extends () => infer State
    ? State extends { elements: infer Elements }
      ? Elements
      : never
    : never;
  layers?: typeof useEditorStore.getState extends () => infer State
    ? State extends { layers: infer Layers }
      ? Layers
      : never
    : never;
  innerZoom?: number;
  innerPan?: { x: number; y: number };
  templateModules?: TemplateModuleInstance[];
};

const mergeTemplateSources = (dbLayouts: typeof FALLBACK_TEMPLATE_LAYOUTS) => {
  const merged = new Map<string, (typeof FALLBACK_TEMPLATE_LAYOUTS)[number]>();
  [...FALLBACK_TEMPLATE_LAYOUTS, ...dbLayouts].forEach((layout) => {
    if (!merged.has(layout.slug)) merged.set(layout.slug, layout);
  });
  return Array.from(merged.values());
};

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    if (typeof window === 'undefined') resolve();
    else window.requestAnimationFrame(() => resolve());
  });

export default function EditorApp() {
  const [isPreview, setIsPreview] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<'tools' | 'properties' | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedProjectRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const handleContainerNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const templateSlug = searchParams.get('template');
  const { projects, fetchProjects, templateLayouts, fetchTemplateLayouts, updateProject, recordProjectExport } = useProjectStore();
  const {
    loadProject, templateLayoutId, projectTemplate, setTemplateLayout,
    elements, layers, activeTemplateLayout, scaleConfig, pagePreset, templateState,
    templateModules, innerZoom, innerPan, setProjectId
  } = useEditorStore();

  useEffect(() => {
    setProjectId(projectId);
  }, [projectId, setProjectId]);
  const { profile, user, isLoading } = useAuthStore();
  const isPro = profile?.subscription_tier === 'pro';
  const router = useRouter();

  // Auth Guard: Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user && !profile) {
      toast.error('Editörü kullanmak için giriş yapmalısınız.');
      router.push('/login');
    }
  }, [user, profile, isLoading, router]);

  useEffect(() => {
    if (projectId) {
      fetchProjects();
      fetchTemplateLayouts();
    }
  }, [projectId, fetchProjects, fetchTemplateLayouts]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const proj = projects.find(p => p.id === projectId);
      if (proj) {
        if (!hasLoadedProjectRef.current) {
          const canvasData: PersistedCanvasData =
            typeof proj.canvas_data === 'object' && proj.canvas_data
              ? proj.canvas_data as PersistedCanvasData
              : {};

          if (!proj.canvas_data && templateSlug) {
            const sourceLayouts = mergeTemplateSources(templateLayouts);
            const targetLayout = sourceLayouts.find(l => l.slug === templateSlug);

            loadProject(JSON.stringify({
              elements: [],
              layers: [{ id: 'default', name: 'Ana Katman', visible: true, locked: false, order: 0 }],
              ...canvasData,
              scaleConfig: proj.scale_config,
              templateLayoutId: targetLayout?.id || proj.template_layout_id,
              projectTemplate: templateSlug,
              pagePreset: targetLayout?.page_preset || proj.page_preset,
              templateState: proj.template_state,
              innerZoom: 1,
              innerPan: { x: 0, y: 0 },
            }));
          } else {
            loadProject(JSON.stringify({
              elements: canvasData.elements || [],
              layers: canvasData.layers || [{ id: 'default', name: 'Ana Katman', visible: true, locked: false, order: 0 }],
              ...canvasData,
              scaleConfig: proj.scale_config,
              templateLayoutId: proj.template_layout_id,
              pagePreset: proj.page_preset,
              templateState: proj.template_state,
              innerZoom: canvasData.innerZoom || 1,
              innerPan: canvasData.innerPan || { x: 0, y: 0 },
            }));
          }

          lastSavedSnapshotRef.current = JSON.stringify({
            canvas_data: proj.canvas_data,
            scale_config: proj.scale_config,
            template_layout_id: proj.template_layout_id ?? null,
            page_preset: proj.page_preset ?? null,
            template_state: proj.template_state ?? null,
          });
          hasLoadedProjectRef.current = true;
        }
      }
    }
  }, [projectId, projects, loadProject, templateSlug, templateLayouts]);

  useEffect(() => {
    const sourceLayouts = mergeTemplateSources(templateLayouts);
    const layout = sourceLayouts.find((tpl) => tpl.id === templateLayoutId || tpl.slug === projectTemplate);
    if (layout) setTemplateLayout(layout);
  }, [templateLayouts, templateLayoutId, projectTemplate, setTemplateLayout]);

  useEffect(() => {
    if (!projectId) return;

    const timeoutId = setTimeout(async () => {
      if (!hasLoadedProjectRef.current) return;

      try {
        const canvas_data = {
          elements,
          layers,
          projectTemplate,
          templateLayoutId,
          pagePreset,
          templateState,
          templateModules,
          innerZoom,
          innerPan
        };
        const snapshot = JSON.stringify({
          canvas_data,
          scale_config: scaleConfig,
          template_layout_id: templateLayoutId ?? null,
          page_preset: pagePreset,
          template_state: templateState,
        });

        if (snapshot === lastSavedSnapshotRef.current) return;

        let thumbnail_url = null;
        if (stageRef.current) {
          try {
            thumbnail_url = stageRef.current.toDataURL({
              pixelRatio: 0.1,
              mimeType: 'image/jpeg',
              quality: 0.5
            });
          } catch (e) {
            console.warn('Thumbnail generation failed', e);
          }
        }

        let validLayoutId = templateLayoutId;
        if (templateLayoutId && templateLayoutId.startsWith('fallback-')) {
          const dbLayout = templateLayouts.find(l => l.slug === projectTemplate);
          validLayoutId = dbLayout ? dbLayout.id : null;
        }

        const audit = analyzeProjectCompliance({
          canvas_data,
          template_layout_id: validLayoutId,
          page_preset: pagePreset,
          last_exported_at: projects.find((project) => project.id === projectId)?.last_exported_at,
        });

        await updateProject(projectId, {
          canvas_data,
          scale_config: scaleConfig,
          template_layout_id: validLayoutId,
          page_preset: pagePreset,
          template_state: templateState,
          thumbnail_url: thumbnail_url || undefined,
          compliance_score: audit.score,
          audit_status: audit.status,
        });

        lastSavedSnapshotRef.current = snapshot;

        toast.success('Otomatik kaydedildi', {
          id: 'autosave-status',
          duration: 2000,
          position: 'bottom-right',
        });
      } catch (error: unknown) {
        console.error('Auto-save failed', error);
        const isOffline = typeof window !== 'undefined' && !window.navigator.onLine;
        const errorMessage = isOffline
          ? 'İnternet bağlantınız koptu.'
          : error instanceof Error
            ? error.message
            : 'Bilinmeyen bir hata oluştu';
        toast.error(`Otomatik kayıt başarısız: ${errorMessage}`, {
          id: 'autosave-error',
          duration: 5000,
        });
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [elements, layers, templateLayoutId, pagePreset, templateState, templateModules, scaleConfig, projectId, updateProject, projectTemplate, templateLayouts, innerZoom, innerPan, projects]);

  const validateCompliance = () => {
    const missing: string[] = [];
    // E004 = Buradasınız işareti
    if (!elements.some((el) => el.type === 'symbol' && el.symbolType === 'E004')) {
      missing.push('Buradasınız işareti');
    }
    // Tahliye rotası
    if (!elements.some((el) => el.type === 'route' && el.routeType === 'evacuation')) {
      missing.push('Tahliye rotası');
    }
    // Lejand kontrolü
    if (!activeTemplateLayout && !elements.some((el) => el.type === 'symbol')) {
      missing.push('Lejand/sembol bilgisi');
    }

    if (missing.length > 0) {
      toast.warning(`ISO kontrol uyarısı: ${missing.join(', ')} eksik görünüyor.`);
    }
  };

  const exportImage = async (format: 'png' | 'jpeg' = 'png') => {
    validateCompliance();
    const { editorTheme: savedEditorTheme } = useEditorStore.getState();
    try {
      useEditorStore.getState().setEditorTheme('minimal');
      useEditorStore.getState().setFocusedRegionId(null);
      await waitForPaint();
      const fileName = `planify-tahliye-plani.${format}`;
      if (activeTemplateLayout && containerRef.current) {
        const { toCanvas } = await import('html-to-image');
        containerRef.current.dataset.exportMode = 'true';
        let canvas: HTMLCanvasElement;
        try {
          canvas = await toCanvas(containerRef.current, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
          });
        } finally {
          if (containerRef.current) {
            delete containerRef.current.dataset.exportMode;
          }
        }

        const dataURL = canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', format === 'jpeg' ? 0.95 : 1);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (projectId) await recordProjectExport(projectId, format, fileName);
        return;
      }

      if (!stageRef.current) return;
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpeg' ? 0.95 : 1;
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 3, mimeType, quality });

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (projectId) void recordProjectExport(projectId, format, fileName);
    } finally {
      useEditorStore.getState().setEditorTheme(savedEditorTheme);
    }
  };

  const exportPdf = async () => {
    validateCompliance();
    const { editorTheme: savedEditorTheme } = useEditorStore.getState();
    try {
      useEditorStore.getState().setEditorTheme('minimal');
      useEditorStore.getState().setFocusedRegionId(null);
      await waitForPaint();
      const { exportToPDF } = await import('@/lib/editor/export');
      const project = projects.find(p => p.id === projectId);
      const fileName = `${(project?.title || 'Tahliye-Plani').replace(/\s+/g, '-')}.pdf`;
      await exportToPDF(containerRef, project?.title || 'Tahliye-Plani', activeTemplateLayout, isPro);
      if (projectId) await recordProjectExport(projectId, 'pdf', fileName);
    } finally {
      useEditorStore.getState().setEditorTheme(savedEditorTheme);
    }
  };

  useKeyboardShortcuts(() => exportImage());

  // Show loading state while checking auth or loading project
  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-950 transition-colors">
        <div className="animate-pulse text-surface-400 font-bold uppercase tracking-widest text-xs">
          Kullanıcı Doğrulanıyor...
        </div>
      </div>
    );
  }

  return (
    <EditorErrorBoundary onReset={() => window.location.reload()}>
      <div className="flex flex-col h-screen bg-surface-950 text-surface-200 font-sans overflow-hidden transition-colors">
        <EditorHeader
          projectId={projectId}
          isPreview={isPreview}
          setIsPreview={setIsPreview}
          exportImage={exportImage}
          exportPdf={exportPdf}
          onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          mobileMenu={mobileMenu}
          setMobileMenu={setMobileMenu}
        />
        <div className="flex flex-1 overflow-hidden relative">

          {!isPreview && (
            <EditorLeftSidebar
              mobileMenu={mobileMenu}
              setMobileMenu={setMobileMenu}
            />
          )}
          <EditorCanvas
            isPreview={isPreview}
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
            stageRef={stageRef}
            setContainerNode={handleContainerNode}
          />
          {!isPreview && (
            <TemplateModulePanel
              mobileMenu={mobileMenu}
              setMobileMenu={setMobileMenu}
            />
          )}

        </div>

        {isTemplateModalOpen && (
          <TemplateSelectorModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
          />
        )}

        {isExportModalOpen && (
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            stageRef={stageRef}
            containerRef={containerRef}
            isPro={isPro}
            projectName={projects.find(p => p.id === projectId)?.title || 'Yeni Proje'}
            onExportComplete={(format, fileName) => projectId ? recordProjectExport(projectId, format, fileName) : undefined}
          />
        )}
      </div>
    </EditorErrorBoundary>
  );
}
