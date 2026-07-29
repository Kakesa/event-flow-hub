import { jsPDF } from 'jspdf';
import type { Guest, SeatingTable } from '@/types/models';
import { getGuestsForTable } from '@/utils/seatingHelpers';

interface PrintEventInfo {
  title: string;
}

function addPageHeader(doc: jsPDF, event: PrintEventInfo, y = 15) {
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(event.title, 105, y, { align: 'center' });
  doc.setTextColor(0);
}

/** Liste complète des invités par table */
export function downloadGuestListPdf(
  event: PrintEventInfo,
  tables: SeatingTable[],
  guests: Guest[],
  filename?: string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let first = true;

  tables.forEach((table) => {
    if (!first) doc.addPage();
    first = false;

    const tableGuests = getGuestsForTable(guests, table.id);
    const count = tableGuests.length;
    const remaining = Math.max(0, table.capacity - count);

    addPageHeader(doc, event);
    doc.setFontSize(18);
    doc.text(table.name, 105, 28, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`${count} / ${table.capacity} invités · ${remaining} place(s) restante(s)`, 105, 36, {
      align: 'center',
    });

    if (table.description) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(table.description, 105, 42, { align: 'center' });
      doc.setTextColor(0);
    }

    doc.setFontSize(11);
    let y = 52;
    if (tableGuests.length === 0) {
      doc.text('Aucun invité assigné', 20, y);
    } else {
      tableGuests.forEach((g, i) => {
        if (y > 275) {
          doc.addPage();
          addPageHeader(doc, event);
          y = 28;
        }
        doc.text(`${i + 1}. ${g.name}`, 20, y);
        y += 7;
      });
    }
  });

  if (first) {
    doc.setFontSize(14);
    doc.text('Aucune table configurée', 105, 50, { align: 'center' });
  }

  doc.save(filename || `plan-de-table-${sanitizeFilename(event.title)}.pdf`);
}

/** Chevalets de table (nom/numéro) — 4 par page A4 */
export function downloadTableTentsPdf(
  event: PrintEventInfo,
  tables: SeatingTable[],
  filename?: string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageW = 210;
  const tentW = 90;
  const tentH = 60;
  const marginX = (pageW - tentW * 2) / 3;

  tables.forEach((table, index) => {
    if (index > 0 && index % 4 === 0) doc.addPage();

    const slot = index % 4;
    const col = slot % 2;
    const row = Math.floor(slot / 2);
    const x = marginX + col * (tentW + marginX);
    const y = 25 + row * (tentH + 25);

    doc.setDrawColor(180);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, tentW, tentH, 3, 3);

    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(event.title, x + tentW / 2, y + 10, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(30);
    doc.text(table.name, x + tentW / 2, y + tentH / 2 + 2, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Table n°${table.number}`, x + tentW / 2, y + tentH - 8, { align: 'center' });

    doc.setTextColor(0);
  });

  if (tables.length === 0) {
    doc.setFontSize(14);
    doc.text('Aucune table', 105, 50, { align: 'center' });
  }

  doc.save(filename || `chevalets-${sanitizeFilename(event.title)}.pdf`);
}

/** Panneau récapitulatif par table */
export function downloadTableSummaryPdf(
  event: PrintEventInfo,
  tables: SeatingTable[],
  guests: Guest[],
  filename?: string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let first = true;

  tables.forEach((table) => {
    if (!first) doc.addPage();
    first = false;

    const tableGuests = getGuestsForTable(guests, table.id);
    const count = tableGuests.length;
    const remaining = Math.max(0, table.capacity - count);
    const fillRate = table.capacity > 0 ? Math.round((count / table.capacity) * 100) : 0;

    addPageHeader(doc, event, 12);

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, 20, 180, 45, 4, 4, 'F');

    doc.setFontSize(20);
    doc.text(table.name, 105, 38, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Capacité : ${table.capacity} · Occupées : ${count} · Restantes : ${remaining}`, 105, 48, {
      align: 'center',
    });
    doc.text(`Taux de remplissage : ${fillRate}%`, 105, 55, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Liste des invités', 20, 78);

    doc.setFontSize(10);
    let y = 86;
    if (tableGuests.length === 0) {
      doc.text('— Aucun invité —', 20, y);
    } else {
      tableGuests.forEach((g) => {
        doc.text(`• ${g.name}${g.status ? ` (${g.status})` : ''}`, 22, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    }
  });

  doc.save(filename || `recap-tables-${sanitizeFilename(event.title)}.pdf`);
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'evenement';
}
