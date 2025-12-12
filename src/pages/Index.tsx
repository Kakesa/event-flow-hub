import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle2, Clock, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import EventCard from '@/components/dashboard/EventCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { eventsApi, analyticsApi, guestsApi } from '@/services/api';
import type { Event, Guest } from '@/types/models';

const Index = () => {
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
        const [eventsRes, overviewRes, guestsRes] = await Promise.all([
          eventsApi.getAll(),
          analyticsApi.getOverview(),
          guestsApi.getAll(),
        ]);
        setEvents(eventsRes.data);
        setOverview(overviewRes.data);
        setGuests(guestsRes.data);
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
              Bonjour, Marie 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Voici un aperçu de vos événements
            </p>
          </div>
          <Button asChild className="shadow-gold">
            <Link to="/events/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total événements"
            value={overview.totalEvents}
            icon={Calendar}
            variant="primary"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Total invités"
            value={overview.totalGuests}
            icon={Users}
            trend={{ value: 8, positive: true }}
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
              <h2 className="font-display text-xl font-semibold">Événements récents</h2>
              <Button variant="ghost" asChild>
                <Link to="/events" className="flex items-center gap-1">
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {events.slice(0, 4).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  guestCount={getGuestCount(event.id)}
                />
              ))}
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
