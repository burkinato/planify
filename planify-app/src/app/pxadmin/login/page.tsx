'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { createClient } from '@/lib/supabase/client';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { activateBrowserSession } from '@/lib/auth/session';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient(true);
  const { fetchProfile } = useAdminAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { user, profile, isInitialized } = useAdminAuthStore();

  useEffect(() => {
    if (isInitialized && user && profile?.role === 'admin') {
      router.replace('/pxadmin');
    }
  }, [isInitialized, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = formData.email.trim().toLowerCase();
    activateBrowserSession('session', true); // Admin sessions are usually short-lived for security

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Check if user has admin role
        const profile = await fetchProfile(data.user.id);

        if (!profile || profile?.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Bu alana erişim yetkiniz bulunmamaktadır.');
        }

        toast.success('Admin girişi başarılı. Yönlendiriliyorsunuz...');
        router.replace('/pxadmin');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      toast.error(err.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center p-6 font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-indigo/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-surface-900/40 backdrop-blur-2xl border border-white/5 p-10 shadow-2xl relative overflow-hidden rounded-none">
          {/* Subtle line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          
          <div className="flex flex-col items-center mb-10">
            <Logo variant="dark" size="lg" className="flex-col !gap-4" />
            <p className="text-slate-500 text-sm mt-4 font-medium tracking-wide uppercase">Admin Paneli</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
              <Lock className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin E-posta</label>
              <input
                type="email"
                required
                placeholder="admin@pixoraco.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-4 bg-white/5 border border-white/5 text-white placeholder-white/20 focus:bg-white/10 focus:border-primary-500/50 outline-none transition-all text-sm rounded-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Güvenli Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-4 bg-white/5 border border-white/5 text-white placeholder-white/20 focus:bg-white/10 focus:border-primary-500/50 outline-none transition-all text-sm rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 shadow-lg shadow-primary-600/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Doğrulanıyor...' : 'Sistem Girişi'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              Giriş yaparak tüm sistem aktivitelerinin <br /> kaydedildiğini onaylamaktasınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
