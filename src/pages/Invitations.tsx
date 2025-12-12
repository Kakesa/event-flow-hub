import { useEffect, useState } from 'react';
import { Send, Mail, MessageSquare, Smartphone, CheckCircle } from 'lucide-react';
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

const distributionMethods = [
  { id: 'email' as DistributionMethod, name: 'Email', icon: Mail, description: 'Envoyer par email' },
  { id: 'whatsapp' as DistributionMethod, name: 'WhatsApp', icon: MessageSquare, description: 'Envoyer via WhatsApp' },
  { id: 'sms' as DistributionMethod, name: 'SMS', icon: Smartphone, description: 'Envoyer par SMS' },
];

const Invitations = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<DistributionMethod>('email');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRes = await eventsApi.getAll();
        setEvents(eventsRes.data);
        if (eventsRes.data.length > 0) {
          setSelectedEvent(eventsRes.data[0].id);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchGuests();
    }
  }, [selectedEvent]);

  const fetchGuests = async () => {
    try {
      const res = await guestsApi.getByEvent(selectedEvent);
      setGuests(res.data);
      setSelectedGuests([]);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const uninvitedGuests = guests.filter(g => g.status === 'invited' || !g.status);

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
        description: `${selectedGuests.length} invitation(s) envoyée(s) par ${selectedMethod}`,
      });
      setSelectedGuests([]);
      fetchGuests();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer les invitations', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Invitations</h1>
            <p className="text-muted-foreground mt-1">
              Envoyez vos invitations par email, WhatsApp ou SMS
            </p>
          </div>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-64">
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Guests list */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Invités à contacter</CardTitle>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedGuests.length === uninvitedGuests.length && uninvitedGuests.length > 0}
                        onCheckedChange={toggleAll}
                      />
                      <span className="text-sm text-muted-foreground">Tout sélectionner</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {uninvitedGuests.length > 0 ? (
                    uninvitedGuests.map((guest, index) => (
                      <div
                        key={guest.id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer animate-fade-in',
                          selectedGuests.includes(guest.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => toggleGuest(guest.id)}
                      >
                        <Checkbox
                          checked={selectedGuests.includes(guest.id)}
                          onCheckedChange={() => toggleGuest(guest.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{guest.fullName}</p>
                          <p className="text-sm text-muted-foreground truncate">{guest.email}</p>
                        </div>
                        <Badge variant="outline">À inviter</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="h-12 w-12 text-success mb-4" />
                      <h3 className="font-display text-lg font-semibold">Tous les invités ont été contactés</h3>
                      <p className="text-muted-foreground mt-1">
                        Ajoutez de nouveaux invités pour envoyer des invitations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Send panel */}
            <div className="space-y-4">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Méthode d'envoi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {distributionMethods.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                        selectedMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedGuests.length} invité(s) sélectionné(s)
                    </p>
                    <Button
                      className="w-full shadow-gold"
                      size="lg"
                      disabled={selectedGuests.length === 0 || sending}
                      onClick={handleSendInvitations}
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Envoyer les invitations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Invitations;
