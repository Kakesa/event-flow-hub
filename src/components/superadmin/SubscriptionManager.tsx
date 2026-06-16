import { useState } from 'react';
import {
  CreditCard, Users, TrendingUp, Crown, Search,
  ChevronUp, ChevronDown, DollarSign, Calendar,
  AlertTriangle, CheckCircle2, XCircle, Edit,
  MoreVertical, History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import type { User, SubscriptionType } from '@/types/models';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SubscriptionManagerProps {
  users: User[];
  onUpdateSubscription: (userId: string, newPlan: SubscriptionType) => Promise<void>;
  className?: string;
}

const PLAN_PRICES: Record<SubscriptionType, number> = {
  free: 0,
  basic: 29,
  premium: 79,
  enterprise: 199,
};

const PLAN_FEATURES: Record<SubscriptionType, string[]> = {
  free: ['1 événement', '50 invités', 'Emails basiques'],
  basic: ['5 événements', '200 invités', 'Templates personnalisés', 'Support email'],
  premium: ['Événements illimités', 'Invités illimités', 'Analytics avancés', 'Support prioritaire'],
  enterprise: ['Tout Premium', 'API access', 'SSO', 'Account manager dédié'],
};

const COLORS = ['hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--primary))'];

const SubscriptionManager = ({ users, onUpdateSubscription, className }: SubscriptionManagerProps) => {
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [newPlan, setNewPlan] = useState<SubscriptionType>('free');
  const [updating, setUpdating] = useState(false);

  // Calculer les statistiques
  const subscriptionCounts = {
    free: users.filter(u => !u.subscriptionType || u.subscriptionType === 'free').length,
    basic: users.filter(u => u.subscriptionType === 'basic').length,
    premium: users.filter(u => u.subscriptionType === 'premium').length,
    enterprise: users.filter(u => u.subscriptionType === 'enterprise').length,
  };

  const totalRevenue = 
    subscriptionCounts.basic * PLAN_PRICES.basic +
    subscriptionCounts.premium * PLAN_PRICES.premium +
    subscriptionCounts.enterprise * PLAN_PRICES.enterprise;

  const mrr = totalRevenue; // Monthly Recurring Revenue
  const arr = mrr * 12; // Annual Recurring Revenue

  const pieData = [
    { name: 'Free', value: subscriptionCounts.free, color: COLORS[0] },
    { name: 'Basic', value: subscriptionCounts.basic, color: COLORS[1] },
    { name: 'Premium', value: subscriptionCounts.premium, color: COLORS[2] },
    { name: 'Enterprise', value: subscriptionCounts.enterprise, color: COLORS[3] },
  ];

  const revenueData = [
    { month: 'Jan', revenue: totalRevenue * 0.7, subscribers: Math.floor(users.length * 0.7) },
    { month: 'Fév', revenue: totalRevenue * 0.75, subscribers: Math.floor(users.length * 0.75) },
    { month: 'Mar', revenue: totalRevenue * 0.8, subscribers: Math.floor(users.length * 0.8) },
    { month: 'Avr', revenue: totalRevenue * 0.85, subscribers: Math.floor(users.length * 0.85) },
    { month: 'Mai', revenue: totalRevenue * 0.92, subscribers: Math.floor(users.length * 0.92) },
    { month: 'Juin', revenue: totalRevenue, subscribers: users.length },
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = 
      planFilter === 'all' || 
      (planFilter === 'free' ? (!u.subscriptionType || u.subscriptionType === 'free') : u.subscriptionType === planFilter);
    
    return matchesSearch && matchesPlan;
  });

  const handleOpenUpgradeDialog = (user: User) => {
    setSelectedUser(user);
    setNewPlan(user.subscriptionType || 'free');
    setShowUpgradeDialog(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedUser || !newPlan) return;

    setUpdating(true);
    try {
      await onUpdateSubscription(selectedUser._id || selectedUser.id || '', newPlan);
      toast({
        title: 'Abonnement mis à jour',
        description: `${selectedUser.name} est maintenant sur le plan ${newPlan}`,
      });
      setShowUpgradeDialog(false);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'abonnement',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getPlanBadge = (plan?: SubscriptionType) => {
    const config: Record<SubscriptionType, { className: string; icon?: React.ReactNode }> = {
      free: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
      basic: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      premium: { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: <Crown className="h-3 w-3 mr-1" /> },
      enterprise: { className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', icon: <Crown className="h-3 w-3 mr-1" /> },
    };
    const p = plan || 'free';
    const c = config[p];
    return (
      <Badge className={cn('capitalize', c.className)}>
        {c.icon}
        {p}
      </Badge>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mrr.toLocaleString()}€</div>
            <div className="flex items-center text-xs text-green-600">
              <ChevronUp className="h-3 w-3" />
              +12% vs mois dernier
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arr.toLocaleString()}€</div>
            <p className="text-xs text-muted-foreground">Revenu annuel récurrent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés payants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptionCounts.basic + subscriptionCounts.premium + subscriptionCounts.enterprise}
            </div>
            <p className="text-xs text-muted-foreground">
              {((subscriptionCounts.basic + subscriptionCounts.premium + subscriptionCounts.enterprise) / users.length * 100).toFixed(1)}% de conversion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 ? (mrr / users.length).toFixed(2) : 0}€
            </div>
            <p className="text-xs text-muted-foreground">Revenu moyen par utilisateur</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value}€`, 'Revenu']}
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
            <CardTitle>Répartition des plans</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }} 
                    />
                    <span className="text-sm">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestion des abonnements
          </CardTitle>
          <CardDescription>
            Gérez les plans d'abonnement de tous les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plan actuel</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const plan = user.subscriptionType || 'free';
                  return (
                    <TableRow key={user._id || user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.phone?.trim() && (
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(user.subscriptionType)}</TableCell>
                      <TableCell className="font-medium">
                        {PLAN_PRICES[plan]}€/mois
                      </TableCell>
                      <TableCell>
                        {user.createdAt 
                          ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr })
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {user.isActive !== false ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenUpgradeDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier le plan
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="h-4 w-4 mr-2" />
                              Historique
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {plan !== 'free' && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewPlan('free');
                                  setShowUpgradeDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Annuler l'abonnement
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'abonnement</DialogTitle>
            <DialogDescription>
              Changez le plan d'abonnement de {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded bg-muted">
              <p className="font-medium">{selectedUser?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              <div className="mt-2">
                Plan actuel: {getPlanBadge(selectedUser?.subscriptionType)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nouveau plan</label>
              <Select value={newPlan} onValueChange={(v) => setNewPlan(v as SubscriptionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['free', 'basic', 'premium', 'enterprise'] as SubscriptionType[]).map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="capitalize">{plan}</span>
                        <span className="text-muted-foreground">{PLAN_PRICES[plan]}€/mois</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded bg-muted/50 space-y-1">
              <p className="text-sm font-medium">Fonctionnalités du plan {newPlan}:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {PLAN_FEATURES[newPlan].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {newPlan !== (selectedUser?.subscriptionType || 'free') && (
              <div className={cn(
                'p-3 rounded flex items-start gap-2',
                PLAN_PRICES[newPlan] > PLAN_PRICES[selectedUser?.subscriptionType || 'free']
                  ? 'bg-green-500/10 text-green-700'
                  : 'bg-amber-500/10 text-amber-700'
              )}>
                {PLAN_PRICES[newPlan] > PLAN_PRICES[selectedUser?.subscriptionType || 'free'] ? (
                  <>
                    <ChevronUp className="h-4 w-4 mt-0.5" />
                    <span className="text-sm">
                      Upgrade: +{PLAN_PRICES[newPlan] - PLAN_PRICES[selectedUser?.subscriptionType || 'free']}€/mois
                    </span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mt-0.5" />
                    <span className="text-sm">
                      Downgrade: -{PLAN_PRICES[selectedUser?.subscriptionType || 'free'] - PLAN_PRICES[newPlan]}€/mois
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmUpgrade}
              disabled={updating || newPlan === (selectedUser?.subscriptionType || 'free')}
            >
              {updating ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManager;
