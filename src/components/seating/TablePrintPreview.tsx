import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resolveAssetUrl } from '@/config/env';
import type { Guest, SeatingTable } from '@/types/models';
import { getGuestsForTable } from '@/utils/seatingHelpers';
import {
  downloadGuestListPdf,
  downloadTableSummaryPdf,
  downloadTableTentsPdf,
} from '@/utils/tablePrintPdf';

interface PrintEventInfo {
  title: string;
  coverImage?: string;
}

interface TablePrintPreviewProps {
  event: PrintEventInfo;
  table?: SeatingTable;
  tables?: SeatingTable[];
  guests: Guest[];
  mode?: 'single' | 'all';
}

export default function TablePrintPreview({
  event,
  table,
  tables = [],
  guests,
  mode = 'all',
}: TablePrintPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printTab, setPrintTab] = useState<'list' | 'tents' | 'summary'>('list');

  const activeTables = mode === 'single' && table ? [table] : tables;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const styles =
      printTab === 'tents'
        ? `
        .tent-grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
        .tent { width: 200px; height: 140px; border: 2px solid #ccc; border-radius: 8px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          page-break-inside: avoid; margin-bottom: 12px; }
        .tent-event { font-size: 10px; color: #888; margin-bottom: 8px; }
        .tent-name { font-size: 24px; font-weight: bold; }
        .tent-num { font-size: 11px; color: #666; margin-top: 8px; }
        `
        : `
        h2 { margin: 24px 0 8px; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
        ul { padding-left: 18px; }
        li { margin: 4px 0; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f3f4f6; font-size: 12px; }
        .page-break { page-break-before: always; }
        .summary-box { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        `;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Plan de table - ${event.title}</title>
      <style>
        body { font-family: Georgia, serif; padding: 24px; color: #111; }
        h1 { margin: 0 0 8px; font-size: 22px; }
        img.logo { max-height: 56px; margin-bottom: 12px; }
        ${styles}
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleDownloadPdf = () => {
    if (printTab === 'tents') {
      downloadTableTentsPdf(event, activeTables);
    } else if (printTab === 'summary') {
      downloadTableSummaryPdf(event, activeTables, guests);
    } else {
      downloadGuestListPdf(event, activeTables, guests);
    }
  };

  const logo = resolveAssetUrl(event.coverImage);

  const renderGuestList = () =>
    activeTables.map((t, idx) => {
      const tableGuests = getGuestsForTable(guests, t.id);
      const count = tableGuests.length;
      const remaining = Math.max(0, t.capacity - count);
      return (
        <div key={t.id} className={idx > 0 ? 'page-break mt-8' : ''}>
          <h2>{t.name}</h2>
          <p className="meta">
            <span className="badge">{count} / {t.capacity} places occupées</span>
            {' · '}
            {remaining} place{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}
          </p>
          {t.description && <p className="meta">{t.description}</p>}
          <ul>
            {tableGuests.length === 0 ? (
              <li>Aucun invité assigné</li>
            ) : (
              tableGuests.map((g) => <li key={g.id}>{g.name}</li>)
            )}
          </ul>
        </div>
      );
    });

  const renderTents = () => (
    <div className="tent-grid">
      {activeTables.map((t) => (
        <div key={t.id} className="tent">
          <span className="tent-event">{event.title}</span>
          <span className="tent-name">{t.name}</span>
          <span className="tent-num">Table n°{t.number}</span>
        </div>
      ))}
    </div>
  );

  const renderSummary = () =>
    activeTables.map((t, idx) => {
      const tableGuests = getGuestsForTable(guests, t.id);
      const count = tableGuests.length;
      const remaining = Math.max(0, t.capacity - count);
      const fillRate = t.capacity > 0 ? Math.round((count / t.capacity) * 100) : 0;
      return (
        <div key={t.id} className={`summary-box ${idx > 0 ? 'page-break' : ''}`}>
          <h2 className="text-lg font-bold">{t.name}</h2>
          <p className="meta">
            Capacité : {t.capacity} · Occupées : {count} · Restantes : {remaining} · Remplissage : {fillRate}%
          </p>
          <ul>
            {tableGuests.map((g) => (
              <li key={g.id}>{g.name}</li>
            ))}
            {tableGuests.length === 0 && <li>Aucun invité</li>}
          </ul>
        </div>
      );
    });

  return (
    <div className="space-y-4">
      <Tabs value={printTab} onValueChange={(v) => setPrintTab(v as typeof printTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Liste invités</TabsTrigger>
          <TabsTrigger value="tents">Chevalets</TabsTrigger>
          <TabsTrigger value="summary">Récapitulatif</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <div ref={printTab === 'list' ? printRef : undefined} className="rounded-lg border bg-card p-6">
            {logo && <img src={logo} alt="" className="logo mb-3 max-h-14 object-contain" />}
            <h1 className="font-display text-xl font-bold">{event.title}</h1>
            <p className="mb-4 text-sm text-muted-foreground">Liste des invités par table</p>
            {renderGuestList()}
          </div>
        </TabsContent>

        <TabsContent value="tents" className="mt-4">
          <div ref={printTab === 'tents' ? printRef : undefined} className="rounded-lg border bg-card p-6">
            <h1 className="mb-4 font-display text-xl font-bold">{event.title}</h1>
            <p className="mb-4 text-sm text-muted-foreground">Chevalets de table à imprimer et plier</p>
            <div className="flex flex-wrap justify-center gap-4">
              {activeTables.map((t) => (
                <div
                  key={t.id}
                  className="flex h-36 w-48 flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center"
                >
                  <span className="text-[10px] text-muted-foreground">{event.title}</span>
                  <span className="font-display text-2xl font-bold">{t.name}</span>
                  <span className="mt-2 text-xs text-muted-foreground">Table n°{t.number}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <div ref={printTab === 'summary' ? printRef : undefined} className="rounded-lg border bg-card p-6">
            {logo && <img src={logo} alt="" className="logo mb-3 max-h-14 object-contain" />}
            <h1 className="font-display text-xl font-bold">{event.title}</h1>
            <p className="mb-4 text-sm text-muted-foreground">Panneau récapitulatif par table</p>
            {renderSummary()}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={!activeTables.length}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
        <Button size="sm" onClick={handleDownloadPdf} disabled={!activeTables.length}>
          <FileDown className="mr-2 h-4 w-4" />
          Télécharger PDF
        </Button>
      </div>
    </div>
  );
}
