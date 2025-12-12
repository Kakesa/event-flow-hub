import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Event } from '@/types/models';
import { format, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
  guestCount?: number;
}

const EventCard = ({ event, guestCount = 0 }: EventCardProps) => {
  const eventDate = parseISO(event.date);
  const isUpcoming = isAfter(eventDate, new Date());

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-up">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge
            variant={isUpcoming ? 'default' : 'secondary'}
            className={isUpcoming ? 'bg-primary text-primary-foreground' : ''}
          >
            {isUpcoming ? 'À venir' : 'Passé'}
          </Badge>
          <h3 className="mt-2 font-display text-xl font-semibold text-white line-clamp-1">
            {event.title}
          </h3>
        </div>
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(eventDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{guestCount} invités</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="default" className="flex-1">
            <Link to={`/events/${event.id}`}>Gérer</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/events/${event.id}/guests`}>Invités</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
