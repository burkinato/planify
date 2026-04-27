'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type Konva from 'konva';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { EditorHeader } from './EditorHeader';
import { EditorLeftSidebar } from './EditorLeftSidebar';
import { EditorRightSidebar } from './EditorRightSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { TemplateSelectorModal } from './TemplateSelectorModal';
import { ExportModal } from './ExportModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { FALLBACK_TEMPLATE_LAYOUTS } from '@/lib/editor/templateLayouts';

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
  const { projects, fetchProjects, templateLayouts, fetchTemplateLayouts, updateProject } = useProjectStore();
  const { 
    loadProject, templateLayoutId, projectTemplate, setTemplateLayout, 
    elements, layers, activeTemplateLayout, scaleConfig, pagePreset, templateState,
    innerZoom, innerPan, setInnerZoom, setInnerPan
  } = useEditorStore();
  const { profile, user, isLoading } = useAuthStore();
  const isPro = profile?.subscription_tier === 'pro';
  const router = useRouter();

  // Auth Guard: Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user && !profile) {
      toast.error('Editorü kullanmak için giriş yapmalısınız.');
      router.push('/login');
    }
  }, [user, profile, isLoading, router]);

  // Show loading state while checking auth or loading project
  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">
          Kullanıcı Doğrulanıyor...
        </div>
      </div>
    );
  }

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
        // If we haven't loaded this specific project yet, or it's a new one
        if (!hasLoadedProjectRef.current) {
          const canvasData = (typeof proj.canvas_data === 'object' && proj.canvas_data ? proj.canvas_data : {}) as any;
          
          // If it's a brand new project (no canvas_data) and we have a template in URL
          if (!proj.canvas_data && templateSlug) {
            const sourceLayouts = templateLayouts.length > 0 ? templateLayouts : FALLBACK_TEMPLATE_LAYOUTS;
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
            // Normal load
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
    const sourceLayouts = templateLayouts.length > 0 ? templateLayouts : FALLBACK_TEMPLATE_LAYOUTS;
    const layout = sourceLayouts.find((tpl) => tpl.id === templateLayoutId || tpl.slug === projectTemplate);
    if (layout) setTemplateLayout(layout);
  }, [templateLayouts, templateLayoutId, projectTemplate, setTemplateLayout]);

  // Debounced Auto-Save with toast feedback and thumbnail generation
  useEffect(() => {
    if (!projectId) return;

    const timeoutId = setTimeout(async () => {
      if (!hasLoadedProjectRef.current) {
        return;
      }

      try {
        const canvas_data = { 
          elements, 
          layers, 
          projectTemplate, 
          templateLayoutId, 
          pagePreset, 
          templateState,
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

        if (snapshot === lastSavedSnapshotRef.current) {
          return;
        }
        
        // Generate thumbnail
        let thumbnail_url = null;
        if (stageRef.current) {
          try {
            // Low-res thumbnail for dashboard preview
            thumbnail_url = stageRef.current.toDataURL({ 
              pixelRatio: 0.1, // Very small for DB storage
              mimeType: 'image/jpeg',
              quality: 0.5 
            });
          } catch (e) {
            console.warn('Thumbnail generation failed', e);
          }
        }

        // Ensure template_layout_id is a valid UUID or null
        let validLayoutId = templateLayoutId;
        if (templateLayoutId && templateLayoutId.startsWith('fallback-')) {
          // Try to find the real database ID for this template by slug
          const dbLayout = templateLayouts.find(l => l.slug === projectTemplate);
          validLayoutId = dbLayout ? dbLayout.id : null;
        }

        await updateProject(projectId, {
          canvas_data,
          scale_config: scaleConfig,
          template_layout_id: validLayoutId,
          page_preset: pagePreset,
          template_state: templateState,
          thumbnail_url: thumbnail_url || undefined,
        });

        lastSavedSnapshotRef.current = snapshot;
        
        toast.success('Otomatik kaydedildi', {
          id: 'autosave-status',
          duration: 2000,
          position: 'bottom-right',
        });
      } catch (error: any) {
        console.error('Auto-save failed', error);
        
        const isOffline = typeof window !== 'undefined' && !window.navigator.onLine;
        let errorMessage = 'Bilinmeyen bir hata oluştu';
        
        if (isOffline) {
          errorMessage = 'İnternet bağlantınız koptu. Bağlantı gelene kadar değişiklikleriniz tarayıcıda saklanacak.';
        } else if (error?.message) {
          if (error.message === 'Failed to fetch') {
            errorMessage = 'Sunucuya bağlanılamadı veya proje boyutu çok büyük (Failed to fetch). İnternet bağlantınızı ve projeye eklediğiniz görsellerin boyutunu kontrol edin.';
          } else {
            errorMessage = error.message;
          }
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        toast.error(`Otomatik kayıt başarısız: ${errorMessage}`, {
          id: 'autosave-error',
          duration: 5000,
        });
      }
    }, 5000); // Increased to 5s to be less aggressive with thumbnails

    return () => clearTimeout(timeoutId);
  }, [elements, layers, templateLayoutId, pagePreset, templateState, scaleConfig, projectId, updateProject, projectTemplate, templateLayouts, innerZoom, innerPan]);

  const validateCompliance = () => {
    const missing: string[] = [];
    if (!elements.some((el) => el.type === 'symbol' && el.symbolType === 'here')) missing.push('Buradasiniz isareti');
    if (!elements.some((el) => el.type === 'route' && el.routeType === 'evacuation')) missing.push('Tahliye rotasi');
    if (!elements.some((el) => el.type === 'symbol' && el.symbolType === 'assembly')) missing.push('Toplanma alani');
    if (!activeTemplateLayout && !elements.some((el) => el.type === 'symbol')) missing.push('Lejand/sembol bilgisi');
    if (missing.length > 0) {
      toast.warning(`ISO kontrol uyarisi: ${missing.join(', ')} eksik gorunuyor.`);
    }
  };

  const exportImage = async (format: 'png' | 'jpeg' = 'png') => {
    validateCompliance();
    if (activeTemplateLayout && containerRef.current) {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Add watermark for free users
      if (!isPro) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.globalAlpha = 0.12;
          ctx.font = 'bold 80px Arial';
          ctx.fillStyle = '#666666';
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-35 * Math.PI / 180);
          ctx.textAlign = 'center';
          ctx.fillText('PLANIFY DEMO', 0, -60);
          ctx.fillText('PLANIFY DEMO', 0, 60);
          ctx.restore();
        }
      }

      const dataURL = canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', format === 'jpeg' ? 0.95 : 1);
      const link = document.createElement('a');
      link.download = `planify-tahliye-plani.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    if (!stageRef.current) return;

    // For Konva stage export
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 0.95 : 1;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3, mimeType, quality });

    if (!isPro) {
      // Add watermark via temp canvas
      const img = new Image();
      img.onload = () => {
        const watermarkCanvas = document.createElement('canvas');
        watermarkCanvas.width = img.width;
        watermarkCanvas.height = img.height;
        const ctx = watermarkCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          ctx.save();
          ctx.globalAlpha = 0.12;
          ctx.font = 'bold 120px Arial';
          ctx.fillStyle = '#666666';
          ctx.translate(watermarkCanvas.width / 2, watermarkCanvas.height / 2);
          ctx.rotate(-35 * Math.PI / 180);
          ctx.textAlign = 'center';
          ctx.fillText('PLANIFY DEMO', 0, -80);
          ctx.fillText('PLANIFY DEMO', 0, 80);
          ctx.restore();
        }
        const link = document.createElement('a');
        link.download = `planify-tahliye-plani.${format}`;
        link.href = watermarkCanvas.toDataURL(mimeType, quality);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = dataURL;
      return;
    }

    const link = document.createElement('a');
    link.download = `planify-tahliye-plani.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = async () => {
    validateCompliance();
    const { exportToPDF } = await import('@/lib/editor/export');
    const project = projects.find(p => p.id === projectId);
    await exportToPDF(containerRef, project?.title || 'Tahliye-Plani', activeTemplateLayout, isPro);
  };

  useKeyboardShortcuts(() => exportImage());

  return (
    <EditorErrorBoundary onReset={() => window.location.reload()}>
      <div className="flex flex-col h-screen bg-slate-50 text-slate-200 font-sans overflow-hidden">
        <EditorHeader
          projectId={projectId}
          isPreview={isPreview}
          setIsPreview={setIsPreview}
          exportImage={exportImage}
          exportPdf={exportPdf}
          onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />
        <div className="flex flex-1 overflow-hidden relative">
          {!isPro && !isPreview && showUpgradeBanner && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[35]">
              <div className="relative group">
                <Link 
                  href="/dashboard/upgrade"
                  className="flex items-center gap-5 px-6 py-3 bg-white/80 backdrop-blur-xl border border-cyan-500/30 text-slate-900 rounded-none shadow-[0_20px_50px_-12px_rgba(6,182,212,0.25)] text-[9px] font-black uppercase tracking-[0.2em] hover:border-cyan-500/60 transition-all relative"
                >
                  {/* Technical CAD Corners */}
                  <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-center w-8 h-8 bg-cyan-50 border border-cyan-100">
                    <Sparkles className="w-4 h-4 text-cyan-500 group-hover:rotate-12 transition-transform" />
                  </div>

                  <div className="flex flex-col items-start gap-0.5">
                    <span className="relative z-10">
                      Plus&apos;a Yüksel: <span className="text-cyan-600">Filigransız Temiz Çıktı Al</span>
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-200 mx-2" />

                  <span className="px-4 py-2 bg-slate-900 text-white rounded-none text-[10px] font-black tracking-widest group-hover:bg-cyan-600 transition-colors relative flex items-center gap-2">
                    Hemen Başla
                    <div className="w-1 h-1 bg-cyan-400 animate-pulse rounded-full" />
                  </span>
                </Link>
                
                {/* Close Button */}
                <button 
                  onClick={() => setShowUpgradeBanner(false)}
                  className="absolute -right-2 -top-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-md z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
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
            <EditorRightSidebar
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
          />
        )}
      </div>
    </EditorErrorBoundary>
  );
}
