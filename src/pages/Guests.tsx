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
import { Phone } from 'lucide-react';
import { guestsApi, eventsApi, invitationsApi } from '@/services/api';
import {
  formatPhoneInput,
  normalizePhoneToE164,
  getWhatsAppDigits,
} from '@/utils/phoneUtils';
import { logWhatsAppAction } from '@/lib/whatsappLog';
import type { Guest, Event } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import PlanLimitAlert from '@/components/subscription/PlanLimitAlert';
import GuestBillingCard from '@/components/subscription/GuestBillingCard';
import { formatPlanLimit } from '@/config/subscriptionPlans';
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
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  const { toast } = useToast();
  const { canDelete } = usePermissions();
  const { limits, refresh: refreshLimits } = useSubscriptionLimits(eventFilter || undefined);

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
    if (isAddingGuest) return;

    if (!newGuest.name || !newGuest.eventId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir les champs obligatoires (Nom et Événement)',
        variant: 'destructive',
      });
      return;
    }

    let normalizedPhone: string | undefined;
    if (newGuest.phone.trim()) {
      normalizedPhone = normalizePhoneToE164(newGuest.phone);
      if (!normalizedPhone) {
        toast({
          title: 'Erreur',
          description: 'Numéro invalide. Exemple : +243828863897',
          variant: 'destructive',
        });
        return;
      }
    }

    const guestPayload = {
      ...newGuest,
      phone: normalizedPhone || '',
    };

    const checkContactDuplicates = () => {
      return guests.find(g => {
        const sameEmail =
          guestPayload.email &&
          g.email?.toLowerCase() === guestPayload.email.toLowerCase();
        const samePhone =
          normalizedPhone && normalizePhoneToE164(g.phone) === normalizedPhone;
        return sameEmail || samePhone;
      });
    };

    const proceedWithCreation = async () => {
      if (isAddingGuest) return;

      setIsAddingGuest(true);
      try {
        if (limits && limits.canAddGuest === false) {
          toast({
            title: 'Limite atteinte',
            description: `Votre plan autorise ${formatPlanLimit(limits.maxGuests)} invité(s) par événement.`,
            variant: 'destructive',
          });
          return;
        }

        await guestsApi.create(guestPayload.eventId, guestPayload);

        toast({ title: 'Succès', description: 'Invité ajouté avec succès' });
        setIsAddDialogOpen(false);
        setIsDuplicateDialogOpen(false);
        setNewGuest({ name: '', email: '', phone: '', eventId: '', table: '' });

        setEventFilter(guestPayload.eventId);
        const res = await guestsApi.getByEvent(guestPayload.eventId);
        setGuests(res.data);
        refreshLimits();
      } catch (error) {
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : "Impossible d'ajouter l'invité",
          variant: 'destructive',
        });
      } finally {
        setIsAddingGuest(false);
      }
    };

    const duplicate = checkContactDuplicates();
    if (duplicate) {
      const fields: string[] = [];
      if (newGuest.email && duplicate.email?.toLowerCase() === newGuest.email.toLowerCase()) {
        fields.push('email');
      }
      if (normalizedPhone && normalizePhoneToE164(duplicate.phone) === normalizedPhone) {
        fields.push('téléphone');
      }

      setDuplicateMessage(
        `Un invité avec le même ${fields.join(' et ')} existe déjà (${duplicate.name}). Voulez-vous quand même l'ajouter ?`
      );
      setIsDuplicateDialogOpen(true);
      return;
    }

    await proceedWithCreation();
  };

  const handleForceAddDuplicate = async () => {
    if (isAddingGuest || !newGuest.name || !newGuest.eventId) return;

    let normalizedPhone: string | undefined;
    if (newGuest.phone.trim()) {
      normalizedPhone = normalizePhoneToE164(newGuest.phone);
      if (!normalizedPhone) {
        toast({
          title: 'Erreur',
          description: 'Numéro invalide. Exemple : +243828863897',
          variant: 'destructive',
        });
        return;
      }
    }

    const guestPayload = {
      ...newGuest,
      email: newGuest.email.trim(),
      phone: normalizedPhone || '',
    };

    setIsAddingGuest(true);
    try {
      if (limits && limits.canAddGuest === false) {
        toast({
          title: 'Limite atteinte',
          description: `Votre plan autorise ${formatPlanLimit(limits.maxGuests)} invité(s) par événement.`,
          variant: 'destructive',
        });
        return;
      }

      await guestsApi.create(guestPayload.eventId, guestPayload);
      toast({ title: 'Succès', description: 'Invité ajouté avec succès' });
      setIsAddDialogOpen(false);
      setIsDuplicateDialogOpen(false);
      setNewGuest({ name: '', email: '', phone: '', eventId: '', table: '' });
      setEventFilter(guestPayload.eventId);
      const res = await guestsApi.getByEvent(guestPayload.eventId);
      setGuests(res.data);
      refreshLimits();
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter l'invité",
        variant: 'destructive',
      });
    } finally {
      setIsAddingGuest(false);
    }
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
    const guest = guests.find(g => g.id === guestId);
    const eventId = guest?.eventId || eventFilter;
    const event = events.find(e => e.id === eventId);

    if (!eventId || !guest) {
      toast({
        title: 'Erreur',
        description: 'Événement introuvable pour cet invité',
        variant: 'destructive',
      });
      return;
    }

    if (method === 'whatsapp') {
      if (!guest.phone) {
        toast({
          title: 'Erreur',
          description: `${guest.name} n'a pas de numéro WhatsApp`,
          variant: 'destructive',
        });
        return;
      }

      const rsvpLink = `${window.location.origin}/rsvp/${eventId}/${guest.id}`;
      const message = encodeURIComponent(
        `✨ *${(event?.title || 'Événement').toUpperCase()}* ✨\n\n` +
        (event?.date ? `📅 *Date:* ${new Date(event.date).toLocaleDateString('fr-FR')}\n` : '') +
        (event?.location ? `📍 *Lieu:* ${event.location}\n\n` : '\n') +
        `Bonjour *${guest.name}*,\n\n` +
        `Vous êtes cordialement invité(e). Confirmez votre présence :\n${rsvpLink}\n\n` +
        `_HK Events_`
      );

      window.open(`https://wa.me/${getWhatsAppDigits(guest.phone)}?text=${message}`, '_blank');

      try {
        await invitationsApi.send(guestId, eventId, 'whatsapp');
        logWhatsAppAction(eventId, guest.id, guest.name, 'sent');
        toast({ title: 'WhatsApp ouvert', description: `Discussion avec ${guest.name}` });
      } catch {
        toast({
          title: 'Erreur',
          description: "Impossible d'enregistrer l'envoi WhatsApp",
          variant: 'destructive',
        });
      }
      return;
    }

    try {
      await invitationsApi.send(guestId, eventId, method);
      toast({ title: 'Succès', description: `Invitation envoyée par ${method}` });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer l'invitation",
        variant: 'destructive',
      });
    }
  };

  const handleBulkWhatsApp = async (guestIds: string[]) => {
    const event = events.find(e => e.id === eventFilter);
    if (!eventFilter || !event) {
      toast({
        title: 'Erreur',
        description: 'Sélectionnez un événement',
        variant: 'destructive',
      });
      return;
    }

    const selected = guests.filter(g => guestIds.includes(g.id));
    const withPhone = selected.filter(g => g.phone);

    if (withPhone.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Aucun invité sélectionné n\'a de numéro WhatsApp',
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < withPhone.length; i++) {
      const guest = withPhone[i];
      const rsvpLink = `${window.location.origin}/rsvp/${eventFilter}/${guest.id}`;
      const message = encodeURIComponent(
        `✨ *${event.title.toUpperCase()}* ✨\n\n` +
        `📅 *Date:* ${new Date(event.date).toLocaleDateString('fr-FR')}\n` +
        `📍 *Lieu:* ${event.location}\n\n` +
        `Bonjour *${guest.name}*,\n\n` +
        `Vous êtes cordialement invité(e). Confirmez votre présence :\n${rsvpLink}\n\n` +
        `_HK Events_`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${getWhatsAppDigits(guest.phone)}?text=${message}`, '_blank');
      }, i * 400);

      try {
        await invitationsApi.send(guest.id, eventFilter, 'whatsapp');
        logWhatsAppAction(eventFilter, guest.id, guest.name, 'sent');
      } catch {
        // continue with next guest
      }
    }

    toast({
      title: 'WhatsApp ouvert',
      description:
        selected.length > withPhone.length
          ? `${withPhone.length} conversation(s) ouverte(s). ${selected.length - withPhone.length} sans numéro ignoré(s).`
          : `${withPhone.length} conversation(s) WhatsApp ouverte(s).`,
    });
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
              <PermissionButton
                module="guests"
                action="create"
                disabled={limits?.canAddGuest === false}
              >
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
                <div className="space-y-2">
                  <Label>Téléphone (WhatsApp)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <div className="absolute left-9 top-1/2 -translate-y-1/2 h-5 border-r border-border pr-2 flex items-center z-10">
                      <span className="text-sm text-muted-foreground font-medium">+243</span>
                    </div>
                    <Input
                      className="pl-24"
                      type="tel"
                      placeholder="828863897"
                      value={newGuest.phone}
                      onChange={e =>
                        setNewGuest({
                          ...newGuest,
                          phone: formatPhoneInput(e.target.value),
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enregistré au format +243828863897 pour WhatsApp
                  </p>
                </div>
                <Input
                  placeholder="Numéro de table (Optionnel)"
                  value={newGuest.table}
                  onChange={e => setNewGuest({ ...newGuest, table: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddGuest}
                  disabled={limits?.canAddGuest === false || isAddingGuest}
                >
                  {isAddingGuest ? 'Ajout en cours…' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {limits?.billing && (
          <GuestBillingCard
            billing={eventFilter && limits.eventBilling ? limits.eventBilling : limits.billing}
            pricePerGuestFc={limits.pricePerGuestFc}
            compact={!eventFilter}
          />
        )}

        {limits && limits.canAddGuest === false && eventFilter && (
          <PlanLimitAlert
            title="Limite d'invités atteinte"
            description={
              limits.planLimitsBypass
                ? 'Déblocage actif — actualisez la page si le bouton reste grisé.'
                : `Votre plan ${limits.plan} autorise ${formatPlanLimit(limits.maxGuests)} invité(s) par événement (${limits.guestCount ?? guests.length} utilisés).`
            }
            bypassed={limits.planLimitsBypass}
          />
        )}

        {/* TABLE */}
        {loading ? (
          <div className="h-40 flex items-center justify-center">Chargement...</div>
        ) : (
          <GuestTable
            guests={filteredGuests}
            onDelete={handleDelete}
            onSendInvitation={handleSendInvitation}
            onSendBulkWhatsApp={handleBulkWhatsApp}
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
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)} disabled={isAddingGuest}>
              Annuler
            </Button>
            <Button onClick={handleForceAddDuplicate} disabled={isAddingGuest}>
              {isAddingGuest ? 'Ajout en cours…' : 'Ajouter quand même'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Guests;
