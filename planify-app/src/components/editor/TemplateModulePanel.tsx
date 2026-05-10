'use client';

import { useState, useRef } from 'react';
import { Blocks, ChevronRight, GripVertical, Plus, X, Pencil, Eye } from 'lucide-react';
import { MODULE_DEFINITIONS } from '@/lib/editor/templateLayouts';
import { modulesToRegions } from '@/lib/editor/templateLayouts';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { MODULE_ICONS, MODULE_COLORS } from './modules/ModuleIconSet';
import { ModuleDispatcher } from './modules/ModuleDispatcher';
import { ModuleEditDrawer } from './ModuleEditDrawer';
import type { TemplateModuleRequirement, TemplateModuleType, TemplateModuleInstance } from '@/types/editor';

/* ─── Constants ─── */

const REQ_BADGE: Record<TemplateModuleRequirement, { text: string; cls: string }> = {
  required:    { text: 'Zorunlu',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  recommended: { text: 'Önerilen',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  optional:    { text: 'Opsiyonel', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

const MODULE_LABELS: Record<TemplateModuleType, string> = {
  Header: 'Başlık', DrawingArea: 'Çizim', EmergencyCall: 'Acil Çağrı',
  EvacuationInstructions: 'Tahliye Talimatı', FireInstructions: 'Yangın Talimatı',
  Legend: 'Lejant', AssemblyMap: 'Toplanma', ApprovalRevision: 'Onay',
  EmergencyTeams: 'Ekip', HazardUtilities: 'Risk', AccessibilityRefuge: 'Erişim',
  FireEquipmentInventory: 'Ekipman', QrDocumentInfo: 'QR/Belge', Notes: 'Not',
};

const MODULE_DESCRIPTIONS: Partial<Record<TemplateModuleType, string>> = {
  Header: 'Logo, proje adı ve kat bilgisi',
  DrawingArea: 'Konva tabanlı mimari çizim alanı',
  EmergencyCall: '112 acil çağrı bilgileri',
  EvacuationInstructions: 'Adım adım tahliye talimatları',
  FireInstructions: 'Yangın müdahale prosedürü',
  Legend: 'Kullanılan semboller dizini',
  AssemblyMap: 'Toplanma noktası krokisi',
  ApprovalRevision: 'İmza, tarih ve revizyon kaydı',
  EmergencyTeams: 'Söndürme, kurtarma ekipleri',
  HazardUtilities: 'Gaz/elektrik kesme noktaları',
  AccessibilityRefuge: 'Engelli tahliye bilgisi',
  FireEquipmentInventory: 'Yangın tüpü, dolap envanteri',
  QrDocumentInfo: 'QR ve belge doğrulama',
  Notes: 'Özel saha notları',
};

interface TemplateModulePanelProps {
  mobileMenu: 'tools' | 'properties' | null;
  setMobileMenu: (m: 'tools' | 'properties' | null) => void;
}

/* ─── Hover Preview Tooltip ─── */

function HoverPreview({ module, templateState }: { module: TemplateModuleInstance; templateState: any }) {
  const regions = modulesToRegions([module]);
  const region = regions[0];
  const content = templateState[module.id] || {};
  if (!region) return null;

  return (
    <div className="absolute right-full top-0 mr-3 w-[260px] z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Mini preview */}
        <div className="bg-white overflow-hidden" style={{ height: 140, containerType: 'size' } as React.CSSProperties}>
          <ModuleDispatcher region={region} content={content} compact />
        </div>
        {/* Info footer */}
        <div className="px-3 py-2 border-t border-slate-800/60">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            {MODULE_LABELS[module.type]}
          </div>
          <div className="text-[8px] text-slate-500 mt-0.5">
            {MODULE_DESCRIPTIONS[module.type] || 'Modül önizlemesi'}
          </div>
        </div>
      </div>
      {/* Arrow */}
      <div className="absolute top-4 -right-1.5 w-3 h-3 rotate-45 bg-slate-900 border-r border-t border-slate-700/60" />
    </div>
  );
}

/* ─── Module Row ─── */

function ModuleRow({ module, isSelected, onSelect, onEdit, templateState }: {
  module: TemplateModuleInstance;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  templateState: any;
}) {
  const [hovered, setHovered] = useState(false);
  const { removeTemplateModule } = useEditorStore();
  const IconComp = MODULE_ICONS[module.type];
  const colors = MODULE_COLORS[module.type];
  const state = templateState[module.id] || {};

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover preview */}
      {hovered && !isSelected && <HoverPreview module={module} templateState={templateState} />}

      <div
        onClick={onSelect}
        draggable
        onDragStart={e => {
          e.dataTransfer.setData('application/planify-existing-module', module.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        className={cn(
          'group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
          isSelected
            ? 'bg-gradient-to-r from-cyan-500/15 to-cyan-500/5 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
            : 'hover:bg-slate-800/60 border border-transparent'
        )}
      >
        {/* Drag handle */}
        <GripVertical className={cn("w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity", isSelected && "opacity-40")} />

        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: colors.primary + '15', color: colors.primary }}
        >
          {IconComp && <IconComp size={15} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={cn("text-[10px] font-bold truncate", isSelected ? "text-cyan-200" : "text-slate-200")}>
            {state.title || MODULE_LABELS[module.type]}
          </div>
          <div className="text-[8px] text-slate-500 uppercase tracking-wider truncate">
            {MODULE_DESCRIPTIONS[module.type]?.slice(0, 30) || MODULE_LABELS[module.type]}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
            title="Düzenle"
          >
            <Pencil className="w-3 h-3" />
          </button>
          {module.type !== 'DrawingArea' && (
            <button
              onClick={e => { e.stopPropagation(); removeTemplateModule(module.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Kaldır"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Module Button ─── */

function AddModuleButton({ definition, alreadyExists, onAdd }: {
  definition: typeof MODULE_DEFINITIONS[number];
  alreadyExists: boolean;
  onAdd: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const IconComp = MODULE_ICONS[definition.type];
  const colors = MODULE_COLORS[definition.type];

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        onClick={() => !alreadyExists && onAdd()}
        disabled={alreadyExists}
        className={cn(
          'w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all text-left',
          alreadyExists
            ? 'border-slate-800/40 bg-slate-900/20 opacity-30 cursor-not-allowed'
            : 'border-slate-700/40 bg-slate-900/30 hover:border-cyan-500/30 hover:bg-slate-800/60 group'
        )}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: alreadyExists ? '#1e293b' : colors.primary + '12', color: alreadyExists ? '#475569' : colors.primary }}
        >
          {IconComp && <IconComp size={13} />}
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn("text-[9px] font-bold block truncate", alreadyExists ? "text-slate-600" : "text-slate-300")}>
            {definition.label}
          </span>
          {definition.requirement && (
            <span className={cn('text-[6px] font-black uppercase tracking-wider px-1 py-px rounded border inline-block mt-0.5', REQ_BADGE[definition.requirement].cls)}>
              {REQ_BADGE[definition.requirement].text}
            </span>
          )}
        </div>
        {!alreadyExists && <Plus className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />}
      </button>
    </div>
  );
}

/* ─── Main Panel ─── */

export function TemplateModulePanel({ mobileMenu, setMobileMenu }: TemplateModulePanelProps) {
  const {
    templateModules, selectedTemplateModuleId, templateState,
    addTemplateModule, setSelectedTemplateModuleId,
  } = useEditorStore();

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const handleAddModule = (type: TemplateModuleType) => {
    addTemplateModule(type, { x: 5, y: 70, w: 90, h: 20 });
  };

  const handleOpenEdit = (moduleId: string) => {
    setSelectedTemplateModuleId(moduleId);
    setIsEditDrawerOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDrawerOpen(false);
  };

  return (
    <>
      <aside
        id="template-module-panel"
        className={cn(
          'fixed md:static inset-y-0 right-0 w-72 bg-slate-950/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col z-30 md:z-10 shadow-2xl transition-transform duration-300 overflow-hidden',
          mobileMenu === 'properties' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-slate-800/60 bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Blocks className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-200">Modüller</h2>
                <span className="text-[8px] text-slate-500 font-bold">{templateModules.length} modül aktif</span>
              </div>
            </div>
            <button onClick={() => setMobileMenu(null)} className="md:hidden p-1.5 text-slate-400 hover:text-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {templateModules.length > 0 && (
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Kağıtta</span>
                <button
                  onClick={() => setShowAddSection(!showAddSection)}
                  className="text-[8px] font-black uppercase tracking-wider text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Ekle
                </button>
              </div>

              {templateModules.map(module => (
                <ModuleRow
                  key={module.id}
                  module={module}
                  isSelected={module.id === selectedTemplateModuleId}
                  onSelect={() => setSelectedTemplateModuleId(module.id === selectedTemplateModuleId ? null : module.id)}
                  onEdit={() => handleOpenEdit(module.id)}
                  templateState={templateState}
                />
              ))}
            </div>
          )}

          {/* Add Section */}
          {(showAddSection || templateModules.length === 0) && (
            <div className={cn("p-3 space-y-1.5", templateModules.length > 0 && "border-t border-slate-800/40")}>
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Modül Ekle</span>
                {templateModules.length > 0 && (
                  <button onClick={() => setShowAddSection(false)} className="text-slate-600 hover:text-slate-400">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {MODULE_DEFINITIONS.map(def => {
                  const exists = def.type === 'DrawingArea' && templateModules.some(m => m.type === 'DrawingArea');
                  return (
                    <AddModuleButton
                      key={def.id}
                      definition={def}
                      alreadyExists={exists}
                      onAdd={() => handleAddModule(def.type)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Edit shortcut for selected */}
        {selectedTemplateModuleId && !isEditDrawerOpen && (
          <div className="shrink-0 p-3 border-t border-slate-800/60">
            <button
              onClick={() => setIsEditDrawerOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Düzenle
            </button>
          </div>
        )}
      </aside>

      {/* Edit Drawer — opens next to the right bar */}
      <ModuleEditDrawer isOpen={isEditDrawerOpen} onClose={handleCloseEdit} />
    </>
  );
}