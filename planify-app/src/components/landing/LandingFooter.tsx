import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

export default function LandingFooter() {
  return (
    <>
      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="hero-orb w-96 h-96 bg-blue-500/30 -top-20 -right-20" />
        <div className="hero-orb w-80 h-80 bg-indigo-500/30 bottom-0 left-0" style={{ animationDelay: '4s' }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Profesyonellerin Tercihi Planify ile<br />Planlarınızı Hemen Oluşturun
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Türkiye genelinde 580+ uzmanın güvendiği platform. İlk projenizi 12 dakikada çizin, denetime hazır hale getirin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1">
              7 Günlük Denemeyi Başlat <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-blue-200">
            <span>✓ Kredi kartı gerekmez</span>
            <span>✓ Anında kullanım</span>
            <span>✓ İstediğiniz zaman iptal</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                  <Shield className="text-white w-5 h-5" />
                </div>
                <span className="font-black tracking-tight text-xl text-white">Planify</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                İş güvenliği uzmanları için geliştirilmiş profesyonel tahliye planı tasarım yazılımı.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {/* Social icons (placeholders) */}
                {['X', 'in', 'yt'].map(s => (
                  <a key={s} href="#" className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 hover:border-slate-500 hover:text-white transition-all">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Ürün', links: ['Özellikler', 'Fiyatlandırma', 'Şablonlar', 'Güncellemeler'] },
              { title: 'Destek', links: ['Yardım Merkezi', 'Başlarken', 'Video Rehberler', 'İletişim'] },
              { title: 'Yasal', links: ['Kullanım Koşulları', 'Gizlilik Politikası', 'KVKK Metni', 'Çerez Politikası'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-bold mb-4 text-sm">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Planify. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Tüm sistemler çalışıyor
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
