import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Smartphone, RefreshCw, History, Send } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { invitationsApi } from '@/services/api';
import type { Invitation } from '@/types/models';
import { isInvitationAlreadySent } from '@/utils/invitationUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface InvitationHistoryProps {
  eventId?: string;
  refreshKey?: number;
}

const methodConfig = {
  email: { label: 'Email', icon: Mail, className: 'text-blue-600' },
  whatsapp: { label: 'WhatsApp', icon: WhatsAppIcon, className: 'text-green-600' },
  sms: { label: 'SMS', icon: Smartphone, className: 'text-purple-600' },
} as const;

const InvitationHistory = ({ eventId, refreshKey = 0 }: InvitationHistoryProps) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvitations = async () => {
    if (!eventId) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    try {
      const res = await invitationsApi.getByEvent(eventId);
      const sent = (res.data || [])
        .filter((inv) => isInvitationAlreadySent(inv))
        .sort(
          (a, b) =>
            new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime(),
        );
      setInvitations(sent);
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible de charger l'historique des invitations",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchInvitations();
  }, [eventId, refreshKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInvitations();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Invitations envoyées
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} envoyée{invitations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invité</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Envoyé le</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <Send className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">Aucune invitation envoyée pour cet événement</p>
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((inv) => {
                const method = methodConfig[inv.distributionMethod] || methodConfig.email;
                const MethodIcon = method.icon;
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <p className="font-medium">{inv.guest?.name || 'Invité'}</p>
                      <p className="text-sm text-muted-foreground">
                        {inv.guest?.email || inv.guest?.phone || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('gap-1.5', method.className)}>
                        <MethodIcon className="h-3.5 w-3.5" />
                        {method.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inv.sentAt
                        ? format(new Date(inv.sentAt), 'dd MMM yyyy HH:mm', { locale: fr })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200">
                        Envoyé
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvitationHistory;
