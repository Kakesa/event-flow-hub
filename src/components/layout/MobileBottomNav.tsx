import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { USER_AUTHORIZATION_MESSAGE } from '@/components/common/UserAuthorizationNotice';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

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

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: Home,
      onClick: undefined,
    },
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
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    item.highlight
                      ? 'bg-primary text-primary-foreground shadow-gold'
                      : active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted/60'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  active ? 'bg-primary/10 text-primary' : 'bg-muted/60'
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
