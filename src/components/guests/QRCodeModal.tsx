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
import { qrCodeApi } from '@/services/api';
import { downloadQrCodePng } from '@/utils/downloadQrCode';
import { getGuestCheckInUrl } from '@/utils/qrCode';
import type { Guest } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { getWhatsAppDigits } from '@/utils/phoneUtils';

interface QRCodeModalProps {
  guest: Guest | null;
  open: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ guest, open, onClose }: QRCodeModalProps) => {
  const [qrData, setQrData] = useState<{ qrCode: string; code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && guest) {
      generateQRCode();
    }
  }, [open, guest]);

  const generateQRCode = async () => {
    if (!guest) return;
    setLoading(true);
    try {
      const res = await qrCodeApi.generate(guest.id);
      setQrData(res.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le QR code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const svg = document.querySelector('#qr-code-svg') as SVGSVGElement | null;
    if (!svg || !qrData?.qrCode) return;

    try {
      await downloadQrCodePng(svg, `qrcode-${guest?.name.replace(/\s+/g, '_') || 'invite'}.png`);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code d'invitation</DialogTitle>
          <DialogDescription>
            {guest?.name} - {guest?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : qrData ? (
            <>
              <div className="p-6 bg-white rounded-xl shadow-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={getGuestCheckInUrl(qrData.qrCode)}
                  size={200}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center max-w-xs">
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
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;