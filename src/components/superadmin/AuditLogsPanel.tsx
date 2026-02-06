import { useState, useEffect } from 'react';
import {
  Shield, Search, Filter, Download, Eye, UserCheck,
  UserX, Edit, Trash2, Lock, Unlock, CreditCard,
  Calendar, Settings, AlertTriangle, Clock, User,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { auditApi } from '@/services/api';

// Types pour les logs d'audit
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  category: AuditCategory;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, unknown>;
  previousValue?: unknown;
  newValue?: unknown;
  status: 'success' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type AuditCategory = 
  | 'authentication'
  | 'user_management'
  | 'subscription'
  | 'event_management'
  | 'settings'
  | 'security'
  | 'data_export'
  | 'impersonation';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'role_change'
  | 'user_created'
  | 'user_deleted'
  | 'user_activated'
  | 'user_deactivated'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'subscription_cancelled'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'permission_changed'
  | 'settings_updated'
  | 'data_exported'
  | 'impersonation_started'
  | 'impersonation_ended';

interface AuditLogsPanelProps {
  className?: string;
}

// Mock data pour la démonstration
const generateMockAuditLogs = (): AuditLog[] => {
  const logs: AuditLog[] = [];
  const actions: Array<{
    action: AuditAction;
    category: AuditCategory;
    severity: AuditLog['severity'];
    resourceType: string;
  }> = [
    { action: 'login', category: 'authentication', severity: 'low', resourceType: 'session' },
    { action: 'role_change', category: 'user_management', severity: 'high', resourceType: 'user' },
    { action: 'user_deleted', category: 'user_management', severity: 'critical', resourceType: 'user' },
    { action: 'subscription_upgraded', category: 'subscription', severity: 'medium', resourceType: 'subscription' },
    { action: 'event_deleted', category: 'event_management', severity: 'high', resourceType: 'event' },
    { action: 'impersonation_started', category: 'impersonation', severity: 'critical', resourceType: 'session' },
    { action: 'permission_changed', category: 'security', severity: 'high', resourceType: 'permission' },
    { action: 'settings_updated', category: 'settings', severity: 'medium', resourceType: 'settings' },
    { action: 'login_failed', category: 'authentication', severity: 'medium', resourceType: 'session' },
  ];

  const users = [
    { id: '1', name: 'Jean Dupont', email: 'jean@example.com', role: 'admin' },
    { id: '2', name: 'Marie Martin', email: 'marie@example.com', role: 'organizer' },
    { id: '3', name: 'Pierre Bernard', email: 'pierre@example.com', role: 'user' },
    { id: '4', name: 'Super Admin', email: 'super@admin.com', role: 'superadmin' },
  ];

  for (let i = 0; i < 50; i++) {
    const actionInfo = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    logs.push({
      id: `audit-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: actionInfo.action,
      category: actionInfo.category,
      resourceType: actionInfo.resourceType,
      resourceId: `res-${Math.floor(Math.random() * 1000)}`,
      resourceName: actionInfo.resourceType === 'user' ? users[Math.floor(Math.random() * users.length)].name : `Ressource ${i}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        browser: 'Chrome',
        os: 'Windows 10',
        location: 'Paris, France',
      },
      previousValue: actionInfo.action === 'role_change' ? { role: 'user' } : undefined,
      newValue: actionInfo.action === 'role_change' ? { role: 'admin' } : undefined,
      status: Math.random() > 0.1 ? 'success' : (Math.random() > 0.5 ? 'failed' : 'warning'),
      severity: actionInfo.severity,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const AuditLogsPanel = ({ className }: AuditLogsPanelProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await auditApi.getLogs();
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (error) {
        console.error('Erreur logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [categoryFilter, severityFilter]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (error) {
      console.error('Erreur refresh logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Utilisateur', 'Email', 'Action', 'Catégorie', 'Sévérité', 'Statut', 'Adresse IP'].join(','),
      ...logs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.userName,
        log.userEmail,
        log.action,
        log.category,
        log.severity,
        log.status,
        log.ipAddress,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getActionIcon = (action: AuditAction) => {
    const icons: Record<string, React.ReactNode> = {
      login: <User className="h-4 w-4 text-green-500" />,
      logout: <User className="h-4 w-4 text-gray-500" />,
      login_failed: <AlertTriangle className="h-4 w-4 text-red-500" />,
      password_change: <Lock className="h-4 w-4 text-blue-500" />,
      role_change: <Shield className="h-4 w-4 text-purple-500" />,
      user_created: <UserCheck className="h-4 w-4 text-green-500" />,
      user_deleted: <Trash2 className="h-4 w-4 text-red-500" />,
      user_activated: <Unlock className="h-4 w-4 text-green-500" />,
      user_deactivated: <UserX className="h-4 w-4 text-orange-500" />,
      subscription_upgraded: <CreditCard className="h-4 w-4 text-emerald-500" />,
      subscription_downgraded: <CreditCard className="h-4 w-4 text-yellow-500" />,
      subscription_cancelled: <CreditCard className="h-4 w-4 text-red-500" />,
      event_created: <Calendar className="h-4 w-4 text-blue-500" />,
      event_updated: <Edit className="h-4 w-4 text-blue-500" />,
      event_deleted: <Trash2 className="h-4 w-4 text-red-500" />,
      permission_changed: <Shield className="h-4 w-4 text-amber-500" />,
      settings_updated: <Settings className="h-4 w-4 text-gray-500" />,
      data_exported: <Download className="h-4 w-4 text-blue-500" />,
      impersonation_started: <Eye className="h-4 w-4 text-red-600" />,
      impersonation_ended: <Eye className="h-4 w-4 text-green-600" />,
    };
    return icons[action] || <Clock className="h-4 w-4" />;
  };

  const getActionLabel = (action: AuditAction): string => {
    const labels: Record<AuditAction, string> = {
      login: 'Connexion',
      logout: 'Déconnexion',
      login_failed: 'Échec de connexion',
      password_change: 'Changement de mot de passe',
      role_change: 'Changement de rôle',
      user_created: 'Utilisateur créé',
      user_deleted: 'Utilisateur supprimé',
      user_activated: 'Utilisateur activé',
      user_deactivated: 'Utilisateur désactivé',
      subscription_upgraded: 'Abonnement mis à niveau',
      subscription_downgraded: 'Abonnement rétrogradé',
      subscription_cancelled: 'Abonnement annulé',
      event_created: 'Événement créé',
      event_updated: 'Événement modifié',
      event_deleted: 'Événement supprimé',
      permission_changed: 'Permission modifiée',
      settings_updated: 'Paramètres modifiés',
      data_exported: 'Données exportées',
      impersonation_started: 'Usurpation démarrée',
      impersonation_ended: 'Usurpation terminée',
    };
    return labels[action] || action;
  };

  const getCategoryLabel = (category: AuditCategory): string => {
    const labels: Record<AuditCategory, string> = {
      authentication: 'Authentification',
      user_management: 'Gestion des utilisateurs',
      subscription: 'Abonnements',
      event_management: 'Gestion des événements',
      settings: 'Paramètres',
      security: 'Sécurité',
      data_export: 'Export de données',
      impersonation: 'Usurpation',
    };
    return labels[category] || category;
  };

  const getSeverityBadge = (severity: AuditLog['severity']) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      low: { variant: 'outline', className: 'text-green-600 border-green-600' },
      medium: { variant: 'outline', className: 'text-yellow-600 border-yellow-600' },
      high: { variant: 'outline', className: 'text-orange-600 border-orange-600' },
      critical: { variant: 'destructive', className: '' },
    };
    const c = config[severity] || config.low;
    return <Badge variant={c.variant} className={c.className}>{severity}</Badge>;
  };

  const getStatusBadge = (status: AuditLog['status']) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      success: { variant: 'default', className: 'bg-green-600' },
      failed: { variant: 'destructive', className: '' },
      warning: { variant: 'outline', className: 'text-yellow-600 border-yellow-600' },
    };
    const c = config[status] || config.success;
    return <Badge variant={c.variant} className={c.className}>{status}</Badge>;
  };

  const filteredLogs = logs.filter(log => {
    const userName = log.userName || '';
    const userEmail = log.userEmail || '';
    const action = log.action || '';
    const resourceName = log.resourceName || '';

    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Logs d'audit
              </CardTitle>
              <CardDescription>
                Traçabilité complète des actions sensibles sur la plateforme
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par utilisateur, action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                  <ChevronDown className={cn('h-4 w-4 ml-2 transition-transform', isFiltersOpen && 'rotate-180')} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleContent>
              <div className="flex gap-4 pt-4 border-t">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="authentication">Authentification</SelectItem>
                    <SelectItem value="user_management">Gestion utilisateurs</SelectItem>
                    <SelectItem value="subscription">Abonnements</SelectItem>
                    <SelectItem value="event_management">Événements</SelectItem>
                    <SelectItem value="security">Sécurité</SelectItem>
                    <SelectItem value="impersonation">Usurpation</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sévérité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sévérités</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Sévérité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className={cn(
                      log.severity === 'critical' && 'bg-red-500/5',
                      log.severity === 'high' && 'bg-orange-500/5'
                    )}
                  >
                    <TableCell className="font-mono text-xs">
                      <div>{log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy', { locale: fr }) : '-'}</div>
                      <div className="text-muted-foreground">
                        {log.timestamp ? format(new Date(log.timestamp), 'HH:mm:ss') : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{log.userName || 'Système'}</p>
                          <p className="text-xs text-muted-foreground">{log.userEmail || '-'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-medium">{getActionLabel(log.action)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase">{log.category}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{log.resourceType}</span>
                        {log.resourceName && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            {log.resourceName}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getActionIcon(selectedLog.action)}
              Détails du log d'audit
            </DialogTitle>
            <DialogDescription>
              {selectedLog && formatDistanceToNow(new Date(selectedLog.timestamp), { addSuffix: true, locale: fr })}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <p className="text-sm">{getActionLabel(selectedLog.action)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                  <p className="text-sm">{getCategoryLabel(selectedLog.category)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Utilisateur</p>
                  <p className="text-sm">{selectedLog.userName} ({selectedLog.userEmail})</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                  <Badge variant="outline" className="capitalize">{selectedLog.userRole}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Adresse IP</p>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p className="text-sm font-mono">
                    {format(new Date(selectedLog.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
                  </p>
                </div>
              </div>

              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Changements</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.previousValue && (
                      <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                        <p className="text-xs font-medium text-red-600 mb-1">Avant</p>
                        <pre className="text-xs">{JSON.stringify(selectedLog.previousValue, null, 2)}</pre>
                      </div>
                    )}
                    {selectedLog.newValue && (
                      <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                        <p className="text-xs font-medium text-green-600 mb-1">Après</p>
                        <pre className="text-xs">{JSON.stringify(selectedLog.newValue, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Métadonnées</p>
                <div className="p-3 rounded bg-muted">
                  <pre className="text-xs overflow-auto">{JSON.stringify(selectedLog.details, null, 2)}</pre>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                User Agent: {selectedLog.userAgent}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogsPanel;
