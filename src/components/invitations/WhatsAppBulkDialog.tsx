import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SkipForward, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import type { Event, Guest } from '@/types/models';
import { invitationsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { buildDefaultInviteMessage, guestHasPhone, openWhatsAppInvite } from '@/utils/whatsappInvite';
import { logWhatsAppAction } from '@/lib/whatsappLog';
import { getStoredWhatsAppTemplateId, type WhatsAppTemplateCustomization } from '@/lib/whatsappTemplates';

interface WhatsAppBulkDialogProps {
  open: boolean;
  onClose: () => void;
  guests: Guest[];
  event: Event | null;
  eventId: string;
  templateId?: string;
  customization?: WhatsAppTemplateCustomization;
  buildMessage?: (guest: Guest, event: Event, eventId: string) => string;
  onComplete?: () => void;
}

const WhatsAppBulkDialog = ({
  open,
  onClose,
  guests,
  event,
  eventId,
  templateId = getStoredWhatsAppTemplateId(),
  customization,
  buildMessage,
  onComplete,
}: WhatsAppBulkDialogProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [opening, setOpening] = useState(false);
  const [readyForNext, setReadyForNext] = useState(false);

  const queue = useMemo(() => guests.filter(guestHasPhone), [guests]);
  const skippedNoPhone = guests.length - queue.length;
  const currentGuest = queue[currentIndex];
  const progress = queue.length > 0 ? ((currentIndex + (isDone ? 1 : 0)) / queue.length) * 100 : 100;

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setSentCount(0);
      setSkippedCount(0);
      setIsDone(false);
      setOpening(false);
      setReadyForNext(false);
    }
  }, [open, guests]);

  const finish = () => {
    setIsDone(true);
    onComplete?.();
  };

  const goNext = () => {
    setReadyForNext(false);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!currentGuest || !event || opening) return;

    setOpening(true);
    try {
      const message = buildMessage
        ? buildMessage(currentGuest, event, eventId)
        : buildDefaultInviteMessage(currentGuest, event, eventId, templateId, customization);
      openWhatsAppInvite(currentGuest.phone!, message);

      try {
        await invitationsApi.send(currentGuest.id, eventId, 'whatsapp');
        logWhatsAppAction(eventId, currentGuest.id, currentGuest.name, 'sent');
      } catch (err) {
        console.error(err);
      }

      setSentCount((c) => c + 1);
      setReadyForNext(true);
      toast({
        title: 'WhatsApp ouvert',
        description: `Envoyez le message à ${currentGuest.name}, puis cliquez sur « Étape suivante ».`,
      });
    } finally {
      setOpening(false);
    }
  };

  const handleNextStep = () => {
    goNext();
  };

  const handleSkip = () => {
    setSkippedCount((c) => c + 1);
    goNext();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WhatsAppIcon className="h-5 w-5 text-green-600" />
            Envoi WhatsApp en masse
          </DialogTitle>
          <DialogDescription>
            Ouvrez WhatsApp invité par invité. Chaque clic ouvre une conversation (évite le blocage du navigateur).
          </DialogDescription>
        </DialogHeader>

        {queue.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-amber-500" />
            <p>Aucun invité sélectionné n&apos;a de numéro WhatsApp.</p>
          </div>
        ) : isDone ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
            <p className="font-medium">Envoi terminé</p>
            <p className="text-sm text-muted-foreground">
              {sentCount} ouvert(s) · {skippedCount} passé(s)
              {skippedNoPhone > 0 ? ` · ${skippedNoPhone} sans numéro` : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Invité {currentIndex + 1} / {queue.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <p className="font-semibold text-lg">{currentGuest?.name}</p>
              {currentGuest?.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {currentGuest.phone}
                </p>
              )}
              <Badge
                variant="outline"
                className={
                  readyForNext
                    ? 'text-green-700 border-green-200 bg-green-50'
                    : 'text-muted-foreground border-border bg-background'
                }
              >
                {readyForNext ? 'Message prêt — envoyez dans WhatsApp' : 'Prêt à envoyer'}
              </Badge>
              {event && (
                <div className="mt-3 rounded-md border bg-background p-2 text-xs whitespace-pre-wrap max-h-28 overflow-y-auto text-muted-foreground">
                  {buildMessage
                    ? buildMessage(currentGuest, event, eventId)
                    : buildDefaultInviteMessage(currentGuest, event, eventId, templateId, customization)}
                </div>
              )}
            </div>

            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{sentCount} envoyé(s)</span>
              <span>·</span>
              <span>{skippedCount} passé(s)</span>
              {skippedNoPhone > 0 && (
                <>
                  <span>·</span>
                  <span>{skippedNoPhone} sans numéro ignoré(s)</span>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {queue.length === 0 ? (
            <Button onClick={handleClose} className="w-full">
              Fermer
            </Button>
          ) : isDone ? (
            <Button onClick={handleClose} className="w-full">
              Fermer
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleSkip} disabled={opening}>
                <SkipForward className="h-4 w-4 mr-2" />
                Passer
              </Button>
              {readyForNext ? (
                <Button className="flex-1" onClick={handleNextStep}>
                  Étape suivante
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleOpenWhatsApp}
                  disabled={opening}
                >
                  <WhatsAppIcon className="h-4 w-4 mr-2" />
                  {opening ? 'Ouverture…' : 'Ouvrir WhatsApp'}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppBulkDialog;
