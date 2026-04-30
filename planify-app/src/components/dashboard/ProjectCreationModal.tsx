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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
      {/* Soft Glass Overlay */}
      <button
        aria-label="Kapat"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onCancel}
      />
      
      <div className="relative w-full max-w-3xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 bg-[#fcfdfe]/90 backdrop-blur-2xl shadow-[0_32px_100px_-20px_rgba(0,0,0,0.15)] rounded-[48px] overflow-hidden border border-white p-2">
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
          {/* Header Area */}
          <div className="px-10 py-10 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center shadow-2xl shadow-slate-900/20">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Yeni Denetim Dosyası</span>
                  <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-black rounded-full uppercase">Adım 1/2</div>
                </div>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight">Proje Kimlik Kartı</h3>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form
            className="p-10 space-y-8"
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
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-start gap-4 group">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200/50 shadow-sm transition-transform group-hover:rotate-6">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide">ISO 23601 Hazırlığı</p>
                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                  Bu bilgiler proje kartlarında ve resmi denetim dökümanlarında kullanılacaktır. Şablon seçimi bir sonraki adımda yapılacaktır.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <button 
                type="button" 
                onClick={onCancel} 
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                İptal Et
              </button>
              <button 
                type="submit" 
                className="px-10 py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-800 shadow-2xl shadow-slate-900/10 active:scale-95 transition-all"
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
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-slate-900 transition-colors">{label}</span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-black text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300 placeholder:font-bold"
      />
    </label>
  );
}
