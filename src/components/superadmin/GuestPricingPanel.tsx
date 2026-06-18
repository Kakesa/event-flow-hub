import { useEffect, useState } from 'react';
import { Coins, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { platformApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { NEGOTIATED_GUEST_PRICES_FC } from '@/config/guestPricing';
import type { PlatformPricingSettings } from '@/types/models';

const GuestPricingPanel = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformPricingSettings | null>(null);
  const [defaultPrice, setDefaultPrice] = useState('1500');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi.getSettings()
      .then((res) => {
        if (res.success) {
          setSettings(res.data);
          setDefaultPrice(String(res.data.defaultGuestPriceFc));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const value = Number(defaultPrice);
    if (!Number.isFinite(value) || value <= 0) {
      toast({ title: 'Erreur', description: 'Prix invalide', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await platformApi.updateSettings({ defaultGuestPriceFc: value });
      if (res.success) {
        setSettings(res.data);
        toast({ title: 'Enregistré', description: 'Prix par défaut mis à jour' });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-32 flex items-center justify-center text-muted-foreground">Chargement...</div>;
  }

  const negotiated = settings?.negotiatedPricesFc || [...NEGOTIATED_GUEST_PRICES_FC];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Tarification par invité
          </CardTitle>
          <CardDescription>
            Prix par défaut pour les organisateurs. Les admins voient ce tarif pour leurs discussions commerciales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="default-guest-price">Prix par défaut (FC / invité)</Label>
            <div className="flex gap-2">
              <Input
                id="default-guest-price"
                type="number"
                min={1}
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
              />
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '...' : 'Enregistrer'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tarifs négociés disponibles par organisateur</p>
            <div className="flex flex-wrap gap-2">
              {negotiated.map((price) => (
                <Badge key={price} variant={Number(defaultPrice) === price ? 'default' : 'outline'}>
                  {price.toLocaleString('fr-FR')} FC
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Assignez l&apos;un de ces tarifs à un organisateur dans l&apos;onglet Abonnements. L&apos;admin facturera ce montant.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestPricingPanel;
