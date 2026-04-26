'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { activateBrowserSession, clearBrowserSession } from '@/lib/auth/session';
import { useAuthStore } from '@/store/useAuthStore';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const { isInitialized, session } = useAuthStore();
  const [hasRecoveryHash] = useState(
    () => typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isValidSession = isInitialized && Boolean(session) && hasRecoveryHash;

  useEffect(() => {
    if (isValidSession) {
      activateBrowserSession('session');
    }
  }, [isValidSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await supabase.auth.signOut();
      clearBrowserSession();
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Şifre güncellenemedi. Lütfen tekrar deneyin.'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full space-y-6 font-sans">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Şifreniz Güncellendi</h1>
            <p className="text-slate-500 mt-2 font-medium text-sm">
              Yeni şifrenizle giriş yapabilirsiniz. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="w-full space-y-6 font-sans">
        <div className="flex flex-col items-center text-center space-y-4 py-8">
          <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bağlantı Bekleniyor</h1>
            <p className="text-slate-500 mt-2 font-medium text-sm leading-relaxed max-w-sm mx-auto">
              Bu sayfa yalnızca e-posta ile gönderilen şifre sıfırlama bağlantısı üzerinden erişilebilir.
            </p>
          </div>
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <p className="text-xs text-slate-400">Güvenlik oturumu bekleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7 font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Yeni Şifre Belirle</h1>
        <p className="text-slate-500 mt-2 font-medium text-sm">
          Hesabınız için yeni ve güvenli bir şifre oluşturun.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Yeni Şifre</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="En az 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-60 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Şifre Tekrar</label>
          <input
            type="password"
            required
            placeholder="Şifreyi onaylayın"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-60 text-sm"
          />
        </div>

        {password.length > 0 && (
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  password.length >= level * 3
                    ? password.length >= 12 ? 'bg-green-500' : password.length >= 8 ? 'bg-amber-400' : 'bg-red-400'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
        </button>
      </form>
    </div>
  );
}
