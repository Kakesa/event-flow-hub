import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Database, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { platformApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const CONFIRM_PHRASE = 'NETTOYER';

export interface PurgePreview {
  events: number;
  guests: number;
  invitations: number;
  analytics: number;
  emails: number;
  whatsappLogs: number;
  guestbookMessages: number;
  eventPhotos: number;
  users: number;
  userAvatars: number;
  payments: number;
  tables: number;
  guestGroups: number;
  totalMessages: number;
}

interface TestDataPurgePanelProps {
  onPurged?: () => void;
}

const TestDataPurgePanel = ({ onPurged }: TestDataPurgePanelProps) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<PurgePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformApi.getPurgePreview();
      if (res.success) setPreview(res.data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'aperçu des données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handlePurge = async () => {
    if (confirmPhrase.trim() !== CONFIRM_PHRASE) {
      toast({
        title: 'Confirmation requise',
        description: `Tapez exactement « ${CONFIRM_PHRASE} » pour continuer`,
        variant: 'destructive',
      });
      return;
    }

    setPurging(true);
    try {
      const res = await platformApi.purgeTestData(confirmPhrase.trim());
      if (res.success) {
        toast({
          title: 'Nettoyage terminé',
          description: res.data?.message || 'Les données de test ont été supprimées.',
        });
        setConfirmPhrase('');
        setDialogOpen(false);
        await loadPreview();
        onPurged?.();
      }
    } catch (err) {
      toast({
        title: 'Échec du nettoyage',
        description: err instanceof Error ? err.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setPurging(false);
    }
  };

  const items = preview
    ? [
        { label: 'Utilisateurs (hors super admin)', value: preview.users },
        { label: 'Événements', value: preview.events },
        { label: 'Photos de couverture', value: preview.eventPhotos },
        { label: 'Avatars utilisateurs', value: preview.userAvatars },
        { label: 'Invités', value: preview.guests },
        { label: 'Tables (plan de salle)', value: preview.tables },
        { label: 'Groupes invités', value: preview.guestGroups },
        { label: 'Invitations envoyées', value: preview.invitations },
        { label: 'Messages livre d\'or', value: preview.guestbookMessages },
        { label: 'Historique e-mails', value: preview.emails },
        { label: 'Logs WhatsApp', value: preview.whatsappLogs },
        { label: 'Paiements test', value: preview.payments },
        { label: 'Analytics événements', value: preview.analytics },
      ]
    : [];

  const hasData = items.some((item) => item.value > 0);

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Database className="h-5 w-5" />
          Nettoyage des données de test
        </CardTitle>
        <CardDescription>
          Supprime tous les comptes utilisateurs (sauf super admin), événements, photos, invités, plan de salle
          (tables et groupes), invitations et messages pour repartir sur une base propre avant l&apos;ouverture
          aux vrais utilisateurs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-amber-900 dark:text-amber-100">
            Action <strong>irréversible</strong>. Tous les comptes seront supprimés sauf le <strong>super admin</strong>.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Chargement de l&apos;aperçu…
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            {!hasData && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune donnée de test à supprimer — la plateforme est déjà vide.
              </p>
            )}

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={!hasData || purging}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Nettoyer toutes les données de test
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer le nettoyage complet</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4 text-sm text-muted-foreground">
                      <p>
                        Vous allez supprimer définitivement{' '}
                        <strong>{preview?.users ?? 0} utilisateur(s)</strong>,{' '}
                        <strong>{preview?.events ?? 0} événement(s)</strong>,{' '}
                        <strong>{preview?.guests ?? 0} invité(s)</strong> et toutes les données associées.
                        Seul le compte super admin sera conservé.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="purge-confirm">
                          Tapez <span className="font-mono font-semibold text-foreground">{CONFIRM_PHRASE}</span> pour confirmer
                        </Label>
                        <Input
                          id="purge-confirm"
                          value={confirmPhrase}
                          onChange={(e) => setConfirmPhrase(e.target.value)}
                          placeholder={CONFIRM_PHRASE}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={purging}>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handlePurge();
                    }}
                    disabled={purging || confirmPhrase.trim() !== CONFIRM_PHRASE}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {purging ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Suppression…
                      </>
                    ) : (
                      'Supprimer définitivement'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TestDataPurgePanel;
