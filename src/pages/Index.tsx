import { useEffect, useState, useCallback } from 'react';
import { Calendar, Users, CheckCircle2, Clock, Plus, ArrowRight, Bell, TrendingUp, Activity, MessageSquare, Heart, Reply, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import EventCard from '@/components/dashboard/EventCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { eventsApi, analyticsApi, guestsApi, guestbookApi } from '@/services/api';
import type { Event, Guest, GuestbookMessage } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)'];

interface Notification {
  id: string;
  type: 'confirmation' | 'decline' | 'new_guest';
  message: string;
  timestamp: Date;
  read: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [events, setEvents] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestbookMessages, setGuestbookMessages] = useState<GuestbookMessage[]>([]);
  const [overview, setOverview] = useState({
    totalEvents: 0,
    totalGuests: 0,
    totalConfirmed: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Données pour les graphiques
  const [chartData, setChartData] = useState<{
    statusData: { name: string; value: number; color: string }[];
    trendData: { date: string; confirmations: number; declines: number }[];
    eventStats: { name: string; guests: number; confirmed: number }[];
  }>({
    statusData: [],
    trendData: [],
    eventStats: [],
  });

  const fetchData = useCallback(async () => {
    try {
      const eventsRes = await eventsApi.getAll();
      setEvents(eventsRes.data);

      // Récupérer tous les invités par événement
      let allGuests: Guest[] = [];
      const guestPromises = eventsRes.data.slice(0, 10).map(async (event) => {
        try {
          const guestsRes = await guestsApi.getByEvent(event._id || event.id);
          return guestsRes.data || [];
        } catch {
          return [];
        }
      });
      
      const guestResults = await Promise.all(guestPromises);
      allGuests = guestResults.flat();
      setGuests(allGuests);

      // Calculer les statistiques
      const confirmedCount = allGuests.filter(g => g.status === 'confirmed').length;
      const declinedCount = allGuests.filter(g => g.status === 'declined').length;
      const pendingCount = allGuests.filter(g => g.status === 'pending' || g.status === 'invited').length;
      const upcomingEvents = eventsRes.data.filter(e => new Date(e.date) >= new Date()).length;

      setOverview({
        totalEvents: eventsRes.data.length,
        totalGuests: allGuests.length,
        totalConfirmed: confirmedCount,
        upcomingEvents,
      });

      // Données pour les graphiques
      setChartData({
        statusData: [
          { name: 'Confirmés', value: confirmedCount, color: COLORS[0] },
          { name: 'Déclinés', value: declinedCount, color: COLORS[1] },
          { name: 'En attente', value: pendingCount, color: COLORS[2] },
        ],
        trendData: generateTrendData(allGuests),
        eventStats: eventsRes.data.slice(0, 5).map(event => {
          const eventGuests = allGuests.filter(g => g.eventId === event._id || g.eventId === event.id);
          return {
            name: event.title.substring(0, 15) + (event.title.length > 15 ? '...' : ''),
            guests: eventGuests.length,
            confirmed: eventGuests.filter(g => g.status === 'confirmed').length,
          };
        }),
      });

      // Générer des notifications simulées
      const recentConfirmations = allGuests
        .filter(g => g.status === 'confirmed')
        .slice(0, 3)
        .map((g, i) => ({
          id: `notif-${i}`,
          type: 'confirmation' as const,
          message: `${g.name} a confirmé sa présence`,
          timestamp: new Date(Date.now() - i * 3600000),
          read: false,
        }));
      setNotifications(recentConfirmations);

      // Récupérer les messages du livre d'or
      try {
        const allMessages: GuestbookMessage[] = [];
        for (const event of eventsRes.data.slice(0, 5)) {
          try {
            const gbRes = await guestbookApi.getByEvent(event._id || event.id);
            if (gbRes.data) {
              allMessages.push(...gbRes.data);
            }
          } catch {
            // Ignorer les erreurs individuelles
          }
        }
        // Trier par date décroissante et garder les 5 derniers
        allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setGuestbookMessages(allMessages.slice(0, 5));
      } catch {
        console.error('Erreur livre d\'or');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Rafraîchir les données toutes les 30 secondes pour simuler le temps réel
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const generateTrendData = (allGuests: Guest[]) => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      
      // Simuler des données basées sur le nombre d'invités
      const baseValue = Math.floor(allGuests.length / 7);
      data.push({
        date: dateStr,
        confirmations: Math.max(0, baseValue + Math.floor(Math.random() * 5) - 2),
        declines: Math.max(0, Math.floor(baseValue / 3) + Math.floor(Math.random() * 2)),
      });
    }
    return data;
  };

  const getGuestCount = (eventId: string) => {
    return guests.filter(g => g.eventId === eventId).length;
  };

  const handleNotificationClick = (notif: Notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
    );
    toast({
      title: 'Notification',
      description: notif.message,
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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

          <div className="flex gap-2">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Notifications récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0 pb-3">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        Aucune notification
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map(notif => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              notif.read ? 'bg-muted/50' : 'bg-primary/10 hover:bg-primary/20'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <div>
                                <p className="text-sm">{notif.message}</p>
                                <p className="text-xs text-muted-foreground">
                                  {notif.timestamp.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              {!notif.read && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <Button onClick={() => navigate('/events/create')} className="shadow-gold">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          </div>
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

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Status Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Répartition des réponses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {chartData.statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trend Area Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Tendance (7 jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.trendData}>
                    <defs>
                      <linearGradient id="colorConfirmations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="confirmations"
                      stroke="hsl(142, 76%, 36%)"
                      fillOpacity={1}
                      fill="url(#colorConfirmations)"
                      name="Confirmations"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Event Stats Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Par événement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.eventStats} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="guests" fill="hsl(38, 92%, 50%)" name="Total" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="confirmed" fill="hsl(142, 76%, 36%)" name="Confirmés" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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
                    key={event._id || event.id}
                    event={event}
                    guestCount={getGuestCount(event._id || event.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Activité</h2>
            <RecentActivity />

            {/* Derniers messages du livre d'or */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Livre d'or
                </h2>
                <Button variant="ghost" asChild>
                  <Link to="/guestbook" className="flex items-center gap-1 text-sm">
                    Voir tout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {guestbookMessages.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun message pour le moment</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {guestbookMessages.map((msg, index) => (
                    <Card
                      key={msg.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                            {msg.name?.charAt(0) || 'A'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{msg.name || 'Anonyme'}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              "{msg.message}"
                            </p>
                            <Heart className="h-3 w-3 text-primary fill-current mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;