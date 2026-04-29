'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import '@/lib/editor/konva-init';

const EditorApp = dynamic(() => import('@/components/editor/EditorApp'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-surface-950">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-emerald to-accent-emerald-dark flex items-center justify-center">
          <svg className="w-7 h-7 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div className="text-sm font-bold text-surface-400 tracking-widest uppercase">Planify Yükleniyor...</div>
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

