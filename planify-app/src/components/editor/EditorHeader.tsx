'use client';

import { MapPin, ZoomOut, ZoomIn, Grid, Undo2, Redo2,
  Keyboard, X, Eye, EyeOff, Download, FileImage, FileText, Layers, Pencil, Check, Lock, Sparkles, XCircle, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProAccess } from '@/hooks/useProAccess';
import { Logo } from '@/components/shared/Logo';
import { useState, useRef } from 'react';
import type { EditorTheme } from '@/types/editor';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EditorHeaderProps {
  projectId: string | null;
  isPreview: boolean;
  setIsPreview: (v: boolean) => void;
  exportImage: (format: 'png' | 'jpeg') => void;
  exportPdf: () => void;
  onOpenTemplateModal?: () => void;
  onOpenExportModal?: () => void;
}

export function EditorHeader({ 
  projectId, isPreview, setIsPreview, exportImage, exportPdf, 
  onOpenTemplateModal, onOpenExportModal 
}: EditorHeaderProps) {
  const {
    zoom, setZoom, gridVisible, setGridVisible, undo, redo, canUndo, canRedo,
    scaleConfig, setScaleConfig, editorTheme, setEditorTheme
  } = useEditorStore();
  const { projects, updateProject } = useProjectStore();
  const { profile } = useAuthStore();
  const { isPro } = useProAccess();
  
  const project = projects.find(p => p.id === projectId);
  
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState(project?.title || '');
  const isHandlingRename = useRef(false);
  const router = useRouter();

  const handleRename = async () => {
    if (isHandlingRename.current) return;
    
    if (!projectId || !tempTitle.trim() || tempTitle.trim() === project?.title) {
      setIsRenaming(false);
      return;
    }

    try {
      isHandlingRename.current = true;
      const newTitle = tempTitle.trim();
      setIsRenaming(false); // UI'yı hemen kapat
      await updateProject(projectId, { title: newTitle });
      toast.success('Proje adı güncellendi', { id: 'rename-toast' });
    } catch {
      toast.error('Ad güncellenemedi', { id: 'rename-toast' });
      setIsRenaming(true); // Hata durumunda geri aç
    } finally {
      isHandlingRename.current = false;
    }
  };

  const themes: { id: EditorTheme; label: string }[] = [
    { id: 'classic', label: 'Klasik' },
    { id: 'blueprint', label: 'Proje' },
    { id: 'dark', label: 'Karanlık' },
    { id: 'minimal', label: 'Minimal' },
  ];

  const shortcuts = [
    { key: 'V', desc: 'Seçim Aracı' },
    { key: 'W', desc: 'Duvar Çizimi' },
    { key: 'P', desc: 'Pencere Ekle' },
    { key: 'D', desc: 'Kapı Ekle' },
    { key: 'T', desc: 'Metin Aracı' },
    { key: 'M', desc: 'Mahal (Oda)' },
    { key: 'S', desc: 'Sembol Ekle' },
    { key: 'R', desc: 'Kurtarma Rotası' },
    { key: 'Q', desc: 'Tahliye Rotası' },
    { key: 'E', desc: 'Silgi' },
    { key: 'Esc', desc: 'Seçimi Bırak' },
    { key: 'Del', desc: 'Seçiliyi Sil' },
    { key: 'Ctrl+Z/Y', desc: 'Geri/İleri Al' },
    { key: 'Ctrl+D', desc: 'Çoğalt' },
    { key: 'Ctrl+S', desc: 'Dışa Aktar' },
    { key: 'Arrows', desc: 'Pozisyon Nudge' },
    { key: 'Ctrl+/-', desc: 'Zoom' },
  ];

  return (
    <header className="h-12 bg-white border-slate-200 border-b border-slate-200 flex items-center justify-between px-3 md:px-5 z-40 shrink-0 relative">
      {/* Left section */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-all group flex items-center gap-1.5"
          title="Dashboard'a Dön"
        >
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-2.5">
          <Logo size="sm" className="mr-2" />
          {isPro ? (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-wider border border-indigo-100">Plus</span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-wider border border-slate-200">Free</span>
          )}
          
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                aria-label="Proje adini duzenle"
                className="bg-slate-50 border border-blue-500 rounded px-2 py-0.5 text-xs font-bold text-slate-800 outline-none w-32 md:w-48"
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRename();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsRenaming(false);
                    setTempTitle(project?.title || '');
                  }
                }}
              />
              <button onClick={handleRename} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Proje adini yeniden adlandir"
              className="group flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-50"
              onClick={() => {
                setTempTitle(project?.title || '');
                isHandlingRename.current = false;
                setIsRenaming(true);
              }}
            >
              <span className="text-xs font-bold text-slate-700 max-w-[120px] md:max-w-[200px] truncate">
                {project?.title || 'Yeni Proje'}
              </span>
              <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>



        <div className="hidden lg:flex items-center gap-3 text-slate-500">


          <div className="flex items-center gap-0.5">
            <button
              disabled={!canUndo}
              onClick={undo}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 transition-all"
              title="Geri Al (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              disabled={!canRedo}
              onClick={redo}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 transition-all"
              title="İleri Al (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Unit Switcher - mm/cm/m */}
          <div className="hidden lg:flex items-center gap-0.5 bg-white border-slate-200/80 p-0.5 rounded-lg border border-slate-200/50 ml-2">
            {(['mm', 'cm', 'm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setScaleConfig({ ...scaleConfig, unit: u })}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                  scaleConfig.unit === u
                    ? "bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Zoom & Theme */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center bg-white border-slate-200/80 rounded-lg p-0.5 border border-slate-200/50">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-all text-slate-500 hover:text-slate-800"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2.5 text-xs font-mono font-bold text-slate-600 w-14 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-all text-slate-500 hover:text-slate-800"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:block h-5 w-px bg-white/10" />

        <div className="hidden lg:flex items-center gap-0.5 bg-white border-slate-200/80 p-0.5 rounded-lg border border-slate-200/50">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setEditorTheme(t.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                editorTheme === t.id
                  ? "bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-md"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {onOpenTemplateModal && (
          <button
            onClick={onOpenTemplateModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border-slate-200/80 border border-slate-200/50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all text-[10px] font-bold uppercase tracking-wider"
          >
            <Layers className="w-3.5 h-3.5 text-accent-indigo" />
            Şablonlar
          </button>
        )}

        <div className="hidden sm:block h-5 w-px bg-white/10" />

        <button
          onClick={() => setGridVisible(!gridVisible)}
          className={cn(
            "p-2 rounded-lg transition-all hidden sm:block",
            gridVisible ? "bg-primary-600/20 text-primary-400 glow-primary" : "hover:bg-slate-100 text-slate-500"
          )}
          title="Grid Göster/Gizle"
        >
          <Grid className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setShowShortcuts(true)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hidden sm:block transition-all"
          title="Klavye Kısayolları"
        >
          <Keyboard className="w-4.5 h-4.5" />
        </button>

        {/* Shortcuts Modal */}
        {showShortcuts && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowShortcuts(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border-slate-200 rounded-2xl shadow-2xl z-[70] overflow-hidden border border-white/10 animate-fade-in">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-accent-indigo" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800">Klavye Kısayolları</h3>
                </div>
                <button onClick={() => setShowShortcuts(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 gap-1.5 max-h-[60vh] overflow-y-auto">
                {shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 hover:bg-slate-100/50 rounded-lg transition-colors">
                    <span className="text-xs font-medium text-slate-600">{s.desc}</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-md text-[10px] font-mono font-bold text-slate-600">{s.key}</kbd>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-200 text-center">
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="px-6 py-2 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-lg"
                >
                  Anladım
                </button>
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => setIsPreview(!isPreview)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-semibold text-xs border",
            isPreview
              ? "bg-accent-indigo text-white border-accent-indigo"
              : "hover:bg-slate-100 text-slate-600 border-slate-200/50"
          )}
        >
          {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden md:inline">{isPreview ? 'Düzenle' : 'Önizle'}</span>
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              if (!isPro) {
                router.push('/dashboard/upgrade');
              } else if (onOpenExportModal) {
                onOpenExportModal();
              } else {
                setShowExport(!showExport);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all font-bold text-xs shadow-lg shrink-0",
              isPro 
                ? "bg-gradient-to-r from-accent-indigo to-accent-violet text-white hover:opacity-90 glow-accent"
                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
            )}
          >
            {isPro ? <Download className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />}
            <span className="hidden sm:inline">{isPro ? 'Dışa Aktar' : 'Plus\'a Yükselt'}</span>
            {!isPro && <span className="ml-1 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-lg glow-accent">PRO</span>}
          </button>

          {isPro && showExport && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border-slate-200 rounded-xl shadow-2xl z-50 p-2 border border-white/10 animate-fade-in">
                <button
                  onClick={() => { exportImage('png'); setShowExport(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/50 rounded-lg transition-colors text-left"
                >
                  <FileImage className="w-4 h-4 text-primary-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">PNG</div>
                    <div className="text-[10px] text-slate-500">Yüksek çözünürlük</div>
                  </div>
                </button>
                <button
                  onClick={() => { exportImage('jpeg'); setShowExport(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/50 rounded-lg transition-colors text-left"
                >
                  <FileImage className="w-4 h-4 text-safety-amber" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">JPEG</div>
                    <div className="text-[10px] text-slate-500">Web paylaşım</div>
                  </div>
                </button>
                <button
                  onClick={() => { exportPdf(); setShowExport(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/50 rounded-lg transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-safety-red" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">PDF</div>
                    <div className="text-[10px] text-slate-500">A3 Baskıya Hazır</div>
                  </div>
                </button>
               </div>
             </>
          )}
        </div>
      </div>
    </header>
  );
}
