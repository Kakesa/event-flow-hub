// Journal local des actions WhatsApp par invité (stocké en localStorage)
// car aucun backend dédié n'est disponible pour ce log.

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

const STORAGE_KEY = 'hk_whatsapp_log_v1';

type Store = Record<string, WhatsAppLogEntry>; // key = `${eventId}:${guestId}`

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

const keyOf = (eventId: string, guestId: string) => `${eventId}:${guestId}`;

export const logWhatsAppAction = (
  eventId: string,
  guestId: string,
  guestName: string,
  action: WhatsAppAction
) => {
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
};

export const getWhatsAppLog = (eventId?: string): WhatsAppLogEntry[] => {
  const store = readStore();
  const all = Object.values(store);
  return (eventId ? all.filter(e => e.eventId === eventId) : all).sort((a, b) => {
    const da = a.sentAt || a.copiedAt || '';
    const db = b.sentAt || b.copiedAt || '';
    return db.localeCompare(da);
  });
};

export const getGuestLog = (eventId: string, guestId: string): WhatsAppLogEntry | undefined => {
  return readStore()[keyOf(eventId, guestId)];
};

export const clearWhatsAppLog = (eventId?: string) => {
  if (!eventId) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    const store = readStore();
    Object.keys(store).forEach(k => {
      if (store[k].eventId === eventId) delete store[k];
    });
    writeStore(store);
  }
  window.dispatchEvent(new CustomEvent('whatsapp-log-updated'));
};
