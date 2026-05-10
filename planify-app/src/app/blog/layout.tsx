import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Share2 } from 'lucide-react';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Anasayfa</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/register" className="px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-black mb-4">Profesyonel Tahliye Planları Hazırlamaya Hazır mısınız?</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Planify ile dakikalar içinde ISO standartlarına uygun planlar oluşturun.</p>
          <Link href="/register" className="inline-flex px-8 py-4 bg-white text-slate-900 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">
            Hemen Kaydolun
          </Link>
        </div>
      </footer>
    </div>
  );
}
