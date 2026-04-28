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
  TUMU:      { label: 'Tüm Şablonlar', Icon: LayoutTemplate, color: 'text-blue-500' },
  STANDART:  { label: 'Standart ISO',  Icon: ShieldCheck,    color: 'text-emerald-500' },
  TEKNİK:    { label: 'Teknik CAD',   Icon: Wrench,         color: 'text-slate-600' },
  KURUMSAL:  { label: 'Kurumsal',     Icon: Building2,      color: 'text-indigo-500' },
  MİNİMAL:   { label: 'Minimalist',   Icon: Palette,        color: 'text-rose-500' },
  ENDÜSTRİ:  { label: 'Endüstriyel',  Icon: Wrench,         color: 'text-amber-600' },
  SAHA:      { label: 'Saha / Şantiye', Icon: MapPin,         color: 'text-emerald-600' },
  KAMU:      { label: 'Kamu / Devlet', Icon: Building2,      color: 'text-blue-700' },
  GENEL:     { label: 'Genel Amaçlı', Icon: LayoutTemplate, color: 'text-slate-500' },
  PREMIUM:   { label: 'Premium 3D', Icon: Sparkles, color: 'text-indigo-600' },
};

const PRESETS: { id: PagePreset; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: 'Landscape', label: 'Yatay',  sub: 'Geniş format', Icon: Monitor },
  { id: 'Portrait',  label: 'Dikey',  sub: 'Uzun format',  Icon: Smartphone },
];

// ── Küçük önizleme thumbnail ─────────────────────────────────────────────────
function TemplateThumbnail({ layout }: { layout: TemplateLayout }) {
  const regions = layout.layout_json.regions || [];
  const accent  = layout.layout_json.accent || '#00965e';

  const toneStyle = (region: TemplateRegion): React.CSSProperties => {
    if (region.type === 'header')  return { background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, borderColor: accent, color: 'white' };
    if (region.type === 'drawing') return { background: '#fcfdfd', borderColor: '#0ea5e9', borderWidth: 2, borderStyle: 'dashed' };
    if (region.type === 'emergency') return { background: 'linear-gradient(135deg,#dc2626,#ef4444)', borderColor: '#dc2626', color: 'white', boxShadow: '0 10px 22px rgba(220,38,38,.18)' };

    const map: Record<string, React.CSSProperties> = {
      red:     { background: '#fef2f2', borderColor: '#ef4444', borderLeftWidth: 4 },
      blue:    { background: '#eff6ff', borderColor: '#3b82f6', borderLeftWidth: 4 },
      green:   { background: '#f0fdf4', borderColor: '#22c55e', borderLeftWidth: 4 },
      info:    { background: '#f8fafc', borderColor: '#64748b', borderLeftWidth: 4 },
      neutral: { background: '#ffffff', borderColor: '#e2e8f0', borderLeftWidth: 4 },
    };
    return map[region.tone ?? 'neutral'] ?? map.neutral;
  };

  const labelColor = (region: TemplateRegion): string => {
    if (region.type === 'header') return 'rgba(255,255,255,0.9)';
    if (region.tone === 'red')    return '#ef4444';
    if (region.tone === 'green')  return '#22c55e';
    if (region.tone === 'blue')   return '#3b82f6';
    return '#64748b';
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white aspect-video md:aspect-square group-hover:scale-105 transition-all duration-500 shadow-inner">
      <div className="absolute inset-0 bg-[#f8fafc] opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />
      {regions.map((region) => (
        <div
          key={region.id}
          className={cn(
            "absolute border shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all",
            region.type === 'header' ? "rounded-none" : "rounded-md"
          )}
          style={{
            left:   region.type === 'header' ? `${region.x}%` : `calc(${region.x}% + 2px)`,
            top:    region.type === 'header' ? `${region.y}%` : `calc(${region.y}% + 2px)`,
            width:  region.type === 'header' ? `${region.w}%` : `calc(${region.w}% - 4px)`,
            height: region.type === 'header' ? `${region.h}%` : `calc(${region.h}% - 4px)`,
            ...toneStyle(region),
          }}
        >
          {region.type === 'drawing' ? (
            <div className="w-full h-full relative bg-white flex items-center justify-center p-2 opacity-80">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-300" preserveAspectRatio="xMidYMid meet">
                 <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
                 <path d="M10,40 L40,40 M40,10 L40,40" fill="none" stroke="currentColor" strokeWidth="1" />
                 <path d="M70,90 L70,60 M70,60 L90,60" fill="none" stroke="currentColor" strokeWidth="1" />
                 <path d="M20,80 L50,80 L50,30" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="3 2" />
                 <circle cx="50" cy="30" r="3" fill="#0ea5e9" />
              </svg>
            </div>
          ) : region.type === 'header' ? (
            <div className="w-full h-full flex flex-col justify-center px-[10%] gap-[10%]">
              <div className="h-[20%] w-[70%] rounded-full bg-white/40" />
              <div className="h-[10%] w-[40%] rounded-full bg-white/20" />
            </div>
          ) : (
            <div className="p-[10%] space-y-[12%] h-full flex flex-col">
              <div className="h-[15%] w-[80%] rounded-full shrink-0" style={{ background: labelColor(region) }} />
              <div className="flex-1 space-y-[8%] opacity-30">
                {[85, 70, 75, 50].map((w, i) => (
                  <div key={i} className="h-[6%] rounded-full" style={{ width: `${w}%`, background: labelColor(region) }} />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-500/20">
              <LayoutTemplate className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Proje Şablonları</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">ISO 23601 & ISO 7010</span>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <span className="text-[11px] text-indigo-500 font-bold uppercase tracking-widest">Premium Tasarımlar</span>
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
                        ? 'border-indigo-600 bg-white text-indigo-700 shadow-lg shadow-indigo-500/10'
                        : 'border-transparent bg-white/50 text-slate-500 hover:bg-white hover:border-slate-200'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0 transition-colors', localPagePreset === id ? 'text-indigo-600' : 'text-slate-400')} />
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
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-1'
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
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-100 transition-all">
                      <Database className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Temiz Sayfa</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">Şablonsuz (Blank)</h4>
                  {!localSelectedLayout && <Check className="h-4 w-4 text-indigo-600" />}
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
                        ? 'border-indigo-600 bg-white ring-8 ring-indigo-500/5 shadow-2xl shadow-indigo-500/10'
                        : 'border-white bg-white hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                    )}
                  >
                    <div className="mb-4 aspect-[4/3] relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                      <TemplateThumbnail layout={layout} />

                      {/* Pro Badge */}
                      {/* Pro Badge removed */}

                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/5 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="bg-indigo-600 text-white p-2 rounded-full shadow-xl translate-y-0 opacity-100 transition-all scale-110">
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-900 truncate">{cleanName(layout.name)}</h4>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
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
                  {isSelectionPro ? 'KİLİTLİ ŞABLON' : 'PROJEYİ BAŞLAT'}
                </div>
                {!isSelectionPro && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              {/* Plans button removed */}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
