/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { 
  Users, Calendar, CreditCard, TrendingUp, Crown, 
  UserCheck, UserX, DollarSign, Shield, Activity,
  Eye, Mail, Send, Clock, AlertTriangle, CheckCircle2,
  Globe, Server, Database, RefreshCw, Search,
  MoreVertical, Ban, Edit, Trash2, ExternalLink, FileText, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PermissionsEditor from '@/components/superadmin/PermissionsEditor';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { usersApi, analyticsApi, eventsApi, paymentsApi } from '@/services/api';
import type { User, Event, SubscriptionType } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { calculateSubscriptionMRR } from '@/config/subscriptionPlans';
import AuditLogsPanel from '@/components/superadmin/AuditLogsPanel';
import UserImpersonation from '@/components/superadmin/UserImpersonation';
import SubscriptionManager from '@/components/superadmin/SubscriptionManager';
import VisitorsPanel from '@/components/superadmin/VisitorsPanel';

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

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

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

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

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
  const [events, setEvents] = useState<Event[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminFilter, setAdminFilter] = useState<string>('all'); // ✨ Filtre par admin
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Données graphiques
  const revenueData = [
    { month: 'Jan', revenue: 4500, users: 120, events: 45 },
    { month: 'Fév', revenue: 5200, users: 145, events: 52 },
    { month: 'Mar', revenue: 6100, users: 180, events: 68 },
    { month: 'Avr', revenue: 5800, users: 165, events: 61 },
    { month: 'Mai', revenue: 7200, users: 210, events: 85 },
    { month: 'Juin', revenue: 8500, users: 250, events: 102 },
  ];

  const subscriptionData = [
    { name: 'Free', value: stats.subscriptions.free, color: 'hsl(var(--muted))' },
    { name: 'Basic', value: stats.subscriptions.basic, color: 'hsl(var(--chart-1))' },
    { name: 'Premium', value: stats.subscriptions.premium, color: 'hsl(var(--chart-2))' },
    { name: 'Enterprise', value: stats.subscriptions.enterprise, color: 'hsl(var(--primary))' },
  ];

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [usersRes, analyticsRes, eventsRes, adminsRes, paymentsRes] = await Promise.all([
        usersApi.getAll({ limit: 500 }),
        analyticsApi.getOverview(),
        eventsApi.getAllFromAllAdmins(),
        usersApi.getAdmins(),
        paymentsApi.getAll(),
      ]);

      const usersList = usersRes.data || [];
      const eventsList = eventsRes.data || [];
      setUsers(usersList);
      const adminsData = adminsRes.data || [];
      setAdmins(adminsData);
      setEvents(eventsList);
      setTransactions(paymentsRes.data || []);
      
      const subscriptionCounts = {
        free: usersList.filter(u => !u.subscriptionType || u.subscriptionType === 'free').length,
        basic: usersList.filter(u => u.subscriptionType === 'basic').length,
        premium: usersList.filter(u => u.subscriptionType === 'premium').length,
        enterprise: usersList.filter(u => u.subscriptionType === 'enterprise').length,
      };

      const calculatedRevenue = calculateSubscriptionMRR(subscriptionCounts);

      setStats({
        totalUsers: analyticsRes.data?.totalUsers || usersList.length,
        activeUsers: usersList.filter(u => u.isActive !== false).length,
        totalEvents: analyticsRes.data?.totalEvents || eventsList.length,
        totalGuests: analyticsRes.data?.totalGuests || 0,
        totalConfirmed: analyticsRes.data?.totalConfirmed || 0,
        upcomingEvents: analyticsRes.data?.upcomingEvents || 0,
        revenue: analyticsRes.data?.monthlyRevenue ?? calculatedRevenue,
        subscriptions: subscriptionCounts,
      });

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'superadmin') {
      toast({
        title: 'Accès refusé',
        description: 'Vous devez être super administrateur pour accéder à cette page',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }
    fetchAllData();
  }, [currentUser, navigate, timeRange, fetchAllData, toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast({ title: 'Actualisé', description: 'Données mises à jour' });
  };
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!userId) return;

    try {
      await usersApi.update(userId, { role: newRole as User['role'] });
      toast({
        title: 'Succès',
        description:
          newRole === 'admin'
            ? 'Utilisateur promu administrateur'
            : 'Rôle mis à jour',
      });
      const [updatedUsers, updatedAdmins] = await Promise.all([
        usersApi.getAll({ limit: 500 }),
        usersApi.getAdmins(),
      ]);
      if (updatedUsers.success) setUsers(updatedUsers.data);
      if (updatedAdmins.success) setAdmins(updatedAdmins.data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le rôle', variant: 'destructive' });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersApi.update(userId, { isActive: !currentStatus });
      toast({ title: 'Succès', description: currentStatus ? 'Utilisateur désactivé' : 'Utilisateur activé' });
      // Rafraîchir les données
      const [updatedUsers, updatedAdmins] = await Promise.all([
        usersApi.getAll({ limit: 500 }),
        usersApi.getAdmins(),
      ]);
      if (updatedUsers.success) setUsers(updatedUsers.data);
      if (updatedAdmins.success) setAdmins(updatedAdmins.data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier le statut', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const eventOwnerId = typeof e.userId === 'object' && e.userId !== null 
      ? (e.userId as any)._id || (e.userId as any).id 
      : e.userId;
    const matchesAdmin = adminFilter === 'all' || eventOwnerId === adminFilter;
    return matchesSearch && matchesAdmin;
  });

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

  const getRoleBadge = (role?: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }> = {
      superadmin: { variant: 'destructive', className: 'bg-red-600' },
      admin: { variant: 'default' },
      organizer: { variant: 'secondary' },
      user: { variant: 'outline' },
    };
    const c = config[role || 'user'] || config.user;
    return <Badge variant={c.variant} className={cn('capitalize', c.className)}>{role || 'user'}</Badge>;
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
              <Shield className="h-8 w-8 text-red-500" />
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Administration de la plateforme — statistiques et gestion globale
            </p>
          </div>
          <div className="flex gap-2">
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
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* System Status */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">API</span>
                <Badge variant="outline" className="ml-auto text-green-500 border-green-500">En ligne</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Base de données</span>
                <Badge variant="outline" className="ml-auto text-green-500 border-green-500">En ligne</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Email</span>
                <Badge variant="outline" className="ml-auto text-green-500 border-green-500">Opérationnel</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">CDN</span>
                <Badge variant="outline" className="ml-auto text-green-500 border-green-500">Actif</Badge>
              </div>
            </CardContent>
          </Card>
        </div> */}

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
                {stats.subscriptions.premium + stats.subscriptions.enterprise} abonnés premium
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
          <div className="overflow-x-auto pb-2 -mx-1 px-1">
            <TabsList className="inline-flex w-max min-w-full flex-wrap gap-1 mb-4 h-auto p-1">
            <TabsTrigger value="overview" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1">
              <CreditCard className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="visitors" className="gap-1">
              <Globe className="h-4 w-4" />
              Visiteurs
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1">
              <FileText className="h-4 w-4" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-1">
              <Shield className="h-4 w-4" />
              Administrateurs
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1">
              <CreditCard className="h-4 w-4" />
              Abonnements
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1">
              <Calendar className="h-4 w-4" />
              Événements
            </TabsTrigger>
            <TabsTrigger value="impersonation" className="gap-1">
              <Eye className="h-4 w-4" />
              Usurpation
            </TabsTrigger>
          </TabsList>
          </div>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                          name === 'revenue' ? 'Revenus' : 'Utilisateurs',
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
                      <p className="text-2xl font-bold">
                        {stats.subscriptions.basic + stats.subscriptions.premium + stats.subscriptions.enterprise}
                      </p>
                      <p className="text-sm text-muted-foreground">Abonnements payants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions */}
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
                    {transactions.map((tx) => (
                      <TableRow key={tx.id || (tx as { _id?: string })._id}>
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
                              tx.status === 'successful' && 'bg-green-100 text-green-800 hover:bg-green-100',
                              tx.status === 'pending' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            )}
                          >
                            {tx.status === 'successful' ? 'Réussi' : tx.status === 'pending' ? 'En attente' : 'Échoué'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground uppercase">
                          {(tx.id || (tx as { _id?: string })._id || '').slice(-8)}
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

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <AuditLogsPanel />
          </TabsContent>

          {/* Impersonation Tab */}
          <TabsContent value="impersonation">
            <UserImpersonation users={users} />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Gestion des Abonnements
              </h2>
              <p className="text-muted-foreground font-medium">
                Gérez les plans d'abonnement de tous les utilisateurs de la plateforme.
              </p>
            </div>
            <SubscriptionManager 
              users={users} 
              onRefresh={fetchAllData}
              onUpdateSubscription={async (userId, newPlan) => {
                const res = await usersApi.update(userId, { subscriptionType: newPlan });
                if (res.success) {
                  // Mettre à jour les stats locales sans tout recharger si possible
                  // Mais fetchAllData est plus sûr pour les stats de revenus
                  const updatedUsers = await usersApi.getAll({ limit: 500 });
                  if (updatedUsers.success) setUsers(updatedUsers.data);
                }
              }}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Utilisateurs
              </h2>
              <p className="text-muted-foreground font-medium">
                Gérez les comptes, les rôles et les plans d'abonnement de tous les utilisateurs.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Abonnement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id || user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {user.phone?.trim() || '—'}
                        </TableCell>
                        <TableCell>
                          {user.role === 'superadmin' ? (
                            getRoleBadge(user.role)
                          ) : (
                            <Select
                              value={user.role || 'user'}
                              onValueChange={(value) =>
                                handleUpdateUserRole(user._id || user.id || '', value)
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Utilisateur</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="organizer">Organisateur</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="capitalize w-fit">
                              {user.subscriptionType || 'free'}
                            </Badge>
                            {user.planLimitsBypass && (
                              <Badge className="w-fit bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                                Limites débloquées
                              </Badge>
                            )}
                            {(user.subscriptionType === 'premium' || user.subscriptionType === 'free' || user.subscriptionType === 'enterprise') && (
                              <Badge variant="secondary" className="w-fit">
                                {(user.guestPriceFc ?? 1500).toLocaleString('fr-FR')} FC / invité
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isActive !== false ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <Ban className="h-3 w-3 mr-1" />
                              Inactif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.createdAt 
                            ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr })
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/users/${user._id || user.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleToggleUserStatus(user._id || user.id || '', user.isActive !== false)}
                                className={user.isActive !== false ? 'text-destructive' : 'text-green-600'}
                              >
                                {user.isActive !== false ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Liste des Administrateurs
              </h2>
              <p className="text-muted-foreground font-medium">
                Visualisez et gérez tous les comptes avec des privilèges d'administration.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un administrateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrateur</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin._id || admin.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {admin.phone?.trim() || '—'}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(admin.role)}
                        </TableCell>
                        <TableCell>
                          {admin.isActive !== false ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Actif</Badge>
                          ) : (
                            <Badge variant="destructive">Banni</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {admin.createdAt ? format(new Date(admin.createdAt), 'dd MMM yyyy', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedUserForPermissions(admin);
                                setPermissionsModalOpen(true);
                              }}>
                                <Key className="h-4 w-4 mr-2" />
                                Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/admin-settings/users/${admin._id || admin.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleToggleUserStatus(admin._id || admin.id || '', admin.isActive !== false)}
                                className={admin.isActive !== false ? 'text-destructive' : 'text-green-600'}
                              >
                                {admin.isActive !== false ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspendre
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Réactiver
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {admins.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucun administrateur trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            {/* ✨ Filter by admin */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un événement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={adminFilter} onValueChange={setAdminFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrer par admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les admins</SelectItem>
                  {admins.map(admin => (
                    <SelectItem key={admin._id || admin.id} value={admin._id || admin.id || ''}>
                      {admin.name} ({admin.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tous les événements de la plateforme</CardTitle>
                <CardDescription>
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} 
                  {adminFilter !== 'all' && ` (filtrés par ${users.find(u => (u._id || u.id) === adminFilter)?.name})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Événement</TableHead>
                      <TableHead>Organisateur</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {typeof event.userId === 'object' && event.userId !== null
                            ? (event.userId as any).name
                            : users.find(u => (u._id || u.id) === event.userId)?.name || 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {event.location}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${event.id}/edit`)}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visitors Tab */}
          <TabsContent value="visitors">
            <VisitorsPanel />
          </TabsContent>
        </Tabs>

        {/* Permissions Editor Modal */}
        <PermissionsEditor
          user={selectedUserForPermissions}
          open={permissionsModalOpen}
          onOpenChange={setPermissionsModalOpen}
          onSaved={fetchAllData}
        />
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
