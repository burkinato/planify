import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { TemplateLayout } from '@/types/editor';

export async function exportToPDF(
  containerRef: React.RefObject<HTMLDivElement | null>, 
  projectName: string = 'Tahliye-Plani',
  activeLayout?: TemplateLayout | null,
  isPro: boolean = false,
  scale: number = 2
) {
  if (!containerRef.current) return;

  try {
    const canvas = await html2canvas(containerRef.current, {
      scale: scale, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Determine orientation and format
    const orientation = activeLayout?.orientation || 'landscape';
    const isA4 = activeLayout?.slug.includes('compact-a4');
    const format = isA4 ? 'a4' : 'a3';

    const imgData = canvas.toDataURL('image/jpeg', 0.8);

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
      // Watermark for free users - diagonal text
      pdf.saveGraphicsState();
      pdf.setGState(new (pdf as any).GState({ opacity: 0.12 }));
      pdf.setFontSize(72);
      pdf.setTextColor(100, 100, 100);
      
      // Draw multiple watermark lines for full coverage
      const centerX = pdfWidth / 2;
      const centerY = pdfHeight / 2;
      pdf.text('PLANIFY DEMO', centerX, centerY - 40, { angle: 35, align: 'center' });
      pdf.text('PLANIFY DEMO', centerX, centerY + 40, { angle: 35, align: 'center' });
      pdf.restoreGraphicsState();

      // Free user footer
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Filigransız çıktı için: planify.com.tr/upgrade — Planify Pro', margin + 2, pdfHeight - 2);
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
  }
}
