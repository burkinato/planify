'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Coins, CreditCard, FolderKanban, LayoutDashboard, LogOut, Plus, Search, ShieldCheck, UserCircle, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { ClientOnly } from '@/components/shared/ClientOnly';
import { Logo } from '@/components/shared/Logo';
import { useCreditStore } from '@/store/useCreditStore';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { balance, fetchBalance, hasActiveSubscription, isInitialized } = useCreditStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Subscription Guard
  useEffect(() => {
    if (isInitialized && !hasActiveSubscription && !pathname.includes('/dashboard/upgrade')) {
      router.replace('/dashboard/upgrade');
    }
  }, [isInitialized, hasActiveSubscription, pathname, router]);

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
    { href: '/dashboard', label: 'Kontrol Paneli', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { href: '/dashboard/archive', label: 'Proje Arşivi', icon: <FolderKanban className="w-[18px] h-[18px]" /> },
    { href: '/dashboard/profile', label: 'Hesap Bilgileri', icon: <UserCircle className="w-[18px] h-[18px]" /> },
    { href: '/dashboard/upgrade', label: 'Abonelik & Paketler', icon: <Coins className="w-[18px] h-[18px]" />, highlight: true },
  ];

  const pageTitle = pathname === '/dashboard/profile'
    ? 'Hesap Bilgileri'
    : pathname === '/dashboard/archive'
      ? 'Proje Arşivi'
    : pathname === '/dashboard/upgrade'
      ? 'Abonelik & Paketler'
      : 'Kontrol Paneli';

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (value.trim()) params.set('q', value.trim());
    else params.delete('q');
    params.delete('new');
    const targetPath = pathname === '/dashboard/archive' ? '/dashboard/archive' : '/dashboard';
    router.replace(params.toString() ? `${targetPath}?${params.toString()}` : targetPath);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex font-sans text-surface-200 transition-colors">
      {/* Sidebar - Exact match to screenshot */}
      <aside className="w-[272px] bg-gradient-to-b from-[#252526] to-[#1a1a1c] border-r border-surface-600/20 flex flex-col hidden md:flex relative text-slate-300">
        <div className="h-[88px] flex items-center px-8">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4">Navigasyon</div>
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[13px] transition-all duration-200 font-semibold relative ${
                  isActive 
                    ? 'bg-white/5 text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#0b5cff] rounded-r-full" />
                )}
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-5 space-y-4">
          <div className="px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planify v2.0</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 w-full text-slate-300 hover:text-white font-semibold text-[13px] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-[11px] text-white font-bold border border-white/5">
              {profile?.full_name?.charAt(0) || 'N'}
            </div>
            Oturumu Kapat
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-surface-950">
        {/* Navbar - Styled with bottom border */}
        <header className="h-[76px] flex items-center justify-end px-8 shrink-0 z-10 sticky top-0 bg-surface-950/80 backdrop-blur-xl border-b border-surface-600/40 shadow-sm">
          <ClientOnly>
            <div className="flex items-center gap-4">
              
              {/* Gold Credit Button from screenshot */}
              <Link 
                href="/dashboard/upgrade"
                className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#fef3c7] border border-[#fde68a] rounded-xl text-amber-600 hover:bg-[#fde68a]/50 transition-colors"
                title="Kredi Paketleri"
              >
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/80 leading-none mb-0.5">Proje Hakkı</span>
                  <span className="text-sm font-black tracking-tight leading-none text-amber-600">{balance}</span>
                </div>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-800 text-surface-400 hover:text-surface-600 transition-colors"
                title="Temayı Değiştir"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Solid Blue New Project Button */}
              <Link href="/dashboard?new=1" className="flex items-center gap-2 px-6 py-3 bg-[#0b5cff] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Yeni Proje
              </Link>
            </div>
          </ClientOnly>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-10 pt-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
