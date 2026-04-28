'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, CreditCard, LayoutDashboard, LogOut, Plus, Search, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ClientOnly } from '@/components/shared/ClientOnly';
import { Logo } from '@/components/shared/Logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuthStore();

  type MenuItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
    highlight?: boolean;
    child?: boolean;
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const isPro = profile?.subscription_tier === 'pro';

  const menu: MenuItem[] = [
    { href: '/dashboard', label: 'Denetim Merkezi', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/dashboard/archive', label: 'Tahliye Planı Arşivi', icon: <Archive className="w-4 h-4" />, child: true },
    { href: '/dashboard/profile', label: 'Profil / Firma Bilgileri', icon: <UserCircle className="w-4 h-4" /> },
    ...(!isPro
      ? [{ href: '/dashboard/upgrade', label: 'Abonelik', icon: <CreditCard className="w-4 h-4" />, highlight: true }]
      : []),
  ];

  const pageTitle = pathname === '/dashboard/profile'
    ? 'Profil / Firma Bilgileri'
    : pathname === '/dashboard/archive'
      ? 'Tahliye Planı Arşivi'
    : pathname === '/dashboard/upgrade'
      ? 'Abonelik'
      : 'Denetim Merkezi';

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (value.trim()) params.set('q', value.trim());
    else params.delete('q');
    params.delete('new');
    const targetPath = pathname === '/dashboard/archive' ? '/dashboard/archive' : '/dashboard';
    router.replace(params.toString() ? `${targetPath}?${params.toString()}` : targetPath);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Menü</div>
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : item.highlight
                      ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${item.child ? 'ml-7 py-2 text-xs' : ''}`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {isPro && (
            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-emerald-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Pro Aktif
              </div>
              <p className="mt-1 text-[11px] font-semibold leading-5 text-emerald-700">
                Abonelik yükseltme ekranı bu hesapta gizlenir.
              </p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Planify Portal</p>
            <h2 className="font-black text-slate-800 tracking-tight">{pageTitle}</h2>
          </div>
          
          <ClientOnly>
            <div className="flex items-center gap-4">
              {(pathname === '/dashboard' || pathname === '/dashboard/archive') && (
                <label className="hidden lg:block relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    defaultValue=""
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSearch(event.currentTarget.value);
                    }}
                    onBlur={(event) => handleSearch(event.currentTarget.value)}
                    placeholder="Proje, tesis veya kat ara"
                    className="h-10 w-72 pl-10 pr-3 rounded-none bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-slate-400"
                  />
                </label>
              )}
              <Link href="/dashboard?new=1" className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-none text-sm font-bold hover:bg-slate-800 transition-all">
                <Plus className="w-4 h-4" /> Yeni Proje
              </Link>
            </div>
          </ClientOnly>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
