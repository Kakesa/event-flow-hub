import { useState } from 'react';
import {
  Eye, EyeOff, LogOut, Search, AlertTriangle, Shield,
  User as UserIcon, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { usersApi } from '@/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/models';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ImpersonationSession {
  id: string;
  superAdminId: string;
  superAdminName: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  startedAt: string;
  endedAt?: string;
  reason: string;
  actionsPerformed: number;
  status: 'active' | 'ended';
}

interface UserImpersonationProps {
  users: User[];
  className?: string;
}

const UserImpersonation = ({ users, className }: UserImpersonationProps) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [impersonationReason, setImpersonationReason] = useState('');
  const [impersonationHistory, setImpersonationHistory] = useState<ImpersonationSession[]>([
    {
      id: '1',
      superAdminId: 'sa1',
      superAdminName: 'Super Admin',
      targetUserId: 'u1',
      targetUserName: 'Jean Dupont',
      targetUserEmail: 'jean@example.com',
      startedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      endedAt: new Date(Date.now() - 23 * 3600000).toISOString(),
      reason: 'Débogage problème événement',
      actionsPerformed: 5,
      status: 'ended',
    },
    {
      id: '2',
      superAdminId: 'sa1',
      superAdminName: 'Super Admin',
      targetUserId: 'u2',
      targetUserName: 'Marie Martin',
      targetUserEmail: 'marie@example.com',
      startedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      endedAt: new Date(Date.now() - 47 * 3600000).toISOString(),
      reason: 'Vérification droits utilisateur',
      actionsPerformed: 3,
      status: 'ended',
    },
  ]);

  const filteredUsers = users.filter(u => 
    u.role !== 'superadmin' && (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleStartImpersonation = (user: User) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const confirmImpersonation = async () => {
    if (!selectedUser || !impersonationReason.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez indiquer la raison de l\'usurpation',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await usersApi.impersonate(selectedUser._id || selectedUser.id || '', impersonationReason);
      
      if (res.success && res.data) {
        // Sauvegarder le token actuel pour pouvoir revenir
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          localStorage.setItem('original_token', currentToken);
        }
        
        // Appliquer le nouveau token d'usurpation
        localStorage.setItem('token', res.data.token);
        
        // Mettre à jour l'état local pour la démonstration (l'app devra être rechargée pour vraiment agir en tant que user)
        setImpersonatedUser(selectedUser);
        setIsImpersonating(true);
        setShowConfirmDialog(false);
        setImpersonationReason('');

        toast({
          title: 'Usurpation activée',
          description: `Vous agissez maintenant en tant que ${selectedUser.name}. Rechargez la page pour appliquer les changements.`,
        });
        
        // Optionnel: recharger la page pour que l'AuthContext récupère le nouveau user
        // window.location.reload();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer l\'usurpation',
        variant: 'destructive',
      });
    }
  };

  const handleEndImpersonation = () => {
    if (!isImpersonating) return;

    // Restaurer le token original
    const originalToken = localStorage.getItem('original_token');
    if (originalToken) {
      localStorage.setItem('token', originalToken);
      localStorage.removeItem('original_token');
    }

    setIsImpersonating(false);
    setImpersonatedUser(null);

    toast({
      title: 'Usurpation terminée',
      description: 'Vous êtes de retour sur votre compte super admin. L\'application va s\'actualiser.',
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const getRoleBadge = (role?: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }> = {
      superadmin: { variant: 'destructive', className: 'bg-red-600' },
      admin: { variant: 'default' },
      organizer: { variant: 'secondary' },
      user: { variant: 'outline' },
    };
    const c = config[role || 'user'] || config.user;
    return <Badge variant={c.variant} className={cn('capitalize', c.className)}>{role || 'user'}</Badge>;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Impersonation Banner */}
      {isImpersonating && impersonatedUser && (
        <Alert variant="destructive" className="bg-red-600 text-white border-red-700">
          <Eye className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Mode Usurpation Actif</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <div>
              Vous agissez actuellement en tant que <strong>{impersonatedUser.name}</strong> ({impersonatedUser.email}).
              Toutes vos actions sont enregistrées.
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleEndImpersonation}
              className="ml-4"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Terminer l'usurpation
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Usurpation d'identité
          </CardTitle>
          <CardDescription>
            Prenez temporairement l'identité d'un utilisateur pour déboguer son expérience. 
            Toutes les actions sont tracées dans les logs d'audit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="bg-amber-500/10 border-amber-500/50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600">Avertissement</AlertTitle>
            <AlertDescription className="text-amber-700">
              L'usurpation d'identité est une fonctionnalité sensible. Chaque session est enregistrée 
              dans les logs d'audit avec la raison, la durée et les actions effectuées.
            </AlertDescription>
          </Alert>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id || user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.subscriptionType || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive !== false ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartImpersonation(user)}
                        disabled={isImpersonating}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Usurper
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Impersonation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des usurpations
          </CardTitle>
          <CardDescription>
            Toutes les sessions d'usurpation passées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Super Admin</TableHead>
                <TableHead>Utilisateur cible</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {impersonationHistory.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.superAdminName}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.targetUserName}</p>
                      <p className="text-sm text-muted-foreground">{session.targetUserEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{session.reason}</TableCell>
                  <TableCell>
                    {session.endedAt ? (
                      <span className="text-sm">
                        {Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)} min
                      </span>
                    ) : (
                      <Badge className="bg-green-600">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell>{session.actionsPerformed}</TableCell>
                  <TableCell>
                    {session.status === 'active' ? (
                      <Badge className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="outline">Terminée</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Confirmer l'usurpation
            </DialogTitle>
            <DialogDescription>
              Vous allez prendre l'identité de <strong>{selectedUser?.name}</strong>.
              Cette action sera enregistrée dans les logs d'audit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 rounded bg-muted">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                  <div className="flex gap-2 mt-1">
                    {getRoleBadge(selectedUser?.role)}
                    <Badge variant="outline" className="capitalize">
                      {selectedUser?.subscriptionType || 'free'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Raison de l'usurpation <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Débogage problème d'affichage événement"
                value={impersonationReason}
                onChange={(e) => setImpersonationReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cette raison sera enregistrée dans les logs d'audit
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmImpersonation}
              disabled={!impersonationReason.trim()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Démarrer l'usurpation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserImpersonation;
