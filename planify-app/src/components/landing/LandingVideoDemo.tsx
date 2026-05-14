'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, MonitorPlay } from 'lucide-react';

/**
 * Hero altında gösterilen ürün demo placeholder.
 * Production'da YouTube/Mux embed ile değiştirilir; şimdilik click-to-play poster ile LCP korunur.
 */
export default function LandingVideoDemo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            2 Dakikalık Tur
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
            Üyeliğinizden İlk Plana
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Editöre nasıl girilir, sürükle-bırak ile sembol nasıl eklenir, PDF nasıl alınır — hepsi 2 dakikada.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200">
          {/* Poster — gradient placeholder until real video is embedded */}
          <div
            className="aspect-video bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 relative cursor-pointer group"
            onClick={() => setPlaying(!playing)}
            role="button"
            aria-label={playing ? 'Videoyu duraklat' : 'Videoyu oynat'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setPlaying(!playing);
              }
            }}
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white text-blue-600 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {playing ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </div>
            </div>

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MonitorPlay className="w-5 h-5" />
                  <span className="text-sm font-bold">KolayTahliye — 2 Dakikada Plan Hazırlama</span>
                </div>
                <div className="flex items-center gap-3 text-xs opacity-80">
                  <span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Türkçe</span>
                  <span>·</span>
                  <span>HD 1080p</span>
                </div>
              </div>
            </div>
          </div>

          {/* When the real embed lands, swap the poster div for:
              {playing && <iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1" ... />}
          */}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Yakında: Türkçe altyazılı tam sürüm 5 dakikalık derin dalış videosu.
        </p>
      </div>
    </section>
  );
}
