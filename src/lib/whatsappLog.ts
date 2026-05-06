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
  skippedCount?: number;
  lastSkippedAt?: string;
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

// --- Anti-doublon (debounce) + clés d'idempotence en mémoire ---
const DEDUPE_WINDOW_MS = 1500;
const recentActions = new Map<string, { ts: number; idemKey: string }>();

const genIdemKey = () => {
  // crypto.randomUUID() est dispo dans tous les navigateurs modernes
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/** Enregistre une action localement (optimistic) puis synchronise avec le backend. */
export const logWhatsAppAction = async (
  eventId: string,
  guestId: string,
  guestName: string,
  action: WhatsAppAction,
) => {
  const dedupeKey = `${eventId}:${guestId}:${action}`;
  const now = Date.now();
  const recent = recentActions.get(dedupeKey);

  // Si une action identique a été déclenchée dans la fenêtre,
  // on réutilise la même Idempotency-Key et on saute l'optimistic update.
  let idemKey: string;
  let skipOptimistic = false;
  if (recent && now - recent.ts < DEDUPE_WINDOW_MS) {
    idemKey = recent.idemKey;
    skipOptimistic = true;
  } else {
    idemKey = genIdemKey();
  }
  recentActions.set(dedupeKey, { ts: now, idemKey });

  const store = readStore();
  const key = keyOf(eventId, guestId);
  const isoNow = new Date().toISOString();
  const existing: WhatsAppLogEntry = store[key] || {
    guestId,
    guestName,
    eventId,
    copyCount: 0,
    sendCount: 0,
    skippedCount: 0,
  };

  if (skipOptimistic) {
    // Clic ignoré (anti-doublon) : on incrémente le compteur sans toucher aux compteurs réels.
    existing.skippedCount = (existing.skippedCount || 0) + 1;
    existing.lastSkippedAt = isoNow;
    existing.guestName = guestName;
    store[key] = existing;
    writeStore(store);
    return;
  }

  if (action === 'copied') {
    existing.copiedAt = isoNow;
    existing.copyCount += 1;
  } else {
    existing.sentAt = isoNow;
    existing.sendCount += 1;
  }
  existing.guestName = guestName;
  store[key] = existing;
  writeStore(store);

  // Sync backend (idempotent côté serveur grâce à la clé)
  try {
    const res = await whatsappLogApi.log({
      eventId,
      guestId,
      guestName,
      action,
      idempotencyKey: idemKey,
    });
    if (res?.data) {
      const s = readStore();
      const key = keyOf(eventId, guestId);
      s[key] = {
        guestId: res.data.guestId,
        guestName: res.data.guestName,
        eventId: res.data.eventId,
        copiedAt: res.data.copiedAt,
        sentAt: res.data.sentAt,
        copyCount: res.data.copyCount ?? s[key]?.copyCount ?? 0,
        sendCount: res.data.sendCount ?? s[key]?.sendCount ?? 0,
        skippedCount: s[key]?.skippedCount ?? 0,
        lastSkippedAt: s[key]?.lastSkippedAt,
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
