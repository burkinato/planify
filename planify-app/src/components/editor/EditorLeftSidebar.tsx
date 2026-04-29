'use client';

import { useState } from 'react';
import {
  MousePointer2, PenTool, Type, ArrowRight, Trash2, Plus,
  DoorOpen as DoorIcon, Scaling, MoveUp, Box, Upload, Save, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { useProjectStore } from '@/store/useProjectStore';
import { SYMBOLS, SymbolCategory } from '@/types/editor';
import { ISO_SYMBOLS } from '@/lib/editor/isoSymbols';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useProAccess } from '@/hooks/useProAccess';
import { StairPickerModal, type StairType } from './StairPickerModal';

const CATEGORY_NAMES: Record<SymbolCategory, string> = {
  'E_ACIL': 'Acil Çıkış & Tahliye',
  'F_YANGIN': 'Yangın Güvenliği',
  'E_SAGLIK': 'İlk Yardım & Sağlık',
  'W_TEHLIKE': 'Tehlike & Uyarı',
  'X_OPERASYON': 'Operasyon & Tesis'
};

interface EditorLeftSidebarProps {
  mobileMenu: 'tools' | 'properties' | null;
  setMobileMenu: (m: 'tools' | 'properties' | null) => void;
}

function ToolButton({
  active, onClick, icon: Icon, label, variant
}: {
  active: boolean;
  onClick: (e?: React.MouseEvent) => void;
  icon: React.ElementType;
  label: string;
  variant?: 'green' | 'red';
}) {
  return (
    <button
      onClick={(e) => onClick(e)}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all duration-200 border",
        active
          ? "tool-active border-transparent"
          : variant === 'green'
            ? "border-safety-green/20 text-safety-green/80 hover:bg-safety-green/10 hover:border-safety-green/40"
            : variant === 'red'
              ? "border-safety-red/20 text-safety-red/80 hover:bg-safety-red/10 hover:border-safety-red/40"
              : "border-slate-200/50 text-slate-600 hover:bg-slate-100/50 hover:border-slate-300 hover:text-slate-800"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="uppercase tracking-wider text-[9px] font-bold">{label}</span>
    </button>
  );
}

