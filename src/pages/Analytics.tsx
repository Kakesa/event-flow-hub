import { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle2, XCircle, Clock, Wine, Beer, GlassWater } from 'lucide-react';
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
import { buildDrinksChartData } from '@/config/drinks';
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
} from 'recharts';

const DrinkTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; categoryLabel: string } }>;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">{item.categoryLabel}</p>
      <p className="font-semibold mt-1">{item.value} choix</p>
    </div>
  );
};

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

  const drinksData = analytics
    ? buildDrinksChartData(analytics.preferredDrinksStats || {})
    : [];

  const alcoholicDrinksList = analytics?.alcoholicDrinksStats
    ? Object.entries(analytics.alcoholicDrinksStats).sort((a, b) => b[1] - a[1])
    : [];

  const softDrinksList = analytics?.softDrinksStats
    ? Object.entries(analytics.softDrinksStats).sort((a, b) => b[1] - a[1])
    : [];

  const totalDrinkChoices = analytics?.drinkCategoryStats?.totalChoices ?? 0;

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

              {/* Boissons — barres multicolores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    Boissons — alcool / sans alcool
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {drinksData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-16">
                      Aucune préférence de boisson enregistrée pour le moment.
                    </p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={Math.max(220, drinksData.length * 40)}>
                        <BarChart data={drinksData} layout="vertical" margin={{ left: 8, right: 16 }}>
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip content={<DrinkTooltip />} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                            {drinksData.map((entry) => (
                              <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="h-3 w-6 rounded-sm bg-[#b45309]" />
                          <span className="text-muted-foreground">Avec alcool</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="h-3 w-6 rounded-sm bg-[#2563eb]" />
                          <span className="text-muted-foreground">Sans alcool</span>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 mt-4 pt-4 border-t">
                        <div className="rounded-lg border p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Beer className="h-4 w-4 text-[hsl(var(--chart-4))]" />
                            Avec alcool
                          </div>
                          <p className="text-3xl font-bold">
                            {analytics.drinkCategoryStats?.alcoholic ?? 0}
                          </p>
                          {alcoholicDrinksList.length > 0 && (
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {alcoholicDrinksList.map(([name, count]) => (
                                <li key={name} className="flex justify-between gap-2">
                                  <span>{name}</span>
                                  <span className="font-medium text-foreground">{count}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="rounded-lg border p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <GlassWater className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                            Sans alcool
                          </div>
                          <p className="text-3xl font-bold">
                            {analytics.drinkCategoryStats?.soft ?? 0}
                          </p>
                          {softDrinksList.length > 0 && (
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {softDrinksList.map(([name, count]) => (
                                <li key={name} className="flex justify-between gap-2">
                                  <span>{name}</span>
                                  <span className="font-medium text-foreground">{count}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3 mt-4 pt-4 border-t text-center">
                        <div>
                          <p className="text-2xl font-bold">{totalDrinkChoices}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total choix boissons</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {analytics.drinkCategoryStats?.guestsWithDrinks ?? 0}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Invités avec préférence</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {totalDrinkChoices > 0
                              ? Math.round(
                                  ((analytics.drinkCategoryStats?.alcoholic ?? 0) / totalDrinkChoices) * 100,
                                )
                              : 0}
                            %
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Part avec alcool</p>
                        </div>
                      </div>
                    </>
                  )}
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
