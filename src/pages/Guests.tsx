import { useEffect, useState } from 'react';
import { Plus, Search, Download, Send, Filter } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GuestTable from '@/components/guests/GuestTable';
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
import { Label } from '@/components/ui/label';
import { guestsApi, eventsApi, invitationsApi, qrCodeApi } from '@/services/api';
import type { Guest, Event } from '@/types/models';
import { useToast } from '@/hooks/use-toast';

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', eventId: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [guestsRes, eventsRes] = await Promise.all([
        guestsApi.getAll(),
        eventsApi.getAll(),
      ]);
      setGuests(guestsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || guest.eventId === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.email || !newGuest.eventId) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }
    try {
      await guestsApi.create(newGuest.eventId, newGuest);
      toast({ title: 'Succès', description: 'Invité ajouté avec succès' });
      setIsAddDialogOpen(false);
      setNewGuest({ name: '', email: '', phone: '', eventId: '' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'invité', variant: 'destructive' });
    }
  };

  const handleSendInvitation = async (guestId: string, method: 'email' | 'whatsapp' | 'sms') => {
    try {
      await invitationsApi.send(guestId, method);
      toast({ title: 'Succès', description: `Invitation envoyée par ${method}` });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer l\'invitation', variant: 'destructive' });
    }
  };

  const handleGenerateQR = async (guestId: string) => {
    try {
      const result = await qrCodeApi.generate(guestId);
      toast({ title: 'QR Code généré', description: 'Le QR code a été créé avec succès' });
      // On pourrait ouvrir un modal avec le QR code ici
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de générer le QR code', variant: 'destructive' });
    }
  };

  const handleDelete = async (guestId: string) => {
    try {
      await guestsApi.delete(guestId);
      toast({ title: 'Succès', description: 'Invité supprimé' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'invité', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Invités</h1>
            <p className="text-muted-foreground mt-1">
              {filteredGuests.length} invités au total
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-gold">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un invité
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un invité</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de votre nouvel invité
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event">Événement *</Label>
                    <Select
                      value={newGuest.eventId}
                      onValueChange={(value) => setNewGuest({ ...newGuest, eventId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un événement" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                      placeholder="jean@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddGuest}>Ajouter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un invité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Événement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="invited">Invités</SelectItem>
              <SelectItem value="confirmed">Confirmés</SelectItem>
              <SelectItem value="declined">Déclinés</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <GuestTable
            guests={filteredGuests}
            onSendInvitation={handleSendInvitation}
            onDelete={handleDelete}
            onGenerateQR={handleGenerateQR}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Guests;
