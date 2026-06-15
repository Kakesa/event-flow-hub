import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  BeforeInstallPromptEvent,
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  initPwaInstallListener,
  isIosDevice,
  isPwaInstalled,
  subscribeInstallPrompt,
} from '@/lib/pwaInstallStore';

interface PwaInstallContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<{ outcome: 'accepted' | 'dismissed' | 'unavailable' }>;
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export const PwaInstallProvider = ({ children }: { children: ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => getDeferredInstallPrompt()
  );
  const [isInstalled, setIsInstalled] = useState(isPwaInstalled);
  const [isIOS] = useState(isIosDevice);

  useEffect(() => {
    initPwaInstallListener();
    setIsInstalled(isPwaInstalled());

    return subscribeInstallPrompt((prompt) => {
      setDeferredPrompt(prompt);
      if (!prompt) {
        setIsInstalled(isPwaInstalled());
      }
    });
  }, []);

  const promptInstall = useCallback(async () => {
    const prompt = getDeferredInstallPrompt();
    if (!prompt) {
      return { outcome: 'unavailable' as const };
    }

    await prompt.prompt();
    const choice = await prompt.userChoice;
    clearDeferredInstallPrompt();

    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }

    return choice;
  }, []);

  const value = useMemo(
    () => ({
      canInstall: !!deferredPrompt,
      isInstalled,
      isIOS,
      promptInstall,
    }),
    [deferredPrompt, isInstalled, isIOS, promptInstall]
  );

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
};

export const usePwaInstall = () => {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error('usePwaInstall must be used within PwaInstallProvider');
  }
  return context;
};
