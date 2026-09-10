import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { Event, MarqueTable } from '@/types/models';
import { mergeMarqueDesign } from '@/utils/marqueTableResolve';

/** Hauteur de la base qui pose sur la table (mm) */
const BASE_HEIGHT_MM = 22;

function sanitizeFilename(name: string) {
  return (
    String(name || 'marque-table')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'marque-table'
  );
}

async function captureFace(element: HTMLElement): Promise<string> {
  // skipFonts évite SecurityError sur les CSS Google Fonts (cssRules cross-origin)
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    skipFonts: true,
    fetchRequestInit: { mode: 'cors', credentials: 'omit' },
    filter: (node) => {
      if (node instanceof HTMLLinkElement) {
        const href = node.href || '';
        if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
          return false;
        }
      }
      return true;
    },
  });
}

async function rotateDataUrl180(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas indisponible'));
        return;
      }
      ctx.translate(canvas.width, canvas.height);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Impossible de pivoter le rendu'));
    img.src = dataUrl;
  });
}

function drawFoldLine(
  doc: jsPDF,
  y: number,
  widthMm: number,
  label: string,
  color: [number, number, number],
) {
  const mark = 7;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.45);
  // @ts-expect-error setLineDash
  if (typeof doc.setLineDash === 'function') doc.setLineDash([2.2, 1.6], 0);
  doc.line(mark + 2, y, widthMm - mark - 2, y);
  // @ts-expect-error restore
  if (typeof doc.setLineDash === 'function') doc.setLineDash([], 0);

  doc.setLineWidth(0.6);
  doc.line(0, y, mark, y);
  doc.line(0, y - mark * 0.7, 0, y + mark * 0.7);
  doc.line(widthMm - mark, y, widthMm, y);
  doc.line(widthMm, y - mark * 0.7, widthMm, y + mark * 0.7);

  doc.setFontSize(6.5);
  doc.setTextColor(...color);
  doc.text(label, widthMm / 2, y - 1.6, { align: 'center' });
}

function drawBasePanel(
  doc: jsPDF,
  y: number,
  widthMm: number,
  baseH: number,
  foldColor: [number, number, number],
) {
  const bg: [number, number, number] = [255, 255, 255];
  doc.setFillColor(...bg);
  doc.rect(0, y, widthMm, baseH, 'F');
  doc.setDrawColor(220);
  doc.setLineWidth(0.2);
  doc.rect(0.3, y + 0.3, widthMm - 0.6, baseH - 0.6);

  doc.setFontSize(7);
  doc.setTextColor(...foldColor);
  doc.text('BASE — pose à plat sur la table', widthMm / 2, y + baseH / 2 + 1, {
    align: 'center',
  });

  const mark = 5;
  doc.setDrawColor(...foldColor);
  doc.setLineWidth(0.5);
  // Coins haut
  doc.line(0, y, 0, y + mark);
  doc.line(0, y, mark, y);
  doc.line(widthMm - mark, y, widthMm, y);
  doc.line(widthMm, y, widthMm, y + mark);
  // Coins bas
  const bottom = y + baseH;
  doc.line(0, bottom - mark, 0, bottom);
  doc.line(0, bottom, mark, bottom);
  doc.line(widthMm - mark, bottom, widthMm, bottom);
  doc.line(widthMm, bottom - mark, widthMm, bottom);
}

/**
 * Structure comme la photo : tente avec base des deux côtés (pose sur la table).
 *
 * Feuille dépliée (de haut en bas) :
 * 1. Base (pose sur la table)
 * 2. PLI — bord table
 * 3. Face arrière (retournée)
 * 4. PLI — arête
 * 5. Face avant
 * 6. PLI — bord table
 * 7. Base (pose sur la table)
 */
async function addTentWithBasePage(
  doc: jsPDF,
  faceDataUrl: string,
  widthMm: number,
  faceHeightMm: number,
) {
  const rotated = await rotateDataUrl180(faceDataUrl);
  const baseH = BASE_HEIGHT_MM;
  const foldColor: [number, number, number] = [130, 110, 90];

  let y = 0;

  // 1. Base haut (1er côté table)
  drawBasePanel(doc, y, widthMm, baseH, foldColor);
  y += baseH;
  drawFoldLine(doc, y, widthMm, 'PLIER — côté qui pose sur la table', foldColor);

  // 2. Face arrière
  doc.addImage(rotated, 'PNG', 0, y, widthMm, faceHeightMm);
  y += faceHeightMm;
  drawFoldLine(doc, y, widthMm, 'PLIER — arête (haut de la tente)', foldColor);

  // 3. Face avant
  doc.addImage(faceDataUrl, 'PNG', 0, y, widthMm, faceHeightMm);
  y += faceHeightMm;
  drawFoldLine(doc, y, widthMm, 'PLIER — côté qui pose sur la table', foldColor);

  // 4. Base bas (2e côté table)
  drawBasePanel(doc, y, widthMm, baseH, foldColor);
}

export async function downloadMarqueTablePdf(
  faceElement: HTMLElement,
  marque: MarqueTable,
  event?: Pick<Event, 'title'> | null,
) {
  const design = mergeMarqueDesign(marque.design);
  const widthMm = design.widthMm || 160;
  const heightMm = design.heightMm || 95;
  const tent = design.tentFold !== false;

  const dataUrl = await captureFace(faceElement);
  const pageH = tent ? heightMm * 2 + BASE_HEIGHT_MM * 2 : heightMm;

  const doc = new jsPDF({
    unit: 'mm',
    format: [widthMm, pageH],
    orientation: 'portrait',
  });

  if (tent) {
    await addTentWithBasePage(doc, dataUrl, widthMm, heightMm);
  } else {
    doc.addImage(dataUrl, 'PNG', 0, 0, widthMm, heightMm);
  }

  const label = sanitizeFilename(
    `${marque.label || 'table'}-${marque.titleText || marque.number}`,
  );
  const eventPart = event?.title ? `-${sanitizeFilename(event.title)}` : '';
  doc.save(`marque-table-${label}${eventPart}.pdf`);
}

export async function downloadAllMarqueTablesPdf(
  items: { marque: MarqueTable; faceElement: HTMLElement }[],
  event?: Pick<Event, 'title'> | null,
) {
  if (!items.length) throw new Error('Aucun marque-table à exporter');

  let doc: jsPDF | null = null;

  for (let i = 0; i < items.length; i += 1) {
    const { marque, faceElement } = items[i];
    const design = mergeMarqueDesign(marque.design);
    const widthMm = design.widthMm || 160;
    const heightMm = design.heightMm || 95;
    const tent = design.tentFold !== false;
    const dataUrl = await captureFace(faceElement);
    const pageH = tent ? heightMm * 2 + BASE_HEIGHT_MM * 2 : heightMm;
    const format: [number, number] = [widthMm, pageH];

    if (!doc) {
      doc = new jsPDF({ unit: 'mm', format, orientation: 'portrait' });
    } else {
      doc.addPage(format, 'portrait');
    }

    if (tent) {
      await addTentWithBasePage(doc, dataUrl, widthMm, heightMm);
    } else {
      doc.addImage(dataUrl, 'PNG', 0, 0, widthMm, heightMm);
    }
  }

  const eventPart = event?.title ? sanitizeFilename(event.title) : 'evenement';
  doc!.save(`marque-tables-${eventPart}.pdf`);
}
