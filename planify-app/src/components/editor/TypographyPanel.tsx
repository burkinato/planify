'use client';

import { X } from 'lucide-react';

interface TypographyPanelProps {
  advancedType: 'title' | 'body' | 'meta' | null;
  setAdvancedType: (type: 'title' | 'body' | 'meta' | null) => void;
  focusedRegion: { id: string } | undefined;
  focusedRegionState: Record<string, unknown> | undefined;
  updateTemplateRegion: (regionId: string, updates: Record<string, unknown>) => void;
}

const COLORS = [
  '#020617', // Slate 950
  '#065f46', // Emerald 800
  '#9f1239', // Rose 800
  '#1e40af', // Blue 800
  '#854d0e', // Yellow 800
  '#dc2626', // Red 600
  '#7c3aed', // Violet 600
  '#059669', // Emerald 600
];

export function TypographyPanel({ 
  advancedType, 
  setAdvancedType, 
  focusedRegion, 
  focusedRegionState, 
  updateTemplateRegion 
}: TypographyPanelProps) {
  if (!advancedType || !focusedRegion) return null;

  const typeLabel = advancedType === 'title' ? 'BAŞLIK' : advancedType === 'body' ? 'İÇERİK' : 'META';
  
  // Determine accent color based on type
  const accentColor = advancedType === 'title' ? 'blue' : advancedType === 'body' ? 'emerald' : 'amber';

  // Get current values or fallbacks
  const currentSize = (focusedRegionState?.[`${advancedType}Size`] as number) ?? (advancedType === 'title' ? 32 : advancedType === 'body' ? 14 : 12);
  const currentWeight = (focusedRegionState?.[`${advancedType}Weight`] as string) ?? (advancedType === 'title' ? 'black' : 'normal');
  const currentLetterSpacing = (focusedRegionState?.[`${advancedType}LetterSpacing`] as number) ?? 0;
  const currentLineHeight = (focusedRegionState?.[`${advancedType}LineHeight`] as number) ?? (advancedType === 'title' ? 1.2 : 1.5);
  const currentColor = (focusedRegionState?.[`${advancedType}Color`] as string) ?? '#020617';

  const updateField = (field: string, value: unknown) => {
    updateTemplateRegion(focusedRegion.id, { [field]: value });
  };

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className={`flex items-center justify-between p-3 rounded-xl border bg-slate-50 border-${accentColor}-200`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse bg-${accentColor}-500`} />
          <span className={`text-[10px] font-black tracking-[0.2em] text-${accentColor}-700`}>
            {typeLabel} DÜZENLEME
          </span>
        </div>
        <button 
          onClick={() => setAdvancedType(null)}
          className={`p-1.5 rounded-lg hover:bg-white transition-colors text-${accentColor}-500`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Font Size */}
      <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yazı Boyutu</span>
          <span className={`text-xs font-black tabular-nums text-${accentColor}-600`}>{currentSize}px</span>
        </div>
        <input 
          type="range" min="8" max="120" step="1"
          value={currentSize}
          onChange={(e) => updateField(`${advancedType}Size`, Number(e.target.value))}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-${accentColor}-500 [&::-webkit-slider-thumb]:shadow-md`}
        />
      </div>

      {/* Font Weight */}
      <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-3 shadow-sm">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kalınlık</span>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['normal', 'bold', 'black'] as const).map((w) => (
            <button
              key={w}
              onClick={() => updateField(`${advancedType}Weight`, w)}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${currentWeight === w ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
            >
              {w === 'normal' ? 'Normal' : w === 'bold' ? 'Kalın' : 'Çok Kalın'}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Grid: Letter Spacing & Line Height */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Harf Aralığı</span>
            <span className="text-[10px] font-black text-slate-600 tabular-nums">{currentLetterSpacing}px</span>
          </div>
          <input 
            type="range" min="-4" max="20" step="0.5"
            value={currentLetterSpacing}
            onChange={(e) => updateField(`${advancedType}LetterSpacing`, Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-500"
          />
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Satır Yüksekliği</span>
            <span className="text-[10px] font-black text-slate-600 tabular-nums">{currentLineHeight}</span>
          </div>
          <input 
            type="range" min="0.5" max="3.0" step="0.1"
            value={currentLineHeight}
            onChange={(e) => updateField(`${advancedType}LineHeight`, Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-500"
          />
        </div>
      </div>

      {/* Color Palette */}
      <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-3 shadow-sm">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Renk</span>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateField(`${advancedType}Color`, c)}
              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${currentColor === c ? 'border-slate-900 shadow-md scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="relative">
            <input 
              type="color"
              value={currentColor}
              onChange={(e) => updateField(`${advancedType}Color`, e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
            />
            <div className={`w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-slate-500 transition-colors bg-slate-50 ${currentColor !== '#020617' && !COLORS.includes(currentColor) ? '!border-solid !border-slate-400' : ''}`}
            style={currentColor !== '#020617' && !COLORS.includes(currentColor) ? { backgroundColor: currentColor } : {}}
            >
              {!COLORS.includes(currentColor) && currentColor !== '#020617' && <div className="w-2 h-2 rounded-full bg-white/50" />}
            </div>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <button 
        onClick={() => setAdvancedType(null)}
        className={`w-full py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-transform active:scale-95 bg-${accentColor}-500 hover:opacity-90`}
      >
        TAMAMLANDI
      </button>
    </div>
  );
}
