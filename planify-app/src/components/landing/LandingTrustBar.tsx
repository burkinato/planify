'use client';

import { Shield, Building2, GraduationCap, Hospital, Hammer, Store } from 'lucide-react';

const SECTORS = [
  { icon: Building2, label: 'OSGB' },
  { icon: Hospital, label: 'Sağlık' },
  { icon: GraduationCap, label: 'Eğitim' },
  { icon: Hammer, label: 'Sanayi' },
  { icon: Store, label: 'Perakende' },
  { icon: Shield, label: 'Kamu' },
];

export default function LandingTrustBar() {
  return (
    <section className="py-12 px-6 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-8">
          Türkiye'deki Profesyoneller Tarafından Tercih Ediliyor
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {SECTORS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat value="500+" label="Aktif Kullanıcı" />
          <Stat value="3.000+" label="Hazırlanan Plan" />
          <Stat value="180+" label="Sembol Kütüphanesi" />
          <Stat value="%99,8" label="Uptime SLA" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{label}</span>
    </div>
  );
}
