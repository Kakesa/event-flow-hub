import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { guestsApi } from '@/services/api';
import type { Guest } from '@/types/models';

interface GuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onImportComplete: (guests: Guest[]) => void;
}

interface ParsedGuest {
  name: string;
  email?: string;
  phone?: string;
  table?: string;
  status: 'pending';
  isValid: boolean;
  errors: string[];
}

const GuestImportModal = ({
  isOpen,
  onClose,
  eventId,
  onImportComplete,
}: GuestImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [importedCount, setImportedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ParsedGuest[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(/[;,\t]/).map(h => h.trim().replace(/"/g, ''));
    const nameIndex = headers.findIndex(h => ['nom', 'name', 'nom complet', 'fullname'].includes(h));
    const emailIndex = headers.findIndex(h => ['email', 'e-mail', 'mail', 'courriel'].includes(h));
    const phoneIndex = headers.findIndex(h => ['telephone', 'téléphone', 'phone', 'tel', 'mobile'].includes(h));
    const tableIndex = headers.findIndex(h => ['table', 'no table', 'numéro de table', 'place'].includes(h));

    if (nameIndex === -1) {
      setErrors(['Colonne "Nom" non trouvée. Assurez-vous que votre fichier contient une colonne "Nom" ou "Name".']);
      return [];
    }

    return lines.slice(1).map(line => {
      const values = line.split(/[;,\t]/).map(v => v.trim().replace(/"/g, ''));
      const name = values[nameIndex] || '';
      const email = emailIndex !== -1 ? values[emailIndex] : undefined;
      const phone = phoneIndex !== -1 ? values[phoneIndex] : undefined;
      const table = tableIndex !== -1 ? values[tableIndex] : undefined;

      const guestErrors: string[] = [];
      if (!name) guestErrors.push('Nom requis');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) guestErrors.push('Email invalide');
      if (phone && !/^[+\d\s()-]{8,}$/.test(phone)) guestErrors.push('Téléphone invalide');

      return {
        name,
        email: email || undefined,
        phone: phone || undefined,
        table: table || undefined,
        status: 'pending' as const,
        isValid: guestErrors.length === 0 && !!name,
        errors: guestErrors,
      };
    }).filter(g => g.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const guests = parseCSV(text);
      setParsedGuests(guests);
      if (guests.length > 0) {
        setStep('preview');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    const validGuests = parsedGuests.filter(g => g.isValid);
    if (validGuests.length === 0) return;

    setStep('importing');
    setImporting(true);
    setProgress(0);
    setImportedCount(0);

    const importedGuests: Guest[] = [];
    const importErrors: string[] = [];

    for (let i = 0; i < validGuests.length; i++) {
      try {
        const res = await guestsApi.create(eventId, {
          name: validGuests[i].name,
          email: validGuests[i].email,
          phone: validGuests[i].phone,
          table: validGuests[i].table,
          status: 'pending',
        });
        if (res.success) {
          importedGuests.push(res.data);
          setImportedCount(prev => prev + 1);
        }
      } catch (err) {
        importErrors.push(`Erreur pour ${validGuests[i].name}`);
      }
      setProgress(((i + 1) / validGuests.length) * 100);
    }

    setImporting(false);
    setErrors(importErrors);
    setStep('complete');
    onImportComplete(importedGuests);
  };

  const handleClose = () => {
    setFile(null);
    setParsedGuests([]);
    setStep('upload');
    setProgress(0);
    setImportedCount(0);
    setErrors([]);
    onClose();
  };

  const validCount = parsedGuests.filter(g => g.isValid).length;
  const invalidCount = parsedGuests.filter(g => !g.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import d'invités
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Cliquez ou glissez un fichier CSV/Excel</p>
              <p className="text-sm text-muted-foreground mt-1">
                Le fichier doit contenir au minimum une colonne "Nom"
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Format attendu :</strong> CSV avec colonnes Nom, Email (optionnel), Téléphone (optionnel), Table (optionnel).
                <br />
                <span className="text-xs">Exemple: Nom;Email;Téléphone;Table</span>
              </AlertDescription>
            </Alert>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.join(', ')}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {validCount} valides
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {invalidCount} invalides
                </Badge>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Statut</th>
                    <th className="p-2 text-left">Nom</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Téléphone</th>
                    <th className="p-2 text-left">Table</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedGuests.slice(0, 50).map((guest, index) => (
                    <tr key={index} className={guest.isValid ? '' : 'bg-destructive/10'}>
                      <td className="p-2">
                        {guest.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </td>
                      <td className="p-2">{guest.name}</td>
                      <td className="p-2">{guest.email || '-'}</td>
                      <td className="p-2">{guest.phone || '-'}</td>
                      <td className="p-2">{guest.table || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedGuests.length > 50 && (
                <p className="p-2 text-center text-sm text-muted-foreground">
                  ... et {parsedGuests.length - 50} autres
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Retour
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Importer {validCount} invité{validCount > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="font-medium">Import en cours...</p>
              <p className="text-sm text-muted-foreground">
                {importedCount} / {validCount} invités importés
              </p>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4 py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <p className="font-medium text-lg">Import terminé !</p>
              <p className="text-muted-foreground">
                {importedCount} invité{importedCount > 1 ? 's' : ''} importé{importedCount > 1 ? 's' : ''} avec succès
              </p>
            </div>
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.length} erreur{errors.length > 1 ? 's' : ''} lors de l'import
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleClose}>Fermer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuestImportModal;