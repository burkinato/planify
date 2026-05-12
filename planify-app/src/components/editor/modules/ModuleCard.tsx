import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateModuleType } from '@/types/editor';
import { MODULE_ICONS, MODULE_COLORS } from './ModuleIconSet';

/* ────────────────────────────────────────────────────────────────────────
 *  ModuleCard — Tüm modüllerin ortak wrapper bileşeni
 *  Tutarlı border, ikon başlığı, tone rengi ve focus state sağlar.
 * ──────────────────────────────────────────────────────────────────────── */

export interface ModuleCardProps {
  moduleType: TemplateModuleType;
  tone?: 'green' | 'red' | 'blue' | 'info' | 'neutral' | 'paper';
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  /** Whether to show the icon header bar */
  showHeader?: boolean;
  /** Container query size mode for responsive text */
  compact?: boolean;
}

const TONE_HEADER_STYLES: Record<string, string> = {
  green:   'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm shadow-emerald-500/20',
  red:     'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-sm shadow-rose-500/20',
  blue:    'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-500/20',
  info:    'bg-slate-800 text-white',
  neutral: 'bg-slate-100 text-slate-700 border-b border-slate-200',
  paper:   'bg-white text-slate-700 border-b border-slate-200',
};

const TONE_BODY_STYLES: Record<string, string> = {
  green:   'bg-emerald-600/5',
  red:     'bg-rose-600/5',
  blue:    'bg-blue-600/5',
  info:    'bg-slate-50',
  neutral: 'bg-white',
  paper:   'bg-white',
};

const TONE_ACCENT_BAR: Record<string, string> = {
  green:   'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500',
  red:     'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500',
  blue:    'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500',
  info:    'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400',
  neutral: 'bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300',
  paper:   'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
};

export function ModuleCard({
  moduleType,
  tone = 'neutral',
  title,
  subtitle,
  className,
  children,
  showHeader = true,
  compact = false,
}: ModuleCardProps) {
  const IconComponent = MODULE_ICONS[moduleType];
  const headerStyle = TONE_HEADER_STYLES[tone] || TONE_HEADER_STYLES.neutral;
  const bodyStyle = TONE_BODY_STYLES[tone] || TONE_BODY_STYLES.neutral;
  const accentBar = TONE_ACCENT_BAR[tone] || TONE_ACCENT_BAR.neutral;

  return (
    <div className={cn('flex flex-col h-full w-full overflow-hidden', className)}>
      {/* ── Header Bar ── */}
      {showHeader && (
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 shrink-0',
          headerStyle
        )}>
          <div className={cn(
            'flex items-center justify-center w-5 h-5 rounded-md shrink-0',
            tone === 'neutral' || tone === 'paper' || tone === 'info'
              ? 'bg-slate-200/60'
              : 'bg-white/15'
          )}>
            <IconComponent size={13} className="opacity-90" />
          </div>
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <span
              className="uppercase tracking-[0.15em] truncate font-black leading-none"
              style={{ fontSize: compact ? 8 : 10 }}
            >
              {title || moduleType}
            </span>
            {subtitle && (
              <span className="text-[7px] font-bold uppercase tracking-wider opacity-60 truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className={cn('flex-1 min-h-0 overflow-hidden', bodyStyle)}>
        {children}
      </div>

      {/* ── Bottom accent bar ── */}
      <div className={cn('h-[3px] w-full shrink-0', accentBar)} />
    </div>
  );
}

export { MODULE_ICONS, MODULE_COLORS };
