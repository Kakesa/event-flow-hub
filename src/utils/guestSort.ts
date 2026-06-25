import type { Guest } from '@/types/models';

export function sortGuestsNewestFirst(guests: Guest[]): Guest[] {
  return [...guests].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}
