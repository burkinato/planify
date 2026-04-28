'use client';

import { ArrowLeft, BadgeCheck, ClipboardList, Flame, MapPinned, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { mergeTemplateState } from '@/lib/editor/templateLayouts';
import type { TemplateLayout, TemplateRegion, TemplateState } from '@/types/editor';

interface TemplatePaperRendererProps {
  layout: TemplateLayout;
  templateState: TemplateState;
  focusedRegionId: string | null;
  onFocusRegion: (id: string | null) => void;
  onUpdateRegion: (id: string, updates: { title?: string; body?: string; meta?: string }) => void;
  drawingHostRef: React.RefObject<HTMLDivElement | null>;
  exportRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

const toneStyles: Record<string, string> = {
  green: 'border-emerald-500/60 bg-emerald-50/85',
  red: 'border-red-500/60 bg-red-50/85',
  blue: 'border-blue-500/60 bg-blue-50/85',
  info: 'border-slate-300 bg-slate-50/95',
  neutral: 'border-slate-300 bg-white/95',
  paper: 'border-teal-500 bg-white',
};

function RegionIcon({ region }: { region: TemplateRegion }) {
  if (region.type === 'header') return <ShieldCheck className="h-4 w-4" />;
  if (region.id.toLowerCase().includes('fire')) return <Flame className="h-4 w-4" />;
  if (region.type === 'assembly') return <MapPinned className="h-4 w-4" />;
  if (region.type === 'approval') return <BadgeCheck className="h-4 w-4" />;
  return <ClipboardList className="h-4 w-4" />;
}

function ReadOnlyRegion({ region, title, body, meta }: { region: TemplateRegion; title?: string; body?: string; meta?: string }) {
  if (region.type === 'legend') {
    return (
      <div className="h-full overflow-hidden p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700">
          <RegionIcon region={region} />
          {title || region.label}
        </div>
        <div className="grid grid-cols-1 gap-1 text-[9px] font-bold text-slate-600">
          {['Acil Cikis', 'Tahliye Yolu', 'Yangin Tupu', 'Yangin Alarmi', 'Toplanma Alani', 'Buradasiniz'].map((item, index) => (
            <div key={item} className="flex items-center gap-2">
              <span className={cn('h-3 w-3 rounded-sm', index < 2 ? 'bg-emerald-600' : index < 4 ? 'bg-red-600' : 'bg-blue-700')} />
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (region.type === 'header') {
    const { projectMetadata } = useEditorStore();
    return (
      <div className="flex h-full items-center justify-between px-6 gap-4 overflow-hidden">
        {/* Logo Section */}
        <div className="flex-shrink-0 w-[clamp(40px,6vw,80px)] aspect-square bg-white/10 rounded-xl border border-white/10 flex items-center justify-center p-1.5 backdrop-blur-sm shadow-inner group-hover:bg-white/20 transition-colors">
           {projectMetadata.logoUrl ? (
             <img src={projectMetadata.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain filter brightness-0 invert" />
           ) : (
             <ImageIcon className="w-1/2 h-1/2 text-white/40" />
           )}
        </div>

        {/* Title Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-[clamp(14px,2.2vw,34px)] font-black uppercase leading-tight tracking-tight text-white drop-shadow-md">
            {title || region.label}
          </div>
          <div className="mt-1 text-[clamp(8px,0.85vw,15px)] font-bold text-white/75 uppercase tracking-[0.1em]">
            {body}
          </div>
        </div>

        {/* Meta Section */}
        <div className="flex-shrink-0 text-right min-w-[clamp(80px,10vw,150px)] hidden sm:block border-l border-white/10 pl-4 h-1/2 flex flex-col justify-center">
          <div className="text-[clamp(8px,0.7vw,11px)] font-black uppercase tracking-[0.15em] text-white/90 whitespace-pre-line leading-relaxed">
            {meta || 'KAT: ZEMİN KAT\nREV: 00'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-800">
        <RegionIcon region={region} />
        {title || region.label}
      </div>
      <p className="whitespace-pre-line text-[10px] font-semibold leading-relaxed text-slate-700">{body}</p>
      {meta && <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">{meta}</p>}
    </div>
  );
}

function RegionEditor({
  region,
  title,
  body,
  meta,
  onUpdate,
}: {
  region: TemplateRegion;
  title?: string;
  body?: string;
  meta?: string;
  onUpdate: (updates: { title?: string; body?: string; meta?: string }) => void;
}) {
  if (region.type === 'header') {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center space-y-2 animate-pulse">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Başlık Düzenleme Modu</div>
          <div className="text-[9px] font-bold text-white/20 uppercase">İçeriği sağ panelden değiştirebilirsiniz</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] gap-2 p-3">
      <input
        value={title || ''}
        onChange={(event) => onUpdate({ title: event.target.value })}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-900 outline-none focus:border-cyan-500"
        placeholder={region.label}
      />
      <textarea
        value={body || ''}
        onChange={(event) => onUpdate({ body: event.target.value })}
        className="min-h-0 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold leading-relaxed text-slate-700 outline-none focus:border-cyan-500"
        placeholder="Bolge icerigi"
      />
      <input
        value={meta || ''}
        onChange={(event) => onUpdate({ meta: event.target.value })}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 outline-none focus:border-cyan-500"
        placeholder="Meta / revizyon / kat bilgisi"
      />
    </div>
  );
}

export function TemplatePaperRenderer({
  layout,
  templateState,
  focusedRegionId,
  onFocusRegion,
  onUpdateRegion,
  drawingHostRef,
  exportRef,
  children,
}: TemplatePaperRendererProps) {
  const page = layout.layout_json.page;
  const state = mergeTemplateState(templateState);
  const regions = layout.layout_json.regions || [];
  const accent = layout.layout_json.accent || '#00965e';

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto p-3 md:p-6">
      <div
        ref={exportRef}
        data-template-paper="true"
        className="relative bg-white text-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.24)] ring-1 ring-slate-300/80 transition-all duration-300"
        style={{
          width: 'min(100%, 1280px)',
          aspectRatio: `${page.width} / ${page.height}`,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,.035)_1px,transparent_1px),linear-gradient(rgba(15,23,42,.035)_1px,transparent_1px)] bg-[length:24px_24px]" />
        {focusedRegionId && (
          <button
            onClick={() => onFocusRegion(null)}
            className="absolute left-4 top-4 z-40 flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-xl transition-transform hover:scale-[1.02]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Geri Gel
          </button>
        )}

        {regions.map((region) => {
          const focused = focusedRegionId === region.id;
          const dimmed = !!focusedRegionId && !focused;
          const content = state[region.id] || {};
          const isHeader = region.type === 'header';
          const isDrawing = region.type === 'drawing';

          return (
            <section
              key={region.id}
              ref={isDrawing ? drawingHostRef : undefined}
              onClick={(event) => {
                if (!focused) {
                  event.stopPropagation();
                  onFocusRegion(region.id);
                }
              }}
              className={cn(
                'absolute overflow-hidden rounded-[8px] border transition-all duration-300',
                toneStyles[region.tone || 'neutral'],
                isHeader && 'border-none',
                focused && 'z-30 scale-[1.015] shadow-[0_18px_45px_rgba(8,145,178,0.24)] ring-2 ring-cyan-500',
                dimmed && 'pointer-events-none opacity-25 grayscale',
                !focused && 'cursor-pointer hover:shadow-lg'
              )}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.w}%`,
                height: `${region.h}%`,
                background: isHeader ? accent : undefined,
              }}
            >
              {isDrawing ? (
                <div className="h-full w-full bg-white">
                  {children}
                  {!focused && (
                    <div className="pointer-events-none absolute inset-0 flex items-start justify-start p-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {region.label}
                    </div>
                  )}
                </div>
              ) : focused ? (
                <RegionEditor
                  region={region}
                  title={content.title}
                  body={content.body}
                  meta={content.meta}
                  onUpdate={(updates) => onUpdateRegion(region.id, updates)}
                />
              ) : (
                <ReadOnlyRegion region={region} title={content.title} body={content.body} meta={content.meta} />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
