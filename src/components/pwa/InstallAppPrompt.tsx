import { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePwaInstall } from '@/hooks/usePwaInstall';

interface InstallAppPromptProps {
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
}

const InstallAppPrompt = ({ open, onClose, onDismiss }: InstallAppPromptProps) => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isInstalled && open) {
      onClose();
    }
  }, [isInstalled, open, onClose]);

  if (!open || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const result = await promptInstall();
      if (result.outcome === 'accepted' || result.outcome === 'dismissed') {
        onClose();
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl overflow-hidden border border-border shrink-0">
                <img src="/pwa-icon-192.png" alt="HK Event" className="h-full w-full object-contain bg-[#1a1a2e]" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Installer HK Event</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez l&apos;application sur votre téléphone pour un accès rapide.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Fermer">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isIOS ? (
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Sur iPhone / iPad
              </p>
              <p>1. Appuyez sur le bouton Partager dans Safari</p>
              <p>2. Choisissez <strong>Sur l&apos;écran d&apos;accueil</strong></p>
              <p>3. Validez pour ajouter l&apos;icône HK Event</p>
            </div>
          ) : canInstall ? (
            <Button className="w-full" onClick={handleInstall} disabled={installing}>
              <Download className="h-4 w-4 mr-2" />
              {installing ? 'Installation...' : 'Ajouter à l\'écran d\'accueil'}
            </Button>
          ) : (
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              Ouvrez HK Event dans Chrome ou Edge sur votre téléphone, puis utilisez le menu
              du navigateur pour <strong>Installer l&apos;application</strong>.
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onDismiss}>
            Plus tard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallAppPrompt;
