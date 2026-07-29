import type { Guest } from '@/types/models';

export function getGuestTableName(guest: Guest): string {
  if (typeof guest.tableId === 'object' && guest.tableId?.name) {
    return guest.tableId.name;
  }
  return guest.table || '';
}

export function getGuestGroupName(guest: Guest): string {
  if (typeof guest.groupId === 'object' && guest.groupId?.name) {
    return guest.groupId.name;
  }
  return '';
}

export function getGuestsForTable(guests: Guest[], tableId: string): Guest[] {
  return guests.filter((g) => {
    const tid =
      typeof g.tableId === 'object' && g.tableId
        ? g.tableId.id
        : (g.tableId as string | undefined);
    return tid === tableId;
  });
}

export function countGuestsInGroup(guests: Guest[], groupId: string): number {
  return guests.filter((g) => {
    const gid =
      typeof g.groupId === 'object' && g.groupId
        ? g.groupId.id
        : (g.groupId as string | undefined);
    return gid === groupId;
  }).length;
}
