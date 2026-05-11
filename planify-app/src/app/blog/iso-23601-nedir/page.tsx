import React from 'react';
import { Metadata } from 'next';
import { Info, FileCheck, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ISO 23601 Nedir? Tahliye Planı Standartları | Planify',
  description: 'ISO 23601 standardı hakkında her şey. Tahliye planı çizimi, ölçeklendirme ve renk standartları kılavuzu.',
  keywords: ['ISO 23601', 'tahliye planı standardı', 'acil durum levha standartları', 'ISG yönetmelik'],
};

export default function IsoGuide() {
  return (
    <article className="prose prose-slate lg:prose-lg mx-auto bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-slate-100">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
        ISO 23601 Standardı Rehberi
      </h1>

      <p className="lead text-xl text-slate-500 font-medium leading-relaxed mb-12">
        ISO 23601, acil durumlarda binada bulunan kişilerin güvenli bir şekilde tahliye edilmesini sağlamak amacıyla hazırlanan "Tahliye Planları" için uluslararası tasarım prensiplerini belirleyen standarttır.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center">
          <Shield className="w-8 h-8 text-emerald-600 mb-4" />
          <h3 className="font-black text-emerald-900 text-sm mb-2 uppercase">Can Güvenliği</h3>
          <p className="text-xs text-emerald-800/70 font-medium">Panik anında hızlı karar vermeyi sağlar.</p>
        </div>
        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
          <FileCheck className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="font-black text-blue-900 text-sm mb-2 uppercase">Yasal Uyumluluk</h3>
          <p className="text-xs text-blue-800/70 font-medium">Denetimlerde eksiksiz geçmenizi garanti eder.</p>
        </div>
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center text-center">
          <Info className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="font-black text-amber-900 text-sm mb-2 uppercase">Evrensel Dil</h3>
          <p className="text-xs text-amber-800/70 font-medium">Semboller her dilden insan için anlaşılırdır.</p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-black text-slate-900 mb-6">ISO 23601 Temel Gereksinimleri</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">1</div>
            <div>
              <h4 className="font-black text-slate-900">Ölçeklendirme</h4>
              <p className="text-slate-600 text-sm">Büyük tesisler için 1:250, küçük alanlar için 1:100 ölçek önerilir. Planify bu ölçekleri otomatik hesaplar.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">2</div>
            <div>
              <h4 className="font-black text-slate-900">Renk Standartları</h4>
              <p className="text-slate-600 text-sm">Arka plan genellikle beyaz veya fotolüminesandır. Tahliye rotaları açık yeşil renkte olmalıdır.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">3</div>
            <div>
              <h4 className="font-black text-slate-900">Boyut</h4>
              <p className="text-slate-600 text-sm">Minimum plan boyutu ISO 23601&apos;e göre A3&apos;tür. Daha küçük boyutlar denetimden geçmeyebilir.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12 bg-slate-900 p-10 rounded-[32px] text-white">
        <h3 className="text-2xl font-black mb-4">ISO Uyumluluk Testini Geçiyor musunuz?</h3>
        <p className="text-slate-400 mb-8 font-medium">Mevcut planlarınızın standartlara uygunluğunu Planify Compliance Checker ile ücretsiz test edebilirsiniz.</p>
        <a href="/register" className="inline-block px-8 py-4 bg-indigo-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
          Hemen Test Et
        </a>
      </section>
    </article>
  );
}
