import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Send, CheckCircle2, ChevronRight, SkipForward, AlertCircle, Copy, Check } from 'lucide-react';
import type { Guest, Event } from '@/types/models';
import { invitationsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WhatsAppSenderProps {
  open: boolean;
  onClose: () => void;
  guests: Guest[];
  event: Event | null;
  onSuccess?: () => void;
  customMessage?: string;
}

const WhatsAppSender = ({ 
  open, 
  onClose, 
  guests, 
  event, 
  onSuccess,
  customMessage 
}: WhatsAppSenderProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [copied, setCopied] = useState(false);

  const currentGuest = guests[currentIndex];
  const progress = (currentIndex / guests.length) * 100;

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setSentCount(0);
      setSkippedCount(0);
      setIsFinished(false);
      setSendingStatus('idle');
      setCopied(false);
    }
  }, [open, guests]);

  const buildMessageText = (guest: Guest) => {
    if (!event) return '';
    const rsvpLink = `${window.location.origin}/rsvp/${event.id}/${guest.id}`;
    if (customMessage) {
      return customMessage
        .replace(/{{guestName}}/g, guest.name)
        .replace(/{{eventName}}/g, event.title)
        .replace(/{{eventDate}}/g, new Date(event.date).toLocaleDateString('fr-FR'))
        .replace(/{{eventLocation}}/g, event.location)
        .replace(/{{rsvpLink}}/g, rsvpLink);
    }
    return `*${event.title.toUpperCase()}*\n\n` +
      `📅 *Date:* ${new Date(event.date).toLocaleDateString('fr-FR')}\n` +
      `📍 *Lieu:* ${event.location}\n\n` +
      `Bonjour *${guest.name}*,\n\n` +
      `Vous êtes cordialement invité(e) à cet événement spécial. Nous serions ravis de vous compter parmi nous !\n\n` +
      `👉 *Confirmez votre présence ici :* ${rsvpLink}\n\n` +
      `Nous avons hâte de vous voir! 🥂\n\n` +
      `_HK Events_`;
  };

  const handleCopyLink = async () => {
    if (!currentGuest || !event) return;
    const text = buildMessageText(currentGuest);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Message copié !",
        description: "Collez-le dans WhatsApp pour l'envoyer.",
      });
      try {
        await invitationsApi.send(currentGuest.id, 'whatsapp');
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le message.",
        variant: "destructive",
      });
    }
  };

  const generateWhatsAppMessage = (guest: Guest) => {
    return encodeURIComponent(buildMessageText(guest));
  };

  const handleSend = async () => {
    if (!currentGuest) return;

    if (!currentGuest.phone) {
      toast({
        title: "Numéro manquant",
        description: `L'invité ${currentGuest.name} n'a pas de numéro de téléphone.`,
        variant: "destructive"
      });
      handleSkip();
      return;
    }

    setSendingStatus('sending');

    try {
      // Ouvrir WhatsApp directement avec message pré-rempli
      const message = generateWhatsAppMessage(currentGuest);
      const phone = currentGuest.phone.replace(/\D/g, '');
      const waLink = `https://wa.me/${phone}?text=${message}`;
      window.open(waLink, '_blank');

      // Notifier le backend que l'invitation a été envoyée
      if (event) {
        await invitationsApi.send(currentGuest.id, 'whatsapp');
      }

      setSentCount(prev => prev + 1);
      setSendingStatus('success');

      setTimeout(() => {
        moveToNext();
      }, 1000);
    } catch (error) {
       console.error("Erreur lors de l'envoi WhatsApp:", error);
       toast({
         title: "Erreur",
         description: "Impossible de mettre à jour le statut de l'invitation.",
         variant: "destructive"
       });
       setSendingStatus('idle');
    }
  };

  const handleSkip = () => {
    setSkippedCount(prev => prev + 1);
    moveToNext();
  };

  const moveToNext = () => {
    setSendingStatus('idle');
    if (currentIndex < guests.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !sendingStatus.includes('sending') && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            Assistant d'envoi WhatsApp
          </DialogTitle>
          <DialogDescription>
            {isFinished 
              ? "Tous les messages ont été traités." 
              : `Envoi des invitations pour : ${event?.title}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {!isFinished && currentGuest ? (
            <>
              <div className="space-y-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{currentIndex + 1} / {guests.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className={cn(
                "p-4 rounded-xl border-2 transition-all duration-300",
                sendingStatus === 'sending' ? "border-primary bg-primary/5 animate-pulse" : 
                sendingStatus === 'success' ? "border-green-500 bg-green-50" : "border-border bg-muted/30"
              )}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center border-2 border-primary/20 shadow-sm">
                    <span className="text-lg font-bold text-primary">
                      {currentGuest.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{currentGuest.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      {currentGuest.phone ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          {currentGuest.phone}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                          Pas de numéro
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aperçu du message */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aperçu du message</p>
                <div className="bg-muted/50 p-3 rounded-lg text-xs text-foreground/80 max-h-32 overflow-y-auto whitespace-pre-wrap border border-border">
                  {currentGuest && buildMessageText(currentGuest)}
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground space-y-1.5">
                <p><strong>💡 Astuce :</strong> Si l'envoi automatique ne fonctionne pas comme prévu, utilisez <strong>"Copier le message"</strong> puis collez-le dans WhatsApp.</p>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold">Terminé !</h4>
                <p className="text-muted-foreground">
                  {sentCount} envoyé(s), {skippedCount} ignoré(s).
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isFinished ? (
            <>
              <Button variant="ghost" onClick={handleSkip} disabled={sendingStatus === 'sending'} className="w-full sm:w-auto">
                <SkipForward className="h-4 w-4 mr-2" />
                Ignorer
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                disabled={sendingStatus === 'sending'}
                className="w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier le message
                  </>
                )}
              </Button>
              <Button
                onClick={handleSend}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                disabled={sendingStatus === 'sending' || !currentGuest?.phone}
              >
                {sendingStatus === 'sending' ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Ouverture...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={onClose}>
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppSender;
