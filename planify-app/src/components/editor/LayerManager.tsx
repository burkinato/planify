'use client';

import { Layers, Eye, EyeOff, Lock, Unlock, Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';

export function LayerManager() {
  const { elements, layers, activeLayerId, setActiveLayer, toggleLayerVisibility, toggleLayerLock, addLayer, removeLayer, renameLayer } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    addLayer(`Katman ${layers.length + 1}`);
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
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-4 flex justify-between items-center bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-600" />
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">Katmanlar</span>
        </div>
        <button onClick={handleAdd} className="flex h-6 w-6 items-center justify-center bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white rounded-md transition-all shadow-sm" title="Yeni Katman Ekle">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {layers.map((layer) => {
          const elementCount = elements.filter(e => e.layerId === layer.id).length;
          const isActive = activeLayerId === layer.id;

          return (
            <div
              key={layer.id}
              className={cn(
                "group relative flex items-center p-2 rounded-xl border transition-all cursor-pointer",
                isActive 
                  ? "bg-white border-cyan-300 shadow-sm shadow-cyan-900/5 ring-1 ring-cyan-500/10" 
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              )}
              onClick={() => setActiveLayer(layer.id)}
              onDoubleClick={() => startEdit(layer.id, layer.name)}
            >
              {/* Drag Handle (Visual Only for now) */}
              <div className="text-slate-300 mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              {/* Layer Info */}
              <div className="flex-1 min-w-0 pr-2">
                {editingId === layer.id ? (
                  <input
                    autoFocus
                    type="text"
                    className="w-full text-xs font-bold bg-slate-50 text-slate-800 px-2 py-1 rounded outline-none border border-cyan-500 shadow-inner"
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
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-bold truncate transition-colors", 
                      isActive ? "text-slate-900" : "text-slate-600"
                    )}>
                      {layer.name}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {elementCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    layer.locked 
                      ? "text-red-500 bg-red-50 hover:bg-red-100 opacity-100" 
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                  )}
                  title={layer.locked ? "Kilidi Aç" : "Kilitle"}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    layer.visible 
                      ? "text-cyan-600 hover:bg-cyan-50 opacity-100" 
                      : "text-slate-300 hover:text-slate-500 hover:bg-slate-100 opacity-50 group-hover:opacity-100"
                  )}
                  title={layer.visible ? "Gizle" : "Göster"}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {layer.id !== 'default' && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(window.confirm('Bu katmanı ve içindeki tüm nesneleri silmek istediğinize emin misiniz?')) {
                        removeLayer(layer.id); 
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all ml-1"
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
      
      {/* Help Text */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed text-center">
          Yeniden adlandırmak için katmana <b className="text-slate-700">çift tıklayın</b>.
        </p>
      </div>
    </div>
  );
}
