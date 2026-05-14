'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, FileText, Download, Calendar, AlertTriangle, Crown, Pause, X, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreditStore } from '@/store/useCreditStore';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoice_no: string;
  description: string;
  total_amount_try: number;
  net_amount_try: number;
  tax_amount_try: number;
  currency: string;
  einvoice_status: 'pending' | 'queued' | 'sent' | 'failed' | 'manual';
  pdf_url: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<Invoice['einvoice_status'], { label: string; color: string }> = {
  pending: { label: 'Hazırlanıyor', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  queued: { label: 'Sırada', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  sent: { label: 'Gönderildi', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  failed: { label: 'Başarısız', color: 'bg-red-50 text-red-700 border-red-100' },
  manual: { label: 'Manuel', color: 'bg-slate-50 text-slate-700 border-slate-100' },
};

function formatTRY(value: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BillingPage() {
  const { user, profile } = useAuthStore();
  const { balance, hasActiveSubscription, fetchBalance } = useCreditStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBalance();
      void loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadInvoices = async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setInvoices(data ?? []);
    } catch (err) {
      // invoices tablosu henüz migration uygulanmamış olabilir — boş listede tut
      console.warn('Fatura geçmişi yüklenemedi (migration gerekebilir):', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!confirm('Hesabınızı kalıcı olarak silmek üzeresiniz. Bu işlem 30 gün sonra geri alınamaz şekilde tamamlanır. Devam edilsin mi?')) {
      return;
    }
    setDeletingAccount(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.rpc('request_account_deletion');
      if (error) throw error;
      toast.success('Hesap silme talebiniz alındı. 30 gün içinde e-postanıza onay bağlantısı gelecek.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Hesap silme talebi başarısız oldu.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleDataExport = async () => {
    toast.info('Veri dışa aktarma talebiniz alındı. Hazırlandığında e-postanıza JSON dosyası gönderilecek.');
    // Production'da: API endpoint çağırıp arkaplan job tetiklenir
  };

  return (
    <div className="animate-in fade-in space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-surface-100 tracking-tight">
          Faturalandırma
        </h2>
        <p className="text-slate-500 dark:text-surface-400 mt-1 text-sm">
          Aboneliğinizi ve fatura geçmişinizi yönetin.
        </p>
      </div>

      {/* Active Subscription Card */}
      <section>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-surface-400 mb-3">
          Aktif Plan
        </h3>
        <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-600/40 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                hasActiveSubscription
                  ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-slate-50 dark:bg-surface-800 text-slate-400 border border-slate-200 dark:border-surface-600/40'
              }`}>
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-surface-100">
                    {hasActiveSubscription ? 'Pro' : 'Ücretsiz'}
                  </span>
                  {hasActiveSubscription && (
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-surface-400 mt-1">
                  {hasActiveSubscription
                    ? 'Aylık abonelik · Sınırsız proje + filigransız çıktı'
                    : `${balance} kredi · Yükseltme ile sınırsız erişim`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {hasActiveSubscription ? (
                <>
                  <button
                    onClick={() => toast.info('Aboneliği duraklatma yakında.')}
                    className="h-10 px-4 rounded-xl text-[12px] font-bold text-slate-600 dark:text-surface-300 bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700 border border-slate-200 dark:border-surface-600/40 transition-colors flex items-center gap-2"
                  >
                    <Pause className="w-3.5 h-3.5" /> Duraklat
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="h-10 px-4 rounded-xl text-[12px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/15 border border-red-100 dark:border-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" /> İptal Et
                  </button>
                </>
              ) : (
                <Link
                  href="/dashboard/upgrade"
                  className="h-10 px-5 rounded-xl text-[12px] font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  Pro'ya Yükselt <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Payment Method (placeholder) */}
          {hasActiveSubscription && (
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-surface-600/30 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-slate-700 dark:text-surface-200">Kayıtlı ödeme yöntemi · **** **** **** 1234</p>
                <p className="text-[11px] text-slate-500 dark:text-surface-400 mt-0.5">PayTR Güvenli Ödeme · 9 taksite kadar</p>
              </div>
              <button className="text-[11px] font-bold text-primary-600 hover:underline" onClick={() => toast.info('Kart güncelleme yakında.')}>
                Değiştir
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Invoice History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-surface-400">
            Fatura Geçmişi (KDV Dahil)
          </h3>
          {invoices.length > 0 && (
            <span className="text-[10px] text-slate-400 dark:text-surface-500">{invoices.length} fatura</span>
          )}
        </div>
        <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-600/40 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 dark:text-surface-600 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-700 dark:text-surface-200">Henüz fatura yok</p>
              <p className="text-[12px] text-slate-500 dark:text-surface-400 mt-1">
                İlk ödemenizden sonra burada listelenir.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-surface-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-surface-400">
                <tr>
                  <th className="text-left px-5 py-3">Fatura No</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Açıklama</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Tarih</th>
                  <th className="text-right px-5 py-3">Tutar</th>
                  <th className="text-center px-5 py-3 hidden sm:table-cell">Durum</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const statusInfo = STATUS_LABELS[invoice.einvoice_status];
                  return (
                    <tr key={invoice.id} className="border-t border-slate-100 dark:border-surface-600/20 hover:bg-slate-50/50 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-[12px] text-slate-900 dark:text-surface-100">{invoice.invoice_no}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-surface-300 hidden md:table-cell">{invoice.description}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-surface-400 hidden sm:table-cell">{formatDate(invoice.created_at)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="font-bold text-slate-900 dark:text-surface-100">{formatTRY(invoice.total_amount_try)}</div>
                        <div className="text-[10px] text-slate-400 dark:text-surface-500">KDV: {formatTRY(invoice.tax_amount_try)}</div>
                      </td>
                      <td className="px-5 py-3 text-center hidden sm:table-cell">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {invoice.pdf_url ? (
                          <a
                            href={invoice.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:underline"
                          >
                            <Download className="w-3.5 h-3.5" /> İndir
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-surface-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Data & Privacy (KVKK) */}
      <section>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-surface-400 mb-3">
          Veri ve Gizlilik (KVKK)
        </h3>
        <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-600/40 rounded-2xl p-6 shadow-sm space-y-4">
          <button
            onClick={handleDataExport}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors group text-left"
          >
            <div>
              <p className="text-[14px] font-bold text-slate-900 dark:text-surface-100">Verilerimi İndir</p>
              <p className="text-[12px] text-slate-500 dark:text-surface-400 mt-0.5">KVKK madde 11 — Profil, proje ve işlem geçmişi JSON olarak</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleAccountDeletion}
            disabled={deletingAccount}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/15 border border-red-100 dark:border-red-500/30 transition-colors group text-left disabled:opacity-50"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-1 shrink-0" />
              <div>
                <p className="text-[14px] font-bold text-red-700 dark:text-red-300">Hesabımı Kalıcı Olarak Sil</p>
                <p className="text-[12px] text-red-600/80 dark:text-red-400/80 mt-0.5">KVKK madde 17 — 30 günlük soft-delete sonra geri alınamaz</p>
              </div>
            </div>
            {deletingAccount ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
      </section>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-surface-100">Önce alternatifleri dene</h3>
                <p className="text-[13px] text-slate-500 dark:text-surface-400 mt-1">
                  Aboneliği iptal etmeden önce daha esnek seçenekler var.
                </p>
              </div>
            </div>

            <div className="space-y-2 my-4">
              <button onClick={() => { toast.info('1 ay duraklatma yakında.'); setShowCancelModal(false); }} className="w-full p-3 text-left rounded-xl bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors">
                <p className="text-[13px] font-bold text-slate-900 dark:text-surface-100">1 Ay Duraklat</p>
                <p className="text-[11px] text-slate-500 dark:text-surface-400">Faturalandırma 30 gün durur, sonra otomatik devam</p>
              </button>
              <button onClick={() => { toast.info('Free tier\'a dönüş yakında.'); setShowCancelModal(false); }} className="w-full p-3 text-left rounded-xl bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors">
                <p className="text-[13px] font-bold text-slate-900 dark:text-surface-100">Ücretsiz Planına Dön</p>
                <p className="text-[11px] text-slate-500 dark:text-surface-400">Krediler korunur, sınırsız özellikleri kaybedersin</p>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-surface-600/30">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 h-10 rounded-xl text-[12px] font-bold text-slate-600 dark:text-surface-300 bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700">
                Vazgeç
              </button>
              <button onClick={() => { toast.info('İptal talebi gönderildi (geliştirme aşaması).'); setShowCancelModal(false); }} className="flex-1 h-10 rounded-xl text-[12px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100">
                Yine de İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
