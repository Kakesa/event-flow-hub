import DashboardLayout from '@/components/layout/DashboardLayout';
import GuestBillingCard from '@/components/subscription/GuestBillingCard';
import GuestPricingPanel from '@/components/superadmin/GuestPricingPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { GUEST_BILLING_BLOCK } from '@/config/guestPricing';

const Tarification = () => {
  const { user } = useAuth();
  const { limits } = useSubscriptionLimits();

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const appliedPriceFc = limits?.pricePerGuestFc ?? user?.guestPriceFc ?? null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Tarification</h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? 'Prix par défaut et tarifs négociés de la plateforme'
              : isAdmin
                ? 'Tarif qui vous a été appliqué'
                : 'Suivi de votre facturation invités'}
          </p>
        </div>

        {isSuperAdmin && <GuestPricingPanel />}

        {isAdmin && limits?.billing && (
          <GuestBillingCard
            billing={limits.billing}
            pricePerGuestFc={limits.pricePerGuestFc}
            title="Votre tarif invité"
            totalsLast
          />
        )}

        {isAdmin && !limits?.billing && appliedPriceFc !== null && (
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Votre tarif invité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{appliedPriceFc.toLocaleString('fr-FR')} FC</p>
              <p className="text-sm text-muted-foreground mt-1">
                par invité · palier de {GUEST_BILLING_BLOCK} = {(appliedPriceFc * GUEST_BILLING_BLOCK).toLocaleString('fr-FR')} FC
              </p>
            </CardContent>
          </Card>
        )}

        {!isAdmin && limits?.billing && (
          <GuestBillingCard
            billing={limits.billing}
            pricePerGuestFc={limits.pricePerGuestFc}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tarification;
