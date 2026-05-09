'use client';

import { Blocks, ClipboardCheck, GripVertical, Move3D, Trash2, X } from 'lucide-react';
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

const REQUIREMENT_CLASSES: Record<TemplateModuleRequirement, string> = {
  required: 'border-emerald-400/35 text-emerald-200 bg-emerald-500/10',
  recommended: 'border-cyan-400/35 text-cyan-200 bg-cyan-500/10',
  optional: 'border-slate-500 text-slate-300 bg-slate-700/30',
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

  return (
    <aside className={cn(
      'fixed md:static inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-700/80 flex flex-col z-30 md:z-10 shadow-2xl transition-transform duration-300 overflow-hidden',
      mobileMenu === 'properties' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
    )}>
      <div className="p-4 border-b border-slate-700 bg-slate-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-100">
              <Blocks className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-black uppercase tracking-[0.18em]">Denetim Modulleri</h2>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
              Karti kagida surukle, sonra secip olcu ve icerigini duzenle.
            </p>
          </div>
          <button
            onClick={() => setMobileMenu(null)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="p-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Hazir Bloklar</span>
            <span className="text-[9px] text-slate-500">{MODULE_DEFINITIONS.length} modul</span>
          </div>
          <div className="space-y-2">
            {MODULE_DEFINITIONS.map((definition) => {
              const alreadyExists = definition.type === 'DrawingArea' && templateModules.some((module) => module.type === 'DrawingArea');

              return (
                <button
                  key={definition.id}
                  draggable={!alreadyExists}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/planify-module', definition.type);
                    event.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => !alreadyExists && addTemplateModule(definition.type)}
                  disabled={alreadyExists}
                  className={cn(
                    'w-full text-left rounded-xl border p-3 transition-all group',
                    alreadyExists
                      ? 'border-slate-800 bg-slate-900/40 opacity-55 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-900/80 hover:border-cyan-500/60 hover:bg-slate-900'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 group-hover:border-cyan-300/70">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-100">
                          {definition.label}
                        </span>
                        <span className={cn(
                          'shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider',
                          REQUIREMENT_CLASSES[definition.requirement]
                        )}>
                          {REQUIREMENT_LABELS[definition.requirement]}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                        {definition.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {definition.auditTags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded bg-slate-800 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Secili Modul</span>
            </div>
            {selectedModule && (
              <span className="rounded bg-slate-800 px-2 py-1 text-[9px] font-bold uppercase text-slate-300">
                {MODULE_TYPE_LABELS[selectedModule.type]}
              </span>
            )}
          </div>

          {!selectedModule ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center">
              <Move3D className="mx-auto mb-3 h-6 w-6 text-slate-500" />
              <p className="text-xs font-bold text-slate-300">Kagittaki bir modulu sec.</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                Secim sonrasi baslik, metin, konum ve boyut ayarlari burada gorunur.
              </p>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <label className="block">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Baslik</span>
                <input
                  value={selectedState.title || ''}
                  onChange={(event) => updateTemplateRegion(selectedModule.id, { title: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </label>

              <label className="block">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Icerik</span>
                <textarea
                  value={selectedState.body || ''}
                  rows={6}
                  onChange={(event) => updateTemplateRegion(selectedModule.id, { body: event.target.value })}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs leading-relaxed text-slate-100 outline-none focus:border-cyan-500"
                />
              </label>

              <label className="block">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Meta / Alt bilgi</span>
                <input
                  value={selectedState.meta || ''}
                  onChange={(event) => updateTemplateRegion(selectedModule.id, { meta: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </label>

              <div className="grid grid-cols-4 gap-2">
                {(['x', 'y', 'w', 'h'] as const).map((key) => (
                  <label key={key} className="block">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{key}</span>
                    <input
                      type="number"
                      value={Math.round(selectedModule[key] * 10) / 10}
                      min={0}
                      max={100}
                      onChange={(event) => {
                        const value = clampInput(Number(event.target.value), key === 'w' || key === 'h' ? 4 : 0, 100);
                        updateTemplateModule(selectedModule.id, { [key]: value });
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSelectedTemplateModuleId(null)}
                  className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                >
                  Secimi Kapat
                </button>
                <button
                  onClick={() => removeTemplateModule(selectedModule.id)}
                  disabled={selectedModule.type === 'DrawingArea'}
                  className="rounded-lg border border-red-500/30 px-3 py-2 text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  title={selectedModule.type === 'DrawingArea' ? 'Cizim alani zorunlu moduldur' : 'Modulu sil'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
