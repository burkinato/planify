import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEditorStore } from '@/store/useEditorStore';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';
import { ShieldCheck } from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────
 *  HeaderModule — Başlık / Kimlik Bandı
 *  Logo + ana başlık + alt başlık + kat/bölüm bilgisi
 *  Yeşil ISG güvenlik rengi (ISO 7010 uyumlu)
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  accent?: string;
  compact?: boolean;
}

export function HeaderModule({ region, content, accent, compact }: Props) {
  const { projectMetadata, focusedRegionId, advancedType } = useEditorStore();
  const isRegionFocused = focusedRegionId === region.id;
  const headerColor = accent || '#008F4C';

  const title = content.title || 'ACIL DURUM TAHLİYE PLANI';
  const body = content.body ?? projectMetadata.name ?? 'İSİMSİZ PROJE';
  const meta = content.meta ?? projectMetadata.floor ?? 'ZEMİN KAT';

  const getFocusStyle = (type: string) => {
    if (advancedType !== type) return '';
    return 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-white bg-cyan-50/50 rounded-md px-1.5 py-0.5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]';
  };

  return (
    <div
      className="flex h-full w-full items-center justify-between px-4 py-2 overflow-hidden"
      style={{ background: headerColor }}
    >
      {/* ── Title Area ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-w-0">
        <div
          className={cn(
            'text-white uppercase tracking-[-0.01em] drop-shadow-md transition-all duration-200 truncate max-w-full text-center',
            isRegionFocused && 'ring-2 ring-blue-500 ring-offset-4 ring-offset-emerald-600 rounded-md px-2 py-1 bg-blue-50/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]',
            getFocusStyle('title')
          )}
          style={{
            fontSize: content.titleSize || 'clamp(18px, 4cqw, 36px)',
            fontWeight: content.titleWeight || 900,
            letterSpacing: content.titleLetterSpacing !== undefined ? `${content.titleLetterSpacing}px` : undefined,
            lineHeight: content.titleLineHeight || 1.15,
            color: content.titleColor || undefined,
          }}
        >
          {title}
          {isRegionFocused && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500 text-white animate-pulse">
              DÜZENLENİYOR
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1">
          <span
            className={cn(
              'text-white/90 uppercase whitespace-nowrap',
              getFocusStyle('body')
            )}
            style={{
              fontSize: content.bodySize || 'clamp(10px, 1.5cqw, 16px)',
              fontWeight: content.bodyWeight || 900,
              letterSpacing: content.bodyLetterSpacing !== undefined ? `${content.bodyLetterSpacing}px` : '0.25em',
              color: content.bodyColor || undefined,
            }}
          >
            {body}
          </span>
          {body && meta && <span className="text-white/50 mx-1">|</span>}
          <span
            className={cn(
              'text-white/90 uppercase whitespace-nowrap',
              getFocusStyle('meta')
            )}
            style={{
              fontSize: content.metaSize || content.bodySize || 'clamp(10px, 1.5cqw, 16px)',
              fontWeight: content.metaWeight || content.bodyWeight || 900,
              letterSpacing: content.metaLetterSpacing !== undefined ? `${content.metaLetterSpacing}px` : '0.25em',
              color: content.metaColor || content.bodyColor || undefined,
            }}
          >
            {meta}
          </span>
        </div>
      </div>

    </div>
  );
}
