'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Check, 
  ChevronDown, 
  CreditCard, 
  Loader2, 
  Shield, 
  Sparkles, 
} from 'lucide-react';
import { CreditCard as CardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useProAccess } from '@/hooks/useProAccess';
import { usePricing } from '@/hooks/usePricing';
import { toast } from 'sonner';

export default function UpgradePage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { priceTry } = usePricing();
  const { isPro } = useProAccess();

  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [isProcessing, setIsProcessing] = useState(false);
  // Card Form State
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    country: 'Türkiye',
    city: '',
    address: '',
    zip: ''
  });

  const showAddress = cardData.number.replace(/\s/g, '').length >= 1;

  const priceInTRY = billingCycle === 'month' ? Math.round(priceTry) : Math.round(priceTry * 12 * 0.8);

  useEffect(() => {
    if (isInitialized && isPro) {
      router.replace('/dashboard/profile');
    }
  }, [isInitialized, isPro, router]);

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isPro) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: 'pro',
          userId: user.id,
          userEmail: user.email,
          billingInterval: billingCycle,
          ...cardData
        }),
      });

      const data = await response.json();

      if (data.status === 'not_configured') {
        toast.info('Ödeme sistemi yakında aktif edilecektir! Pro özellikler çok yakında...', {
          duration: 5000,
        });
      } else if (data.token) {
        toast.success('Ödeme sayfasına yönlendiriliyorsunuz...');
      }
    } catch {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isInitialized || isPro) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div className="bg-surface-900 border border-surface-600 rounded-lg p-8 max-w-md text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            {isPro ? <Shield className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
          <h1 className="text-xl font-medium text-surface-200">
            {isPro ? 'Pro hesabınız aktif' : 'Abonelik durumu kontrol ediliyor'}
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-surface-400">
            {isPro
              ? 'Yükseltme ekranına ihtiyacınız yok. Profil / Firma Bilgileri sayfasına yönlendiriliyorsunuz.'
              : 'Hesap bilgileriniz hazırlanıyor.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 selection:bg-primary-500/20 font-sans">
      <div className="max-w-[1100px] mx-auto px-6 pt-0 md:pt-4 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              type="button"
              className="p-3 bg-surface-900 border border-surface-600 rounded-lg hover:bg-surface-800 transition-all group shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-surface-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-surface-200">Planını Yükselt</h1>
              <p className="text-sm text-surface-400">Pro özelliklere geçerek sınırları kaldırın.</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-900 border border-surface-600 rounded-lg shadow-sm">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-surface-300">Güvenli Ödeme Altyapısı</span>
          </div>
        </div>

        <form onSubmit={handleUpgrade} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="space-y-6 animate-fade-in">
            
            {/* Payment Method Section */}
            <div className="bg-surface-900 border border-surface-600 rounded-lg p-6 md:p-8 shadow-sm space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-surface-200">Ödeme Bilgileri</h3>
                <p className="text-sm text-surface-400">Ödemenizi güvenle tamamlamak için kart bilgilerinizi girin.</p>
              </div>
              
              <div className="space-y-6">
                {/* Method Toggle */}
                <div className="flex items-center gap-3 p-1 bg-surface-800 rounded border border-surface-600">
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-900 border border-surface-600 rounded text-primary-500 shadow-sm font-medium text-sm">
                    <CreditCard className="w-4 h-4" />
                    Kart ile Öde
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-surface-500 font-medium text-sm cursor-not-allowed opacity-50">
                    PayPal
                  </div>
                </div>

                {/* Card Inputs */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-400 ml-1">Kart Numarası</label>
                    <div className="relative group">
                      <input 
                        required
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={e => setCardData({...cardData, number: e.target.value})}
                        className="w-full bg-surface-950 border border-surface-600 rounded px-4 py-4 text-base font-medium outline-none focus:border-primary-500 transition-all placeholder:text-surface-500"
                      />
                      <CardIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-400 ml-1">Son Kullanma</label>
                      <input 
                        required
                        placeholder="MM / YY"
                        value={cardData.expiry}
                        onChange={e => setCardData({...cardData, expiry: e.target.value})}
                        className="w-full bg-surface-950 border border-surface-600 rounded px-4 py-4 text-base font-medium outline-none focus:border-primary-500 transition-all placeholder:text-surface-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-400 ml-1">CVC / CVV</label>
                      <input 
                        required
                        placeholder="***"
                        maxLength={4}
                        value={cardData.cvc}
                        onChange={e => setCardData({...cardData, cvc: e.target.value})}
                        className="w-full bg-surface-950 border border-surface-600 rounded px-4 py-4 text-base font-medium outline-none focus:border-primary-500 transition-all placeholder:text-surface-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address Section (Dynamic) */}
            <div className={cn(
              "bg-surface-900 border border-surface-600 rounded-lg p-6 md:p-8 shadow-sm space-y-6 transition-all duration-500 overflow-hidden",
              showAddress 
                ? "opacity-100 max-h-[800px] translate-y-0" 
                : "opacity-0 max-h-0 translate-y-4 pointer-events-none"
            )}>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-surface-200">Fatura Adresi</h3>
                <p className="text-sm text-surface-400">Faturanızın kesileceği adres bilgilerini girin.</p>
              </div>

              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-400 ml-1">Kart Üzerindeki İsim</label>
                  <input 
                    required={showAddress}
                    placeholder="Ad Soyad"
                    value={cardData.name}
                    onChange={e => setCardData({...cardData, name: e.target.value})}
                    className="w-full bg-surface-950 border border-surface-600 rounded px-4 py-4 text-base font-medium outline-none focus:border-primary-500 transition-all placeholder:text-surface-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-400 ml-1">Açık Adres</label>
                  <textarea 
                    required={showAddress}
                    placeholder="Sokak, Mahalle, No..."
                    rows={2}
                    value={cardData.address}
                    onChange={e => setCardData({...cardData, address: e.target.value})}
                    className="w-full bg-surface-950 border border-surface-600 rounded px-4 py-4 text-base font-medium outline-none focus:border-primary-500 transition-all placeholder:text-surface-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-400 ml-1">Ülke</label>
                    <div className="relative">
                      <select 
                        value={cardData.country}
                        onChange={e => setCardData({...cardData, country: e.target.value})}
                        className="w-full bg-surface-950 border border-surface-600 rounded px-4 py-4 text-base font-medium outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer"
                      >
                        <option>Türkiye</option>
                        <option>Almanya</option>
                        <option>Amerika Birleşik Devletleri</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-400 ml-1">Şehir</label>
                    <input 
                      placeholder="Şehir"
                      value={cardData.city}
                      onChange={e => setCardData({...cardData, city: e.target.value})}
                      className="w-full bg-surface-950 border border-surface-600 rounded px-4 py-4 text-base font-medium outline-none focus:border-primary-500 transition-all placeholder:text-surface-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="sticky top-8 space-y-6 animate-fade-in">
            <div className="bg-surface-900 rounded-lg p-8 md:p-10 shadow-sm border border-primary-500 relative overflow-hidden group">
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-10">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full">
                      <Sparkles className="w-3 h-3 text-primary-500" />
                      <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">En Çok Tercih Edilen</span>
                    </div>
                    <div className="relative">
                      <h2 className="text-3xl font-medium tracking-tight text-surface-200">Plus planı</h2>
                      <div className="absolute -bottom-2 left-0 w-12 h-1 bg-primary-500 rounded-full" />
                    </div>
                    <p className="text-xs text-surface-400 font-medium tracking-wide">Profesyonel tasarım araçları ve sınırsız erişim.</p>
                  </div>
                  <div className="w-14 h-14 bg-surface-800 flex items-center justify-center rounded-lg shadow-xl shadow-surface-900 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7 text-primary-500" />
                  </div>
                </div>

                {/* Billing Toggle (Premium Light) */}
                <div className="bg-surface-950 p-1.5 rounded flex gap-1 mb-10 border border-surface-600">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('month')}
                    className={cn(
                      "flex-1 py-3 text-xs font-bold rounded transition-all duration-300",
                      billingCycle === 'month' 
                        ? "bg-surface-800 text-surface-200 shadow-sm border border-surface-600" 
                        : "text-surface-500 hover:text-surface-400"
                    )}
                  >
                    Aylık
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('year')}
                    className={cn(
                      "flex-1 py-3 text-xs font-bold rounded transition-all duration-300 flex items-center justify-center gap-2",
                      billingCycle === 'year' 
                        ? "bg-surface-800 text-surface-200 shadow-sm border border-surface-600" 
                        : "text-surface-500 hover:text-surface-400"
                    )}
                  >
                    Yıllık <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">-%20 Tasarruf</span>
                  </button>
                </div>

                <div className="space-y-5 mb-12">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-surface-500 tracking-[0.2em] uppercase">AVANTAJLARINIZ</p>
                    <div className="h-[1px] flex-1 bg-surface-600 ml-4" />
                  </div>
                  {[
                    "Filigransız Profesyonel Çıktılar",
                    "Vektörel PDF İndirme (A3 & A4)",
                    "Sınırsız Proje Dışa Aktarma",
                    "ISO 23601 Uyumlu Şablonlar",
                    "7/24 Öncelikli Teknik Destek"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm group/item">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-500/10 flex items-center justify-center rounded-full group-hover/item:bg-primary-500/20 transition-colors">
                        <Check className="w-3.5 h-3.5 text-primary-500" />
                      </div>
                      <span className="text-surface-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price Table (Clean) */}
                <div className="space-y-4 pt-8 border-t border-surface-600">
                  <div className="flex justify-between text-sm font-medium text-surface-400">
                    <span>Abonelik Bedeli</span>
                    <span className="text-surface-200">₺{priceInTRY},00</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-surface-400">
                    <span>Vergi (KDV %0)</span>
                    <span className="text-surface-200">₺0,00</span>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-surface-600 flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-surface-200">Ödenecek Tutar</p>
                      <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">
                        {billingCycle === 'month' ? 'Her Ay' : 'Yıllık'} Faturalandırılır
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-medium tracking-tight text-surface-200 flex items-start justify-end">
                        <span className="text-xl mt-2 mr-1 text-surface-500">₺</span>
                        {priceInTRY}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || isPro}
                  className={cn(
                    "w-full mt-10 py-4 rounded font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                    isPro 
                      ? "bg-surface-800 text-surface-500 cursor-default" 
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPro ? (
                    "Zaten Pro Üyesisiniz"
                  ) : (
                    "Hemen Abone Ol"
                  )}
                </button>

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500">
                  <Shield className="w-3.5 h-3.5 text-primary-500" />
                  256-bit SSL Güvenli Ödeme
                </div>
              </div>
            </div>

            <p className="text-[11px] text-surface-500 px-4 leading-relaxed text-center">
              Aboneliğinizi dilediğiniz zaman iptal edebilirsiniz. Ödeme yaparak <a href="#" className="underline hover:text-surface-400">Kullanım Koşullarını</a> ve <a href="#" className="underline hover:text-surface-400">Gizlilik Politikasını</a> kabul etmiş olursunuz.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
