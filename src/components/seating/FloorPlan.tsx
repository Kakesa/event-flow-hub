import { useCallback, useState } from 'react';
import type { Guest, SeatingTable } from '@/types/models';
import { getTableStatusColor, getTableStatusDot } from './TableCapacityIndicator';
import { cn } from '@/lib/utils';

interface FloorPlanProps {
  tables: SeatingTable[];
  guests: Guest[];
  onMoveGuest?: (guestId: string, tableId: string | null) => Promise<void>;
  onUpdatePositions?: (positions: { id: string; x: number; y: number }[]) => void;
  readOnly?: boolean;
}

export default function FloorPlan({
  tables,
  guests,
  onMoveGuest,
  onUpdatePositions,
  readOnly,
}: FloorPlanProps) {
  const [dragGuestId, setDragGuestId] = useState<string | null>(null);
  const [dragTableId, setDragTableId] = useState<string | null>(null);

  const guestsByTable = tables.reduce<Record<string, Guest[]>>((acc, table) => {
    acc[table.id] = guests.filter((g) => {
      const tid =
        typeof g.tableId === 'object' && g.tableId
          ? g.tableId.id
          : (g.tableId as string | undefined);
      return tid === table.id;
    });
    return acc;
  }, {});

  const unassigned = guests.filter((g) => {
    const tid =
      typeof g.tableId === 'object' && g.tableId
        ? g.tableId.id
        : (g.tableId as string | undefined);
    return !tid;
  });

  const handleDropOnTable = useCallback(
    async (tableId: string) => {
      if (!dragGuestId || !onMoveGuest) return;
      try {
        await onMoveGuest(dragGuestId, tableId);
      } finally {
        setDragGuestId(null);
      }
    },
    [dragGuestId, onMoveGuest],
  );

  const handleTableDragEnd = (table: SeatingTable, e: React.DragEvent) => {
    if (readOnly || !onUpdatePositions) return;
    const parent = (e.target as HTMLElement).closest('[data-floor-plan]');
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const x = e.clientX - rect.left - 48;
    const y = e.clientY - rect.top - 48;
    onUpdatePositions([{ id: table.id, x: Math.max(0, x), y: Math.max(0, y) }]);
    setDragTableId(null);
  };

  return (
    <div className="space-y-4">
      {!readOnly && unassigned.length > 0 && (
        <div
          className="rounded-lg border border-dashed p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            if (dragGuestId && onMoveGuest) {
              await onMoveGuest(dragGuestId, null);
              setDragGuestId(null);
            }
          }}
        >
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Invités non assignés ({unassigned.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((guest) => (
              <span
                key={guest.id}
                draggable={!readOnly}
                onDragStart={() => setDragGuestId(guest.id)}
                className="cursor-grab rounded-full bg-muted px-2.5 py-1 text-xs active:cursor-grabbing"
              >
                {guest.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        data-floor-plan
        className="relative min-h-[480px] overflow-auto rounded-xl border bg-muted/20 p-4"
        style={{ minWidth: '100%' }}
      >
        {tables.map((table) => {
          const tableGuests = guestsByTable[table.id] || [];
          const x = table.position?.x ?? ((table.number - 1) % 5) * 140 + 20;
          const y = table.position?.y ?? Math.floor((table.number - 1) / 5) * 140 + 20;

          return (
            <div
              key={table.id}
              draggable={!readOnly && !!onUpdatePositions}
              onDragStart={() => setDragTableId(table.id)}
              onDragEnd={(e) => handleTableDragEnd(table, e)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleDropOnTable(table.id);
              }}
              className={cn(
                'absolute w-28 rounded-full border-2 p-3 text-center shadow-sm transition-shadow hover:shadow-md',
                getTableStatusColor(table.status),
                dragTableId === table.id && 'opacity-70',
              )}
              style={{
                left: x,
                top: y,
                borderColor: table.color || undefined,
              }}
            >
              <p className="text-[10px]">{getTableStatusDot(table.status)}</p>
              <p className="truncate text-xs font-semibold">{table.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {tableGuests.length}/{table.capacity}
              </p>
              <div className="mt-1 space-y-0.5">
                {tableGuests.slice(0, 3).map((g) => (
                  <p
                    key={g.id}
                    draggable={!readOnly}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDragGuestId(g.id);
                    }}
                    className="truncate text-[9px] cursor-grab"
                  >
                    {g.name}
                  </p>
                ))}
                {tableGuests.length > 3 && (
                  <p className="text-[9px] text-muted-foreground">+{tableGuests.length - 3}</p>
                )}
              </div>
            </div>
          );
        })}

        {tables.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Aucune table configurée. Lancez l&apos;assistant de configuration.
          </p>
        )}
      </div>
    </div>
  );
}
