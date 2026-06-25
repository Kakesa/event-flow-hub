const HK_LOGO_PATH = '/pwa-icon-192.png';

export const QR_LOGO_SETTINGS = {
  src: HK_LOGO_PATH,
  height: 44,
  width: 44,
  excavate: true,
} as const;

export interface BrandedQrDownloadOptions {
  svgElement: SVGSVGElement;
  filename: string;
  coverImageUrl?: string;
  guestName?: string;
  eventTitle?: string;
}

function getAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Impossible de charger l'image: ${src}`));
    img.src = src;
  });
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

async function svgToImage(svgElement: SVGSVGElement): Promise<HTMLImageElement> {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Télécharge un QR code en PNG avec photo de couverture et logo HK Event au centre */
export async function downloadBrandedQrCodePng(options: BrandedQrDownloadOptions): Promise<void> {
  const { svgElement, filename, coverImageUrl, guestName, eventTitle } = options;

  const width = 600;
  const height = 920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');

  const coverHeight = 340;

  if (coverImageUrl) {
    try {
      const cover = await loadImage(coverImageUrl);
      const scale = Math.max(width / cover.width, coverHeight / cover.height);
      const sw = cover.width * scale;
      const sh = cover.height * scale;
      const sx = (width - sw) / 2;
      const sy = (coverHeight - sh) / 2;
      ctx.drawImage(cover, sx, sy, sw, sh);
    } catch {
      const gradient = ctx.createLinearGradient(0, 0, 0, coverHeight);
      gradient.addColorStop(0, '#4a5a44');
      gradient.addColorStop(1, '#7a8b72');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, coverHeight);
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, coverHeight);
    gradient.addColorStop(0, '#4a5a44');
    gradient.addColorStop(1, '#7a8b72');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, coverHeight);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, width, coverHeight);

  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, coverHeight, width, height - coverHeight);

  ctx.fillStyle = '#b8956c';
  ctx.fillRect(0, coverHeight, width, 4);

  if (eventTitle) {
    ctx.fillStyle = '#faf8f5';
    ctx.font = '600 26px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    wrapText(ctx, eventTitle, width / 2, coverHeight - 72, width - 48, 32);
  }

  ctx.fillStyle = '#b8956c';
  ctx.font = '600 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PASS D\'ENTRÉE', width / 2, coverHeight + 36);

  if (guestName) {
    ctx.fillStyle = '#4a5a44';
    ctx.font = '600 22px Georgia, "Times New Roman", serif';
    ctx.fillText(guestName, width / 2, coverHeight + 68);
  }

  const qrImg = await svgToImage(svgElement);
  const qrSize = 280;
  const qrX = (width - qrSize) / 2;
  const qrY = coverHeight + (guestName ? 88 : 56);
  const pad = 18;

  ctx.fillStyle = '#ffffff';
  drawRoundRect(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 14);
  ctx.fill();
  ctx.strokeStyle = '#e8e0d8';
  ctx.lineWidth = 2;
  drawRoundRect(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 14);
  ctx.stroke();

  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  try {
    const logo = await loadImage(getAbsoluteUrl(HK_LOGO_PATH));
    const logoSize = qrSize * 0.2;
    const centerX = qrX + qrSize / 2;
    const centerY = qrY + qrSize / 2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, logoSize * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8e0d8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.drawImage(
      logo,
      centerX - logoSize / 2,
      centerY - logoSize / 2,
      logoSize,
      logoSize,
    );
  } catch {
    // Logo optionnel
  }

  ctx.fillStyle = '#7a8b72';
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Présentez ce code à l\'accueil', width / 2, qrY + qrSize + pad + 36);

  ctx.fillStyle = '#4a5a44';
  ctx.font = '600 14px Georgia, serif';
  ctx.fillText('HK Event', width / 2, height - 28);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Export impossible'));
        return;
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      resolve();
    }, 'image/png');
  });
}

/** @deprecated Utiliser downloadBrandedQrCodePng — conservé pour compatibilité */
export const downloadQrCodePng = (
  svgElement: SVGSVGElement,
  filename: string,
  options?: Omit<BrandedQrDownloadOptions, 'svgElement' | 'filename'>,
): Promise<void> =>
  downloadBrandedQrCodePng({ svgElement, filename, ...options });
