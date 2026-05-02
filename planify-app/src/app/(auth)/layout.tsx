import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

const FEATURES = [
  { icon: '🛡️', text: 'ISO 7010 & Türkiye mevzuatına %100 uyumlu' },
  { icon: '⚡', text: 'Sürükle-bırak ile dakikalar içinde plan çizimi' },
  { icon: '📄', text: 'Denetime hazır A3/A4 PDF çıktısı' },
  { icon: '☁️', text: 'Güvenli bulut depolama — her cihazdan erişim' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row font-sans bg-surface-950 selection:bg-primary-500/20">
      {/* LEFT PANEL - Immersive Side */}
      <div className="hidden md:flex flex-col md:w-[40%] lg:w-[42%] xl:w-[40%] relative overflow-hidden bg-surface-900 border-r border-surface-600">
        {/* Background orbs */}
        <div className="absolute w-[120%] h-[120%] rounded-full bg-primary-500/10 -top-1/4 -left-1/4 blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute w-[80%] h-[80%] rounded-full bg-primary-500/10 -bottom-1/4 -right-1/4 blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />
        
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 0.8px, transparent 0)', backgroundSize: '24px 24px' }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 xl:p-16">
          {/* Logo */}
          <Link href="/" className="shrink-0 mb-6 lg:mb-10 inline-block w-fit">
            <Logo variant="white" size="md" />
          </Link>

          {/* Main Content - Centered but scrollable if absolutely needed */}
          <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
            <div className="space-y-6 lg:space-y-10">
              <div className="space-y-3 lg:space-y-5">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-medium text-surface-100 leading-[1.1] tracking-tight">
                  Kurumsal İş Güvenliğinde<br />
                  <span className="text-primary-500">Yeni Standart</span>
                </h2>
                <p className="text-surface-400 text-base lg:text-lg xl:text-xl leading-relaxed max-w-md font-medium">
                  Profesyonel tahliye planlarını çizin, buluta kaydedin ve denetime hazır raporlar alın.
                </p>
              </div>

              {/* Features list - Compact on smaller heights */}
              <ul className="space-y-3 lg:space-y-4">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 lg:gap-4 group">
                    <span className="w-8 h-8 lg:w-10 lg:h-10 rounded lg:rounded-lg bg-surface-800 backdrop-blur-md flex items-center justify-center text-sm lg:text-lg border border-surface-600 shrink-0 transition-transform group-hover:scale-110">
                      {f.icon}
                    </span>
                    <span className="text-surface-300 text-sm lg:text-base font-medium tracking-wide">{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Social proof */}
              <div className="pt-6 lg:pt-10 border-t border-surface-600">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="flex -space-x-2 lg:-space-x-3">
                    {['bg-primary-500', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500'].map((c, i) => (
                      <div key={i} className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-surface-900 ${c} flex items-center justify-center text-white text-[10px] lg:text-xs font-bold shadow-xl`}>
                        {['AY', 'ZD', 'CA', '+'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-surface-200 font-bold text-sm lg:text-base">580+ uzman kullanıyor</p>
                    <p className="text-surface-500 text-[10px] font-bold uppercase tracking-widest">Türkiye genelinde güvenilir platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer - Ensures it's not cut off */}
          <div className="shrink-0 mt-6 lg:mt-10 pt-4 flex items-center justify-between text-surface-500 text-[9px] font-bold uppercase tracking-widest border-t border-surface-600">
            <p>© {new Date().getFullYear()} Planify</p>
            <p>destek@planify.com.tr</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Interaction Area */}
      <div className="flex-1 bg-surface-950 relative">
        {/* Mobile background flourish */}
        <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative z-10">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center justify-center mb-6 w-full shrink-0">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto flex flex-col justify-center min-h-0">
            {children}
          </div>
          
          {/* Mobile Footer Note */}
          <div className="md:hidden mt-auto pt-4 text-center shrink-0">
            <p className="text-[9px] text-surface-500 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Planify
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
