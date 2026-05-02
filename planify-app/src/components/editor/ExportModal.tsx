'use client';

import React, { useState } from 'react';
import type Konva from 'konva';
import { 
  X, FileDown, Layers, Check, FileType, 
  Printer, Image as ImageIcon, Code, Sparkles,
  ShieldCheck, AlertCircle, Info
} from 'lucide-react';
import { useEditorStore, useShallow } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { THEME_CONFIGS } from '@/types/editor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPro: boolean;
  projectName: string;
  onExportComplete?: (format: 'pdf' | 'png', fileName: string) => Promise<void> | void;
}

type ExportFormat = 'pdf' | 'png' | 'svg';

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    if (typeof window === 'undefined') resolve();
    else window.requestAnimationFrame(() => resolve());
  });

export function ExportModal({ 
  isOpen, 
  onClose, 
  stageRef, 
  containerRef, 
  isPro,
  projectName,
  onExportComplete
}: ExportModalProps) {
  const { layers, activeTemplateLayout, projectMetadata } = useEditorStore(useShallow(s => ({
    layers: s.layers,
    activeTemplateLayout: s.activeTemplateLayout,
    projectMetadata: s.projectMetadata
  })));

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set(layers.map(l => l.id)));
  const [isExporting, setIsExporting] = useState(false);
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [bgMode, setBgMode] = useState<'minimal' | 'current' | 'transparent'>('minimal');

  if (!isOpen) return null;

  const toggleLayer = (id: string) => {
    const next = new Set(selectedLayers);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
      else toast.error('En az bir katman seçili olmalıdır.');
    } else {
      next.add(id);
    }
    setSelectedLayers(next);
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Capture inner zoom/pan before the try block so they're accessible in finally
    const { innerZoom: savedInnerZoom, innerPan: savedInnerPan, editorTheme: savedEditorTheme } = useEditorStore.getState();
    try {
      if (bgMode === 'minimal' || bgMode === 'transparent') {
        // Temporarily force 'minimal' theme for clean export or transparent background
        useEditorStore.getState().setEditorTheme('minimal');
      }

      // 1. Store original visibility
      const originalVisibility = layers.map(l => ({ id: l.id, visible: l.visible }));

      // 2. Temporarily set visibility for export
      const { toggleLayerVisibility } = useEditorStore.getState();
      layers.forEach(l => {
        const shouldBeVisible = selectedLayers.has(l.id);
        if (l.visible !== shouldBeVisible) {
          toggleLayerVisibility(l.id);
        }
      });

      // 3. Trigger Export
      useEditorStore.getState().setFocusedRegionId(null);

      // Reset inner zoom/pan so the full drawing area is captured at 1:1 scale.
      // Without this, exports capture whatever zoom level the user was editing at.
      useEditorStore.getState().setInnerZoom(1);
      useEditorStore.getState().setInnerPan({ x: 0, y: 0 });

      await waitForPaint();
      if (selectedFormat === 'pdf') {
        const fileName = `${(projectName || projectMetadata.name).replace(/\s+/g, '-')}.pdf`;
        const { exportToPDF } = await import('@/lib/editor/export');
        await exportToPDF(
          containerRef, 
          projectName || projectMetadata.name, 
          activeTemplateLayout, 
          isPro,
          quality === 'ultra' ? 4 : quality === 'high' ? 3 : 2,
          bgMode === 'transparent' ? 'rgba(0,0,0,0)' : (bgMode === 'current' ? THEME_CONFIGS[savedEditorTheme].bg : '#ffffff'),
          bgMode
        );
        await onExportComplete?.('pdf', fileName);
      } else if (selectedFormat === 'png') {
        if (activeTemplateLayout && containerRef.current) {
          const pixelRatio = quality === 'ultra' ? 4 : quality === 'high' ? 3 : 2;
          const { toPng } = await import('html-to-image');
          containerRef.current.dataset.exportMode = 'true';
          containerRef.current.dataset.exportBgMode = bgMode;
          let dataUrl: string;
          try {
            dataUrl = await toPng(containerRef.current, {
              pixelRatio: pixelRatio,
              backgroundColor: bgMode === 'transparent' ? 'rgba(0,0,0,0)' : (bgMode === 'current' ? THEME_CONFIGS[savedEditorTheme].bg : '#ffffff'),
            });
          } finally {
            if (containerRef.current) {
              delete containerRef.current.dataset.exportMode;
              delete containerRef.current.dataset.exportBgMode;
            }
          }
          const fileName = `${projectName || projectMetadata.name}.png`;
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          link.click();
          await onExportComplete?.('png', fileName);
        } else if (!stageRef.current) {
          toast.error('Tuval hazır değil. Lütfen tekrar deneyin.');
          return;
        } else {
          const pixelRatio = quality === 'ultra' ? 5 : quality === 'high' ? 3 : 2;
          const dataURL = stageRef.current.toDataURL({ pixelRatio });
          const link = document.createElement('a');
          const fileName = `${projectName || projectMetadata.name}.png`;
          link.download = fileName;
          link.href = dataURL;
          link.click();
          await onExportComplete?.('png', fileName);
        }
      } else if (selectedFormat === 'svg') {
        toast.info('SVG dışa aktarma yakında eklenecek. Şimdilik PDF (Vektörel) kullanın.');
      }

      // 4. Restore visibility
      originalVisibility.forEach(l => {
        const current = useEditorStore.getState().layers.find(cl => cl.id === l.id);
        if (current && current.visible !== l.visible) {
          toggleLayerVisibility(l.id);
        }
      });

      toast.success('Dışa aktarma tamamlandı.');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Dışa aktarma sırasında bir hata oluştu.');
    } finally {
      // Always restore inner zoom/pan to pre-export state
      useEditorStore.getState().setInnerZoom(savedInnerZoom);
      useEditorStore.getState().setInnerPan(savedInnerPan);
      useEditorStore.getState().setEditorTheme(savedEditorTheme);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[800px] animate-scale-in">
        
        {/* Left: Configuration */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dışa Aktar</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Profesyonel Çıktı Ayarları</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <FileType className="w-3.5 h-3.5" /> Dosya Formatı
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['pdf', 'png', 'svg'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFormat(f)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                    selectedFormat === f 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md"
                      : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                  )}
                >
                  {f === 'pdf' && <Printer className="w-6 h-6" />}
                  {f === 'png' && <ImageIcon className="w-6 h-6" />}
                  {f === 'svg' && <Code className="w-6 h-6" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{f}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layer Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Katman Filtresi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                    selectedLayers.has(layer.id)
                      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                      : "border-slate-100 bg-slate-50 text-slate-400 opacity-60"
                  )}
                >
                  <span className="text-[11px] font-bold uppercase tracking-tight">{layer.name}</span>
                  {selectedLayers.has(layer.id) ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Settings */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Baskı Kalitesi
            </h3>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              {(['standard', 'high', 'ultra'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    quality === q 
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {q === 'standard' ? 'Normal' : q === 'high' ? 'Yüksek' : 'Ultra'}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
              {quality === 'ultra' ? '★ En yüksek vektörel hassasiyet ve keskinlik (Yavaş).' : 
               quality === 'high' ? '★ Profesyonel baskı için optimize edilmiş (Önerilen).' : 
               '★ Hızlı önizleme ve dijital paylaşım için.'}
            </p>
          </div>

          {/* Background Mode */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Arka Plan
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              {(['minimal', 'current', 'transparent'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setBgMode(m)}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border",
                    bgMode === m 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                  )}
                >
                  {m === 'minimal' ? 'Temiz (Beyaz)' : m === 'current' ? 'Mevcut Tema' : 'Şeffaf (PNG)'}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
              {bgMode === 'transparent' ? '★ Arka planı tamamen şeffaf yapar (PDF\'lerde beyaz çıkar).' : 
               bgMode === 'minimal' ? '★ Her zaman minimal temiz beyaz arka planla çıktı alır.' : 
               '★ Şu anki çalışma temanızı çıktıya yansıtır.'}
            </p>
          </div>
        </div>

        {/* Right: Preview & Action */}
        <div className="w-full md:w-[320px] bg-slate-50 border-l border-slate-100 p-8 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Proje Özeti</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase">Proje Adı</p>
                  <p className="text-xs font-black text-slate-800 uppercase line-clamp-2">{projectMetadata.name}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase">Şablon</p>
                  <p className="text-xs font-black text-slate-800 uppercase">{activeTemplateLayout?.name || 'Serbest Çizim'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase">Ölçek</p>
                  <p className="text-xs font-black text-slate-800 uppercase">1:1 HASSASİYET AKTİF</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">ISO Uyumluluk</span>
              </div>
              <p className="text-[10px] text-indigo-600/70 font-bold leading-relaxed uppercase">
                Çıktınız ISO 23601 standartlarına uygun antet ve sembolojiyi içerecek şekilde hazırlanacak.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {!isPro && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 font-bold uppercase leading-tight">
                   Ücretsiz sürümde çıktı üzerinde küçük bir filigran yer alacaktır.
                </p>
              </div>
            )}
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={cn(
                "w-full py-5 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl",
                isExporting 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
              )}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  İŞLENİYOR...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  ŞİMDİ İNDİR
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-slate-400">
               <Info className="w-3 h-3" />
               <span className="text-[8px] font-black uppercase tracking-widest">Yüksek çözünürlüklü vektörel çıktı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
