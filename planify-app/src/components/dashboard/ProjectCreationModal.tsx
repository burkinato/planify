'use client';

import { ArrowRight, X, ShieldCheck, FolderKanban } from 'lucide-react';

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
        className="fixed inset-0 bg-surface-950/70 backdrop-blur-md animate-in fade-in duration-500 cursor-default"
        onClick={onCancel}
      />
      
      <div className="relative w-full max-w-3xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 dash-glass shadow-[0_32px_100px_-20px_rgba(0,0,0,0.5)] rounded-t-3xl sm:rounded-2xl overflow-hidden border border-surface-600/50">
        <div className="relative bg-surface-950/40">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Header Area */}
          <div className="px-6 sm:px-10 py-6 sm:py-8 flex items-start sm:items-center justify-between border-b border-surface-600/50 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-primary-600/5 border border-primary-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/10 shrink-0">
                <FolderKanban className="w-7 h-7 text-primary-500" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-surface-400">Yeni Tahliye Planı</span>
                  <div className="px-2 py-0.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[8px] font-black rounded-md uppercase tracking-widest shadow-sm">
                    Aşama 1/2
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-surface-100 tracking-tight">Proje Kimlik Kartı</h3>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className="w-10 h-10 flex items-center justify-center text-surface-400 hover:text-surface-100 hover:bg-surface-800/80 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            className="p-6 sm:p-10 space-y-8 relative z-10"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
              <div className="sm:col-span-2">
                <Input label="Proje Dosya Adı" value={draft.title} onChange={(value) => update('title', value)} required placeholder="Örn: AVM Acil Durum Tahliye Planı" />
              </div>
              <Input label="Müşteri / Firma Unvanı" value={draft.clientName} onChange={(value) => update('clientName', value)} placeholder="Firma adını giriniz" />
              <Input label="Tesis / Yerleşke Adı" value={draft.facilityName} onChange={(value) => update('facilityName', value)} placeholder="Örn: Merkez Kampüs" />
              <Input label="Bina / Blok" value={draft.buildingName} onChange={(value) => update('buildingName', value)} placeholder="Örn: A Blok" />
              <Input label="Kat / Bölüm" value={draft.floorName} onChange={(value) => update('floorName', value)} placeholder="Örn: Zemin Kat" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                '1. Proje kimligini girin',
                '2. Hazir sablon secin',
                '3. Editor acilsin ve export alin',
              ].map((step) => (
                <div key={step} className="rounded-2xl border border-surface-600/50 bg-surface-900/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-surface-300">
                  {step}
                </div>
              ))}
            </div>

            {/* Hint Box - Soft Style */}
            <div className="dash-card bg-surface-900/50 p-6 flex items-start gap-4 group">
              <div className="w-12 h-12 bg-surface-950 rounded-xl flex items-center justify-center border border-surface-600/50 shadow-inner shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:border-primary-500/30">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="space-y-1.5 pt-0.5">
                <p className="text-[11px] font-black text-surface-100 uppercase tracking-widest">ISO 23601 Uyumlu Dökümantasyon</p>
                <p className="text-[11px] font-medium text-surface-400 leading-relaxed">
                  Burada girdiginiz veriler PDF bilgi bloklarinda, proje listelerinde ve musterinizle paylasacaginiz ciktilarda <strong className="text-surface-300 font-bold">otomatik olarak</strong> kullanilacaktir.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 pt-8 border-t border-surface-600/50">
              <button 
                type="button" 
                onClick={onCancel} 
                className="w-full sm:w-auto h-12 px-8 text-[11px] font-black uppercase tracking-widest text-surface-400 hover:text-surface-100 transition-colors"
              >
                İşlemi İptal Et
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto h-12 px-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/20 group"
              >
                Şablon Seçimine İlerle
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-surface-500 ml-1 group-focus-within:text-primary-500 transition-colors block">
        {label} {required && <span className="text-amber-500">*</span>}
      </span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-12 bg-surface-950 border border-surface-600/80 rounded-xl px-4 text-sm font-medium text-surface-100 outline-none focus:bg-surface-900 focus:border-primary-500/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.08)] transition-all duration-300 placeholder:text-surface-600 shadow-sm"
      />
    </label>
  );
}
