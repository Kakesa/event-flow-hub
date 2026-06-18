import { Link } from 'react-router-dom';
import { Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/useCountdown';
import {
  DEFAULT_COUNTDOWN_TARGET,
  formatEventDateFr,
  getCountdownTargetForEvent,
  type CountdownTime,
} from '@/utils/eventCountdown';
import type { Event } from '@/types/models';
import { cn } from '@/lib/utils';

const CountdownGrid = ({ time }: { time: CountdownTime }) => (
  <div className="grid grid-cols-4 gap-2 sm:gap-4">
    {[
      { val: time.days, label: 'Jours' },
      { val: time.hours, label: 'Heures' },
      { val: time.minutes, label: 'Minutes' },
      { val: time.seconds, label: 'Secondes' },
    ].map(({ val, label }) => (
      <div
        key={label}
        className="rounded-xl border border-[#e8e0d8] bg-[#faf8f5] py-4 px-2 text-center"
      >
        <p className="font-display text-2xl sm:text-4xl font-semibold text-[#4a5a44] tabular-nums">
          {String(val).padStart(2, '0')}
        </p>
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#7a8b72] mt-1">
          {label}
        </p>
      </div>
    ))}
  </div>
);

interface EventCountdownCardProps {
  upcomingEvent?: Event | null;
  className?: string;
}

const EventCountdownCard = ({ upcomingEvent, className }: EventCountdownCardProps) => {
  const target = upcomingEvent
    ? getCountdownTargetForEvent(upcomingEvent)
    : DEFAULT_COUNTDOWN_TARGET;
  const time = useCountdown(target);
  const isPersonal = !!upcomingEvent;
  const eventId = upcomingEvent?._id || upcomingEvent?.id;
  const isDayJ = isPersonal && time.days === 0 && !time.isPast;

  return (
    <Card
      className={cn(
        'overflow-hidden border-[#e8e0d8]',
        isDayJ && 'border-[#b8956c] shadow-lg ring-1 ring-[#b8956c]/30',
        className,
      )}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <p className="wedding-script text-2xl text-[#b8956c] mb-1">
              {isPersonal ? (isDayJ ? "C'est le jour J !" : 'Votre compte à rebours') : 'Save the date'}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#4a5a44]">
              {isPersonal ? upcomingEvent!.title : 'Compte à rebours HK Event'}
            </h2>
            {isPersonal ? (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                {formatEventDateFr(upcomingEvent!.date, upcomingEvent!.startTime)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Exemple de compte à rebours — créez votre événement pour le personnaliser.
              </p>
            )}
          </div>
          {isPersonal && eventId && (
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to={`/events/edit/${eventId}`}>Gérer l&apos;événement</Link>
            </Button>
          )}
        </div>

        {time.isPast && isPersonal ? (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-[#b8956c]" />
            <p className="font-medium text-[#4a5a44]">Cet événement est passé</p>
            <p className="text-sm mt-1">Créez un nouvel événement pour un nouveau compte à rebours.</p>
          </div>
        ) : (
          <CountdownGrid time={time} />
        )}

        {!isPersonal && (
          <div className="mt-6 text-center">
            <Button asChild className="shadow-gold">
              <Link to="/events/create">Créer mon événement</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCountdownCard;
