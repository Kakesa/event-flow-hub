import { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle2, XCircle, Clock, Wine } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { analyticsApi, eventsApi } from '@/services/api';
import type { Analytics as AnalyticsType, Event } from '@/types/models';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import PlanLimitAlert from '@/components/subscription/PlanLimitAlert';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const { limits } = useSubscriptionLimits();

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
      fetchAnalytics();
    }
  }, [selectedEvent]);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsError(null);
      const res = await analyticsApi.getByEvent(selectedEvent);
      setAnalytics(res.data);
    } catch (error) {
      setAnalytics(null);
      setAnalyticsError(error instanceof Error ? error.message : 'Accès refusé');
    }
  };

  const statusData = analytics ? [
    { name: 'Confirmés', value: analytics.totalConfirmed, color: 'hsl(var(--success))' },
    { name: 'Déclinés', value: analytics.totalDeclined, color: 'hsl(var(--destructive))' },
    { name: 'En attente', value: analytics.totalPending, color: 'hsl(var(--primary))' },
  ] : [];

  const drinksData = analytics ? Object.entries(analytics.preferredDrinksStats).map(([name, value]) => ({
    name,
    value,
  })) : [];

  const confirmationRate = analytics && analytics.totalInvitationsSent > 0
    ? Math.round((analytics.totalConfirmed / analytics.totalInvitationsSent) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Statistiques détaillées de vos événements
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

        {(limits && !limits.advancedAnalytics) || analyticsError ? (
          <PlanLimitAlert
            title="Analytics avancés"
            description={
              analyticsError ||
              'Les statistiques détaillées sont disponibles avec le plan Premium ou Enterprise.'
            }
            bypassed={limits?.planLimitsBypass}
          />
        ) : (
          <>

        {loading || !analytics ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Invitations envoyées"
                value={analytics.totalInvitationsSent}
                icon={Users}
                variant="primary"
              />
              <StatCard
                title="Confirmés"
                value={analytics.totalConfirmed}
                icon={CheckCircle2}
                variant="success"
              />
              <StatCard
                title="Déclinés"
                value={analytics.totalDeclined}
                icon={XCircle}
              />
              <StatCard
                title="En attente"
                value={analytics.totalPending}
                icon={Clock}
                variant="warning"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Taux de confirmation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <ResponsiveContainer width={250} height={250}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">{confirmationRate}%</span>
                        <span className="text-sm text-muted-foreground">confirmés</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {statusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Drinks Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    Préférences de boissons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={drinksData} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {drinksData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-3 text-center">
                  <div>
                    <p className="text-4xl font-bold text-primary">{confirmationRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Taux de confirmation</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">
                      {analytics.totalConfirmed + analytics.totalDeclined}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Réponses reçues</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-warning">{analytics.totalPending}</p>
                    <p className="text-sm text-muted-foreground mt-1">Réponses attendues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
