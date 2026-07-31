import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GuestGroup } from '@/types/models';

interface GuestGroupSelectorProps {
  groups: GuestGroup[];
  value?: string | null;
  onChange: (groupId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function GuestGroupSelector({
  groups,
  value,
  onChange,
  disabled,
  placeholder = 'Choisir un groupe',
}: GuestGroupSelectorProps) {
  if (groups.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        Aucun groupe configuré. Créez-en depuis le plan de salle.
      </p>
    );
  }

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
        <SelectItem value="none">Aucun groupe</SelectItem>
        {groups.map((group) => (
          <SelectItem key={group.id} value={group.id}>
            {group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
