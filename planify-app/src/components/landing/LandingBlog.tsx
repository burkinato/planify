const POSTS = [
  {
    cat: 'Mevzuat',
    catCls: 'bg-blue-100 text-blue-700',
    gradFrom: '#3b82f6',
    gradTo: '#1d4ed8',
    title: 'TS EN ISO 7010: Acil Durum Sembollerinde Renk Kodları Rehberi',
    excerpt: 'Yeni yönetmeliğe göre tahliye planlarında kullanılması zorunlu semboller ve renk standartları hakkında kapsamlı rehber.',
    date: '18 Nisan 2026',
    read: '5 dk okuma',
  },
  {
    cat: 'Eğitim',
    catCls: 'bg-violet-100 text-violet-700',
    gradFrom: '#7c3aed',
    gradTo: '#4c1d95',
    title: 'Okullar İçin Tahliye Planı Hazırlama: Adım Adım Kılavuz',
    excerpt: 'MEB yönetmeliği çerçevesinde okul tahliye planlarının nasıl hazırlanacağını anlatan pratik rehber.',
    date: '10 Nisan 2026',
    read: '7 dk okuma',
  },
  {
    cat: 'Teknoloji',
    catCls: 'bg-cyan-100 text-cyan-700',
    gradFrom: '#0891b2',
    gradTo: '#164e63',
    title: 'AutoCAD vs Planify: Tahliye Planında Hangi Araç Daha İyi?',
    excerpt: 'Karmaşık genel amaçlı yazılımlar yerine neden sektöre özel çözümlerin öne geçtiğini karşılaştırmalı inceliyoruz.',
    date: '2 Nisan 2026',
    read: '4 dk okuma',
  },
];

export default function LandingBlog() {
  return (
    <section id="blog" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
              Bilgi Merkezi
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Son Yazılar</h2>
            <p className="text-slate-500">İSG, tahliye mevzuatı ve yazılım hakkında güncel içerikler.</p>
          </div>
          <a href="#" className="text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors whitespace-nowrap underline underline-offset-4">
            Tüm Yazıları Gör →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {POSTS.map(({ cat, catCls, gradFrom, gradTo, title, excerpt, date, read }, i) => (
            <article key={i} className="blog-card group landing-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer">
              {/* Gradient header */}
              <div className="h-44 overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}>
                <div className="blog-card-img absolute inset-0 flex items-end p-5">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20`}>
                    {cat}
                  </span>
                </div>
                {/* Decorative grid */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${catCls}`}>{cat}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] text-slate-400">{read}</span>
                </div>
                <h3 className="font-black text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors text-sm">
                  {title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{date}</span>
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Oku →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
