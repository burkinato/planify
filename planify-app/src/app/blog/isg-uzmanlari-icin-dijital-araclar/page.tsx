import React from 'react';
import { Metadata } from 'next';
import { Check, X, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İSG Uzmanları İçin Dijital Araçlar | Planify',
  description: 'En iyi İSG yazılımları ve araçları karşılaştırması. AutoCAD vs Planify: Tahliye planı çizimi için hangi araç daha uygun?',
  keywords: ['İSG yazılımları', 'tahliye planı çizim programı', 'iş güvenliği dijital dönüşüm', 'AutoCAD tahliye planı'],
};

export default function ComparisonPage() {
  return (
    <article className="prose prose-slate lg:prose-lg mx-auto bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-slate-100">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
        İSG Uzmanları İçin En İyi Dijital Araçlar (2026)
      </h1>

      <p className="lead text-xl text-slate-500 font-medium leading-relaxed mb-12">
        İş Sağlığı ve Güvenliği uzmanları için zaman yönetimi hayati önem taşır. Geleneksel CAD programları ile saatler süren tahliye planı çizimlerini dakikalara indiren yeni nesil araçları karşılaştırdık.
      </p>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 mb-16">
        <table className="w-full text-left border-collapse m-0">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-black text-slate-900 uppercase text-xs">Özellik</th>
              <th className="p-4 font-black text-slate-900 uppercase text-xs">CAD Yazılımları</th>
              <th className="p-4 font-black text-indigo-600 uppercase text-xs bg-indigo-50">Planify</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-slate-100">
              <td className="p-4 font-bold text-slate-700">Öğrenme Eğrisi</td>
              <td className="p-4 text-slate-500">Zor (Aylar sürer)</td>
              <td className="p-4 font-bold text-indigo-700 bg-indigo-50/50">Kolay (Dakikalar)</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-4 font-bold text-slate-700">Hazır Sembol Seti</td>
              <td className="p-4 text-slate-500"><X className="w-4 h-4 text-red-500" /> (Manuel yükleme)</td>
              <td className="p-4 font-bold text-indigo-700 bg-indigo-50/50"><Check className="w-4 h-4 text-emerald-500 inline mr-2" /> ISO 7010 Dahil</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-4 font-bold text-slate-700">Otomatik Lejand</td>
              <td className="p-4 text-slate-500"><X className="w-4 h-4 text-red-500" /> Yok</td>
              <td className="p-4 font-bold text-indigo-700 bg-indigo-50/50"><Check className="w-4 h-4 text-emerald-500 inline mr-2" /> Var</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-4 font-bold text-slate-700">Web Tabanlı</td>
              <td className="p-4 text-slate-500"><X className="w-4 h-4 text-red-500" /> Kurulum Gerekir</td>
              <td className="p-4 font-bold text-indigo-700 bg-indigo-50/50"><Check className="w-4 h-4 text-emerald-500 inline mr-2" /> Her yerden erişim</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-black text-slate-900 mb-6">Neden Dijital Dönüşüm?</h2>
      <p className="text-slate-600 mb-8 leading-relaxed">
        Modern İSG yönetimi, artık kağıt üzerindeki statik planlardan dijital ve kolay güncellenebilir sistemlere evriliyor. Bir duvarda yapılan küçük bir değişiklikte tüm planları baştan çizmek yerine, dijital araçlarla saniyeler içinde revizyon yapabilirsiniz.
      </p>

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 rounded-[32px] text-white flex flex-col items-center text-center">
        <Zap className="w-12 h-12 mb-6 animate-pulse" />
        <h3 className="text-2xl font-black mb-4">Zamanınızı CAD Çizimlerine Harcamayın</h3>
        <p className="text-indigo-100 mb-8 max-w-lg">Profesyonel İSG uzmanları arasına katılın ve Planify ile verimliliğinizi %80 artırın.</p>
        <a href="/register" className="px-10 py-4 bg-white text-indigo-600 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all shadow-2xl">
          Ücretsiz Deneyin
        </a>
      </div>
    </article>
  );
}
