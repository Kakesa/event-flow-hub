import { cn } from '@/lib/utils';

interface TableCapacityIndicatorProps {
  guestCount: number;
  capacity: number;
  showLabel?: boolean;
  className?: string;
}

export default function TableCapacityIndicator({
  guestCount,
  capacity,
  showLabel = true,
  className,
}: TableCapacityIndicatorProps) {
  const pct = capacity > 0 ? Math.min(100, Math.round((guestCount / capacity) * 100)) : 0;
  const remaining = Math.max(0, capacity - guestCount);
  const isFull = guestCount >= capacity;
  const isAlmost = !isFull && guestCount >= capacity * 0.8;

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {guestCount} / {capacity} invités
          </span>
          <span>{remaining} place{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isFull ? 'bg-red-500' : isAlmost ? 'bg-amber-500' : 'bg-emerald-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function getTableStatusColor(status?: string) {
  switch (status) {
    case 'full':
      return 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400';
    case 'almost_full':
      return 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400';
    default:
      return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
}

export function getTableStatusLabel(status?: string) {
  switch (status) {
    case 'full':
      return 'Complète';
    case 'almost_full':
      return 'Presque complète';
    default:
      return 'Disponible';
  }
}

export function getTableStatusDot(status?: string) {
  switch (status) {
    case 'full':
      return '🔴';
    case 'almost_full':
      return '🟡';
    default:
      return '🟢';
  }
}
