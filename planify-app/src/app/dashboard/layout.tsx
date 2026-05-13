'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Coins, FolderKanban, LayoutDashboard, LogOut, Plus, Search, ShieldCheck, UserCircle, Sun, Moon, Sparkles, Bell, HelpCircle, BookOpen } from 'lucide-react';
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

  type MenuItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
    highlight?: boolean;
    child?: boolean;
  };

  type MenuGroup = {
    title: string;
    items: MenuItem[];
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const isPro = profile?.subscription_tier === 'pro';

  const menuGroups: MenuGroup[] = [
    {
      title: 'Genel Bakış',
      items: [
        { href: '/dashboard', label: 'Kontrol Paneli', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
        { href: '/dashboard/archive', label: 'Proje Arşivi', icon: <FolderKanban className="w-[18px] h-[18px]" /> },
      ]
    },
    {
      title: 'Hesap & Ayarlar',
      items: [
        { href: '/dashboard/profile', label: 'Hesap Bilgileri', icon: <UserCircle className="w-[18px] h-[18px]" /> },
        { href: '/dashboard/upgrade', label: 'Abonelik & Paketler', icon: <Coins className="w-[18px] h-[18px]" />, highlight: true },
      ]
    },
    {
      title: 'Sistem',
      items: [
        { href: '#', label: 'Eğitim & Dokümanlar', icon: <BookOpen className="w-[18px] h-[18px]" /> },
        { href: '#', label: 'Destek Talebi', icon: <HelpCircle className="w-[18px] h-[18px]" /> },
      ]
    }
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
      {/* Sidebar - SaaS Categorized Navigation */}
      <aside className="w-[272px] bg-white dark:bg-surface-950 border-r border-slate-200 dark:border-surface-600/10 flex flex-col hidden md:flex relative z-20 transition-colors">
        <div className="h-14 flex items-center px-8 shrink-0 border-b border-transparent">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <nav key={idx} className="space-y-1">
              <div className="text-[10px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-widest mb-3 px-4">{group.title}</div>
              {group.items.map((item) => {
                const isActive = item.href !== '#' && pathname === item.href;
                return (
                  <Link 
                    key={item.label}
                    href={item.href} 
                    className={`flex items-center gap-3.5 px-4 py-2 rounded-xl text-[13px] transition-all duration-200 font-medium relative group ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-500/10' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-surface-300 dark:hover:text-surface-100 dark:hover:bg-surface-900/50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-600 rounded-r-full" />
                    )}
                    <span className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600 dark:text-surface-400 dark:group-hover:text-surface-300'} transition-colors`}>{item.icon}</span>
                    {item.label}
                    {item.highlight && !isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          ))}
        </div>

        {/* Sidebar Footer - SaaS User Card */}
        <div className="p-4 border-t border-slate-200/60 dark:border-surface-600/10 bg-slate-50/30 dark:bg-transparent">
          <div className="flex flex-col gap-3">
            {isPro && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
                 <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Pro Plan</span>
                 <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 w-full rounded-xl hover:bg-slate-100 dark:hover:bg-surface-900 transition-colors group text-left"
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[12px] text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/50">
                {profile?.full_name?.charAt(0) || 'N'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-700 dark:text-surface-100 truncate group-hover:text-slate-900">
                  {profile?.full_name || 'Kullanıcı'}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-surface-500 truncate flex items-center gap-1">
                  Çıkış Yap <LogOut className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-surface-950">
        {/* Navbar - Google Developers Style */}
        <header className="h-14 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-slate-200 dark:border-surface-600/20 transition-colors">
          <div className="flex items-center gap-4">
            <h1 className="text-[15px] font-medium text-slate-800 dark:text-surface-100 tracking-tight">{pageTitle}</h1>
          </div>

          <ClientOnly>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar */}
              <div className="relative hidden md:flex items-center group">
                <Search className="w-4 h-4 absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Proje ara..." 
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-48 lg:w-64 h-9 pl-9 pr-4 bg-slate-100/80 hover:bg-slate-200/50 dark:bg-surface-900/50 dark:hover:bg-surface-800/50 border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-surface-950 rounded-full text-[13px] text-slate-900 dark:text-surface-100 placeholder:text-slate-500 dark:placeholder:text-surface-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-surface-600/40 hidden sm:block mx-1"></div>
              
              {/* Minimal Credit Button */}
              <Link 
                href="/dashboard/upgrade"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-surface-900 text-slate-600 dark:text-surface-300 transition-colors"
                title="Krediler"
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-[13px] font-medium">{balance}</span>
              </Link>

              {/* Activity Feed (Notifications) */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-surface-900 text-slate-500 dark:text-surface-400 transition-colors relative"
                  title="Bildirimler"
                >
                  <Bell className="w-4 h-4" />
                  {transactions.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 border-2 border-white dark:border-surface-950 rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-600/30 rounded-2xl shadow-lg z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-5 py-4 border-b border-slate-100 dark:border-surface-600/20 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-surface-100">Bildirimler</h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-surface-800 px-2 py-0.5 rounded-full">{transactions.length}</span>
                      </div>
                      <div className="max-h-[320px] overflow-y-auto p-2">
                        {transactions.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center">
                            <Archive className="w-6 h-6 text-slate-300 dark:text-surface-600 mb-2" />
                            <span className="text-xs text-slate-500 dark:text-surface-400">Bildirim bulunmuyor.</span>
                          </div>
                        ) : (
                          transactions.map(tx => (
                            <div key={tx.id} className="p-3 hover:bg-slate-50 dark:hover:bg-surface-800 rounded-xl transition-colors flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-surface-800 dark:text-surface-400'}`}>
                                {tx.amount > 0 ? <Plus className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-[13px] font-medium text-slate-700 dark:text-surface-200 truncate pr-2">{tx.description || (tx.amount > 0 ? 'Kredi Eklendi' : 'İşlem')}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[11px] text-slate-400 dark:text-surface-500">{new Date(tx.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                  <span className={`text-[11px] font-medium ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-surface-400'}`}>
                                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
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
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-surface-900 text-slate-500 dark:text-surface-400 transition-colors"
                title="Temayı Değiştir"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-surface-600/40 hidden sm:block mx-1"></div>

              {/* Primary Action Button */}
              <Link href="/dashboard?new=1" className="flex items-center gap-2 px-4 py-2 ml-1 bg-blue-600 text-white rounded-full text-[13px] font-medium hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 transition-all">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Yeni Proje</span>
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
