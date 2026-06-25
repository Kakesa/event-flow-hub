import { BASE_URL } from '@/services/api';
import type { Event } from '@/types/models';

export function resolveEventCoverUrl(event?: Event | null): string | undefined {
  if (!event?.coverImage) return undefined;
  return event.coverImage.startsWith('http')
    ? event.coverImage
    : `${BASE_URL}${event.coverImage}`;
}

export function defaultEventCoverUrl(): string {
  return 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80';
}

export function getEventCoverUrl(event?: Event | null): string {
  return resolveEventCoverUrl(event) || defaultEventCoverUrl();
}
