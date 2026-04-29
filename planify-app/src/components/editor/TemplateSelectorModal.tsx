import React, { useEffect, useMemo, useState } from 'react';
import {
  Check, Database, LayoutTemplate, Monitor, Smartphone, Sparkles, X,
  Lock, ShieldCheck, Building2, Wrench, Palette, Filter,
  ArrowRight, AlertCircle, MapPin
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { FALLBACK_TEMPLATE_LAYOUTS } from '@/lib/editor/templateLayouts';
import type { PagePreset, TemplateLayout, TemplateRegion } from '@/types/editor';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (layout: TemplateLayout | null, preset: PagePreset) => void;
  initialLayout?: TemplateLayout | null;
  initialPreset?: PagePreset;
}

// ── Türkçe etiketler ve İkonlar ──────────────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  TUMU: { label: 'Tüm Şablonlar', Icon: LayoutTemplate, color: 'text-blue-500' },
  STANDART: { label: 'Standart ISO', Icon: ShieldCheck, color: 'text-emerald-500' },
  TEKNİK: { label: 'Teknik CAD', Icon: Wrench, color: 'text-slate-600' },
  KURUMSAL: { label: 'Kurumsal', Icon: Building2, color: 'text-slate-700' },
  MİNİMAL: { label: 'Minimalist', Icon: Palette, color: 'text-emerald-500' },
  ENDÜSTRİ: { label: 'Endüstriyel', Icon: Wrench, color: 'text-amber-600' },
  SAHA: { label: 'Saha / Şantiye', Icon: MapPin, color: 'text-emerald-600' },
  KAMU: { label: 'Kamu / Devlet', Icon: Building2, color: 'text-slate-800' },
  GENEL: { label: 'Genel Amaçlı', Icon: LayoutTemplate, color: 'text-slate-500' },
  PREMIUM: { label: 'Premium ISO', Icon: Sparkles, color: 'text-emerald-600' },
};

const PRESETS: { id: PagePreset; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: 'Landscape', label: 'Yatay', sub: 'Geniş format', Icon: Monitor },
  { id: 'Portrait', label: 'Dikey', sub: 'Uzun format', Icon: Smartphone },
];

