'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Coins, CreditCard, FolderKanban, LayoutDashboard, LogOut, Plus, Search, ShieldCheck, UserCircle, Sun, Moon, Sparkles, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { ClientOnly } from '@/components/shared/ClientOnly';
import { Logo } from '@/components/shared/Logo';
import { useCreditStore } from '@/store/useCreditStore';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { balance, fetchBalance, hasActiveSubscription, isInitialized, transactions, fetchTransactions } = useCreditStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

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
    <div className="min-h-screen bg-surface-950 flex font-sans text-slate-800 dark:text-surface-200 transition-colors">
      {/* Sidebar - Full Seamless Minimalist */}
      <aside className="w-[272px] bg-surface-950 border-r border-surface-600/10 flex flex-col hidden md:flex relative z-20">
        <div className="h-16 flex items-center px-8 shrink-0">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="text-[10px] font-black text-slate-500 dark:text-surface-400 uppercase tracking-widest mb-4 px-4">Navigasyon</div>
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] transition-all duration-200 font-bold relative ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-surface-400 dark:hover:text-surface-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
                )}
                <span className={isActive ? 'text-blue-600' : 'text-slate-400 dark:text-surface-400'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-5 space-y-4">
          <div className="px-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-surface-400 uppercase tracking-widest">Planify v2.0</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 w-full text-slate-500 dark:text-surface-400 hover:text-slate-900 dark:hover:text-surface-100 font-bold text-[13px] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-surface-900 flex items-center justify-center text-[11px] text-slate-600 dark:text-surface-200 font-bold border border-slate-200 dark:border-surface-600/10">
              {profile?.full_name?.charAt(0) || 'N'}
            </div>
            Oturumu Kapat
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-surface-950">
        {/* Navbar - Completely Seamless */}
        <header className="h-16 flex items-center justify-end px-8 shrink-0 z-10 sticky top-0 bg-surface-950/80 backdrop-blur-xl border-b border-surface-600/10">
          <ClientOnly>
            <div className="flex items-center gap-3">
              
              {/* Gold Credit Button - Refined */}
              <Link 
                href="/dashboard/upgrade"
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-amber-50/50 border border-amber-200/50 rounded-lg text-amber-600 hover:bg-amber-100/50 transition-colors"
                title="Kredi Paketleri"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col pr-1">
                  <span className="text-[7px] font-black uppercase tracking-widest text-amber-500/70 leading-none mb-0.5">Bakiye</span>
                  <span className="text-xs font-black tracking-tight leading-none">{balance}</span>
                </div>
              </Link>

              {/* Activity Feed (Notifications) */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-surface-900 text-slate-400 hover:text-slate-900 dark:text-surface-400 transition-colors relative"
                  title="Son İşlemler"
                >
                  <Bell className="w-4 h-4" />
                  {transactions.length > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-950 border border-slate-200 dark:border-surface-600/20 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-5 py-4 border-b border-slate-100 dark:border-surface-600/10 flex items-center justify-between bg-slate-50/30 dark:bg-surface-900/10">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-surface-100">Son İşlemler</h3>
                        <span className="text-[9px] font-black text-slate-500 dark:text-surface-500 uppercase tracking-widest bg-slate-100 dark:bg-surface-900 px-2 py-0.5 rounded-full">{transactions.length} Kayıt</span>
                      </div>
                      <div className="max-h-[320px] overflow-y-auto p-2">
                        {transactions.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center">
                            <Archive className="w-6 h-6 text-surface-600 mb-2" />
                            <span className="text-xs font-medium text-surface-500">Henüz bir işlem yok.</span>
                          </div>
                        ) : (
                          transactions.map(tx => (
                            <div key={tx.id} className="p-3 hover:bg-surface-900 rounded-xl transition-colors flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface-900 text-surface-400 border-surface-600/20'}`}>
                                {tx.amount > 0 ? <Plus className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-xs font-bold text-surface-200 truncate pr-2">{tx.description || (tx.amount > 0 ? 'Kredi Eklendi' : 'Proje Oluşturuldu')}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className="text-[10px] font-medium text-surface-500">{new Date(tx.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-900 text-surface-400'}`}>
                                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Kredi
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-900 text-surface-400 hover:text-surface-900 transition-colors"
                title="Temayı Değiştir"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Seamless Blue New Project Button */}
              <Link href="/dashboard?new=1" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm ml-1">
                <Plus className="w-3.5 h-3.5" /> Yeni Proje
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
