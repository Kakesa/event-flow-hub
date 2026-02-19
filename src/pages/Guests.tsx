import { useEffect, useState } from 'react';
import { Plus, Search, Download, Filter, FileSpreadsheet, Upload } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GuestTable from '@/components/guests/GuestTable';
import QRCodeModal from '@/components/guests/QRCodeModal';
import GuestImportModal from '@/components/guests/GuestImportModal';
import PermissionButton from '@/components/common/PermissionButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { guestsApi, eventsApi, invitationsApi } from '@/services/api';
import type { Guest, Event } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { exportGuestsToCSV, exportGuestsToExcel } from '@/utils/exportUtils';

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState<string>('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    eventId: '',
    table: '',
  });

  const [selectedGuestForQR, setSelectedGuestForQR] = useState<Guest | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  const { toast } = useToast();
  const { canDelete } = usePermissions();

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    const init = async () => {
      try {
        const eventsRes = await eventsApi.getAll();
        setEvents(eventsRes.data);

        if (eventsRes.data.length > 0) {
          const firstEventId = eventsRes.data[0].id;
          setEventFilter(firstEventId);

          const guestsRes = await guestsApi.getByEvent(firstEventId);
          setGuests(guestsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* =========================
     LOAD GUESTS BY EVENT
  ========================= */
  useEffect(() => {
    if (!eventFilter) return;

    const loadGuests = async () => {
      try {
        setLoading(true);
        const res = await guestsApi.getByEvent(eventFilter);
        setGuests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGuests();
  }, [eventFilter]);

  /* =========================
     FILTERS
  ========================= */
  const filteredGuests = guests.filter(guest => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* =========================
     ACTIONS
  ========================= */
  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.eventId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir les champs obligatoires (Nom et Événement)',
        variant: 'destructive',
      });
      return;
    }

    const checkDuplicates = () => {
      return guests.find(g => 
        g.name.toLowerCase() === newGuest.name.toLowerCase() ||
        (newGuest.email && g.email?.toLowerCase() === newGuest.email.toLowerCase()) ||
        (newGuest.phone && g.phone === newGuest.phone)
      );
    };

    const proceedWithCreation = async () => {
      try {
        await guestsApi.create(newGuest.eventId, newGuest);

        toast({ title: 'Succès', description: 'Invité ajouté avec succès' });
        setIsAddDialogOpen(false);
        setIsDuplicateDialogOpen(false);
        setNewGuest({ name: '', email: '', phone: '', eventId: '', table: '' });

        setEventFilter(newGuest.eventId);
        const res = await guestsApi.getByEvent(newGuest.eventId);
        setGuests(res.data);
      } catch {
        toast({
          title: 'Erreur',
          description: "Impossible d'ajouter l'invité",
          variant: 'destructive',
        });
      }
    };

    const duplicate = checkDuplicates();
    if (duplicate) {
      const fields = [];
      if (duplicate.name.toLowerCase() === newGuest.name.toLowerCase()) fields.push('nom');
      if (newGuest.email && duplicate.email?.toLowerCase() === newGuest.email.toLowerCase()) fields.push('email');
      if (newGuest.phone && duplicate.phone === newGuest.phone) fields.push('téléphone');
      
      setDuplicateMessage(`Un invité avec le même ${fields.join(', ')} a déjà été invité. Voulez-vous quand même l'ajouter ?`);
      setIsDuplicateDialogOpen(true);
      return;
    }

    await proceedWithCreation();
  };

  const handleDelete = async (guestId: string) => {
    if (!canDelete('guests')) {
      toast({
        title: 'Erreur',
        description: "Vous n'avez pas la permission",
        variant: 'destructive',
      });
      return;
    }

    try {
      await guestsApi.delete(guestId);
      setGuests(prev => prev.filter(g => g.id !== guestId));
      toast({ title: 'Succès', description: 'Invité supprimé' });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'invité",
        variant: 'destructive',
      });
    }
  };

  const handleSendInvitation = async (
    guestId: string,
    method: 'email' | 'whatsapp' | 'sms'
  ) => {
    try {
      await invitationsApi.send(guestId, method);
      toast({ title: 'Succès', description: `Invitation envoyée par ${method}` });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer l'invitation",
        variant: 'destructive',
      });
    }
  };

  /* =========================
     EXPORT
  ========================= */
  const handleExportCSV = () => {
    const event = events.find(e => e.id === eventFilter);
    exportGuestsToCSV(filteredGuests, events, `invites-${event?.title || 'event'}`);
  };

  const handleExportExcel = () => {
    const event = events.find(e => e.id === eventFilter);
    exportGuestsToExcel(filteredGuests, events, `invites-${event?.title || 'event'}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Invités</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <PermissionButton module="guests" action="create">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </PermissionButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un invité</DialogTitle>
                <DialogDescription>Informations de l'invité</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <Select
                  value={newGuest.eventId}
                  onValueChange={v => setNewGuest({ ...newGuest, eventId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Événement" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Nom"
                  value={newGuest.name}
                  onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  value={newGuest.email}
                  onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
                />
                <Input
                  placeholder="Téléphone"
                  value={newGuest.phone}
                  onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                />
                <Input
                  placeholder="Numéro de table (Optionnel)"
                  value={newGuest.table}
                  onChange={e => setNewGuest({ ...newGuest, table: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button onClick={handleAddGuest}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="h-40 flex items-center justify-center">Chargement...</div>
        ) : (
          <GuestTable
            guests={filteredGuests}
            onDelete={handleDelete}
            onSendInvitation={handleSendInvitation}
            onGenerateQR={g =>
              setSelectedGuestForQR(guests.find(x => x.id === g) || null)
            }
          />
        )}
      </div>

      <QRCodeModal
        guest={selectedGuestForQR}
        open={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      <GuestImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        eventId={eventFilter}
        onImportComplete={g => setGuests(prev => [...g, ...prev])}
      />

      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doublon détecté</DialogTitle>
            <DialogDescription>
              {duplicateMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>Annuler</Button>
            <Button onClick={async () => {
              // On définit une petite fonction anonyme pour appeler manageGuestCreation directement
              // mais handleAddGuest est asynchrone, on peut juste l'extraire.
              // Refactoré handleAddGuest pour extraire proceedWithCreation
              try {
                await guestsApi.create(newGuest.eventId, newGuest);
                toast({ title: 'Succès', description: 'Invité ajouté avec succès' });
                setIsAddDialogOpen(false);
                setIsDuplicateDialogOpen(false);
                setNewGuest({ name: '', email: '', phone: '', eventId: '', table: '' });
                const res = await guestsApi.getByEvent(newGuest.eventId);
                setGuests(res.data);
              } catch {
                toast({ title: 'Erreur', description: "Impossible d'ajouter l'invité", variant: 'destructive' });
              }
            }}>Ajouter quand même</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Guests;
