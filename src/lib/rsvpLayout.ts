import type { Event } from '@/types/models';

export type RsvpLayoutId = 'wedding_navy' | 'boho_sage';

export function getRsvpLayoutId(event: Event): RsvpLayoutId {
  if (event.theme === 'boho_sage') return 'boho_sage';
  return 'wedding_navy';
}

export const DEFAULT_BOHO_SAGE = '#8fa382';

export function getBohoSageColor(event: Event): string {
  return event.primaryColor || DEFAULT_BOHO_SAGE;
}
