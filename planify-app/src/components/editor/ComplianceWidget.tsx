'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { useShallow } from 'zustand/react/shallow';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ComplianceWidget() {
  const { elements, templateModules } = useEditorStore(useShallow(state => ({
    elements: state.elements,
    templateModules: state.templateModules
  })));
  const [isExpanded, setIsExpanded] = useState(false);

  // Checks
  const hasYouAreHere = elements.some((el) => el.type === 'symbol' && el.symbolType === 'E004');
  const hasEvacuationRoute = elements.some((el) => el.type === 'route' && el.routeType === 'evacuation');
  const hasAssemblyMap = templateModules.some((m) => m.type === 'AssemblyMap');
  const hasLegend = templateModules.some((m) => m.type === 'Legend');

  const checks = [
    {
      id: 'you_are_here',
      label: '"Buradasınız" İşareti',
      passed: hasYouAreHere,
      critical: true,
      desc: 'Tahliye planında E004 işareti zorunludur.',
    },
    {
      id: 'evac_route',
      label: 'Tahliye Rotası',
      passed: hasEvacuationRoute,
      critical: true,
      desc: 'En az bir adet tahliye rotası çizilmelidir.',
    },
    {
      id: 'assembly_map',
      label: 'Toplanma Alanı (Kroki)',
      passed: hasAssemblyMap,
      critical: false,
      desc: 'Planın bütünlüğünde toplanma alanı belirtilmelidir.',
    },
    {
      id: 'legend',
      label: 'Lejant / İşaretler',
      passed: hasLegend,
      critical: true,
      desc: 'Kullanılan sembollerin anlamları listelenmelidir.',
    },
  ];

  const totalCritical = checks.filter(c => c.critical).length;
  const passedCritical = checks.filter(c => c.critical && c.passed).length;
  const isFullyCompliant = passedCritical === totalCritical;

  return (
    <div className="absolute bottom-4 right-4 z-[45] flex flex-col items-end pointer-events-auto">
      {isExpanded && (
        <div className="mb-2 w-64 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="px-3 py-2 border-b border-slate-800/60 flex items-center justify-between bg-slate-950">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
              ISO Uyumluluk Testi
            </h3>
            <span className={cn(
              "text-[9px] font-black px-1.5 py-0.5 rounded",
              isFullyCompliant ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}>
              {passedCritical}/{totalCritical} Zorunlu
            </span>
          </div>
          <div className="p-2 space-y-1">
            {checks.map((check) => (
              <div 
                key={check.id} 
                className={cn(
                  "p-2 rounded-lg border",
                  check.passed 
                    ? "bg-emerald-500/5 border-emerald-500/10" 
                    : check.critical 
                      ? "bg-rose-500/5 border-rose-500/10" 
                      : "bg-amber-500/5 border-amber-500/10"
                )}
              >
                <div className="flex items-start gap-2">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : check.critical ? (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={cn(
                      "text-[11px] font-bold",
                      check.passed ? "text-emerald-200" : check.critical ? "text-rose-200" : "text-amber-200"
                    )}>
                      {check.label}
                      {!check.critical && <span className="ml-1 text-[9px] font-medium text-amber-500/70">(Öneri)</span>}
                    </p>
                    {!check.passed && (
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                        {check.desc}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border shadow-xl transition-all hover:scale-105",
          isFullyCompliant 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/80" 
            : "bg-rose-950/80 border-rose-500/30 text-rose-400 hover:bg-rose-900/80"
        )}
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
          {isFullyCompliant ? 'Standartlara Uygun' : 'Eksikler Var'}
        </span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 ml-1" /> : <ChevronUp className="w-3.5 h-3.5 ml-1" />}
      </button>
    </div>
  );
}
