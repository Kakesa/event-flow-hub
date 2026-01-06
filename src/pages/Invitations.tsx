import { useEffect, useState } from 'react';
import { Send, Mail, MessageSquare, Smartphone, CheckCircle, Palette, PenLine } from 'lucide-react';
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

import { guestsApi, eventsApi, invitationsApi } from '@/services/api';
import type { Guest, Event, DistributionMethod } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import EmailComposer from '@/components/invitations/EmailComposer';

const distributionMethods = [
  { id: 'email' as DistributionMethod, name: 'Email', icon: Mail, description: 'Envoyer par email' },
  { id: 'whatsapp' as DistributionMethod, name: 'WhatsApp', icon: MessageSquare, description: 'Envoyer via WhatsApp' },
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

  // 🔹 Charger les événements
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventsApi.getAll();
        setEvents(res.data);
        if (res.data.length > 0) {
          setSelectedEvent(res.data[0].id);
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

  const uninvitedGuests = guests.filter(
    g => !g.status || g.status === 'invited'
  );

  const toggleGuest = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const toggleAll = () => {
    if (selectedGuests.length === uninvitedGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(uninvitedGuests.map(g => g.id));
    }
  };

  const handleSendInvitations = async () => {
    if (selectedGuests.length === 0) {
      toast({ title: 'Erreur', description: 'Sélectionnez au moins un invité', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      await invitationsApi.sendBulk(selectedGuests, selectedMethod);
      toast({
        title: 'Succès',
        description: `${selectedGuests.length} invitation(s) envoyée(s)`,
      });
      setSelectedGuests([]);
    } catch {
      toast({ title: 'Erreur', description: 'Échec de l’envoi', variant: 'destructive' });
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
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
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

        {/* Content */}
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
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      checked={selectedGuests.length === uninvitedGuests.length && uninvitedGuests.length > 0}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-sm text-muted-foreground">Tout sélectionner</span>
                  </div>

                  {uninvitedGuests.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                      <p className="font-semibold">Tous les invités ont été contactés</p>
                    </div>
                  ) : (
                    uninvitedGuests.map(guest => (
                      <div
                        key={guest.id}
                        onClick={() => toggleGuest(guest.id)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border cursor-pointer',
                          selectedGuests.includes(guest.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        )}
                      >
                        <Checkbox checked={selectedGuests.includes(guest.id)} />
                        <div className="flex-1">
                          <p className="font-medium">{guest.name}</p>
                          <p className="text-sm text-muted-foreground">{guest.email}</p>
                        </div>
                        <Badge variant="outline">À inviter</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Send panel */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Méthode d’envoi</CardTitle>
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
                    <method.icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                ))}

                {/* Bouton Composer Email (si méthode email) */}
                {selectedMethod === 'email' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={selectedGuests.length === 0}
                    onClick={() => setShowEmailComposer(true)}
                  >
                    <PenLine className="h-4 w-4 mr-2" />
                    Composer l'email
                  </Button>
                )}

                <Button
                  className="w-full"
                  disabled={sending || selectedGuests.length === 0}
                  onClick={handleSendInvitations}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoi rapide ({selectedGuests.length})
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Composer Modal */}
        <EmailComposer
          open={showEmailComposer}
          onClose={() => setShowEmailComposer(false)}
          selectedGuests={guests.filter(g => selectedGuests.includes(g.id))}
          event={events.find(e => e.id === selectedEvent) || null}
          onSuccess={() => {
            setSelectedGuests([]);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Invitations;
