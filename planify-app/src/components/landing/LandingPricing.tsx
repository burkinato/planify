'use client';

import { useState } from 'react';
import { CheckCircle2, Crown, Building2, Sparkles, Users, Shield, CreditCard } from 'lucide-react';
import Link from 'next/link';

type Period = 'monthly' | 'annual';

interface Tier {
  name: string;
  description: string;
  icon: typeof Crown;
  monthlyPrice: number | null; // null = "İletişim"
  annualPrice: number | null;
  priceSuffix: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
  enterprise?: boolean;
}

const TIERS: Tier[] = [
  {
    name: 'Ücretsiz',
    description: 'Hemen denemek isteyenler icin. Kayitla 500 kredi ve ilk proje akisi hazir.',
    icon: Sparkles,
    monthlyPrice: 0,
    annualPrice: 0,
    priceSuffix: '',
    features: [
      'Hos geldin: 500 kredi (yaklasik 10 proje)',
      'ISO 23601 sembol kütüphanesi',
      'PDF çıktı (filigranlı)',
      'Tek kullanıcı',
    ],
    cta: 'Ücretsiz Başla',
    href: '/register',
  },
  {
    name: 'Pro',
    description: 'Bireysel ISG uzmanlari ve mimarlik ofisleri icin en hizli satisa hazir plan.',
    icon: Crown,
    monthlyPrice: 249,
    annualPrice: 2388, // ~199/ay × 12 — %20 indirim
    priceSuffix: '/ay',
    features: [
      'Sinirsiz proje olusturma',
      'Filigransiz profesyonel PDF',
      'Premium şablonlar (kat, alarm, ışıklı)',
      'e-Arşiv fatura (KDV dahil)',
      'Öncelikli destek (1 iş günü)',
    ],
    cta: 'Pro\'ya Başla',
    href: '/register?plan=pro',
    popular: true,
  },
  {
    name: 'Takım',
    description: 'OSGB ve danışmanlık firmaları için 3 kullanıcılı plan.',
    icon: Users,
    monthlyPrice: 549,
    annualPrice: 5268,
    priceSuffix: '/ay',
    features: [
      'Pro tüm özellikler',
      '3 kullanıcı + paylaşılan workspace',
      'Rol tabanlı erişim (Yönetici / Çizer)',
      'Proje şablonu paylaşımı',
      'Takım üyesi başına ek kullanıcı ₺149/ay',
    ],
    cta: 'Takım Planı Seç',
    href: '/register?plan=team',
  },
  {
    name: 'Kurumsal',
    description: 'Büyük kurumlar, kamu ve grup şirketleri için.',
    icon: Shield,
    monthlyPrice: null,
    annualPrice: null,
    priceSuffix: '',
    features: [
      'SSO (Azure AD / Google Workspace)',
      'SLA + öncelikli teknik destek hattı',
      'Özel KDV faturalı yıllık sözleşme',
      'On-premise / VPN export imkanı',
      'ISO 27001 + KVKK uyum belgeleri',
    ],
    cta: 'İletişime Geç',
    href: 'mailto:kurumsal@kolaytahliye.com.tr',
    enterprise: true,
  },
];

const CREDIT_PACKS = [
  { credits: 3, label: '3 Proje Paketi', price: 149, perProject: 50, save: null as string | null },
  { credits: 10, label: '10 Proje Paketi', price: 399, perProject: 40, save: '%20' },
  { credits: 50, label: '50 Proje (OSGB)', price: 1499, perProject: 30, save: '%40' },
];

const FAQS = [
  {
    q: 'Fiyatlara KDV dahil mi?',
    a: 'Evet. Tüm fiyatlar KDV (%20) dahil olarak gösterilir. Kurumsal müşterilerimize istek üzerine KDV ayrıştırılmış e-Arşiv faturası gönderilir.',
  },
  {
    q: 'Taksit imkanı var mı?',
    a: 'Evet. Tüm kredi kartı ödemelerinde 9 taksite kadar bölme imkanı sunuyoruz. Taksit seçenekleri PayTR güvenli ödeme sayfasında görüntülenir.',
  },
  {
    q: 'Aboneliği istediğim zaman iptal edebilir miyim?',
    a: 'Evet. Hesap ayarlarından tek tıkla iptal edebilirsiniz. Dijital hizmet niteliğinden dolayı kullanılmış aylar için iade yapılmaz; ancak ödediğiniz dönem sonuna kadar tüm Pro özellikler aktif kalır.',
  },
  {
    q: 'Yıllık planda gerçekten %20 indirim mi var?',
    a: 'Evet. Pro yıllık ₺2.388, aya bölündüğünde ₺199 — aylık plana göre 12 ayda ₺600 tasarruf demek. Takım planında da aynı %20 indirim geçerli.',
  },
  {
    q: 'Kredi paketleri tükenir mi?',
    a: 'Hayır. Satın aldığınız proje kredilerinin son kullanma tarihi yoktur, hesabınızda kalır. Pro aboneliğiniz olsa bile kredileriniz korunur.',
  },
  {
    q: 'Faturalandırma nasıl işliyor?',
    a: 'Her başarılı ödeme sonrasında otomatik e-Arşiv faturası e-posta adresinize iletilir ve hesabınızdan PDF olarak indirebilirsiniz. B2B müşteriler için VKN ve fatura adresi sipariş anında girilir.',
  },
];

function formatTRY(value: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
}

