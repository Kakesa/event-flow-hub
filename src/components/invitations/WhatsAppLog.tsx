import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Send, Trash2, MessageSquare, Inbox } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import {
  getWhatsAppLog,
  clearWhatsAppLog,
  refreshWhatsAppLog,
  type WhatsAppLogEntry,
} from '@/lib/whatsappLog';

interface WhatsAppLogProps {
  eventId?: string;
}

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const WhatsAppLog = ({ eventId }: WhatsAppLogProps) => {
  const [entries, setEntries] = useState<WhatsAppLogEntry[]>([]);

  const refresh = () => setEntries(getWhatsAppLog(eventId));

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('whatsapp-log-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('whatsapp-log-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, [eventId]);

  const totalCopied = entries.filter(e => e.copiedAt).length;
  const totalSent = entries.filter(e => e.sentAt).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Journal WhatsApp
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi des messages copiés et envoyés par invité.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Copy className="h-3 w-3" /> {totalCopied} copié(s)
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Send className="h-3 w-3" /> {totalSent} envoyé(s)
          </Badge>
          {entries.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Vider le journal">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vider le journal ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprime tous les enregistrements WhatsApp{' '}
                    {eventId ? "de cet événement" : ''}. Elle est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearWhatsAppLog(eventId);
                      refresh();
                    }}
                  >
                    Vider
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p>Aucune action WhatsApp enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Copié le</TableHead>
                  <TableHead>Envoyé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {entries.map(entry => (
                    <motion.tr
                      key={`${entry.eventId}:${entry.guestId}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{entry.guestName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.copiedAt && (
                            <Badge variant="outline" className="gap-1">
                              <Copy className="h-3 w-3" /> Copié
                            </Badge>
                          )}
                          {entry.sentAt && (
                            <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                              <Send className="h-3 w-3" /> Envoyé
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.copiedAt)}
                        {entry.copyCount > 1 && (
                          <span className="ml-1 text-xs">(×{entry.copyCount})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.sentAt)}
                        {entry.sendCount > 1 && (
                          <span className="ml-1 text-xs">(×{entry.sendCount})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {entry.sentAt
                          ? '✅'
                          : entry.copiedAt
                            ? 'En attente d\'envoi'
                            : '—'}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppLog;
