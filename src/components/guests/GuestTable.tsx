import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Mail, MessageSquare, QrCode, Trash2 } from 'lucide-react';
import type { Guest } from '@/types/models';
import { cn } from '@/lib/utils';

interface GuestTableProps {
  guests: Guest[];
  onSendInvitation?: (guestId: string, method: 'email' | 'whatsapp' | 'sms') => void;
  onDelete?: (guestId: string) => void;
  onGenerateQR?: (guestId: string) => void;
}

const statusConfig = {
  invited: { label: 'Invité', variant: 'secondary' as const, className: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  confirmed: { label: 'Confirmé', variant: 'default' as const, className: 'bg-success/10 text-success border-success/20' },
  declined: { label: 'Décliné', variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  pending: { label: 'En attente', variant: 'outline' as const, className: 'bg-warning/10 text-warning border-warning/20' },
};

const GuestTable = ({ guests, onSendInvitation, onDelete, onGenerateQR }: GuestTableProps) => {
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

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
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedGuests.length === guests.length && guests.length > 0}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Nom</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Téléphone</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden lg:table-cell">Boisson</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest, index) => (
            <TableRow
              key={guest.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <Checkbox
                  checked={selectedGuests.includes(guest.id)}
                  onCheckedChange={() => toggleGuest(guest.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{guest.fullName}</TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                {guest.email}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {guest.phone}
              </TableCell>
              <TableCell>
                <Badge
                  variant={statusConfig[guest.status].variant}
                  className={cn('border', statusConfig[guest.status].className)}
                >
                  {statusConfig[guest.status].label}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {guest.drinkPreference || '-'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSendInvitation?.(guest.id, 'email')}>
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer par email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSendInvitation?.(guest.id, 'whatsapp')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Envoyer par WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onGenerateQR?.(guest.id)}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Générer QR Code
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(guest.id)}
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
      {guests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>Aucun invité pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default GuestTable;
