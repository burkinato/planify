import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Custom Evacuation Icon (Door + Arrow)
 */
function EvacuationIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Door Frame */}
      <path d="M15 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
      {/* Exit Arrow */}
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      {/* Standing Person (Abstract) */}
      <circle cx="19" cy="5" r="1" fill="currentColor" stroke="none" />
      <path d="M19 7v6" strokeWidth="2" />
    </svg>
  );
}

/**
 * KolayTahliye Logo Component
 * Single point of management for branding.
 * Colors: White, Blue (#2563eb), Turquoise (#06b6d4)
 */
export function Logo({ 
  className, 
  showText = true, 
  variant = 'default',
  size = 'md'
}: LogoProps) {
  const sizeMap = {
    xs: { container: 'gap-1.5', icon: 'w-5 h-5', text: 'text-sm' },
    sm: { container: 'gap-2', icon: 'w-6 h-6', text: 'text-base' },
    md: { container: 'gap-2.5', icon: 'w-8 h-8', text: 'text-xl' },
    lg: { container: 'gap-3', icon: 'w-10 h-10', text: 'text-2xl' },
    xl: { container: 'gap-4', icon: 'w-14 h-14', text: 'text-4xl' },
  };

  const iconBaseClasses = cn(
    "flex items-center justify-center rounded-lg md:rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
    sizeMap[size].icon
  );

  const iconVariants = {
    default: "bg-gradient-to-br from-primary-600 via-primary-500 to-amber-400 text-white shadow-primary-500/20",
    white: "bg-white text-primary-600 shadow-xl shadow-black/5",
    dark: "bg-slate-900 text-primary-500 shadow-xl",
    monochrome: "bg-slate-200 text-slate-800 shadow-none",
  };

  const textBaseClasses = cn(
    "font-black tracking-tighter select-none flex items-center",
    sizeMap[size].text
  );

  const textVariants = {
    default: "text-surface-200",
    white: "text-white",
    dark: "text-surface-200",
    monochrome: "text-surface-300",
  };

  const suffixVariants = {
    default: "bg-gradient-to-r from-primary-600 to-amber-500 bg-clip-text text-transparent",
    white: "text-white opacity-90",
    dark: "text-primary-500",
    monochrome: "opacity-60",
  };

  return (
    <div className={cn("flex items-center group", sizeMap[size].container, className)}>
      <div className={cn(iconBaseClasses, iconVariants[variant])}>
        <EvacuationIcon className="w-[60%] h-[60%]" />
      </div>

      {showText && (
        <span className={cn(textBaseClasses, textVariants[variant])}>
          Kolay
          <span className={suffixVariants[variant]}>
            Tahliye
          </span>
        </span>
      )}
    </div>
  );
}
