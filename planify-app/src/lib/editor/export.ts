import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import type { TemplateLayout } from '@/types/editor';

type JsPdfWithGState = jsPDF & {
  GState: new (options: { opacity: number }) => unknown;
  setGState: (gState: unknown) => jsPDF;
};

export async function exportToPDF(
  containerRef: React.RefObject<HTMLDivElement | null>, 
  projectName: string = 'Tahliye-Plani',
  activeLayout?: TemplateLayout | null,
  isPro: boolean = false,
  scale: number = 2,
  backgroundColor: string = '#ffffff',
  bgMode: string = 'minimal'
) {
  if (!containerRef.current) return;

  try {
    containerRef.current.dataset.exportMode = 'true';
    containerRef.current.dataset.exportBgMode = bgMode;
    const imgData = await toJpeg(containerRef.current, {
      quality: 0.8,
      backgroundColor,
      pixelRatio: scale
    });

    // Determine orientation and format
    const orientation = activeLayout?.orientation || 'landscape';
    const isA4 = activeLayout?.slug.includes('compact-a4');
    const format = isA4 ? 'a4' : 'a3';

    const pdf = new jsPDF({
      orientation: orientation as 'landscape' | 'portrait',
      unit: 'mm',
      format: format,
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const margin = 5;
    
    let renderWidth = pdfWidth - (margin * 2);
    let renderHeight = (imgProps.height * renderWidth) / imgProps.width;

    if (renderHeight > pdfHeight - (margin * 2)) {
      renderHeight = pdfHeight - (margin * 2);
      renderWidth = (imgProps.width * renderHeight) / imgProps.height;
    }

    const x = (pdfWidth - renderWidth) / 2;
    const y = (pdfHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'JPEG', x, y, renderWidth, renderHeight, undefined, 'FAST');
    
    // Technical border
    pdf.setDrawColor(200);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, margin, pdfWidth - (margin * 2), pdfHeight - (margin * 2));

    if (!isPro) {
      // FREE USER — Diagonal watermark overlay
      const pdfEx = pdf as JsPdfWithGState;
      const gState = new pdfEx.GState({ opacity: 0.12 });
      pdfEx.setGState(gState);
      pdf.setFontSize(48);
      pdf.setTextColor(100, 100, 100);

      // Repeat watermark text diagonally across the page
      const watermarkText = 'planify.com.tr';
      const angle = -35;
      const spacingX = 120;
      const spacingY = 80;
      for (let wy = -spacingY; wy < pdfHeight + spacingY; wy += spacingY) {
        for (let wx = -spacingX; wx < pdfWidth + spacingX; wx += spacingX) {
          pdf.text(watermarkText, wx, wy, { angle });
        }
      }

      // Reset opacity
      const fullOpacity = new pdfEx.GState({ opacity: 1 });
      pdfEx.setGState(fullOpacity);

      // Bottom banner for free users
      pdf.setFillColor(30, 30, 30);
      pdf.rect(0, pdfHeight - 10, pdfWidth, 10, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Bu çıktı Planify ücretsiz sürümü ile oluşturulmuştur. Filigransız çıktı için: planify.com.tr', pdfWidth / 2, pdfHeight - 4, { align: 'center' });
    } else {
      // Pro user - subtle credit only
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);
      pdf.text('Planify ile oluşturulmuştur — planify.com.tr', margin + 2, pdfHeight - 2);
    }
    
    const today = new Date().toLocaleDateString('tr-TR');
    pdf.setFontSize(7);
    pdf.setTextColor(150);
    pdf.text(`Tarih: ${today}`, pdfWidth - margin - 25, pdfHeight - 2);

    pdf.save(`${projectName.replace(/\s+/g, '-')}.pdf`);

  } catch (error) {
    console.error('PDF Export Error:', error);
  } finally {
    if (containerRef.current) {
      delete containerRef.current.dataset.exportMode;
      delete containerRef.current.dataset.exportBgMode;
    }
  }
}
