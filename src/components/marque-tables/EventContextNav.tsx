import { Link, useLocation } from 'react-router-dom';
import { Calendar, LayoutGrid, Tag, Users, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventContextNavProps {
  eventId: string;
  className?: string;
}

const EventContextNav = ({ eventId, className }: EventContextNavProps) => {
  const location = useLocation();

  const items = [
    {
      label: 'Modifier',
      href: `/events/edit/${eventId}`,
      icon: Pencil,
      match: (path: string) => path.startsWith(`/events/edit/${eventId}`),
    },
    {
      label: 'Invités',
      href: `/guests?eventId=${eventId}`,
      icon: Users,
      match: (path: string) => path.startsWith('/guests'),
    },
    {
      label: 'Plan de salle',
      href: `/events/${eventId}/tables`,
      icon: LayoutGrid,
      match: (path: string) =>
        path.includes(`/events/${eventId}/tables`) && !path.includes('marque'),
    },
    {
      label: 'Marque-tables',
      href: `/events/${eventId}/marque-tables`,
      icon: Tag,
      match: (path: string) => path.includes('/marque-tables'),
    },
  ];

  return (
    <nav
      className={cn(
        'flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1',
        className,
      )}
      aria-label="Navigation de l'événement"
    >
      {items.map((item) => {
        const active = item.match(location.pathname + location.search);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2 text-xs text-muted-foreground ml-auto">
        <Calendar className="h-3.5 w-3.5" />
        Contexte événement
      </span>
    </nav>
  );
};

export default EventContextNav;
