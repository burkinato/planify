'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Planify Logo Component
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
    default: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white shadow-blue-500/20",
    white: "bg-white text-blue-600 shadow-xl shadow-black/5",
    dark: "bg-slate-900 text-cyan-400 shadow-xl",
    monochrome: "bg-slate-200 text-slate-800 shadow-none",
  };

  const textBaseClasses = cn(
    "font-black tracking-tighter select-none flex items-center",
    sizeMap[size].text
  );

  const textVariants = {
    default: "text-slate-900",
    white: "text-white",
    dark: "text-slate-900",
    monochrome: "text-slate-800",
  };

  const suffixVariants = {
    default: "bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent",
    white: "text-white opacity-90",
    dark: "text-cyan-500",
    monochrome: "opacity-60",
  };

  return (
    <div className={cn("flex items-center group", sizeMap[size].container, className)}>
      <div className={cn(iconBaseClasses, iconVariants[variant])}>
        <LayoutGrid className="w-[60%] h-[60%]" strokeWidth={2.5} />
      </div>
      
      {showText && (
        <span className={cn(textBaseClasses, textVariants[variant])}>
          Plan
          <span className={suffixVariants[variant]}>
            ify
          </span>
        </span>
      )}
    </div>
  );
}
