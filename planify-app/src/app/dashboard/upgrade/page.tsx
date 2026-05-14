'use client';

import { useEffect, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreditStore, CREDIT_COSTS, getSubscriptionPrice } from '@/store/useCreditStore';
import { toast } from 'sonner';

/**
 * Pro aylık abonelik fiyatı (TRY, KDV dahil) — TRY-native fiyat tablosundan çekilir.
 * Yıllık plan ve diğer tier'lar (Team/Enterprise) landing pricing sayfasında.
 */
const PRO_MONTHLY_TRY = getSubscriptionPrice('pro', 'monthly') ?? 249;

export default function UpgradePage() {
  const { user, isInitialized } = useAuthStore();
  const { balance, hasActiveSubscription, packages, isLoading, fetchBalance, fetchPackages } = useCreditStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [iframeToken, setIframeToken] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && user) {
      void fetchBalance();
      void fetchPackages();
    }
  }, [isInitialized, user, fetchBalance, fetchPackages]);

  useEffect(() => {
    if (iframeToken) {
      const script = document.createElement('script');
      script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [iframeToken]);

  const initiatePayment = async (type: 'subscription' | 'credit_package', packageId?: string) => {
    if (!user) return;
    setIsProcessing(true);
    setIframeToken(null);
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || 'KolayTahliye User',
          type,
          packageId
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ödeme başlatılamadı.');
      }

      setIframeToken(data.token);
    } catch (err: any) {
      toast.error(err.message || 'Ödeme başlatılırken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchase = (pkgId: string) => initiatePayment('credit_package', pkgId);
  const handleSubscribe = () => initiatePayment('subscription');

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (iframeToken) {
    return (
      <div className="animate-in fade-in space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900">Güvenli Ödeme</h2>
          </div>
          <button 
             onClick={() => setIframeToken(null)}
             className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
             İptal Et
          </button>
        </div>
        <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[500px] relative">
          <iframe 
             src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`} 
             id="paytriframe" 
             frameBorder="0" 
             scrolling="no" 
             className="w-full h-full min-h-[500px] relative z-10"
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-6 max-w-5xl mx-auto">
      {/* HERO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Aboneliğiniz
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Kredilerinizi yönetin veya PRO üyeliğe geçin.
          </p>
        </div>

        <div className="bg-white border border-[#edf0f5] rounded-2xl px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,.04)] min-w-[160px] flex items-center justify-between gap-4">
          <div>
             <div className="text-slate-500 text-xs font-medium">
               Mevcut Bakiye
             </div>
             <div className="text-2xl font-bold text-slate-900">
               {balance}
             </div>
          </div>
        </div>
      </div>

      {/* INFO BAR */}
      <div className="bg-white border border-[#edf0f5] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,.04)] p-4 flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1 min-w-[120px]">
          <div className="text-sm font-semibold text-slate-900">Proje Oluşturma</div>
          <div className="text-slate-500 text-xs mt-0.5">{CREDIT_COSTS.PROJECT_CREATE} Kredi</div>
        </div>
        
        <div className="hidden sm:block w-px h-8 bg-slate-100"></div>
        
        <div className="flex-1 min-w-[120px]">
          <div className="text-sm font-semibold text-slate-900">PDF Çıktısı</div>
          <div className="text-slate-500 text-xs mt-0.5">{CREDIT_COSTS.PDF_EXPORT} Kredi</div>
        </div>
        
        <div className="hidden sm:block w-px h-8 bg-slate-100"></div>
        
        <div className="flex-1 min-w-[120px]">
          <div className="text-sm font-semibold text-slate-900">PNG Çıktısı</div>
          <div className="text-slate-500 text-xs mt-0.5">{CREDIT_COSTS.PNG_EXPORT} Kredi</div>
        </div>
        
        <div className="hidden sm:block w-px h-8 bg-slate-100"></div>
        
        <div className="flex-1 min-w-[120px]">
          <div className="text-sm font-semibold text-slate-900">Premium Şablon</div>
          <div className="text-slate-500 text-xs mt-0.5">{CREDIT_COSTS.PREMIUM_TEMPLATE} Kredi</div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PRO */}
        <div className="bg-gradient-to-b from-[#ffffff] to-[#fafcff] border-[1.5px] border-blue-500 rounded-3xl p-6 flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900">
                PRO Abonelik
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Tüm işlemler sınırsız ve ücretsiz.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                ₺{PRO_MONTHLY_TRY}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                / aylık · KDV dahil
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-8 flex-1">
            {[
              'Sınırsız proje oluşturma',
              'Sınırsız PDF / PNG çıktısı',
              'Premium şablon erişimi',
              'ISO 7010 ikon kütüphanesi',
              'Öncelikli teknik destek'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center text-sm text-slate-700">
                <span className="mr-2.5 text-blue-500 font-medium">✓</span> {feature}
              </div>
            ))}
          </div>

          <button 
            onClick={handleSubscribe}
            disabled={isProcessing || hasActiveSubscription}
            className="w-full h-11 rounded-xl text-sm font-semibold mt-8 bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {hasActiveSubscription ? 'Aktif Abonelik' : 'PRO Aboneliğe Geç'}
          </button>
        </div>

        {/* CREDIT */}
        <div className="bg-white border border-[#edf0f5] rounded-3xl p-6 flex flex-col shadow-[0_1px_2px_rgba(16,24,40,.02)]">
          <div className="mb-6">
            <div className="text-xl font-bold text-slate-900">
              Kredi Paketleri
            </div>
            <p className="text-sm text-slate-500 mt-1">
              İhtiyacınız oldukça kredi satın alın.
            </p>
          </div>

          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-slate-400">Paketler Yükleniyor...</div>
            ) : packages.length > 0 ? (
              packages.map((pkg) => (
                <div key={pkg.id} className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {pkg.credits} Kredi
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      ₺{pkg.price_try}
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isProcessing || hasActiveSubscription}
                    className="h-9 px-4 rounded-xl text-sm font-medium bg-[#f5f8ff] text-blue-600 hover:bg-[#edf3ff] transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    Satın Al
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">Paket bulunmuyor.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
