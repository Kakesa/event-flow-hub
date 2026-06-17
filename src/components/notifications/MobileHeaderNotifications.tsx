import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationsPanelSafe } from '@/contexts/NotificationsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

/** Cloche visible dans le header sur mobile uniquement */
const MobileHeaderNotifications = () => {
  const panel = useNotificationsPanelSafe();
  const isMobile = useIsMobile();

  if (!panel || !isMobile) return null;

  const { unreadCount, setOpen } = panel;

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative h-9 w-9 lg:hidden"
      onClick={() => setOpen(true)}
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ''}`}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1 min-h-5 min-w-5 px-1 rounded-full',
            'bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center',
          )}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default MobileHeaderNotifications;
