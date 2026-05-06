// Journal WhatsApp synchronisé avec le backend (REST API).
// Un cache localStorage est conservé pour:
//  - servir l'UI de manière synchrone (rendu immédiat)
//  - tolérer une perte de connexion (fallback offline)
// La source de vérité reste le backend: à chaque action on POST,
// et `refreshWhatsAppLog` recharge la liste depuis le serveur.

import { whatsappLogApi, type WhatsAppLogEntryDTO } from '@/services/api';

export type WhatsAppAction = 'copied' | 'sent';

export interface WhatsAppLogEntry {
  guestId: string;
  guestName: string;
  eventId: string;
  copiedAt?: string;
  sentAt?: string;
  copyCount: number;
  sendCount: number;
}

const STORAGE_KEY = 'hk_whatsapp_log_v2';

type Store = Record<string, WhatsAppLogEntry>; // key = `${eventId}:${guestId}`

const keyOf = (eventId: string, guestId: string) => `${eventId}:${guestId}`;

const readStore = (): Store => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeStore = (store: Store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('whatsapp-log-updated'));
};

const mergeIntoCache = (entries: WhatsAppLogEntryDTO[], scopedEventId?: string) => {
  const store = readStore();
  if (scopedEventId) {
    Object.keys(store).forEach((k) => {
      if (store[k].eventId === scopedEventId) delete store[k];
    });
  }
  entries.forEach((e) => {
    store[keyOf(e.eventId, e.guestId)] = {
      guestId: e.guestId,
      guestName: e.guestName,
      eventId: e.eventId,
      copiedAt: e.copiedAt,
      sentAt: e.sentAt,
      copyCount: e.copyCount ?? 0,
      sendCount: e.sendCount ?? 0,
    };
  });
  writeStore(store);
};

/** Recharge depuis le backend et met à jour le cache local. */
export const refreshWhatsAppLog = async (eventId?: string): Promise<WhatsAppLogEntry[]> => {
  try {
    const res = await whatsappLogApi.list(eventId);
    mergeIntoCache(res.data || [], eventId);
  } catch (err) {
    console.warn('[whatsappLog] refresh failed, using local cache:', err);
  }
  return getWhatsAppLog(eventId);
};

/** Enregistre une action localement (optimistic) puis synchronise avec le backend. */
export const logWhatsAppAction = async (
  eventId: string,
  guestId: string,
  guestName: string,
  action: WhatsAppAction,
) => {
  // Optimistic update
  const store = readStore();
  const key = keyOf(eventId, guestId);
  const now = new Date().toISOString();
  const existing: WhatsAppLogEntry = store[key] || {
    guestId,
    guestName,
    eventId,
    copyCount: 0,
    sendCount: 0,
  };
  if (action === 'copied') {
    existing.copiedAt = now;
    existing.copyCount += 1;
  } else {
    existing.sentAt = now;
    existing.sendCount += 1;
  }
  existing.guestName = guestName;
  store[key] = existing;
  writeStore(store);

  // Sync backend
  try {
    const res = await whatsappLogApi.log({ eventId, guestId, guestName, action });
    if (res?.data) {
      const s = readStore();
      s[key] = {
        guestId: res.data.guestId,
        guestName: res.data.guestName,
        eventId: res.data.eventId,
        copiedAt: res.data.copiedAt,
        sentAt: res.data.sentAt,
        copyCount: res.data.copyCount ?? existing.copyCount,
        sendCount: res.data.sendCount ?? existing.sendCount,
      };
      writeStore(s);
    }
  } catch (err) {
    console.warn('[whatsappLog] backend sync failed (kept locally):', err);
  }
};

export const getWhatsAppLog = (eventId?: string): WhatsAppLogEntry[] => {
  const store = readStore();
  const all = Object.values(store);
  return (eventId ? all.filter((e) => e.eventId === eventId) : all).sort((a, b) => {
    const da = a.sentAt || a.copiedAt || '';
    const db = b.sentAt || b.copiedAt || '';
    return db.localeCompare(da);
  });
};

export const getGuestLog = (eventId: string, guestId: string): WhatsAppLogEntry | undefined => {
  return readStore()[keyOf(eventId, guestId)];
};

export const clearWhatsAppLog = async (eventId?: string) => {
  // Optimistic local clear
  if (!eventId) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    const store = readStore();
    Object.keys(store).forEach((k) => {
      if (store[k].eventId === eventId) delete store[k];
    });
    writeStore(store);
  }
  window.dispatchEvent(new CustomEvent('whatsapp-log-updated'));

  try {
    await whatsappLogApi.clear(eventId);
  } catch (err) {
    console.warn('[whatsappLog] backend clear failed:', err);
  }
};
