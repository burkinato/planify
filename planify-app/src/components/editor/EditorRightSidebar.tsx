'use client';

import { useState, useRef } from 'react';
import {
  Layers, Trash2, MousePointer2, Plus, Settings2, Bold, FileDown, FileUp,
  ImageUp, X, Type, Maximize2, Palette, Info, Layout, RotateCcw, 
  ChevronRight, Sparkles, Activity, ShieldCheck, Gauge, ExternalLink,
  History, Bookmark, Globe, User, Calendar, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore, useShallow } from '@/store/useEditorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SYMBOLS, type TemplateRegion, type TemplateRegionState } from '@/types/editor';
import { LayerManager } from './LayerManager';
import { mergeTemplateState } from '@/lib/editor/templateLayouts';
import { uploadTemplateRegionAsset } from '@/lib/editor/templateAssets';
import {
  SegmentedControl,
  NumericInput,
  ColorSelector,
  InspectorSection,
  PropertyLabel,
  SliderControl
} from './InspectorControls';
import { ToolInspector } from './ToolInspectors';

interface EditorRightSidebarProps {
  mobileMenu: 'tools' | 'properties' | null;
  setMobileMenu: (m: 'tools' | 'properties' | null) => void;
}

type TypographyTarget = 'title' | 'body' | 'meta';

const ISO_STANDARDS = {
  SAFETY_GREEN: '#008F4C',
  FIRE_RED: '#E81123',
  WARNING_YELLOW: '#FFD700',
  MANDATORY_BLUE: '#00539C',
  NAVY: '#050b16',
  WHITE: '#ffffff',
};

const SIZE_PRESETS = [9, 11, 13, 16, 20, 24, 32, 40, 48];

