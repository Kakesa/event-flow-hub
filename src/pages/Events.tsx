import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EventCard from '@/components/dashboard/EventCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { eventsApi, guestsApi } from '@/services/api';
import type { Event, Guest } from '@/types/models';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, guestsRes] = await Promise.all([
          eventsApi.getAll(),
          guestsApi.getAll(),
        ]);
        setEvents(eventsRes.data);
        setGuests(guestsRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGuestCount = (eventId: string) => {
    return guests.filter(g => g.eventId === eventId).length;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <h1 className="font-display text-3xl font-bold tracking-tight">Événements</h1>
            <p className="text-muted-foreground mt-1">
              Gérez tous vos événements en un seul endroit
            </p>
          </div>
          <Button asChild className="shadow-gold">
            <Link to="/events/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                guestCount={getGuestCount(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">Aucun événement trouvé</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? 'Essayez de modifier votre recherche' : 'Créez votre premier événement'}
            </p>
            {!searchQuery && (
              <Button asChild className="mt-4">
                <Link to="/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
