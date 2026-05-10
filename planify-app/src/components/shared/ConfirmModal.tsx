'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Evet, Sil',
  cancelText = 'Vazgeç',
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
              variant === 'danger' ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
            )}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              {title}
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all border border-slate-200 bg-white"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95",
              variant === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
