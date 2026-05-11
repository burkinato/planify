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
import { OnboardingWizard } from './onboarding/OnboardingWizard';
import { EditorTour } from './onboarding/EditorTour';
import { ModuleEditDrawer } from './ModuleEditDrawer';
import { ModuleAddDrawer } from './ModuleAddDrawer';
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasLoadedProject, setHasLoadedProject] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderOpacity, setPreloaderOpacity] = useState(1);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const handleContainerNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const templateSlug = searchParams.get('template');
  const { projects, fetchProjects, templateLayouts, fetchTemplateLayouts, updateProject, recordProjectExport, isLoading: isProjectsLoading } = useProjectStore();
  const {
    loadProject, templateLayoutId, projectTemplate, setTemplateLayout,
    elements, layers, activeTemplateLayout, scaleConfig, pagePreset, templateState,
    templateModules, innerZoom, innerPan, setProjectId,
    hasCompletedOnboarding, setOnboardingVisible,
    isModuleEditDrawerOpen, setIsModuleEditDrawerOpen,
    isModuleAddDrawerOpen, setIsModuleAddDrawerOpen,
    setFocusedRegionId
  } = useEditorStore();

  useEffect(() => {
    setProjectId(projectId);
    // Show onboarding if not completed
    if (!hasCompletedOnboarding) {
      setOnboardingVisible(true);
    }
  }, [projectId, setProjectId, hasCompletedOnboarding, setOnboardingVisible]);
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
        if (!hasLoadedProject) {
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
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setHasLoadedProject(true);
        }
      }
    }
  }, [projectId, projects, loadProject, templateSlug, templateLayouts, hasLoadedProject]);

  useEffect(() => {
    const sourceLayouts = mergeTemplateSources(templateLayouts);
    const layout = sourceLayouts.find((tpl) => tpl.id === templateLayoutId || tpl.slug === projectTemplate);
    if (layout) setTemplateLayout(layout);
  }, [templateLayouts, templateLayoutId, projectTemplate, setTemplateLayout]);

  useEffect(() => {
    if (!projectId) return;

    const timeoutId = setTimeout(async () => {
      if (!hasLoadedProject) return;

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
        
        const scale_config = scaleConfig;
        
        const snapshot = JSON.stringify({
          canvas_data,
          scale_config,
          template_layout_id: templateLayoutId ?? null,
          page_preset: pagePreset,
          template_state: templateState,
        });

        if (snapshot === lastSavedSnapshotRef.current) return;

        let thumbnail_url = undefined;
        // Only generate thumbnail every 30 seconds or if it's the first save
        const now = Date.now();
        const lastThumbnailTime = (window as unknown as { _lastThumbnailTime?: number })._lastThumbnailTime || 0;
        if (now - lastThumbnailTime > 30000 && stageRef.current) {
          try {
            thumbnail_url = stageRef.current.toDataURL({
              pixelRatio: 0.1,
              mimeType: 'image/jpeg',
              quality: 0.5
            });
            (window as unknown as { _lastThumbnailTime?: number })._lastThumbnailTime = now;
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
          scale_config,
          template_layout_id: validLayoutId,
          page_preset: pagePreset,
          template_state: templateState,
          thumbnail_url,
          compliance_score: audit.score,
          audit_status: audit.status,
        });

        lastSavedSnapshotRef.current = snapshot;

        toast.success('Değişiklikler kaydedildi', {
          id: 'autosave-status',
          duration: 2000,
          position: 'bottom-right',
        });
      } catch (error: unknown) {
        console.error('Auto-save failed', error);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [elements, layers, templateLayoutId, pagePreset, templateState, templateModules, scaleConfig, projectId, updateProject, projectTemplate, templateLayouts, innerZoom, innerPan]);

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

  // Preloader has been completely removed from blocking render.
  // We handle it gracefully as an overlay below.

  // Smooth preloader fade-out effect
  useEffect(() => {
    if (!isLoading && (!projectId || !isInitialLoading)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreloaderOpacity(0);
      const timer = setTimeout(() => setShowPreloader(false), 500);
      return () => clearTimeout(timer);
    } else {
      setShowPreloader(true);
      setPreloaderOpacity(1);
    }
  }, [isLoading, projectId, isInitialLoading]);

  // Effect to clear initial loading state once project and layout are ready
  useEffect(() => {
    if (projectId) {
      if (hasLoadedProject) {
        const timer = setTimeout(() => setIsInitialLoading(false), 300);
        return () => clearTimeout(timer);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInitialLoading(false);
    }
  }, [projectId, hasLoadedProject]);

  // Absolute fallback timeout to prevent infinite loading screen
  useEffect(() => {
    if (projectId) {
      const absoluteTimer = setTimeout(() => {
        if (isInitialLoading) {
          console.warn('Absolute fallback triggered: 3 seconds passed. Forcing preloader off.');
          // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInitialLoading(false);
          
          const currentProj = useProjectStore.getState().projects.find(p => p.id === projectId);
          if (currentProj && !hasLoadedProject) {
            setHasLoadedProject(true);
          } else if (!currentProj) {
            // Project might still be loading or missing, but we don't want to lock the UI
            // Let the EditorErrorBoundary handle any missing data crashes
          }
        }
      }, 3000);
      return () => clearTimeout(absoluteTimer);
    }
  }, [projectId, isInitialLoading, hasLoadedProject]);

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
            id="editor-canvas"
            isPreview={isPreview}
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
            stageRef={stageRef}
            setContainerNode={handleContainerNode}
          />
          {!isPreview && (
            <>
              <ModuleEditDrawer 
                isOpen={isModuleEditDrawerOpen} 
                onClose={() => {
                  setIsModuleEditDrawerOpen(false);
                  setFocusedRegionId(null);
                }} 
              />
              <ModuleAddDrawer
                isOpen={isModuleAddDrawerOpen}
                onClose={() => setIsModuleAddDrawerOpen(false)}
              />
              <TemplateModulePanel
                mobileMenu={mobileMenu}
                setMobileMenu={setMobileMenu}
              />
            </>
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

        <OnboardingWizard />
        <EditorTour />

        {/* Beautiful Overlay Preloader */}
        {showPreloader && (
          <div 
            className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050b16] transition-opacity duration-500 ease-in-out"
            style={{ opacity: preloaderOpacity }}
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-cyan-500/20 border-b-cyan-500 animate-spin-slow"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-white font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                Planify <span className="text-emerald-400">Editor</span>
              </div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                {isLoading ? 'Kullanıcı Doğrulanıyor...' : 'Çalışma Alanı Hazırlanıyor...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </EditorErrorBoundary>
  );
}
