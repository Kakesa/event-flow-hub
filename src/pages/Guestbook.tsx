import { useEffect, useState, useRef, useCallback } from 'react';
import { Download, MessageSquare, Heart, Send, Bell, BellOff } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useAuth } from '@/contexts/AuthContext';

const Guestbook = () => {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsRes = await eventsApi.getAll();
        setEvents(eventsRes.data);
        if (eventsRes.data.length > 0) {
          setSelectedEvent(eventsRes.data[0]._id || eventsRes.data[0].id);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const fetchMessages = useCallback(async (showNotification = false) => {
    if (!selectedEvent) return;
    try {
      setLoading(true);
      const res = await guestbookApi.getByEvent(selectedEvent);
      const newMessages = res.data || [];

      if (showNotification && notificationsEnabled && previousMessageCountRef.current > 0) {
        const diff = newMessages.length - previousMessageCountRef.current;
        if (diff > 0) {
          setNewMessageCount(prev => prev + diff);
          const latestNew = newMessages[newMessages.length - 1];
          toast({
            title: '💬 Nouveau message !',
            description: `${latestNew?.name || 'Un invité'} a laissé un message dans le livre d'or.`,
          });
        }
      }

      previousMessageCountRef.current = newMessages.length;
      setMessages(newMessages);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedEvent, notificationsEnabled, toast]);

  useEffect(() => {
    if (selectedEvent) {
      fetchMessages(false);
    }
  }, [selectedEvent, fetchMessages]);

  // Polling toutes les 10 secondes
  useEffect(() => {
    if (!selectedEvent) return;
    const interval = setInterval(() => fetchMessages(true), 10000);
    return () => clearInterval(interval);
  }, [selectedEvent, fetchMessages]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de télécharger', variant: 'destructive' });
    }
  };

  const handleReply = async (msg: GuestbookMessage) => {
    if (!replyText.trim()) return;
    try {
      await guestbookApi.reply(msg.eventId, msg.id, replyText.trim());
      setMessages(prev =>
        prev.map(m => m.id === msg.id ? { ...m, reply: replyText.trim(), repliedAt: new Date().toISOString() } : m)
      );
      setReplyingTo(null);
      setReplyText('');
      toast({ title: 'Réponse envoyée' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la réponse.', variant: 'destructive' });
    }
  };

  const selectedEventData = events.find(e => (e._id || e.id) === selectedEvent);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
                Messages
                {newMessageCount > 0 && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    {newMessageCount} nouveau{newMessageCount > 1 ? 'x' : ''}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-1">
                Conversations avec vos invités en temps réel
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
            </Button>
            <Select value={selectedEvent} onValueChange={(val) => { setSelectedEvent(val); setNewMessageCount(0); }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Sélectionner un événement" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event._id || event.id} value={event._id || event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleDownload} disabled={messages.length === 0}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Event info bar */}
        {selectedEventData && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/5 border border-primary/10 mb-4">
            <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0">
              <img
                src={selectedEventData.coverImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200'}
                alt={selectedEventData.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedEventData.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(selectedEventData.date), 'd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <Badge variant="secondary">{messages.length} message{messages.length !== 1 ? 's' : ''}</Badge>
          </div>
        )}

        {/* Chat area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : messages.length > 0 ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 pb-2">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {/* Message de l'invité (gauche) */}
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                        {message.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.name || 'Anonyme'}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(message.createdAt), 'd MMM yyyy · HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                          <p className="text-sm leading-relaxed">{message.message}</p>
                        </div>

                        {/* Bouton répondre */}
                        {!message.reply && replyingTo !== message.id && (
                          <button
                            onClick={() => { setReplyingTo(message.id); setReplyText(''); }}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 ml-2 transition-colors"
                          >
                            Répondre
                          </button>
                        )}

                        {/* Input de réponse inline */}
                        {replyingTo === message.id && (
                          <div className="flex gap-2 mt-2 ml-2">
                            <Input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Écrire une réponse..."
                              className="h-8 text-sm rounded-full"
                              onKeyDown={(e) => e.key === 'Enter' && handleReply(message)}
                              autoFocus
                            />
                            <Button size="sm" className="h-8 rounded-full px-3" onClick={() => handleReply(message)}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Réponse de l'organisateur (droite) */}
                    {message.reply && (
                      <div className="flex items-start gap-3 max-w-[85%] ml-auto flex-row-reverse">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {user?.name?.charAt(0) || 'O'}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1 justify-end">
                            <span className="text-xs text-muted-foreground">
                              {message.repliedAt && format(parseISO(message.repliedAt), 'd MMM · HH:mm', { locale: fr })}
                            </span>
                            <span className="text-sm font-medium">Vous</span>
                          </div>
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5">
                            <p className="text-sm leading-relaxed text-left">{message.reply}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </Card>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">Aucun message</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Les messages de vos invités apparaîtront ici en temps réel
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Guestbook;
