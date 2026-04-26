'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ThemeToggle } from '@/components/admin/ThemeToggle';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { AdminAuthProvider } from '@/components/providers/AdminAuthProvider';
import { Loader2, Bell, Search, User } from 'lucide-react';
import NextTopLoader from 'nextjs-toploader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, isInitialized, isLoading, initialize } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ensure store is initialized
    if (!isInitialized) {
      void initialize();
      return;
    }

    if (!isLoading) {
      const isAdmin = user && profile?.role === 'admin';
      
      if (!isAdmin && pathname !== '/pxadmin/login') {
        router.replace('/pxadmin/login');
      }
    }
  }, [user, profile, isInitialized, isLoading, initialize, router, pathname]);

  if (pathname === '/pxadmin/login') {
    return <AdminAuthProvider>{children}</AdminAuthProvider>;
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <AdminAuthProvider>
      <NextTopLoader color="#f97316" showSpinner={false} shadow={false} height={2} />
      <div className="flex min-h-screen bg-surface-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-surface-950/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 px-4 py-2 border border-slate-200 dark:border-white/5 w-96 transition-colors">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Sistemde ara..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-6">
              <ThemeToggle />
              <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-surface-950" />
              </button>
              
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/5" />
              
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{profile?.full_name || 'Admin'}</p>
                  <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest">Sistem Yöneticisi</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-8 flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
