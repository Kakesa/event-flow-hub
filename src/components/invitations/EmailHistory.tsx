import { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Eye, 
  MousePointer, 
  AlertCircle, 
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emailHistoryApi, type EmailLog, type EmailAnalytics } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmailHistoryProps {
  eventId?: string;
}

const statusConfig = {
  sent: { label: 'Envoyé', icon: Send, color: 'bg-blue-500', textColor: 'text-blue-500' },
  delivered: { label: 'Livré', icon: CheckCircle2, color: 'bg-green-500', textColor: 'text-green-500' },
  opened: { label: 'Ouvert', icon: Eye, color: 'bg-purple-500', textColor: 'text-purple-500' },
  clicked: { label: 'Cliqué', icon: MousePointer, color: 'bg-amber-500', textColor: 'text-amber-500' },
  bounced: { label: 'Rebond', icon: XCircle, color: 'bg-red-500', textColor: 'text-red-500' },
  failed: { label: 'Échoué', icon: AlertCircle, color: 'bg-destructive', textColor: 'text-destructive' },
  pending: { label: 'En attente', icon: Clock, color: 'bg-muted', textColor: 'text-muted-foreground' },
};

const normalizeAnalytics = (data: Partial<EmailAnalytics> | null | undefined): EmailAnalytics | null => {
  if (!data) return null;

  return {
    totalSent: data.totalSent ?? 0,
    totalDelivered: data.totalDelivered ?? 0,
    totalOpened: data.totalOpened ?? 0,
    totalClicked: data.totalClicked ?? 0,
    totalBounced: data.totalBounced ?? 0,
    totalFailed: data.totalFailed ?? 0,
    deliveryRate: data.deliveryRate ?? 0,
    openRate: data.openRate ?? 0,
    clickRate: data.clickRate ?? 0,
    bounceRate: data.bounceRate ?? 0,
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
  };
};

const formatRate = (value?: number) => (value ?? 0).toFixed(1);

const EmailHistory = ({ eventId }: EmailHistoryProps) => {
  const { toast } = useToast();
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [logsRes, analyticsRes] = await Promise.all([
        emailHistoryApi.getLogs(eventId),
        emailHistoryApi.getAnalytics(eventId),
      ]);
      setEmails(logsRes.data || []);
      setAnalytics(normalizeAnalytics(analyticsRes.data));
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique des emails',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: 'Actualisé',
      description: 'L\'historique a été mis à jour',
    });
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch =
      (email.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (email.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EmailLog['status']) => {
    const config = statusConfig[status] ?? statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={cn('gap-1', config.textColor)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">
            <Mail className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-500/10">
                        <Send className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{analytics.totalSent}</p>
                        <p className="text-sm text-muted-foreground">Envoyés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{analytics.totalDelivered}</p>
                        <p className="text-sm text-muted-foreground">Livrés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-purple-500/10">
                        <Eye className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{analytics.totalOpened}</p>
                        <p className="text-sm text-muted-foreground">Ouverts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-amber-500/10">
                        <MousePointer className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{analytics.totalClicked}</p>
                        <p className="text-sm text-muted-foreground">Cliqués</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Taux de performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux de livraison</span>
                        <span className="font-medium">{formatRate(analytics.deliveryRate)}%</span>
                      </div>
                      <Progress value={analytics.deliveryRate ?? 0} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux d'ouverture</span>
                        <span className="font-medium">{formatRate(analytics.openRate)}%</span>
                      </div>
                      <Progress value={analytics.openRate ?? 0} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux de clic</span>
                        <span className="font-medium">{formatRate(analytics.clickRate)}%</span>
                      </div>
                      <Progress value={analytics.clickRate ?? 0} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux de rebond</span>
                        <span className="font-medium text-destructive">{formatRate(analytics.bounceRate)}%</span>
                      </div>
                      <Progress value={analytics.bounceRate ?? 0} className="h-2 [&>div]:bg-destructive" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Répartition par statut
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(statusConfig).map(([status, config]) => {
                        const count = emails.filter(e => e.status === status).length;
                        const percentage = emails.length > 0 ? (count / emails.length) * 100 : 0;
                        
                        return (
                          <div key={status} className="flex items-center gap-4">
                            <div className={cn('w-3 h-3 rounded-full', config.color)} />
                            <span className="flex-1 text-sm">{config.label}</span>
                            <span className="text-sm font-medium">{count}</span>
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email, nom ou sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Actualiser
            </Button>
          </div>

          {/* Email Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Envoyé le</TableHead>
                    <TableHead>Ouvert le</TableHead>
                    <TableHead>Clics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">Aucun email trouvé</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{email.recipientName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{email.recipientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {email.subject}
                        </TableCell>
                        <TableCell>{getStatusBadge(email.status)}</TableCell>
                        <TableCell>
                          {email.sentAt ? (
                            <span className="text-sm">
                              {format(new Date(email.sentAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {email.openedAt ? (
                            <span className="text-sm text-purple-500">
                              {format(new Date(email.openedAt), 'dd MMM HH:mm', { locale: fr })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {email.clickCount && email.clickCount > 0 ? (
                            <Badge variant="secondary">{email.clickCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {filteredEmails.length} email{filteredEmails.length > 1 ? 's' : ''} affiché{filteredEmails.length > 1 ? 's' : ''}
              {searchTerm || statusFilter !== 'all' ? ` (sur ${emails.length} total)` : ''}
            </span>
            {analytics && (
              <span>
                Dernière mise à jour: {format(new Date(analytics.lastUpdated), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </span>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailHistory;
