import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Event, MarqueTable, MarqueTableDesign, MarqueTableTemplateId } from '@/types/models';
import MarqueTablePreview from '@/components/marque-tables/MarqueTablePreview';
import {
  DEFAULT_MARQUE_DESIGN,
  formatMarqueDate,
  mergeMarqueDesign,
  parseMarqueCoupleFromTitle,
} from '@/utils/marqueTableResolve';
import { downloadMarqueTablePdf } from '@/utils/marqueTablePdf';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';

interface MarqueTableEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  initial?: MarqueTable | null;
  onSave: (payload: Partial<MarqueTable>) => Promise<void>;
}

const FONT_OPTIONS = [
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia (serif)' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Garamond, Georgia, serif', label: 'Garamond' },
  { value: 'system-ui, sans-serif', label: 'System sans' },
];

const MarqueTableEditor = ({
  open,
  onOpenChange,
  event,
  initial,
  onSave,
}: MarqueTableEditorProps) => {
  const faceRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const suggestedName = useMemo(
    () => parseMarqueCoupleFromTitle(event.title).display,
    [event.title],
  );
  const suggestedDate = useMemo(() => formatMarqueDate(event.date), [event.date]);

  const [number, setNumber] = useState('1');
  const [label, setLabel] = useState('Table');
  const [titleText, setTitleText] = useState('1');
  const [displayName, setDisplayName] = useState(suggestedName);
  const [displayDate, setDisplayDate] = useState(suggestedDate);
  const [design, setDesign] = useState<MarqueTableDesign>(DEFAULT_MARQUE_DESIGN);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setNumber(initial.number || '1');
      setLabel(initial.label || 'Table');
      setTitleText(initial.titleText || initial.number || '1');
      setDisplayName(initial.displayNameOverride?.trim() || suggestedName);
      setDisplayDate(initial.displayDateOverride?.trim() || suggestedDate);
      setDesign(mergeMarqueDesign(initial.design));
    } else {
      setNumber('1');
      setLabel('Table');
      setTitleText('1');
      setDisplayName(suggestedName);
      setDisplayDate(suggestedDate);
      setDesign(DEFAULT_MARQUE_DESIGN);
    }
  }, [open, initial, suggestedName, suggestedDate]);

  const draft: Pick<
    MarqueTable,
    'number' | 'label' | 'titleText' | 'displayNameOverride' | 'displayDateOverride' | 'design'
  > = {
    number,
    label,
    titleText,
    displayNameOverride:
      displayName.trim() === suggestedName.trim() ? null : displayName.trim() || null,
    displayDateOverride:
      displayDate.trim() === suggestedDate.trim() ? null : displayDate.trim() || null,
    design,
  };

  const patchDesign = (partial: Partial<MarqueTableDesign>) => {
    setDesign((prev) => mergeMarqueDesign({ ...prev, ...partial }));
  };

  const patchText = (
    key: 'label' | 'title' | 'names' | 'date',
    partial: Partial<NonNullable<MarqueTableDesign['label']>>,
  ) => {
    setDesign((prev) =>
      mergeMarqueDesign({
        ...prev,
        [key]: { ...(prev[key] || {}), ...partial },
      }),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        number: number.trim() || '1',
        label: label.trim() || 'Table',
        titleText: titleText.trim() || number.trim() || '1',
        displayNameOverride: draft.displayNameOverride,
        displayDateOverride: draft.displayDateOverride,
        design,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!faceRef.current) return;
    setExporting(true);
    try {
      await downloadMarqueTablePdf(
        faceRef.current,
        {
          id: initial?.id || 'draft',
          eventId: event.id || event._id || '',
          order: initial?.order || 0,
          ...draft,
          number: number.trim() || '1',
          label: label.trim() || 'Table',
          titleText: titleText.trim() || number,
        } as MarqueTable,
        event,
      );
      toast.success('PDF téléchargé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export PDF impossible');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle>
            {initial ? 'Modifier le marque-table' : 'Nouveau marque-table'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-0 max-h-[calc(92vh-8rem)]">
          <div className="bg-muted/30 flex items-center justify-center p-6 min-h-[320px] border-b lg:border-b-0 lg:border-r">
            <MarqueTablePreview
              ref={faceRef}
              marque={draft}
              event={event}
              scale={0.72}
            />
          </div>

          <ScrollArea className="h-[min(70vh,560px)]">
            <div className="p-6 space-y-5">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Contenu</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Libellé</Label>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Table / Mesa" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Numéro</Label>
                    <Input
                      value={number}
                      onChange={(e) => {
                        setNumber(e.target.value);
                        if (!titleText || titleText === number) setTitleText(e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Texte central (numéro ou nom)</Label>
                  <Input
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    placeholder="1 / Laravel / VIP…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Noms affichés</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  <p className="text-[11px] text-muted-foreground">
                    Suggestion événement : {suggestedName || '—'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Date affichée</Label>
                  <Input value={displayDate} onChange={(e) => setDisplayDate(e.target.value)} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Design</h3>
                <div className="space-y-1.5">
                  <Label>Template</Label>
                  <Select
                    value={design.templateId || 'classic-floral'}
                    onValueChange={(v: MarqueTableTemplateId) =>
                      patchDesign({
                        templateId: v,
                        decoration: {
                          ...design.decoration,
                          enabled: v !== 'minimal',
                          motif: v === 'minimal' ? 'none' : 'floral-left',
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic-floral">Classic floral (référence)</SelectItem>
                      <SelectItem value="centered-serif">Centered serif</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Couleur texte</Label>
                    <Input
                      type="color"
                      value={design.textColor || '#1a1a1a'}
                      onChange={(e) => patchDesign({ textColor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fond</Label>
                    <Input
                      type="color"
                      value={design.backgroundColor || '#f7f5f2'}
                      onChange={(e) => patchDesign({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Largeur (mm)</Label>
                    <Input
                      type="number"
                      value={design.widthMm || 100}
                      onChange={(e) => patchDesign({ widthMm: Number(e.target.value) || 100 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Hauteur face (mm)</Label>
                    <Input
                      type="number"
                      value={design.heightMm || 140}
                      onChange={(e) => patchDesign({ heightMm: Number(e.target.value) || 140 })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Pliage tente (2 faces)</p>
                    <p className="text-xs text-muted-foreground">
                      PDF avec recto haut/bas pour plier le papier
                    </p>
                  </div>
                  <Switch
                    checked={design.tentFold !== false}
                    onCheckedChange={(v) => patchDesign({ tentFold: v })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Décor floral</p>
                  </div>
                  <Switch
                    checked={design.decoration?.enabled !== false && design.decoration?.motif !== 'none'}
                    onCheckedChange={(v) =>
                      patchDesign({
                        decoration: {
                          ...design.decoration,
                          enabled: v,
                          motif: v ? 'floral-left' : 'none',
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <p className="text-sm font-medium">Bordure</p>
                  <Switch
                    checked={!!design.border?.enabled}
                    onCheckedChange={(v) =>
                      patchDesign({ border: { ...design.border, enabled: v } })
                    }
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Typographie</h3>
                <div className="space-y-1.5">
                  <Label>Police (titre)</Label>
                  <Select
                    value={design.title?.fontFamily || FONT_OPTIONS[0].value}
                    onValueChange={(v) => {
                      patchText('title', { fontFamily: v });
                      patchText('label', { fontFamily: v });
                      patchText('names', { fontFamily: v });
                      patchText('date', { fontFamily: v });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Taille libellé</Label>
                    <Input
                      type="number"
                      value={design.label?.fontSize || 16}
                      onChange={(e) => patchText('label', { fontSize: Number(e.target.value) || 16 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Taille titre</Label>
                    <Input
                      type="number"
                      value={design.title?.fontSize || 64}
                      onChange={(e) => patchText('title', { fontSize: Number(e.target.value) || 64 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Taille noms</Label>
                    <Input
                      type="number"
                      value={design.names?.fontSize || 13}
                      onChange={(e) => patchText('names', { fontSize: Number(e.target.value) || 13 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Taille date</Label>
                    <Input
                      type="number"
                      value={design.date?.fontSize || 12}
                      onChange={(e) => patchText('date', { fontSize: Number(e.target.value) || 12 })}
                    />
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Télécharger PDF
          </Button>
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarqueTableEditor;
