import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  openPanel: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  handleNotificationClick: (notif: AppNotification) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wasOpenRef = useRef(false);
  const enabled = user?.role !== 'user';
  const userId = user?.id ?? user?._id;

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(enabled, userId);

  useEffect(() => {
    if (wasOpenRef.current && !open && notifications.length > 0) {
      markAllAsRead();
    }
    wasOpenRef.current = open;
  }, [open, markAllAsRead, notifications.length]);

  const openPanel = () => setOpen(true);

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setOpen(false);
    if (notif.href) navigate(notif.href);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        open,
        setOpen,
        openPanel,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsPanel = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotificationsPanel must be used within NotificationsProvider');
  }
  return ctx;
};

export const useNotificationsPanelSafe = () => useContext(NotificationsContext);
