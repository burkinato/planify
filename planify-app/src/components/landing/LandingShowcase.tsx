'use client';
import { useState } from 'react';
import { Shield } from 'lucide-react';

const TABS = [
  { id: 'editor', label: '🖊️ Plan Editörü' },
  { id: 'symbols', label: '🔣 Sembol Kütüphanesi' },
  { id: 'pdf', label: '📄 PDF Çıktı' },
];

const TAB_INFO: Record<string, { title: string; bullets: string[] }> = {
  editor: {
    title: 'Profesyonel CAD Kalitesinde Editör',
    bullets: [
      'Manyetik duvar snap ve T/L köşe trim sistemi',
      'Sürükle-bırak ile kapı, pencere, merdiven ekleme',
      'Ortho modu ve canlı metre ölçüm göstergesi',
      'Sınırsız undo/redo geçmiş desteği',
    ],
  },
  symbols: {
    title: 'ISO 7010 Uyumlu Sembol Kütüphanesi',
    bullets: [
      '60+ mevzuata uygun tahliye sembolü',
      'Doğru renk kodları (yeşil, kırmızı, mavi)',
      'Ekleme anında otomatik lejand kaydı',
      'Yeni sembol talepleriniz 48 saatte eklenir',
    ],
  },
  pdf: {
    title: 'Denetime Hazır PDF Çıktısı',
    bullets: [
      'A3 ve A4 formatlarında yüksek çözünürlük',
      'Kurumunuza özel antet ve lejand desteği',
      'MEBBİS 150KB boyut limitine otomatik uyum',
      'Vektörel format — baskıda piksel sorunu yok',
    ],
  },
};

function EditorTab() {
  return (
    <div className="flex h-72 md:h-80">
      <div className="w-12 bg-slate-900 flex flex-col items-center py-3 gap-3 shrink-0">
        {['W', 'D', 'P', 'S', '⬡'].map((t, i) => (
          <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{t}</div>
        ))}
      </div>
      <div className="flex-1 relative overflow-hidden bg-slate-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#cbd5e1 0.8px,transparent 0)', backgroundSize: '24px 24px' }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 280" fill="none">
          <rect x="20" y="20" width="300" height="240" stroke="#1e40af" strokeWidth="5" fill="white" />
          <line x1="140" y1="20" x2="140" y2="160" stroke="#1e40af" strokeWidth="3.5" />
          <line x1="140" y1="160" x2="320" y2="160" stroke="#1e40af" strokeWidth="3.5" />
          <line x1="230" y1="20" x2="230" y2="160" stroke="#1e40af" strokeWidth="3.5" />
          <rect x="145" y="25" width="80" height="80" fill="rgba(37,99,235,0.07)" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4 2" />
          {[145, 225, 145, 225].map((x, i) => <circle key={i} cx={x} cy={i < 2 ? 25 : 105} r="4" fill="#2563eb" />)}
          <text x="30" y="150" fill="#16a34a" fontSize="8" fontWeight="bold">↑ ÇIKIŞ</text>
          <text x="250" y="250" fill="#16a34a" fontSize="8" fontWeight="bold">↓ ÇIKIŞ</text>
        </svg>
      </div>
      <div className="w-40 bg-white border-l border-slate-200 p-3 shrink-0">
        <p className="text-[11px] font-bold text-slate-600 mb-3">Özellikler</p>
        {[['Genişlik', '4.50 m'], ['Yük.', '3.00 m'], ['Kalınlık', '20 cm']].map(([k, v]) => (
          <div key={k} className="mb-2">
            <p className="text-[10px] text-slate-400 mb-0.5">{k}</p>
            <div className="bg-blue-50 border border-blue-100 rounded px-2 py-1 text-[11px] text-blue-700 font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SymbolsTab() {
  const symbols = ['Acil Çıkış', 'Yangın Sönd.', 'Alarm Butonu', 'İlk Yardım', 'Hortum Dolabı', 'Toplanma Al.', 'Merdivenler', 'Asansör Yok', 'Yangın Kapısı', 'Köpüklü Sönd.', 'Sprinkler', 'Gaz Detektörü'];
  return (
    <div className="p-5 bg-slate-50 h-72 md:h-80 overflow-auto">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">ISO 7010 · 60+ Sembol</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
        {symbols.map((s, i) => (
          <div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer border-2 transition-all p-1 ${i === 0 ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: i % 3 === 2 ? '#2563eb' : i % 2 === 0 ? '#16a34a' : '#ef4444' }}>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[8px] text-slate-500 text-center leading-tight">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PdfTab() {
  return (
    <div className="h-72 md:h-80 bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded w-56 h-64 p-4 flex flex-col border border-slate-200">
        <div className="border-b-2 border-blue-700 pb-2 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 bg-blue-700 rounded-sm flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-[9px] font-black text-blue-900 uppercase tracking-wide">Acil Durum Tahliye Planı</span>
          </div>
          <p className="text-[8px] text-slate-400">Tarih: 24 Nisan 2026 · A3 · Sayfa 1/1</p>
        </div>
        <div className="flex-1 bg-slate-50 rounded border border-slate-200 mb-3">
          <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
            <rect x="5" y="5" width="110" height="80" stroke="#1e40af" strokeWidth="2.5" fill="white" />
            <line x1="50" y1="5" x2="50" y2="55" stroke="#1e40af" strokeWidth="1.5" />
            <line x1="50" y1="55" x2="115" y2="55" stroke="#1e40af" strokeWidth="1.5" />
            <line x1="82" y1="5" x2="82" y2="55" stroke="#1e40af" strokeWidth="1.5" />
            <text x="8" y="48" fill="#16a34a" fontSize="5.5" fontWeight="bold">↑ ÇIKIŞ</text>
            <text x="55" y="80" fill="#16a34a" fontSize="5.5" fontWeight="bold">↓ ÇIKIŞ</text>
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-y-1">
          {[['🟢', 'Acil Çıkış (2)'], ['🔴', 'Yangın Sönd. (3)'], ['🟢', 'Toplanma (1)'], ['🔵', 'Merdiven (2)']].map(([e, l]) => (
            <div key={l} className="flex items-center gap-1">
              <span className="text-[8px]">{e}</span>
              <span className="text-[7px] text-slate-500">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingShowcase() {
  const [active, setActive] = useState('editor');
  const info = TAB_INFO[active];

  return (
    <section id="showcase" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 space-y-4">
          <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            Uygulama Görüntüleri
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900">Planify&apos;ı Keşfedin</h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Güçlü editörden zengin sembol kütüphanesine, mükemmel PDF çıktısına kadar her şey burada.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left info */}
          <div className="space-y-8">
            {/* Tab buttons */}
            <div className="flex gap-2 flex-wrap">
              {TABS.map(({ id, label }) => (
                <button key={id} onClick={() => setActive(id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${active === id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{info.title}</h3>
              <ul className="space-y-3">
                {info.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-600">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm">
              Ücretsiz Kullanmaya Başla →
            </a>
          </div>

          {/* Right mockup */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="h-9 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded px-3 py-0.5 text-[11px] text-slate-400 border border-slate-200 w-44 text-center">
                  app.planify.com.tr
                </div>
              </div>
            </div>
            {active === 'editor' && <EditorTab />}
            {active === 'symbols' && <SymbolsTab />}
            {active === 'pdf' && <PdfTab />}
          </div>
        </div>
      </div>
    </section>
  );
}
