'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  activateBrowserSession,
  clearBrowserSession,
  getSafeRedirectPath,
  getStoredAuthPersistence,
} from '@/lib/auth/session';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'En az 8 karakter', ok: password.length >= 8 },
    { label: 'Büyük harf içeriyor', ok: /[A-Z]/.test(password) },
    { label: 'Rakam içeriyor', ok: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {checks.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${ok ? 'bg-green-500' : 'bg-slate-200'}`}>
            {ok && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          <span className={ok ? 'text-green-600 font-medium' : 'text-slate-400'}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function getRedirectPath() {
  if (typeof window === 'undefined') {
    return '/dashboard';
  }

  return getSafeRedirectPath(new URLSearchParams(window.location.search).get('next'));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'linkedin' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    marketingConsent: false,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setKeepActive(getStoredAuthPersistence() !== 'session');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    setError(null);
    setOauthLoading(provider === 'google' ? 'google' : 'linkedin');
    activateBrowserSession(keepActive ? 'persistent' : 'session');

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(getRedirectPath())}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err: unknown) {
      clearBrowserSession();
      setError(getErrorMessage(err, 'Kayıt sırasında bir hata oluştu.'));
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);
    activateBrowserSession(keepActive ? 'persistent' : 'session');

    const email = formData.email.trim().toLowerCase();
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getRedirectPath())}`,
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            full_name: fullName,
            phone: formData.phone.trim(),
            gender: formData.gender,
            marketing_consent: formData.marketingConsent,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.session) {
        router.replace(getRedirectPath());
        return;
      }

      if (signUpData.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });

        if (signInError) {
          clearBrowserSession();
          setError('Kayıt tamamlandı. Giriş için e-posta onay bağlantınızı kontrol edin.');
          return;
        }

        if (signInData.session) {
          router.replace(getRedirectPath());
          return;
        }
      }

      clearBrowserSession();
      setError('Kayıt tamamlandı. Giriş için e-posta onay bağlantınızı kontrol edin.');
    } catch (err: unknown) {
      clearBrowserSession();

      const message = getErrorMessage(err, 'Kayıt sırasında bir hata oluştu.');
      if (message.includes('already registered') || message.includes('User already registered')) {
        setError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || oauthLoading !== null;

  return (
    <div className="w-full space-y-3 lg:space-y-4 font-sans">
      <div className="text-center md:text-left">
        <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none">Hesap Oluşturun</h1>
        <p className="text-slate-500 mt-1 font-medium text-[11px] lg:text-xs">
          Kayıt olun ve hemen çizim yapmaya başlayın.
        </p>
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-[10px] font-medium flex items-center gap-2">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleOAuth('google')}
          type="button"
          disabled={isDisabled}
          className="w-full py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {oauthLoading === 'google' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GoogleIcon />}
          Google
        </button>
        <button
          onClick={() => handleOAuth('linkedin_oidc')}
          type="button"
          disabled={isDisabled}
          className="w-full py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {oauthLoading === 'linkedin' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkedInIcon />}
          LinkedIn
        </button>
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-slate-100" />
        <span className="flex-shrink-0 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest">veya</span>
        <div className="flex-grow border-t border-slate-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Ad</label>
            <input
              type="text"
              required
              placeholder="Ahmet"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isDisabled}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Soyad</label>
            <input
              type="text"
              required
              placeholder="Yılmaz"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={isDisabled}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs"
            />
          </div>
          <PasswordStrength password={formData.password} />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">E-posta</label>
          <input
            type="email"
            required
            placeholder="ornek@sirket.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isDisabled}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Telefon</label>
            <input
              type="tel"
              placeholder="05XX..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isDisabled}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Cinsiyet</label>
            <div className="relative">
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={isDisabled}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs appearance-none"
              >
                <option value="">Seçiniz</option>
                <option value="Erkek">Erkek</option>
                <option value="Kadın">Kadın</option>
                <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Şifre</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Min. 8 karakter"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isDisabled}
              className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5 py-1">
          <label className="relative flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={keepActive}
                onChange={(e) => setKeepActive(e.target.checked)}
                disabled={isDisabled}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Oturumu Açık Tut</span>
                <span className="text-[9px] text-slate-400 font-bold leading-tight group-hover:text-slate-500 transition-colors">30 gün boyunca şifre sormadan girişi sürdür</span>
              </div>
            </div>
          </label>

          <label className="relative flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.marketingConsent}
                onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                disabled={isDisabled}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Gelişmelerden Haber Al</span>
                <span className="text-[9px] text-slate-400 font-bold leading-tight group-hover:text-slate-500 transition-colors">Yenilikler ve fırsatlar hakkında e-posta almayı kabul ediyorum</span>
              </div>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? 'İşleniyor...' : 'Hesap Oluştur'}
        </button>

        <p className="text-center text-[9px] text-slate-400 leading-tight">
          Kayıt olarak{' '}
          <a href="#" className="text-blue-600 font-bold">Koşulları</a>
          {' '}ve{' '}
          <a href="#" className="text-blue-600 font-bold">Gizliliği</a>
          {' '}kabul etmiş olursunuz.
        </p>
      </form>

      <p className="text-center text-xs text-slate-500 font-medium pt-1">
        Hesabınız var mı?{' '}
        <Link href="/login" className="text-blue-600 font-bold">
          Giriş Yapın
        </Link>
      </p>
    </div>
  );
}
