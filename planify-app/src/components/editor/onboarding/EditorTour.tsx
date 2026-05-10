'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import { ChevronRight, X, Sparkles } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'right' | 'left' | 'top' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '#editor-sidebar',
    title: 'Çizim Araçları',
    description: 'Mimari çizimlerinizi yapmak ve sembolleri yerleştirmek için buradaki araçları kullanın.',
    position: 'right'
  },
  {
    target: '#editor-canvas',
    title: 'Çalışma Alanı',
    description: 'Planınızı bu alanda özgürce çizebilir, nesneleri sürükleyip boyutlandırabilirsiniz.',
    position: 'right'
  },
  {
    target: '#template-module-panel',
    title: 'Modül Paneli',
    description: 'Talimatlar, lejand ve antet modüllerini buradan yönetebilirsiniz.',
    position: 'top'
  },
  {
    target: '#header-export-btn',
    title: 'Yayınla ve Paylaş',
    description: 'Planınız bittiğinde yüksek çözünürlüklü çıktı almak için bu butonu kullanın.',
    position: 'bottom'
  }
];

export function EditorTour() {
  const { tourVisible, tourStep, setTourVisible, setTourStep, language } = useEditorStore();
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (tourVisible) {
      const step = TOUR_STEPS[tourStep];
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [tourVisible, tourStep]);

  if (!tourVisible || !coords) return null;

  const step = TOUR_STEPS[tourStep];
  const isLast = tourStep === TOUR_STEPS.length - 1;

  const t = {
    tr: { next: 'Sıradaki', finish: 'Anladım', skip: 'Turu Geç' },
    en: { next: 'Next', finish: 'Got it', skip: 'Skip Tour' }
  };
  const curr = t[language || 'tr'];

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none">
      {/* Overlay with hole */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-all duration-500"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${coords.left}px 100%, 
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px 100%, 
            100% 100%, 100% 0%
          )`
        }}
      />

      {/* Tooltip */}
      <div 
        className={cn(
          "absolute pointer-events-auto w-72 bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 transition-all duration-500 animate-float",
          step.position === 'right' && "ml-4",
          step.position === 'left' && "mr-4",
          step.position === 'top' && "mb-4",
          step.position === 'bottom' && "mt-4"
        )}
        style={{
          top: step.position === 'bottom' ? coords.top + coords.height : step.position === 'top' ? coords.top - 180 : coords.top + (coords.height / 2) - 90,
          left: step.position === 'right' ? coords.left + coords.width : step.position === 'left' ? coords.left - 300 : coords.left + (coords.width / 2) - 144,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{step.title}</h4>
        </div>

        <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <button 
            onClick={() => setTourVisible(false)}
            className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
          >
            {curr.skip}
          </button>

          <button 
            onClick={() => {
              if (isLast) setTourVisible(false);
              else setTourStep(tourStep + 1);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
          >
            {isLast ? curr.finish : curr.next}
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mt-4 justify-center">
          {TOUR_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === tourStep ? "w-4 bg-indigo-500" : "w-1 bg-slate-200"
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
