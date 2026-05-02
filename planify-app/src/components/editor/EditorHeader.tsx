'use client';

import { ZoomOut, ZoomIn, Grid, Undo2, Redo2,
  Keyboard, X, Eye, EyeOff, Download, FileImage, FileText, Layers, Pencil, Check, Sparkles, ArrowLeft, Moon, Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useProAccess } from '@/hooks/useProAccess';
import { Logo } from '@/components/shared/Logo';
import { useState, useRef } from 'react';
import type { EditorTheme } from '@/types/editor';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface EditorHeaderProps {
  projectId: string | null;
  isPreview: boolean;
  setIsPreview: (v: boolean) => void;
  exportImage: (format: 'png' | 'jpeg') => void;
  exportPdf: () => void;
  onOpenTemplateModal?: () => void;
  onOpenExportModal?: () => void;
  mobileMenu: 'tools' | 'properties' | null;
  setMobileMenu: (m: 'tools' | 'properties' | null) => void;
}

export function EditorHeader({ 
  projectId, isPreview, setIsPreview, exportImage, exportPdf, 
  onOpenTemplateModal, onOpenExportModal, mobileMenu, setMobileMenu
}: EditorHeaderProps) {
  const {
    zoom, setZoom, gridVisible, setGridVisible, undo, redo, canUndo, canRedo,
    scaleConfig, setScaleConfig, editorTheme, setEditorTheme
  } = useEditorStore();
  const { projects, updateProject } = useProjectStore();
  const { isPro } = useProAccess();
  
  const project = projects.find(p => p.id === projectId);
  
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState(project?.title || '');
  const isHandlingRename = useRef(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

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
    <header className="h-12 bg-surface-900 border-surface-600 border-b flex items-center justify-between px-2 md:px-5 z-40 shrink-0 relative transition-colors">
      {/* Left section */}
      <div className="flex items-center gap-1 md:gap-4 min-w-0">
        <button
          onClick={() => setMobileMenu(mobileMenu === 'tools' ? null : 'tools')}
          className="md:hidden p-2 hover:bg-surface-700 rounded-lg text-surface-400"
          title="Menüyü Aç"
        >
          <Layers className={cn("w-5 h-5 transition-colors", mobileMenu === 'tools' ? "text-primary-500" : "text-surface-400")} />
        </button>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-surface-200 transition-all group flex items-center gap-1.5 shrink-0"
          title="Dashboard'a Dön"
        >
          <ArrowLeft className="w-4 h-4 md:w-4.5 md:h-4.5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-1 md:gap-2.5 min-w-0">
          <Logo size="xs" showText={false} className="sm:hidden" />
          <Logo size="sm" showText={true} className="hidden sm:flex" />
          {isPro ? (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-primary-500/10 text-primary-500 text-[8px] font-black uppercase tracking-wider border border-primary-500/20">Plus</span>
          ) : (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-surface-700 text-surface-300 text-[8px] font-black uppercase tracking-wider border border-surface-600">Free</span>
          )}
          
          <div className="h-5 w-px bg-surface-600 mx-1 hidden sm:block" />

          {isRenaming ? (
            <div className="flex items-center gap-1.5 bg-surface-950 border border-primary-500 rounded-lg px-2 py-1 shadow-sm animate-fade-in">
              <input
                autoFocus
                aria-label="Proje adini duzenle"
                className="bg-transparent border-none rounded px-2 py-1 text-xs font-bold text-surface-200 outline-none w-36 md:w-52"
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
              <button 
                onClick={handleRename} 
                className="text-safety-green hover:bg-safety-green/20 p-1 rounded transition-colors"
                title="Kaydet"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setIsRenaming(false); setTempTitle(project?.title || ''); }}
                className="text-surface-400 hover:bg-surface-700 p-1 rounded transition-colors"
                title="İptal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Proje adini yeniden adlandir"
              className="group flex items-center gap-2 rounded-lg px-2 py-1 transition-all hover:bg-surface-800 border border-transparent hover:border-surface-600"
              onClick={() => {
                setTempTitle(project?.title || '');
                isHandlingRename.current = false;
                setIsRenaming(true);
              }}
            >
              <span className="text-xs font-bold text-surface-200 max-w-[80px] xs:max-w-[120px] md:max-w-[200px] truncate">
                {project?.title || 'Yeni Proje'}
              </span>
              <Pencil className="w-3 h-3 text-surface-400 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          )}
        </div>



        <div className="hidden lg:flex items-center gap-3 text-surface-400">
          <div className="flex items-center gap-0.5">
            <button
              disabled={!canUndo}
              onClick={undo}
              className="p-2 hover:bg-surface-700 rounded-lg disabled:opacity-20 transition-all"
              title="Geri Al (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              disabled={!canRedo}
              onClick={redo}
              className="p-2 hover:bg-surface-700 rounded-lg disabled:opacity-20 transition-all"
              title="İleri Al (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Unit Switcher - mm/cm/m */}
          <div className="hidden lg:flex items-center gap-0.5 bg-surface-950 p-0.5 rounded-lg border border-surface-600 ml-2">
            {(['mm', 'cm', 'm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setScaleConfig({ ...scaleConfig, unit: u })}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                  scaleConfig.unit === u
                    ? "bg-primary-500 text-white"
                    : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
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
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-surface-200 transition-all"
          title="Temayı Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        <div className="hidden sm:block h-5 w-px bg-surface-600" />

        <div className="hidden xs:flex items-center bg-surface-950 rounded-lg p-0.5 border border-surface-600">
          <button
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            className="p-1.5 hover:bg-surface-800 rounded-md transition-all text-surface-400 hover:text-surface-200"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 text-[10px] md:text-xs font-mono font-bold text-surface-300 w-10 md:w-14 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(5, zoom + 0.1))}
            className="p-1.5 hover:bg-surface-800 rounded-md transition-all text-surface-400 hover:text-surface-200"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden sm:block h-5 w-px bg-surface-600" />

        <div className="hidden lg:flex items-center gap-0.5 bg-surface-950 p-0.5 rounded-lg border border-surface-600">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setEditorTheme(t.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                editorTheme === t.id
                  ? "bg-primary-500 text-white"
                  : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {onOpenTemplateModal && (
          <button
            onClick={onOpenTemplateModal}
            className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-950 border border-surface-600 hover:border-surface-500 hover:bg-surface-800 text-surface-200 transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
          >
            <Layers className="w-3.5 h-3.5 text-primary-500" />
            <span className="hidden md:inline">Şablonlar</span>
          </button>
        )}

        <div className="hidden sm:block h-5 w-px bg-surface-600" />

        <button
          onClick={() => setGridVisible(!gridVisible)}
          className={cn(
            "p-2 rounded-lg transition-all hidden sm:block",
            gridVisible ? "bg-primary-500/20 text-primary-400" : "hover:bg-surface-800 text-surface-400"
          )}
          title="Grid Göster/Gizle"
        >
          <Grid className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setShowShortcuts(true)}
          className="p-2 hover:bg-surface-800 rounded-lg text-surface-400 hidden sm:block transition-all"
          title="Klavye Kısayolları"
        >
          <Keyboard className="w-4.5 h-4.5" />
        </button>

        {/* Shortcuts Modal (VS Code styled) */}
        {showShortcuts && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowShortcuts(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-surface-900 border border-surface-500 rounded-md shadow-2xl z-[70] overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-600 bg-surface-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-surface-200" />
                  <h3 className="font-medium text-sm text-surface-200">Klavye Kısayolları</h3>
                </div>
                <button onClick={() => setShowShortcuts(false)} className="text-surface-400 hover:text-surface-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 gap-1.5 max-h-[60vh] overflow-y-auto">
                {shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 hover:bg-surface-800 rounded-md transition-colors">
                    <span className="text-xs font-medium text-surface-200">{s.desc}</span>
                    <kbd className="px-2 py-1 bg-surface-950 border border-surface-600 rounded text-[10px] font-mono text-surface-300">{s.key}</kbd>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-surface-600 flex justify-end">
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded text-xs font-medium transition-all"
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
            "flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded transition-all font-bold text-[10px] border",
            isPreview
              ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20"
              : "bg-surface-950 hover:bg-surface-800 text-surface-200 border-surface-600"
          )}
        >
          {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isPreview ? 'DÜZENLE' : 'ÖNİZLE'}</span>
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
              "flex items-center gap-2 px-3 md:px-4 py-1.5 rounded transition-all font-bold text-[10px] border shrink-0",
              isPro 
                ? "bg-primary-500 text-white hover:bg-primary-600 border-primary-500 shadow-lg shadow-primary-500/20"
                : "bg-surface-950 text-surface-200 border-surface-600 hover:bg-surface-800"
            )}
          >
            {isPro ? <Download className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-primary-500" />}
            <span className="hidden xs:inline">{isPro ? 'YAYINLA' : 'PLUS'}</span>
            {!isPro && <span className="hidden sm:inline-block ml-1 bg-primary-600 text-white text-[8px] px-1.5 py-0.5 rounded-sm">PRO</span>}
          </button>

          {isPro && showExport && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-900 border border-surface-600 rounded-md shadow-2xl z-50 p-1 animate-fade-in">
                <button
                  onClick={() => { exportImage('png'); setShowExport(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-800 rounded transition-colors text-left"
                >
                  <FileImage className="w-4 h-4 text-primary-400" />
                  <div>
                    <div className="text-xs font-medium text-surface-200">PNG</div>
                    <div className="text-[10px] text-surface-400">Yüksek çözünürlük</div>
                  </div>
                </button>
                <button
                  onClick={() => { exportImage('jpeg'); setShowExport(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-800 rounded transition-colors text-left"
                >
                  <FileImage className="w-4 h-4 text-safety-amber" />
                  <div>
                    <div className="text-xs font-medium text-surface-200">JPEG</div>
                    <div className="text-[10px] text-surface-400">Web paylaşım</div>
                  </div>
                </button>
                <button
                  onClick={() => { exportPdf(); setShowExport(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-800 rounded transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-safety-red" />
                  <div>
                    <div className="text-xs font-medium text-surface-200">PDF</div>
                    <div className="text-[10px] text-surface-400">A3 Baskıya Hazır</div>
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