export function EditorLeftSidebar({ mobileMenu, setMobileMenu }: EditorLeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'library'>('tools');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stairPickerPos, setStairPickerPos] = useState<{x:number;y:number}|null>(null);
  const { tool, setTool, selectedSymbol, setSelectedSymbol, clearAll, customSymbols, addCustomSymbol, addElement, focusedRegionId } = useEditorStore();
  const { updateProject } = useProjectStore();
  const { isPro } = useProAccess();

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const {
        projectId,
        elements,
        layers,
        scaleConfig,
        projectTemplate,
        templateLayoutId,
        pagePreset,
        templateState,
      } = useEditorStore.getState();

      if (!projectId) {
        toast.error('Proje ID bulunamadı. Lütfen projeyi kontrol panelinden açın.');
        setIsSaving(false);
        return;
      }
      
      const canvas_data = { elements, layers, projectTemplate, templateLayoutId, pagePreset, templateState };
      
      await updateProject(projectId, { 
        canvas_data,
        scale_config: scaleConfig,
        template_layout_id: templateLayoutId,
        page_preset: pagePreset,
        template_state: templateState,
      });
      
      toast.success('Plan başarıyla kaydedildi!');
    } catch (e: unknown) {
      console.error('Save plan failed:', e);
      toast.error(e instanceof Error ? e.message : 'Kaydetme işlemi başarısız oldu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası yükleyin (SVG, PNG, JPG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        addCustomSymbol({
          id: uuidv4(),
          name: file.name.replace(/\.(svg|png|jpe?g)$/i, ''),
          dataUrl: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset
  };

  return (
    <aside className={cn(
      "fixed md:static inset-y-0 left-0 bg-white border-slate-200 border-r flex flex-col z-30 md:z-10 shadow-2xl transition-all duration-300 overflow-hidden",
      mobileMenu === 'tools' ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      focusedRegionId && focusedRegionId !== 'drawing' ? "w-0 border-r-0 opacity-0 pointer-events-none" : "w-56 opacity-100"
    )}>
      {/* Clear Confirmation */}
      {showClearConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowClearConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border-slate-200 rounded-2xl shadow-2xl z-[70] p-6 border border-white/10 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-sm mb-2">Tuvali Temizle</h3>
            <p className="text-xs text-slate-600 mb-6">Tüm katmanlardaki bütün nesneleri silmek istediğinizden emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">İptal</button>
              <button onClick={() => { clearAll(); setShowClearConfirm(false); }} className="flex-1 py-2.5 text-xs font-bold bg-safety-red text-white rounded-xl hover:bg-safety-red/80 transition-all">Temizle</button>
            </div>
          </div>
        </>
      )}

      {/* Logo */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-base font-black tracking-tight text-slate-800">
            Planify {isPro && <span className="text-accent-emerald font-medium text-xs ml-1">Pro</span>}
          </h1>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-0.5 font-bold">Tahliye Planı Editörü</p>
        </div>
        <button onClick={() => setMobileMenu(null)} className="md:hidden p-2 text-slate-400">
          <Plus className="rotate-45 w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-1 bg-white/50">
        <button
          onClick={() => setActiveTab('tools')}
          className={cn(
            "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
            activeTab === 'tools'
              ? "bg-slate-100 text-slate-800 shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          Araçlar
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
            activeTab === 'library'
              ? "bg-slate-100 text-slate-800 shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          Semboller
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'tools' ? (
          <>
            <section>
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.15em] block mb-3 px-1">
                Mimari Çizim
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} label="Seçim" />
                <ToolButton active={tool === 'wall'} onClick={() => setTool('wall')} icon={PenTool} label="Duvar" />
                <ToolButton active={tool === 'door'} onClick={() => setTool('door')} icon={DoorIcon} label="Kapı" />
                <ToolButton active={tool === 'window'} onClick={() => setTool('window')} icon={Scaling} label="Pencere" />
                <ToolButton
                  active={tool === 'stairs'}
                  onClick={(e) => {
                    if (e) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setStairPickerPos({ x: rect.right + 12, y: rect.top - 10 });
                    }
                    setTool('stairs');
                  }}
                  icon={MoveUp} label="Merdiven"
                />
                <ToolButton active={tool === 'elevator'} onClick={() => setTool('elevator')} icon={Box} label="Asansör" />
                <ToolButton active={tool === 'column'} onClick={() => setTool('column')} icon={Box} label="Kolon" />
                <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={Type} label="Metin" />
              </div>
            </section>

            <section>
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.15em] block mb-3 px-1">
                Tahliye Yolları
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <ToolButton active={tool === 'evacuation-route'} onClick={() => setTool('evacuation-route')} icon={ArrowRight} label="Tahliye" variant="green" />
                <ToolButton active={tool === 'rescue-route'} onClick={() => setTool('rescue-route')} icon={ArrowRight} label="Kurtarma" variant="red" />
              </div>
            </section>

            <section className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-3 p-3 text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-safety-red hover:bg-safety-red/5 rounded-xl transition-all border border-transparent hover:border-safety-red/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tuvali Temizle</span>
              </button>
            </section>
          </>
        ) : (
          <section>
            {Object.entries(CATEGORY_NAMES).map(([catId, catName]) => {
              const catSymbols = SYMBOLS.filter(s => s.category === catId);
              if (catSymbols.length === 0) return null;
              
              return (
                <div key={catId} className="mb-6">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.15em] block mb-3 px-1 border-b border-slate-100 pb-2">
                    {catName}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {catSymbols.map((sym) => (
                      <button
                        key={sym.id}
                        onClick={() => { setTool('symbol'); setSelectedSymbol(sym.id); }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all group",
                          selectedSymbol === sym.id && tool === 'symbol'
                            ? "border-accent-emerald/50 bg-accent-emerald/10 text-white glow-accent"
                            : "border-slate-200/30 bg-white border-slate-200/50 hover:border-slate-300 text-slate-500 hover:text-slate-800"
                        )}
                        title={sym.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={ISO_SYMBOLS[sym.id]} 
                          alt={sym.name} 
                          className={cn(
                            "w-6 h-6 transition-transform group-hover:scale-110 object-contain rounded-sm",
                            selectedSymbol === sym.id && tool === 'symbol' ? "" : "opacity-80 group-hover:opacity-100"
                          )} 
                        />
                        <span className="text-[8px] font-bold text-center uppercase tracking-tight leading-tight line-clamp-1">{sym.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
              
              {customSymbols.length > 0 && (
                <div className="mb-6">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.15em] block mb-3 px-1 border-b border-slate-100 pb-2">
                    Özel Semboller
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {customSymbols.map((cs) => (
                      <button
                        key={cs.id}
                        onClick={() => { setTool('symbol'); setSelectedSymbol(cs.id); }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all group",
                          selectedSymbol === cs.id && tool === 'symbol'
                            ? "border-accent-emerald/50 bg-accent-emerald/10 text-white glow-accent"
                            : "border-slate-200/30 bg-white border-slate-200/50 hover:border-slate-300 text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cs.dataUrl} alt={cs.name} className="w-6 h-6 transition-transform group-hover:scale-110 object-contain rounded-sm" />
                        <span className="text-[8px] font-bold text-center uppercase tracking-tight leading-tight line-clamp-1" title={cs.name}>{cs.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="w-full flex items-center justify-center gap-2 py-3 px-2 bg-white border-slate-200/80 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Yeni Sembol Ekle</span>
                <input type="file" accept="image/svg+xml,image/png,image/jpeg" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </section>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-slate-200 bg-white/50">
        <button 
          onClick={handleSavePlan}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-accent-emerald to-accent-emerald-dark text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg glow-accent hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Kaydediliyor...' : 'Planı Kaydet / Yayınla'}
        </button>
      </div>
      {stairPickerPos && (
        <StairPickerModal
          isOpen={true}
          position={stairPickerPos}
          onClose={() => setStairPickerPos(null)}
          onSelect={(type: StairType) => {
            addElement({
              type: 'stairs',
              x: 200,
              y: 200,
              width: type === 'spiral' ? 120 : 100,
              height: type === 'spiral' ? 120 : 130,
              stairsType: type,
            });
            setTool('select');
            setStairPickerPos(null);
          }}
        />
      )}
    </aside>
  );
}

