/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { 
  Users, Calendar, CreditCard, TrendingUp, Crown, 
  UserCheck, UserX, DollarSign, Activity, Shield,
  Eye, Mail, Send, Clock, AlertTriangle, CheckCircle2,
  Globe, Server, Database, Zap, RefreshCw, Search,
  MoreVertical, Ban, Edit, Trash2, ExternalLink, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { usersApi, analyticsApi, eventsApi, emailHistoryApi, auditApi } from '@/services/api';
import type { User, Event, SubscriptionType } from '@/types/models';
import type { EmailLog, EmailAnalytics } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import AuditLogsPanel from '@/components/superadmin/AuditLogsPanel';
import UserImpersonation from '@/components/superadmin/UserImpersonation';
import SubscriptionManager from '@/components/superadmin/SubscriptionManager';

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

interface ActivityLog {
  id: string;
  type: 'user_login' | 'event_created' | 'invitation_sent' | 'rsvp_confirmed' | 'user_registered' | 'subscription_changed';
  userId: string;
  userName: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

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
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailAnalytics, setEmailAnalytics] = useState<EmailAnalytics | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminFilter, setAdminFilter] = useState<string>('all'); // ✨ Filtre par admin

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
      
      const [usersRes, analyticsRes, eventsRes, emailLogsRes, emailAnalyticsRes, auditRes] = await Promise.all([
        usersApi.getAll(),
        analyticsApi.getOverview(),
        eventsApi.getAllFromAllAdmins(),
        emailHistoryApi.getLogs(),
        emailHistoryApi.getAnalytics(),
        auditApi.getLogs({ limit: 20 }),
      ]);

      const usersList = usersRes.data || [];
      setUsers(usersList);
      // Filtrer les admins depuis la liste des users
      const adminsList = usersList.filter(u => u.role === 'admin' || u.role === 'superadmin');
      setAdmins(adminsList);
      setEvents(eventsRes.data || []);
      setEmailLogs(emailLogsRes.data || []);
      setEmailAnalytics(emailAnalyticsRes.data || null);
      
      const realLogs: ActivityLog[] = (auditRes.data || []).map((audit: { 
        _id?: string; 
        id?: string; 
        action: string; 
        userId?: string; 
        userName?: string; 
        details?: { reason?: string }; 
        timestamp?: string; 
        createdAt?: string; 
      }) => ({
        id: audit._id || audit.id || '',
        type: (audit.action.toLowerCase().includes('login') ? 'user_login' : 
               audit.action.toLowerCase().includes('event') ? 'event_created' :
               audit.action.toLowerCase().includes('subscription') ? 'subscription_changed' : 'activity') as any,
        userId: audit.userId || '',
        userName: audit.userName || 'Système',
        description: audit.details?.reason || audit.action,
        timestamp: audit.timestamp || audit.createdAt || new Date().toISOString(),
      }));

      setActivityLogs(realLogs);
      
      const subscriptionCounts = {
        free: usersList.filter(u => !u.subscriptionType || u.subscriptionType === 'free').length,
        basic: usersList.filter(u => u.subscriptionType === 'basic').length,
        premium: usersList.filter(u => u.subscriptionType === 'premium').length,
        enterprise: usersList.filter(u => u.subscriptionType === 'enterprise').length,
      };

      setStats({
        totalUsers: analyticsRes.data?.totalUsers || usersList.length,
        activeUsers: usersList.filter(u => u.isActive !== false).length,
        totalEvents: analyticsRes.data?.totalEvents || eventsRes.data?.length || 0,
        totalGuests: analyticsRes.data?.totalGuests || 0,
        totalConfirmed: analyticsRes.data?.totalConfirmed || 0,
        upcomingEvents: analyticsRes.data?.upcomingEvents || 0,
        revenue: (subscriptionCounts.basic * 29 + subscriptionCounts.premium * 79 + subscriptionCounts.enterprise * 199),
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
      navigate('/admin');
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
    try {
      await usersApi.update(userId, { role: newRole as User['role'] });
      toast({ title: 'Succès', description: 'Rôle mis à jour' });
      // Rafraîchir les données
      const updatedUsers = await usersApi.getAll();
      if (updatedUsers.success) {
        setUsers(updatedUsers.data);
        setAdmins(updatedUsers.data.filter(u => u.role === 'admin' || u.role === 'superadmin'));
      }
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
        usersApi.getAll(),
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
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdmin = adminFilter === 'all' || e.userId === adminFilter;
    return matchesSearch && matchesAdmin;
  });

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'user_login': return <Users className="h-4 w-4 text-blue-500" />;
      case 'event_created': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'invitation_sent': return <Send className="h-4 w-4 text-purple-500" />;
      case 'rsvp_confirmed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'user_registered': return <UserCheck className="h-4 w-4 text-cyan-500" />;
      case 'subscription_changed': return <Crown className="h-4 w-4 text-amber-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
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
              Super Administration
            </h1>
            <p className="text-muted-foreground">
              Vue complète de toute la plateforme
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
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
              <div className="text-2xl font-bold">{stats.revenue.toLocaleString()}€</div>
              <p className="text-xs text-muted-foreground">
                {stats.subscriptions.premium + stats.subscriptions.enterprise} abonnés premium
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailAnalytics?.totalSent || 0}</div>
              <p className="text-xs text-muted-foreground">
                {emailAnalytics?.openRate?.toFixed(0) || 0}% taux d'ouverture
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-9 mb-8 h-auto">
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-1" />
              Activité
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="h-4 w-4 mr-1" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-1" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="admins">
              <Shield className="h-4 w-4 mr-1" />
              Administrateurs
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <CreditCard className="h-4 w-4 mr-1" />
              Abonnements
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-1" />
              Événements
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="h-4 w-4 mr-1" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="impersonation">
              <Eye className="h-4 w-4 mr-1" />
              Usurpation
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Live Activity Feed */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Activité en temps réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                          <div className="mt-1">{getActivityIcon(log.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{log.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Répartition des rôles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { role: 'superadmin', count: users.filter(u => u.role === 'superadmin').length, color: 'bg-red-500' },
                      { role: 'admin', count: users.filter(u => u.role === 'admin').length, color: 'bg-orange-500' },
                      { role: 'organizer', count: users.filter(u => u.role === 'organizer').length, color: 'bg-blue-500' },
                      { role: 'user', count: users.filter(u => !u.role || u.role === 'user').length, color: 'bg-gray-500' },
                    ].map(({ role, count, color }) => (
                      <div key={role} className="flex items-center gap-3">
                        <div className={cn('w-3 h-3 rounded-full', color)} />
                        <span className="flex-1 text-sm capitalize">{role}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance emails</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Livraison</span>
                        <span>{emailAnalytics?.deliveryRate?.toFixed(0) || 0}%</span>
                      </div>
                      <Progress value={emailAnalytics?.deliveryRate || 0} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Ouverture</span>
                        <span>{emailAnalytics?.openRate?.toFixed(0) || 0}%</span>
                      </div>
                      <Progress value={emailAnalytics?.openRate || 0} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Clic</span>
                        <span>{emailAnalytics?.clickRate?.toFixed(0) || 0}%</span>
                      </div>
                      <Progress value={emailAnalytics?.clickRate || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              onUpdateSubscription={async (userId, newPlan) => {
                const res = await usersApi.update(userId, { subscriptionType: newPlan });
                if (res.success) {
                  // Mettre à jour les stats locales sans tout recharger si possible
                  // Mais fetchAllData est plus sûr pour les stats de revenus
                  const updatedUsers = await usersApi.getAll();
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
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.subscriptionType || 'free'}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => handleUpdateUserRole(user._id || user.id || '', 'admin')}>
                                <Shield className="h-4 w-4 mr-2" />
                                Promouvoir admin
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
                <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">Debug: {admins.length} chargés</Badge>
              </h2>
              <p className="text-muted-foreground font-medium">
                Visualisez et gérez tous les comptes avec des privilèges d'administration.
              </p>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière Connexion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin._id || admin.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
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
                          {admin.lastLogin ? format(new Date(admin.lastLogin), 'dd MMM yyyy HH:mm', { locale: fr }) : 'Jamais'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin-settings/users/${admin._id || admin.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
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
                          {users.find(u => (u._id || u.id) === event.userId)?.name || 'N/A'}
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

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique global des emails</CardTitle>
                <CardDescription>{emailLogs.length} emails envoyés</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destinataire</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Envoyé le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.slice(0, 20).map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{email.recipientName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{email.recipientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                        <TableCell>
                          <Badge variant={
                            email.status === 'delivered' || email.status === 'opened' ? 'default' :
                            email.status === 'failed' || email.status === 'bounced' ? 'destructive' : 'secondary'
                          }>
                            {email.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {email.sentAt ? format(new Date(email.sentAt), 'dd/MM HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenus & Croissance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition des abonnements</CardTitle>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
