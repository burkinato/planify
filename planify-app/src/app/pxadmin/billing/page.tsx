'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { Plus, FileText, Send, Clock, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function BillingManagement() {
  type Invoice = {
    id: string;
    invoice_no: string;
    billing_date: string;
    amount: number | string;
    status: string;
    profiles?: {
      full_name?: string | null;
      email?: string | null;
      company?: string | null;
    } | null;
  };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('admin_invoices')
        .select('*, profiles(full_name, email, company)')
        .order('billing_date', { ascending: false });

      if (error) {
        toast.error('Faturalar yüklenirken hata oluştu.');
      } else {
        setInvoices(data || []);
      }
      setLoading(false);
    }

    void fetchInvoices();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">ÖDENDİ</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">BEKLEMEDE</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">İPTAL</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Faturalandırma</h1>
          <p className="text-slate-500 font-medium mt-1">Manuel fatura oluşturun ve ödeme durumlarını takip edin.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all">
          <Plus className="w-4 h-4" />
          Fatura Oluştur
        </button>
      </div>

      <AdminCard title="Tüm Faturalar">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fatura No</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Müşteri</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarih</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tutar</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Durum</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-500 uppercase text-xs font-black tracking-widest animate-pulse">Yükleniyor...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-500 uppercase text-xs font-black tracking-widest">Kayıtlı fatura bulunmuyor.</td></tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold text-white tracking-tight">{invoice.invoice_no}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <div>
                        <p className="text-sm font-bold text-white">{invoice.profiles?.full_name || 'Bilinmeyen Müşteri'}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{invoice.profiles?.company || 'Şirket Yok'}</p>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(invoice.billing_date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-sm font-black text-white">₺{Number(invoice.amount).toLocaleString('tr-TR')}</span>
                    </td>
                    <td className="py-5">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 transition-all" title="Görüntüle">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-primary-400 hover:bg-primary-400/5 transition-all" title="Gönder">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
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
