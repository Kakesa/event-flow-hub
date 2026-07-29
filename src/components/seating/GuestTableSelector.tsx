import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Guest, SeatingTable } from '@/types/models';
import { getGuestTableName } from '@/utils/seatingHelpers';

interface GuestTableSelectorProps {
  tables: SeatingTable[];
  value?: string | null;
  onChange: (tableId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  guestId?: string;
}

export default function GuestTableSelector({
  tables,
  value,
  onChange,
  disabled,
  placeholder = 'Choisir une table',
}: GuestTableSelectorProps) {
  return (
    <Select
      value={value || 'none'}
      onValueChange={(v) => onChange(v === 'none' ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Aucune table</SelectItem>
        {tables.map((table) => {
          const count = table.guestCount ?? 0;
          const full = count >= table.capacity;
          return (
            <SelectItem key={table.id} value={table.id} disabled={full && value !== table.id}>
              {table.name} ({count}/{table.capacity}){full && value !== table.id ? ' — complète' : ''}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function getGuestTableLabel(guest: Guest): string {
  const name = getGuestTableName(guest);
  return name || 'Non assigné';
}
