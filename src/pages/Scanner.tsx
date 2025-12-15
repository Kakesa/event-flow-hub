import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, User, Wine, Keyboard } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CameraScanner from '@/components/scanner/CameraScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { qrCodeApi } from '@/services/api';
import type { Guest } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Scanner = () => {
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ guest: Guest; isValid: boolean } | null>(null);
  const { toast } = useToast();

  const handleScan = async (scannedCode?: string) => {
    const codeToScan = scannedCode || code;
    if (!codeToScan.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez entrer un code QR', variant: 'destructive' });
      return;
    }

    setScanning(true);
    try {
      const res = await qrCodeApi.scan(codeToScan);
      setResult(res.data);
      setCode(codeToScan);
      if (res.data.isValid) {
        toast({ title: 'Succès', description: 'QR Code valide - Accès autorisé' });
      } else {
        toast({ title: 'Erreur', description: 'QR Code invalide - Accès refusé', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de scanner le code', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const handleCameraScan = (scannedCode: string) => {
    handleScan(scannedCode);
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">Scanner QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Scannez les QR codes des invités à l'entrée
          </p>
        </div>

        {/* Scanner Tabs */}
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Caméra
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Manuel
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
                  Saisie manuelle
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                    ) : (
                      'Vérifier'
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Utilisez un lecteur de code-barres ou entrez le code manuellement
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Result */}
        {result && (
          <Card
            className={cn(
              'animate-scale-in overflow-hidden',
              result.isValid ? 'border-success' : 'border-destructive'
            )}
          >
            <div
              className={cn(
                'h-2',
                result.isValid ? 'bg-success' : 'bg-destructive'
              )}
            />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full',
                    result.isValid ? 'bg-success/10' : 'bg-destructive/10'
                  )}
                >
                  {result.isValid ? (
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  ) : (
                    <XCircle className="h-8 w-8 text-destructive" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">
                    {result.isValid ? 'Accès autorisé' : 'Accès refusé'}
                  </h3>
                  <p className="text-muted-foreground">
                    {result.isValid
                      ? 'L\'invité peut entrer'
                      : 'Ce code n\'est pas valide'}
                  </p>
                </div>
              </div>

              {result.isValid && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <p className="font-medium">{result.guest.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        result.guest.status === 'confirmed'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-warning/10 text-warning border-warning/20'
                      )}
                    >
                      {result.guest.status === 'confirmed' ? 'Confirmé' : result.guest.status}
                    </Badge>
                  </div>
                  {result.guest.drinkPreference && (
                    <div className="flex items-center gap-3">
                      <Wine className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Boisson préférée</p>
                        <p className="font-medium">{result.guest.drinkPreference}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={handleReset}
              >
                Scanner un autre code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!result && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-4">Comment ça marche ?</h4>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </span>
                  <span>L'invité présente son QR code (reçu par email/WhatsApp)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </span>
                  <span>Utilisez la caméra ou entrez le code manuellement</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  <span>Vérifiez les informations affichées et autorisez l'accès</span>
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