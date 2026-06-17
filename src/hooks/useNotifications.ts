import { useCallback, useEffect, useState } from 'react';
import { eventsApi, guestsApi, guestbookApi } from '@/services/api';
import type { Guest, GuestbookMessage } from '@/types/models';

export type NotificationType = 'confirmation' | 'decline' | 'new_guest' | 'message';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read: boolean;
  href?: string;
}

const READ_KEY = 'hk_notifications_read';

const loadReadIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids: Set<string>) => {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
};

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const read = loadReadIds();
      const eventsRes = await eventsApi.getAll();
      const items: AppNotification[] = [];

      await Promise.all(
        eventsRes.data.slice(0, 8).map(async (event) => {
          const eventId = event._id || event.id;
          const eventTitle = event.title;

          try {
            const guestsRes = await guestsApi.getByEvent(eventId);
            (guestsRes.data || []).forEach((guest: Guest) => {
              if (guest.status === 'confirmed') {
                const id = `guest-confirmed-${guest.id || guest._id}`;
                items.push({
                  id,
                  type: 'confirmation',
                  message: `${guest.name} a confirmé sa présence`,
                  timestamp: new Date(guest.updatedAt || guest.createdAt || Date.now()),
                  read: read.has(id),
                  href: '/guests',
                });
              } else if (guest.status === 'declined') {
                const id = `guest-declined-${guest.id || guest._id}`;
                items.push({
                  id,
                  type: 'decline',
                  message: `${guest.name} a décliné l'invitation`,
                  timestamp: new Date(guest.updatedAt || guest.createdAt || Date.now()),
                  read: read.has(id),
                  href: '/guests',
                });
              } else if (guest.status === 'pending' || guest.status === 'invited') {
                const id = `guest-new-${guest.id || guest._id}`;
                items.push({
                  id,
                  type: 'new_guest',
                  message: `Nouvel invité : ${guest.name} (${eventTitle})`,
                  timestamp: new Date(guest.createdAt || Date.now()),
                  read: read.has(id),
                  href: '/guests',
                });
              }
            });
          } catch {
            /* ignore per event */
          }

          try {
            const gbRes = await guestbookApi.getByEvent(eventId);
            (gbRes.data || []).slice(0, 5).forEach((msg: GuestbookMessage) => {
              const id = `gb-${msg.id}`;
              items.push({
                id,
                type: 'message',
                message: `Message livre d'or de ${msg.name || 'un invité'}`,
                timestamp: new Date(msg.createdAt),
                read: read.has(id),
                href: '/guestbook',
              });
            });
          } catch {
            /* ignore */
          }
        }),
      );

      items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(items.slice(0, 25));
      setReadIds(read);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = new Set(readIds);
      prev.forEach((n) => next.add(n.id));
      saveReadIds(next);
      setReadIds(next);
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, [readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
