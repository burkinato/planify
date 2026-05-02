'use client';

import React, { useMemo, useState } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Compass, Scaling, MapPinned, Users, Calendar, FileText, Navigation, Phone,
  Accessibility, DoorOpen, Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore, useShallow } from '@/store/useEditorStore';

type CheckStatus = 'pass' | 'warn' | 'fail';

interface ComplianceCheck {
  id: string;
  label: string;
  description: string;
  status: CheckStatus;
  icon: React.ElementType;
  standard: string;
  autoFixAction?: string;
}

export function ComplianceChecker() {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    elements,
    activeTemplateLayout,
    projectMetadata,
    templateState,
  } = useEditorStore(useShallow(s => ({
    elements: s.elements,
    activeTemplateLayout: s.activeTemplateLayout,
    projectMetadata: s.projectMetadata,
    templateState: s.templateState,
  })));

  const checks = useMemo<ComplianceCheck[]>(() => {
    const symbolTypes = new Set(
      elements.filter(el => el.type === 'symbol' && el.symbolType).map(el => el.symbolType)
    );
    const hasRoutes = elements.some(el => el.type === 'route' && el.routeType === 'evacuation');
    const hasExitSymbol = symbolTypes.has('E001') || symbolTypes.has('E002') || symbolTypes.has('E003') || symbolTypes.has('N003');
    const hasAssemblySymbol = symbolTypes.has('E007');
    const hasHereSymbol = symbolTypes.has('E004');
    const hasFireExtinguisher = symbolTypes.has('F001') || symbolTypes.has('F010') || symbolTypes.has('F011');
    const hasAlarm = symbolTypes.has('F004');
    const hasFirstAid = symbolTypes.has('E020') || symbolTypes.has('E021') || symbolTypes.has('E022');
    const hasCompass = symbolTypes.has('N001');
    const hasScaleBar = symbolTypes.has('N002');
    const hasTemplate = !!activeTemplateLayout;
    const hasAuthor = !!(projectMetadata.author && projectMetadata.author.trim());
    const hasDate = !!(projectMetadata.date && projectMetadata.date.trim());
    const hasFloor = !!(projectMetadata.floor && projectMetadata.floor.trim());
    const hasName = !!(projectMetadata.name && projectMetadata.name.trim() && projectMetadata.name !== 'PROJE DOSYASI');

    const teamData = templateState?.team;
    const hasTeamInfo = !!(teamData?.body && teamData.body.trim() && !teamData.body.includes('___'));

    const emergencyData = templateState?.emergency;
    const hasEmergencyInfo = !!(emergencyData?.body && emergencyData.body.trim());

    return [
      {
        id: 'evacuation-route',
        label: 'Tahliye Yolları',
        description: hasRoutes ? 'Tahliye güzergahları çizilmiş.' : 'En az bir tahliye yolu çizilmeli.',
        status: hasRoutes ? 'pass' : 'fail',
        icon: Navigation,
        standard: 'ISO 23601 §5.3',
      },
      {
        id: 'exit-sign',
        label: 'Acil Çıkış İşareti',
        description: hasExitSymbol ? 'Acil çıkış sembolü yerleştirilmiş.' : 'En az bir acil çıkış kapısı işaretlenmeli.',
        status: hasExitSymbol ? 'pass' : 'fail',
        icon: DoorOpen,
        standard: 'ISO 7010 E001-E003',
      },
      {
        id: 'you-are-here',
        label: '"Buradasınız" İşareti',
        description: hasHereSymbol ? '"Buradasınız" noktası belirtilmiş.' : 'Plan üzerinde izleyicinin konumu gösterilmeli.',
        status: hasHereSymbol ? 'pass' : 'warn',
        icon: MapPinned,
        standard: 'ISO 23601 §5.4',
      },
      {
        id: 'assembly-point',
        label: 'Toplanma Alanı',
        description: hasAssemblySymbol ? 'Toplanma noktası işaretlenmiş.' : 'Toplanma alanı sembolü eklenmeli (E007).',
        status: hasAssemblySymbol ? 'pass' : 'fail',
        icon: MapPinned,
        standard: 'ISO 7010 E007',
      },
      {
        id: 'fire-extinguisher',
        label: 'Yangın Söndürücü',
        description: hasFireExtinguisher ? 'Yangın söndürme ekipmanı işaretlenmiş.' : 'En az bir yangın söndürücü konumu belirtilmeli.',
        status: hasFireExtinguisher ? 'pass' : 'warn',
        icon: Flame,
        standard: 'ISO 7010 F001',
      },
      {
        id: 'fire-alarm',
        label: 'Yangın Alarm Butonu',
        description: hasAlarm ? 'Yangın alarm butonu işaretlenmiş.' : 'Yangın ikaz butonları plan üzerine eklenmeli.',
        status: hasAlarm ? 'pass' : 'warn',
        icon: Flame,
        standard: 'ISO 7010 F005',
      },
      {
        id: 'first-aid',
        label: 'İlk Yardım Noktası',
        description: hasFirstAid ? 'İlk yardım donanımı işaretlenmiş.' : 'İlk yardım kutusu/dolabı konumu gösterilmeli.',
        status: hasFirstAid ? 'pass' : 'warn',
        icon: ShieldCheck,
        standard: 'TR Yönetmelik Md.12',
      },
      {
        id: 'compass',
        label: 'Kuzey Yönü',
        description: hasCompass ? 'Kuzey oku yerleştirilmiş.' : 'Planın yön oryantasyonu (kuzey oku) eklenmelidir.',
        status: hasCompass ? 'pass' : 'fail',
        icon: Compass,
        standard: 'ISO 23601 §5.2',
      },
      {
        id: 'scale-bar',
        label: 'Ölçek Göstergesi',
        description: hasScaleBar ? 'Ölçek çubuğu yerleştirilmiş.' : 'Ölçek bilgisi plan üzerine eklenmelidir.',
        status: hasScaleBar ? 'pass' : 'warn',
        icon: Scaling,
        standard: 'ISO 23601 §5.6',
      },
      {
        id: 'template',
        label: 'Şablon Kullanımı',
        description: hasTemplate ? 'ISO uyumlu şablon seçilmiş.' : 'Standart uyumlu bir şablon seçilmeli.',
        status: hasTemplate ? 'pass' : 'warn',
        icon: FileText,
        standard: 'ISO 23601',
      },
      {
        id: 'project-name',
        label: 'İşyeri/Proje Adı',
        description: hasName ? 'İşyeri adı girilmiş.' : 'İşyeri unvanı girilmeli.',
        status: hasName ? 'pass' : 'warn',
        icon: FileText,
        standard: 'TR Yönetmelik Md.12',
      },
      {
        id: 'floor-info',
        label: 'Kat / Bölüm Bilgisi',
        description: hasFloor ? 'Kat bilgisi girilmiş.' : 'Planın hangi kat/bölüme ait olduğu belirtilmeli.',
        status: hasFloor ? 'pass' : 'warn',
        icon: FileText,
        standard: 'ISO 23601 §5.1',
      },
      {
        id: 'author',
        label: 'Hazırlayan Bilgisi',
        description: hasAuthor ? 'Hazırlayan bilgisi girilmiş.' : 'Planı hazırlayan kişi adı ve unvanı girilmeli.',
        status: hasAuthor ? 'pass' : 'fail',
        icon: Users,
        standard: 'TR Yönetmelik Md.12',
      },
      {
        id: 'date',
        label: 'Tarih Bilgisi',
        description: hasDate ? 'Tarih bilgisi mevcut.' : 'Hazırlanma tarihi girilmeli.',
        status: hasDate ? 'pass' : 'warn',
        icon: Calendar,
        standard: 'TR Yönetmelik Md.12',
      },
      {
        id: 'emergency-phone',
        label: 'Acil İletişim Bilgileri',
        description: hasEmergencyInfo ? 'Acil durum iletişim bilgileri mevcut.' : '112 acil durum ve yerel iletişim numaraları eklenmeli.',
        status: hasEmergencyInfo ? 'pass' : 'warn',
        icon: Phone,
        standard: 'TR Yönetmelik Md.12',
      },
      {
        id: 'team-info',
        label: 'Acil Durum Ekibi',
        description: hasTeamInfo ? 'Ekip sorumlulukları belirlenmiş.' : 'Tahliye, yangın, ilk yardım sorumluları girilmeli.',
        status: hasTeamInfo ? 'pass' : 'warn',
        icon: Users,
        standard: 'TR Yönetmelik Md.11',
      },
    ];
  }, [elements, activeTemplateLayout, projectMetadata, templateState]);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const warnCount = checks.filter(c => c.status === 'warn').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const totalCount = checks.length;
  const scorePercent = Math.round((passCount / totalCount) * 100);

  const scoreColor = scorePercent >= 80 ? 'text-emerald-400' : scorePercent >= 50 ? 'text-amber-400' : 'text-rose-400';
  const scoreBg = scorePercent >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : scorePercent >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

  return (
    <div className={cn(
      "border border-surface-600 rounded-lg overflow-hidden transition-all duration-300",
      isExpanded ? "bg-surface-900" : "bg-surface-900/50"
    )}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-800/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", scoreBg)}>
            <ShieldCheck className={cn("w-4 h-4", scoreColor)} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-surface-200 uppercase tracking-widest">
                Uyumluluk
              </span>
              <span className={cn("text-[11px] font-black", scoreColor)}>
                %{scorePercent}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] font-bold text-emerald-500">{passCount}✓</span>
              <span className="text-[8px] font-bold text-amber-500">{warnCount}⚠</span>
              <span className="text-[8px] font-bold text-rose-500">{failCount}✗</span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-surface-400 group-hover:text-surface-200 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-surface-400 group-hover:text-surface-200 transition-colors" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-surface-600 px-3 py-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
          {/* Score Bar */}
          <div className="mb-3 px-1">
            <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  scorePercent >= 80 ? "bg-emerald-500" : scorePercent >= 50 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-[8px] font-bold text-surface-500 uppercase tracking-wider mt-1">
              ISO 23601 · ISO 7010 · TR Yönetmelik
            </p>
          </div>

          {/* Fail items first, then warn, then pass */}
          {[...checks].sort((a, b) => {
            const order: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2 };
            return order[a.status] - order[b.status];
          }).map((check) => (
            <div
              key={check.id}
              className={cn(
                "flex items-start gap-2.5 px-2 py-2 rounded-lg transition-all",
                check.status === 'fail' && "bg-rose-500/5 border border-rose-500/10",
                check.status === 'warn' && "bg-amber-500/5 border border-amber-500/10",
                check.status === 'pass' && "opacity-60 hover:opacity-100"
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {check.status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                {check.status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                {check.status === 'fail' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-surface-200 truncate">{check.label}</span>
                  <span className="text-[7px] font-bold text-surface-500 shrink-0">{check.standard}</span>
                </div>
                <p className="text-[9px] text-surface-400 leading-relaxed mt-0.5">{check.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
