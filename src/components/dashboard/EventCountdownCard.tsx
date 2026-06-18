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

const CountdownGrid = ({
  time,
  compact = false,
}: {
  time: CountdownTime;
  compact?: boolean;
}) => (
  <div className={cn('grid grid-cols-4', compact ? 'gap-1' : 'gap-2 sm:gap-4')}>
    {[
      { val: time.days, label: 'Jours' },
      { val: time.hours, label: 'Heures' },
      { val: time.minutes, label: 'Min' },
      { val: time.seconds, label: 'Sec' },
    ].map(({ val, label }) => (
      <div
        key={label}
        className={cn(
          'rounded-lg border border-[#e8e0d8] bg-[#faf8f5] text-center',
          compact ? 'py-2 px-1' : 'rounded-xl py-4 px-2',
        )}
      >
        <p
          className={cn(
            'font-display font-semibold text-[#4a5a44] tabular-nums',
            compact ? 'text-base sm:text-lg' : 'text-2xl sm:text-4xl',
          )}
        >
          {String(val).padStart(2, '0')}
        </p>
        <p
          className={cn(
            'uppercase tracking-widest text-[#7a8b72]',
            compact ? 'text-[8px] sm:text-[9px] mt-0.5' : 'text-[10px] sm:text-xs mt-1',
          )}
        >
          {label}
        </p>
      </div>
    ))}
  </div>
);

interface EventCountdownCardProps {
  upcomingEvent?: Event | null;
  className?: string;
  variant?: 'default' | 'compact';
}

const EventCountdownCard = ({
  upcomingEvent,
  className,
  variant = 'default',
}: EventCountdownCardProps) => {
  const compact = variant === 'compact';
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
      <CardContent className={cn(compact ? 'p-3 sm:p-4' : 'p-6 sm:p-8')}>
        <div
          className={cn(
            'mb-3',
            compact ? 'text-center space-y-1' : 'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6',
          )}
        >
          <div>
            <p
              className={cn(
                'wedding-script text-[#b8956c]',
                compact ? 'text-base mb-0.5' : 'text-2xl mb-1',
              )}
            >
              {isPersonal ? (isDayJ ? "C'est le jour J !" : 'Compte à rebours') : 'Save the date'}
            </p>
            <h2
              className={cn(
                'font-display font-semibold text-[#4a5a44]',
                compact ? 'text-sm line-clamp-2' : 'text-xl sm:text-2xl',
              )}
            >
              {isPersonal ? upcomingEvent!.title : 'Compte à rebours HK Event'}
            </h2>
            {isPersonal ? (
              <p
                className={cn(
                  'text-muted-foreground flex items-center gap-1',
                  compact
                    ? 'text-[10px] mt-1 justify-center'
                    : 'text-sm mt-2 gap-2',
                )}
              >
                <Calendar className={cn('shrink-0', compact ? 'h-3 w-3' : 'h-4 w-4')} />
                {formatEventDateFr(upcomingEvent!.date, upcomingEvent!.startTime)}
              </p>
            ) : (
              !compact && (
                <p className="text-sm text-muted-foreground mt-2">
                  Exemple de compte à rebours — créez votre événement pour le personnaliser.
                </p>
              )
            )}
          </div>
          {isPersonal && eventId && !compact && (
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to={`/events/edit/${eventId}`}>Gérer l&apos;événement</Link>
            </Button>
          )}
        </div>

        {time.isPast && isPersonal ? (
          <div className={cn('text-center text-muted-foreground', compact ? 'py-3' : 'py-6')}>
            <Sparkles className={cn('mx-auto mb-2 text-[#b8956c]', compact ? 'h-5 w-5' : 'h-8 w-8')} />
            <p className={cn('font-medium text-[#4a5a44]', compact && 'text-sm')}>Cet événement est passé</p>
            {!compact && (
              <p className="text-sm mt-1">Créez un nouvel événement pour un nouveau compte à rebours.</p>
            )}
          </div>
        ) : (
          <CountdownGrid time={time} compact={compact} />
        )}

        {!isPersonal && !compact && (
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