export default function LandingPricing() {
  const [period, setPeriod] = useState<Period>('monthly');

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            Türkiye için Şeffaf Fiyatlandırma
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900">Her Bütçeye Uygun Bir Plan</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Tum fiyatlar Turk Lirasi ve <strong className="text-slate-700">KDV dahildir</strong>. Ucretsiz baslayin, ihtiyaciniz arttiginda Pro'ya gecin veya kredi satin alin.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-5 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Launch Teklifi</p>
          <p className="mt-2 text-base font-semibold text-emerald-900">
            En hizli baslangic: Ucretsiz hesap ac, ilk projeni olustur, export ihtiyacinda Pro'ya gec.
          </p>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                period === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-pressed={period === 'monthly'}
            >
              Aylık
            </button>
            <button
              onClick={() => setPeriod('annual')}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2 ${
                period === 'annual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-pressed={period === 'annual'}
            >
              Yıllık
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                period === 'annual' ? 'bg-amber-300 text-amber-900' : 'bg-amber-100 text-amber-700'
              }`}>
                %20 İNDİRİM
              </span>
            </button>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const price = period === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            const monthlyEquivalent = tier.annualPrice ? Math.round(tier.annualPrice / 12) : null;

            return (
              <div
                key={tier.name}
                className={`p-6 rounded-3xl relative flex flex-col transition-shadow ${
                  tier.popular
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 ring-2 ring-blue-600'
                    : 'bg-white border border-slate-200 text-slate-900 shadow-sm hover:shadow-md'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full shadow-md whitespace-nowrap uppercase tracking-widest">
                    En Popüler
                  </div>
                )}

                <div className={`w-11 h-11 rounded-xl mb-5 flex items-center justify-center ${
                  tier.popular ? 'bg-blue-500/40' : 'bg-blue-50 border border-blue-100'
                }`}>
                  <Icon className={`w-5 h-5 ${tier.popular ? 'text-white' : 'text-blue-600'}`} />
                </div>

                <h3 className="text-xl font-black mb-1">{tier.name}</h3>
                <p className={`text-[13px] mb-5 leading-relaxed ${tier.popular ? 'text-blue-100' : 'text-slate-500'}`}>
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-6 min-h-[68px]">
                  {price === null ? (
                    <span className="text-2xl font-black">İletişim</span>
                  ) : period === 'annual' && monthlyEquivalent && price > 0 ? (
                    <>
                      <span className="text-3xl font-black">{formatTRY(monthlyEquivalent)}</span>
                      <span className={`text-sm font-bold ${tier.popular ? 'text-blue-200' : 'text-slate-500'}`}>/ay</span>
                      <div className={`text-[11px] font-semibold mt-1 ${tier.popular ? 'text-blue-100' : 'text-slate-500'}`}>
                        Yıllık {formatTRY(tier.annualPrice!)} (KDV dahil)
                      </div>
                    </>
                  ) : price === 0 ? (
                    <>
                      <span className="text-3xl font-black">Ücretsiz</span>
                      <div className={`text-[11px] font-semibold mt-1 ${tier.popular ? 'text-blue-100' : 'text-slate-500'}`}>
                        Kredi kartı gerekmez
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black">{formatTRY(price)}</span>
                      <span className={`text-sm font-bold ${tier.popular ? 'text-blue-200' : 'text-slate-500'}`}>
                        {tier.priceSuffix}
                      </span>
                      <div className={`text-[11px] font-semibold mt-1 ${tier.popular ? 'text-blue-100' : 'text-slate-500'}`}>
                        KDV dahil
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? 'text-blue-200' : 'text-blue-500'}`} />
                      <span className={`text-[13px] font-medium leading-snug ${tier.popular ? 'text-blue-50' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.name === 'Ücretsiz' ? '/register?next=/dashboard?new=1' : tier.href}
                  className={`block w-full py-3 text-center rounded-2xl font-bold transition-all text-[13px] ${
                    tier.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
                      : tier.enterprise
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Trust Bar — Taksit & KDV & KVKK */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-[14px]">9 Taksit İmkanı</p>
              <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">Tüm kredi kartlarına 9 taksite kadar bölme.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-[14px]">KVKK & PayTR 3D Secure</p>
              <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">Verileriniz Türkiye'de saklanır, ödemeniz banka onayıyla.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-[14px]">e-Arşiv Fatura</p>
              <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">Her ödemede otomatik KDV dahil fatura.</p>
            </div>
          </div>
        </div>

        {/* Credit Packs */}
        <div className="mb-16">
          <div className="text-center mb-8 space-y-2">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">Krediniz Bittiğinde</h3>
            <p className="text-slate-500 text-[15px]">Ücretsiz planı veya Pro abonenizi destekleyen tek seferlik paketler.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.credits} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{pack.label}</span>
                  {pack.save && (
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      {pack.save} TASARRUF
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  <span className="text-3xl font-black text-slate-900">{formatTRY(pack.price)}</span>
                </div>
                <p className="text-[13px] text-slate-500 mb-5 flex-1">
                  Proje başı yaklaşık <strong className="text-slate-700">{formatTRY(pack.perProject)}</strong>. Krediler süresiz geçerlidir.
                </p>
                <Link
                  href="/register"
                  className="block w-full py-2.5 text-center rounded-xl text-[13px] font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white transition-all"
                >
                  Krediyi Hesaba Yukle
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-black text-slate-900 text-center mb-10">Sıkça Sorulan Sorular</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
