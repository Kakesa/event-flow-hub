import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, PartyPopper } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { seatingApi } from '@/services/api';
import { toast } from 'sonner';

type SetupMethod = 'by_table_count' | 'by_capacity';

const TableSetupWizard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isWelcome = searchParams.get('welcome') === '1';

  const [step, setStep] = useState(isWelcome ? 0 : 1);
  const [expectedGuestCount, setExpectedGuestCount] = useState(200);
  const [method, setMethod] = useState<SetupMethod>('by_table_count');
  const [tableCount, setTableCount] = useState(20);
  const [capacityPerTable, setCapacityPerTable] = useState(10);
  const [loading, setLoading] = useState(false);

  const computedCapacity =
    method === 'by_table_count'
      ? Math.ceil(expectedGuestCount / Math.max(1, tableCount))
      : capacityPerTable;

  const computedTableCount =
    method === 'by_capacity'
      ? Math.ceil(expectedGuestCount / Math.max(1, capacityPerTable))
      : tableCount;

  const handleSkip = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      await seatingApi.skipSetup(eventId);
      toast.message('Configuration reportée');
      navigate(`/events/${eventId}/tables`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      await seatingApi.generateTables(eventId, {
        expectedGuestCount,
        method,
        tableCount: method === 'by_table_count' ? tableCount : undefined,
        capacityPerTable: method === 'by_capacity' ? capacityPerTable : undefined,
      });
      await seatingApi.createPresetGroups(eventId);
      toast.success(`${computedTableCount} tables créées avec succès`);
      navigate(`/events/${eventId}/tables`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!eventId) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Événement introuvable.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Configuration des tables</h1>
          <p className="mt-1 text-muted-foreground">
            Organisez votre plan de salle en quelques étapes.
          </p>
        </div>

        {step === 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <PartyPopper className="h-5 w-5" />
                <CardTitle>Votre événement a été créé avec succès</CardTitle>
              </div>
              <CardDescription>
                La prochaine étape consiste à organiser vos invités par table.
                Souhaitez-vous configurer vos tables maintenant ?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => setStep(1)}>Configurer les tables</Button>
              <Button variant="outline" onClick={handleSkip} disabled={loading}>
                Plus tard
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Étape 1 — Nombre d&apos;invités</CardTitle>
              <CardDescription>Combien de personnes souhaitez-vous inviter ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestCount">Nombre d&apos;invités attendus</Label>
                <Input
                  id="guestCount"
                  type="number"
                  min={1}
                  value={expectedGuestCount}
                  onChange={(e) => setExpectedGuestCount(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">Exemple : 200 invités</p>
              </div>
              <div className="flex justify-between">
                {isWelcome ? (
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => navigate(`/events/${eventId}/tables`)}>
                    Annuler
                  </Button>
                )}
                <Button onClick={() => setStep(2)} disabled={expectedGuestCount < 1}>
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Étape 2 — Méthode de configuration</CardTitle>
              <CardDescription>Choisissez comment répartir vos {expectedGuestCount} invités.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as SetupMethod)}
                className="space-y-4"
              >
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="by_table_count" id="by_table_count" />
                    <Label htmlFor="by_table_count" className="font-medium">
                      Méthode A — Nombre de tables
                    </Label>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={tableCount}
                    onChange={(e) => setTableCount(Number(e.target.value) || 0)}
                    disabled={method !== 'by_table_count'}
                  />
                  {method === 'by_table_count' && (
                    <p className="text-sm text-muted-foreground">
                      {expectedGuestCount} ÷ {tableCount} = <strong>{computedCapacity}</strong> invités par table
                    </p>
                  )}
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="by_capacity" id="by_capacity" />
                    <Label htmlFor="by_capacity" className="font-medium">
                      Méthode B — Places par table
                    </Label>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={capacityPerTable}
                    onChange={(e) => setCapacityPerTable(Number(e.target.value) || 0)}
                    disabled={method !== 'by_capacity'}
                  />
                  {method === 'by_capacity' && (
                    <p className="text-sm text-muted-foreground">
                      {expectedGuestCount} ÷ {capacityPerTable} = <strong>{computedTableCount}</strong> tables
                    </p>
                  )}
                </div>
              </RadioGroup>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button onClick={() => setStep(3)}>
                  Voir le résumé
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la configuration</CardTitle>
              <CardDescription>Vérifiez avant de créer les tables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>Invités attendus : <strong>{expectedGuestCount}</strong></li>
                <li>Nombre de tables : <strong>{computedTableCount}</strong></li>
                <li>Capacité par table : <strong>{computedCapacity}</strong></li>
                <li>Capacité totale : <strong>{computedTableCount * computedCapacity}</strong></li>
              </ul>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button onClick={handleGenerate} disabled={loading}>
                  <Check className="mr-2 h-4 w-4" />
                  {loading ? 'Création…' : 'Créer les tables'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TableSetupWizard;
