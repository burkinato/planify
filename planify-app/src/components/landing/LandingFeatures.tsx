import { Layers, Zap, Printer, LayoutTemplate, Shield, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  { Icon: Layers, title: 'Akıllı CAD Araçlar', desc: 'Manyetik duvarlar, otomatik trimlenen kapı ve pencerelerle tam profesyonel CAD deneyimi.' },
  { Icon: Zap, title: 'Otomatik Lejand', desc: 'Eklediğiniz her ISO 7010 sembolü anında lejanda işlenir. Eksiksiz ve hatasız resmi raporlama.' },
  { Icon: Printer, title: 'A3/A4 PDF Çıktı', desc: 'Antetli, yüksek çözünürlüklü, 150KB limitine uygun ve denetime hazır vektörel PDF çıktıları.' },
  { Icon: LayoutTemplate, title: 'Hazır Şablonlar', desc: 'Okul, hastane, yurt veya ofis planları için önceden hazırlanmış taslakları tek tıkla yükleyin.' },
  { Icon: Shield, title: 'Mevzuat Uyumluluğu', desc: 'Tüm renk kodları, semboller ve fontlar güncel İSG yönetmeliklerine ve TS EN ISO 7010\'a %100 uygundur.' },
  { Icon: Lock, title: 'Güvenli Bulut Depolama', desc: 'Projeleriniz şifreli bulut sunucularımızda saklanır. İstediğiniz cihazdan güvenle erişin.' },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-32 px-6 bg-[#FAFAFC] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/80 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold shadow-sm">
            Tüm Özellikler
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Tüm Kurumsal İhtiyaçlarınız <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Tek Platformda.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            AutoCAD karmaşıklığını unutun. Sektöre özel akıllı araçlarla dakikalar içinde hatasız sonuçlar alın.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <div key={i} className="group relative p-[1px] rounded-3xl bg-gradient-to-b from-slate-200/60 to-slate-100/20 hover:from-primary-400 hover:to-indigo-500 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1">
              <div className="relative h-full p-8 rounded-[23px] bg-white/80 backdrop-blur-xl">
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                  <Icon className="w-8 h-8 text-slate-700 group-hover:text-primary-600 transition-colors duration-500" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-primary-900 transition-colors">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-600 transition-colors">{desc}</p>
                
                {/* Decorative corner glow on hover */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-100/50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-20 relative rounded-3xl bg-slate-900 border border-slate-800 p-10 md:p-14 overflow-hidden shadow-2xl shadow-slate-900/20 group">
          {/* Card Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-indigo-600/20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left space-y-3">
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Hemen çizime başlayın</h3>
              <p className="text-lg text-slate-300 font-medium max-w-xl">
                Kredi kartı gerektirmeden 7 gün ücretsiz deneyin. Tüm pro özelliklere anında erişim sağlayın.
              </p>
            </div>
            <Link href="/register" className="shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-xl hover:bg-slate-50 hover:scale-105 hover:shadow-white/20 transition-all duration-300">
              Ücretsiz Başla <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
