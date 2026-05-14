'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  dashboard: 'Kontrol Paneli',
  archive: 'Proje Arşivi',
  profile: 'Hesap Bilgileri',
  upgrade: 'Abonelik & Paketler',
  billing: 'Faturalandırma',
  settings: 'Ayarlar',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Only show on dashboard subpages
  if (segments.length === 0 || segments[0] !== 'dashboard') return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium">
      <Link
        href="/dashboard"
        className="flex items-center text-surface-400 hover:text-surface-200 transition-colors"
      >
        <Home className="w-3 h-3" />
      </Link>
      {segments.slice(1).map((segment, idx) => {
        const href = '/' + segments.slice(0, idx + 2).join('/');
        const isLast = idx === segments.length - 2;
        const label = LABELS[segment] ?? segment;
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-surface-500" />
            {isLast ? (
              <span className="text-surface-200" aria-current="page">{label}</span>
            ) : (
              <Link href={href} className="text-surface-400 hover:text-surface-200 transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
