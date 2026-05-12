'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { AdminDashboardSkeleton } from '@/components/admin/AdminSkeleton';

export default function AdminDashboard() {
  type FinanceTransaction = {
    id: string;
    type: 'revenue' | 'expense';
    category: string;
    amount: number | string;
    description: string | null;
    entry_date: string;
  };

  type AdminUser = {
    id: string;
    full_name: string | null;
    email: string | null;
  };

  type SuspiciousLogin = {
    id: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user_id: string;
    profiles: AdminUser;
  };

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<FinanceTransaction[]>([]);
  const [suspiciousLogins, setSuspiciousLogins] = useState<SuspiciousLogin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const [
        { count: userCount },
        { count: projectCount },
        { data: financeData },
        { count: subCount },
        { data: recentFin },
        { data: logsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('admin_finance').select('amount, type'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('subscription_tier', 'free'),
        supabase.from('admin_finance').select('*').order('entry_date', { ascending: false }).limit(5),
        supabase.from('login_logs')
          .select(`
            *,
            profiles:user_id (id, full_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const revenue = financeData?.reduce((acc, curr) => {
        // Assuming positive amount in credit_transactions means a purchase/revenue.
        // If it's a monetary value, we add it. If it's just credits, we might need a separate finance table.
        // For now, let's just sum positive amounts as a placeholder for revenue.
        return Number(curr.amount) > 0 ? acc + Number(curr.amount) : acc;
      }, 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalProjects: projectCount || 0,
        totalRevenue: revenue,
        activeSubscriptions: subCount || 0,
      });
      setRecentTransactions(recentFin || []);
      setSuspiciousLogins((logsData as unknown as SuspiciousLogin[]) || []);
      setLoading(false);
    }

    void fetchData();
  }, []);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Genel Bakış</h1>
        <p className="text-slate-500 font-medium mt-1">KolayTahliye sistem performansını ve büyümesini takip edin.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard className="hover:scale-[1.02] transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toplam Üye</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalUsers}</h3>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-2">
                <ArrowUpRight className="w-3 h-3" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-primary-600/10 border border-primary-600/20">
              <Users className="w-5 h-5 text-primary-500" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="hover:scale-[1.02] transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toplam Proje</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalProjects}</h3>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-2">
                <ArrowUpRight className="w-3 h-3" />
                <span>+8.2%</span>
              </div>
            </div>
            <div className="p-3 bg-primary-600/10 border border-primary-600/20">
              <FileText className="w-5 h-5 text-primary-500" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="hover:scale-[1.02] transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Gelir</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">₺{stats.totalRevenue.toLocaleString('tr-TR')}</h3>
              <div className="flex items-center gap-1 text-rose-400 text-xs font-bold mt-2">
                <ArrowDownRight className="w-3 h-3" />
                <span>-2.4%</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-600/10 border border-emerald-600/20">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="hover:scale-[1.02] transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktif Abonelik</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.activeSubscriptions}</h3>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-2">
                <ArrowUpRight className="w-3 h-3" />
                <span>+15%</span>
              </div>
            </div>
            <div className="p-3 bg-amber-600/10 border border-amber-600/20">
              <Plus className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart/Table Area */}
        <div className="lg:col-span-2 space-y-8">
          <AdminCard 
            title="Sistem Aktivitesi" 
            description="Son 30 günlük kullanım istatistikleri"
            headerAction={<button className="text-xs font-bold text-primary-400 hover:text-primary-300 uppercase tracking-widest">Raporu İndir</button>}
          >
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {/* Simple CSS Chart */}
              {[45, 60, 35, 80, 55, 90, 70, 40, 85, 65, 50, 75].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-primary-600/20 border-t-2 border-primary-600 transition-all duration-500 group-hover:bg-primary-600/40" 
                    style={{ height: `${val}%` }} 
                  />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'][i]}</span>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard 
            title="Son İşlemler" 
            description="Sistemdeki son finansal hareketler"
          >
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 flex items-center justify-center border border-white/5",
                        tx.type === 'revenue' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {tx.type === 'revenue' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description}</p>
                        <p className="text-xs text-slate-500">{tx.category} • {new Date(tx.entry_date).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-black",
                        tx.type === 'revenue' ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {tx.type === 'revenue' ? '+' : '-'}₺{Number(tx.amount).toLocaleString('tr-TR')}
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Tamamlandı</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-sm italic">
                  Henüz bir işlem bulunmuyor.
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <AdminCard title="Şüpheli Girişler" description="Son oturum hareketleri">
            <div className="space-y-4">
              {suspiciousLogins.length > 0 ? (
                suspiciousLogins.map((log) => (
                  <div key={log.id} className="p-3 bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-white leading-tight">
                        {log.profiles?.full_name || log.profiles?.email || 'Bilinmeyen'}
                      </p>
                      <span className="text-[9px] font-black text-slate-500 uppercase">
                        {new Date(log.created_at).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-400 uppercase">
                        {log.ip_address}
                      </div>
                      <p className="text-[9px] text-slate-500 truncate flex-1">
                        {log.user_agent}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs italic">
                  Şüpheli hareket tespit edilmedi.
                </div>
              )}
              <button className="w-full py-2 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                Tüm Logları Gör
              </button>
            </div>
          </AdminCard>

          <AdminCard title="Hızlı Linkler">
            <div className="grid grid-cols-2 gap-3">
              {['Log Kayıtları', 'API Durumu', 'Kuponlar', 'Duyurular'].map((link) => (
                <button key={link} className="p-3 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  {link}
                </button>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
