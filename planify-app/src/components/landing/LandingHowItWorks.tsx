const STEPS = [
  {
    num: '01',
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    title: 'Kayıt Olun',
    desc: 'Kredi kartı olmadan 7 günlük ücretsiz deneme başlatın. Sadece e-posta adresiniz yeterli.',
    badge: '2 dakika',
  },
  {
    num: '02',
    color: 'from-violet-500 to-violet-600',
    textColor: 'text-violet-600',
    title: 'Planınızı Çizin',
    desc: 'Sürükle-bırak editörle duvar, kapı, pencere ve ISO 7010 sembollerini ekleyin. Anında ölçüm görün.',
    badge: 'Çok Kolay',
  },
  {
    num: '03',
    color: 'from-cyan-500 to-cyan-600',
    textColor: 'text-cyan-600',
    title: 'PDF Alın',
    desc: 'Tek tıkla A3/A4 antetli, denetime hazır vektörel PDF çıktısı alın ve kaydedin.',
    badge: '1 Tıklama',
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
            Nasıl Çalışır?
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900">3 Adımda Denetime Hazır</h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Karmaşık kurulumlar yok. Sertifika gerektirmez. Sadece giriş yapın ve çizmeye başlayın.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[16.7%] right-[16.7%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-cyan-200" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map(({ num, color, textColor, title, desc, badge }, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                {/* Step circle */}
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl font-black text-white/30 absolute">{num}</span>
                  <span className="text-2xl font-black text-white relative">{i + 1}</span>
                </div>

                {/* Badge */}
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-100 ${textColor} mb-4`}>
                  {badge}
                </span>

                <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom promo */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-4 font-medium">Ortalama plan oluşturma süresi:</p>
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4">
            <span className="text-4xl font-black gradient-text-blue">12</span>
            <span className="text-slate-700 font-bold">dakika</span>
            <span className="text-slate-300 text-2xl">vs</span>
            <span className="text-4xl font-black text-slate-300 line-through">3 saat</span>
            <span className="text-slate-400 font-medium">(AutoCAD)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
