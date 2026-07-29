import { Users, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TableCapacityIndicator, {
  getTableStatusColor,
  getTableStatusLabel,
} from './TableCapacityIndicator';
import type { SeatingTable } from '@/types/models';

interface TableCardProps {
  table: SeatingTable;
  onEdit?: (table: SeatingTable) => void;
  onDelete?: (table: SeatingTable) => void;
  onClick?: (table: SeatingTable) => void;
  compact?: boolean;
}

export default function TableCard({ table, onEdit, onDelete, onClick, compact }: TableCardProps) {
  const guestCount = table.guestCount ?? 0;

  return (
    <Card
      className="group cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick?.(table)}
      style={{ borderLeftColor: table.color || undefined, borderLeftWidth: table.color ? 4 : undefined }}
    >
      <CardHeader className={compact ? 'p-4 pb-2' : 'pb-2'}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">{table.name}</CardTitle>
            {!compact && table.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{table.description}</p>
            )}
          </div>
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(table)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(table)}
                    disabled={guestCount > 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? 'p-4 pt-0 space-y-3' : 'space-y-3'}>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getTableStatusColor(table.status)}>
            {getTableStatusLabel(table.status)}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Cap. {table.capacity}
          </span>
        </div>
        <TableCapacityIndicator guestCount={guestCount} capacity={table.capacity} />
      </CardContent>
    </Card>
  );
}
