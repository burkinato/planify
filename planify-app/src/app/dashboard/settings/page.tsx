'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Palette, Bell, Shield, Database, Sun, Moon, Monitor, Key, Lock, Mail, MessageSquare, Receipt, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'preferences' | 'notifications' | 'security' | 'data';

const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: 'preferences', label: 'Tercihler', icon: Palette },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'security', label: 'Güvenlik', icon: Shield },
  { id: 'data', label: 'Veri ve Gizlilik', icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('preferences');
  const { theme, setTheme } = useTheme();

  // Notification opt-ins (Faz 3.7'da Supabase user_settings'e bağlanır)
  const [notifEmail, setNotifEmail] = useState({
    system: true,
    marketing: false,
    billing: true,
  });

  return (
    <div className="animate-in fade-in space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-surface-100 tracking-tight">Ayarlar</h2>
        <p className="text-slate-500 dark:text-surface-400 mt-1 text-sm">
          Hesap tercihlerinizi ve gizlilik ayarlarınızı yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <nav className="space-y-1" aria-label="Ayarlar sekmeleri">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                activeTab === id
                  ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300'
                  : 'text-slate-600 dark:text-surface-300 hover:bg-slate-50 dark:hover:bg-surface-900'
              }`}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon className={`w-4 h-4 ${activeTab === id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-surface-400'}`} />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-600/40 rounded-2xl p-6 shadow-sm">
          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <SettingSection title="Tema" description="Arayüz renkleri ve göz konforu">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', icon: Sun, label: 'Açık' },
                    { value: 'dark', icon: Moon, label: 'Koyu' },
                    { value: 'system', icon: Monitor, label: 'Sistem' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                        theme === value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-slate-200 dark:border-surface-600/40 hover:border-slate-300 dark:hover:border-surface-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${theme === value ? 'text-primary-600' : 'text-slate-500 dark:text-surface-400'}`} />
                      <span className={`text-[12px] font-bold ${theme === value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-surface-200'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </SettingSection>

              <SettingSection title="Dil" description="Arayüz dili — Türkçe (varsayılan)">
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-[12px] font-bold">
                    🇹🇷 Türkçe
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-surface-600/40 text-slate-400 dark:text-surface-500 text-[12px] font-bold disabled:cursor-not-allowed"
                  >
                    🇬🇧 English (Yakında)
                  </button>
                </div>
              </SettingSection>

              <SettingSection title="Tarih Formatı" description="Proje tarihleri ve fatura tarihleri">
                <select className="w-full md:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-surface-600/40 bg-white dark:bg-surface-950 text-sm text-slate-700 dark:text-surface-200" defaultValue="dd-mmm-yyyy">
                  <option value="dd-mmm-yyyy">14 May 2026 (TR varsayılan)</option>
                  <option value="dd/mm/yyyy">14/05/2026</option>
                  <option value="iso">2026-05-14</option>
                </select>
              </SettingSection>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <SettingSection title="E-posta Bildirimleri" description="Hangi e-postaları almak istediğinizi seçin (KVKK opt-in)">
                <div className="space-y-3">
                  <ToggleRow
                    icon={Receipt}
                    label="Faturalandırma & Ödeme"
                    description="Başarılı ödeme, fatura hazır, kart süresi dolacak bildirimleri"
                    checked={notifEmail.billing}
                    onChange={(v) => setNotifEmail({ ...notifEmail, billing: v })}
                  />
                  <ToggleRow
                    icon={MessageSquare}
                    label="Sistem Bildirimleri"
                    description="Yeni özellikler, sistem bakımları, güvenlik uyarıları"
                    checked={notifEmail.system}
                    onChange={(v) => setNotifEmail({ ...notifEmail, system: v })}
                  />
                  <ToggleRow
                    icon={Mail}
                    label="Pazarlama & Kampanyalar"
                    description="İndirimler, blog yazıları, eğitim içerikleri (KVKK madde 5/1 açık rıza)"
                    checked={notifEmail.marketing}
                    onChange={(v) => setNotifEmail({ ...notifEmail, marketing: v })}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-surface-600/30 flex justify-end">
                  <button
                    onClick={() => toast.success('Bildirim tercihleriniz kaydedildi.')}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[12px] font-bold transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </SettingSection>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <SettingSection title="Şifre" description="Düzenli olarak güncelleyin">
                <button
                  onClick={() => toast.info('Şifre sıfırlama bağlantısı e-postanıza gönderildi.')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-slate-500" />
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-surface-100">Şifremi Değiştir</p>
                      <p className="text-[11px] text-slate-500 dark:text-surface-400">E-posta üzerinden güvenli akış</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SettingSection>

              <SettingSection title="İki Faktörlü Kimlik Doğrulama (2FA)" description="Hesap güvenliğini önemli ölçüde artırır">
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-amber-900 dark:text-amber-300">2FA Kurulumu Yakında</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                        Authenticator app (Google Authenticator, Authy) ile TOTP tabanlı 2FA bir sonraki sürümde aktive olacak.
                      </p>
                    </div>
                  </div>
                </div>
              </SettingSection>

              <SettingSection title="Aktif Oturumlar" description="Hesabınıza giriş yapmış cihazlar">
                <div className="text-center py-6 text-sm text-slate-500 dark:text-surface-400">
                  Aktif oturum listeleme yakında.
                </div>
              </SettingSection>
            </div>
          )}

          {/* Data & Privacy */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <SettingSection title="KVKK Hakları" description="6698 sayılı kanun kapsamındaki haklarınız">
                <div className="space-y-3">
                  <Link
                    href="/legal/kvkk"
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors group"
                  >
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-surface-100">Aydınlatma Metni</p>
                      <p className="text-[11px] text-slate-500 dark:text-surface-400 mt-0.5">Hangi verileri ne amaçla topladığımız</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface-800 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors group"
                  >
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-surface-100">Verilerimi İndir / Hesabımı Sil</p>
                      <p className="text-[11px] text-slate-500 dark:text-surface-400 mt-0.5">KVKK madde 11 ve 17 — Faturalandırma sayfasından yönetin</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </SettingSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[14px] font-black text-slate-900 dark:text-surface-100">{title}</h3>
      {description && <p className="text-[12px] text-slate-500 dark:text-surface-400 mt-0.5 mb-3">{description}</p>}
      <div className={description ? '' : 'mt-3'}>{children}</div>
    </section>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Mail;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer">
      <Icon className="w-4 h-4 text-slate-500 dark:text-surface-400 mt-1 shrink-0" />
      <div className="flex-1">
        <p className="text-[13px] font-bold text-slate-900 dark:text-surface-100">{label}</p>
        <p className="text-[11px] text-slate-500 dark:text-surface-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500/30 mt-1"
      />
    </label>
  );
}
