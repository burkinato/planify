'use client';

import { CheckCircle2, Sparkles, Crown, Building2, Zap } from 'lucide-react';
import Link from 'next/link';

const PACKAGES = [
  {
    name: 'Planify Pro',
    credits: '1 Proje Hakkı',
    price: '$5',
    priceNote: '/ay',
    desc: 'Hemen başlayın! Aylık abonelikle 1 proje oluşturma hakkı, filigransız çıktı ve tüm özellikler.',
    icon: Crown,
    features: [
      '1 Proje oluşturma hakkı dahil',
      'Filigransız profesyonel PDF çıktısı',
      'Tüm şablon ve layout erişimi',
      'ISO 23601 uyumlu denetim çıktıları',
    ],
    cta: 'Abone Ol — $5/ay',
    href: '/register',
    popular: true,
    color: 'primary'
  },
  {
    name: '3 Proje Paketi',
    credits: '3 Proje Hakkı',
    price: '$12',
    priceNote: '',
    desc: 'Bireysel uzmanlar ve küçük ölçekli işletmeler için ideal. Proje başı $4.',
    icon: Zap,
    features: [
      '3 ek proje oluşturma hakkı',
      'Proje başı $4 — %20 tasarruf',
      'Krediler hesapta birikir, süresiz',
      'Öncelikli destek',
    ],
    cta: 'Kredi Satın Al',
    href: '/register',
    popular: false,
    color: 'indigo'
  },
  {
    name: '10 Proje Paketi',
    credits: '10 Proje Hakkı',
    price: '$30',
    priceNote: '',
    desc: 'OSGB ve kurumsal mimarlık ofisleri için en avantajlı paket. Proje başı $3.',
    icon: Building2,
    features: [
      '10 ek proje oluşturma hakkı',
      'Proje başı $3 — %40 tasarruf',
      'Kurumsal faturalandırma',
      'Öncelikli teknik destek',
    ],
    cta: 'Kredi Satın Al',
    href: '/register',
    popular: false,
    color: 'slate'
  }
];

const FAQS = [
  {
    q: 'Sistem nasıl çalışır?',
    a: 'Planify, $5/ay abonelik modeli ile çalışır. Abone olduğunuzda 1 proje oluşturma hakkı kazanırsınız. Daha fazla proje için kredi paketleri satın alabilirsiniz.',
  },
  {
    q: 'Satın aldığım kredilerin süresi doluyor mu?',
    a: 'Hayır. Satın aldığınız proje kredileri hesabınızda ömür boyu kalır ve istediğiniz zaman kullanabilirsiniz.',
  },
  {
    q: 'Abonelik olmadan kredi alabilir miyim?',
    a: 'Evet. Abonelik olmadan da kredi paketleri satın alıp proje oluşturabilirsiniz. Abonelik sadece başlangıç avantajı sağlar.',
  },
  {
    q: 'Büyük ölçekli ofisler için toplu alım var mı?',
    a: 'Evet. 10+ proje paketleri ve özel kurumsal teklifler için destek@planify.com.tr üzerinden iletişime geçebilirsiniz.',
  },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            Esnek Fiyatlandırma
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900">Abonelik + Kredi Sistemi</h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">$5/ay abonelikle başlayın, 1 proje hakkı kazanın. Daha fazlası için avantajlı kredi paketleri alın.</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon;
            return (
              <div key={i} className={`p-8 rounded-3xl relative flex flex-col ${
                pkg.popular 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 md:-translate-y-4' 
                : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
              }`}>
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-900 text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    BAŞLANGIÇ İÇİN İDEAL
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${pkg.popular ? 'bg-blue-500/50' : 'bg-slate-50 border border-slate-100'}`}>
                  <Icon className={`w-6 h-6 ${pkg.popular ? 'text-white' : 'text-slate-700'}`} />
                </div>
                
                <h3 className="text-2xl font-black mb-2">{pkg.name}</h3>
                <p className={`text-sm mb-6 ${pkg.popular ? 'text-blue-100' : 'text-slate-500'}`}>{pkg.desc}</p>
                
                <div className="flex flex-col gap-1 mb-8">
                  <span className="text-4xl font-black">{pkg.price}<span className="text-lg font-bold">{pkg.priceNote}</span></span>
                  <span className={`text-sm font-bold ${pkg.popular ? 'text-blue-200' : 'text-blue-600'}`}>{pkg.credits}</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {pkg.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${pkg.popular ? 'text-blue-300' : 'text-blue-500'}`} />
                      <span className={`text-sm font-medium ${pkg.popular ? 'text-blue-50' : 'text-slate-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href={pkg.href} 
                  className={`block w-full py-4 text-center rounded-2xl font-bold transition-all text-sm ${
                    pkg.popular
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-black text-slate-900 text-center mb-10">Sıkça Sorulan Sorular</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="font-bold text-slate-900 mb-3 text-[15px]">{q}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
