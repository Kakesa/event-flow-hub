export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Listener = (prompt: BeforeInstallPromptEvent | null) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener(deferredPrompt));
};

export const getDeferredInstallPrompt = () => deferredPrompt;

export const subscribeInstallPrompt = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener(deferredPrompt);
  return () => {
    listeners.delete(listener);
  };
};

export const initPwaInstallListener = () => {
  if (typeof window === 'undefined' || (window as Window & { __hkPwaInit?: boolean }).__hkPwaInit) {
    return;
  }

  (window as Window & { __hkPwaInit?: boolean }).__hkPwaInit = true;

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
};

export const clearDeferredInstallPrompt = () => {
  deferredPrompt = null;
  notify();
};

export const isPwaInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
