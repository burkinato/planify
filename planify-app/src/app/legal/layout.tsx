import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:-translate-x-0.5 transition-all" />
            <Logo size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">Kullanım</Link>
            <Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
            <Link href="/legal/kvkk" className="hover:text-slate-900 transition-colors">KVKK</Link>
            <Link href="/legal/cookies" className="hover:text-slate-900 transition-colors">Çerezler</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <article className="prose prose-slate prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 max-w-none">
          {children}
        </article>
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} KolayTahliye. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
