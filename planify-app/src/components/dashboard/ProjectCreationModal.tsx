'use client';

import { ArrowRight, Building2, FileText, X, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectCreationDraft {
  title: string;
  clientName: string;
  facilityName: string;
  buildingName: string;
  floorName: string;
}

interface ProjectCreationModalProps {
  draft: ProjectCreationDraft;
  onChange: (draft: ProjectCreationDraft) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ProjectCreationModal({ draft, onChange, onCancel, onSubmit }: ProjectCreationModalProps) {
  const update = (field: keyof ProjectCreationDraft, value: string) => {
    onChange({ ...draft, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-12">
      {/* Soft Glass Overlay */}
      <button
        aria-label="Kapat"
        className="fixed inset-0 bg-surface-950/60 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onCancel}
      />
      
      <div className="relative w-full max-w-3xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 bg-surface-950/90 backdrop-blur-2xl shadow-[0_32px_100px_-20px_rgba(0,0,0,0.15)] rounded-t-xl sm:rounded-lg overflow-hidden border border-surface-600 p-1 sm:p-2">
        <div className="bg-surface-900 rounded-t-xl sm:rounded shadow-sm border border-surface-600 overflow-hidden">
          {/* Header Area */}
          <div className="px-6 sm:px-10 py-6 sm:py-10 flex items-center justify-between border-b border-surface-600">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-surface-800 rounded flex items-center justify-center shadow-2xl">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-surface-200" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">Yeni Denetim Dosyası</span>
                  <div className="px-2 py-0.5 bg-primary-500/10 text-primary-500 text-[8px] font-bold rounded-full uppercase">Adım 1/2</div>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-surface-200 tracking-tight">Proje Kimlik Kartı</h3>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className="p-3 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form
            className="p-6 sm:p-10 space-y-6 sm:space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <Input label="Proje Başlığı" value={draft.title} onChange={(value) => update('title', value)} required placeholder="Örn: AVM Tahliye Planı" />
              <Input label="Müşteri / Firma" value={draft.clientName} onChange={(value) => update('clientName', value)} placeholder="Firma adını giriniz" />
              <Input label="Tesis / Yerleşke" value={draft.facilityName} onChange={(value) => update('facilityName', value)} placeholder="Tesis adı" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Bina / Blok" value={draft.buildingName} onChange={(value) => update('buildingName', value)} placeholder="Blok A" />
                <Input label="Kat" value={draft.floorName} onChange={(value) => update('floorName', value)} placeholder="Zemin" />
              </div>
            </div>

            {/* Hint Box - Soft Style */}
            <div className="bg-surface-800 border border-surface-600 rounded p-6 flex items-start gap-4 group">
              <div className="w-10 h-10 bg-surface-900 rounded flex items-center justify-center border border-surface-600 shadow-sm transition-transform group-hover:rotate-6">
                <Sparkles className="w-5 h-5 text-primary-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-surface-200 uppercase tracking-wide">ISO 23601 Hazırlığı</p>
                <p className="text-xs font-medium text-surface-400 leading-relaxed uppercase tracking-tighter">
                  Bu bilgiler proje kartlarında ve resmi denetim dökümanlarında kullanılacaktır. Şablon seçimi bir sonraki adımda yapılacaktır.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 pt-6 border-t border-surface-600">
              <button 
                type="button" 
                onClick={onCancel} 
                className="w-full sm:w-auto px-8 py-3 sm:py-4 text-[10px] font-bold uppercase tracking-widest text-surface-400 hover:text-surface-200 transition-colors"
              >
                İptal Et
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-10 py-4 bg-primary-500 text-white rounded text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-500/20"
              >
                Şablon Seçimine Geç
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2 group block">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 ml-1 group-focus-within:text-surface-200 transition-colors">{label}</span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-14 bg-surface-900 border border-surface-600 rounded px-5 text-sm font-medium text-surface-200 outline-none focus:bg-surface-800 focus:border-primary-500 transition-all placeholder:text-surface-500"
      />
    </label>
  );
}
