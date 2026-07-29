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
import { Label } from '@/components/ui/label';
import GuestTableSelector from './GuestTableSelector';
import type { Guest, GuestGroup, SeatingTable } from '@/types/models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GuestAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Guest | null;
  tables: SeatingTable[];
  groups?: GuestGroup[];
  onAssignTable: (guestId: string, tableId: string | null) => Promise<void>;
  onAssignGroup?: (guestId: string, groupId: string | null) => Promise<void>;
}

export default function GuestAssignmentModal({
  open,
  onOpenChange,
  guest,
  tables,
  groups = [],
  onAssignTable,
  onAssignGroup,
}: GuestAssignmentModalProps) {
  const [tableId, setTableId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetFromGuest = () => {
    if (!guest) return;
    const currentTableId =
      typeof guest.tableId === 'object' && guest.tableId
        ? guest.tableId.id
        : (guest.tableId as string | null) || null;
    const currentGroupId =
      typeof guest.groupId === 'object' && guest.groupId
        ? guest.groupId.id
        : (guest.groupId as string | null) || null;
    setTableId(currentTableId);
    setGroupId(currentGroupId);
    setError('');
  };

  const handleOpenChange = (next: boolean) => {
    if (next) resetFromGuest();
    onOpenChange(next);
  };

  const handleSave = async () => {
    if (!guest) return;
    setLoading(true);
    setError('');
    try {
      await onAssignTable(guest.id, tableId);
      if (onAssignGroup) {
        await onAssignGroup(guest.id, groupId);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'affectation');
    } finally {
      setLoading(false);
    }
  };

  if (!guest) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Affecter {guest.name}</DialogTitle>
          <DialogDescription>
            Choisissez une table et éventuellement un groupe pour cet invité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {tables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune table configurée. Utilisez l&apos;assistant de configuration depuis le plan de salle.
            </p>
          ) : (
            <>
          <div className="space-y-2">
            <Label>Table</Label>
            <GuestTableSelector
              tables={tables}
              value={tableId}
              onChange={setTableId}
              guestId={guest.id}
            />
          </div>

          {groups.length > 0 && onAssignGroup && (
            <div className="space-y-2">
              <Label>Groupe</Label>
              <Select
                value={groupId || 'none'}
                onValueChange={(v) => setGroupId(v === 'none' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun groupe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun groupe</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading || tables.length === 0}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
