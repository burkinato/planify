'use client';

import { useState, useRef, useId } from 'react';

interface TooltipProps {
  children: React.ReactElement;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

/**
 * Minimal CSS-only tooltip. Radix yok — küçük bağımlılık tasarrufu.
 * Trigger child'ın aria-describedby'ı ile bağlanır → screen reader uyumlu.
 */
export function Tooltip({ children, content, side = 'top', delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();
  const timerRef = useRef<number | null>(null);

  const show = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setVisible(false);
  };

  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 dark:bg-surface-100 dark:text-surface-950 rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in duration-100 ${positionClass}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
