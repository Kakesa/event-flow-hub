import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Mail, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { qrCodeApi } from '@/services/api';
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

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-code-svg');
    if (!canvas) return;

    const svg = canvas as SVGElement;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `qrcode-${guest?.name.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);

    toast({ title: 'Téléchargé', description: 'QR Code téléchargé avec succès' });
  };

  const handleSendByEmail = () => {
    if (!guest) return;
    const subject = encodeURIComponent("Votre invitation - QR Code");
    const body = encodeURIComponent(
      `Bonjour ${guest.name},\n\nVeuillez trouver ci-joint votre QR code d'invitation.\n\nCode: ${qrData?.code || ''}\n\nCordialement`
    );
    window.open(`mailto:${guest.email}?subject=${subject}&body=${body}`);
  };

  const handleSendByWhatsApp = () => {
    if (!guest) return;
    const message = encodeURIComponent(
      `Bonjour ${guest.name}! 🎉\n\nVoici votre code d'invitation: ${qrData?.code || ''}\n\nPrésentez ce code à l'entrée de l'événement.`
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
                  value={qrData.code}
                  size={200}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Code: <span className="font-mono font-semibold">{qrData.code}</span>
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
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;