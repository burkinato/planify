'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Download,
  DollarSign,
  Tag,
  Clock,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function FinanceManagement() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'revenue',
    category: '',
    amount: '',
    description: ''
  });

  async function fetchFinance() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('admin_finance')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) {
      toast.error('Finans verileri yüklenirken hata oluştu.');
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void fetchFinance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_finance')
      .insert([{
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        entry_date: new Date().toISOString()
      }]);

    if (error) {
      toast.error('Giriş eklenirken hata oluştu.');
    } else {
      toast.success('İşlem başarıyla kaydedildi.');
      setFormData({ type: 'revenue', category: '', amount: '', description: '' });
      setShowForm(false);
      void fetchFinance();
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('admin_finance')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('İşlem silinirken hata oluştu.');
    } else {
      toast.success('İşlem silindi.');
      void fetchFinance();
    }
  };

  const totalRevenue = entries.filter(e => e.type === 'revenue').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const netProfit = totalRevenue - totalExpense;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Finans Yönetimi</h1>
          <p className="text-slate-500 font-medium mt-1">SaaS projesinin gelir ve giderlerini manuel olarak takip edin.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 text-slate-300 font-black text-xs uppercase tracking-widest hover:text-white transition-all">
            <Download className="w-4 h-4" />
            Rapor Al
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Yeni Giriş
          </button>
        </div>
      </div>

      {/* Finance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard className="border-emerald-500/10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toplam Gelir</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-emerald-400">₺{totalRevenue.toLocaleString('tr-TR')}</h3>
            <TrendingUp className="w-8 h-8 text-emerald-500/20" />
          </div>
        </AdminCard>
        <AdminCard className="border-rose-500/10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toplam Gider</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-rose-400">₺{totalExpense.toLocaleString('tr-TR')}</h3>
            <TrendingDown className="w-8 h-8 text-rose-500/20" />
          </div>
        </AdminCard>
        <AdminCard className="border-primary-500/10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Kâr / Zarar</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className={netProfit >= 0 ? "text-3xl font-black text-primary-400" : "text-3xl font-black text-rose-400"}>
              ₺{netProfit.toLocaleString('tr-TR')}
            </h3>
            <TrendingUp className="w-8 h-8 text-primary-500/20" />
          </div>
        </AdminCard>
      </div>

      {showForm && (
        <AdminCard title="Yeni Finansal Giriş" className="border-primary-500/30 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tür</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-white/5 border border-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary-500/50"
              >
                <option value="revenue">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
              <input 
                type="text" 
                placeholder="Örn: Abonelik, Sunucu, Reklam" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white/5 border border-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutar (₺)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-white/5 border border-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary-500/50"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Açıklama</label>
                <input 
                  type="text" 
                  placeholder="Not ekle..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary-500/50"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all">
                Kaydet
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard title="İşlem Geçmişi">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarih</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Açıklama</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Tutar</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center animate-pulse text-slate-500 uppercase text-xs font-black tracking-widest">Yükleniyor...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-500 uppercase text-xs font-black tracking-widest">Henüz kayıt bulunmuyor.</td></tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.entry_date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-tight">{entry.category}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <p className="text-xs text-slate-400">{entry.description || '—'}</p>
                    </td>
                    <td className="py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {entry.type === 'revenue' ? (
                          <span className="text-sm font-black text-emerald-400">+₺{Number(entry.amount).toLocaleString('tr-TR')}</span>
                        ) : (
                          <span className="text-sm font-black text-rose-400">-₺{Number(entry.amount).toLocaleString('tr-TR')}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 text-right">
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
