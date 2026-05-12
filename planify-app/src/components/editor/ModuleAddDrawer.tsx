import React, { useEffect, useState } from 'react';
import { 
  X, 
  Info, 
  Search, 
  Plus,
  ChevronRight
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useShallow } from 'zustand/react/shallow';
import { MODULE_ICONS, MODULE_COLORS } from './modules/ModuleIconSet';
import { MODULE_DEFINITIONS } from '@/lib/editor/templateLayouts';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────
 *  ModuleAddDrawer — Yeni Modül Ekleme Paneli
 *  Zengin animasyonlar, kategori bazlı listeleme ve premium UI.
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleAddDrawer({ isOpen, onClose }: Props) {
  const { addTemplateModule, templateModules } = useEditorStore(useShallow(state => ({
    addTemplateModule: state.addTemplateModule,
    templateModules: state.templateModules
  })));
  const [searchQuery, setSearchQuery] = useState('');

  // ESC ile kapatma
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filteredModules = MODULE_DEFINITIONS.filter(def => 
    def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    def.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] transition-opacity duration-500",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside 
        className={cn(
          "fixed inset-y-0 right-0 w-[400px] bg-slate-900 border-l border-slate-700/50 z-[101] shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="relative h-48 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-transparent z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent)] z-0" />
          
          <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-md">
                <Plus className="w-5 h-5 text-cyan-400" />
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Modül Ekle</h2>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest opacity-80">Projenizi zenginleştirin</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text"
              placeholder="Modül ara... (ör: Yangın, Rota)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs font-bold text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-8">
          {/* Categories / Grid */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tüm Modüller</span>
                <span className="text-[9px] font-bold text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">{filteredModules.length} Seçenek</span>
             </div>

             <div className="grid grid-cols-1 gap-2.5">
               {filteredModules.map((def, idx) => {
                 const colors = MODULE_COLORS[def.type];
                 const IconComp = MODULE_ICONS[def.type];
                 const alreadyExists = def.type === 'DrawingArea' && templateModules.some(m => m.type === 'DrawingArea');
                 
                 return (
                   <button
                     key={def.id}
                     disabled={alreadyExists}
                     onClick={() => {
                        addTemplateModule(def.type);
                        onClose();
                     }}
                     style={{ "--idx": idx } as React.CSSProperties}
                     className={cn(
                       "group relative flex items-center gap-4 p-3 rounded-2xl border border-slate-800 bg-slate-800/30 text-left transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-cyan-900/5",
                       alreadyExists && "opacity-40 cursor-not-allowed grayscale",
                       "animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both"
                     )}
                   >
                     <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                        style={{ backgroundColor: colors.primary + '15', color: colors.primary }}
                     >
                       {IconComp && <IconComp size={20} />}
                     </div>

                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide truncate">{def.label}</h3>
                         {def.requirement === 'required' && (
                            <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-400 uppercase tracking-tighter">Zorunlu</span>
                         )}
                       </div>
                       <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mt-0.5 group-hover:text-slate-400 transition-colors">{def.description}</p>
                     </div>

                     <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all -translate-x-2 group-hover:translate-x-0">
                       <ChevronRight className="w-4 h-4 text-white" />
                     </div>

                     {/* Progress/Success indicator if already added */}
                     {alreadyExists && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[7px] font-black text-slate-400 uppercase">EKLENDİ</span>
                        </div>
                     )}
                   </button>
                 );
               })}
             </div>
          </div>
          
          {/* Empty State */}
          {filteredModules.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-700" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-300">Sonuç Bulunamadı</h3>
                   <p className="text-xs text-slate-500 mt-1">Lütfen farklı bir anahtar kelime deneyin.</p>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
            <Info className="w-5 h-5 text-cyan-500 shrink-0" />
            <p className="text-[9px] text-cyan-200/60 leading-relaxed font-bold uppercase tracking-wider">
               Modüller kağıt üzerine otomatik olarak yerleştirilir. 
               Yerleşimden sonra sürükleyerek konumunu değiştirebilirsiniz.
            </p>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .animate-in {
          animation-delay: calc(var(--idx) * 40ms);
        }
      `}</style>
    </>
  );
}
