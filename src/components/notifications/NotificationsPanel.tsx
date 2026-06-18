import {
  Activity,
  CheckCircle2,
  Clock,
  MessageSquare,
  UserPlus,
  XCircle,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationsPanel } from '@/contexts/NotificationsContext';
import type { NotificationType } from '@/hooks/useNotifications';

const iconForType = (type: NotificationType) => {
  switch (type) {
    case 'confirmation':
      return <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />;
    case 'decline':
      return <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />;
    case 'countdown':
      return <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />;
    default:
      return <UserPlus className="h-4 w-4 text-primary shrink-0 mt-0.5" />;
  }
};

export const NotificationsList = () => {
  const {
    notifications,
    loading,
    markAllAsRead,
    handleNotificationClick,
    unreadCount,
  } = useNotificationsPanel();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs h-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-8" onClick={markAllAsRead}>
            Tout lire
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 mt-3 max-h-[min(70vh,420px)]">
        {loading && notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Chargement…</p>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune nouvelle notification</p>
          </div>
        ) : (
          <div className="space-y-2 pr-3">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => handleNotificationClick(notif)}
                className="w-full text-left p-3 rounded-lg transition-colors border bg-primary/5 border-primary/20 hover:bg-primary/10"
              >
                <div className="flex items-start gap-2">
                  {iconForType(notif.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.timestamp.toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Nouveau
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
