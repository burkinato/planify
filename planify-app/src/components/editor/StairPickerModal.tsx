'use client';

import React from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export type StairType = 'straight' | 'l-shape' | 'spiral' | 'core';

interface StairOption {
  id: StairType;
  name: string;
  desc: string;
  preview: React.ReactNode;
}

const StraightPreview = () => (
  <svg viewBox="0 0 80 100" className="w-full h-full" fill="none">
    <rect x="8" y="6" width="64" height="88" rx="2" stroke="#1e293b" strokeWidth="1.5"/>
    {Array.from({length: 10}).map((_, i) => (
      <line key={i} x1="8" y1={16 + i * 7.5} x2="72" y2={16 + i * 7.5} stroke="#475569" strokeWidth="0.8"/>
    ))}
    <line x1="40" y1="88" x2="40" y2="18" stroke="#1e293b" strokeWidth="1.2"/>
    <polygon points="40,10 36,20 44,20" fill="#1e293b"/>
    <text x="40" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">DÜZ</text>
  </svg>
);

const LShapePreview = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
    <rect x="5" y="5" width="90" height="90" rx="2" stroke="#cbd5e1" strokeWidth="1"/>
    {Array.from({length: 6}).map((_, i) => (
      <line key={i} x1="12" y1={48 + i * 7} x2="38" y2={48 + i * 7} stroke="#475569" strokeWidth="0.8"/>
    ))}
    <line x1="25" y1="88" x2="25" y2="48" stroke="#1e293b" strokeWidth="1"/>
    <rect x="12" y="28" width="40" height="22" rx="1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8"/>
    {Array.from({length: 5}).map((_, i) => (
      <line key={i} x1={56 + i * 7} y1="14" x2={56 + i * 7} y2="50" stroke="#475569" strokeWidth="0.8"/>
    ))}
    <line x1="52" y1="32" x2="88" y2="32" stroke="#1e293b" strokeWidth="1"/>
    <polygon points="88,28 88,36 95,32" fill="#1e293b"/>
    <text x="50" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">L</text>
  </svg>
);

const SpiralPreview = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
    <circle cx="50" cy="50" r="44" stroke="#1e293b" strokeWidth="1.5"/>
    <circle cx="50" cy="50" r="10" stroke="#1e293b" strokeWidth="1.2"/>
    <circle cx="50" cy="50" r="2" fill="#1e293b"/>
    {Array.from({length: 14}).map((_, i) => {
      const angle = (i / 14) * Math.PI * 2 - Math.PI / 2;
      return (
        <line key={i}
          x1={50 + Math.cos(angle) * 10}
          y1={50 + Math.sin(angle) * 10}
          x2={50 + Math.cos(angle) * 44}
          y2={50 + Math.sin(angle) * 44}
          stroke="#475569" strokeWidth="0.7"
        />
      );
    })}
    <path d="M 62,38 Q 75,30 70,50" stroke="#1e293b" strokeWidth="1.2" fill="none" markerEnd="url(#arr)"/>
    <defs>
      <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#1e293b"/>
      </marker>
    </defs>
    <text x="50" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">SPİRAL</text>
  </svg>
);

const CorePreview = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
    <rect x="5" y="5" width="90" height="90" rx="2" stroke="#1e293b" strokeWidth="1.5"/>
    {Array.from({length: 6}).map((_, i) => (
      <g key={i}>
        <line x1="18" y1={30 + i * 8} x2="28" y2={30 + i * 8} stroke="#475569" strokeWidth="0.8"/>
        <line x1="18" y1={30 + i * 8} x2="15" y2={34 + i * 8} stroke="#475569" strokeWidth="0.8"/>
      </g>
    ))}
    <line x1="22" y1="82" x2="22" y2="22" stroke="#1e293b" strokeWidth="1.2"/>
    <polygon points="22,16 18,26 26,26" fill="#1e293b"/>
    {Array.from({length: 6}).map((_, i) => (
      <g key={i}>
        <line x1="72" y1={22 + i * 8} x2="82" y2={22 + i * 8} stroke="#475569" strokeWidth="0.8"/>
        <line x1="82" y1={22 + i * 8} x2="85" y2={26 + i * 8} stroke="#475569" strokeWidth="0.8"/>
      </g>
    ))}
    <line x1="78" y1="22" x2="78" y2="82" stroke="#1e293b" strokeWidth="1.2"/>
    <polygon points="78,88 74,78 82,78" fill="#1e293b"/>
    <rect x="34" y="30" width="32" height="40" rx="1" fill="transparent" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,2"/>
    <text x="50" y="54" textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="600">BOŞLUK</text>
    <text x="50" y="99" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">CORE</text>
  </svg>
);

const STAIR_OPTIONS: StairOption[] = [
  {
    id: 'straight',
    name: 'Düz Merdiven',
    desc: 'Tek kollu merdiven bloğunu tek tuşla sahneye ekle.',
    preview: <StraightPreview />
  },
  {
    id: 'l-shape',
    name: 'Dönen Merdiven',
    desc: 'Sahanlıklı dönen merdiven bloğu ekle.',
    preview: <LShapePreview />
  },
  {
    id: 'spiral',
    name: 'Yuvarlak Merdiven',
    desc: 'Dairesel / spiral merdiven bloğunu tek tuşla ekle.',
    preview: <SpiralPreview />
  },
  {
    id: 'core',
    name: 'Apartman Boşluğu',
    desc: 'Çift kollu apartman boşluğu / çekirdek merdiven ekle.',
    preview: <CorePreview />
  },
];

interface StairPickerModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onSelect: (type: StairType) => void;
  onClose: () => void;
}

export function StairPickerModal({ isOpen, position, onSelect, onClose }: StairPickerModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop for click-outside-to-close */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose}
      />
      <div
        className="fixed z-[9999] animate-fade-in"
        style={{
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.min(position.y - 20, window.innerHeight - 450),
        }}
        onClick={(e) => e.stopPropagation()}
      >
      <div className="w-72 bg-white border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <div className="text-[9px] font-black text-accent-emerald uppercase tracking-widest mb-0.5">YAPI</div>
            <h3 className="text-sm font-black text-slate-800">Hazır Merdivenler</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-1">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 pb-1">HAZIR ŞABLONLAR</div>
          {STAIR_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onSelect(opt.id); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100/60 transition-all group text-left"
            >
              <div className="w-10 h-10 shrink-0 bg-white border-slate-200 rounded-lg border border-slate-200 p-1 group-hover:border-accent-emerald/40 transition-colors">
                {opt.preview}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-accent-emerald transition-colors">{opt.name}</div>
                <div className="text-[10px] text-slate-500 leading-snug mt-0.5">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
    </>,
    document.body
  );
}

