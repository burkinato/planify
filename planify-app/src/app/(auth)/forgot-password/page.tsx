'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full space-y-7 font-sans">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-surface-100 tracking-tight">E-posta Gönderildi</h1>
            <p className="text-surface-400 mt-2 font-medium text-sm leading-relaxed max-w-sm mx-auto">
              <strong className="text-surface-200">{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
              Gelen kutunuzu (ve spam klasörünü) kontrol edin.
            </p>
          </div>
          <div className="pt-2 w-full space-y-3">
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="w-full py-3 px-4 bg-surface-900 text-surface-300 border border-surface-600 rounded font-semibold text-sm hover:bg-surface-800 transition-colors"
            >
              Farklı bir e-posta dene
            </button>
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-primary-500 text-white rounded font-bold text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7 font-sans">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-surface-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Link>
        <h1 className="text-3xl font-medium text-surface-100 tracking-tight">Şifremi Unuttum</h1>
        <p className="text-surface-400 mt-2 font-medium text-sm">
          Kayıtlı e-posta adresinizi girin. Sıfırlama bağlantısını hemen gönderelim.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-surface-300 mb-1.5">E-posta Adresi</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-surface-500" />
            </div>
            <input
              type="email"
              required
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 rounded bg-surface-900 border border-surface-600 text-surface-100 placeholder-surface-500 focus:bg-surface-800 focus:border-primary-500 outline-none transition-all disabled:opacity-60 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3.5 bg-primary-500 text-white rounded font-bold text-sm hover:bg-primary-600 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/10"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </button>
      </form>

      <p className="text-center text-sm text-surface-500 font-medium">
        Hesabınız yok mu?{' '}
        <Link href="/register" className="text-primary-500 font-bold hover:text-primary-400 transition-colors">
          Ücretsiz Kayıt Olun
        </Link>
      </p>
    </div>
  );
}
