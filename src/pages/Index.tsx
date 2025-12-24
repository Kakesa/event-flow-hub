import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle2, Clock, Plus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import EventCard from '@/components/dashboard/EventCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';

import { eventsApi, analyticsApi, guestsApi } from '@/services/api';
import type { Event, Guest } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [overview, setOverview] = useState({
    totalEvents: 0,
    totalGuests: 0,
    totalConfirmed: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const eventsRes = await eventsApi.getAll();
      setEvents(eventsRes.data);

      // valeurs par défaut tant que l’API n’existe pas
      setOverview({
        totalEvents: eventsRes.data.length,
        totalGuests: 0,
        totalConfirmed: 0,
        upcomingEvents: 0,
      });

      setGuests([]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const getGuestCount = (eventId: string) => {
    return guests.filter(g => g.eventId === eventId).length;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Bonjour {user?.name || 'Utilisateur'} !
            </h1>
            <p className="text-muted-foreground mt-1">
              Voici un aperçu de vos événements
            </p>
          </div>

          <Button onClick={() => navigate('/events/create')} className="shadow-gold">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total événements"
            value={overview.totalEvents}
            icon={Calendar}
            variant="primary"
          />
          <StatCard
            title="Total invités"
            value={overview.totalGuests}
            icon={Users}
          />
          <StatCard
            title="Confirmés"
            value={overview.totalConfirmed}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Événements à venir"
            value={overview.upcomingEvents}
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                Événements récents
              </h2>
              <Button variant="ghost" asChild>
                <Link to="/events" className="flex items-center gap-1">
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {events.length === 0 ? (
                <p className="text-muted-foreground">
                  Aucun événement trouvé.
                </p>
              ) : (
                events.slice(0, 4).map(event => (
                  <EventCard
                    key={event._id}
                    event={event}
                    guestCount={getGuestCount(event._id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Activité</h2>
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
