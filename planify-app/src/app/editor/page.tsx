'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import '@/lib/editor/konva-init';

import { Sparkles } from 'lucide-react';

const EditorApp = dynamic(() => import('@/components/editor/EditorApp'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050b16]">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
        <div className="absolute inset-4 rounded-full border-4 border-cyan-500/20 border-b-cyan-500 animate-spin-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-white font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
          Planify <span className="text-emerald-400">Editor</span>
        </div>
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Çalışma Alanı Hazırlanıyor...
        </div>
      </div>
    </div>
  ),
});

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorApp />
    </Suspense>
  );
}

