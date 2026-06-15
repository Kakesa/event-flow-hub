import { useState, useEffect, useCallback } from 'react';
import {
  Globe, Users, Eye, RefreshCw, TrendingUp, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { analyticsApi } from '@/services/api';
import { cn } from '@/lib/utils';

type Period = 'day' | 'week' | 'month' | 'year';

interface VisitorStats {
  period: string;
  totalVisits: number;
  uniqueVisitors: number;
  chartData: { label: string; visits: number; uniqueVisitors: number }[];
  topPages: { path: string; visits: number }[];
  startDate: string;
  endDate: string;
}

const PERIOD_LABELS: Record<Period, string> = {
  day: 'Aujourd\'hui (24h)',
  week: '7 derniers jours',
  month: '30 derniers jours',
  year: '12 derniers mois',
};

function formatChartLabel(label: string, period: Period): string {
  try {
    if (period === 'day') {
      const hour = label.split(' ')[1]?.slice(0, 2);
      return hour ? `${hour}h` : label;
    }
    if (period === 'year') {
      const [year, month] = label.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return format(date, 'MMM yy', { locale: fr });
    }
    return format(parseISO(label), 'dd MMM', { locale: fr });
  } catch {
    return label;
  }
}

const VisitorsPanel = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await analyticsApi.getVisitorStats(period);
      if (res.success) setStats(res.data);
    } catch (error) {
      console.error('Erreur stats visiteurs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const chartData = (stats?.chartData || []).map((item) => ({
    ...item,
    displayLabel: formatChartLabel(item.label, period),
  }));

  return (
    <div className="space-y-6">
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
        <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Statistiques des visiteurs
        </h2>
        <p className="text-muted-foreground font-medium">
          Suivez le trafic du site : pages vues et visiteurs uniques par période.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Par jour (24h)</SelectItem>
            <SelectItem value="week">Par semaine</SelectItem>
            <SelectItem value="month">Par mois</SelectItem>
            <SelectItem value="year">Par année</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats(true)}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages vues</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '—' : stats?.totalVisits ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">{PERIOD_LABELS[period]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs uniques</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '—' : stats?.uniqueVisitors ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Visiteurs distincts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne / période</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading || !stats?.chartData.length
                ? '—'
                : Math.round(stats.totalVisits / stats.chartData.length)}
            </div>
            <p className="text-xs text-muted-foreground">Pages vues par intervalle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pages vues
            </CardTitle>
            <CardDescription>{PERIOD_LABELS[period]}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chargement...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="displayLabel"
                    tick={{ fontSize: 11 }}
                    interval={period === 'day' ? 2 : period === 'month' ? 4 : 0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="visits" name="Pages vues" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Visiteurs uniques
            </CardTitle>
            <CardDescription>Évolution des visiteurs distincts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chargement...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="displayLabel"
                    tick={{ fontSize: 11 }}
                    interval={period === 'day' ? 2 : period === 'month' ? 4 : 0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="uniqueVisitors"
                    name="Visiteurs uniques"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pages les plus visitées</CardTitle>
          <CardDescription>Top 10 des pages consultées</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Visites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : stats?.topPages.length ? (
                stats.topPages.map((page) => (
                  <TableRow key={page.path}>
                    <TableCell className="font-mono text-sm">{page.path}</TableCell>
                    <TableCell className="text-right font-medium">{page.visits}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    Aucune visite enregistrée pour cette période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorsPanel;
