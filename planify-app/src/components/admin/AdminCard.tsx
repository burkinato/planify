'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerAction?: ReactNode;
}

export function AdminCard({
  children,
  title,
  description,
  className,
  headerAction,
}: AdminCardProps) {
  return (
    <div className={cn(
      "relative bg-surface-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 overflow-hidden",
      "transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 group",
      "rounded-none", // Sharp edges as requested
      className
    )}>
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-emerald/5 opacity-50 pointer-events-none" />
      
      {/* Top Border Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500/0 via-primary-500/30 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      {(title || description || headerAction) && (
        <div className="relative p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className="relative p-6">
        {children}
      </div>
    </div>
  );
}

