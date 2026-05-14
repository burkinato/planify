'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Search, Plus, UserCircle, Coins, Sun, Moon, LogOut, FileArchive, Settings, FileText, Command } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface CommandAction {
  id: string;
  label: string;
  shortcut?: string;
  icon: typeof Plus;
  group: string;
  action: () => void;
  keywords?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuthStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const runAndClose = (fn: () => void) => {
    fn();
    onClose();
    setQuery('');
  };

  const actions = useMemo<CommandAction[]>(() => [
    {
      id: 'new-project',
      label: 'Yeni Proje Oluştur',
      shortcut: 'N',
      icon: Plus,
      group: 'Eylemler',
      action: () => router.push('/dashboard?new=1'),
      keywords: 'create project plan yeni',
    },
    {
      id: 'dashboard',
      label: 'Kontrol Paneline Git',
      icon: FileText,
      group: 'Sayfalar',
      action: () => router.push('/dashboard'),
      keywords: 'dashboard ana sayfa',
    },
    {
      id: 'archive',
      label: 'Proje Arşivi',
      icon: FileArchive,
      group: 'Sayfalar',
      action: () => router.push('/dashboard/archive'),
      keywords: 'arsiv eski projeler',
    },
    {
      id: 'profile',
      label: 'Hesap Bilgileri',
      icon: UserCircle,
      group: 'Sayfalar',
      action: () => router.push('/dashboard/profile'),
      keywords: 'profile profil hesap',
    },
    {
      id: 'upgrade',
      label: 'Abonelik & Paketler',
      icon: Coins,
      group: 'Sayfalar',
      action: () => router.push('/dashboard/upgrade'),
      keywords: 'pro upgrade kredi paket',
    },
    {
      id: 'billing',
      label: 'Faturalandırma',
      icon: FileText,
      group: 'Sayfalar',
      action: () => router.push('/dashboard/billing'),
      keywords: 'fatura billing odeme',
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      group: 'Sayfalar',
      action: () => router.push('/dashboard/settings'),
      keywords: 'settings tercih ayarlar',
    },
    {
      id: 'theme',
      label: `Tema: ${theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}`,
      shortcut: 'T',
      icon: theme === 'dark' ? Sun : Moon,
      group: 'Eylemler',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      keywords: 'theme tema dark light koyu acik',
    },
    {
      id: 'logout',
      label: 'Çıkış Yap',
      icon: LogOut,
      group: 'Hesap',
      action: async () => { await signOut(); router.replace('/login'); },
      keywords: 'cikis logout sign out',
    },
  ], [theme, router, setTheme, signOut]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return actions;
    return actions.filter((a) =>
      a.label.toLowerCase().includes(q) ||
      (a.keywords?.toLowerCase().includes(q) ?? false)
    );
  }, [query, actions]);

  // Reset & focus on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keep activeIndex valid
  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) runAndClose(item.action);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  // Group filtered actions
  const groups = filtered.reduce<Record<string, CommandAction[]>>((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Komut paleti"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-surface-600/40 overflow-hidden animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-surface-600/30">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Komut veya sayfa ara... (örn. 'yeni proje', 'tema')"
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-surface-100 placeholder:text-slate-400"
            aria-label="Komut paleti arama"
          />
          <kbd className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-surface-400">
              Sonuç yok. Farklı bir kelime deneyin.
            </div>
          ) : (
            Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-surface-500 px-3 py-2">
                  {groupName}
                </div>
                {items.map((action) => {
                  const Icon = action.icon;
                  const idx = globalIndex++;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={action.id}
                      data-cmd-index={idx}
                      onClick={() => runAndClose(action.action)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                          : 'text-slate-700 dark:text-surface-200 hover:bg-slate-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-surface-400'}`} />
                      <span className="flex-1 text-[13px] font-medium">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
                          {action.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-surface-600/30 bg-slate-50 dark:bg-surface-800/50 text-[10px] text-slate-500 dark:text-surface-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-bold bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-600/40 px-1.5 py-0.5 rounded">↑↓</kbd> gez
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-bold bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-600/40 px-1.5 py-0.5 rounded">↵</kbd> seç
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Command className="w-3 h-3" /> <span className="font-bold">K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
