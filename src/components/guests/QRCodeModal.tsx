import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Mail, Loader2 } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { qrCodeApi, eventsApi } from '@/services/api';
import { downloadBrandedQrCodePng, QR_LOGO_SETTINGS } from '@/utils/downloadQrCode';
import { getGuestCheckInUrl } from '@/utils/qrCode';
import { getEventCoverUrl } from '@/utils/eventCover';
import type { Guest, Event } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { getWhatsAppDigits } from '@/utils/phoneUtils';

interface QRCodeModalProps {
  guest: Guest | null;
  open: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ guest, open, onClose }: QRCodeModalProps) => {
  const [qrData, setQrData] = useState<{ qrCode: string; code: string; invitationCode?: string } | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !guest) {
      setQrData(null);
      setEvent(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [qrRes, eventRes] = await Promise.all([
          qrCodeApi.generate(guest.id),
          eventsApi.getById(guest.eventId),
        ]);
        setQrData(qrRes.data);
        setEvent(eventRes.data);
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de générer le QR code',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, guest, toast]);

  const handleDownload = async () => {
    const svg = document.querySelector('#qr-code-svg') as SVGSVGElement | null;
    if (!svg || !qrData?.qrCode) return;

    try {
      await downloadBrandedQrCodePng({
        svgElement: svg,
        filename: `qrcode-${guest?.name.replace(/\s+/g, '_') || 'invite'}.png`,
        coverImageUrl: getEventCoverUrl(event),
        guestName: guest?.name,
        eventTitle: event?.title,
        invitationCode: qrData.invitationCode || qrData.code,
      });
      toast({ title: 'Téléchargé', description: 'QR Code téléchargé avec succès' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de télécharger le QR code', variant: 'destructive' });
    }
  };

  const handleSendByEmail = () => {
    if (!guest) return;
    const subject = encodeURIComponent("Votre invitation - QR Code");
    const body = encodeURIComponent(
      `Bonjour ${guest.name},\n\nVeuillez trouver ci-joint votre QR code d'invitation.\n\nPrésentez ce code à l'entrée.\n\nCordialement`
    );
    window.open(`mailto:${guest.email}?subject=${subject}&body=${body}`);
  };

  const handleSendByWhatsApp = () => {
    if (!guest) return;
    const message = encodeURIComponent(
      `Bonjour ${guest.name}! 🎉\n\nVoici votre QR code d'invitation. Présentez-le à l'entrée de l'événement.`
    );
    window.open(`https://wa.me/${getWhatsAppDigits(guest.phone)}?text=${message}`);
  };

  const coverUrl = getEventCoverUrl(event);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div
          className="h-32 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${coverUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 p-6 text-[#faf8f5]">
            <DialogHeader>
              <DialogTitle className="text-[#faf8f5]">QR Code d&apos;invitation</DialogTitle>
              <DialogDescription className="text-[#faf8f5]/85">
                {guest?.name} — {event?.title || guest?.email}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col items-center py-6 -mt-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : qrData ? (
              <>
                <div className="p-4 bg-white rounded-xl shadow-lg border border-[#e8e0d8]">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={getGuestCheckInUrl(qrData.qrCode, qrData.invitationCode || qrData.code)}
                    size={200}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#000000"
                    imageSettings={QR_LOGO_SETTINGS}
                  />
                </div>
                {(qrData.invitationCode || qrData.code) && (
                  <p className="mt-4 font-mono text-base font-semibold tracking-wider text-[#4a5a44]">
                    {qrData.invitationCode || qrData.code}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs">
                  Présentez ce QR code à l&apos;entrée de l&apos;événement
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Erreur lors de la génération</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleDownload} disabled={!qrData}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSendByEmail}
                disabled={!qrData}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSendByWhatsApp}
                disabled={!qrData || !guest?.phone}
              >
                <WhatsAppIcon className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
