import { useEffect, useState } from 'react';
import { Download, MessageSquare, Heart } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { guestbookApi, eventsApi } from '@/services/api';
import type { GuestbookMessage, Event } from '@/types/models';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const Guestbook = () => {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loading, setLoading] = useState(true);
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
      fetchMessages();
    }
  }, [selectedEvent]);

  const fetchMessages = async () => {
    try {
      const res = await guestbookApi.getByEvent(selectedEvent);
      setMessages(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await guestbookApi.download(selectedEvent);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `livre-dor-${selectedEvent}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Succès', description: 'Livre d\'or téléchargé' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de télécharger', variant: 'destructive' });
    }
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Livre d'or</h1>
            <p className="text-muted-foreground mt-1">
              Les messages de vos invités
            </p>
          </div>
          <div className="flex gap-2">
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
            <Button onClick={handleDownload} disabled={messages.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>

        {/* Event info */}
        {selectedEventData && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl overflow-hidden">
                  <img
                    src={selectedEventData.coverImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200'}
                    alt={selectedEventData.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">{selectedEventData.title}</h2>
                  <p className="text-muted-foreground">
                    {format(parseISO(selectedEventData.date), 'd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-primary">{messages.length}</p>
                  <p className="text-sm text-muted-foreground">messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : messages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {messages.map((message, index) => (
              <Card
                key={message.id}
                className="overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {message.guestName?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{message.guestName || 'Anonyme'}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(message.createdAt), 'd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground leading-relaxed">
                        "{message.message}"
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-primary">
                        <Heart className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">Aucun message</h3>
            <p className="text-muted-foreground mt-1">
              Les messages de vos invités apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Guestbook;
