/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EventCard from '@/components/dashboard/EventCard';
import PermissionButton from '@/components/common/PermissionButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventsApi, guestsApi } from '@/services/api';
import type { Event, Guest } from '@/types/models';
import { usePermissions } from '@/hooks/usePermissions';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [guestsMap, setGuestsMap] = useState<Record<string, Guest[]>>({});
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingGuests, setLoadingGuests] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const { canCreate, canDelete, canUpdate } = usePermissions();
  const { user } = useAuth();
  const isUser = user?.role === 'user';

  // 🔹 Fonction pour corriger les chemins locaux
  const getEventImage = (image?: string) => {
    if (!image) return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'; // Image par défaut
    if (image.startsWith('http')) return image; // URL externe
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  };

  // 🔹 Récupération des événements
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const res = await eventsApi.getAll();
        if (res.success) setEvents(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // 🔹 Charger les invités d’un événement uniquement quand nécessaire
  const fetchGuestsForEvent = async (eventId: string) => {
    if (guestsMap[eventId] || loadingGuests[eventId]) return;
    setLoadingGuests(prev => ({ ...prev, [eventId]: true }));
    try {
      const res = await guestsApi.getByEvent(eventId);
      if (res.success) setGuestsMap(prev => ({ ...prev, [eventId]: res.data }));
      else setGuestsMap(prev => ({ ...prev, [eventId]: [] }));
    } catch (err) {
      console.error(`Erreur chargement invités pour l'événement ${eventId}:`, err);
      setGuestsMap(prev => ({ ...prev, [eventId]: [] }));
    } finally {
      setLoadingGuests(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const getGuestCount = (eventId: string) => guestsMap[eventId]?.length || 0;

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e._id !== eventId));
    setGuestsMap(prev => {
      const copy = { ...prev };
      delete copy[eventId];
      return copy;
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    const eventDate = new Date(event.date);
    const now = new Date();
    if (statusFilter === 'upcoming') return matchesSearch && eventDate > now;
    if (statusFilter === 'past') return matchesSearch && eventDate <= now;
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Événements</h1>
            <p className="text-muted-foreground mt-1">Gérez tous vos événements en un seul endroit</p>
          </div>
          {canCreate('events') && !isUser && (
            <PermissionButton
              module="events"
              action="create"
              onClick={() => navigate('/events/create')}
              className="shadow-gold"
            >
              <Plus className="h-4 w-4 mr-2" /> Nouvel événement
            </PermissionButton>
          )}
        </div>

        {isUser && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-center font-medium">
            Vous n'avez pas d'accès pour créer, contactez l'équipe HE event.
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={value => setStatusFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              <SelectItem value="upcoming">À venir</SelectItem>
              <SelectItem value="past">Passés</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events grid */}
        {loadingEvents ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                guestCount={getGuestCount(event._id)}
                onDelete={handleDeleteEvent}
                canEdit={canUpdate('events')}
                canDelete={canDelete('events')}
                onOpen={() => fetchGuestsForEvent(event._id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p>Aucun événement trouvé</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
