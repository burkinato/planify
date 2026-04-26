import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const FREE_FEATURES = [
  'Temel CAD çizim araçları',
  'Sınırsız proje oluşturma',
  'ISO 7010 temel sembol kütüphanesi',
  'Bulut depolama',
  'PDF çıktısı (filigranlı)',
];

const PRO_FEATURES = [
  'Tüm ücretsiz özellikler +',
  'Sınırsız proje ve depolama',
  'Filigransız PDF çıktısı',
  'Premium şablon kütüphanesi',
  'ISO 7010 tam sembol paketi',
  'Öncelikli 7/24 teknik destek',
  'Çoklu kullanıcı (ekip hesabı)',
  'Özel antet ve logo desteği',
];

const FAQS = [
  {
    q: 'Deneme süresi bitmeden iptal edebilir miyim?',
    a: 'Evet. 7 günlük deneme süresinde istediğiniz zaman iptal edebilirsiniz. Ücret kesilmez.',
  },
  {
    q: 'Planlarım bulutta güvende mi?',
    a: 'Tüm verileriniz SSL şifreli bağlantı ile Türkiye serverlarında saklanır. KVKK uyumludur.',
  },
  {
    q: 'Kurumsal lisans alabilir miyim?',
    a: 'Evet. 5+ kullanıcı için özel fiyatlandırma mevcuttur. destek@planify.com.tr adresine yazın.',
  },
  {
    q: 'PDF çıktılarım MEBBİS ile uyumlu mu?',
    a: 'Evet. PDF çıktılarımız MEBBİS 150KB limitine otomatik olarak optimize edilir.',
  },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            Fiyatlandırma
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900">Sade ve Şeffaf Fiyatlandırma</h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Sürpriz ücret yok. Aboneliğinizi istediğiniz zaman iptal edin.</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {/* Free */}
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Deneme</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-black text-slate-900">Ücretsiz</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Hemen kayıt olun, çizmeye başlayın. Özel kart gerekmez.</p>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block w-full py-3.5 text-center rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-blue-300 hover:text-blue-600 transition-all text-sm">
              Ücretsiz Kayıt Ol
            </Link>
          </div>

          {/* Pro */}
          <div className="pricing-highlight p-8 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-2xl shadow-blue-200 relative md:-translate-y-4">
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full shadow">
              EN POPÜLER ⭐
            </div>
            <p className="text-sm font-bold text-blue-200 uppercase tracking-wide mb-2">Pro Uzman</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-black">₺499</span>
              <span className="text-blue-300 mb-1">/ay</span>
            </div>
            <p className="text-blue-200 text-sm mb-6">Profesyonel İSG uzmanları ve danışmanlık firmaları için.</p>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-blue-100">
                  <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block w-full py-3.5 text-center rounded-2xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all text-sm shadow-lg">
              7 Gün Ücretsiz Dene
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-black text-slate-900 text-center mb-8">Sıkça Sorulan Sorular</h3>
          <div className="space-y-4">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="font-bold text-slate-900 mb-2 text-sm">{q}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
