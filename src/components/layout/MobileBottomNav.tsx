import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, User, Bell, Users, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { USER_AUTHORIZATION_MESSAGE } from '@/components/common/UserAuthorizationNotice';
import { useNotificationsPanelSafe } from '@/contexts/NotificationsContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const notifications = useNotificationsPanelSafe();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const isSuperAdmin = user?.role === 'superadmin';

  const handleCreateEvent = () => {
    if (user?.role === 'user') {
      toast({
        title: 'Autorisation requise',
        description: USER_AUTHORIZATION_MESSAGE,
        variant: 'destructive',
      });
      return;
    }
    navigate('/events/create');
  };

  const navItems = isSuperAdmin
    ? [
        {
          label: 'Home',
          href: '/dashboard',
          icon: Home,
          onClick: undefined,
        },
        ...(notifications
          ? [
              {
                label: 'Alertes',
                href: '#notifications',
                icon: Bell,
                onClick: () => notifications.openPanel(),
                badge: notifications.unreadCount,
              } as const,
            ]
          : []),
        {
          label: 'Utilisateurs',
          href: '/users',
          icon: Users,
          onClick: undefined,
        },
        {
          label: 'Tarification',
          href: '/tarification',
          icon: Coins,
          onClick: undefined,
        },
        {
          label: 'Profil',
          href: '/settings',
          icon: User,
          onClick: undefined,
        },
      ]
    : [
    {
      label: 'Home',
      href: '/dashboard',
      icon: Home,
      onClick: undefined,
    },
    ...(user?.role !== 'user' && notifications
      ? [
          {
            label: 'Alertes',
            href: '#notifications',
            icon: Bell,
            onClick: () => notifications.openPanel(),
            badge: notifications.unreadCount,
          } as const,
        ]
      : []),
    {
      label: 'Événement',
      href: '/events/create',
      icon: Plus,
      onClick: handleCreateEvent,
      highlight: true,
    },
    {
      label: 'Profil',
      href: '/settings',
      icon: User,
      onClick: undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-1">
        {navItems.map((item) => {
          const active = item.href !== '#notifications' && isActive(item.href);
          const Icon = item.icon;
          const badge = 'badge' in item ? item.badge : 0;

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-w-0',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full',
                    'highlight' in item && item.highlight
                      ? 'bg-primary text-primary-foreground shadow-gold'
                      : active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted/60',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-h-[18px] min-w-[18px] px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </span>
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-w-0',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  active ? 'bg-primary/10 text-primary' : 'bg-muted/60',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
