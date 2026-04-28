import { ArrowRight, Building2, FileText, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        aria-label="Yeni proje penceresini kapat"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-2xl animate-scale-in bg-white border border-slate-200 shadow-2xl rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-950 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Yeni Denetim Dosyası</p>
              <h3 className="text-lg font-black text-slate-950">Proje kimlik bilgileri</h3>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          className="p-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Proje Başlığı" value={draft.title} onChange={(value) => update('title', value)} required />
            <Input label="Müşteri / Firma" value={draft.clientName} onChange={(value) => update('clientName', value)} icon />
            <Input label="Tesis Adı" value={draft.facilityName} onChange={(value) => update('facilityName', value)} />
            <Input label="Bina / Blok" value={draft.buildingName} onChange={(value) => update('buildingName', value)} />
            <Input label="Kat Bilgisi" value={draft.floorName} onChange={(value) => update('floorName', value)} />
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              Bu bilgiler proje kartlarında ve denetim arşivinde görünecek. Şablon seçimi bir sonraki adımda yapılır.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100">
              Vazgeç
            </button>
            <button type="submit" className="px-5 py-3 bg-slate-950 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800">
              Şablon Seçimine Geç
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  icon?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-11 border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-500"
      />
    </label>
  );
}
