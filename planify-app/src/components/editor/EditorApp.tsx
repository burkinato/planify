'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type Konva from 'konva';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { EditorHeader } from './EditorHeader';
import { EditorLeftSidebar } from './EditorLeftSidebar';
import { EditorRightSidebar } from './EditorRightSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { TemplateSelectorModal } from './TemplateSelectorModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSearchParams } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { FALLBACK_TEMPLATE_LAYOUTS } from '@/lib/editor/templateLayouts';

export default function EditorApp() {
  const [isPreview, setIsPreview] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<'tools' | 'properties' | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedProjectRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const handleContainerNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);
  
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const { projects, fetchProjects, templateLayouts, fetchTemplateLayouts, updateProject } = useProjectStore();
  const { 
    loadProject, templateLayoutId, projectTemplate, setTemplateLayout, 
    elements, layers, activeTemplateLayout, scaleConfig, pagePreset, templateState 
  } = useEditorStore();
  const { profile } = useAuthStore();
  const isPro = profile?.subscription_tier === 'pro';

  useEffect(() => {
    if (projectId) {
      fetchProjects();
      fetchTemplateLayouts();
    }
  }, [projectId, fetchProjects, fetchTemplateLayouts]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const proj = projects.find(p => p.id === projectId);
      if (proj && proj.canvas_data) {
        lastSavedSnapshotRef.current = JSON.stringify({
          canvas_data: proj.canvas_data,
          scale_config: proj.scale_config,
          template_layout_id: proj.template_layout_id ?? null,
          page_preset: proj.page_preset ?? null,
          template_state: proj.template_state ?? null,
        });
        hasLoadedProjectRef.current = true;

        const canvasData = typeof proj.canvas_data === 'object' && proj.canvas_data ? proj.canvas_data : {};
        loadProject(JSON.stringify({
          ...canvasData,
          scaleConfig: proj.scale_config,
          templateLayoutId: proj.template_layout_id,
          pagePreset: proj.page_preset,
          templateState: proj.template_state,
        }));
      }
    }
  }, [projectId, projects, loadProject]);

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
        const canvas_data = { elements, layers, projectTemplate, templateLayoutId, pagePreset, templateState };
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
  }, [elements, layers, templateLayoutId, pagePreset, templateState, scaleConfig, projectId, updateProject, projectTemplate, templateLayouts]);

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
        />
        <div className="flex flex-1 overflow-hidden relative">
          {!isPro && !isPreview && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[35]">
              <Link 
                href="/dashboard/upgrade"
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-full shadow-xl shadow-slate-200/50 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all group"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                Plus&apos;a Yüksel: Filigransız Temiz Çıktı Al
                <span className="ml-1 bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full text-[8px] border border-indigo-100">Hemen Başla</span>
              </Link>
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
      </div>
    </EditorErrorBoundary>
  );
}
