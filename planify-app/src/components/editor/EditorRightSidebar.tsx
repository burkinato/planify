'use client';

import { useState, useRef } from 'react';
import {
  Layers, Trash2, MousePointer2, Plus, Settings2, Bold, FileDown, FileUp,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore, useShallow } from '@/store/useEditorStore';
import { TypographyPanel } from './TypographyPanel';
import { SYMBOLS } from '@/types/editor';
import { LayerManager } from './LayerManager';
import { mergeTemplateState } from '@/lib/editor/templateLayouts';

interface EditorRightSidebarProps {
  mobileMenu: 'tools' | 'properties' | null;
  setMobileMenu: (m: 'tools' | 'properties' | null) => void;
}

export function EditorRightSidebar({ mobileMenu, setMobileMenu }: EditorRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'props' | 'layers'>('props');
  const {
    elements, selectedIds, removeElements, updateElement, scaleConfig, loadProject, layers,
    activeTemplateLayout, focusedRegionId, templateState, updateTemplateRegion, setFocusedRegionId,
    projectMetadata, setProjectMetadata, advancedType, setAdvancedType
  } = useEditorStore(useShallow((s) => ({
    elements: s.elements,
    selectedIds: s.selectedIds,
    removeElements: s.removeElements,
    updateElement: s.updateElement,
    scaleConfig: s.scaleConfig,
    loadProject: s.loadProject,
    layers: s.layers,
    activeTemplateLayout: s.activeTemplateLayout,
    focusedRegionId: s.focusedRegionId,
    templateState: s.templateState,
    updateTemplateRegion: s.updateTemplateRegion,
    setFocusedRegionId: s.setFocusedRegionId,
    projectMetadata: s.projectMetadata,
    setProjectMetadata: s.setProjectMetadata,
    advancedType: s.advancedType,
    setAdvancedType: s.setAdvancedType,
  })));
  const fileInputRef = useRef<HTMLInputElement>(null);


  const selectedElement = selectedIds.length === 1 ? elements.find(e => e.id === selectedIds[0]) : null;
  const focusedRegion = activeTemplateLayout?.layout_json.regions.find((region) => region.id === focusedRegionId);
  const focusedRegionState = focusedRegion ? mergeTemplateState(templateState)[focusedRegion.id] : null;

  const saveProject = () => {
    const data = {
      elements,
      scaleConfig,
      layers,
      templateLayoutId: activeTemplateLayout?.id || null,
      projectTemplate: activeTemplateLayout?.slug || 'blank',
      pagePreset: activeTemplateLayout?.page_preset,
      templateState,
      projectMetadata,
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planify-proje-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      loadProject(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className={cn(
      "fixed md:static inset-y-0 right-0 w-72 bg-white/80 backdrop-blur-xl border-l border-slate-200/60 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.05)] z-30 md:z-10 transition-all duration-500",
      mobileMenu === 'properties' ? "translate-x-0" : "translate-x-full md:translate-x-0"
    )}>
      {/* Tabs */}
      <div className="flex p-2 gap-1 bg-white/50 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('props')}
          className={cn(
            "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === 'props' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Özellikler
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={cn(
            "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === 'layers' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Katmanlar ({layers.length})
        </button>
        <button onClick={() => setMobileMenu(null)} className="md:hidden p-1.5 text-slate-500 ml-1">
          <Plus className="rotate-45 w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'layers' ? (
          <LayerManager />
        ) : (
          <div className="flex-1 p-3 overflow-y-auto space-y-4">
            {focusedRegion && focusedRegion.type !== 'drawing' ? (
              <div className="space-y-5 animate-fade-in">
                {/* Region Info Header */}
                <div className={cn(
                  "rounded-xl border p-3 shadow-sm transition-all",
                  focusedRegion.tone === 'red' ? "border-red-100 bg-red-50" : 
                  focusedRegion.tone === 'blue' ? "border-blue-100 bg-blue-50" : 
                  focusedRegion.tone === 'green' ? "border-emerald-100 bg-emerald-50" : 
                  "border-slate-100 bg-slate-50"
                )}>
                  <div className={cn(
                    "text-[9px] font-black uppercase tracking-[0.2em]",
                    focusedRegion.tone === 'red' ? "text-red-800" : 
                    focusedRegion.tone === 'blue' ? "text-blue-800" : 
                    focusedRegion.tone === 'green' ? "text-emerald-800" : 
                    "text-slate-500"
                  )}>
                    {focusedRegion.label}
                  </div>
                  <div className="mt-0.5 text-[8px] font-bold opacity-60 uppercase tracking-widest">{focusedRegion.type} BÖLGESİ</div>
                </div>

                {/* Edit Fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-100 group relative">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Başlık</label>
                      <button 
                        onClick={() => setAdvancedType(advancedType === 'title' ? null : 'title')}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm text-[8px] font-black transition-all",
                          advancedType === 'title' 
                            ? "bg-cyan-500 border-cyan-500 text-white shadow-cyan-200" 
                            : "bg-white border-slate-200 text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50"
                        )}
                      >
                        <SlidersHorizontal className="w-2.5 h-2.5" />
                        {advancedType === 'title' ? 'KAPAT' : 'DÜZENLE'}
                      </button>
                    </div>
                    <input
                      value={focusedRegionState?.title || ''}
                      onChange={(event) => updateTemplateRegion(focusedRegion.id, { title: event.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-[11px] font-black text-slate-800 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all shadow-sm"
                      placeholder={focusedRegion.label}
                    />
                  </div>

                  {/* Body / Content */}
                  {focusedRegion.type !== 'legend' && (
                    <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          {focusedRegion.type === 'header' ? 'Alt Başlık (EN/Detay)' : 'İçerik Detayları'}
                        </label>
                        <button 
                          onClick={() => setAdvancedType(advancedType === 'body' ? null : 'body')}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm text-[8px] font-black transition-all",
                            advancedType === 'body' 
                              ? "bg-cyan-500 border-cyan-500 text-white shadow-cyan-200" 
                              : "bg-white border-slate-200 text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50"
                          )}
                        >
                          <SlidersHorizontal className="w-2.5 h-2.5" />
                          {advancedType === 'body' ? 'KAPAT' : 'DÜZENLE'}
                        </button>
                      </div>
                      <textarea
                        value={focusedRegionState?.body || ''}
                        onChange={(event) => updateTemplateRegion(focusedRegion.id, { body: event.target.value })}
                        className="min-h-[100px] w-full resize-none rounded-xl border border-slate-200 bg-white/50 p-3 text-[12px] font-medium leading-relaxed text-slate-700 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 transition-all shadow-sm placeholder:text-slate-400"
                        placeholder={focusedRegion.type === 'header' ? "Örn: Emergency Evacuation Plan" : "İçeriği girin..."}
                      />
                    </div>
                  )}

                  {/* Meta / Subtext */}
                  {focusedRegion.type !== 'legend' && (focusedRegionState?.meta || focusedRegion.type === 'approval' || focusedRegion.type === 'header') && (
                    <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          {focusedRegion.type === 'header' ? 'Alt Başlık / Kat Bilgisi' : 'Alt Bilgi / Meta'}
                        </label>
                        <button 
                          onClick={() => setAdvancedType(advancedType === 'meta' ? null : 'meta')}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm text-[8px] font-black transition-all",
                            advancedType === 'meta' 
                              ? "bg-cyan-500 border-cyan-500 text-white shadow-cyan-200" 
                              : "bg-white border-slate-200 text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50"
                          )}
                        >
                          <SlidersHorizontal className="w-2.5 h-2.5" />
                          {advancedType === 'meta' ? 'KAPAT' : 'DÜZENLE'}
                        </button>
                      </div>
                      <input
                        value={focusedRegionState?.meta || ''}
                        onChange={(event) => updateTemplateRegion(focusedRegion.id, { meta: event.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-[11px] font-bold text-slate-600 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all shadow-sm"
                        placeholder="Örn: 2. Kat / Rev-01"
                      />
                    </div>
                  )}

                </div>

                <button
                  onClick={() => setFocusedRegionId(null)}
                  className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 shadow-md"
                >
                  Değişiklikleri Kaydet
                </button>

                {/* Typography Panel */}
                <TypographyPanel
                  advancedType={advancedType}
                  setAdvancedType={setAdvancedType}
                  focusedRegion={focusedRegion}
                  focusedRegionState={focusedRegionState}
                  updateTemplateRegion={updateTemplateRegion}
                />
              </div>
            ) : selectedElement ? (
              <div className="space-y-4 animate-fade-in">
                {/* Element Type */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Nesne Tipi</label>
                  <div className="bg-white border-slate-200 border border-slate-200/50 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-800 shadow-sm flex justify-between items-center">
                    <span>{selectedElement.type === 'symbol' ? SYMBOLS.find(s=>s.id === selectedElement.symbolType)?.name : selectedElement.type.toUpperCase()}</span>
                    {selectedElement.type === 'symbol' && <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse-glow" />}
                  </div>
                </div>

                {/* Label Input */}
                {selectedElement.label !== undefined && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Etiket</label>
                    <input
                      type="text"
                      className="w-full text-xs font-bold p-2.5 rounded-lg border border-slate-200/50 bg-white border-slate-200 text-slate-800 focus:border-accent-emerald outline-none transition-all"
                      value={selectedElement.label}
                      onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                      placeholder="Nesne adı girin..."
                    />
                  </div>
                )}

                {/* Physical Dimensions */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Fiziksel Ölçüler</label>
                  
                  {selectedElement.type === 'rect' && (
                    <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl space-y-1 mb-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-accent-emerald uppercase tracking-widest">
                        <span>Tahmini Alan</span>
                        <span className="text-sm">
                          {((selectedElement.width! / scaleConfig.pixelsPerMeter) * (selectedElement.height! / scaleConfig.pixelsPerMeter)).toFixed(1)} {scaleConfig.unit}²
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Point-based elements (wall, window, door, route) */}
                  {['wall', 'window', 'door', 'route'].includes(selectedElement.type) && selectedElement.points && selectedElement.points.length >= 4 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs px-1">
                        <span className="text-slate-600 font-bold">Uzunluk</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.1" 
                            className="w-20 text-right bg-white text-slate-800 p-2 rounded-lg border border-slate-200 focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald outline-none transition-all"
                            value={Number((Math.sqrt((selectedElement.points[0] - selectedElement.points[2])**2 + (selectedElement.points[1] - selectedElement.points[3])**2) / scaleConfig.pixelsPerMeter).toFixed(2))}
                            onChange={(e) => {
                              const newMeters = parseFloat(e.target.value);
                              if (isNaN(newMeters) || newMeters <= 0) return;
                              const pts = selectedElement.points as number[];
                              const newPixels = newMeters * scaleConfig.pixelsPerMeter;
                              const angle = Math.atan2(pts[3] - pts[1], pts[2] - pts[0]);
                              updateElement(selectedElement.id, {
                                points: [pts[0], pts[1], pts[0] + Math.cos(angle) * newPixels, pts[1] + Math.sin(angle) * newPixels]
                              });
                            }}
                          />
                          <span className="text-slate-400 font-black">{scaleConfig.unit}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Box-based elements (rect, stairs, elevator, column, symbol) */}
                  {['rect', 'stairs', 'elevator', 'column', 'symbol'].includes(selectedElement.type) && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs px-1">
                        <span className="text-slate-600 font-bold">{selectedElement.columnShape === 'circle' ? 'Çap' : 'Genişlik'}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.1" 
                            className="w-20 text-right bg-white text-slate-800 p-2 rounded-lg border border-slate-200 focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald outline-none transition-all"
                            value={Number(((selectedElement.width || (selectedElement.type === 'symbol' ? 36 : 100)) / scaleConfig.pixelsPerMeter).toFixed(2))}
                            onChange={(e) => {
                              const newMeters = parseFloat(e.target.value);
                              if (isNaN(newMeters) || newMeters <= 0) return;
                              updateElement(selectedElement.id, { width: newMeters * scaleConfig.pixelsPerMeter });
                            }}
                          />
                          <span className="text-slate-400 font-black">{scaleConfig.unit}</span>
                        </div>
                      </div>
                      {selectedElement.type !== 'symbol' && selectedElement.columnShape !== 'circle' && (
                        <div className="flex justify-between items-center text-xs px-1">
                          <span className="text-slate-600 font-bold">Yükseklik</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              step="0.1" 
                              className="w-20 text-right bg-white text-slate-800 p-2 rounded-lg border border-slate-200 focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald outline-none transition-all"
                              value={Number(((selectedElement.height || 80) / scaleConfig.pixelsPerMeter).toFixed(2))}
                              onChange={(e) => {
                                const newMeters = parseFloat(e.target.value);
                                if (isNaN(newMeters) || newMeters <= 0) return;
                                updateElement(selectedElement.id, { height: newMeters * scaleConfig.pixelsPerMeter });
                              }}
                            />
                            <span className="text-slate-400 font-black">{scaleConfig.unit}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stairs Type Selector */}
                {selectedElement.type === 'stairs' && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Merdiven Tipi</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'straight', label: 'Düz' },
                        { id: 'l-shape', label: 'L-Şekil' },
                        { id: 'u-shape', label: 'U-Şekil' },
                        { id: 'spiral', label: 'Spiral' },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => updateElement(selectedElement.id, { stairsType: t.id as 'straight' | 'l-shape' | 'spiral' | 'core' })}
                          className={cn(
                            "py-2 text-[10px] font-bold rounded-xl border transition-all",
                            selectedElement.stairsType === t.id || (!selectedElement.stairsType && t.id === 'straight')
                              ? "bg-accent-emerald text-white border-accent-emerald"
                              : "border-slate-200/50 text-slate-600 hover:bg-slate-100/50"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thickness for Wall, Window, Door, Route */}
                {['wall', 'window', 'door', 'route'].includes(selectedElement.type) && (
                  <div className="space-y-4">
                    {selectedElement.type === 'wall' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Duvar Tipi</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'hatch' as const, label: 'Tarama' },
                              { id: 'solid' as const, label: 'Dolu' },
                              { id: 'double' as const, label: 'Çift' },
                            ].map((style) => (
                              <button
                                key={style.id}
                                onClick={() => updateElement(selectedElement.id, { wallStyle: style.id })}
                                className={cn(
                                  "py-2 text-[10px] font-bold rounded-xl border transition-all",
                                  (selectedElement.wallStyle || 'hatch') === style.id
                                    ? "bg-accent-emerald text-white border-accent-emerald"
                                    : "border-slate-200/50 text-slate-600 hover:bg-slate-100/50"
                                )}
                              >
                                {style.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Mimari Preset</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[10, 12, 16, 20].map((thickness) => (
                              <button
                                key={thickness}
                                onClick={() => updateElement(selectedElement.id, { thickness })}
                                className={cn(
                                  "h-9 rounded-xl border text-[10px] font-black transition-all",
                                  (selectedElement.thickness || 12) === thickness
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-100"
                                )}
                              >
                                {thickness}px
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kalınlık</label>
                        <span className="text-[10px] font-bold text-accent-emerald">{selectedElement.thickness || 8}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        step="1"
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        value={selectedElement.thickness || 8}
                        onChange={(e) => updateElement(selectedElement.id, { thickness: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                )}

                {/* Rotation */}
                {['symbol', 'text', 'rect', 'stairs', 'elevator', 'column'].includes(selectedElement.type) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pl-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rotasyon</label>
                      <span className="text-[10px] font-bold text-accent-emerald">{selectedElement.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="45"
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      value={selectedElement.rotation || 0}
                      onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    />
                  </div>
                )}

                {/* Text Styling */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yazı Boyutu</label>
                        <span className="text-[10px] font-bold text-accent-emerald">{selectedElement.fontSize || 14}px</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        step="2"
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        value={selectedElement.fontSize || 14}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        className={cn(
                          "flex-1 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest",
                          selectedElement.fontWeight === 'bold' ? "bg-accent-emerald text-white border-accent-emerald" : "bg-white border-slate-200 text-slate-600 border-slate-200/50 hover:bg-slate-100"
                        )}
                      >
                        <Bold className="w-3 h-3" /> Kalın
                      </button>
                    </div>
                  </div>
                )}

                {/* Color Palette */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Renk</label>
                  <div className="flex flex-wrap gap-2">
                    {['#ef4444', '#10b981', '#3b82f6', '#1e293b', '#f59e0b', '#8b5cf6', '#ffffff', '#64748b'].map(color => (
                      <button
                        key={color}
                        onClick={() => updateElement(selectedElement.id, { color })}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all",
                          (selectedElement.color || (selectedElement.type === 'symbol' ? SYMBOLS.find(s=>s.id === selectedElement.symbolType)?.color : '#ffffff')) === color
                            ? "border-accent-emerald scale-110 shadow-md"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer rounded-full overflow-hidden"
                      value={selectedElement.color || (selectedElement.type === 'symbol' ? SYMBOLS.find(s=>s.id === selectedElement.symbolType)?.color : '#ffffff')}
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => removeElements(selectedIds)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 text-[10px] font-black uppercase tracking-widest text-safety-red bg-safety-red/10 rounded-lg hover:bg-safety-red hover:text-white transition-all border border-safety-red/20 active:scale-[0.98]"
                  >
                    <Trash2 className="w-4 h-4" /> Seçili Nesneyi Sil
                  </button>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-white border-slate-200 text-slate-500 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <MousePointer2 className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] leading-loose">
                    {selectedIds.length > 1 ? `${selectedIds.length} nesne seçildi` : (
                      <>
                        Düzenlemek için bir nesne<br/>seçin veya proje<br/>ayarlarını yönetin
                      </>
                    )}
                  </p>
                </div>



                {/* Project Metadata Management */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Proje Ayarları</label>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Proje Adı</label>
                      <input 
                        value={projectMetadata.name}
                        onChange={(e) => setProjectMetadata({ name: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-700 outline-none focus:border-accent-emerald transition-all"
                        placeholder="PROJE ADI"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Hazırlayan</label>
                      <input 
                        value={projectMetadata.author}
                        onChange={(e) => setProjectMetadata({ author: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-accent-emerald transition-all"
                        placeholder="İSİM SOYİSİM"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Tarih</label>
                        <input 
                          value={projectMetadata.date}
                          onChange={(e) => setProjectMetadata({ date: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-accent-emerald transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Revizyon</label>
                        <input 
                          value={projectMetadata.revision}
                          onChange={(e) => setProjectMetadata({ revision: e.target.value.toUpperCase() })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-accent-emerald transition-all"
                          placeholder="00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Kurumsal Logo (PNG/SVG)</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (re) => {
                                  setProjectMetadata({ logoUrl: re.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                          className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-[10px] font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3 h-3" /> Logo Yükle
                        </button>
                        {projectMetadata.logoUrl && (
                          <button 
                            onClick={() => setProjectMetadata({ logoUrl: '' })}
                            className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                            title="Logoyu Kaldır"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Management */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Dosya Yönetimi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={saveProject}
                      className="flex flex-col items-center gap-3 p-4 bg-white border-slate-200/50 border border-slate-200 rounded-2xl hover:border-accent-emerald/50 hover:bg-accent-emerald/5 transition-all group"
                    >
                      <FileDown className="w-6 h-6 text-slate-500 group-hover:text-accent-emerald transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Kaydet</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-3 p-4 bg-white border-slate-200/50 border border-slate-200 rounded-2xl hover:border-accent-emerald/50 hover:bg-accent-emerald/5 transition-all group"
                    >
                      <FileUp className="w-6 h-6 text-slate-500 group-hover:text-accent-emerald transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Yükle</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={onFileLoad} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

