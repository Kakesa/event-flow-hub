import { useState } from 'react';
import { Shield, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/services/api';
import type { User, ModulePermission, ModuleName, MODULES } from '@/types/models';

interface PermissionsEditorProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const MODULES_CONFIG: { name: ModuleName; label: string }[] = [
  { name: 'events', label: 'Événements' },
  { name: 'guests', label: 'Invités' },
  { name: 'invitations', label: 'Invitations' },
  { name: 'guestbook', label: "Livre d'or" },
  { name: 'analytics', label: 'Analytics' },
  { name: 'users', label: 'Utilisateurs' },
  { name: 'settings', label: 'Paramètres' },
];

const ACTIONS = [
  { key: 'create', label: 'Créer' },
  { key: 'read', label: 'Lire' },
  { key: 'update', label: 'Modifier' },
  { key: 'delete', label: 'Supprimer' },
] as const;

export const PermissionsEditor = ({ user, open, onOpenChange, onSaved }: PermissionsEditorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);

  // Initialiser les permissions quand le dialog s'ouvre ou quand l'utilisateur change
  useState(() => {
    if (open && user) {
      if (user.permissions && user.permissions.length > 0) {
        setPermissions([...user.permissions]);
      } else {
        setPermissions(MODULES_CONFIG.map(m => ({
          module: m.name,
          create: false,
          read: true,
          update: false,
          delete: false,
        })));
      }
    }
  });

  // Effect pour réinitialiser quand le dialog s'ouvre
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && user) {
      if (user.permissions && user.permissions.length > 0) {
        setPermissions([...user.permissions]);
      } else {
        setPermissions(MODULES_CONFIG.map(m => ({
          module: m.name,
          create: false,
          read: true,
          update: false,
          delete: false,
        })));
      }
    }
    onOpenChange(isOpen);
  };

  const handlePermissionChange = (module: ModuleName, action: keyof ModulePermission, value: boolean) => {
    setPermissions(prev => 
      prev.map(p => 
        p.module === module ? { ...p, [action]: value } : p
      )
    );
  };

  const handleSelectAll = (module: ModuleName, selectAll: boolean) => {
    setPermissions(prev => 
      prev.map(p => 
        p.module === module 
          ? { ...p, create: selectAll, read: selectAll, update: selectAll, delete: selectAll }
          : p
      )
    );
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await usersApi.update(user._id || user.id || '', { permissions });
      toast({ title: 'Succès', description: 'Permissions mises à jour' });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour les permissions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getModulePermission = (module: ModuleName): ModulePermission => {
    return permissions.find(p => p.module === module) || {
      module,
      create: false,
      read: false,
      update: false,
      delete: false,
    };
  };

  const isAllSelected = (module: ModuleName) => {
    const p = getModulePermission(module);
    return p.create && p.read && p.update && p.delete;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Modifier les permissions
          </DialogTitle>
          <DialogDescription>
            {user && (
              <span className="flex items-center gap-2 mt-2">
                <span className="font-medium">{user.name}</span>
                <Badge variant="outline">{user.email}</Badge>
                <Badge>{user.role}</Badge>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Module</th>
                  <th className="text-center px-2 py-3 font-medium">Tout</th>
                  {ACTIONS.map(action => (
                    <th key={action.key} className="text-center px-2 py-3 font-medium">
                      {action.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES_CONFIG.map((mod, index) => {
                  const perm = getModulePermission(mod.name);
                  return (
                    <tr key={mod.name} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="px-4 py-3 font-medium">{mod.label}</td>
                      <td className="text-center px-2 py-3">
                        <Checkbox
                          checked={isAllSelected(mod.name)}
                          onCheckedChange={(checked) => handleSelectAll(mod.name, !!checked)}
                        />
                      </td>
                      {ACTIONS.map(action => (
                        <td key={action.key} className="text-center px-2 py-3">
                          <Checkbox
                            checked={perm[action.key as keyof ModulePermission] as boolean}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(mod.name, action.key as keyof ModulePermission, !!checked)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPermissions(MODULES_CONFIG.map(m => ({
                  module: m.name,
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                })));
              }}
            >
              Tout autoriser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPermissions(MODULES_CONFIG.map(m => ({
                  module: m.name,
                  create: false,
                  read: true,
                  update: false,
                  delete: false,
                })));
              }}
            >
              Lecture seule
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsEditor;
