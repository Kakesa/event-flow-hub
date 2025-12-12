import { CheckCircle2, XCircle, Clock, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'confirmed' | 'declined' | 'pending' | 'invited' | 'message';
  guestName: string;
  eventTitle: string;
  time: string;
}

const mockActivities: Activity[] = [
  { id: '1', type: 'confirmed', guestName: 'Jean Martin', eventTitle: 'Mariage de Sophie & Pierre', time: 'Il y a 2 heures' },
  { id: '2', type: 'message', guestName: 'Claire Dubois', eventTitle: 'Mariage de Sophie & Pierre', time: 'Il y a 3 heures' },
  { id: '3', type: 'declined', guestName: 'Sophie Leroy', eventTitle: 'Mariage de Sophie & Pierre', time: 'Il y a 5 heures' },
  { id: '4', type: 'invited', guestName: 'Emma Richard', eventTitle: 'Anniversaire 30 ans', time: 'Hier' },
  { id: '5', type: 'pending', guestName: 'Paul Bernard', eventTitle: 'Mariage de Sophie & Pierre', time: 'Hier' },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'confirmed':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'declined':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'invited':
      return <Mail className="h-4 w-4 text-primary" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-chart-3" />;
  }
};

const getActivityText = (activity: Activity) => {
  switch (activity.type) {
    case 'confirmed':
      return 'a confirmé sa présence';
    case 'declined':
      return 'a décliné l\'invitation';
    case 'pending':
      return 'n\'a pas encore répondu';
    case 'invited':
      return 'a reçu son invitation';
    case 'message':
      return 'a laissé un message';
  }
};

const RecentActivity = () => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="font-display text-lg font-semibold mb-4">Activité récente</h3>
      <div className="space-y-4">
        {mockActivities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              'flex items-start gap-3 animate-slide-up',
              index !== mockActivities.length - 1 && 'pb-4 border-b'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="mt-0.5 rounded-full bg-muted p-2">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.guestName}</span>{' '}
                <span className="text-muted-foreground">{getActivityText(activity)}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {activity.eventTitle}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
