'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  ShieldAlert,
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

      setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi.' });
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
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in font-sans space-y-8 pb-12">
      <div>
        <div className="mb-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Profil Ayarları</h3>
          <p className="text-slate-500 mt-1 text-sm">
            Kişisel bilgilerinizi ve firma detaylarınızı yönetin.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {message && (
                <div
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  label="Telefon Numarası"
                  icon={<Phone className="h-5 w-5 text-slate-400" />}
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="05XX XXX XX XX"
                  type="tel"
                />

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cinsiyet</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm appearance-none"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                      <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                    </select>
                  </div>
                </div>
              </div>

              <ProfileInput
                label="Firma / Kurum Adı"
                icon={<Building2 className="h-5 w-5 text-slate-400" />}
                value={formData.company}
                onChange={(value) => setFormData({ ...formData, company: value })}
                placeholder="Güven İş OSGB"
              />

              <div className="pt-2">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={formData.marketing_consent}
                    onChange={(e) =>
                      setFormData({ ...formData, marketing_consent: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="marketing" className="text-sm text-slate-600 cursor-pointer">
                    Planify kampanyaları, yenilikler ve özel fırsatlar hakkında bana e-posta
                    gönderilmesini onaylıyorum.
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Kaydediliyor...' : 'Profil Bilgilerini Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Güvenlik Ayarları</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {passwordMessage && (
                <div
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {passwordMessage.type === 'success' && (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  )}
                  {passwordMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileInput
                  label="Yeni Şifre"
                  icon={<ShieldAlert className="h-5 w-5 text-slate-400" />}
                  value={passwordData.newPassword}
                  onChange={(value) =>
                    setPasswordData({ ...passwordData, newPassword: value })
                  }
                  placeholder="En az 8 karakter"
                  type="password"
                  autoComplete="new-password"
                />

                <ProfileInput
                  label="Yeni Şifre (Tekrar)"
                  icon={<ShieldAlert className="h-5 w-5 text-slate-400" />}
                  value={passwordData.confirmPassword}
                  onChange={(value) =>
                    setPasswordData({ ...passwordData, confirmPassword: value })
                  }
                  placeholder="Şifreyi onaylayın"
                  type="password"
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isPasswordSaving || !passwordData.newPassword}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isPasswordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPasswordSaving ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
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
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
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
          className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none transition-all ${
            disabled
              ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
              : 'bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }`}
        />
      </div>
    </div>
  );
}
