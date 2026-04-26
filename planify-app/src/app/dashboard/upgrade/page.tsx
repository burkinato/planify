'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Check, ArrowLeft, CreditCard, Shield, 
  ChevronDown, Lock, Info, Globe, MapPin, 
  CreditCard as CardIcon, Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubscriptionStore, type Plan } from '@/store/useSubscriptionStore';
import { useProAccess } from '@/hooks/useProAccess';
import { usePricing } from '@/hooks/usePricing';
import { toast } from 'sonner';

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { config, priceTry, loading: pricingLoading } = usePricing();
  const { isPro, isTrialing, daysRemaining, isCanceled, currentPeriodEnd } = useProAccess();

  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const priceInTRY = billingCycle === 'month' ? Math.round(priceTry) : Math.round(priceTry * 12 * 0.8);
  const monthlyEquivalent = billingCycle === 'year' ? Math.round(priceInTRY / 12) : priceInTRY;

  const handleUpgrade = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: 'pro', // Dynamic plan slug if needed
          userId: user.id,
          userEmail: user.email,
          billingInterval: billingCycle,
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

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#ececec] font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1000px] mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Plus aboneliğini başlat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="space-y-10">
            
            {/* Payment Method */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider opacity-80">Ödeme yöntemi</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-bold",
                    paymentMethod === 'card' 
                      ? "bg-[#212121] border-[#424242] text-white shadow-xl" 
                      : "border-white/5 bg-transparent hover:bg-white/5 text-white/60"
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  Kart
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-bold opacity-50 cursor-not-allowed",
                    paymentMethod === 'paypal' 
                      ? "bg-[#212121] border-[#424242] text-white shadow-xl" 
                      : "border-white/5 bg-transparent text-white/60"
                  )}
                >
                  <Wallet className="w-5 h-5" />
                  PayPal
                </button>
              </div>

              {/* Card Details Placeholder */}
              <div className="bg-[#212121] border border-[#424242] rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Kart numarası</label>
                  <div className="relative">
                    <input 
                      disabled
                      placeholder="**** **** **** ****"
                      className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none text-white/30"
                    />
                    <CardIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Son kullanma</label>
                    <input 
                      disabled
                      placeholder="MM / YY"
                      className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none text-white/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Güvenlik kodu</label>
                    <input 
                      disabled
                      placeholder="***"
                      className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none text-white/30"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Billing Address */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider opacity-80">Fatura adresi</h3>
              <div className="bg-[#212121] border border-[#424242] rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Ad ve soyad</label>
                  <input 
                    placeholder="Adınız ve Soyadınız"
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Ülke veya bölge</label>
                  <div className="relative">
                    <select className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 appearance-none transition-all">
                      <option>Türkiye</option>
                      <option>Almanya</option>
                      <option>İtalya</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Adres satırı 1</label>
                  <input 
                    placeholder="Mahalle, sokak, no..."
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Posta kodu</label>
                    <input 
                      placeholder="34000"
                      className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Şehir</label>
                    <input 
                      placeholder="İstanbul"
                      className="w-full bg-[#171717] border border-[#333] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex items-center gap-3 px-2">
              <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-indigo-600 transition-all" />
              <label className="text-xs font-medium text-white/60">İşletme olarak satın alıyorum</label>
            </div>
          </div>

          {/* Right Column: Plan Summary */}
          <div className="sticky top-12 space-y-6">
            
            {/* Plan Card */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px] pointer-events-none" />
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black text-white">Plus planı</h2>
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-white/40">Daha fazlasını yapın, daha temiz çıktı alın.</p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="bg-[#0d0d0d] p-1 rounded-xl flex gap-1 mb-8 border border-white/5">
                <button
                  onClick={() => setBillingCycle('month')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    billingCycle === 'month' ? "bg-[#212121] text-white shadow-xl" : "text-white/30 hover:text-white/60"
                  )}
                >
                  Aylık
                </button>
                <button
                  onClick={() => setBillingCycle('year')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    billingCycle === 'year' ? "bg-[#212121] text-white shadow-xl" : "text-white/30 hover:text-white/60"
                  )}
                >
                  Yıllık (-%20)
                </button>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="font-medium text-white/80">Filigransız profesyonel çıktılar</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="font-medium text-white/80">A3 & A4 Vektörel PDF indirme</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="font-medium text-white/80">Sınırsız proje dışa aktarma</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="font-medium text-white/80">ISO 23601 uyumlu şablonlar</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="font-medium text-white/80">7/24 Öncelikli teknik destek</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/40">{billingCycle === 'month' ? 'Aylık abonelik' : 'Yıllık abonelik'}</span>
                  <span>₺{priceInTRY}</span>
                </div>
                {billingCycle === 'year' && (
                  <div className="flex justify-between text-xs font-bold text-emerald-400">
                    <span>Yıllık indirim (2 Ay Hediye)</span>
                    <span>-%16.6</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/40">VAT (%0)</span>
                  <span>₺0,00</span>
                </div>
                <div className="flex justify-between pt-3 text-lg font-black text-white">
                  <span>Toplam</span>
                  <span>₺{priceInTRY}</span>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isProcessing || isPro}
                className={cn(
                  "w-full mt-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2",
                  isPro 
                    ? "bg-[#212121] text-white/40 cursor-default" 
                    : "bg-white text-black hover:bg-[#ececec]"
                )}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : isPro ? (
                  "Zaten Pro Üyesiniz"
                ) : (
                  "Abone ol"
                )}
              </button>
            </div>

            {/* Footer Text */}
            <p className="px-4 text-[10px] text-white/30 leading-relaxed text-center md:text-left">
              {billingCycle === 'month' ? (
                <>₺{priceInTRY}, ardından her ay yenilenir. İptal edilene kadar devam eder. İptal ettiğinizde dönem sonuna kadar özelliklerinizi korursunuz.</>
              ) : (
                <>₺{priceInTRY}, ardından her yıl yenilenir. 2 ay hediye avantajıyla yıllık ödeme yaparsınız.</>
              )}
              {" "}Abone olarak <span className="underline cursor-pointer hover:text-white">Kullanım Koşulları</span>&apos;nı ve <span className="underline cursor-pointer hover:text-white">Gizlilik Politikası</span>&apos;nı kabul etmiş olursunuz.
            </p>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 pt-4">
              <Lock className="w-3 h-3" />
              Güvenli 256-bit SSL ödeme
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
