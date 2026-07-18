import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/types/models';
import { usersApi } from '@/services/api';

interface OrganizerGuestQuotaDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const OrganizerGuestQuotaDialog = ({
  user,
  open,
  onOpenChange,
  onSaved,
}: OrganizerGuestQuotaDialogProps) => {
  const [quota, setQuota] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && user) {
      setQuota(user.maxGuests != null ? String(user.maxGuests) : '');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!user) return;

    const userId = user._id || user.id;
    if (!userId) return;

    if (quota.trim() !== '' && (!/^\d+$/.test(quota.trim()) || Number(quota) < 0)) {
      setError('Nombre entier positif ou vide.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await usersApi.update(userId, {
        maxGuests: quota.trim() === '' ? null : Number(quota.trim()),
      });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-sm p-4 gap-3">
        <DialogHeader className="space-y-1 pb-0">
          <DialogTitle className="text-base">Quota d&apos;invités</DialogTitle>
          <DialogDescription className="text-xs">
            {user?.name} — total tous événements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="organizer-max-guests" className="text-xs">
            Nombre maximum d&apos;invités
          </Label>
          <Input
            id="organizer-max-guests"
            type="number"
            min={0}
            step={1}
            placeholder="Ex. 200"
            className="h-9"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="pt-1">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizerGuestQuotaDialog;
