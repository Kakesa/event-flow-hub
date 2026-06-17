import { forwardRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotificationsPanel } from '@/contexts/NotificationsContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { NotificationsList } from '@/components/notifications/NotificationsPanel';
import { cn } from '@/lib/utils';

const BellTrigger = forwardRef<HTMLButtonElement, { className?: string }>(
  ({ className }, ref) => {
    const { unreadCount } = useNotificationsPanel();

    return (
      <Button
        ref={ref}
        variant="outline"
        size="icon"
        className={cn('relative h-9 w-9', className)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    );
  },
);
BellTrigger.displayName = 'BellTrigger';

/** Panneau notifications : Popover (desktop) ou Sheet (mobile) */
const NotificationsDrawer = () => {
  const isMobile = useIsMobile();
  const { open, setOpen } = useNotificationsPanel();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4 max-h-[85vh]">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationsList />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <BellTrigger />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-4 z-[60]" sideOffset={8}>
        <NotificationsList />
      </PopoverContent>
    </Popover>
  );
};

export { BellTrigger };
export default NotificationsDrawer;
