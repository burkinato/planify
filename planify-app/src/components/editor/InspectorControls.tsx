'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';

// --- Segmented Control (ToggleGroup) ---
interface SegmentedControlProps<T> {
  value: T;
  options: { value: T; label: string | React.ReactNode; icon?: React.ElementType }[];
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("flex p-1 bg-slate-200/40 backdrop-blur-sm rounded-xl border border-slate-200/60", className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
              isActive 
                ? "bg-white text-slate-900 shadow-sm shadow-slate-200/50 border border-white" 
                : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// --- Numeric Input (Compact) ---
interface NumericInputProps {
  label?: string;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function NumericInput({
  label,
  value,
  unit,
  onChange,
  min,
  max,
  step = 1,
  className,
}: NumericInputProps) {
  return (
    <div className={cn("flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl px-3 py-2 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all duration-300 shadow-sm", className)}>
      {label && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 bg-transparent text-xs font-black text-slate-900 outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {unit && <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{unit}</span>}
    </div>
  );
}

// --- Color Selector (Grid) ---
interface ColorSelectorProps {
  value: string;
  colors: string[];
  onChange: (color: string) => void;
  className?: string;
}

export function ColorSelector({ value, colors, onChange, className }: ColorSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {colors.map((color) => {
        const isActive = value.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "w-8 h-8 rounded-full border-4 transition-all duration-300 hover:scale-110 flex items-center justify-center relative group",
              isActive 
                ? "border-white shadow-xl scale-110 ring-2 ring-slate-900/10" 
                : "border-white shadow-sm ring-1 ring-slate-200/40 hover:ring-slate-300"
            )}
            style={{ backgroundColor: color }}
          >
            {isActive && <Check className={cn("w-3.5 h-3.5 z-10", color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#ffd700' ? "text-slate-900" : "text-white")} />}
            {!isActive && <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors" />}
          </button>
        );
      })}
    </div>
  );
}

// --- Section Header ---
export function InspectorSection({
  title,
  children,
  className,
  collapsible = false,
  isOpen,
  defaultOpen = true,
  onToggle
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isActuallyOpen = collapsible ? (isOpen !== undefined ? isOpen : internalOpen) : true;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "flex items-center gap-3",
          collapsible && "cursor-pointer group"
        )}
        onClick={collapsible ? handleToggle : undefined}
      >
        {collapsible && (
          <ChevronRight className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-300",
            isActuallyOpen && "rotate-90 text-slate-900"
          )} />
        )}
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">{title}</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200/80 to-transparent" />
      </div>
      {isActuallyOpen && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

// --- Property Label ---
export function PropertyLabel({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 ml-1">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      {children}
    </div>
  );
}

// --- Slider Control ---
export function SliderControl({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  unit = "" 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  min?: number; 
  max?: number; 
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40">
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="min-w-[40px] text-right">
        <span className="text-[10px] font-black text-slate-900">{value}{unit}</span>
      </div>
    </div>
  );
}
