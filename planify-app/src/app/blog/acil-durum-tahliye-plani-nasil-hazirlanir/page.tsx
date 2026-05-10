import React from 'react';
import { Metadata } from 'next';
import { Clock, Tag, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Acil Durum Tahliye Planı Nasıl Hazırlanır? | Planify',
  description: 'Adım adım acil durum tahliye planı hazırlama rehberi. ISO 23601 ve ISO 7010 standartlarına göre tahliye krokisi çizimi.',
  keywords: ['tahliye planı hazırlama', 'tahliye krokisi çizimi', 'acil durum planı', 'isg tahliye planı'],
};

export default function BlogPost() {
  return (
    <article className="prose prose-slate lg:prose-lg mx-auto bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-slate-100">
      <div className="flex items-center gap-4 text-slate-400 text-xs font-black uppercase tracking-widest mb-8">
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 6 Dakika Okuma</span>
        <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Rehber</span>
        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Planify Ekibi</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
        Acil Durum Tahliye Planı Nasıl Hazırlanır?
      </h1>

      <p className="lead text-xl text-slate-500 font-medium leading-relaxed mb-12">
        İş yerlerinde can güvenliğini sağlamanın en temel unsurlarından biri, doğru ve anlaşılır bir tahliye planına sahip olmaktır. Bu yazıda, standartlara uygun bir tahliye planının nasıl hazırlanacağını adım adım inceleyeceğiz.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-black text-slate-900 mb-6">1. Mevcut Durum Analizi</h2>
        <p className="text-slate-600 mb-4">
          Çizime başlamadan önce binanın mimari projelerini incelemeli ve saha turu yaparak tüm acil çıkışları, yangın söndürme cihazlarını ve tehlikeli alanları tespit etmelisiniz.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-black text-slate-900 mb-6">2. Standartlara Uygun Semboloji</h2>
        <p className="text-slate-600 mb-4">
          Tahliye planlarında rastgele semboller kullanılamaz. <strong>ISO 7010</strong> standardı, sembollerin şekillerini ve renklerini belirler. Örneğin:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600">
          <li><strong>Yeşil:</strong> Tahliye yolları ve acil çıkışlar</li>
          <li><strong>Kırmızı:</strong> Yangınla mücadele ekipmanları</li>
          <li><strong>Sarı:</strong> Uyarı ve tehlike işaretleri</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-black text-slate-900 mb-6">3. "Buradasınız" Noktasının Önemi</h2>
        <p className="text-slate-600 mb-4">
          Bir tahliye planının en kritik öğesi "Buradasınız" (You Are Here) işaretidir. Planın asıldığı konuma göre bu noktanın doğru yerleştirilmesi, panik anında yön bulmayı sağlar.
        </p>
      </section>

      <section className="mb-12 bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
        <h3 className="text-xl font-black text-indigo-900 mb-4">Planify ile Hızlı Çözüm</h3>
        <p className="text-indigo-800/80 mb-6 font-medium">
          Tüm bu standartları manuel olarak takip etmek yerine, Planify'ın akıllı editörünü kullanarak ISO uyumlu planlarınızı otomatik olarak oluşturabilirsiniz.
        </p>
        <a href="/register" className="inline-block px-6 py-3 bg-indigo-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all">
          Hemen Çizmeye Başla
        </a>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-black text-slate-900 mb-6">4. Onay ve Revizyon</h2>
        <p className="text-slate-600 mb-4">
          Hazırlanan planlar İSG uzmanı tarafından kontrol edilmeli ve bina değişikliği yapıldığında (yeni bir oda eklenmesi vb.) derhal güncellenmelidir.
        </p>
      </section>
    </article>
  );
}
