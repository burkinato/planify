import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import { ImageUp, Trash2, Move } from 'lucide-react';
import { ISO_SYMBOLS } from '@/lib/editor/isoSymbols';
import { calculateModuleSnap } from '@/lib/editor/moduleSnapping';
import { SYMBOLS, type EditorElement, type TemplateRegion } from '@/types/editor';
import { TRANSLATIONS } from '@/lib/editor/translations';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

const ISO_HEADER_GREEN = '#008F4C';

function clampNumber(value: number | undefined, min: number, max: number) {
  if (value === undefined || !Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export interface ModuleOverlayProps {
  paperRegions: TemplateRegion[];
  mergedTemplateState: any;
  isPreview: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stageHostRef: React.RefObject<HTMLDivElement | null>;
  isLogoLoading: boolean;
  uploadingRegionId: string | null;
  projectMetadata: { logoUrl?: string };
  setProjectMetadata: (data: { logoUrl?: string }) => void;
  handleModuleResizePointerDown: (e: React.PointerEvent<HTMLDivElement>, regionId: string) => void;
  handleProjectLogoUpload: (file: File | null) => Promise<void>;
  handleRegionImageUpload: (regionId: string, file: File | null) => Promise<void>;
  clearRegionImage: (regionId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logoFileInputRef: React.RefObject<HTMLInputElement | null>;
  visibleElements: EditorElement[];
}

export function ModuleOverlay({
  paperRegions,
  mergedTemplateState,
  isPreview,
  stageHostRef,
  isLogoLoading,
  uploadingRegionId,
  projectMetadata,
  setProjectMetadata,
  handleModuleResizePointerDown,
  handleProjectLogoUpload,
  handleRegionImageUpload,
  clearRegionImage,
  logoFileInputRef,
  visibleElements
}: ModuleOverlayProps) {
  const {
    templateModules: activeTemplateModules,
    focusedRegionId,
    setFocusedRegionId,
    selectedTemplateModuleId,
    setSelectedTemplateModuleId,
    updateTemplateModule,
    updateTemplateRegion,
    removeTemplateModule,
    templateState,
    selectedIds,
    setSelectedIds,
    language,
    setModuleSnapLines,
  } = useEditorStore();

  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const t = TRANSLATIONS[language || 'tr'];

  const handleDragPointerDown = (event: React.PointerEvent<HTMLDivElement>, regionId: string) => {
    const templateModule = activeTemplateModules.find(m => m.id === regionId);
    const paperNode = stageHostRef.current;
    if (!templateModule || !paperNode || templateModule.movable === false || isPreview) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedTemplateModuleId(regionId);

    const paperRect = paperNode.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startModX = templateModule.x;
    const startModY = templateModule.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / paperRect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / paperRect.height) * 100;
      
      const res = calculateModuleSnap(
        'drag', '',
        startModX + deltaX, startModY + deltaY,
        templateModule.w, templateModule.h,
        activeTemplateModules, regionId
      );

      setModuleSnapLines(res.lines);
      updateTemplateModule(regionId, { x: res.x, y: res.y });
    };

    const handlePointerUp = () => {
      setModuleSnapLines([]);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    regionId: string,
    direction: string
  ) => {
    const templateModule = activeTemplateModules.find(m => m.id === regionId);
    const paperNode = stageHostRef.current;
    if (!templateModule || !paperNode || templateModule.resizable === false || isPreview) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedTemplateModuleId(regionId);

    const paperRect = paperNode.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = templateModule.w;
    const startH = templateModule.h;
    const startModX = templateModule.x;
    const startModY = templateModule.y;
    const aspect = startW / startH;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      let deltaW = ((moveEvent.clientX - startX) / paperRect.width) * 100;
      let deltaH = ((moveEvent.clientY - startY) / paperRect.height) * 100;
      
      let newW = startW;
      let newH = startH;
      let newX = startModX;
      let newY = startModY;

      // Apply direction modifiers
      if (direction.includes('e')) newW = startW + deltaW;
      if (direction.includes('s')) newH = startH + deltaH;
      if (direction.includes('w')) {
        newW = startW - deltaW;
        newX = startModX + deltaW;
      }
      if (direction.includes('n')) {
        newH = startH - deltaH;
        newY = startModY + deltaH;
      }

      // Shift key for proportional scale
      if (moveEvent.shiftKey) {
         if (direction.length === 2) { // Corner handles
           if (Math.abs(newW / aspect) > Math.abs(newH)) {
              newH = newW / aspect;
           } else {
              newW = newH * aspect;
           }
           // adjust x/y if needed
           if (direction.includes('w')) newX = startModX + (startW - newW);
           if (direction.includes('n')) newY = startModY + (startH - newH);
         }
      }

      if (newW < 2) { newW = 2; if (direction.includes('w')) newX = startModX + startW - 2; }
      if (newH < 2) { newH = 2; if (direction.includes('n')) newY = startModY + startH - 2; }

      const res = calculateModuleSnap(
        'resize', direction,
        newX, newY, newW, newH,
        activeTemplateModules, regionId
      );

      setModuleSnapLines(res.lines);
      updateTemplateModule(regionId, { x: res.x, y: res.y, w: res.w, h: res.h });
    };

    const handlePointerUp = () => {
      setModuleSnapLines([]);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };


  return (
    <>
      {/* Non-drawing regions (header, instruction, etc.) */}
      {paperRegions.filter((region) => region.type !== 'drawing').map((region) => {
        const content = mergedTemplateState[region.id] || {};
        const selectedTemplateModule = selectedTemplateModuleId === region.id;
        const focused = focusedRegionId === region.id || selectedTemplateModule;
        const dimmed = !!focusedRegionId && !focused;
        const moduleInstance = activeTemplateModules.find((module) => module.id === region.id);
        const regionIdNormalized = (region.id || '').toLowerCase();
        const regionLabelNormalized = (region.label || '').toLocaleLowerCase('tr-TR');
        const isHeader = (
          region.type === 'header'
          || regionIdNormalized.includes('header')
          || regionIdNormalized.includes('baslik')
          || regionIdNormalized.includes('title')
          || regionLabelNormalized.includes('başlık')
          || regionLabelNormalized.includes('duyuru')
          || regionLabelNormalized.includes('tahliye planı')
        );
        const tone = region.tone || 'neutral';
        const toneClass =
          tone === 'red' ? 'border-red-100 bg-white shadow-md shadow-red-900/5' :
            tone === 'blue' ? 'border-blue-100 bg-white shadow-md shadow-blue-900/5' :
              tone === 'info' ? 'border-slate-200 bg-white shadow-sm' :
                tone === 'green' ? 'border-emerald-100 bg-white shadow-md shadow-emerald-900/5' :
                  'border-slate-200 bg-white shadow-sm';
        const headerTitleSize = clampNumber(content.titleSize, 24, 48);
        const headerTitleSpacing = clampNumber(content.titleLetterSpacing, 0, 8);
        const headerMetaSize = clampNumber(content.metaSize, 9, 20);
        const headerMetaSpacing = clampNumber(content.metaLetterSpacing, 0, 4);
        
        return (
          <section
            key={region.id}
            onClick={(event) => {
              event.stopPropagation();
              if (selectedIds.length > 0) setSelectedIds([]);
              setFocusedRegionId(region.id);
              setSelectedTemplateModuleId(region.id);
            }}
            className={cn(
              "absolute border box-border",
              !focused && !selectedTemplateModule && "overflow-hidden",
              isHeader ? "border-none" : "rounded-[12px]",
              !isHeader && toneClass,
              focused && (isHeader
                ? "z-30 shadow-[0_16px_36px_rgba(5,150,105,0.22)] ring-4 ring-emerald-500/35 border-emerald-500"
                : "z-30 shadow-[0_16px_36px_rgba(8,145,178,0.22)] ring-4 ring-cyan-500/30 border-cyan-500"),
              selectedTemplateModule && "outline outline-2 outline-offset-2 outline-cyan-400/80",
              dimmed && "pointer-events-none opacity-25 grayscale",
              !focused && "cursor-pointer hover:shadow-lg hover:border-cyan-400",
              "data-[export-mode=true]:shadow-none data-[export-mode=true]:ring-0"
            )}
            style={{
              left: isHeader ? `${region.x}%` : `calc(${region.x}% + 6px)`,
              top: isHeader ? `${region.y}%` : `calc(${region.y}% + 6px)`,
              width: isHeader ? `${region.w}%` : `calc(${region.w}% - 12px)`,
              height: isHeader ? `${region.h}%` : `calc(${region.h}% - 12px)`,
              zIndex: focused ? (isHeader ? 80 : 40) : undefined,
              background: isHeader ? ISO_HEADER_GREEN : undefined,
            }}
          >
            {!isPreview && selectedTemplateModule && (
              <>
                {/* Floating toolbar above the module */}
                <div className="absolute -top-11 left-0 right-0 z-50 flex items-center justify-between pointer-events-none">
                  {/* Left: Move handle */}
                  {moduleInstance?.movable !== false ? (
                    <div
                      onPointerDown={(event) => handleDragPointerDown(event, region.id)}
                      className="pointer-events-auto h-8 w-8 flex items-center justify-center cursor-move rounded-lg border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-slate-600 hover:text-cyan-600 hover:border-cyan-400 hover:shadow-[0_4px_16px_rgba(8,145,178,0.2)] transition-all"
                      title="Taşı (Tutup Sürükleyin)"
                    >
                      <Move size={16} strokeWidth={2.5} />
                    </div>
                  ) : <div />}
                  {/* Right: Edit + Delete */}
                  <div className="pointer-events-auto flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setFocusedRegionId(region.id); }}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-slate-600 hover:text-cyan-600 hover:border-cyan-400 hover:shadow-[0_4px_16px_rgba(8,145,178,0.2)] transition-all"
                      title="Düzenle"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(region.id); }}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-red-400 hover:text-red-600 hover:border-red-400 hover:bg-red-50 hover:shadow-[0_4px_16px_rgba(239,68,68,0.2)] transition-all"
                      title="Modülü Sil"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {moduleInstance?.resizable !== false && (
                  <>
                    {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map(dir => {
                      const positions: Record<string, string> = {
                        nw: '-top-1.5 -left-1.5 cursor-nwse-resize',
                        n: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                        ne: '-top-1.5 -right-1.5 cursor-nesw-resize',
                        e: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize',
                        se: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                        s: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                        sw: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                        w: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize'
                      };
                      return (
                        <div
                          key={dir}
                          onPointerDown={(event) => handleResizePointerDown(event, region.id, dir)}
                          className={cn(
                            "absolute z-50 h-3.5 w-3.5 rounded-full border-2 border-white bg-cyan-500 shadow-md hover:scale-125 transition-transform",
                            positions[dir]
                          )}
                          title={dir.length === 2 ? "Shift ile orantılı ölçeklendir" : "Boyutlandır"}
                        />
                      );
                    })}
                  </>
                )}
              </>
            )}
            
            {/* Context Menu / Form for editing (only when focused) */}
            {!isPreview && focused && (
              <div
                className={cn(
                  "flex flex-col bg-white animate-fade-in relative z-10",
                  isHeader
                    ? "absolute left-0 top-full mt-3 w-[min(520px,92vw)] max-h-[70vh] rounded-2xl border border-emerald-200 shadow-2xl overflow-hidden"
                    : "h-full overflow-hidden"
                )}
              >
                <div className={cn(
                  "flex items-center justify-between p-3 border-b shrink-0",
                  isHeader ? "bg-emerald-50 border-emerald-100" :
                  tone === 'red' ? "bg-red-50 border-red-100" :
                  tone === 'blue' ? "bg-blue-50 border-blue-100" :
                  tone === 'green' ? "bg-emerald-50 border-emerald-100" :
                  "bg-slate-50 border-slate-200"
                )}>
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                    isHeader ? "text-emerald-700" :
                    tone === 'red' ? "text-red-600" :
                    tone === 'blue' ? "text-blue-600" :
                    tone === 'green' ? "text-emerald-600" :
                    "text-slate-500"
                  )}>
                    <div className={cn("w-1.5 h-3 rounded-full", 
                      isHeader ? "bg-emerald-600" :
                      tone === 'red' ? "bg-red-500" : 
                      tone === 'blue' ? "bg-blue-500" : 
                      tone === 'green' ? "bg-emerald-500" : 
                      "bg-slate-400"
                    )} />
                    {isHeader ? (language === 'en' ? 'HEADER SETTINGS' : 'ŞABLON BAŞLIĞI') : region.label}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFocusedRegionId(null); }} 
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" onWheel={(e) => e.stopPropagation()}>
                  {isHeader ? (
                    <>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">{t.modules.Header.title}</p>
                        <p className="mt-1 text-[10px] font-semibold text-emerald-700/80">ISO 7010 / ISO 23601 uyumlu başlık rengi güvenlik yeşili olarak sabitlenmiştir.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{language === 'en' ? 'Footer Text' : 'Alt Bilgi'}</label>
                        <input
                          value={content.meta || ''}
                          onChange={(event) => updateTemplateRegion(region.id, { meta: event.target.value.toUpperCase() })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-black uppercase tracking-wide text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                          placeholder={language === 'en' ? 'E.G. 1ST FLOOR' : "ORN: 1. NORMAL KAT"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{language === 'en' ? 'Logo' : 'Başlık Logosu'}</label>
                        {projectMetadata.logoUrl && (
                          <div className="relative h-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                            <img src={projectMetadata.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-100">
                            <ImageUp className="h-4 w-4" />
                            {isLogoLoading ? '...' : (language === 'en' ? 'SELECT LOGO' : 'LOGO SEÇ')}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isLogoLoading}
                              onChange={(event) => {
                                void handleProjectLogoUpload(event.target.files?.[0] || null);
                                event.currentTarget.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setProjectMetadata({ logoUrl: '' })}
                            disabled={!projectMetadata.logoUrl}
                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                            {language === 'en' ? 'REMOVE' : 'KALDIR'}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{language === 'en' ? 'Title' : 'Başlık'}</label>
                        <input
                          value={content.title || ''}
                          onChange={(event) => updateTemplateRegion(region.id, { title: event.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-black uppercase tracking-wide text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-sm"
                          placeholder={region.label}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{language === 'en' ? 'Content' : 'İçerik'}</label>
                        <textarea
                          value={content.body || ''}
                          onChange={(event) => updateTemplateRegion(region.id, { body: event.target.value })}
                          onWheel={(e) => e.stopPropagation()}
                          rows={4}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-bold leading-relaxed text-slate-700 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-sm min-h-[100px]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Main Content Display (Visible even when not focused) */}
            <div className={cn(
              "pointer-events-none w-full h-full flex items-center relative",
              isHeader ? "" : "flex-col overflow-hidden"
            )} style={{ containerType: 'size' } as React.CSSProperties}>
              
              {isHeader ? (
                <>
                  <div className="h-full aspect-square flex items-center justify-center bg-white/10 border-r border-white/10 overflow-hidden">
                    {projectMetadata.logoUrl ? (
                      <img src={projectMetadata.logoUrl} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
                    ) : (
                      <svg className="w-1/2 h-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-[3cqw] overflow-hidden">
                    <div
                      className="w-full text-center uppercase text-white truncate"
                      style={{
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: headerTitleSize ? `${headerTitleSize}px` : 'clamp(24px, 3.2cqw, 44px)',
                        fontWeight: 800,
                        letterSpacing: `${headerTitleSpacing ?? 4}px`,
                        lineHeight: 1.05,
                        textShadow: '0 1px 0 rgba(0,0,0,0.24)',
                      }}
                    >
                      {content.title || t.modules.Header.title}
                    </div>
                    <div
                      className="w-full text-center uppercase text-white/90 truncate mt-1"
                      style={{
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: 'clamp(10px, 1.2cqw, 16px)',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        lineHeight: 1,
                      }}
                    >
                      {content.body || t.modules.Header.sub}
                    </div>
                    {!!content.meta?.trim() && (
                      <div
                        className="w-full text-center uppercase text-white truncate mt-[0.7cqh]"
                        style={{
                          fontFamily: 'Arial, Helvetica, sans-serif',
                          fontSize: headerMetaSize ? `${headerMetaSize}px` : 'clamp(9px, 1.1cqw, 14px)',
                          fontWeight: 700,
                          letterSpacing: `${headerMetaSpacing ?? 0.5}px`,
                          lineHeight: 1.15,
                        }}
                      >
                        {content.meta}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="shrink-0 p-[3cqmin] w-full">
                    <div className={cn(
                      "font-black uppercase tracking-widest rounded-xl flex items-center px-[3cqmin] py-[2.5cqmin] gap-[2cqmin]",
                      tone === 'red' ? "text-white bg-gradient-to-r from-red-600 to-red-500 shadow-md shadow-red-500/20" :
                      tone === 'blue' ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/20" :
                      tone === 'green' ? "text-white bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md shadow-emerald-500/20" :
                      "text-slate-700 bg-slate-100 shadow-inner border border-slate-200/60"
                    )}
                    style={{
                      fontSize: content.titleSize ? `${content.titleSize}px` : 'max(8px, min(3.5cqw, 15cqh))',
                      fontWeight: content.titleWeight || 'black',
                    }}>
                      {content.title || (t.modules[region.type as keyof typeof t.modules] as any)?.title || region.label}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-0 flex flex-col px-[3cqmin] pb-[3cqmin] overflow-hidden w-full">
                    {region.type === 'legend' ? (
                      <div className="flex-1 w-full overflow-hidden flex flex-wrap gap-y-[3cqh] gap-x-[5cqw] content-start pt-[2cqh]">
                        {visibleElements.some((el: EditorElement) => el.type === 'route' && el.routeType === 'evacuation') && (
                          <div className="flex items-center gap-[3cqw] w-[45%] shrink-0">
                            <div className="w-[18cqw] max-w-[2.5cqh] aspect-square flex items-center justify-center bg-emerald-100 rounded-sm">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" className="w-3/4 h-3/4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </div>
                            <span className="font-bold text-slate-700 leading-tight flex-1 truncate" style={{ fontSize: 'max(11px, min(4cqw, 14cqh))' }}>
                              {language === 'en' ? 'Evacuation Route' : 'Tahliye Yolu'}
                            </span>
                          </div>
                        )}
                        {visibleElements.some((el: EditorElement) => el.type === 'route' && el.routeType === 'rescue') && (
                          <div className="flex items-center gap-[3cqw] w-[45%] shrink-0">
                            <div className="w-[18cqw] max-w-[2.5cqh] aspect-square flex items-center justify-center bg-red-100 rounded-sm">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" className="w-3/4 h-3/4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </div>
                            <span className="font-bold text-slate-700 leading-tight flex-1 truncate" style={{ fontSize: 'max(11px, min(4cqw, 14cqh))' }}>
                              {language === 'en' ? 'Rescue Route' : 'Kurtarma Yolu'}
                            </span>
                          </div>
                        )}
                        {Array.from(new Set(visibleElements.filter((el: EditorElement) => el.type === 'symbol' && el.symbolType).map((el: EditorElement) => el.symbolType as string))).map((id: string) => {
                          const isCustom = id.startsWith('data:') || id.startsWith('http');
                          const symDef = SYMBOLS.find((s) => s.id === id);
                          const translatedName = language === 'en' ? (symDef?.nameEn || symDef?.name || id) : (symDef?.name || id);
                          const name = isCustom ? 'Özel Sembol' : translatedName;
                          const src = isCustom ? id : (ISO_SYMBOLS[id] || ISO_SYMBOLS[id.toUpperCase()] || null);
                          if (!src) return null;
                          return (
                            <div key={id} className="flex items-center gap-[3cqw] w-[45%] shrink-0">
                              <img src={src} alt={name} className="w-[18cqw] max-w-[2.5cqh] aspect-square object-contain shadow-sm rounded-sm bg-white" />
                              <span className="font-bold text-slate-700 leading-tight flex-1 truncate" style={{ fontSize: 'max(11px, min(4cqw, 14cqh))' }}>{name}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : region.type === 'emergency' ? (
                      <div className="flex-1 min-h-0 flex items-center gap-[4cqmin] rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-[4cqmin] shadow-inner">
                        <div className="flex h-[22cqmin] w-[22cqmin] shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/20">
                          <span className="font-black leading-none" style={{ fontSize: 'max(14px, min(8cqmin, 18cqh))' }}>112</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black uppercase tracking-tight text-red-700 leading-none" style={{ fontSize: 'max(10px, min(4.8cqw, 16cqh))' }}>
                            {content.title || t.modules.EmergencyCall.title}
                          </p>
                          <p className="mt-[1.5cqmin] font-bold leading-snug text-slate-700" style={{ fontSize: 'max(8px, min(3.4cqw, 9cqh))' }}>
                            {content.body || t.modules.EmergencyCall.body}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line font-bold text-slate-700 leading-[1.3]" style={{ fontSize: 'max(11px, min(4cqw, 14cqh))' }}>
                        {content.body}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        );
      })}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            removeTemplateModule(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title="Modülü Sil"
        message="Bu modülü silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
      />
    </>
  );
}
