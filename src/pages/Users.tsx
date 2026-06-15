import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, MoreHorizontal, Trash2, Shield, Loader2 } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/services/api";

import {
  MODULES,
  DEFAULT_USER_PERMISSIONS,
  ADMIN_PERMISSIONS,
} from "@/types/models";

import type { User, UserRole, ModulePermission, ModuleName } from "@/types/models";

import Spinner from "@/components/ui/spinner";

const Users = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [openAdd, setOpenAdd] = useState(false);
  const [openPerms, setOpenPerms] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user" as UserRole,
  });
  const [editingPermissions, setEditingPermissions] = useState<ModulePermission[]>([]);

  /* ================= FETCH USERS ================= */
  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;

    if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
      setLoading(false);
      toast({
        title: "Accès refusé",
        description: "Vous n’avez pas accès à cette ressource",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await usersApi.getAll();
      setUsers(res.data);
      setTotal(res.data.length);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, page, limit]);

  /* ================= SEARCH ================= */
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  /* ================= ADD USER ================= */
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Erreur",
        description: "Champs requis manquants",
        variant: "destructive",
      });
      return;
    }

    try {
      const createdUser = await usersApi.create({
        ...newUser,
        permissions:
          newUser.role === "admin"
            ? ADMIN_PERMISSIONS
            : DEFAULT_USER_PERMISSIONS,
      });

      toast({ title: "Utilisateur créé" });
      setUsers((prev) => [createdUser.data, ...prev]);
      setTotal((prev) => prev + 1);
      setOpenAdd(false);
      setNewUser({ name: "", email: "", phone: "", password: "", role: "user" });
    } catch {
      toast({
        title: "Erreur",
        description: "Création échouée",
        variant: "destructive",
      });
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await usersApi.delete(deleteTarget._id);
      toast({ title: "Utilisateur supprimé" });
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setTotal((prev) => prev - 1);
    } catch {
      toast({
        title: "Erreur",
        description: "Suppression impossible",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDelete = (user: User) => {
    if (user._id === currentUser?._id) {
      toast({
        title: "Action interdite",
        description: "Vous ne pouvez pas vous supprimer",
        variant: "destructive",
      });
      return;
    }
    setDeleteTarget(user);
  };

  /* ================= PERMISSIONS ================= */
  const openPermissions = (user: User) => {
    setSelectedUser(user);
    setEditingPermissions(user.permissions?.length ? user.permissions : DEFAULT_USER_PERMISSIONS);
    setOpenPerms(true);
  };

  const togglePermission = (
    module: ModuleName,
    action: "create" | "read" | "update" | "delete",
    value: boolean
  ) => {
    setEditingPermissions((prev) =>
      prev.map((p) => (p.module === module ? { ...p, [action]: value } : p))
    );
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.updatePermissions(selectedUser._id, editingPermissions);
      toast({ title: "Permissions mises à jour" });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, permissions: editingPermissions } : u
        )
      );

      setOpenPerms(false);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== "superadmin") return;

    try {
      const res = await usersApi.update(userId, { role: newRole });
      toast({
        title: "Succès",
        description:
          newRole === "admin"
            ? "Utilisateur promu administrateur"
            : "Rôle mis à jour",
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...res.data, role: newRole } : u))
      );
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "organizer":
        return "Organisateur";
      default:
        return "Utilisateur";
    }
  };

  /* ================= UI ================= */
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "superadmin")) {
    return (
      <DashboardLayout>
        <Card className="p-6 text-center text-red-600 font-semibold">
          Vous n’avez pas accès à cette ressource
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Utilisateurs</h1>
            <p className="text-muted-foreground">
              Gestion des comptes et permissions
            </p>
          </div>

          {/* Bouton Ajouter uniquement pour admin */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvel utilisateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Nom"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Input
                  placeholder="Téléphone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <Select
                  value={newUser.role}
                  onValueChange={(v: UserRole) => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handleAddUser}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* SEARCH */}
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <Card>
          {loading ? (
            <Spinner />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {currentUser.role === "superadmin" && u.role !== "superadmin" ? (
                          <Select
                            value={u.role || "user"}
                            onValueChange={(value: UserRole) => handleUpdateRole(u._id, value)}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Utilisateur</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="organizer">Organisateur</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge>{getRoleLabel(u.role)}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPermissions(u)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(u)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <span>Afficher :</span>
                  <Select
                    value={limit.toString()}
                    onValueChange={(v) => {
                      setLimit(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Précédent
                  </Button>
                  <span>
                    Page {page} / {Math.ceil(total / limit)}
                  </span>
                  <Button
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* PERMISSIONS MODAL */}
        <Dialog open={openPerms} onOpenChange={setOpenPerms}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Permissions – {selectedUser?.name}</DialogTitle>
            </DialogHeader>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>C</TableHead>
                  <TableHead>R</TableHead>
                  <TableHead>U</TableHead>
                  <TableHead>D</TableHead>
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
                      {(["create", "read", "update", "delete"] as const).map(
                        (action) => (
                          <TableCell key={action} className="text-center">
                            <Checkbox
                              checked={perm[action]}
                              onCheckedChange={(v) =>
                                togglePermission(module.name, action, !!v)
                              }
                            />
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <DialogFooter>
              <Button onClick={savePermissions}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression...</> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Users;
