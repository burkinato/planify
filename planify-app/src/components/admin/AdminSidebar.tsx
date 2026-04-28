'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';

const navigation = [
  { name: 'Dashboard', href: '/pxadmin', icon: LayoutDashboard },
  { name: 'Kullanıcılar', href: '/pxadmin/users', icon: Users },
  { name: 'Projeler', href: '/pxadmin/projects', icon: FileText },
  { name: 'Finans', href: '/pxadmin/finance', icon: TrendingUp },
  { name: 'Faturalandırma', href: '/pxadmin/billing', icon: CreditCard },
  { name: 'Ayarlar', href: '/pxadmin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAdminAuthStore();

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-950 border-r border-slate-200 dark:border-white/5 flex flex-col h-screen sticky top-0 transition-colors duration-300">
      {/* Logo Section */}
      <div className="p-8 flex flex-col items-start gap-4">
        <Logo variant="dark" size="md" />
        <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest leading-none">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary-500/10 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 border-l-2 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 group-hover:text-primary-500")} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
