'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import { Shield, ArrowRight, CheckCircle2, Building, Heart, GraduationCap, Flame, PlayCircle } from 'lucide-react';

const TRUSTED = [
  { name: 'MetroİSTANBUL', Icon: Building },
  { name: 'Acıbadem Sağlık', Icon: Heart },
  { name: 'Anadolu Eğitim', Icon: GraduationCap },
  { name: 'Yangın Guard OSGB', Icon: Flame },
  { name: 'İzmir Belediyesi', Icon: Building },
  { name: 'Sağlık Bakanlığı', Icon: Heart },
  { name: 'MEB Okul Ağı', Icon: GraduationCap },
  { name: 'SafeWork OSGB', Icon: Shield },
];

function EditorPreview() {
  return (
    <div className="relative animate-landing-float w-full max-w-[600px] mx-auto z-10">
      {/* Glow behind the editor */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[1.5rem] blur-2xl opacity-20" />
      
      <div className="relative rounded-2xl shadow-2xl shadow-blue-900/5 border border-slate-200/60 bg-white/90 backdrop-blur-xl overflow-hidden ring-1 ring-slate-900/5">
        {/* Browser chrome */}
        <div className="h-10 bg-slate-50/80 border-b border-slate-200/80 flex items-center px-4 gap-2 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm" />
          <div className="flex-1 flex justify-center">
            <div className="bg-white/80 rounded-md px-3 py-1 text-[11px] font-medium text-slate-500 border border-slate-200/80 w-56 text-center shadow-sm">
              <span className="opacity-50">https://</span>app.planify.com.tr
            </div>
          </div>
        </div>
        {/* App UI */}
        <div className="flex" style={{ height: 340 }}>
          {/* Left toolbar */}
          <div className="w-14 bg-slate-900 flex flex-col items-center py-4 gap-3 shrink-0">
            {['W','D','P','S','⬡'].map((t, i) => (
              <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold cursor-pointer transition-all duration-300 ${i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                {t}
              </div>
            ))}
          </div>
          {/* Canvas */}
          <div className="flex-1 bg-[#F8FAFC] relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#cbd5e1 0.8px,transparent 0)', backgroundSize: '24px 24px' }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 340" fill="none">
              {/* Main walls */}
              <rect x="30" y="40" width="320" height="260" stroke="#0F172A" strokeWidth="6" fill="white" />
              {/* Interior walls */}
              <line x1="160" y1="40" x2="160" y2="190" stroke="#0F172A" strokeWidth="4" />
              <line x1="160" y1="190" x2="350" y2="190" stroke="#0F172A" strokeWidth="4" />
              <line x1="260" y1="40" x2="260" y2="190" stroke="#0F172A" strokeWidth="4" />
              {/* Doors (arcs) */}
              <path d="M160 110 Q145 110 145 95" stroke="#64748B" strokeWidth="1.5" fill="none" />
              <line x1="160" y1="110" x2="160" y2="95" stroke="#64748B" strokeWidth="1.5" />
              {/* Exit signs */}
              <rect x="15" y="158" width="15" height="10" rx="2" fill="#10B981" />
              <text x="35" y="167" fill="#10B981" fontSize="7" fontWeight="bold">ÇIKIŞ</text>
              <rect x="355" y="158" width="15" height="10" rx="2" fill="#10B981" />
              <text x="335" y="167" fill="#10B981" fontSize="7" fontWeight="bold">ÇIKIŞ</text>
              {/* Selection (Active Wall) */}
              <rect x="157" y="115" width="6" height="75" fill="rgba(37,99,235,0.15)" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="160" cy="115" r="4" fill="#3B82F6" className="animate-pulse" />
              <circle cx="160" cy="190" r="4" fill="#3B82F6" className="animate-pulse" />
            </svg>
          </div>
          {/* Right panel */}
          <div className="w-52 bg-white/95 backdrop-blur-md border-l border-slate-200 p-4 shrink-0 flex flex-col">
            <p className="text-[12px] font-black text-slate-900 mb-4 tracking-tight">Properties</p>
            {[['Length', '4.50 m'], ['Height', '3.00 m'], ['Thickness', '20 cm']].map(([k, v]) => (
              <div key={k} className="mb-3">
                <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{k}</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-700 font-semibold shadow-sm">{v}</div>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Fill Material</p>
              <div className="flex gap-2">
                {['#0F172A', '#3B82F6', '#10B981', '#F59E0B'].map((c, i) => (
                  <div key={c} className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 shadow-sm ${i === 0 ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="mt-auto pt-4">
              <button className="w-full text-[12px] font-bold text-white bg-slate-900 rounded-xl py-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ISO Badge */}
      <div className="absolute -top-4 -right-4 bg-white border border-slate-100 text-slate-900 text-[11px] font-bold px-4 py-2 rounded-2xl shadow-xl z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        ISO 7010 Certified
      </div>
      {/* Floating success card */}
      <div className="absolute -bottom-6 -left-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 p-3.5 animate-landing-float-delayed z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900">Plan Generated!</p>
            <p className="text-[11px] font-medium text-slate-500">Ready in 2.4s 🎉</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingHero() {
  const { user } = useAuthStore(useShallow((s) => ({ user: s.user })));

  return (
    <>
      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-[#FAFAFC] selection:bg-blue-100 selection:text-blue-900">
        {/* Background Mesh Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/60 blur-[100px]" />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-indigo-50/50 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-violet-100/40 blur-[120px]" />
        </div>
        
        <div className="absolute inset-0 dot-pattern opacity-30 mix-blend-multiply" />

        <div className="relative max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[85vh]">
          {/* Left copy */}
          <div className="space-y-10 animate-fade-up z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-[13px] font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              Yeni Nesil Tahliye Planı Mimarı
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900">
              Tahliye Planlarını Günlerce Değil, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Dakikalar İçinde Çizin.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-xl">
              İSG uzmanları ve mimarlar için geliştirilmiş akıllı CAD motoru. Hiçbir çizim tecrübesi gerektirmeden, ISO 7010 uyumlu ve baskıya hazır tahliye planları oluşturun.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {user ? (
                <Link href="/dashboard" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  Dashboard&apos;a Git <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-300">
                  Ücretsiz Çizmeye Başla <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <a href="#how" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/50 backdrop-blur-md text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-all shadow-sm">
                <PlayCircle className="w-5 h-5 text-blue-600" /> Demoyu İzle
              </a>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-slate-200/60">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm z-10">
                  +500
                </div>
              </div>
              <div>
                <div className="flex gap-1 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-[13px] font-medium text-slate-600">500+ İSG profesyoneli tarafından sevildi</p>
              </div>
            </div>
          </div>

          {/* Right mockup */}
          <div className="hidden lg:block animate-fade-up animate-fade-up-delay-3 relative">
            <EditorPreview />
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-14 bg-white border-y border-slate-100 overflow-hidden">
        <p className="text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">
          Sektör Liderleri Tarafından Güveniliyor
        </p>
        <div className="relative flex overflow-hidden">
          {/* Gradient Masks for smooth scroll edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="logo-slider-track">
            {[...TRUSTED, ...TRUSTED, ...TRUSTED].map((org, i) => (
              <div key={i} className="flex items-center gap-3 px-10 min-w-max select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <org.Icon className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-slate-800 font-bold text-sm tracking-tight">{org.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
