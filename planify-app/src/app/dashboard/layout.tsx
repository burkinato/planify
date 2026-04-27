'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserCircle, LogOut, Plus, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const menu = [
    { href: '/dashboard', label: 'Panoya Dön', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/dashboard/profile', label: 'Profil Ayarları', icon: <UserCircle className="w-4 h-4" /> },
  ];

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
                    : (item as any).highlight
                      ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
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
          <h2 className="font-black text-slate-800 tracking-tight">Dashboard</h2>
          
          <ClientOnly>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/upgrade"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                Plus&apos;a Yükselt
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Plus className="w-4 h-4" /> Yeni Proje
              </button>
            </div>
          </ClientOnly>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