function TemplateThumbnail({ layout }: { layout: TemplateLayout }) {
  const regions = layout.layout_json.regions || [];

  const toneStyle = (region: TemplateRegion): React.CSSProperties => {
    // Premium color mapping matching TemplatePaperRenderer toneStyles
    const map: Record<string, { bg: string; border: string }> = {
      green: { bg: '#059669', border: '#047857' }, // emerald-600
      red: { bg: '#e11d48', border: '#be123c' }, // rose-600
      blue: { bg: '#2563eb', border: '#1d4ed8' }, // blue-600
      info: { bg: '#f8fafc', border: '#cbd5e1' }, // slate-50/300
      neutral: { bg: '#ffffff', border: '#e2e8f0' },
      paper: { bg: '#ffffff', border: '#cbd5e1' },
    };

    const style = map[region.tone ?? 'neutral'] ?? map.neutral;

    if (region.type === 'header' || region.type === 'emergency' || region.type === 'instruction' || region.type === 'assembly' || region.type === 'drawing') {
      if (region.type === 'drawing') return { background: '#ffffff', border: '1px dashed #0ea5e9', borderRadius: '2px' };
      return {
        background: style.bg,
        borderColor: style.border,
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      };
    }

    return {
      background: style.bg,
      borderColor: style.border,
      borderLeftWidth: region.tone === 'neutral' ? 1 : 4
    };
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white aspect-video md:aspect-square group-hover:scale-105 transition-all duration-500 shadow-inner">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 bg-[#f8fafc] opacity-40" style={{ backgroundImage: 'linear-gradient(#e2e8f0 0.5px, transparent 0.5px), linear-gradient(90deg, #e2e8f0 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />

      {regions.map((region) => (
        <div
          key={region.id}
          className={cn(
            "absolute border overflow-hidden transition-all",
            region.type === 'header' ? "rounded-none" : "rounded-[4px]"
          )}
          style={{
            left: `${region.x}%`,
            top: `${region.y}%`,
            width: `${region.w}%`,
            height: `${region.h}%`,
            ...toneStyle(region),
          }}
        >
          {region.type === 'drawing' ? (
            <div className="w-full h-full bg-white/60 flex items-center justify-center p-2">
              <div className="w-full h-full border border-dashed border-slate-200 rounded flex items-center justify-center">
                <div className="w-1/2 h-[1px] bg-slate-100 rotate-45 absolute" />
                <div className="w-1/2 h-[1px] bg-slate-100 -rotate-45 absolute" />
              </div>
            </div>
          ) : region.type === 'header' ? (
            <div className="w-full h-full flex items-center px-[8%] gap-[10%] relative">
              {/* Mini Logo Box */}
              <div className="h-[50%] aspect-square bg-white/20 rounded-sm border border-white/30" />
              {/* Mini Title Lines */}
              <div className="flex-1 flex flex-col gap-[15%]">
                <div className="h-[15%] w-full bg-white/50 rounded-full" />
                <div className="h-[8%] w-[60%] bg-white/30 rounded-full mx-auto" />
              </div>
              {/* Mini Meta info */}
              <div className="h-[40%] w-[15%] border-l border-white/20 pl-2 hidden sm:flex flex-col justify-center gap-1">
                <div className="h-[4px] w-full bg-white/20 rounded-full" />
                <div className="h-[4px] w-[60%] bg-white/20 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="p-[8%] space-y-[10%] h-full flex flex-col">
              {/* Region Label Line */}
              <div className={cn(
                "h-[12%] w-[60%] rounded-full shrink-0",
                ['green', 'red', 'blue'].includes(region.tone || '') ? "bg-white/40" : "bg-slate-200"
              )} />
              {/* Dummy content lines */}
              <div className="flex-1 space-y-[8%] opacity-20">
                {[80, 65, 75].map((w, i) => (
                  <div key={i} className={cn(
                    "h-[6%] rounded-full",
                    ['green', 'red', 'blue'].includes(region.tone || '') ? "bg-white" : "bg-slate-300"
                  )} style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Ana modal ─────────────────────────────────────────────────────────────────
export function TemplateSelectorModal({
  isOpen,
  onClose,
  onSelect,
  initialLayout,
  initialPreset
}: TemplateSelectorModalProps) {
  const {
    activeTemplateLayout,
    pagePreset,
    setPagePreset,
    setTemplateLayout,
    setProjectTemplate,
  } = useEditorStore();
  const { templateLayouts, fetchTemplateLayouts } = useProjectStore();
  const isPro = true; // Force all users to be treated as Pro for templates

  const [activeCategory, setActiveCategory] = useState('TUMU');
  const [localSelectedLayout, setLocalSelectedLayout] = useState<TemplateLayout | null>(
    initialLayout !== undefined ? initialLayout : activeTemplateLayout
  );
  const [localPagePreset, setLocalPagePreset] = useState<PagePreset>(initialPreset || pagePreset);

  useEffect(() => {
    fetchTemplateLayouts();
  }, [fetchTemplateLayouts]);

  const layouts = useMemo(() => {
    const raw = (templateLayouts && templateLayouts.length > 0) ? templateLayouts : FALLBACK_TEMPLATE_LAYOUTS;
    return raw.map(l => ({
      ...l,
      // Normalize preset for comparison
      normalizedPreset: (l.page_preset || 'Landscape').toLowerCase()
    }));
  }, [templateLayouts]);

  const categories = useMemo(() => {
    const rawCats = Array.from(new Set(layouts.map((l) => l.category))).filter(Boolean);
    const uniqueCats = Array.from(new Set(rawCats.map(c => c.toUpperCase())));
    return ['TUMU', ...uniqueCats.map(uc => rawCats.find(rc => rc.toUpperCase() === uc) || uc)];
  }, [layouts]);

  const cleanName = (name: string) =>
    name.replace(/\s*—\s*(Landscape|Portrait|A3\s*(Landscape|Portrait)?|A4\s*(Landscape|Portrait)?)/gi, '').trim();

  const visibleLayouts = useMemo(() => {
    return layouts.filter((layout) => {
      // Kategori filtresi
      const categoryMatch = activeCategory === 'TUMU' || layout.category?.toUpperCase() === activeCategory.toUpperCase();

      // Sayfa yönü filtresi
      const lp = layout.normalizedPreset;
      const cp = localPagePreset.toLowerCase();
      const presetMatch = lp === cp || lp.includes(cp) || cp.includes(lp);

      return categoryMatch && presetMatch;
    });
  }, [layouts, activeCategory, localPagePreset]);

  if (!isOpen) return null;

  const handleApply = () => {
    // Pro check removed - all users can apply

    if (onSelect) {
      onSelect(localSelectedLayout, localPagePreset);
    } else {
      setPagePreset(localPagePreset);
      if (localSelectedLayout) {
        setTemplateLayout(localSelectedLayout);
        setProjectTemplate(localSelectedLayout.slug);
      } else {
        setTemplateLayout(null);
        setProjectTemplate('blank');
      }
    }
    onClose();
  };

  const isSelectionPro = localSelectedLayout?.is_pro && !isPro;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-slate-950/80 p-0 sm:p-4 backdrop-blur-xl animate-fade-in">
      <div className="flex h-[95vh] sm:h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl border border-white/20 animate-scale-in">

        {/* ── Başlık çubuğu ── */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 px-8 py-5 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-xl shadow-emerald-500/20">
              <LayoutTemplate className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Proje Şablonları</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">ISO 23601 & ISO 7010</span>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest">Profesyonel Tasarımlar</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── İçerik alanı ── */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[240px_1fr_320px]">

          {/* Sol: Filtreler ve Kategoriler */}
          <div className="hidden lg:flex flex-col border-r border-slate-100 p-5 bg-slate-50/50 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 px-2">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Görünüm</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map(({ id, label, sub, Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      const targetPreset = id.toLowerCase();
                      setLocalPagePreset(id);
                      if (localSelectedLayout) {
                        const style = localSelectedLayout.layout_json.style;
                        const next = layouts.find(l =>
                          l.layout_json.style === style &&
                          l.normalizedPreset === targetPreset
                        );
                        if (next) setLocalSelectedLayout(next);
                      }
                    }}
                    className={cn(
                      'group flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                      localPagePreset === id
                        ? 'border-emerald-600 bg-white text-emerald-700 shadow-lg shadow-emerald-500/10'
                        : 'border-transparent bg-white/50 text-slate-500 hover:bg-white hover:border-slate-200'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0 transition-colors', localPagePreset === id ? 'text-emerald-600' : 'text-slate-400')} />
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-tight">{label}</div>
                      <div className="text-[9px] font-bold opacity-60 uppercase">{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 px-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Kategoriler</h3>
              </div>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => {
                  const upperCat = cat.toUpperCase();
                  const meta = CATEGORY_META[upperCat] || CATEGORY_META[cat] || { label: cat, Icon: LayoutTemplate, color: 'text-slate-500' };
                  const Icon = meta.Icon;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all group',
                        activeCategory === cat
                          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 translate-x-1'
                          : 'text-slate-600 hover:bg-white hover:shadow-sm'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn('h-4 w-4', activeCategory === cat ? 'text-white' : meta.color)} />
                        {meta.label}
                      </div>
                      {activeCategory === cat && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pro Plan upgrade card removed */}
          </div>

          {/* Orta: şablon listesi */}
          <div className="min-h-0 overflow-y-auto p-8 bg-slate-50/30 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

              {/* Boş şablon */}
              <button
                onClick={() => setLocalSelectedLayout(null)}
                className={cn(
                  'group flex flex-col rounded-[24px] border-2 p-4 text-left transition-all duration-300',
                  !localSelectedLayout
                    ? 'border-indigo-600 bg-white ring-8 ring-indigo-500/5 shadow-2xl shadow-indigo-500/10'
                    : 'border-white bg-white hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                )}
              >
                <div className="mb-4 aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden transition-colors group-hover:bg-indigo-50/50">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-300 group-hover:text-emerald-400 group-hover:border-emerald-100 transition-all">
                      <Database className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Temiz Sayfa</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">Şablonsuz (Blank)</h4>
                  {!localSelectedLayout && <Check className="h-4 w-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">Sıfırdan tasarıma başlamak için tamamen boş bir çalışma alanı.</p>
              </button>

              {/* Şablonlar */}
              {visibleLayouts.map((layout) => {
                const isSelected = localSelectedLayout?.id === layout.id;
                return (
                  <button
                    key={layout.id}
                    onClick={() => setLocalSelectedLayout(layout)}
                    className={cn(
                      'group flex flex-col rounded-[24px] border-2 p-4 text-left transition-all duration-300',
                      isSelected
                        ? 'border-emerald-600 bg-white ring-8 ring-emerald-500/5 shadow-2xl shadow-emerald-500/10'
                        : 'border-white bg-white hover:border-emerald-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                    )}
                  >
                    <div className="mb-4 aspect-[4/3] relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                      <TemplateThumbnail layout={layout} />

                      {/* Pro Badge */}
                      {/* Pro Badge removed */}

                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-600/5 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="bg-emerald-600 text-white p-2 rounded-full shadow-xl translate-y-0 opacity-100 transition-all scale-110">
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-900 truncate">{cleanName(layout.name)}</h4>
                      {isSelected && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{layout.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sağ: Bilgi ve Önizleme Paneli */}
          <aside className="hidden lg:flex flex-col border-l border-slate-100 bg-white p-6 overflow-y-auto custom-scrollbar">
            <div className="flex-1 space-y-10">
              {/* Önizleme Başlığı */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Şablon Detayı</h3>
                  {/* PREMIUM badge removed */}
                </div>

                <div className="space-y-6">
                  <div className="aspect-video md:aspect-square rounded-[24px] border border-slate-200 bg-slate-50 shadow-inner overflow-hidden p-3 group relative">
                    {localSelectedLayout ? (
                      <>
                        <TemplateThumbnail layout={localSelectedLayout} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-300 gap-4">
                        <AlertCircle className="w-10 h-10 opacity-20" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Seçim Yapılmadı</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                      {localSelectedLayout ? cleanName(localSelectedLayout.name) : 'Şablonsuz (Blank)'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">
                      {localSelectedLayout?.description ?? 'Kağıt anteti ve lejand blokları olmadan, tamamen serbest bir çalışma alanı sağlar. Mevcut çizimleriniz etkilenmez.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teknik Detaylar */}
              {localSelectedLayout && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {localSelectedLayout.compliance_tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black border border-slate-100 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Format', value: 'ISO A3 Standard' },
                      { label: 'Dinamik Blok', value: `${localSelectedLayout.layout_json.regions.length} Bölge` },
                      { label: 'Sayfa Yönü', value: localPagePreset === 'Landscape' ? 'Yatay' : 'Dikey' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</span>
                        <span className="text-xs text-slate-900 font-black">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Subscription required notice removed */}
            </div>

            {/* Aksiyon Butonu */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <button
                onClick={handleApply}
                disabled={isSelectionPro}
                className={cn(
                  "w-full group relative overflow-hidden rounded-[20px] py-5 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl",
                  isSelectionPro
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 shadow-slate-900/10"
                )}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isSelectionPro ? <Lock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                  {isSelectionPro ? 'KİLİTLİ ŞABLON' : 'ŞABLONU UYGULA'}
                </div>
                {!isSelectionPro && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </aside>
        </div>

        {/* Mobile Action Bar */}
        <div className="lg:hidden p-6 border-t border-slate-100 bg-white">
            <button
              onClick={handleApply}
              disabled={isSelectionPro}
              className={cn(
                "w-full group relative overflow-hidden rounded-[20px] py-5 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                isSelectionPro
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isSelectionPro ? <Lock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                {isSelectionPro ? 'KİLİTLİ ŞABLON' : 'ŞABLONU UYGULA'}
              </div>
              {!isSelectionPro && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 active:opacity-100 transition-opacity" />
              )}
            </button>
        </div>
      </div>
    </div>
  );
}
