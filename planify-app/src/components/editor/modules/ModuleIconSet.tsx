import React from 'react';

/* ────────────────────────────────────────────────────────────────────────
 *  ModuleIconSet — Her modül tipi için özel SVG ikonlar
 *  ISG uzmanlarının modülleri anında tanımasını sağlayan görsel dil.
 * ──────────────────────────────────────────────────────────────────────── */

interface IconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

const defaultProps = { size: 24 };

/** Header — Kalkan + bina silüeti */
export function HeaderIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
      <rect x="9" y="10" width="2" height="2" rx=".5" fill="currentColor" stroke="none" />
      <rect x="13" y="10" width="2" height="2" rx=".5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** EmergencyCall — Telefon + 112 rozeti */
export function EmergencyCallIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
      <circle cx="18" cy="5" r="4" fill="currentColor" stroke="none" />
      <text x="18" y="7" textAnchor="middle" fill="white" fontSize="5" fontWeight="900" fontFamily="Arial">!</text>
    </svg>
  );
}

/** EvacuationInstructions — Koşan insan + çıkış oku */
export function EvacuationIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="4" r="2" fill="currentColor" stroke="none" />
      <path d="M5 8h4l2 4-3 5" />
      <path d="M11 8l3 4v5" />
      <path d="M6 17l-2 3" />
      <path d="M17 6h4" />
      <path d="M19 4l2 2-2 2" />
      <rect x="16" y="2" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 1" />
    </svg>
  );
}

/** FireInstructions — Alev + söndürücü */
export function FireInstructionsIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12c2-3 2-6 0-9-2 3-4 5-4 8a6 6 0 0 0 8.5 5.5" fill="none" />
      <path d="M13.73 15.2A3 3 0 0 1 10 13c0-1.5 1-3 2-4 1 1 2 2.5 2 4a3.07 3.07 0 0 1-.27 1.2" />
      <rect x="17" y="10" width="3" height="10" rx="1" />
      <path d="M18.5 8v2" />
      <path d="M17 10h3" />
    </svg>
  );
}

/** Legend — Sembol listesi grid */
export function LegendIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1" fill="currentColor" opacity=".2" />
      <line x1="11" y1="5.5" x2="21" y2="5.5" />
      <rect x="3" y="10" width="5" height="5" rx="1" fill="currentColor" opacity=".2" />
      <line x1="11" y1="12.5" x2="21" y2="12.5" />
      <rect x="3" y="17" width="5" height="5" rx="1" fill="currentColor" opacity=".2" />
      <line x1="11" y1="19.5" x2="18" y2="19.5" />
    </svg>
  );
}

/** AssemblyMap — Pin + dış alan */
export function AssemblyMapIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      <circle cx="12" cy="9" r="3" fill="currentColor" opacity=".3" />
      <path d="M2 20h4" />
      <path d="M18 20h4" />
      <path d="M8 22h8" />
    </svg>
  );
}

/** ApprovalRevision — Clipboard + imza */
export function ApprovalRevisionIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 2h6v3H9z" fill="currentColor" opacity=".15" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="14" x2="15" y2="14" />
      <path d="M9 18c1.5-1 3-1.5 6 0" strokeWidth="1.5" />
    </svg>
  );
}

/** EmergencyTeams — Kask + ekip */
export function EmergencyTeamsIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M6 7h6" strokeWidth="2.5" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      <circle cx="19" cy="9" r="2.5" />
      <path d="M17 9h4" strokeWidth="2" />
      <path d="M19 15a3 3 0 0 1 3 3v3" />
    </svg>
  );
}

/** HazardUtilities — Tehlike üçgeni + vana */
export function HazardUtilitiesIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="16" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** AccessibilityRefuge — Tekerlekli sandalye */
export function AccessibilityIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="4" r="2" fill="currentColor" opacity=".3" />
      <path d="M10 8h4l1 5h4" />
      <path d="M11 13v4" />
      <circle cx="11" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
      <path d="M3 13h4l2 6" />
    </svg>
  );
}

/** FireEquipmentInventory — Yangın tüpü */
export function FireEquipmentIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="6" width="10" height="15" rx="3" />
      <path d="M10 6V4h4v2" />
      <path d="M12 3v1" />
      <path d="M9 4h6" strokeWidth="1.2" />
      <line x1="10" y1="10" x2="14" y2="10" strokeWidth="1.2" />
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="900" fontFamily="Arial" stroke="none">P</text>
    </svg>
  );
}