function TypographyInspector({
  target,
  label,
  regionState,
  onChange,
  isoHeader = false,
}: {
  target: TypographyTarget;
  label: string;
  regionState: TemplateRegionState;
  onChange: (updates: TemplateRegionState) => void;
  isoHeader?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const getVal = (field: string) => regionState[`${target}${field}` as keyof TemplateRegionState];
  
  const defaultSize = isoHeader && target === 'title' ? 32 : isoHeader && target === 'meta' ? 11 : target === 'title' ? 24 : 13;
  const size = (getVal('Size') as number) ?? defaultSize;
  const weight = (getVal('Weight') as string) ?? (target === 'title' ? 'black' : 'bold');
  const color = isoHeader && target !== 'body' ? '#ffffff' : (getVal('Color') as string) ?? '#050b16';

  const updateField = (field: string, value: any) => {
    onChange({ [`${target}${field}`]: value } as TemplateRegionState);
  };

  return (
    <InspectorSection title={label} collapsible isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
      <div className="grid grid-cols-1 gap-5 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
        <PropertyLabel label="Ağırlık">
          <SegmentedControl
            value={weight}
            onChange={(v) => updateField('Weight', v)}
            options={[
              { value: 'normal', label: 'N' },
              { value: 'bold', label: 'B' },
              { value: 'black', label: 'BL' },
            ]}
          />
        </PropertyLabel>

        <PropertyLabel label="Boyut">
          <div className="grid grid-cols-5 gap-1.5">
            {SIZE_PRESETS.map(s => (
              <button 
                key={s} 
                onClick={() => updateField('Size', s)}
                className={cn(
                  "h-8 rounded-lg text-[10px] font-black border transition-all duration-300",
                  size === s 
                    ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105" 
                    : "bg-white/80 border-slate-200/60 text-slate-500 hover:border-slate-400 hover:bg-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </PropertyLabel>

        {!(isoHeader && target !== 'body') && (
          <PropertyLabel label="Renk">
            <ColorSelector 
              value={color} 
              colors={Object.values(ISO_STANDARDS)} 
              onChange={(c) => updateField('Color', c)} 
            />
          </PropertyLabel>
        )}
      </div>
    </InspectorSection>
  );
}

export function EditorRightSidebar({ mobileMenu, setMobileMenu }: EditorRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'props' | 'layers'>('props');
  const [sections, setSections] = useState({
    content: true,
    geometry: true,
    appearance: true,
    meta: true,
    files: true
  });

  const toggleSection = (s: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [s]: !prev[s] }));
  };

  const {
    elements, selectedIds, removeElements, updateElement, scaleConfig, loadProject, layers,
    projectMetadata, setProjectMetadata, activeTemplateLayout, templateState,
    focusedRegionId, updateTemplateRegion, setFocusedRegionId, projectId, tool
  } = useEditorStore(useShallow((s) => ({
    elements: s.elements,
    selectedIds: s.selectedIds,
    removeElements: s.removeElements,
    updateElement: s.updateElement,
    scaleConfig: s.scaleConfig,
    loadProject: s.loadProject,
    layers: s.layers,
    projectMetadata: s.projectMetadata,
    setProjectMetadata: s.setProjectMetadata,
    activeTemplateLayout: s.activeTemplateLayout,
    templateState: s.templateState,
    focusedRegionId: s.focusedRegionId,
    updateTemplateRegion: s.updateTemplateRegion,
    setFocusedRegionId: s.setFocusedRegionId,
    projectId: s.projectId,
    tool: s.tool,
  })));

  const userId = useAuthStore((s) => s.user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = selectedIds.length === 1 ? elements.find(e => e.id === selectedIds[0]) : null;
  const focusedRegion = activeTemplateLayout?.layout_json.regions.find((region) => region.id === focusedRegionId && region.type !== 'drawing');
  const focusedRegionState = focusedRegion ? mergeTemplateState(templateState)[focusedRegion.id] || {} : null;

  const saveProject = () => {
    const data = {
      elements, scaleConfig, layers,
      templateLayoutId: activeTemplateLayout?.id || null,
      projectTemplate: activeTemplateLayout?.slug || 'blank',
      pagePreset: activeTemplateLayout?.page_preset,
      templateState, projectMetadata, version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planify-proje-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
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
      "fixed md:static inset-y-0 right-0 w-80 bg-slate-50/80 backdrop-blur-2xl border-l border-white flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.05)] z-30 md:z-10 transition-all duration-500 ease-in-out",
      mobileMenu === 'properties' ? "translate-x-0" : "translate-x-full md:translate-x-0"
    )}>
      {/* Premium Tab Switcher */}
      <div className="p-4 bg-white/40 border-b border-white/60">
        <div className="flex p-1 bg-slate-200/50 backdrop-blur-md rounded-2xl border border-slate-200/40 relative">
          <div 
            className={cn(
              "absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-lg shadow-slate-200/50 transition-all duration-500 ease-spring border border-white",
              activeTab === 'layers' ? "translate-x-full" : "translate-x-0"
            )}
          />
          <button
            onClick={() => setActiveTab('props')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 z-10 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
              activeTab === 'props' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Activity className={cn("w-3.5 h-3.5", activeTab === 'props' ? "text-emerald-500" : "")} /> Özellikler
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 z-10 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
              activeTab === 'layers' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Layers className={cn("w-3.5 h-3.5", activeTab === 'layers' ? "text-emerald-500" : "")} /> Katmanlar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'layers' ? (
          <LayerManager />
        ) : (
          <div className="p-6 space-y-10 animate-in fade-in duration-700">
            {focusedRegion && focusedRegionState ? (
              /* --- PREMIUM REGION EDITOR --- */
              <>
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Layout className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-900">{focusedRegion.label}</h2>
                      <p className="text-[9px] font-bold text-emerald-600/70 uppercase">Alan Düzenleyici</p>
                    </div>
                  </div>
                  <button onClick={() => setFocusedRegionId(null)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200/60">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <InspectorSection title="İçerik Mimarisi" collapsible isOpen={sections.content} onToggle={() => toggleSection('content')}>
                  <div className="space-y-4">
                    <PropertyLabel label="Başlık">
                      <input
                        value={focusedRegionState.title || ''}
                        onChange={(e) => updateTemplateRegion(focusedRegion.id, { title: e.target.value })}
                        className="w-full bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wide focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                        placeholder={focusedRegion.label}
                      />
                    </PropertyLabel>
                    
                    {focusedRegion.type !== 'legend' && (
                      <PropertyLabel label={focusedRegion.type === 'header' ? 'Alt Başlık' : 'Detay'}>
                        <textarea
                          value={focusedRegionState.body || ''}
                          onChange={(e) => updateTemplateRegion(focusedRegion.id, { body: e.target.value })}
                          className="w-full bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-bold min-h-[100px] resize-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                          placeholder="..."
                        />
                      </PropertyLabel>
                    )}

                    <PropertyLabel label="Meta Veri">
                      <div className="relative group">
                        <input
                          value={focusedRegionState.meta || ''}
                          onChange={(e) => updateTemplateRegion(focusedRegion.id, { meta: e.target.value.toUpperCase() })}
                          className="w-full bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all pr-10"
                          placeholder="01"
                        />
                        <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                    </PropertyLabel>
                  </div>
                </InspectorSection>

                <div className="space-y-6 pt-6 border-t border-slate-200/40">
                  <TypographyInspector 
                    target="title" label="Başlık Tipografisi" 
                    regionState={focusedRegionState} 
                    isoHeader={focusedRegion.type === 'header'}
                    onChange={(u) => updateTemplateRegion(focusedRegion.id, u)} 
                  />
                  {focusedRegion.type !== 'legend' && (
                    <TypographyInspector 
                      target="body" label="Gövde Tipografisi" 
                      regionState={focusedRegionState} 
                      onChange={(u) => updateTemplateRegion(focusedRegion.id, u)} 
                    />
                  )}
                  <TypographyInspector 
                    target="meta" label="Meta Tipografisi" 
                    regionState={focusedRegionState} 
                    isoHeader={focusedRegion.type === 'header'}
                    onChange={(u) => updateTemplateRegion(focusedRegion.id, u)} 
                  />
                </div>
              </>
            ) : selectedElement ? (
              /* --- PREMIUM ELEMENT EDITOR --- */
              <>
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-widest text-white">
                        {selectedElement.type === 'symbol' ? SYMBOLS.find(s=>s.id === selectedElement.symbolType)?.name : selectedElement.type}
                      </h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Özellik Paneli</p>
                    </div>
                  </div>
                  <button onClick={() => removeElements(selectedIds)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <InspectorSection title="Geometrik Veriler" collapsible isOpen={sections.geometry} onToggle={() => toggleSection('geometry')}>
                  <div className="grid grid-cols-2 gap-4">
                    <PropertyLabel label="Genişlik">
                      <NumericInput 
                        value={Number(((selectedElement.width || 0) / scaleConfig.pixelsPerMeter).toFixed(2))} 
                        unit={scaleConfig.unit}
                        onChange={(v) => updateElement(selectedElement.id, { width: v * scaleConfig.pixelsPerMeter })} 
                      />
                    </PropertyLabel>
                    {selectedElement.type !== 'wall' && selectedElement.type !== 'route' && (
                      <PropertyLabel label="Yükseklik">
                        <NumericInput 
                          value={Number(((selectedElement.height || 0) / scaleConfig.pixelsPerMeter).toFixed(2))} 
                          unit={scaleConfig.unit}
                          onChange={(v) => updateElement(selectedElement.id, { height: v * scaleConfig.pixelsPerMeter })} 
                        />
                      </PropertyLabel>
                    )}
                  </div>
                  
                  {['symbol', 'rect', 'stairs', 'column'].includes(selectedElement.type) && (
                    <PropertyLabel label="Rotasyon">
                      <SliderControl 
                        value={selectedElement.rotation || 0}
                        min={0} max={360} step={45} unit="°"
                        onChange={(v) => updateElement(selectedElement.id, { rotation: v })}
                      />
                    </PropertyLabel>
                  )}
                </InspectorSection>

                {selectedElement.type === 'wall' && (
                  <InspectorSection title="Duvar Mühendisliği" collapsible isOpen={sections.appearance} onToggle={() => toggleSection('appearance')}>
                    <PropertyLabel label="Tarama Stili">
                      <SegmentedControl
                        value={selectedElement.wallStyle || 'hatch'}
                        onChange={(v) => updateElement(selectedElement.id, { wallStyle: v as any })}
                        options={[
                          { value: 'hatch', label: 'Taralı' },
                          { value: 'solid', label: 'Dolu' },
                          { value: 'double', label: 'Çift' },
                        ]}
                      />
                    </PropertyLabel>
                    <PropertyLabel label="Kalınlık (cm)">
                      <div className="grid grid-cols-4 gap-2">
                        {[10, 12, 16, 20].map(t => (
                          <button 
                            key={t}
                            onClick={() => updateElement(selectedElement.id, { thickness: t })}
                            className={cn(
                              "h-10 rounded-xl text-[10px] font-black border transition-all duration-300",
                              (selectedElement.thickness || 12) === t 
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105" 
                                : "bg-white border-slate-200/60 text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </PropertyLabel>
                  </InspectorSection>
                )}

                <InspectorSection title="Görsel Kimlik">
                  {selectedElement.type === 'symbol' ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-4 group">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-tight">ISO Standart Rengi<br/>Aktif</span>
                    </div>
                  ) : (
                    <ColorSelector 
                      value={selectedElement.color || '#050b16'} 
                      colors={Object.values(ISO_STANDARDS)} 
                      onChange={(c) => updateElement(selectedElement.id, { color: c })} 
                    />
                  )}
                </InspectorSection>
              </>
            ) : tool !== 'select' && tool !== 'symbol' ? (
              /* --- TOOL INSPECTOR --- */
              <ToolInspector />
            ) : (
              /* --- PREMIUM DASHBOARD STATE --- */
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[32px] shadow-2xl group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] group-hover:bg-emerald-500/20 transition-all duration-1000" />
                  <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white leading-tight">Hoş Geldiniz</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Planify Pro Stüdyo</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Katman</div>
                        <div className="text-xl font-black text-white">{layers.length}</div>
                      </div>
                      <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Obje</div>
                        <div className="text-xl font-black text-white">{elements.length}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <InspectorSection title="Proje Kimliği" collapsible isOpen={sections.meta} onToggle={() => toggleSection('meta')}>
                  <div className="space-y-4">
                    <PropertyLabel label="Proje Adı">
                      <div className="relative">
                        <input
                          value={projectMetadata.name}
                          onChange={(e) => setProjectMetadata({ name: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black tracking-wide outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                        />
                        <Bookmark className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </PropertyLabel>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <PropertyLabel label="Hazırlayan Uzman">
                        <div className="relative">
                          <input
                            value={projectMetadata.author}
                            onChange={(e) => setProjectMetadata({ author: e.target.value.toUpperCase() })}
                            className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                          />
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </PropertyLabel>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <PropertyLabel label="Tarih">
                        <div className="relative">
                          <input
                            value={projectMetadata.date}
                            onChange={(e) => setProjectMetadata({ date: e.target.value })}
                            className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                          />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </PropertyLabel>
                      <PropertyLabel label="Revizyon">
                        <input
                          value={projectMetadata.revision}
                          onChange={(e) => setProjectMetadata({ revision: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black text-center outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                        />
                      </PropertyLabel>
                    </div>
                  </div>
                </InspectorSection>

                <InspectorSection title="Sistem Yönetimi" collapsible isOpen={sections.files} onToggle={() => toggleSection('files')}>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={saveProject} className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200/60 rounded-3xl hover:border-emerald-500/50 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 active:scale-95">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                        <FileDown className="w-6 h-6 text-emerald-500 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Projeyi İndir</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200/60 rounded-3xl hover:border-emerald-500/50 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 active:scale-95">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                        <FileUp className="w-6 h-6 text-slate-400 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Dosya Yükle</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={onFileLoad} />
                    </button>
                  </div>
                </InspectorSection>
                
                <div className="p-6 bg-white/40 border border-white rounded-[32px] flex items-center gap-4 group cursor-help transition-all hover:bg-white shadow-sm">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">ISO 7010 / 23601</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Tam Uyumluluk Aktif</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
