'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar,
  CreditCard
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Kullanıcılar yüklenirken hata oluştu.');
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }

    void fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Kullanıcı Yönetimi</h1>
          <p className="text-slate-500 font-medium mt-1">Sistemdeki tüm üyeleri görüntüleyin ve yönetin.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all">
          <UserPlus className="w-4 h-4" />
          Yeni Kullanıcı
        </button>
      </div>

      <AdminCard>
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="İsim, e-posta veya şirket ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 text-sm outline-none focus:border-primary-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
              <Filter className="w-4 h-4" />
              Filtrele
            </button>
            <button className="px-4 py-3 bg-white/5 border border-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
              Dışa Aktar
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Şirket</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Durum</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kayıt Tarihi</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-8 bg-white/2" />
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Kullanıcı bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600/20 to-accent-indigo/20 flex items-center justify-center border border-white/10 font-black text-primary-400 text-xs uppercase">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{user.full_name || 'İsimsiz Kullanıcı'}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {user.email || 'Email Yok'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <p className="text-xs font-medium text-slate-300">{user.company || '—'}</p>
                    </td>
                    <td className="py-5">
                      <span className="inline-flex items-center px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        Aktif
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <CreditCard className={user.subscription_tier === 'pro' ? "w-3 h-3 text-amber-400" : "w-3 h-3 text-slate-500"} />
                        <span className={user.subscription_tier === 'pro' ? "text-xs font-black text-amber-400 uppercase" : "text-xs font-medium text-slate-400"}>
                          {user.subscription_tier === 'pro' ? 'PRO' : 'FREE'}
                        </span>
                      </div>
                    </td>
                    <td className="py-5">
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </td>
                    <td className="py-5 text-right">
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Summary Footer */}
      {!loading && (
        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
          <p>Toplam {filteredUsers.length} Kullanıcı Gösteriliyor</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-white disabled:opacity-30" disabled>Önceki</button>
            <span className="text-white">Sayfa 1 / 1</span>
            <button className="hover:text-white disabled:opacity-30" disabled>Sonraki</button>
          </div>
        </div>
      )}
    </div>
  );
}
