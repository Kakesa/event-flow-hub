import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Shield, Trash2, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PermissionButton from '@/components/common/PermissionButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { usersApi } from '@/services/api';
import type { User, ModulePermission, UserRole, ModuleName } from '@/types/models';
import { MODULES, DEFAULT_USER_PERMISSIONS, ADMIN_PERMISSIONS } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as UserRole,
  });
  const [editUser, setEditUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'user' as UserRole,
  });
  const [editingPermissions, setEditingPermissions] = useState<ModulePermission[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ================= PERMISSION HELPER =================
  const hasPermission = (permissions: ModulePermission[], module: ModuleName, action: 'create' | 'read' | 'update' | 'delete') => {
    if (!permissions) return false;
    const perm = permissions.find((p) => p.module === module);
    return perm ? perm[action] : false;
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [users, searchQuery]
  );

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const permissions =
        newUser.role === 'admin' ? ADMIN_PERMISSIONS : DEFAULT_USER_PERMISSIONS;
      await usersApi.create({ ...newUser, permissions });
      toast({ title: 'Succès', description: 'Utilisateur créé avec succès' });
      setIsAddDialogOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de créer l'utilisateur",
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) return;

    // Empêcher la suppression du dernier admin
    const adminCount = users.filter((u) => u.role === 'admin').length;
    if (userToDelete.role === 'admin' && adminCount <= 1) {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer le dernier administrateur",
        variant: 'destructive',
      });
      return;
    }

    try {
      await usersApi.delete(userId);
      toast({ title: 'Succès', description: 'Utilisateur supprimé' });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'utilisateur",
        variant: 'destructive',
      });
    }
  };

  const openPermissionsDialog = (user: User) => {
    setSelectedUser(user);
    setEditingPermissions(
      user.permissions && user.permissions.length > 0
        ? user.permissions
        : DEFAULT_USER_PERMISSIONS
    );
    setIsPermissionsDialogOpen(true);
  };

  const togglePermission = (
    module: ModuleName,
    action: 'create' | 'read' | 'update' | 'delete',
    value: boolean
  ) => {
    setEditingPermissions((prev) =>
      prev.map((p) => (p.module === module ? { ...p, [action]: value } : p))
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    try {
      await usersApi.updatePermissions(selectedUser.id, editingPermissions);
      toast({ title: 'Succès', description: 'Permissions mises à jour' });
      setIsPermissionsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les permissions',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: UserRole) => (role === 'admin' ? 'Admin' : 'Utilisateur');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Utilisateurs
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les utilisateurs et leurs permissions d'accès
            </p>
          </div>

          {/* Add User Dialog */}
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open)
                setNewUser({ name: '', email: '', phone: '', password: '', role: 'user' });
            }}
          >
            <DialogTrigger asChild>
              <Button className="shadow-gold">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte utilisateur avec un rôle
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nom complet *</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="jean@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Mot de passe *</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Rôle</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: UserRole) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (tous les accès)</SelectItem>
                      <SelectItem value="user">Utilisateur (accès limité)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddUser}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="hidden md:table-cell">Permissions</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userItem, index) => (
                  <TableRow
                    key={userItem.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">{userItem.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {userItem.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'border',
                          userItem.role === 'admin'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {getRoleLabel(userItem.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPermissionsDialog(userItem)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Gérer
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPermissionsDialog(userItem)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>Aucun utilisateur trouvé</p>
              </div>
            )}
          </Card>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nom complet *</Label>
                <Input
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Téléphone</Label>
                <Input
                  value={editUser.phone}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Rôle</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value: UserRole) => setEditUser({ ...editUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditUser}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Permissions de {selectedUser?.name}</DialogTitle>
              <DialogDescription>
                Définissez les accès CRUD pour chaque module de l'application
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-center">Créer</TableHead>
                    <TableHead className="text-center">Lire</TableHead>
                    <TableHead className="text-center">Modifier</TableHead>
                    <TableHead className="text-center">Supprimer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULES.map((module) => {
                    const perm =
                      editingPermissions.find((p) => p.module === module.name) || {
                        module: module.name,
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                      };
                    return (
                      <TableRow key={module.name}>
                        <TableCell className="font-medium">{module.label}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.create}
                            onCheckedChange={(v) =>
                              togglePermission(module.name, 'create', !!v)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.read}
                            onCheckedChange={(v) =>
                              togglePermission(module.name, 'read', !!v)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.update}
                            onCheckedChange={(v) =>
                              togglePermission(module.name, 'update', !!v)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.delete}
                            onCheckedChange={(v) =>
                              togglePermission(module.name, 'delete', !!v)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSavePermissions}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Users;
