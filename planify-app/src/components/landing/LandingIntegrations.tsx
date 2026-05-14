'use client';

import { FileSpreadsheet, MessageSquare, Cloud, Mail, Hash, Pen } from 'lucide-react';

interface Integration {
  name: string;
  description: string;
  status: 'live' | 'beta' | 'soon';
  icon: typeof Pen;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  { name: 'PDF / PNG Export', description: 'Yüksek çözünürlük baskı çıktısı', status: 'live', icon: Pen, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { name: 'Excel Kat Listesi', description: 'Sembol envanteri XLSX olarak indir', status: 'live', icon: FileSpreadsheet, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { name: 'E-posta Paylaşımı', description: 'Plan linkini direkt müşteriye yolla', status: 'live', icon: Mail, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Google Workspace', description: 'Drive\'da otomatik yedekleme', status: 'beta', icon: Cloud, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { name: 'Microsoft Teams', description: 'Plan onay akışını Teams\'e bildirim', status: 'soon', icon: MessageSquare, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { name: 'Slack', description: 'Proje güncellemelerini kanala düşür', status: 'soon', icon: Hash, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { name: 'AutoCAD DWG Export', description: '.dwg formatında dış aktarım', status: 'soon', icon: Pen, color: 'bg-slate-50 text-slate-600 border-slate-100' },
  { name: 'KEP / e-Tebligat', description: 'Belge resmi posta ile yolla', status: 'soon', icon: Mail, color: 'bg-teal-50 text-teal-600 border-teal-100' },
];

function StatusBadge({ status }: { status: Integration['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Aktif
      </span>
    );
  }
  if (status === 'beta') {
    return (
      <span className="text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
        Beta
      </span>
    );
  }
  return (
    <span className="text-[10px] font-black bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
      Yakında
    </span>
  );
}

export default function LandingIntegrations() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            Entegrasyonlar
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
            Mevcut Araçlarınızla Konuşur
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Plan çıktısı tek başına kalmaz; ekibinizin kullandığı sistemlere bağlanır.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTEGRATIONS.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.name}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${integration.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <StatusBadge status={integration.status} />
                </div>
                <h3 className="text-[14px] font-black text-slate-900 mb-1 tracking-tight">{integration.name}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">{integration.description}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Özel entegrasyon ihtiyacınız mı var? Kurumsal planda Webhook ve API erişimi mevcuttur.
        </p>
      </div>
    </section>
  );
}
