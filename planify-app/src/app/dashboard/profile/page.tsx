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
  const planLabel = isPro ? 'Planify Pro' : 'Ücretsiz Plan';
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

      setMessage({ type: 'success', text: 'Profil ve firma bilgileri güncellendi.' });
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
      setPasswordMessage({ type: 'error', text: 'Şifreler uyuşmuyor.' });
      return;
    }

    setIsPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
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
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in font-sans space-y-6 pb-12">
      <section className="bg-white border border-slate-200 rounded-lg p-6 lg:p-7">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
              Hesap ve Firma Kimliği
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Profil / Firma Bilgileri
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Bu bilgiler yeni denetim dosyalarında varsayılan firma kimliği olarak kullanılır.
              E-posta hesabın giriş kimliğidir ve buradan değiştirilemez.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:min-w-[520px]">
            <SummaryItem label="Firma" value={formData.company || 'Tanımsız'} />
            <SummaryItem label="Kullanıcı" value={formData.full_name || 'Tanımsız'} />
            <SummaryItem
              label="Plan"
              value={planLabel}
              tone={isPro ? 'success' : 'muted'}
              helper={statusLabel}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <IdCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Resmi Profil Bilgileri</h2>
                <p className="text-sm font-semibold text-slate-500">Firma ve iletişim kayıtları</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {message && <StatusMessage message={message} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ProfileInput
                label="Ad Soyad"
                icon={<UserCircle className="h-5 w-5 text-slate-400" />}
                value={formData.full_name}
                onChange={(value) => setFormData({ ...formData, full_name: value })}
                placeholder="Ahmet Yılmaz"
              />

              <ProfileInput
                label="E-posta Adresi"
                icon={<Mail className="h-5 w-5 text-slate-400" />}
                value={formData.email}
                disabled
                type="email"
              />

              <ProfileInput
                label="Firma / Kurum Adı"
                icon={<Building2 className="h-5 w-5 text-slate-400" />}
                value={formData.company}
                onChange={(value) => setFormData({ ...formData, company: value })}
                placeholder="Güven İş OSGB"
              />

              <ProfileInput
                label="Telefon Numarası"
                icon={<Phone className="h-5 w-5 text-slate-400" />}
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="05XX XXX XX XX"
                type="tel"
              />

              <ProfileSelect
                label="Cinsiyet"
                icon={<Users className="h-5 w-5 text-slate-400" />}
                value={formData.gender}
                onChange={(value) => setFormData({ ...formData, gender: value })}
                options={[
                  { value: '', label: 'Seçiniz' },
                  { value: 'Erkek', label: 'Erkek' },
                  { value: 'Kadın', label: 'Kadın' },
                  { value: 'Belirtmek İstemiyorum', label: 'Belirtmek İstemiyorum' },
                ]}
              />
            </div>

            <label className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.marketing_consent}
                onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-semibold leading-6 text-slate-600">
                Planify yenilikleri, bakım duyuruları ve ürün güncellemeleri hakkında e-posta almak istiyorum.
              </span>
            </label>
          </div>

          <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto h-11 px-6 bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Kaydediliyor' : 'Bilgileri Kaydet'}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950">Hesap Durumu</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {isPro
                    ? 'Pro hesabınız aktif. Abonelik yükseltme ekranı bu hesap için gizlenir.'
                    : 'Ücretsiz plan kullanıyorsunuz. Pro yükseltme gerektiğinde abonelik ekranı açılır.'}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SummaryItem label="Plan" value={planLabel} tone={isPro ? 'success' : 'muted'} />
              <SummaryItem label="Durum" value={statusLabel} />
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-black text-slate-950">Güvenlik</h2>
              <p className="text-sm font-semibold text-slate-500">Şifre değişikliği</p>
            </div>

            <div className="p-6 space-y-5">
              {passwordMessage && <StatusMessage message={passwordMessage} />}

              <ProfileInput
                label="Yeni Şifre"
                icon={<ShieldAlert className="h-5 w-5 text-slate-400" />}
                value={passwordData.newPassword}
                onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                placeholder="En az 8 karakter"
                type="password"
                autoComplete="new-password"
              />

              <ProfileInput
                label="Yeni Şifre (Tekrar)"
                icon={<ShieldAlert className="h-5 w-5 text-slate-400" />}
                value={passwordData.confirmPassword}
                onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                placeholder="Şifreyi onaylayın"
                type="password"
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={isPasswordSaving || !passwordData.newPassword}
                className="w-full h-11 px-5 border border-slate-300 bg-white text-slate-800 text-xs font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2"
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
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'success' | 'muted';
}) {
  const toneClass = tone === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : tone === 'muted'
      ? 'bg-slate-50 border-slate-200 text-slate-700'
      : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className={`border rounded-lg p-3 min-w-0 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-black truncate">{value}</p>
      {helper && <p className="mt-1 text-[11px] font-bold opacity-70">{helper}</p>}
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
      className={`p-4 rounded-lg flex items-center gap-3 text-sm font-bold ${
        message.type === 'success'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200'
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
    <div>
      <label className="block text-xs font-black uppercase tracking-[0.12em] text-slate-500 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full h-11 pl-10 pr-4 border text-sm font-semibold outline-none transition-all ${
            disabled
              ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-950'
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
    <div>
      <label className="block text-xs font-black uppercase tracking-[0.12em] text-slate-500 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-slate-950 appearance-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
