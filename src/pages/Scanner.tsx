import { useEffect, useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  User,
  Wine,
  Keyboard,
  Search,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CameraScanner from '@/components/scanner/CameraScanner';
import GuestWelcomeMessage from '@/components/scanner/GuestWelcomeMessage';
import GuestCheckInCard from '@/components/scanner/GuestCheckInCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { checkInApi, eventsApi, qrCodeApi } from '@/services/api';
import type { Guest, GuestCheckInCard as GuestCheckInCardType, CheckInMethod, Event } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ScanResult = {
  guest: Guest | GuestCheckInCardType;
  isValid: boolean;
  alreadyCheckedIn?: boolean;
  message?: string;
};

const Scanner = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMethod, setSearchMethod] = useState<CheckInMethod>('SEARCH_NAME');
  const [searchResults, setSearchResults] = useState<GuestCheckInCardType[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestCheckInCardType | null>(null);
  const [validating, setValidating] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await eventsApi.getAll();
        setEvents(res.data);
        if (res.data.length > 0) {
          setSelectedEventId(res.data[0]._id || res.data[0].id);
        }
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les événements',
          variant: 'destructive',
        });
      }
    };
    loadEvents();
  }, [toast]);

  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedGuest(null);
    setCheckInSuccess(null);
  };

  const resetScan = () => {
    setCode('');
    setResult(null);
    setScanning(false);
  };

  const resetAll = () => {
    resetScan();
    resetSearch();
  };

  const handleScan = async (scannedCode?: string) => {
    if (scanning) return;

    const codeToScan = scannedCode || code;
    if (!codeToScan.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez entrer un code QR', variant: 'destructive' });
      return;
    }

    if (!selectedEventId) {
      toast({
        title: 'Événement requis',
        description: 'Sélectionnez l\'événement en cours de contrôle',
        variant: 'destructive',
      });
      return;
    }

    setScanning(true);
    resetSearch();

    try {
      const staffRes = await checkInApi.checkInByQr(selectedEventId, codeToScan);
      setResult({
        guest: staffRes.data!.guest,
        isValid: true,
        message: staffRes.message,
      });
      setCode(codeToScan);
      toast({
        title: 'Bienvenue !',
        description: `${staffRes.data!.guest.name} — entrée enregistrée`,
      });
      return;
    } catch (staffErr: unknown) {
      const err = staffErr as Error & {
        data?: { alreadyCheckedIn?: boolean; guest?: GuestCheckInCardType };
      };
      if (err.data?.alreadyCheckedIn && err.data.guest) {
        setResult({
          guest: err.data.guest,
          isValid: false,
          alreadyCheckedIn: true,
          message: err.message,
        });
        setCode(codeToScan);
        toast({
          title: 'Déjà enregistré',
          description: err.message,
          variant: 'destructive',
        });
        return;
      }
      // Fallback endpoint public si QR hors événement sélectionné
    }

    try {
      const res = await qrCodeApi.scan(codeToScan);
      setResult(res.data);
      setCode(codeToScan);

      if (res.data.isValid) {
        toast({ title: 'Bienvenue !', description: `${res.data.guest?.name} — check-in enregistré` });
      } else if (res.data.alreadyCheckedIn) {
        toast({
          title: 'Déjà enregistré',
          description: res.data.message || 'Cet invité est déjà passé',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Erreur', description: 'QR Code invalide - Accès refusé', variant: 'destructive' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossible de scanner le code';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const handleCameraScan = (scannedCode: string) => {
    handleScan(scannedCode);
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      toast({ title: 'Recherche', description: 'Saisissez un nom, téléphone ou code', variant: 'destructive' });
      return;
    }
    if (!selectedEventId) {
      toast({
        title: 'Événement requis',
        description: 'Sélectionnez l\'événement en cours de contrôle',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    setResult(null);
    setSelectedGuest(null);
    setCheckInSuccess(null);

    try {
      const res = await checkInApi.search(selectedEventId, q);
      const results = res.data?.results || [];
      setSearchMethod(res.data?.method || 'SEARCH_NAME');
      setSearchResults(results);

      if (results.length === 0) {
        toast({ title: 'Aucun résultat', description: 'Aucun invité trouvé pour cette recherche' });
      } else if (results.length === 1) {
        setSelectedGuest(results[0]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Recherche impossible';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const handleValidateEntry = async () => {
    if (!selectedGuest || !selectedEventId) return;

    setValidating(true);
    setCheckInSuccess(null);

    try {
      const res = await checkInApi.checkInGuest(
        selectedEventId,
        selectedGuest.id,
        searchMethod,
      );
      const updated = res.data?.guest;
      if (updated) {
        setSelectedGuest(updated);
      }
      setCheckInSuccess(res.message || 'Entrée enregistrée avec succès.');
      toast({ title: 'Succès', description: 'Entrée enregistrée avec succès.' });
    } catch (err: unknown) {
      const error = err as Error & {
        data?: { guest?: GuestCheckInCardType; alreadyCheckedIn?: boolean };
      };
      if (error.data?.guest) {
        setSelectedGuest(error.data.guest);
      }
      toast({
        title: 'Validation impossible',
        description: error.message || 'Erreur lors de la validation',
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  };

  const selectedEvent = events.find((e) => (e._id || e.id) === selectedEventId);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">Contrôle des invitations</h1>
          <p className="text-muted-foreground mt-1">
            Scannez un QR code ou recherchez un invité manuellement
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Événement en cours</p>
              <Select value={selectedEventId} onValueChange={(v) => { setSelectedEventId(v); resetAll(); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un événement" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev) => {
                    const id = ev._id || ev.id;
                    return (
                      <SelectItem key={id} value={id}>
                        {ev.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedEvent && (
                <p className="text-xs text-muted-foreground">
                  Contrôle pour : <strong>{selectedEvent.title}</strong>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scanner un QR Code
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              QR manuel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="mt-4">
            <CameraScanner onScan={handleCameraScan} isScanning={scanning} />
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-primary" />
                  Saisie manuelle du QR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez le code QR..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                  <Button onClick={() => handleScan()} disabled={scanning}>
                    {scanning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Vérifier'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 shrink-0 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            ou
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Rechercher un invité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nom, téléphone ou code d'invitation (ex. INV-000245)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <p className="text-xs text-muted-foreground">
              Rechercher par : nom · téléphone · code d&apos;invitation — détection automatique
            </p>
            <Button className="w-full" onClick={handleSearch} disabled={searching}>
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recherche…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {searchResults.length > 1 && !selectedGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{searchResults.length} résultats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {searchResults.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGuest(g)}
                  className="w-full flex items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[g.phone, g.invitationCode].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Badge variant="outline">{g.invitationStatus}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {selectedGuest && (
          <Card className="animate-scale-in border-primary/30">
            <CardHeader>
              <CardTitle>Fiche invité</CardTitle>
            </CardHeader>
            <CardContent>
              <GuestCheckInCard
                guest={selectedGuest}
                onValidate={handleValidateEntry}
                validating={validating}
                successMessage={checkInSuccess}
              />
              <Button variant="outline" className="w-full mt-4" onClick={resetSearch}>
                Nouvelle recherche
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card
            className={cn(
              'animate-scale-in overflow-hidden',
              result.isValid
                ? 'border-success'
                : result.alreadyCheckedIn
                  ? 'border-warning'
                  : 'border-destructive',
            )}
          >
            <div
              className={cn(
                'h-2',
                result.isValid
                  ? 'bg-success'
                  : result.alreadyCheckedIn
                    ? 'bg-warning'
                    : 'bg-destructive',
              )}
            />
            <CardContent className="pt-6">
              {result.isValid && result.guest?.name ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  <GuestWelcomeMessage
                    name={result.guest.name}
                    table={'table' in result.guest ? result.guest.table : undefined}
                    variant="staff"
                  />
                  {'invitationCode' in result.guest && result.guest.invitationCode && (
                    <p className="text-center text-sm text-muted-foreground">
                      Code : <strong>{result.guest.invitationCode}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-full',
                      result.alreadyCheckedIn ? 'bg-warning/10' : 'bg-destructive/10',
                    )}
                  >
                    {result.alreadyCheckedIn ? (
                      <User className="h-8 w-8 text-warning" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      {result.alreadyCheckedIn ? 'Déjà enregistré' : 'Accès refusé'}
                    </h3>
                    <p className="text-muted-foreground">
                      {result.message || "Ce code n'est pas valide"}
                    </p>
                  </div>
                </div>
              )}

              {result.alreadyCheckedIn && result.guest && (
                <GuestCheckInCard guest={result.guest as GuestCheckInCardType} />
              )}

              {result.isValid && result.guest && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50 mt-4">
                  {['drinkPreference', 'dietaryRestrictions'].map((key) =>
                    key in result.guest && result.guest[key as keyof typeof result.guest] ? (
                      <div key={key} className="flex items-center gap-3">
                        {key === 'drinkPreference' && <Wine className="h-5 w-5 text-primary" />}
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {key === 'drinkPreference'
                              ? 'Boisson préférée'
                              : 'Restrictions alimentaires'}
                          </p>
                          <p className="font-medium">
                            {String(result.guest[key as keyof typeof result.guest])}
                          </p>
                        </div>
                      </div>
                    ) : null,
                  )}
                  {'status' in result.guest && (
                    <div className="flex items-center gap-3">
                      <Badge
                        className={cn(
                          result.guest.status === 'confirmed'
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-warning/10 text-warning border-warning/20',
                        )}
                      >
                        {result.guest.status === 'confirmed' ? 'Confirmé' : result.guest.status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <Button variant="outline" className="w-full mt-6" onClick={resetScan}>
                Scanner un autre code
              </Button>
            </CardContent>
          </Card>
        )}

        {!result && !selectedGuest && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-4">Comment ça marche ?</h4>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </span>
                  <span>Sélectionnez l&apos;événement en cours de contrôle</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </span>
                  <span>Scannez le QR code ou recherchez l&apos;invité (nom, téléphone, code)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  <span>Pour la recherche manuelle, validez l&apos;entrée après vérification de la fiche</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
