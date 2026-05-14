import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { EditorElement } from '@/types/editor';

interface DimensionInputOverlayProps {
  dimInput: {
    screenX: number;
    screenY: number;
    frozenLine: number[];
    finalX: number;
    finalY: number;
    elementData: Partial<EditorElement>;
    value: string;
  };
  setDimInput: React.Dispatch<React.SetStateAction<{
    screenX: number;
    screenY: number;
    frozenLine: number[];
    finalX: number;
    finalY: number;
    elementData: Partial<EditorElement>;
    value: string;
  } | null>>;
  tool: string;
  scaleConfig: { pixelsPerMeter: number; unit: 'm' | 'cm' | 'mm' };
  setScaleConfig: React.Dispatch<React.SetStateAction<{ pixelsPerMeter: number; unit: 'm' | 'cm' | 'mm' }>>;
  fromDisplayUnit: (value: string) => number;
  addElement: (el: Partial<EditorElement>) => void;
  setCurrentLine: React.Dispatch<React.SetStateAction<number[] | null>>;
}

export function DimensionInputOverlay({
  dimInput,
  setDimInput,
  tool,
  scaleConfig,
  setScaleConfig,
  fromDisplayUnit,
  addElement,
  setCurrentLine
}: DimensionInputOverlayProps) {
  const dimInputRef = useRef<HTMLInputElement>(null);
  const previousToolRef = useRef(tool);

  // Auto-focus dim input when it appears
  useEffect(() => {
    if (dimInputRef.current) {
      dimInputRef.current.focus();
      dimInputRef.current.select();
    }
  }, []);

  const commitDimInput = useCallback((overridePixels?: number) => {
    if (!dimInput) return;
    const { frozenLine, finalX, finalY, elementData } = dimInput;
    let pts = frozenLine;
    if (overridePixels && overridePixels > 0) {
      const [x1, y1, x2, y2] = frozenLine;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const currentLen = Math.sqrt(dx * dx + dy * dy);
      if (currentLen > 0) {
        const ratio = overridePixels / currentLen;
        pts = [x1, y1, x1 + dx * ratio, y1 + dy * ratio];
      }
    }
    addElement({ ...elementData, points: pts, x: finalX, y: finalY } as Partial<EditorElement> as Omit<EditorElement, 'id'>);
    setDimInput(null);
  }, [dimInput, addElement, setDimInput]);

  // Dismiss dimInput if tool changes
  useEffect(() => {
    if (previousToolRef.current !== tool) {
      const timeoutId = window.setTimeout(() => {
        commitDimInput();
        setCurrentLine(null);
      }, 0);
      previousToolRef.current = tool;
      return () => window.clearTimeout(timeoutId);
    }
    previousToolRef.current = tool;
  }, [tool, commitDimInput, setCurrentLine]);

  return (
    <>
      {/* Backdrop — click outside to commit as-drawn */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => { commitDimInput(); setCurrentLine(null); }}
      />
      <div
        className="fixed z-[9999] animate-fade-in"
        style={{ left: dimInput.screenX, top: dimInput.screenY, transform: 'translateX(-50%)' }}
      >
        <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-2.5 w-48">
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KESİN ÖLÇÜ</div>
              <div className="text-[10px] font-bold text-white mt-0.5">
                {dimInput.elementData.type === 'wall' ? 'Duvar Uzunluğu' :
                  dimInput.elementData.type === 'window' ? 'Pencere Genişliği' :
                    dimInput.elementData.type === 'door' ? 'Kapı Genişliği' : 'Çizgi Uzunluğu'}
              </div>
            </div>
            <button
              onClick={() => { commitDimInput(); setCurrentLine(null); }}
              className="text-[9px] font-bold text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded-md transition-all"
            >
              ESC
            </button>
          </div>

          {/* Input Row */}
          <div className="flex items-stretch gap-1.5">
            <div className="flex-1 relative">
              <input
                ref={dimInputRef}
                autoFocus
                type="number"
                step={scaleConfig.unit === 'mm' ? '1' : scaleConfig.unit === 'cm' ? '0.1' : '0.01'}
                min="0.01"
                value={dimInput.value}
                onChange={(e) => setDimInput(prev => prev ? { ...prev, value: e.target.value } : null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const pixels = fromDisplayUnit(dimInput.value);
                    commitDimInput(pixels > 0 ? pixels : undefined);
                    setCurrentLine(null);
                  }
                  if (e.key === 'Escape') {
                    commitDimInput(); // commit as-drawn
                    setCurrentLine(null);
                  }
                }}
                className="w-full bg-white/10 text-white text-lg font-black text-center py-1.5 rounded-lg outline-none border border-white/20 focus:border-accent-indigo focus:bg-white/15 transition-all pr-10 placeholder-white/30"
                placeholder="0"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-accent-indigo">
                {scaleConfig.unit}
              </span>
            </div>
          </div>

          {/* Unit switcher */}
          <div className="flex gap-1 mt-1.5">
            {(['mm', 'cm', 'm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => {
                  // Convert current display value to new unit
                  const pixels = fromDisplayUnit(dimInput.value);
                  setScaleConfig({ ...scaleConfig, unit: u });
                  // Recalculate display value for new unit
                  const newMeters = pixels / scaleConfig.pixelsPerMeter;
                  const newVal = u === 'mm' ? (newMeters * 1000).toFixed(0) :
                    u === 'cm' ? (newMeters * 100).toFixed(1) :
                      newMeters.toFixed(2);
                  setDimInput(prev => prev ? { ...prev, value: newVal } : null);
                }}
                className={cn(
                  "flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                  scaleConfig.unit === u
                    ? "bg-accent-indigo text-white shadow-md shadow-accent-indigo/30"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                )}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Confirm button */}
          <button
            onClick={() => {
              const pixels = fromDisplayUnit(dimInput.value);
              commitDimInput(pixels > 0 ? pixels : undefined);
              setCurrentLine(null);
            }}
            className="w-full mt-1.5 py-1.5 bg-gradient-to-r from-accent-indigo to-accent-violet text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-md glow-accent"
          >
            Uygula ↵
          </button>
          <p className="text-[8px] text-white/40 text-center mt-1.5">Enter → Uygula &nbsp;|&nbsp; Esc → Geç</p>
        </div>
      </div>
    </>
  );
}
