import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Bell, Palette, Shield, CreditCard, Save, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentDialog } from '@/components/settings/PaymentDialog';
import { paymentsApi } from '@/services/api';
import {
  SUBSCRIPTION_PLANS,
  SELLABLE_PLANS,
  getPlanDefinition,
  formatPlanLimit,
} from '@/config/subscriptionPlans';
import type { SubscriptionType } from '@/types/models';

const Settings = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'subscription' ? 'subscription' : 'profile';
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    confirmations: true,
    messages: true,
  });
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; plan: string; amount: number }>({
    isOpen: false,
    plan: '',
    amount: 0,
  });
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({ title: 'Succès', description: 'Profil mis à jour' });
  };

  const handleSaveNotifications = () => {
    toast({ title: 'Succès', description: 'Préférences de notifications mises à jour' });
  };

  const handleUpgrade = (plan: SubscriptionType) => {
    const planDef = getPlanDefinition(plan);
    setPaymentModal({
      isOpen: true,
      plan,
      amount: planDef.price,
    });
  };

  const currentPlan = getPlanDefinition(user?.subscriptionType);

  const handlePaymentSuccess = async () => {
    // Dans une vraie app, on attendrait le webhook. 
    // Ici, on simule la mise à jour immédiate pour le plaisir de l'UI.
    toast({
      title: 'Succès',
      description: `Votre plan passera en ${paymentModal.plan} sous peu.`,
    });
    
    // On peut tenter un refresh du profil
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre compte et vos préférences
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Abonnement</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                    </span>
                  </div>
                  <Button variant="outline">Changer la photo</Button>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Canaux de notification</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications par email</p>
                        <p className="text-sm text-muted-foreground">Recevez des emails pour les mises à jour importantes</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-sm text-muted-foreground">Notifications dans votre navigateur</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS</p>
                        <p className="text-sm text-muted-foreground">Recevez des SMS pour les alertes urgentes</p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Types de notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Confirmations de présence</p>
                        <p className="text-sm text-muted-foreground">Quand un invité confirme ou décline</p>
                      </div>
                      <Switch
                        checked={notifications.confirmations}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, confirmations: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Messages du livre d'or</p>
                        <p className="text-sm text-muted-foreground">Quand un invité laisse un message</p>
                      </div>
                      <Switch
                        checked={notifications.messages}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Mon abonnement</CardTitle>
                <CardDescription>
                  Choisissez le plan adapté à votre événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg gradient-gold flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          Plan {currentPlan.label}
                        </h4>
                        <Badge className="bg-primary text-primary-foreground">Actif</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan.features.join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {currentPlan.price === 0 ? 'Gratuit' : `$${currentPlan.price}`}
                    </p>
                    {currentPlan.price > 0 && (
                      <p className="text-sm text-muted-foreground">/mois</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <p className="text-2xl font-bold">{formatPlanLimit(currentPlan.maxEvents)}</p>
                    <p className="text-sm text-muted-foreground">Événements</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-2xl font-bold">{formatPlanLimit(currentPlan.maxGuests)}</p>
                    <p className="text-sm text-muted-foreground">Invités</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {SELLABLE_PLANS.map((planId) => {
                    const plan = SUBSCRIPTION_PLANS[planId];
                    const isCurrent = (user?.subscriptionType || 'free') === planId;
                    return (
                      <div
                        key={planId}
                        className={`rounded-lg border p-4 space-y-3 ${isCurrent ? 'border-primary bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold">{plan.label}</h4>
                          {isCurrent && <Badge variant="secondary">Actuel</Badge>}
                        </div>
                        <p className="text-2xl font-bold">
                          {plan.price === 0 ? 'Gratuit' : `$${plan.price}`}
                          {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
                        </p>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {!isCurrent && plan.price > 0 && (
                          <Button
                            className="w-full"
                            variant={planId === 'premium' ? 'default' : 'outline'}
                            onClick={() => handleUpgrade(planId)}
                            disabled={loadingPayment}
                          >
                            Choisir {plan.label}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {user?.subscriptionType && user.subscriptionType !== 'free' && (
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    Annuler l'abonnement
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Changer de mot de passe</h4>
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <Button>Mettre à jour le mot de passe</Button>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Authentification à deux facteurs</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez une couche de sécurité supplémentaire à votre compte
                      </p>
                    </div>
                    <Button variant="outline">Activer</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PaymentDialog 
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        plan={paymentModal.plan}
        amount={paymentModal.amount}
        onSuccess={handlePaymentSuccess}
      />
    </DashboardLayout>
  );
};

export default Settings;
