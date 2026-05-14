'use client';

import { Check, X, Minus } from 'lucide-react';

type Cell = 'yes' | 'no' | 'partial' | string;

interface Row {
  feature: string;
  kolaytahliye: Cell;
  autocad: Cell;
  manual: Cell;
}

const ROWS: Row[] = [
  { feature: 'Hazırlık süresi (orta ölçekli plan)', kolaytahliye: '< 1 saat', autocad: '4-8 saat', manual: '1-2 gün' },
  { feature: 'ISO 7010 sembol kütüphanesi', kolaytahliye: 'yes', autocad: 'partial', manual: 'no' },
  { feature: 'ISO 23601 uyumlu çıktı', kolaytahliye: 'yes', autocad: 'partial', manual: 'no' },
  { feature: 'Sürükle-bırak editör', kolaytahliye: 'yes', autocad: 'no', manual: 'no' },
  { feature: 'Otomatik tahliye yolu hesabı', kolaytahliye: 'yes', autocad: 'no', manual: 'no' },
  { feature: 'Bulut yedekleme + paylaşım', kolaytahliye: 'yes', autocad: 'partial', manual: 'no' },
  { feature: 'KDV dahil e-Arşiv fatura', kolaytahliye: 'yes', autocad: 'no', manual: 'no' },
  { feature: 'Aylık maliyet (orta ölçek)', kolaytahliye: '₺249', autocad: '~₺5.000+', manual: '—' },
  { feature: 'Lisans öğrenme eğrisi', kolaytahliye: '15 dk', autocad: '40+ saat', manual: '—' },
];

function CellRender({ value, accent }: { value: Cell; accent: boolean }) {
  if (value === 'yes') {
    return (
      <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${accent ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
        <Check className="w-4 h-4" strokeWidth={3} />
      </div>
    );
  }
  if (value === 'no') {
    return (
      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
        <X className="w-4 h-4" strokeWidth={2} />
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
        <Minus className="w-4 h-4" strokeWidth={3} />
      </div>
    );
  }
  return (
    <span className={`text-[13px] font-bold ${accent ? 'text-blue-700' : 'text-slate-700'}`}>{value}</span>
  );
}

export default function LandingCompare() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            Karşılaştırma
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
            KolayTahliye, AutoCAD ve Elle Çizim
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Aynı planı 3 farklı yöntemle çıkardığınızda ne kadar zaman ve para harcardınız?
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200">
            <div className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Özellik</div>
            <div className="px-6 py-4 text-center bg-blue-600 text-white">
              <div className="text-[11px] font-black uppercase tracking-widest opacity-80">Önerilen</div>
              <div className="text-base font-black mt-0.5">KolayTahliye</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Geleneksel</div>
              <div className="text-base font-black text-slate-700 mt-0.5">AutoCAD</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Manuel</div>
              <div className="text-base font-black text-slate-700 mt-0.5">El Çizimi</div>
            </div>
          </div>
          {ROWS.map((row, idx) => (
            <div
              key={row.feature}
              className={`grid grid-cols-4 items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${idx === ROWS.length - 1 ? '' : 'border-b border-slate-100'}`}
            >
              <div className="px-6 py-4 text-[13px] font-semibold text-slate-800">{row.feature}</div>
              <div className="px-6 py-4 text-center bg-blue-50/30">
                <CellRender value={row.kolaytahliye} accent />
              </div>
              <div className="px-6 py-4 text-center">
                <CellRender value={row.autocad} accent={false} />
              </div>
              <div className="px-6 py-4 text-center">
                <CellRender value={row.manual} accent={false} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Karşılaştırma değerleri kullanıcı geri bildirimlerine dayalı tahminlerdir. AutoCAD ve diğer markalar ilgili
          firmaların tescilli markalarıdır.
        </p>
      </div>
    </section>
  );
}
