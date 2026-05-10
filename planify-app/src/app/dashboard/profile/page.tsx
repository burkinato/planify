'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  IdCard,
  Loader2,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserCircle,
  Users,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { type Profile, useAuthStore } from '@/store/useAuthStore';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toFormData(userEmail: string, profile: Profile | null) {
  return {
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    email: userEmail,
    phone: profile?.phone || '',
    gender: profile?.gender || '',
    marketing_consent: profile?.marketing_consent || false,
  };
}

export default function ProfilePage() {
  const { user, profile, fetchProfile, setProfile } = useAuthStore();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    gender: '',
    marketing_consent: false,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const isPro = profile?.subscription_tier === 'pro';
  const planLabel = isPro ? 'Planify Premium' : 'Başlangıç Planı';
  const statusLabel = profile?.subscription_status === 'active' ? 'Aktif' : profile?.subscription_status || 'Aktif';

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    if (profile?.id === user.id) {
      queueMicrotask(() => {
        setFormData(toFormData(user.email || '', profile));
        setIsLoading(false);
      });
      return;
    }

    queueMicrotask(() => setIsLoading(true));

    void fetchProfile(user.id)
      .then((nextProfile) => {
        setFormData(toFormData(user.email || '', nextProfile));
      })
      .catch((error) => {
        console.error('Profil yüklenemedi:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, profile, fetchProfile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updates = {
        full_name: formData.full_name.trim(),
        company: formData.company.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        marketing_consent: formData.marketing_consent,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...(profile ?? {
          id: user.id,
          subscription_tier: 'free',
          subscription_status: 'active',
        }),
        ...updates,
      });

      setMessage({ type: 'success', text: 'Hesap bilgileri başarıyla güncellendi.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: getErrorMessage(err, 'Güncelleme sırasında bir hata oluştu.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Şifre en az 8 karakter olmalıdır.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Şifreler uyuşmuyor, lütfen kontrol edin.' });
      return;
    }

    setIsPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Güvenlik şifreniz başarıyla değiştirildi.' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (err: unknown) {
      setPasswordMessage({
        type: 'error',
        text: getErrorMessage(err, 'Şifre değiştirilemedi.'),
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 w-full">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in font-sans space-y-8 pb-12">
      <section className="dash-header-gradient border border-surface-600/50 rounded-3xl p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 mb-1">
              Kontrol Paneli / Ayarlar
            </p>
            <h1 className="text-3xl font-black tracking-tight text-surface-100">
              Hesap ve Firma Bilgileri
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm font-medium leading-relaxed text-surface-400">
              Bu alanda yer alan firma ve kişisel bilgileriniz oluşturduğunuz denetim projelerinde ve PDF çıktılarında 
              <span className="text-surface-300"> kurum kimliği</span> olarak kullanılmaktadır.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:min-w-[560px]">
            <SummaryItem label="Kurum/Firma" value={formData.company || 'Tanımsız'} />
            <SummaryItem label="Yetkili" value={formData.full_name || 'Tanımsız'} />
            <SummaryItem
              label="Lisans Paketi"
              value={planLabel}
              tone={isPro ? 'success' : 'muted'}
              helper={statusLabel}
              icon={isPro ? <Sparkles className="w-3 h-3" /> : undefined}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start dash-stagger">
        <form onSubmit={handleProfileSubmit} className="dash-card overflow-hidden">
          <div className="border-b border-surface-600/50 px-8 py-6 bg-surface-950/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/5">
                <IdCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-surface-100 tracking-tight">Resmi Kayıt Bilgileri</h2>
                <p className="text-xs font-medium text-surface-400 mt-1">Sistem ve dökümanlar için kurum detayları</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {message && <StatusMessage message={message} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
              <ProfileInput
                label="Yetkili Ad Soyad"
                icon={<UserCircle className="h-5 w-5 text-surface-400" />}
                value={formData.full_name}
                onChange={(value) => setFormData({ ...formData, full_name: value })}
                placeholder="Örn: Ahmet Yılmaz"
              />

              <ProfileInput
                label="Sistem E-posta Adresi"
                icon={<Mail className="h-5 w-5 text-surface-400" />}
                value={formData.email}
                disabled
                type="email"
              />

              <ProfileInput
                label="Firma / Kurum Unvanı"
                icon={<Building2 className="h-5 w-5 text-surface-400" />}
                value={formData.company}
                onChange={(value) => setFormData({ ...formData, company: value })}
                placeholder="Örn: Güven İş OSGB Ltd. Şti."
              />

              <ProfileInput
                label="İletişim Numarası"
                icon={<Phone className="h-5 w-5 text-surface-400" />}
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="05XX XXX XX XX"
                type="tel"
              />

              <ProfileSelect
                label="Cinsiyet Bilgisi"
                icon={<Users className="h-5 w-5 text-surface-400" />}
                value={formData.gender}
                onChange={(value) => setFormData({ ...formData, gender: value })}
                options={[
                  { value: '', label: 'Seçim Yapınız' },
                  { value: 'Erkek', label: 'Erkek' },
                  { value: 'Kadın', label: 'Kadın' },
                  { value: 'Belirtmek İstemiyorum', label: 'Belirtmek İstemiyorum' },
                ]}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-4 p-5 rounded-xl border border-surface-600/50 cursor-pointer bg-surface-900/50 hover:bg-surface-800/50 transition-colors group">
                <div className="relative flex items-start mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                    className="peer w-5 h-5 rounded border-surface-600/60 text-primary-500 focus:ring-primary-500/40 cursor-pointer bg-surface-950 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-surface-200 group-hover:text-surface-100 transition-colors">İletişim İzni</span>
                  <p className="text-xs font-medium leading-relaxed text-surface-400">
                    Planify sistem güncellemeleri, yasal mevzuat değişiklikleri ve yeni özellikler hakkında bilgilendirme e-postaları almak istiyorum.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="px-8 py-6 border-t border-surface-600/50 bg-surface-950/30 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[11px] font-black uppercase tracking-widest hover:from-primary-600 hover:to-primary-700 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Sisteme Kaydediliyor' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>

        <aside className="space-y-8">
          <div className="dash-card p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/5 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-100 tracking-tight">Lisans Durumu</h2>
                <p className="mt-1.5 text-xs font-medium text-surface-400 leading-relaxed">
                  {isPro
                    ? 'Premium lisansınız aktif durumdadır. Tüm özelliklere sınırsız erişiminiz bulunmaktadır.'
                    : 'Başlangıç paketini kullanıyorsunuz. Daha fazla proje hakkı için planınızı yükseltebilirsiniz.'}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <SummaryItem label="Mevcut Plan" value={planLabel} tone={isPro ? 'success' : 'muted'} />
              <SummaryItem label="Hesap Durumu" value={statusLabel} />
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="dash-card overflow-hidden">
            <div className="border-b border-surface-600/50 px-8 py-6 bg-surface-950/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-600 flex items-center justify-center text-surface-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-surface-100 tracking-tight">Güvenlik</h2>
                  <p className="text-xs font-medium text-surface-400 mt-1">Erişim şifresi değişikliği</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {passwordMessage && <StatusMessage message={passwordMessage} />}

              <div className="space-y-5">
                <ProfileInput
                  label="Yeni Güvenlik Şifresi"
                  icon={<ShieldAlert className="h-5 w-5 text-surface-500" />}
                  value={passwordData.newPassword}
                  onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                  placeholder="En az 8 karakter uzunluğunda"
                  type="password"
                  autoComplete="new-password"
                />

                <ProfileInput
                  label="Şifre Doğrulama"
                  icon={<ShieldAlert className="h-5 w-5 text-surface-500" />}
                  value={passwordData.confirmPassword}
                  onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                  placeholder="Yeni şifrenizi tekrar girin"
                  type="password"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={isPasswordSaving || !passwordData.newPassword}
                className="w-full h-12 px-6 border border-surface-600/80 bg-surface-800 text-surface-200 text-[11px] font-black uppercase tracking-widest hover:bg-surface-700 hover:text-surface-100 disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl transition-all shadow-sm"
              >
                {isPasswordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPasswordSaving ? 'Güncelleniyor' : 'Şifreyi Değiştir'}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  helper,
  tone = 'default',
  icon
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'success' | 'muted';
  icon?: React.ReactNode;
}) {
  const toneClass = tone === 'success'
    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/5'
    : tone === 'muted'
      ? 'bg-surface-900 border-surface-600 text-surface-300'
      : 'dash-glass border-surface-600/60 text-surface-100';

  return (
    <div className={`border rounded-xl p-4 min-w-0 ${toneClass}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-bold truncate">{value}</p>
        {icon}
      </div>
      {helper && <p className="mt-1 text-[10px] font-bold opacity-60 uppercase tracking-wider">{helper}</p>}
    </div>
  );
}

function StatusMessage({
  message,
}: {
  message: { type: 'success' | 'error'; text: string };
}) {
  return (
    <div
      className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
        message.type === 'success'
          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
          : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/5'
      }`}
    >
      {message.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
      {message.text}
    </div>
  );
}

function ProfileInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="group">
      <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-surface-500 mb-2 group-focus-within:text-primary-500 transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full h-12 pl-12 pr-4 border rounded-xl text-sm font-medium outline-none transition-all duration-300 shadow-sm ${
            disabled
              ? 'bg-surface-900 border-surface-600/50 text-surface-500 cursor-not-allowed opacity-80'
              : 'bg-surface-900 border-surface-600/80 text-surface-100 placeholder-surface-600 focus:bg-surface-950 focus:border-primary-500/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.08)]'
          }`}
        />
      </div>
    </div>
  );
}

function ProfileSelect({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="group">
      <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-surface-500 mb-2 group-focus-within:text-primary-500 transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-surface-900 rounded-xl border border-surface-600/80 text-sm font-medium text-surface-100 outline-none transition-all duration-300 focus:bg-surface-950 focus:border-primary-500/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.08)] appearance-none shadow-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-900 text-surface-200">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
