import React from 'react';
import Image from 'next/image';
import { useEditorStore } from '@/store/useEditorStore';
import type { TemplateRegion, TemplateRegionState } from '@/types/editor';
import { ShieldCheck, ImageUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────
 *  LogoModule — Kurumsal Logo Alanı
 *  Sadece logoyu render eder, başlık kısmından ayrılmıştır.
 * ──────────────────────────────────────────────────────────────────────── */

interface Props {
  region: TemplateRegion;
  content: TemplateRegionState;
  compact?: boolean;
}

export function LogoModule({ region, content, compact }: Props) {
  const { projectMetadata, setProjectMetadata } = useEditorStore();
  
  const handleUploadClick = () => {
    // Logo yükleme işlemi ProjectMetadata üzerinden yapıldığı için 
    // editör içindeki dosya yükleyiciyi tetiklemek gerekebilir.
    // Şimdilik sadece görseli render ediyoruz.
  };

  return (
    <div className={cn(
      "flex h-full w-full items-center justify-center p-2 overflow-hidden",
      !projectMetadata.logoUrl && "bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl"
    )}>
      {projectMetadata.logoUrl ? (
        <div className="relative w-full h-full">
          <Image 
            src={projectMetadata.logoUrl} 
            alt="Logo" 
            fill 
            className="object-contain" 
            style={{ imageRendering: 'auto' }} 
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
          <ShieldCheck className="w-8 h-8 opacity-20" />
          {!compact && <span className="text-[8px] font-black uppercase tracking-wider">LOGO YOK</span>}
        </div>
      )}
    </div>
  );
}
