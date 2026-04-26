import Link from 'next/link';
import { Shield } from 'lucide-react';

const FEATURES = [
  { icon: '🛡️', text: 'ISO 7010 & Türkiye mevzuatına %100 uyumlu' },
  { icon: '⚡', text: 'Sürükle-bırak ile dakikalar içinde plan çizimi' },
  { icon: '📄', text: 'Denetime hazır A3/A4 PDF çıktısı' },
  { icon: '☁️', text: 'Güvenli bulut depolama — her cihazdan erişim' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col flex-1 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        {/* Background orbs */}
        <div className="absolute w-96 h-96 rounded-full bg-blue-500/30 -top-24 -left-24 blur-3xl pointer-events-none" />
        <div className="absolute w-72 h-72 rounded-full bg-indigo-500/30 bottom-0 right-0 blur-3xl pointer-events-none" />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.8px, transparent 0)', backgroundSize: '28px 28px' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-black tracking-tight text-xl text-white">Planify</span>
          </Link>

          {/* Main pitch */}
          <div className="my-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white leading-tight">
                Kurumsal İş Güvenliğinde<br />
                <span className="text-blue-200">Yeni Standart</span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
                Profesyonel tahliye planlarını çizin, buluta kaydedin ve denetime hazır raporlar alın.
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-3">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-base border border-white/20 shrink-0">
                    {f.icon}
                  </span>
                  <span className="text-blue-100 text-sm font-medium">{f.text}</span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="pt-8 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {['bg-blue-400', 'bg-indigo-400', 'bg-violet-400', 'bg-cyan-400'].map((c, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${c} flex items-center justify-center text-white text-xs font-bold`}>
                      {['AY', 'ZD', 'CA', '+'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">580+ uzman kullanıyor</p>
                  <p className="text-blue-200 text-xs">Türkiye genelinde güvenilir platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-blue-200/60 text-xs">
            © {new Date().getFullYear()} Planify · destek@planify.com.tr
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 md:p-12 lg:p-16 relative bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-lg text-slate-900">Planify</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
