'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useAuthStore } from '@/store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';

const NAV_LINKS = [
  ['Özellikler', '#features'],
  ['Nasıl Çalışır', '#how'],
  ['Yorumlar', '#testimonials'],
  ['Fiyatlandırma', '#pricing'],
  ['Blog', '#blog'],
] as const;

export default function LandingNav() {
  const { user } = useAuthStore(useShallow((s) => ({ user: s.user })));
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>
        {/* Logo */}
        <Link href="/">
          <Logo size="md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          {NAV_LINKS.map(([label, href]) => (
            <a key={label} href={href} className="hover:text-blue-600 transition-colors">{label}</a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Uygulamaya Geç
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Giriş Yap
              </Link>
              <Link href="/register" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Ücretsiz Dene
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mobile-menu-enter border-t border-slate-100 bg-white px-6 py-4 space-y-1">
          {NAV_LINKS.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600 py-2.5 border-b border-slate-50">
              {label}
            </a>
          ))}
          <div className="flex gap-3 pt-4">
            {user ? (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl py-2.5">
                <LayoutDashboard className="w-4 h-4" />
                Uygulamaya Geç
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl py-2.5">
                  Giriş Yap
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-bold text-white bg-blue-600 rounded-xl py-2.5">
                  Ücretsiz Dene
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
