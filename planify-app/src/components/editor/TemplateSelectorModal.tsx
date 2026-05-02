import React, { useEffect, useMemo, useState } from 'react';
import {
  Check, Database, LayoutTemplate, Monitor, Smartphone, Sparkles, X,
  Lock, ShieldCheck, Building2, Wrench, Palette, Filter,
  ArrowRight, AlertCircle, MapPin, ChevronRight, Info
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { FALLBACK_TEMPLATE_LAYOUTS, normalizePagePreset, normalizeTemplateLayout } from '@/lib/editor/templateLayouts';
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
  TUMU: { label: 'Tüm Koleksiyon', Icon: LayoutTemplate, color: 'text-primary-400' },
  STANDART: { label: 'ISO Standartları', Icon: ShieldCheck, color: 'text-emerald-400' },
  TEKNİK: { label: 'Teknik / CAD', Icon: Wrench, color: 'text-blue-400' },
  KURUMSAL: { label: 'Kurumsal Kimlik', Icon: Building2, color: 'text-indigo-400' },
  MİNİMAL: { label: 'Minimal Tasarım', Icon: Palette, color: 'text-rose-400' },
  ENDÜSTRİ: { label: 'Endüstriyel Üretim', Icon: Wrench, color: 'text-amber-400' },
  SAHA: { label: 'Saha Operasyonları', Icon: MapPin, color: 'text-orange-400' },
  KAMU: { label: 'Kamu / Mevzuat', Icon: Building2, color: 'text-slate-400' },
  GENEL: { label: 'Genel Kullanım', Icon: LayoutTemplate, color: 'text-surface-400' },
  PREMIUM: { label: 'Premium Paket', Icon: Sparkles, color: 'text-primary-500' },
};

const PRESETS: { id: PagePreset; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: 'Landscape', label: 'Yatay Görünüm', sub: 'Landscape', Icon: Monitor },
  { id: 'Portrait', label: 'Dikey Görünüm', sub: 'Portrait', Icon: Smartphone },
];

