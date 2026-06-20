import { useEffect, useState } from 'react';
import { Send, Mail, Smartphone, CheckCircle, Palette, PenLine, History } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { guestsApi, eventsApi, invitationsApi } from '@/services/api';
import type { Guest, Event, DistributionMethod } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import EmailComposer from '@/components/invitations/EmailComposer';
import EmailHistory from '@/components/invitations/EmailHistory';
import WhatsAppLog from '@/components/invitations/WhatsAppLog';
import WhatsAppBulkDialog from '@/components/invitations/WhatsAppBulkDialog';
import { logWhatsAppAction } from '@/lib/whatsappLog';
import {
  buildDefaultInviteMessage,
  guestHasPhone,
  openWhatsAppInvite,
} from '@/utils/whatsappInvite';

const distributionMethods = [
  { id: 'email' as DistributionMethod, name: 'Email', icon: Mail, description: 'Envoyer par email' },
  { id: 'whatsapp' as DistributionMethod, name: 'WhatsApp', description: 'Envoyer via WhatsApp', whatsApp: true as const },
  { id: 'sms' as DistributionMethod, name: 'SMS', icon: Smartphone, description: 'Envoyer par SMS' },
];

const Invitations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<DistributionMethod>('email');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [whatsappBulkOpen, setWhatsappBulkOpen] = useState(false);
  const [whatsappBulkGuests, setWhatsappBulkGuests] = useState<Guest[]>([]);
  const [guestFilter, setGuestFilter] = useState<'all' | 'uninvited'>('all');

  // 🔹 Charger les événements
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventsApi.getAll();
        setEvents(res.data);
        if (res.data.length > 0) {
          setSelectedEvent(res.data[0]._id || res.data[0].id);
        }
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de charger les événements', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [toast]);

  // 🔹 Charger les invités
  useEffect(() => {
    if (!selectedEvent) return;

    const fetchGuests = async () => {
      try {
        const res = await guestsApi.getByEvent(selectedEvent);
        setGuests(res.data);
        setSelectedGuests([]);
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de charger les invités', variant: 'destructive' });
      }
    };

    fetchGuests();
  }, [selectedEvent, toast]);

  // 🔹 Rafraîchir la liste des invités
  const refreshGuests = async () => {
    if (!selectedEvent) return;
    try {
      const res = await guestsApi.getByEvent(selectedEvent);
      setGuests(res.data);
    } catch {
      // Erreur silencieuse pour le rafraîchissement
    }
  };

  const uninvitedGuests = guests.filter(
    g => !g.status || g.status === 'invited'
  );

  const visibleGuests = guestFilter === 'all' ? guests : uninvitedGuests;

  const toggleGuest = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const toggleAll = () => {
    const visibleIds = visibleGuests.map(g => g.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedGuests.includes(id));
    if (allSelected) {
      setSelectedGuests(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedGuests(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const startWhatsAppSend = async (guestsToSend: Guest[]) => {
    const event = events.find(e => (e._id || e.id) === selectedEvent);
    if (!event || guestsToSend.length === 0) return;

    const withPhone = guestsToSend.filter(guestHasPhone);
    const withoutPhone = guestsToSend.length - withPhone.length;

    if (withPhone.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Aucun invité sélectionné n\'a de numéro WhatsApp',
        variant: 'destructive',
      });
      return;
    }

    if (withPhone.length === 1) {
      const guest = withPhone[0];
      openWhatsAppInvite(guest.phone!, buildDefaultInviteMessage(guest, event, selectedEvent));

      try {
        await invitationsApi.send(guest.id, selectedEvent, 'whatsapp');
        logWhatsAppAction(selectedEvent, guest.id, guest.name, 'sent');
      } catch (error) {
        console.error(error);
      }

      toast({
        title: 'WhatsApp ouvert',
        description: withoutPhone > 0
          ? `Discussion avec ${guest.name}. ${withoutPhone} invité(s) sans numéro ignoré(s).`
          : `Discussion avec ${guest.name}`,
      });
      setSelectedGuests([]);
      refreshGuests();
      return;
    }

    setWhatsappBulkGuests(guestsToSend);
    setWhatsappBulkOpen(true);
  };

  const handleSendInvitations = async () => {
    if (selectedGuests.length === 0) {
      toast({ title: 'Erreur', description: 'Sélectionnez au moins un invité', variant: 'destructive' });
      return;
    }

    const selectedGuestObjects = guests.filter(g => selectedGuests.includes(g.id));

    // Email → ouvrir le compositeur pour personnaliser le template
    if (selectedMethod === 'email') {
      setShowEmailComposer(true);
      return;
    }

    setSending(true);
    try {
      if (selectedMethod === 'whatsapp') {
        await startWhatsAppSend(selectedGuestObjects);
        return;
      } else if (selectedMethod === 'sms') {
        await invitationsApi.sendBulk(selectedGuests, selectedEvent, 'sms');
      }

      toast({
        title: 'Succès',
        description: `${selectedGuests.length} invitation(s) envoyée(s) par SMS`,
      });
      
      setSelectedGuests([]);
      await refreshGuests();
    } catch {
      toast({ title: 'Erreur', description: 'Échec de l\'envoi', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invitations</h1>
            <p className="text-muted-foreground">
              Envoyez vos invitations par Email, WhatsApp ou SMS
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choisir un événement" />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => {
                  const eventId = event._id || event.id;
                  return (
                  <SelectItem key={eventId} value={eventId}>
                    {event.title}
                  </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => navigate(`/invitations/templates?eventId=${selectedEvent}`)}
            >
              <Palette className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>

        {/* Tabs for Send / History */}
        <Tabs defaultValue="send" className="w-full">
          <TabsList>
            <TabsTrigger value="send">
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="whatsapp-log">
              <WhatsAppIcon className="h-4 w-4 mr-2 text-green-600" />
              Journal WhatsApp
            </TabsTrigger>
          </TabsList>

          {/* Send Tab */}
          <TabsContent value="send">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">

                {/* Guests */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invités à contacter</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={
                              visibleGuests.length > 0 &&
                              visibleGuests.every(g => selectedGuests.includes(g.id))
                            }
                            onCheckedChange={toggleAll}
                          />
                          <span className="text-sm text-muted-foreground">
                            Tout sélectionner ({visibleGuests.length})
                          </span>
                        </div>
                        <Select value={guestFilter} onValueChange={(v: 'all' | 'uninvited') => setGuestFilter(v)}>
                          <SelectTrigger className="w-44 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les invités</SelectItem>
                            <SelectItem value="uninvited">À inviter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {visibleGuests.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="font-semibold">Aucun invité dans cette liste</p>
                        </div>
                      ) : (
                        visibleGuests.map(guest => (
                          <div
                            key={guest.id}
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-primary/50',
                              selectedGuests.includes(guest.id)
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border'
                            )}
                          >
                            <Checkbox 
                              checked={selectedGuests.includes(guest.id)} 
                              onCheckedChange={() => toggleGuest(guest.id)}
                            />
                            <div className="flex-1 cursor-pointer" onClick={() => toggleGuest(guest.id)}>
                              <p className="font-medium">{guest.name}</p>
                              <div className="flex items-center gap-3">
                                <p className="text-sm text-muted-foreground">{guest.email}</p>
                                {guest.phone && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Smartphone className="h-3 w-3" />
                                    {guest.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {guest.phone && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Envoyer WhatsApp directement"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startWhatsAppSend([guest]);
                                  }}
                                >
                                  <WhatsAppIcon className="h-4 w-4" />
                                </Button>
                              )}
                              <Badge variant="outline">
                                {guest.status === 'confirmed'
                                  ? 'Confirmé'
                                  : guest.status === 'declined'
                                    ? 'Décliné'
                                    : guest.status === 'pending'
                                      ? 'En attente'
                                      : 'À inviter'}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Send panel */}
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Méthode d'envoi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {distributionMethods.map(method => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border cursor-pointer',
                          selectedMethod === method.id && 'border-primary bg-primary/5'
                        )}
                      >
                        {'whatsApp' in method && method.whatsApp ? (
                          <WhatsAppIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          method.icon && <method.icon className="h-5 w-5" />
                        )}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    ))}

                    <Button
                      className="w-full"
                      disabled={sending || selectedGuests.length === 0}
                      onClick={handleSendInvitations}
                    >
                      {selectedMethod === 'email' ? (
                        <>
                          <PenLine className="h-4 w-4 mr-2" />
                          Composer & Envoyer ({selectedGuests.length})
                        </>
                      ) : selectedMethod === 'whatsapp' ? (
                        <>
                          <WhatsAppIcon className="h-4 w-4 mr-2" />
                          {sending ? 'Envoi...' : `Envoyer (${selectedGuests.length})`}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {sending ? 'Envoi...' : `Envoyer (${selectedGuests.length})`}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <EmailHistory eventId={selectedEvent || undefined} />
          </TabsContent>

          {/* WhatsApp Log Tab */}
          <TabsContent value="whatsapp-log">
            <WhatsAppLog eventId={selectedEvent || undefined} />
          </TabsContent>
        </Tabs>

        {/* Email Composer Modal */}
        <EmailComposer
          open={showEmailComposer}
          onClose={() => setShowEmailComposer(false)}
          selectedGuests={guests.filter(g => selectedGuests.includes(g.id))}
          event={events.find(e => (e._id || e.id) === selectedEvent) || null}
          onSuccess={() => {
            setSelectedGuests([]);
            refreshGuests();
          }}
        />

        <WhatsAppBulkDialog
          open={whatsappBulkOpen}
          onClose={() => setWhatsappBulkOpen(false)}
          guests={whatsappBulkGuests}
          event={events.find(e => (e._id || e.id) === selectedEvent) || null}
          eventId={selectedEvent}
          onComplete={() => {
            setSelectedGuests([]);
            setWhatsappBulkOpen(false);
            refreshGuests();
          }}
        />

      </div>
    </DashboardLayout>
  );
};

export default Invitations;