/** QrDocumentInfo — QR kod */
export function QrDocumentIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="4" y="4" width="4" height="4" fill="currentColor" opacity=".3" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="16" y="4" width="4" height="4" fill="currentColor" opacity=".3" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <rect x="4" y="16" width="4" height="4" fill="currentColor" opacity=".3" />
      <rect x="14" y="14" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="18" y="14" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="14" y="18" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="18" y="18" width="4" height="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Notes — Not defteri */
export function NotesIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
      <path d="M15 3v5h6" />
      <line x1="7" y1="12" x2="13" y2="12" />
      <line x1="7" y1="16" x2="17" y2="16" />
    </svg>
  );
}

/** DrawingArea — Kalem + grid */
/** DrawingArea — Kalem + grid */
export function DrawingAreaIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 2" />
      <path d="M3 9h18" opacity=".3" />
      <path d="M3 15h18" opacity=".3" />
      <path d="M9 3v18" opacity=".3" />
      <path d="M15 3v18" opacity=".3" />
      <path d="M14 7l4 4-7 7H7v-4z" fill="currentColor" opacity=".15" />
    </svg>
  );
}

/** Logo — Resim/Logo ikonu */
export function LogoIcon({ className, size = defaultProps.size }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

/* ─── Modül tipine göre ikon eşleşmesi ─── */

import type { TemplateModuleType } from '@/types/editor';

export const MODULE_ICONS: Record<TemplateModuleType, React.ComponentType<IconProps>> = {
  Header: HeaderIcon,
  Logo: LogoIcon,
  DrawingArea: DrawingAreaIcon,
  EmergencyCall: EmergencyCallIcon,
  EvacuationInstructions: EvacuationIcon,
  FireInstructions: FireInstructionsIcon,
  Legend: LegendIcon,
  AssemblyMap: AssemblyMapIcon,
  ApprovalRevision: ApprovalRevisionIcon,
  EmergencyTeams: EmergencyTeamsIcon,
  HazardUtilities: HazardUtilitiesIcon,
  AccessibilityRefuge: AccessibilityIcon,
  FireEquipmentInventory: FireEquipmentIcon,
  QrDocumentInfo: QrDocumentIcon,
  Notes: NotesIcon,
};

/** Modül tipine göre renk paleti */
export const MODULE_COLORS: Record<TemplateModuleType, { primary: string; bg: string; border: string; text: string; light: string }> = {
  Header:                  { primary: '#059669', bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', light: 'bg-emerald-100' },
  Logo:                    { primary: '#475569', bg: 'bg-slate-50',    border: 'border-slate-200',   text: 'text-slate-700',   light: 'bg-slate-100' },
  DrawingArea:             { primary: '#475569', bg: 'bg-slate-50',    border: 'border-slate-200',   text: 'text-slate-700',   light: 'bg-slate-100' },
  EmergencyCall:           { primary: '#dc2626', bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     light: 'bg-red-100' },
  EvacuationInstructions:  { primary: '#059669', bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', light: 'bg-emerald-100' },
  FireInstructions:        { primary: '#dc2626', bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     light: 'bg-red-100' },
  Legend:                  { primary: '#475569', bg: 'bg-slate-50',    border: 'border-slate-200',   text: 'text-slate-700',   light: 'bg-slate-100' },
  AssemblyMap:             { primary: '#2563eb', bg: 'bg-blue-50',     border: 'border-blue-200',    text: 'text-blue-700',    light: 'bg-blue-100' },
  ApprovalRevision:        { primary: '#334155', bg: 'bg-slate-50',    border: 'border-slate-200',   text: 'text-slate-700',   light: 'bg-slate-100' },
  EmergencyTeams:          { primary: '#d97706', bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   light: 'bg-amber-100' },
  HazardUtilities:         { primary: '#dc2626', bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     light: 'bg-red-100' },
  AccessibilityRefuge:     { primary: '#2563eb', bg: 'bg-blue-50',     border: 'border-blue-200',    text: 'text-blue-700',    light: 'bg-blue-100' },
  FireEquipmentInventory:  { primary: '#dc2626', bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     light: 'bg-red-100' },
  QrDocumentInfo:          { primary: '#475569', bg: 'bg-slate-50',    border: 'border-slate-200',   text: 'text-slate-600',   light: 'bg-slate-100' },
  Notes:                   { primary: '#64748b', bg: 'bg-slate-50',    border: 'border-slate-200',   text: 'text-slate-500',   light: 'bg-slate-100' },
};
