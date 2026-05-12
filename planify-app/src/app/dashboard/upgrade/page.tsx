'use client';

import { useEffect, useState } from 'react';
import { 
  Check, 
  Coins, 
  Loader2, 
  Shield,
  ArrowRight,
  Crown,
  Zap,
  Package,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreditStore } from '@/store/useCreditStore';
import { toast } from 'sonner';

/** Abonelik fiyatı (TRY) */
export const SUBSCRIPTION_PRICE_TRY = 990;

export default function UpgradePage() {
  // const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { balance, hasActiveSubscription, packages, isLoading, fetchBalance, fetchPackages, fetchTransactions } = useCreditStore();
  
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isInitialized && user) {
      void fetchBalance();
      void fetchPackages();
      void fetchTransactions();
    }
  }, [isInitialized, user, fetchBalance, fetchPackages, fetchTransactions]);

  const handlePurchase = async (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg || !user) return;

    setIsProcessing(true);
    try {
      toast.info('Ödeme sistemi altyapısı güncellenmektedir.', {
        description: `${pkg.name} paketi (${pkg.credits} Proje Hakkı) için işlemler yakında aktif olacaktır.`,
      });
    } catch {
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      toast.info('Abonelik sistemi altyapısı güncellenmektedir.', {
        description: `KolayTahliye Premium aboneliği (₺${SUBSCRIPTION_PRICE_TRY}/ay) yakında aktif edilecektir.`,
      });
    } catch {
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin relative z-10" />
        </div>
      </div>
    );
  }

  // Per-project price savings vs subscription or single credit
  const getDiscount = (credits: number, priceTry: number) => {
    const perProject = priceTry / credits;
    // Assuming base price of 1 credit is higher than package average
    const basePrice = 49; // 490 TL / 10
    if (perProject >= basePrice) return 0;
    return Math.round(((basePrice - perProject) / basePrice) * 100);
  };

  const getPackageIcon = (credits: number) => {
    if (credits >= 100) return Crown;
    if (credits >= 50) return TrendingUp;
    if (credits >= 10) return Zap;
    return Package;
  };

  return (
    <div className="animate-fade-in font-sans space-y-12 pb-12">
      {/* Header Area - Clean & Unboxed */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-2">
          KOLAYTAHLİYE PORTALI
        </p>
        <h1 className="text-2xl font-black tracking-tight text-surface-100">Planlar & Paketler</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main Column */}
        <div className="space-y-12">
          
          {/* PREMIUM SUBSCRIPTION CARD */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20">
                <Crown className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-100">KolayTahliye PRO</h3>
                <p className="text-[13px] font-medium text-surface-500 mt-0.5">Sınırsız proje ve kurumsal özelliklerle tam profesyonel deneyim.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-surface-900 to-surface-950 border border-primary-500/30 rounded-3xl p-8 relative overflow-hidden group">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-primary-500/20 transition-colors duration-700" />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-3 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    EN POPÜLER SEÇENEK
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      'Sınırsız Proje Oluşturma',
                      'Filigransız HD PDF Çıktısı',
                      'Özel Firma Logosu & Antet',
                      'Tüm Premium Şablonlar',
                      'ISO 7010 Tam Kütüphane',
                      'Öncelikli Teknik Destek'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-sm font-medium text-surface-200">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-surface-800/50 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center text-center space-y-6 min-w-[240px]">
                  <div>
                    <span className="text-5xl font-black tracking-tighter text-white">₺{SUBSCRIPTION_PRICE_TRY}</span>
                    <span className="text-sm font-bold text-surface-500 uppercase tracking-widest ml-2">/ AY</span>
                  </div>
                  
                  <button 
                    onClick={handleSubscribe}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98]"
                  >
                    HEMEN ABONE OL
                  </button>
                  
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-tight">İstediğiniz zaman iptal edebilirsiniz.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CREDIT PACKAGES */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Coins className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-100">Freelancer Kredi Paketleri</h3>
                <p className="text-[13px] font-medium text-surface-500 mt-0.5">Sadece ihtiyacınız kadar proje kredisi alın, süresiz kullanın.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-52 bg-surface-900 border border-surface-600/50 rounded-2xl dash-shimmer" />
                ))
              ) : packages.length > 0 ? (
                packages.map((pkg) => {
                  const discount = getDiscount(pkg.credits, pkg.price_try);
                  const Icon = getPackageIcon(pkg.credits);
                  const perProjectPrice = (pkg.price_try / pkg.credits).toFixed(0);
                  
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={cn(
                        "bg-surface-950 border rounded-2xl p-6 cursor-pointer flex flex-col justify-between transition-all hover:border-surface-400 hover:shadow-lg group",
                        selectedPackage === pkg.id ? "border-surface-300 shadow-md" : "border-surface-600/50 shadow-sm"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-600/50 group-hover:border-amber-500/30 transition-colors">
                            <Icon className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-surface-100">{pkg.name}</h4>
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                              {pkg.credits} Proje Hakkı
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-black tracking-tighter text-surface-100">
                              ₺{pkg.price_try.toLocaleString('tr-TR')}
                            </span>
                            {discount > 0 && (
                              <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                % {discount} Tasarruf
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest self-end">
                            ₺{perProjectPrice} / Proje
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-surface-600/30">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePurchase(pkg.id); }}
                          disabled={isProcessing}
                          className="w-full h-10 bg-surface-900 border border-surface-600 text-surface-300 hover:bg-surface-800 hover:text-surface-100 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                          Paketi Seç
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 bg-surface-950 border border-surface-600/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <Coins className="w-8 h-8 text-surface-500" />
                  <p className="text-sm font-medium text-surface-400">Aktif bir kredi paketi bulunmuyor.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Side Panel */}
        <div className="space-y-4 sticky top-24">
          <div className="p-6 bg-surface-900/50 border border-surface-600/30 rounded-2xl space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ÖZET</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-surface-400 font-medium">Mevcut Bakiyeniz</span>
                <span className="text-white font-black uppercase tracking-tighter">{balance} Kredi</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-surface-400 font-medium">Abonelik Durumu</span>
                <span className={cn(
                  "font-black uppercase tracking-tighter",
                  hasActiveSubscription ? "text-primary-500" : "text-slate-500"
                )}>
                  {hasActiveSubscription ? 'Premium' : 'Standart'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-surface-600/30 rounded-2xl space-y-4 shadow-sm">
            <h4 className="text-[11px] font-black text-surface-400 uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4" /> KURUMSAL DESTEK
            </h4>
            <p className="text-xs font-medium text-surface-500 leading-relaxed">
              Yüksek hacimli kurumsal alımlar, özel faturalandırma ve ödeme konuları için KolayTahliye destek ekibinizle doğrudan iletişime geçebilirsiniz.
            </p>
            <button className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-600 flex items-center gap-1.5 pt-2">
              DESTEK TALEBİ OLUŞTUR <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

