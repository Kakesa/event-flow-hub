import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Copy,
  Download,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileDown,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EventContextNav from '@/components/marque-tables/EventContextNav';
import MarqueTablePreview from '@/components/marque-tables/MarqueTablePreview';
import MarqueTableEditor from '@/components/marque-tables/MarqueTableEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { eventsApi, marqueTablesApi } from '@/services/api';
import type { Event, MarqueTable } from '@/types/models';
import { toast } from 'sonner';
import { downloadAllMarqueTablesPdf, downloadMarqueTablePdf } from '@/utils/marqueTablePdf';

const MarqueTablesPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [items, setItems] = useState<MarqueTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MarqueTable | null>(null);
  const [exportingAll, setExportingAll] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const faceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedEvent = events.find((e) => (e.id || e._id) === selectedEventId) || null;

  const loadItems = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await marqueTablesApi.listByEvent(id);
      setItems(res.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chargement impossible');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    eventsApi.getAll().then((res) => {
      setEvents(res.data);
      if (!selectedEventId && res.data.length) {
        const id = res.data[0].id || res.data[0]._id || '';
        setSelectedEventId(id);
        navigate(`/events/${id}/marque-tables`, { replace: true });
      }
    });
  }, []);

  useEffect(() => {
    if (eventId) setSelectedEventId(eventId);
  }, [eventId]);

  useEffect(() => {
    if (!selectedEventId) return;
    loadItems(selectedEventId);
  }, [selectedEventId, loadItems]);

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    navigate(`/events/${id}/marque-tables`);
  };

  const handleSyncFromTables = async () => {
    if (!selectedEventId) return;
    setSyncing(true);
    try {
      const res = await marqueTablesApi.syncFromTables(selectedEventId);
      setItems(res.data || []);
      toast.success(
        `${(res.data || []).length} marque-table(s) synchronisé(s) depuis les tables`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Synchronisation impossible');
    } finally {
      setSyncing(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (item: MarqueTable) => {
    setEditing(item);
    setEditorOpen(true);
  };

  const handleSave = async (payload: Partial<MarqueTable>) => {
    if (!selectedEventId) return;
    if (editing) {
      const res = await marqueTablesApi.update(editing.id, payload);
      setItems((prev) => prev.map((m) => (m.id === editing.id ? res.data : m)));
      toast.success('Marque-table mis à jour');
    } else {
      const res = await marqueTablesApi.create(selectedEventId, {
        ...payload,
        order: items.length,
      });
      setItems((prev) => [...prev, res.data]);
      toast.success('Marque-table créé');
    }
  };

  const handleDuplicate = async (item: MarqueTable) => {
    try {
      const res = await marqueTablesApi.duplicate(item.id);
      setItems((prev) => [...prev, res.data]);
      toast.success('Marque-table dupliqué');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Duplication impossible');
    }
  };

  const handleDelete = async (item: MarqueTable) => {
    if (!confirm(`Supprimer « ${item.label} ${item.titleText || item.number} » ?`)) return;
    try {
      await marqueTablesApi.remove(item.id);
      setItems((prev) => prev.filter((m) => m.id !== item.id));
      toast.success('Supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  const moveItem = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [removed] = next.splice(index, 1);
    next.splice(target, 0, removed);
    const withOrder = next.map((m, i) => ({ ...m, order: i }));
    setItems(withOrder);
    try {
      await marqueTablesApi.reorder(
        selectedEventId,
        withOrder.map((m) => ({ id: m.id, order: m.order })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Réordonnancement impossible');
      loadItems(selectedEventId);
    }
  };

  const handleDownloadOne = async (item: MarqueTable) => {
    const el = faceRefs.current[item.id];
    if (!el) {
      toast.error('Aperçu indisponible');
      return;
    }
    try {
      await downloadMarqueTablePdf(el, item, selectedEvent);
      toast.success('PDF téléchargé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export impossible');
    }
  };

  const handleDownloadAll = async () => {
    if (!items.length) return;
    setExportingAll(true);
    try {
      const batch = items
        .map((m) => {
          const el = faceRefs.current[m.id];
          return el ? { marque: m, faceElement: el } : null;
        })
        .filter(Boolean) as { marque: MarqueTable; faceElement: HTMLDivElement }[];

      if (!batch.length) throw new Error('Aucun aperçu capturable');
      await downloadAllMarqueTablesPdf(batch, selectedEvent);
      toast.success('PDF de tous les marque-tables téléchargé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export impossible');
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
              <Tag className="h-7 w-7 text-primary" />
              Marque-tables
            </h1>
            <p className="text-muted-foreground mt-1">
              Générés automatiquement avec les tables seating, puis personnalisables à l’impression.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleSyncFromTables}
              disabled={!selectedEventId || syncing}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Depuis les tables
            </Button>
            <Button variant="outline" onClick={handleDownloadAll} disabled={!items.length || exportingAll}>
              {exportingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Tout télécharger
            </Button>
            <Button onClick={openCreate} disabled={!selectedEventId}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selectedEventId} onValueChange={handleSelectEvent}>
            <SelectTrigger className="w-full sm:max-w-xs">
              <SelectValue placeholder="Choisir un événement" />
            </SelectTrigger>
            <SelectContent>
              {events.map((ev) => {
                const id = ev.id || ev._id || '';
                return (
                  <SelectItem key={id} value={id}>
                    {ev.title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedEventId && (
            <EventContextNav eventId={selectedEventId} className="flex-1" />
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !selectedEventId ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Sélectionnez un événement pour gérer les marque-tables.
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center space-y-4">
              <Tag className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <h2 className="font-display text-xl font-semibold">Aucun marque-table</h2>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Ils sont créés automatiquement quand vous générez les tables. Vous pouvez aussi
                  les synchroniser maintenant.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={handleSyncFromTables} disabled={syncing}>
                  {syncing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Générer depuis les tables
                </Button>
                <Button variant="outline" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer manuellement
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Pas encore de tables ?{' '}
                <Link className="underline" to={`/events/${selectedEventId}/tables`}>
                  Ouvrir le plan de salle
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-center bg-muted/30 rounded-md py-4">
                    <MarqueTablePreview
                      ref={(el) => {
                        faceRefs.current[item.id] = el;
                      }}
                      marque={item}
                      event={selectedEvent}
                      scale={0.42}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">
                        {item.label} · {item.titleText || item.number}
                      </p>
                      <p className="text-xs text-muted-foreground">Ordre {index + 1}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(item)}>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Dupliquer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadOne(item)}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <MarqueTableEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          event={selectedEvent}
          initial={editing}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
};

export default MarqueTablesPage;
