'use client';

import { Layers, Eye, EyeOff, Lock, Unlock, Plus, Trash2, GripVertical, Info, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';

export function LayerManager() {
  const { elements, layers, activeLayerId, setActiveLayer, toggleLayerVisibility, toggleLayerLock, addLayer, removeLayer, renameLayer } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    addLayer(`Yeni Katman ${layers.length + 1}`);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const finishEdit = () => {
    if (editingId && editName.trim()) {
      renameLayer(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Premium Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center border border-white shadow-sm">
            <Layers className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Katman Havuzu</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{layers.length} Aktif Kanal</p>
          </div>
        </div>
        <button 
          onClick={handleAdd} 
          className="group relative flex h-10 w-10 items-center justify-center bg-slate-900 text-white hover:bg-emerald-500 rounded-xl transition-all duration-500 shadow-xl shadow-slate-900/10 active:scale-95" 
          title="Yeni Katman Ekle"
        >
          <Plus className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" />
          <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Layer List Container */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
        {layers.map((layer) => {
          const elementCount = elements.filter(e => e.layerId === layer.id).length;
          const isActive = activeLayerId === layer.id;

          return (
            <div
              key={layer.id}
              className={cn(
                "group relative flex items-center p-4 rounded-[24px] border transition-all duration-500 cursor-pointer overflow-hidden",
                isActive 
                  ? "bg-white border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] transform -translate-y-1 scale-[1.02]" 
                  : "bg-white/40 border-white/60 hover:bg-white hover:border-white hover:shadow-lg"
              )}
              onClick={() => setActiveLayer(layer.id)}
              onDoubleClick={() => startEdit(layer.id, layer.name)}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-emerald-500 rounded-r-full animate-in slide-in-from-left duration-500" />
              )}

              {/* Drag Handle (Visual Only) */}
              <div className="text-slate-300 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Layer Info */}
              <div className="flex-1 min-w-0 pr-3">
                {editingId === layer.id ? (
                  <input
                    autoFocus
                    type="text"
                    className="w-full text-xs font-black bg-slate-50 text-slate-900 px-4 py-2 rounded-xl outline-none border-2 border-emerald-500 shadow-inner"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={finishEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex flex-col gap-0.5">
                    <span className={cn(
                      "text-xs font-black truncate transition-colors uppercase tracking-widest", 
                      isActive ? "text-slate-900" : "text-slate-500"
                    )}>
                      {layer.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-300 bg-slate-100/50 px-2 py-0.5 rounded-lg border border-slate-200/20 group-hover:text-emerald-600 transition-colors">
                        {elementCount} Obje
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    layer.locked 
                      ? "text-red-500 bg-red-50 border border-red-100 shadow-sm" 
                      : "text-slate-300 hover:text-slate-900 hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                  )}
                  title={layer.locked ? "Kilidi Aç" : "Kilitle"}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    layer.visible 
                      ? "text-emerald-500 bg-emerald-50 border border-emerald-100 shadow-sm" 
                      : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                  )}
                  title={layer.visible ? "Gizle" : "Göster"}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {layer.id !== 'default' && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(window.confirm('Bu katmanı silmek istediğinize emin misiniz?')) {
                        removeLayer(layer.id); 
                      }
                    }}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm hover:shadow-red-500/20 border border-transparent hover:border-red-600"
                    title="Katmanı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer / Smart Tip */}
      <div className="p-6 border-t border-white/60 bg-white/40 backdrop-blur-md rounded-t-[32px]">
        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl shadow-xl">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="text-[9px] font-black text-white uppercase tracking-widest leading-none mb-1">Profesyonel İpucu</div>
            <div className="text-[8px] font-bold text-slate-400 uppercase leading-tight">Katmanı adlandırmak için<br/>üzerine çift tıkla.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
