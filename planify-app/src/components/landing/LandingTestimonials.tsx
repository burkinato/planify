import { FileText, Users, Award, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ahmet Yılmaz',
    role: 'A Sınıfı İSG Uzmanı',
    company: 'Güven İş OSGB',
    quote: 'Planify sayesinde saatlerce süren AutoCAD çizimlerini 15 dakikada bitiriyoruz. İnanılmaz bir zaman tasarrufu ve tam mevzuat uyumu. Artık denetimler bizi hiç korkutmuyor.',
    initials: 'AY',
    bg: 'bg-blue-600',
  },
  {
    name: 'Zeynep Demir',
    role: 'Mimar',
    company: 'Demir Mimarlık Ltd.',
    quote: 'Müşterilere acil durum planı sunarken PDF çıktısının profesyonelliği bizi her zaman rakiplerden öne geçiriyor. Özellikle hazır şablonlar ve otomatik lejand özelliği gerçekten hayat kurtarıyor.',
    initials: 'ZD',
    bg: 'bg-violet-600',
  },
  {
    name: 'Caner Aydın',
    role: 'Yangın Güvenlik Danışmanı',
    company: 'Aydın Güvenlik A.Ş.',
    quote: 'ISO 7010 uyumlu sembol kütüphanesi ve anında lejand özelliği muhteşem. Ayda 30+ proje yapıyoruz, Planify olmadan bu iş yükünü taşımak mümkün olmazdı.',
    initials: 'CA',
    bg: 'bg-cyan-600',
  },
];

const STATS = [
  { value: '2,400+', label: 'Oluşturulan Plan', sub: 'Türkiye genelinde', Icon: FileText },
  { value: '580+', label: 'Aktif Uzman', sub: 'ISG & Mimar & Müh.', Icon: Users },
  { value: '%100', label: 'Mevzuat Uyumu', sub: 'ISO 7010 & TSE', Icon: Award },
  { value: '4.9/5', label: 'Müşteri Puanı', sub: '200+ değerlendirme', Icon: Star },
];

export default function LandingTestimonials() {
  return (
    <>
      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
              Müşteri Yorumları
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">
              Uzmanların Tercihi
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Türkiye&apos;nin önde gelen İSG uzmanları, mimarlar ve danışmanlık firmaları Planify kullanıyor.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, company, quote, initials, bg }, i) => (
              <div key={i} className="landing-card relative bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:border-blue-100">
                {/* Quote mark */}
                <div className="absolute top-6 right-8 text-7xl font-black text-slate-100 leading-none select-none" aria-hidden>
                  &ldquo;
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-slate-700 leading-relaxed mb-6 relative text-sm">{quote}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center text-white font-black text-sm shadow-md`}>
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{name}</p>
                    <p className="text-xs text-slate-500">{role} · {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, sub, Icon }, i) => (
              <div key={i} className="text-center text-white">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-4xl font-black mb-1">{value}</p>
                <p className="font-bold text-blue-100 text-sm">{label}</p>
                <p className="text-blue-200/70 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
