'use client';

import { X, Trash2, Move, Palette, Type, AlignLeft, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { MODULE_ICONS, MODULE_COLORS } from './modules/ModuleIconSet';
import { ModuleDispatcher } from './modules/ModuleDispatcher';
import { ImageUp } from 'lucide-react';
import { modulesToRegions } from '@/lib/editor/templateLayouts';
import type { TemplateModuleType } from '@/types/editor';

const MODULE_TYPE_LABELS: Record<TemplateModuleType, string> = {
  Header: 'Başlık', Logo: 'Logo', DrawingArea: 'Çizim', EmergencyCall: 'Acil Çağrı',
  EvacuationInstructions: 'Tahliye Talimatı', FireInstructions: 'Yangın Talimatı',
  Legend: 'Lejant', AssemblyMap: 'Toplanma Alanı', ApprovalRevision: 'Onay/Revizyon',
  EmergencyTeams: 'Acil Ekip', HazardUtilities: 'Risk/Tesisat',
  AccessibilityRefuge: 'Erişilebilirlik', FireEquipmentInventory: 'Yangın Ekipmanı',
  QrDocumentInfo: 'QR/Belge', Notes: 'Notlar',
};

const TONES = [
  { value: 'green', label: 'Güvenlik', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { value: 'red', label: 'Yangın', bg: 'bg-rose-500', ring: 'ring-rose-400' },
  { value: 'blue', label: 'Erişim', bg: 'bg-blue-500', ring: 'ring-blue-400' },
  { value: 'neutral', label: 'Standart', bg: 'bg-slate-500', ring: 'ring-slate-400' },
  { value: 'paper', label: 'Beyaz', bg: 'bg-white border border-slate-300', ring: 'ring-slate-300' },
];

function clampInput(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleEditDrawer({ isOpen, onClose }: Props) {
  const {
    templateModules, selectedTemplateModuleId, templateState,
    updateTemplateModule, removeTemplateModule, updateTemplateRegion,
    setSelectedTemplateModuleId, projectMetadata, setProjectMetadata
  } = useEditorStore();

  const mod = templateModules.find(m => m.id === selectedTemplateModuleId) ?? null;
  const state = mod ? templateState[mod.id] || {} : {};

  if (!isOpen || !mod || mod.type === 'DrawingArea') return null;

  const IconComp = MODULE_ICONS[mod.type];
  const colors = MODULE_COLORS[mod.type];
  const regions = modulesToRegions([mod]);
  const previewRegion = regions[0];

  return (
    <div className={cn(
      "fixed md:static inset-y-0 right-0 w-[340px] bg-slate-950 border-l border-slate-700/60 flex flex-col z-40 shadow-2xl",
      "animate-in slide-in-from-right-4 duration-200"
    )}>
      {/* Header */}
      <div className="shrink-0 border-b border-slate-700/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
            {IconComp && <IconComp size={16} className="opacity-80" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-200 truncate">
              {MODULE_TYPE_LABELS[mod.type]}
            </div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Düzenleme</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {previewRegion && (
        <div className="shrink-0 px-4 pt-3 pb-2">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5">Canlı Önizleme</div>
          <div className="rounded-xl border border-slate-700/40 bg-white overflow-hidden shadow-lg" style={{ height: 120, containerType: 'size' } as React.CSSProperties}>
            <ModuleDispatcher region={previewRegion} content={state} />
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-4">
        {/* Logo Specific Fields */}
        {mod.type === 'Logo' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-wider text-slate-500 ml-1">Logo Görseli</label>
              {projectMetadata.logoUrl ? (
                <div className="relative h-32 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                  <img src={projectMetadata.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/20 text-slate-600">
                  <ImageUp className="w-8 h-8 opacity-20" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Logo Seçilmedi</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 transition-all">
                  <ImageUp className="w-4 h-4" />
                  YÜKLE
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setProjectMetadata({ logoUrl: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setProjectMetadata({ logoUrl: '' })}
                  disabled={!projectMetadata.logoUrl}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-700 disabled:opacity-40 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  KALDIR
                </button>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed px-1">
              Logo tüm proje için geçerlidir. Bir modülde değiştirdiğinizde diğer tüm logo alanları da güncellenir.
            </p>
          </div>
        )}

        {/* Text Fields (Only for non-logo modules) */}
        {mod.type !== 'Logo' && (
          <>
            {/* Title */}
            <div>
              <label className="flex items-center gap-1.5 mb-1">
                <Type className="w-3 h-3 text-slate-600" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Başlık</span>
              </label>
              <input
                value={state.title || ''}
                onChange={e => updateTemplateRegion(mod.id, { title: e.target.value })}
                placeholder={MODULE_TYPE_LABELS[mod.type]}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-[11px] font-bold text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 placeholder:text-slate-600 transition-all"
              />
            </div>

            {/* Body */}
            <div>
              <label className="flex items-center gap-1.5 mb-1">
                <AlignLeft className="w-3 h-3 text-slate-600" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">İçerik</span>
              </label>
              <textarea
                value={state.body || ''}
                rows={6}
                onChange={e => updateTemplateRegion(mod.id, { body: e.target.value })}
                className="w-full resize-none rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-[10px] leading-relaxed font-semibold text-slate-200 outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 placeholder:text-slate-600 transition-all"
              />
            </div>

            {/* Meta */}
            <div>
              <label className="flex items-center gap-1.5 mb-1">
                <Hash className="w-3 h-3 text-slate-600" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Alt Bilgi</span>
              </label>
              <input
                value={state.meta || ''}
                onChange={e => updateTemplateRegion(mod.id, { meta: e.target.value })}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 placeholder:text-slate-600 transition-all"
              />
            </div>
          </>
        )}

        {/* Tone */}
        <div>
          <label className="flex items-center gap-1.5 mb-2">
            <Palette className="w-3 h-3 text-slate-600" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Renk Tonu</span>
          </label>
          <div className="flex gap-2">
            {TONES.map(t => (
              <button
                key={t.value} title={t.label} type="button"
                onClick={() => updateTemplateModule(mod.id, { tone: t.value as 'neutral' | 'blue' | 'red' | 'amber' | 'emerald' })}
                className={cn(
                  "w-7 h-7 rounded-lg transition-all hover:scale-110",
                  t.bg,
                  (mod.tone === t.value || (!mod.tone && t.value === 'neutral'))
                    && `ring-2 ${t.ring} ring-offset-2 ring-offset-slate-950 scale-110`
                )}
              />
            ))}
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="flex items-center gap-1.5 mb-2">
            <Move className="w-3 h-3 text-slate-600" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Konum & Boyut</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['x', 'y', 'w', 'h'] as const).map(key => (
              <label key={key}>
                <span className="text-[7px] font-black uppercase text-slate-600 block mb-0.5">{key}</span>
                <input
                  type="number" min={0} max={100}
                  value={Math.round(mod[key] * 10) / 10}
                  onChange={e => {
                    const v = clampInput(Number(e.target.value), key === 'w' || key === 'h' ? 4 : 0, 100);
                    updateTemplateModule(mod.id, { [key]: v });
                  }}
                  className="w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-2 py-1.5 text-[10px] text-slate-200 outline-none focus:border-cyan-500/60 transition-all"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-slate-700/60 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-800 transition-all">
          Kapat
        </button>
        <button
          onClick={() => { removeTemplateModule(mod.id); onClose(); }}
          className="rounded-xl border border-red-500/30 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
