'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { 
  DollarSign, 
  Settings as SettingsIcon, 
  Save, 
  RefreshCcw, 
  TrendingUp,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PricingConfig {
  pro_price_usd: number;
  usd_to_try_rate: number;
  display_currency: string;
  show_both_currencies: boolean;
}

export default function AdminSettings() {
  const [config, setConfig] = useState<PricingConfig>({
    pro_price_usd: 10,
    usd_to_try_rate: 32.5,
    display_currency: 'TRY',
    show_both_currencies: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'pricing_config')
        .single();

      if (data) {
        setConfig(data.value as PricingConfig);
      }
      setLoading(false);
    }
    void fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'pricing_config',
        value: config,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast.error('Ayarlar kaydedilemedi: ' + error.message);
    } else {
      toast.success('Fiyatlandırma ayarları başarıyla güncellendi.');
    }
    setSaving(false);
  };

  const calculatedTry = config.pro_price_usd * config.usd_to_try_rate;

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="space-y-2">
          <div className="h-9 bg-slate-200 dark:bg-white/5 w-48" />
          <div className="h-4 bg-slate-200 dark:bg-white/5 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-surface-900/50 border border-slate-200 dark:border-white/5" />
          <div className="h-96 bg-surface-900/50 border border-slate-200 dark:border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Sistem Ayarları</h1>
        <p className="text-slate-500 font-medium mt-1">Uygulama genelindeki fiyatlandırma ve bölgesel ayarları yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pricing Configuration */}
        <div className="space-y-6">
          <AdminCard 
            title="Fiyatlandırma Yapılandırması" 
            description="Pro plan için global dolar fiyatı ve kur ayarları"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pro Plan (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={config.pro_price_usd}
                      onChange={(e) => setConfig({ ...config, pro_price_usd: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:bg-white/10 focus:border-primary-500/50 outline-none transition-all text-sm rounded-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">USD/TRY Kuru</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      step="0.1"
                      value={config.usd_to_try_rate}
                      onChange={(e) => setConfig({ ...config, usd_to_try_rate: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:bg-white/10 focus:border-primary-500/50 outline-none transition-all text-sm rounded-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Çift Para Birimi Göster</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sitede hem TL hem Dolar fiyatını gösterir.</p>
                  </div>
                  <button 
                    onClick={() => setConfig({ ...config, show_both_currencies: !config.show_both_currencies })}
                    className={`w-12 h-6 flex items-center px-1 transition-colors duration-200 ${config.show_both_currencies ? 'bg-primary-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white transition-transform duration-200 ${config.show_both_currencies ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'KAYDEDİLİYOR...' : 'AYARLARI KAYDET'}
              </button>
            </div>
          </AdminCard>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
          <AdminCard 
            title="Canlı Önizleme" 
            description="Kullanıcıların göreceği fiyatlandırma kartı"
          >
            <div className="bg-slate-100 dark:bg-[#0c0c14] border border-slate-200 dark:border-white/5 p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-accent-indigo" />
              
              <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.3em] mb-4">PRO PLAN</p>
              
              <div className="space-y-1">
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  ₺{calculatedTry.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </h2>
                {config.show_both_currencies && (
                  <p className="text-slate-500 font-bold text-sm tracking-tight">
                    (${config.pro_price_usd.toFixed(2)} / Ay)
                  </p>
                )}
              </div>

              <div className="mt-8 space-y-4">
                {[
                  'Tüm Kat Planları',
                  'Sınırsız PDF Dışa Aktarma',
                  'Yüksek Çözünürlüklü Baskı',
                  'Özel Sembol Kütüphanesi'
                ].map((feature) => (
                  <div key={feature} className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <button className="w-full mt-10 py-4 bg-primary-600/10 border border-primary-600/20 text-primary-600 dark:text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all">
                SATIN ALMA BUTONU
              </button>
            </div>

            <div className="mt-6 p-4 bg-primary-500/5 border border-primary-500/10 flex gap-4 items-start">
              <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Global Fiyatlandırma</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Fiyat güncellemeleri anında landing page ve ödeme sayfalarına yansır. Kur değişimlerinde TL fiyatını sabit tutmak için sadece kur oranını güncelleyebilirsiniz.
                </p>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
