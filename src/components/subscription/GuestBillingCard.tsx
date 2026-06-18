import { Coins, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { GuestBillingStatus } from '@/types/models';
import { GUEST_BILLING_BLOCK } from '@/config/guestPricing';

interface GuestBillingCardProps {
  billing?: GuestBillingStatus | null;
  pricePerGuestFc?: number;
  title?: string;
  compact?: boolean;
  totalsLast?: boolean;
}

const GuestBillingCard = ({
  billing,
  pricePerGuestFc,
  title = 'Facturation invités',
  compact = false,
  totalsLast = false,
}: GuestBillingCardProps) => {
  if (!billing) return null;

  const blockProgress =
    billing.guestCount === 0
      ? 0
      : (billing.guestsInCurrentBlock / GUEST_BILLING_BLOCK) * 100;

  if (compact) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{billing.displayLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {pricePerGuestFc?.toLocaleString('fr-FR')} FC / invité
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {billing.blockProgressLabel}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const blockAmountFc = GUEST_BILLING_BLOCK * (pricePerGuestFc || 0);

  const totalsSection = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Users className="h-4 w-4" />
          Total invités
        </div>
        <p className="text-2xl font-bold">{billing.guestCount}</p>
      </div>
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Coins className="h-4 w-4" />
          Montant total
        </div>
        <p className="text-2xl font-bold">{billing.totalFc.toLocaleString('fr-FR')} FC</p>
      </div>
    </div>
  );

  const palierSection = totalsLast ? (
    <Progress value={blockProgress || (billing.guestCount > 0 ? 100 : 0)} className="h-2" />
  ) : (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Palier de {GUEST_BILLING_BLOCK} invités</span>
        <span className="font-medium">{billing.blockProgressLabel}</span>
      </div>
      <Progress value={blockProgress || (billing.guestCount > 0 ? 100 : 0)} className="h-2" />
      <p className="text-xs text-muted-foreground">
        Exemple : {GUEST_BILLING_BLOCK} invités = {blockAmountFc.toLocaleString('fr-FR')} FC
      </p>
    </div>
  );

  const assignedTariffSection =
    totalsLast && pricePerGuestFc ? (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">Votre tarif assigné est de</p>
        <p className="text-3xl font-bold mt-1">{pricePerGuestFc.toLocaleString('fr-FR')} FC</p>
        <p className="text-sm text-muted-foreground mt-1">par invité</p>
      </div>
    ) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {!totalsLast && (
          <CardDescription>
            Tarif appliqué : {pricePerGuestFc?.toLocaleString('fr-FR')} FC par invité
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {totalsLast ? (
          <>
            {assignedTariffSection}
            {palierSection}
            {totalsSection}
          </>
        ) : (
          <>
            {totalsSection}
            {palierSection}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestBillingCard;
