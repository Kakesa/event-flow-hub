import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { seatingApi } from '@/services/api';
import type { Guest, GuestGroup, GuestGroupType } from '@/types/models';
import { countGuestsInGroup } from '@/utils/seatingHelpers';
import { toast } from 'sonner';

const GROUP_TYPE_LABELS: Record<GuestGroupType, string> = {
  family: 'Famille',
  vip: 'VIP',
  sponsors: 'Sponsors',
  partners: 'Partenaires',
  press: 'Presse',
  organizers: 'Équipe organisatrice',
  friends: 'Amis',
  colleagues: 'Collègues',
  honorees: 'Invités d\'honneur',
  custom: 'Personnalisé',
};

interface GuestGroupsPanelProps {
  eventId: string;
  groups: GuestGroup[];
  guests: Guest[];
  onUpdated: () => void;
}

export default function GuestGroupsPanel({
  eventId,
  groups,
  guests,
  onUpdated,
}: GuestGroupsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GuestGroup | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<GuestGroupType>('custom');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setType('custom');
    setColor('#6366f1');
    setDialogOpen(true);
  };

  const openEdit = (group: GuestGroup) => {
    setEditing(group);
    setName(group.name);
    setType(group.type);
    setColor(group.color || '#6366f1');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Le nom du groupe est requis');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await seatingApi.updateGroup(editing.id, { name: name.trim(), type, color });
        toast.success('Groupe mis à jour');
      } else {
        await seatingApi.createGroup(eventId, { name: name.trim(), type, color });
        toast.success('Groupe créé');
      }
      setDialogOpen(false);
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: GuestGroup) => {
    const count = countGuestsInGroup(guests, group.id);
    const msg =
      count > 0
        ? `Supprimer le groupe « ${group.name} » ? ${count} invité(s) seront retirés du groupe.`
        : `Supprimer le groupe « ${group.name} » ?`;
    if (!confirm(msg)) return;
    try {
      await seatingApi.deleteGroup(group.id);
      toast.success('Groupe supprimé');
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreatePresets = async () => {
    try {
      await seatingApi.createPresetGroups(eventId);
      toast.success('Groupes prédéfinis créés');
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Groupes d&apos;invités
        </CardTitle>
        <div className="flex gap-2">
          {groups.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleCreatePresets}>
              Groupes prédéfinis
            </Button>
          )}
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Créez des groupes (Famille, VIP, etc.) pour une répartition automatique intelligente.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const memberCount = countGuestsInGroup(guests, group.id);
              return (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                  style={{ borderLeftColor: group.color || undefined, borderLeftWidth: group.color ? 3 : undefined }}
                >
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {GROUP_TYPE_LABELS[group.type] || group.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {memberCount} membre{memberCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(group)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(group)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le groupe' : 'Nouveau groupe'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Famille Dupont" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as GuestGroupType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GROUP_TYPE_LABELS) as GuestGroupType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {GROUP_TYPE_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export { GROUP_TYPE_LABELS };
