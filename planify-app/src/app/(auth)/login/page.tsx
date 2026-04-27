'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  activateBrowserSession,
  clearBrowserSession,
  getRememberedEmail,
  getSafeRedirectPath,
  getStoredAuthPersistence,
  setRememberedEmail,
} from '@/lib/auth/session';
import { useAuthStore } from '@/store/useAuthStore';

function OAuthButton({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      disabled={disabled}
      className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      {label}
    </button>
  );
}

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

function getRedirectPath() {
  if (typeof window === 'undefined') {
    return '/dashboard';
  }

  return getSafeRedirectPath(new URLSearchParams(window.location.search).get('next'));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'linkedin' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmailState] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  const { user, isInitialized } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isInitialized && user) {
      router.replace(getRedirectPath());
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const rememberedEmail = getRememberedEmail();
      if (rememberedEmail) {
        setFormData((current) => ({ ...current, email: rememberedEmail }));
        setRememberEmailState(true);
      }

      setKeepActive(getStoredAuthPersistence() !== 'session');

      const callbackError = new URLSearchParams(window.location.search).get('error');
      if (callbackError) {
        setError(callbackError);
      }
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
      setError(getErrorMessage(err, 'Giriş sırasında bir hata oluştu.'));
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = formData.email.trim().toLowerCase();
    activateBrowserSession(keepActive ? 'persistent' : 'session');
    setRememberedEmail(email, rememberEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });
      if (error) throw error;

      if (data.user) {
        router.replace(getRedirectPath());
      }
    } catch {
      clearBrowserSession();
      setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || oauthLoading !== null;

  return (
    <div className="w-full space-y-4 lg:space-y-6 font-sans">
      <div className="text-center md:text-left">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Hoş Geldiniz</h1>
        <p className="text-slate-500 mt-1 lg:mt-2 font-medium text-sm">Hesabınıza giriş yapın ve çizime devam edin.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOAuth('google')}
          type="button"
          disabled={isDisabled}
          className="py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          Google
        </button>
        <button
          onClick={() => handleOAuth('linkedin_oidc')}
          type="button"
          disabled={isDisabled}
          className="py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {oauthLoading === 'linkedin' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkedInIcon />}
          LinkedIn
        </button>
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-slate-100" />
        <span className="flex-shrink-0 px-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">veya</span>
        <div className="flex-grow border-t border-slate-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">E-posta</label>
          <input
            type="email"
            required
            placeholder="ornek@sirket.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isDisabled}
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">Şifre</label>
            <Link href="/forgot-password" className="text-[10px] font-bold text-blue-600 hover:text-blue-700">
              Şifremi Unuttum
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isDisabled}
              autoComplete="current-password"
              className="w-full px-4 py-2.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5 py-1">
          <label className="relative flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmailState(e.target.checked)}
                disabled={isDisabled}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Beni Hatırla</span>
                <span className="text-[9px] text-slate-400 font-bold leading-tight group-hover:text-slate-500 transition-colors">E-posta adresimi bu cihazda güvenle sakla</span>
              </div>
            </div>
          </label>

          <label className="relative flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={keepActive}
                onChange={(e) => setKeepActive(e.target.checked)}
                disabled={isDisabled}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Oturumu Açık Tut</span>
                <span className="text-[9px] text-slate-400 font-bold leading-tight group-hover:text-slate-500 transition-colors">30 gün boyunca şifre sormadan girişi sürdür</span>
              </div>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 font-medium pt-2">
        Hesabınız yok mu?{' '}
        <Link href="/register" className="text-blue-600 font-bold hover:text-blue-700">
          Ücretsiz Kayıt Olun
        </Link>
      </p>
    </div>
  );
}
