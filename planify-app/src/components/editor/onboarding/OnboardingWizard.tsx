'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import { 
  Sparkles, MousePointer2, Layout, FileDown, 
  ChevronRight, ChevronLeft, Check, X, ShieldCheck, PlayCircle
} from 'lucide-react';
import { getDemoProject } from '@/lib/editor/demoProject';
import { trackEvent, TRACKING_EVENTS } from '@/lib/analytics/events';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  image?: string;
}

const STEPS: Step[] = [
  {
    title: 'Planify\'a Hoş Geldiniz',
    description: 'Türkiye\'nin ilk dijital tahliye planı editörü ile tanışın. ISO 7010 ve ISO 23601 standartlarına tam uyumlu planları dakikalar içinde hazırlayın.',
    icon: Sparkles,
    color: 'from-indigo-600 to-violet-600',
  },
  {
    title: 'Akıllı Araçlar',
    description: 'Sol paneldeki araçlar ile mimari çiziminizi yapın. Sembol kütüphanesinden sürükleyerek acil durum ekipmanlarını yerleştirin. Her şey otomatik olarak lejanda eklenir.',
    icon: MousePointer2,
    color: 'from-emerald-600 to-teal-600',
  },
  {
    title: 'Profesyonel Çıktı',
    description: 'Çiziminiz bittiğinde tek tıkla yüksek çözünürlüklü PDF veya PNG formatında dışa aktarın. Antet ve lejand bilgileriniz otomatik olarak düzenlenir.',
    icon: FileDown,
    color: 'from-blue-600 to-cyan-600',
  }
];

export function OnboardingWizard() {
  const { onboardingVisible, completeOnboarding, language, loadProject } = useEditorStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Track start once
  React.useEffect(() => {
    if (onboardingVisible) {
      trackEvent(TRACKING_EVENTS.ONBOARDING_START);
    }
  }, [onboardingVisible]);

  if (!onboardingVisible) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const t = {
    tr: {
      next: 'İleri',
      back: 'Geri',
      finish: 'Başla!',
      demo: 'Örnek Proje ile Başla',
      skip: 'Atla',
      steps: STEPS.map(s => ({ title: s.title, desc: s.description }))
    },
    en: {
      next: 'Next',
      back: 'Back',
      finish: 'Get Started!',
      demo: 'Start with Demo',
      skip: 'Skip',
      steps: [
        { title: 'Welcome to Planify', desc: 'Meet Turkey\'s first digital evacuation plan editor. Create ISO 7010 and ISO 23601 compliant plans in minutes.' },
        { title: 'Smart Tools', desc: 'Draw your architecture using tools in the left panel. Drag and drop emergency equipment from the symbol library. Everything is automatically added to the legend.' },
        { title: 'Professional Output', desc: 'When your drawing is done, export it in high-resolution PDF or PNG format with one click. Title block and legend info are auto-formatted.' }
      ]
    }
  };

  const curr = t[language || 'tr'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={completeOnboarding}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex flex-col md:flex-row h-full min-h-[460px]">
          
          {/* Left Side: Visual */}
          <div className={cn(
            "w-full md:w-[40%] bg-gradient-to-br p-8 flex flex-col items-center justify-center text-white transition-all duration-500",
            step.color
          )}>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6 shadow-xl animate-float">
              <step.icon className="w-10 h-10" />
            </div>
            
            <div className="flex gap-1.5 mt-auto">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStep ? "w-8 bg-white" : "w-1.5 bg-white/40"
                  )} 
                />
              ))}
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex-1 p-10 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">ISO Uyumluluk Modülü</span>
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4 animate-slide-up">
                {curr.steps[currentStep].title}
              </h2>
              
              <p className="text-slate-500 font-medium leading-relaxed animate-slide-up delay-100">
                {curr.steps[currentStep].desc}
              </p>
            </div>

            <div className="mt-12 flex items-center justify-between">
              <button 
                onClick={completeOnboarding}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
              >
                {curr.skip}
              </button>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="p-4 rounded-2xl border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {isLastStep && (
                  <button 
                    onClick={() => {
                      const demo = getDemoProject();
                      loadProject(JSON.stringify(demo));
                      completeOnboarding();
                      trackEvent(TRACKING_EVENTS.ONBOARDING_COMPLETE, { method: 'demo' });
                    }}
                    className="px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {curr.demo}
                  </button>
                )}

                <button 
                  onClick={() => {
                    if (isLastStep) {
                      completeOnboarding();
                      trackEvent(TRACKING_EVENTS.ONBOARDING_COMPLETE, { method: 'finish' });
                    } else setCurrentStep(prev => prev + 1);
                  }}
                  className={cn(
                    "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2",
                    isLastStep 
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  )}
                >
                  {isLastStep ? curr.finish : curr.next}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  {isLastStep && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