function TemplateThumbnail({ layout, isLarge = false }: { layout: TemplateLayout; isLarge?: boolean }) {
  const regions = layout.layout_json.regions || [];

  const toneStyle = (region: TemplateRegion): React.CSSProperties => {
    const map: Record<string, { bg: string; border: string }> = {
      green: { bg: '#10b981', border: '#059669' }, 
      red: { bg: '#ef4444', border: '#dc2626' }, 
      blue: { bg: '#3b82f6', border: '#2563eb' }, 
      info: { bg: '#252526', border: '#3c3c3c' }, 
      neutral: { bg: '#1e1e1e', border: '#333333' },
      paper: { bg: '#1e1e1e', border: '#333333' },
    };

    const style = map[region.tone ?? 'neutral'] ?? map.neutral;

    if (region.type === 'drawing') return { 
        background: 'transparent', 
        border: '1px dashed #404040', 
        borderRadius: isLarge ? '4px' : '2px' 
    };

    return {
      background: style.bg,
      borderColor: style.border,
      borderWidth: '1px',
    };
  };

  return (
    <div className={cn(
        "relative overflow-hidden rounded border border-surface-600 bg-surface-950 transition-all duration-700",
        isLarge ? "w-full h-full p-4" : "aspect-video"
    )}>
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: isLarge ? '20px 20px' : '10px 10px' }} />

      <div className="relative w-full h-full">
        {regions.map((region) => (
            <div
            key={region.id}
            className={cn(
                "absolute border transition-all flex items-center justify-center",
                region.type === 'header' ? "rounded-none" : "rounded-sm"
            )}
            style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.w}%`,
                height: `${region.h}%`,
                ...toneStyle(region),
            }}
            >
            {region.type === 'drawing' && (
                <div className="opacity-20 flex items-center justify-center w-full h-full">
                    <LayoutTemplate className={isLarge ? "w-12 h-12" : "w-4 h-4"} />
                </div>
            )}
            </div>
        ))}
      </div>
    </div>
  );
}

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
  const isPro = true;

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
      ...normalizeTemplateLayout(l),
      normalizedPreset: normalizePagePreset(l.page_preset).toLowerCase()
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
      const categoryMatch = activeCategory === 'TUMU' || layout.category?.toUpperCase() === activeCategory.toUpperCase();
      const lp = layout.normalizedPreset;
      const cp = localPagePreset.toLowerCase();
      const presetMatch = lp === cp || lp.includes(cp) || cp.includes(lp);
      return categoryMatch && presetMatch;
    });
  }, [layouts, activeCategory, localPagePreset]);

  if (!isOpen) return null;

  const handleApply = () => {
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-surface-950/80 backdrop-blur-xl animate-fade-in p-4">
      
      {/* ── Main Container ── */}
      <div className="relative w-full max-w-7xl h-[85vh] bg-surface-950 rounded-xl border border-surface-600 shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-scale-in">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 h-20 border-b border-surface-600 bg-surface-900/50">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <LayoutTemplate className="w-5 h-5 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-medium text-surface-100 tracking-tight">Şablon Galerisi</h2>
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em] mt-0.5">Profesyonel Denetim Standartları</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-surface-950 border border-surface-600 rounded p-1">
                {PRESETS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setLocalPagePreset(p.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                            localPagePreset === p.id 
                            ? "bg-surface-800 text-primary-500 shadow-sm" 
                            : "text-surface-500 hover:text-surface-300"
                        )}
                    >
                        <p.Icon className="w-3.5 h-3.5" />
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="w-[1px] h-6 bg-surface-600 mx-2" />

            <button 
              onClick={onClose}
              className="p-2 text-surface-400 hover:text-surface-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 flex min-h-0">
          
          {/* Left Sidebar: Categories */}
          <div className="w-64 border-r border-surface-600 bg-surface-900/30 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <div>
                <h3 className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em] mb-4 ml-2">Kategoriler</h3>
                <div className="space-y-1">
                    {categories.map((cat) => {
                        const meta = CATEGORY_META[cat.toUpperCase()] || { label: cat, Icon: LayoutTemplate, color: 'text-surface-500' };
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all group",
                                    isActive 
                                    ? "bg-surface-800 text-surface-100 shadow-sm border border-surface-600" 
                                    : "text-surface-400 hover:bg-surface-800/50 hover:text-surface-200"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <meta.Icon className={cn("w-4 h-4 transition-colors", isActive ? meta.color : "text-surface-600 group-hover:text-surface-400")} />
                                    {meta.label}
                                </div>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-500" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 bg-surface-950/50 border border-surface-600 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-primary-500" />
                    <span className="text-[10px] font-bold text-surface-200 uppercase tracking-widest">Bilgi</span>
                </div>
                <p className="text-[10px] leading-relaxed text-surface-500 font-medium">
                    Tüm şablonlar ISO 23601 ve ISO 7010 standartlarına %100 uyumlu olarak tasarlanmıştır.
                </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex-1 bg-surface-950 overflow-y-auto custom-scrollbar p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                
                {/* Blank Template */}
                <button
                    onClick={() => setLocalSelectedLayout(null)}
                    className={cn(
                        "group relative aspect-[4/3] rounded-xl border p-2 transition-all duration-500 flex flex-col",
                        !localSelectedLayout 
                        ? "border-primary-500 bg-surface-900 shadow-[0_0_40px_rgba(0,122,204,0.1)]" 
                        : "border-surface-600 bg-surface-900/50 hover:border-surface-400 hover:bg-surface-900"
                    )}
                >
                    <div className="flex-1 rounded-lg bg-surface-950 border border-surface-700 flex flex-col items-center justify-center gap-4 group-hover:border-primary-500/30 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-surface-900 border border-surface-600 flex items-center justify-center text-surface-500 group-hover:text-primary-500 transition-colors shadow-inner">
                            <Database className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em]">Boş Tuval</span>
                    </div>
                    <div className="h-14 flex items-center justify-between px-3">
                        <div>
                            <p className="text-xs font-bold text-surface-100">Blank Project</p>
                            <p className="text-[9px] font-bold text-surface-500 uppercase">Sıfırdan Tasarım</p>
                        </div>
                        {!localSelectedLayout && <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                    </div>
                </button>

                {/* Real Templates */}
                {visibleLayouts.map((layout) => {
                    const isSelected = localSelectedLayout?.id === layout.id;
                    return (
                        <button
                            key={layout.id}
                            onClick={() => setLocalSelectedLayout(layout)}
                            className={cn(
                                "group relative aspect-[4/3] rounded-xl border p-2 transition-all duration-500 flex flex-col",
                                isSelected 
                                ? "border-primary-500 bg-surface-900 shadow-[0_0_40px_rgba(0,122,204,0.15)] scale-[1.02]" 
                                : "border-surface-600 bg-surface-900/50 hover:border-surface-400 hover:bg-surface-900 hover:-translate-y-1"
                            )}
                        >
                            <div className="flex-1 rounded-lg overflow-hidden border border-surface-700 bg-surface-950">
                                <TemplateThumbnail layout={layout} />
                            </div>
                            <div className="h-14 flex items-center justify-between px-3">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-surface-100 truncate max-w-[150px]">{cleanName(layout.name)}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] font-bold text-primary-500 uppercase">{layout.category}</p>
                                        <div className="w-1 h-1 rounded-full bg-surface-600" />
                                        <p className="text-[9px] font-bold text-surface-500 uppercase">{layout.layout_json.regions.length} Bölge</p>
                                    </div>
                                </div>
                                {isSelected && <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                            </div>

                            {/* Hover info overlay */}
                            <div className="absolute inset-x-2 top-2 h-1 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    );
                })}
            </div>
          </div>

          {/* Right Panel: Preview & Details */}
          <div className="w-80 border-l border-surface-600 bg-surface-900/50 flex flex-col">
            <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
                
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em]">Önizleme</h3>
                    <div className="aspect-square rounded-xl bg-surface-950 border border-surface-600 p-2 shadow-2xl relative overflow-hidden group">
                        {localSelectedLayout ? (
                            <TemplateThumbnail layout={localSelectedLayout} isLarge />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-surface-700">
                                <Database className="w-12 h-12 opacity-10 mb-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">Boş Tuval</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent opacity-40" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-medium text-surface-100 leading-tight">
                        {localSelectedLayout ? cleanName(localSelectedLayout.name) : 'Şablonsuz Proje'}
                    </h2>
                    <p className="text-xs leading-relaxed text-surface-400 font-medium">
                        {localSelectedLayout?.description ?? 'Sıfırdan tasarıma başlamak için tamamen boş bir çalışma alanı sağlar.'}
                    </p>
                </div>

                {localSelectedLayout && (
                    <div className="space-y-6">
                         <div className="flex flex-wrap gap-2">
                            {localSelectedLayout.compliance_tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 rounded bg-surface-800 text-surface-300 text-[9px] font-bold border border-surface-600">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'Standart', value: 'ISO 23601' },
                                { label: 'Yönlendirme', value: localPagePreset === 'Landscape' ? 'Yatay' : 'Dikey' },
                                { label: 'Bileşenler', value: `${localSelectedLayout.layout_json.regions.length} Dinamik Blok` },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-surface-800">
                                    <span className="text-[10px] font-bold text-surface-500 uppercase">{item.label}</span>
                                    <span className="text-[11px] font-medium text-surface-200">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="p-8 border-t border-surface-600 bg-surface-900">
                <button
                    onClick={handleApply}
                    className="w-full group relative flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-400 text-white py-4 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(0,122,204,0.3)] active:scale-95"
                >
                    Şablonu Seç ve Başla
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    
                    {/* Inner border glow */}
                    <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
