/**
 * Adds a diagonal watermark to a PNG data URL using canvas.
 * Used for free-tier users who export without credits.
 */
export async function addWatermarkToPng(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Diagonal watermark
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#333333';
      ctx.font = `bold ${Math.max(48, img.width / 20)}px sans-serif`;
      ctx.textAlign = 'center';

      const text = 'planify.com.tr';
      const spacingX = img.width / 3;
      const spacingY = img.height / 4;

      ctx.translate(img.width / 2, img.height / 2);
      ctx.rotate(-35 * Math.PI / 180);

      for (let y = -img.height; y < img.height; y += spacingY) {
        for (let x = -img.width; x < img.width; x += spacingX) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();

      // Bottom banner
      const bannerH = Math.max(40, img.height / 25);
      ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
      ctx.fillRect(0, img.height - bannerH, img.width, bannerH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(14, bannerH / 3)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'Bu çıktı Planify ücretsiz sürümü ile oluşturulmuştur — planify.com.tr',
        img.width / 2,
        img.height - bannerH / 3
      );

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}
