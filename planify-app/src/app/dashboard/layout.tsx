'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Coins, FolderKanban, LayoutDashboard, LogOut, Plus, Search, ShieldCheck, UserCircle, Sun, Moon, Sparkles, Bell, HelpCircle, BookOpen, Receipt, Settings, Command } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { ClientOnly } from '@/components/shared/ClientOnly';
import { Logo } from '@/components/shared/Logo';
import { useCreditStore } from '@/store/useCreditStore';
import { useEffect, useState } from 'react';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Tooltip } from '@/components/dashboard/Tooltip';

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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  // Cmd/Ctrl+K global listener — komut paletini her sayfadan açar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Kredi sinyali (Faz 4.5): düşük=amber, kritik=kırmızı
  const creditTone =
    balance < 50 ? 'critical' :
    balance < 100 ? 'low' :
    'normal';

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
      title: 'Hesap & Faturalandırma',
      items: [
        { href: '/dashboard/profile', label: 'Hesap Bilgileri', icon: <UserCircle className="w-[18px] h-[18px]" /> },
        { href: '/dashboard/upgrade', label: 'Abonelik & Paketler', icon: <Coins className="w-[18px] h-[18px]" />, highlight: true },
        { href: '/dashboard/billing', label: 'Faturalandırma', icon: <Receipt className="w-[18px] h-[18px]" /> },
        { href: '/dashboard/settings', label: 'Ayarlar', icon: <Settings className="w-[18px] h-[18px]" /> },
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
    : pathname === '/dashboard/billing'
      ? 'Faturalandırma'
    : pathname === '/dashboard/settings'
      ? 'Ayarlar'
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
      {/* Sidebar - SaaS Categorized Navigation */}
      <aside className="w-[272px] bg-surface-950 border-r border-surface-600/30 hidden md:flex flex-col relative z-20 transition-colors">
        <div className="h-14 flex items-center px-8 shrink-0 border-b border-transparent">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <nav key={idx} className="space-y-1">
              <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3 px-4">{group.title}</div>
              {group.items.map((item) => {
                const isActive = item.href !== '#' && pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-2 rounded-xl text-[13px] transition-all duration-200 font-medium relative group ${
                      isActive
                        ? 'text-primary-600 bg-primary-500/10'
                        : 'text-surface-300 hover:text-surface-100 hover:bg-surface-900'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary-600 rounded-r-full" />
                    )}
                    <span className={`${isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-200'} transition-colors`}>{item.icon}</span>
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
        <div className="p-4 border-t border-surface-600/30 bg-surface-900/30">
          <div className="flex flex-col gap-3">
            {isPro && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
                 <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Pro Plan</span>
                 <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 w-full rounded-xl hover:bg-surface-900 transition-colors group text-left"
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center text-[12px] text-primary-700 dark:text-primary-300 font-bold border border-primary-200 dark:border-primary-500/30">
                {profile?.full_name?.charAt(0) || 'N'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-surface-100 truncate group-hover:text-surface-100">
                  {profile?.full_name || 'Kullanıcı'}
                </p>
                <p className="text-[11px] font-medium text-surface-400 truncate flex items-center gap-1">
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
        <header className="h-14 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0 bg-surface-950/80 backdrop-blur-md border-b border-surface-600/30 transition-colors">
          <div className="flex flex-col justify-center">
            <h1 className="text-[15px] font-medium text-surface-100 tracking-tight leading-none">{pageTitle}</h1>
            <div className="mt-1">
              <Breadcrumb />
            </div>
          </div>

          <ClientOnly>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar (md+) */}
              <div className="relative hidden md:flex items-center group">
                <Search className="w-4 h-4 absolute left-3 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Proje ara..."
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label="Proje ara"
                  className="w-48 lg:w-56 h-9 pl-9 pr-4 bg-surface-900 hover:bg-surface-800 border border-transparent focus:border-primary-500/40 focus:bg-surface-950 rounded-full text-[13px] text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Command Palette Trigger (cmd+K) */}
              <Tooltip content="Komut paleti — ⌘K">
                <button
                  onClick={() => setCommandPaletteOpen(true)}
                  className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-full bg-surface-900 hover:bg-surface-800 border border-surface-600/40 text-surface-400 hover:text-surface-200 transition-colors"
                  aria-label="Komut paleti aç"
                >
                  <Command className="w-3.5 h-3.5" />
                  <kbd className="text-[10px] font-bold">K</kbd>
                </button>
              </Tooltip>

              <div className="h-4 w-px bg-surface-600/40 hidden sm:block mx-1"></div>

              {/* Minimal Credit Button — creditTone'a göre renklendirilir */}
              <Tooltip content={
                creditTone === 'critical' ? 'Krediniz tükeniyor, paket alın'
                : creditTone === 'low' ? 'Krediler düşük, yenilemeyi düşünün'
                : 'Kredi bakiyesi'
              }>
                <Link
                  href="/dashboard/upgrade"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                    creditTone === 'critical'
                      ? 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20'
                      : creditTone === 'low'
                        ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                        : 'hover:bg-surface-900 text-surface-300'
                  }`}
                  aria-label={`Kredi bakiyesi: ${balance}`}
                >
                  <Coins className={`w-4 h-4 ${
                    creditTone === 'critical' ? 'text-red-600 dark:text-red-400'
                    : creditTone === 'low' ? 'text-amber-600 dark:text-amber-400'
                    : 'text-amber-500'
                  }`} />
                  <span className="text-[13px] font-medium">{balance}</span>
                </Link>
              </Tooltip>

              {/* Activity Feed (Notifications) */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-900 text-surface-400 hover:text-surface-200 transition-colors relative"
                  aria-label="Bildirimler"
                  aria-expanded={showNotifications}
                >
                  <Bell className="w-4 h-4" />
                  {transactions.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary-600 border-2 border-surface-950 rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-900 border border-surface-600/40 rounded-2xl shadow-lg shadow-black/10 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-5 py-4 border-b border-surface-600/30 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-surface-100">Bildirimler</h3>
                        <span className="text-[10px] font-bold text-surface-300 bg-surface-800 px-2 py-0.5 rounded-full">{transactions.length}</span>
                      </div>
                      <div className="max-h-[320px] overflow-y-auto p-2">
                        {transactions.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center">
                            <Archive className="w-6 h-6 text-surface-500 mb-2" />
                            <span className="text-xs text-surface-400">Bildirim bulunmuyor.</span>
                          </div>
                        ) : (
                          transactions.map(tx => (
                            <div key={tx.id} className="p-3 hover:bg-surface-800 rounded-xl transition-colors flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-surface-800 text-surface-400'}`}>
                                {tx.amount > 0 ? <Plus className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-[13px] font-medium text-surface-200 truncate pr-2">{tx.description || (tx.amount > 0 ? 'Kredi Eklendi' : 'İşlem')}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[11px] text-surface-400">{new Date(tx.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                  <span className={`text-[11px] font-medium ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400'}`}>
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
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-900 text-surface-400 hover:text-surface-200 transition-colors"
                aria-label={`Temayı ${theme === 'dark' ? 'açık' : 'koyu'} moda değiştir`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="h-4 w-px bg-surface-600/40 hidden sm:block mx-1"></div>

              {/* Primary Action Button */}
              <Link href="/dashboard?new=1" className="flex items-center gap-2 px-4 py-2 ml-1 bg-primary-600 text-white rounded-full text-[13px] font-medium hover:bg-primary-700 hover:shadow-md hover:shadow-primary-500/30 transition-all">
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

      {/* Global Command Palette (⌘K) */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}
