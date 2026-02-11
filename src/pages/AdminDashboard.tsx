/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { 
  Users, Calendar, CreditCard, TrendingUp, Crown, 
  UserCheck, UserX, DollarSign, Activity, Shield
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { usersApi, analyticsApi, eventsApi, paymentsApi } from '@/services/api';
import type { User } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  totalGuests: number;
  totalConfirmed: number;
  upcomingEvents: number;
  revenue: number;
  subscriptions: {
    free: number;
    basic: number;
    premium: number;
    enterprise: number;
  };
}

interface Transaction {
  id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  plan: string;
  status: 'pending' | 'successful' | 'failed' | 'canceled';
  createdAt: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    totalGuests: 0,
    totalConfirmed: 0,
    upcomingEvents: 0,
    revenue: 0,
    subscriptions: { free: 0, basic: 0, premium: 0, enterprise: 0 }
  });
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Données simulées pour les graphiques
  const revenueData = [
    { month: 'Jan', revenue: 4500, users: 120 },
    { month: 'Fév', revenue: 5200, users: 145 },
    { month: 'Mar', revenue: 6100, users: 180 },
    { month: 'Avr', revenue: 5800, users: 165 },
    { month: 'Mai', revenue: 7200, users: 210 },
    { month: 'Juin', revenue: 8500, users: 250 },
  ];

  const subscriptionData = [
    { name: 'Free', value: stats.subscriptions.free, color: 'hsl(var(--muted))' },
    { name: 'Basic', value: stats.subscriptions.basic, color: 'hsl(var(--chart-1))' },
    { name: 'Premium', value: stats.subscriptions.premium, color: 'hsl(var(--chart-2))' },
    { name: 'Enterprise', value: stats.subscriptions.enterprise, color: 'hsl(var(--primary))' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les utilisateurs
        const usersRes = await usersApi.getAll();
        setUsers(usersRes.data || []);
        
        // Charger les stats globales
        const analyticsRes = await analyticsApi.getOverview() as any;
        
        // Calculer les stats
        const usersList = usersRes.data || [];
        const subscriptionCounts = {
          free: usersList.filter(u => !u.subscriptionType || u.subscriptionType === 'free').length,
          basic: usersList.filter(u => u.subscriptionType === 'basic').length,
          premium: usersList.filter(u => u.subscriptionType === 'premium').length,
          enterprise: usersList.filter(u => u.subscriptionType === 'enterprise').length,
        };

        setStats({
          totalUsers: usersList.length,
          activeUsers: usersList.filter(u => u.isActive !== false).length,
          totalEvents: analyticsRes.data?.totalEvents || 0,
          totalGuests: analyticsRes.data?.totalGuests || 0,
          totalConfirmed: analyticsRes.data?.totalConfirmed || 0,
          upcomingEvents: analyticsRes.data?.upcomingEvents || 0,
          revenue: analyticsRes.data?.monthlyRevenue || 0,
          subscriptions: subscriptionCounts,
        });

        // Charger les transactions réelles
        const paymentsRes = await paymentsApi.getAll();
        setTransactions(paymentsRes.data || []);

      } catch (error) {
        console.error('Erreur lors du chargement des données admin:', error);
        toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, timeRange]);

  const handleUpdateSubscription = async (userId: string, newPlan: string) => {
    try {
      await usersApi.update(userId, { subscriptionType: newPlan as any });
      toast({ title: 'Succès', description: 'Abonnement mis à jour' });
      // Recharger les données
      const usersRes = await usersApi.getAll();
      setUsers(usersRes.data || []);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour l\'abonnement', variant: 'destructive' });
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
      free: { variant: 'outline', icon: null },
      basic: { variant: 'secondary', icon: null },
      premium: { variant: 'default', icon: <Crown className="h-3 w-3 mr-1" /> },
      enterprise: { variant: 'default', icon: <Shield className="h-3 w-3 mr-1" /> },
    };
    const config = variants[plan] || variants.free;
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.icon}
        {plan}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      trial: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return (
      <Badge className={colors[status] || colors.expired}>
        {status === 'active' ? 'Actif' : status === 'cancelled' ? 'Annulé' : status === 'trial' ? 'Essai' : 'Expiré'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Administration
            </h1>
            <p className="text-muted-foreground">
              Statistiques globales et gestion des abonnements
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stats.activeUsers}</span> actifs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">{stats.upcomingEvents}</span> à venir
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenu Mensuel</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.revenue || 0).toLocaleString()}€</div>
              <p className="text-xs text-muted-foreground">
                +12% vs mois dernier
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux Confirmation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalGuests > 0 
                  ? Math.round((stats.totalConfirmed / stats.totalGuests) * 100) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalConfirmed}/{stats.totalGuests} invités
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenus & Croissance</CardTitle>
                  <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `${value}€` : value,
                          name === 'revenue' ? 'Revenus' : 'Utilisateurs'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subscription Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des Abonnements</CardTitle>
                  <CardDescription>Par type de plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.subscriptions.premium + stats.subscriptions.enterprise}</p>
                      <p className="text-sm text-muted-foreground">Comptes Premium</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeUsers}</p>
                      <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalGuests}</p>
                      <p className="text-sm text-muted-foreground">Invités gérés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.subscriptions.basic + stats.subscriptions.premium + stats.subscriptions.enterprise}</p>
                      <p className="text-sm text-muted-foreground">Abonnements payants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Transactions</CardTitle>
                <CardDescription>Liste de tous les paiements effectués sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>ID Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: any) => (
                      <TableRow key={tx.id || tx._id}>
                        <TableCell className="text-sm font-medium">
                          {tx.createdAt ? format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm', { locale: fr }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.userId?.name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{tx.userId?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(tx.plan)}</TableCell>
                        <TableCell className="font-bold">{tx.amount}€</TableCell>
                        <TableCell>
                          <Badge 
                            variant={tx.status === 'successful' ? 'default' : tx.status === 'pending' ? 'outline' : 'destructive'}
                            className={cn(
                              tx.status === 'successful' && "bg-green-100 text-green-800 hover:bg-green-100",
                              tx.status === 'pending' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            )}
                          >
                            {tx.status === 'successful' ? 'Réussi' : tx.status === 'pending' ? 'En attente' : 'Échoué'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground uppercase">
                           {(tx.id || tx._id || "").slice(-8)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          Aucune transaction trouvée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tous les Utilisateurs</CardTitle>
                <CardDescription>{users.length} utilisateurs enregistrés</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id || user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{user.role || 'user'}</Badge>
                        </TableCell>
                        <TableCell>{getPlanBadge(user.subscriptionType || 'free')}</TableCell>
                        <TableCell>
                          {user.isActive !== false ? (
                            <Badge className="bg-green-100 text-green-800">Actif</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Inactif</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
