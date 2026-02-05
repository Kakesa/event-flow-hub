import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { activitiesApi, type Activity } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

const formatTime = (dateString: string | undefined) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await activitiesApi.getRecent(10);
      if (res.success) {
        setActivities(res.data);
      } else {
        setError('Impossible de charger les activités');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    
    // Rafraîchir les activités toutes les 30 secondes
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold mb-4">Activité récente</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold mb-4">Activité récente</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchActivities}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Activité récente</h3>
        <Button variant="ghost" size="icon" onClick={fetchActivities} title="Actualiser">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucune activité récente
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 animate-slide-up',
                index !== activities.length - 1 && 'pb-4 border-b'
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
                {activity.time || formatTime(activity.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
