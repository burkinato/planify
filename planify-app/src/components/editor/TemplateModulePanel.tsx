'use client';

import { Blocks, ClipboardCheck, GripVertical, Move3D, Trash2, X, ChevronRight } from 'lucide-react';
import { MODULE_DEFINITIONS } from '@/lib/editor/templateLayouts';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import type { TemplateModuleRequirement, TemplateModuleType } from '@/types/editor';

interface TemplateModulePanelProps {
  mobileMenu: 'tools' | 'properties' | null;
  setMobileMenu: (m: 'tools' | 'properties' | null) => void;
}

const REQUIREMENT_LABELS: Record<TemplateModuleRequirement, string> = {
  required: 'Zorunlu',
  recommended: 'Onerilen',
  optional: 'Opsiyonel',
};

const MODULE_TYPE_LABELS: Record<TemplateModuleType, string> = {
  Header: 'Baslik',
  DrawingArea: 'Cizim',
  EmergencyCall: 'Acil',
  EvacuationInstructions: 'Tahliye',
  FireInstructions: 'Yangin',
  Legend: 'Lejand',
  AssemblyMap: 'Toplanma',
  ApprovalRevision: 'Onay',
  EmergencyTeams: 'Ekip',
  HazardUtilities: 'Risk',
  AccessibilityRefuge: 'Erisim',
  FireEquipmentInventory: 'Ekipman',
  QrDocumentInfo: 'QR',
  Notes: 'Not',
};

function clampInput(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function TemplateModulePanel({ mobileMenu, setMobileMenu }: TemplateModulePanelProps) {
  const {
    templateModules,
    selectedTemplateModuleId,
    templateState,
    addTemplateModule,
    updateTemplateModule,
    removeTemplateModule,
    updateTemplateRegion,
    setSelectedTemplateModuleId,
  } = useEditorStore();

  const selectedModule = templateModules.find((module) => module.id === selectedTemplateModuleId) ?? null;
  const selectedState = selectedModule ? templateState[selectedModule.id] || {} : {};

  const handleAddModule = (type: TemplateModuleType) => {
    addTemplateModule(type, { x: 5, y: 70, w: 90, h: 20 });
  };

  return (
    <aside className={cn(
      'fixed md:static inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-700/80 flex flex-col z-30 md:z-10 shadow-2xl transition-transform duration-300 overflow-hidden',
      mobileMenu === 'properties' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
    )}>
      <div className="p-3 border-b border-slate-700 bg-slate-950 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blocks className="w-4 h-4 text-cyan-400" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em]">Moduller</h2>
          </div>
          <button
            onClick={() => setMobileMenu(null)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {templateModules.length > 0 && (
          <section className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Kagitta</span>
              <span className="text-[9px] text-slate-600">{templateModules.length} modul</span>
            </div>
            <div className="space-y-1.5">
              {templateModules.map((module) => {
                const isSelected = module.id === selectedTemplateModuleId;
                const state = templateState[module.id] || {};
                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedTemplateModuleId(module.id)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/planify-existing-module', module.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-left group',
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
                        : 'bg-slate-900/60 border border-transparent hover:bg-slate-800/80 text-slate-300'
                    )}
                  >
                    <GripVertical className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-400")} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold truncate">
                        {state.title || MODULE_TYPE_LABELS[module.type]}
                      </div>
                      <div className="text-[8px] text-slate-500 uppercase tracking-wider">
                        {MODULE_TYPE_LABELS[module.type]}
                      </div>
                    </div>
                    {module.type !== 'DrawingArea' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTemplateModule(module.id);
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {selectedModule && (
          <section className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Duzenle</span>
              <span className="ml-auto text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">
                {MODULE_TYPE_LABELS[selectedModule.type]}
              </span>
            </div>

            <div className="space-y-2.5 rounded-xl border border-slate-700/60 bg-slate-900/40 p-3">
              <label className="block">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Baslik</span>
                <input
                  value={selectedState.title || ''}
                  onChange={(event) => updateTemplateRegion(selectedModule.id, { title: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] text-slate-100 outline-none focus:border-cyan-500"
                />
              </label>

              <label className="block">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Icerik</span>
                <textarea
                  value={selectedState.body || ''}
                  rows={4}
                  onChange={(event) => updateTemplateRegion(selectedModule.id, { body: event.target.value })}
                  className="mt-0.5 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[10px] leading-relaxed text-slate-100 outline-none focus:border-cyan-500"
                />
              </label>

              <label className="block">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Alt bilgi</span>
                <input
                  value={selectedState.meta || ''}
                  onChange={(event) => updateTemplateRegion(selectedModule.id, { meta: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[10px] text-slate-100 outline-none focus:border-cyan-500"
                />
              </label>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(['x', 'y', 'w', 'h'] as const).map((key) => (
                  <label key={key} className="block">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{key}</span>
                    <input
                      type="number"
                      value={Math.round(selectedModule[key] * 10) / 10}
                      min={0}
                      max={100}
                      onChange={(event) => {
                        const value = clampInput(Number(event.target.value), key === 'w' || key === 'h' ? 4 : 0, 100);
                        updateTemplateModule(selectedModule.id, { [key]: value });
                      }}
                      className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-1.5 py-1.5 text-[10px] text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </label>
                ))}
              </div>

              <div className="flex gap-1.5 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedTemplateModuleId(null)}
                  className="flex-1 rounded-lg border border-slate-700 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800"
                >
                  Kapat
                </button>
                {selectedModule.type !== 'DrawingArea' && (
                  <button
                    onClick={() => removeTemplateModule(selectedModule.id)}
                    className="rounded-lg border border-red-500/30 px-2 py-1.5 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Ekle</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {MODULE_DEFINITIONS.map((definition) => {
              const alreadyExists = definition.type === 'DrawingArea' && templateModules.some((module) => module.type === 'DrawingArea');

              return (
                <button
                  key={definition.id}
                  onClick={() => !alreadyExists && handleAddModule(definition.type)}
                  disabled={alreadyExists}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-left transition-all',
                    alreadyExists
                      ? 'border-slate-800/50 bg-slate-900/30 opacity-40 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-800'
                  )}
                >
                  <ChevronRight className={cn("w-3 h-3 shrink-0", alreadyExists ? "text-slate-600" : "text-cyan-500/60")} />
                  <span className={cn("text-[10px] font-bold truncate", alreadyExists ? "text-slate-500" : "text-slate-200")}>
                    {definition.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}