import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  Map,
  Plus,
  Search,
  Sparkles,
  Settings2,
  Printer,
  Users,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TableCard from '@/components/seating/TableCard';
import GuestAssignmentModal from '@/components/seating/GuestAssignmentModal';
import TablePrintPreview from '@/components/seating/TablePrintPreview';
import GuestGroupsPanel from '@/components/seating/GuestGroupsPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { eventsApi, seatingApi } from '@/services/api';
import type { Event, Guest, GuestGroup, SeatingOverview, SeatingTable } from '@/types/models';
import { toast } from 'sonner';
import { getGuestTableLabel } from '@/components/seating/GuestTableSelector';
import { getGuestGroupName } from '@/utils/seatingHelpers';

const TablesPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [overview, setOverview] = useState<SeatingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ guests: Guest[]; tables: SeatingTable[] } | null>(null);

  const [editTable, setEditTable] = useState<SeatingTable | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [assignGuest, setAssignGuest] = useState<Guest | null>(null);

  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState(10);
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  const loadOverview = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await seatingApi.getOverview(id);
      setOverview(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de chargement');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    eventsApi.getAll().then((res) => {
      setEvents(res.data);
      if (!selectedEventId && res.data.length) {
        setSelectedEventId(res.data[0].id);
      }
    });
  }, [selectedEventId]);

  useEffect(() => {
    if (eventId) setSelectedEventId(eventId);
  }, [eventId]);

  useEffect(() => {
    if (!selectedEventId) return;
    loadOverview(selectedEventId);
  }, [selectedEventId, loadOverview]);

  useEffect(() => {
    if (!selectedEventId || !searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await seatingApi.search(selectedEventId, searchQuery.trim());
        setSearchResults(res.data);
      } catch {
        setSearchResults(null);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, selectedEventId]);

  const handleEventChange = (id: string) => {
    setSelectedEventId(id);
    navigate(`/events/${id}/tables`, { replace: true });
  };

  const handleAutoDistribute = async () => {
    if (!selectedEventId) return;
    try {
      const res = await seatingApi.autoDistribute(selectedEventId, {
        respectGroups: true,
        onlyUnassigned: true,
      });
      toast.success(`${res.data.assigned} invité(s) réparti(s)`);
      await loadOverview(selectedEventId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const openEdit = (table: SeatingTable) => {
    setEditTable(table);
    setFormName(table.name);
    setFormCapacity(table.capacity);
    setFormDescription(table.description || '');
    setFormColor(table.color || '#6366f1');
    setEditOpen(true);
  };

  const openAdd = () => {
    setFormName('');
    setFormCapacity(10);
    setFormDescription('');
    setFormColor('#6366f1');
    setAddOpen(true);
  };

  const handleSaveTable = async () => {
    if (!selectedEventId) return;
    setSaving(true);
    try {
      if (editOpen && editTable) {
        await seatingApi.updateTable(editTable.id, {
          name: formName,
          capacity: formCapacity,
          description: formDescription,
          color: formColor,
        });
        toast.success('Table mise à jour');
      } else {
        await seatingApi.createTable(selectedEventId, {
          name: formName || undefined,
          capacity: formCapacity,
          description: formDescription,
          color: formColor,
        });
        toast.success('Table ajoutée');
      }
      setEditOpen(false);
      setAddOpen(false);
      await loadOverview(selectedEventId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (table: SeatingTable) => {
    if (!confirm(`Supprimer ${table.name} ?`)) return;
    try {
      await seatingApi.deleteTable(table.id);
      toast.success('Table supprimée');
      await loadOverview(selectedEventId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleAssignTable = async (guestId: string, tableId: string | null) => {
    await seatingApi.assignGuest(guestId, tableId);
    toast.success('Affectation enregistrée');
    await loadOverview(selectedEventId);
  };

  const handleAssignGroup = async (guestId: string, groupId: string | null) => {
    await seatingApi.assignGuestToGroup(guestId, groupId);
    await loadOverview(selectedEventId);
  };

  const stats = overview?.stats;
  const tables = overview?.tables || [];
  const guests = overview?.guests || [];
  const groups = overview?.groups || [];
  const notConfigured = overview && !overview.event.seating?.configured && tables.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Plan de salle</h1>
            <p className="mt-1 text-muted-foreground">
              Gérez vos tables et l&apos;affectation des invités
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {events.length > 1 && (
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            )}
            {selectedEventId && (
              <>
                <Button variant="outline" asChild>
                  <Link to={`/events/${selectedEventId}/tables/floor-plan`}>
                    <Map className="mr-2 h-4 w-4" />
                    Plan interactif
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setPrintOpen(true)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </Button>
                <Button variant="outline" onClick={handleAutoDistribute} disabled={!tables.length}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Répartir auto
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/events/${selectedEventId}/tables/setup`}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    Assistant
                  </Link>
                </Button>
                <Button onClick={openAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une table
                </Button>
              </>
            )}
          </div>
        </div>

        {notConfigured && selectedEventId && (
          <Card className="border-dashed border-primary/40 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Aucune table configurée pour cet événement</p>
                <p className="text-sm text-muted-foreground">
                  Lancez l&apos;assistant pour créer automatiquement votre plan de salle.
                </p>
              </div>
              <Button asChild>
                <Link to={`/events/${selectedEventId}/tables/setup?welcome=1`}>
                  Configurer les tables
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Invités</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalGuests}</p>
                <p className="text-xs text-muted-foreground">{stats.unassignedGuests} non assignés</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.tableCount}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.fullTables} complètes · {stats.incompleteTables} incomplètes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Places</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalRemainingSeats}</p>
                <p className="text-xs text-muted-foreground">sur {stats.totalCapacity} disponibles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Remplissage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.globalFillRate}%</p>
                <p className="text-xs text-muted-foreground">{stats.totalOccupied} places occupées</p>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedEventId && (
          <GuestGroupsPanel
            eventId={selectedEventId}
            groups={groups}
            guests={guests}
            onUpdated={() => loadOverview(selectedEventId)}
          />
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher un invité ou une table…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchResults && searchQuery && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résultats de recherche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {searchResults.guests.length === 0 && searchResults.tables.length === 0 ? (
                <p className="text-muted-foreground">Aucun résultat</p>
              ) : (
                <>
                  {searchResults.guests.map((g) => (
                    <div key={g.id} className="flex items-center justify-between rounded-md border p-2">
                      <span>{g.name}</span>
                      <span className="text-muted-foreground">→ {getGuestTableLabel(g)}</span>
                    </div>
                  ))}
                  {searchResults.tables.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-md border p-2">
                      <span>{t.name}</span>
                      <span className="text-muted-foreground">
                        {t.guestCount ?? 0}/{t.capacity} invités
                      </span>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={openEdit}
                onDelete={handleDeleteTable}
              />
            ))}
          </div>
        )}

        {tables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Invités et affectations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Nom</th>
                      <th className="pb-2 pr-4">RSVP</th>
                      <th className="pb-2 pr-4">Table</th>
                      <th className="pb-2 pr-4">Groupe</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((guest) => (
                      <tr key={guest.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{guest.name}</td>
                        <td className="py-2 pr-4 capitalize">{guest.status}</td>
                        <td className="py-2 pr-4">{getGuestTableLabel(guest)}</td>
                        <td className="py-2 pr-4">{getGuestGroupName(guest) || '—'}</td>
                        <td className="py-2">
                          <Button variant="ghost" size="sm" onClick={() => setAssignGuest(guest)}>
                            Affecter
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={editOpen || addOpen} onOpenChange={(o) => { if (!o) { setEditOpen(false); setAddOpen(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editOpen ? 'Modifier la table' : 'Nouvelle table'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Table 1" />
            </div>
            <div className="space-y-2">
              <Label>Capacité</Label>
              <Input
                type="number"
                min={1}
                value={formCapacity}
                onChange={(e) => setFormCapacity(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <Input type="color" value={formColor} onChange={(e) => setFormColor(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setAddOpen(false); }}>
              Annuler
            </Button>
            <Button onClick={handleSaveTable} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GuestAssignmentModal
        open={!!assignGuest}
        onOpenChange={(o) => !o && setAssignGuest(null)}
        guest={assignGuest}
        tables={tables}
        groups={groups}
        onAssignTable={handleAssignTable}
        onAssignGroup={handleAssignGroup}
      />

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Impression du plan de table</DialogTitle>
          </DialogHeader>
          {overview && (
            <TablePrintPreview
              event={{ title: overview.event.title, coverImage: overview.event.coverImage }}
              tables={tables}
              guests={guests}
              mode="all"
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TablesPage;
