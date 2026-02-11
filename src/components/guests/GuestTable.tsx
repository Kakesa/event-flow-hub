import { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Mail, 
  MessageSquare, 
  QrCode, 
  Trash2, 
  User, 
  Phone,
  Wine,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  LayoutPanelLeft
} from 'lucide-react';
import type { Guest } from '@/types/models';
import { cn } from '@/lib/utils';

interface GuestTableProps {
  guests: Guest[];
  onSendInvitation?: (guestId: string, method: 'email' | 'whatsapp' | 'sms') => void;
  onDelete?: (guestId: string) => void;
  onGenerateQR?: (guestId: string) => void;
}

const statusConfig = {
  invited: { 
    label: 'Invité', 
    icon: Send,
    className: 'bg-chart-3/10 text-chart-3 border-chart-3/20 hover:bg-chart-3/20' 
  },
  confirmed: { 
    label: 'Confirmé', 
    icon: CheckCircle2,
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20' 
  },
  declined: { 
    label: 'Décliné', 
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' 
  },
  pending: { 
    label: 'En attente', 
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' 
  },
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const GuestTable = ({ guests, onSendInvitation, onDelete, onGenerateQR }: GuestTableProps) => {
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const deleteTargetGuest = guests.find(g => g.id === deleteTargetId);

  const toggleAll = () => {
    if (selectedGuests.length === guests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(guests.map(g => g.id));
    }
  };

  const toggleGuest = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      {/* Actions groupées */}
      {selectedGuests.length > 0 && (
        <div className="bg-primary/5 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            {selectedGuests.length} invité(s) sélectionné(s)
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => selectedGuests.forEach(id => onSendInvitation?.(id, 'email'))}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Envoyer par email
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => selectedGuests.forEach(id => onSendInvitation?.(id, 'whatsapp'))}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              WhatsApp
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedGuests.length === guests.length && guests.length > 0}
                onCheckedChange={toggleAll}
                className="border-muted-foreground/30"
              />
            </TableHead>
            <TableHead className="font-semibold">Invité</TableHead>
            <TableHead className="hidden md:table-cell font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Statut</TableHead>
            <TableHead className="font-semibold">Table</TableHead>
            <TableHead className="hidden lg:table-cell font-semibold">Préférences</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest, index) => {
            const StatusIcon = statusConfig[guest.status].icon;
            return (
              <TableRow
                key={guest.id}
                className={cn(
                  "animate-fade-in group transition-colors",
                  selectedGuests.includes(guest.id) && "bg-primary/5"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedGuests.includes(guest.id)}
                    onCheckedChange={() => toggleGuest(guest.id)}
                    className="border-muted-foreground/30"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium text-sm">
                        {getInitials(guest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{guest.name}</p>
                      <p className="text-xs text-muted-foreground truncate sm:hidden">
                        {guest.email || guest.phone || 'Pas de contact'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="space-y-1">
                    {guest.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{guest.email}</span>
                      </div>
                    )}
                    {guest.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                    {!guest.email && !guest.phone && (
                      <span className="text-sm text-muted-foreground/50 italic">Non renseigné</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'border font-medium transition-colors cursor-default',
                      statusConfig[guest.status].className
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                    {statusConfig[guest.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {guest.table ? (
                    <div className="flex items-center gap-2">
                       <LayoutPanelLeft className="h-4 w-4 text-primary/60" />
                       <span className="font-medium">{guest.table}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40 italic text-sm">Non assignée</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {guest.drinkPreference ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Wine className="h-4 w-4 text-primary/60" />
                      <span className="text-muted-foreground capitalize">{guest.drinkPreference}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 text-sm italic">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onSendInvitation?.(guest.id, 'email')}>
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        Envoyer par email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendInvitation?.(guest.id, 'whatsapp')}>
                        <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                        Envoyer par WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onGenerateQR?.(guest.id)}>
                        <QrCode className="h-4 w-4 mr-2 text-chart-3" />
                        Générer QR Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTargetId(guest.id)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {guests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-medium mb-1">Aucun invité</p>
          <p className="text-sm text-muted-foreground/70">
            Commencez par ajouter des invités à votre événement
          </p>
        </div>
      )}
    </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet invité ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTargetGuest?.name || 'cet invité'}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTargetId) {
                  onDelete?.(deleteTargetId);
                  setDeleteTargetId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GuestTable;
