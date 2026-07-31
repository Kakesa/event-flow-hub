import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, PartyPopper, Shield } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import {
  buildWelcomeAccountGreeting,
  buildWelcomeWhatsAppMessage,
  WELCOME_ACCOUNT_FEATURES,
  PRIMARY_WHATSAPP,
  SECONDARY_WHATSAPP,
} from '@/content/welcomeAccountMessage';

interface WelcomeAccountDialogProps {
  open: boolean;
  userName: string;
  onWhatsAppContacted: () => void;
}

const WelcomeAccountDialog = ({
  open,
  userName,
  onWhatsAppContacted,
}: WelcomeAccountDialogProps) => {
  const whatsappUrl = `https://wa.me/${PRIMARY_WHATSAPP.wa}?text=${encodeURIComponent(
    buildWelcomeWhatsAppMessage(userName),
  )}`;

  const secondaryWhatsappUrl = `https://wa.me/${SECONDARY_WHATSAPP.wa}?text=${encodeURIComponent(
    buildWelcomeWhatsAppMessage(userName),
  )}`;

  const handleWhatsAppClick = () => {
    onWhatsAppContacted();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSecondaryWhatsAppClick = () => {
    onWhatsAppContacted();
    window.open(secondaryWhatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto border-[#e8e0d8] p-0 z-[100] [&>button.absolute]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-br from-[#4a5a44] to-[#7a8b72] px-6 py-8 text-[#faf8f5]">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-2 text-[#d4bc94]">
              <PartyPopper className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.2em]">Bienvenue</span>
            </div>
            <DialogTitle className="text-2xl font-display text-[#faf8f5]">
              {buildWelcomeAccountGreeting(userName)}
            </DialogTitle>
            <DialogDescription className="text-[#faf8f5]/90 text-base">
              Félicitations ! Votre inscription sur HK Events est confirmée avec succès.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5 text-[#4a5a44]">
          <p className="text-sm leading-relaxed">
            Vous êtes désormais prêt(e) à vivre une nouvelle expérience dans la gestion de vos
            événements.
          </p>

          <div>
            <p className="text-sm font-semibold mb-3">Avec HK Events, vous pouvez :</p>
            <ul className="space-y-2">
              {WELCOME_ACCOUNT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#b8956c] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50/80 p-4 space-y-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-green-800 shrink-0 mt-0.5" />
              <p className="text-sm text-green-950 leading-relaxed font-medium">
                Pour activer votre compte, contactez-nous sur WhatsApp. Cette étape est
                obligatoire pour continuer :
              </p>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#25D366] px-4 py-4 text-white font-semibold shadow-md hover:bg-[#1ebe5d] transition-colors"
            >
              <WhatsAppIcon className="h-6 w-6" />
              <span className="text-left">
                <span className="block text-xs font-normal opacity-90">Contacter maintenant</span>
                {PRIMARY_WHATSAPP.display}
              </span>
            </button>

            <p className="text-xs text-center text-green-900">
              Autre numéro :{' '}
              <button
                type="button"
                onClick={handleSecondaryWhatsAppClick}
                className="font-medium underline underline-offset-2 hover:text-green-950"
              >
                {SECONDARY_WHATSAPP.display}
              </button>
            </p>
          </div>

          <p className="text-sm text-[#7a8b72] italic text-center">
            Merci de faire confiance à HK Events. Nous vous souhaitons une excellente expérience !
          </p>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-none uppercase tracking-wider"
          >
            <WhatsAppIcon className="h-4 w-4 mr-2" />
            Écrire sur WhatsApp — {PRIMARY_WHATSAPP.display}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeAccountDialog;
