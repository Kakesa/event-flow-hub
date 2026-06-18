import { Link } from 'react-router-dom';
import { AlertTriangle, Unlock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PlanLimitAlertProps {
  title: string;
  description: string;
  bypassed?: boolean;
  showUpgrade?: boolean;
}

const PlanLimitAlert = ({
  title,
  description,
  bypassed,
  showUpgrade = true,
}: PlanLimitAlertProps) => (
  <Alert variant={bypassed ? 'default' : 'destructive'} className="mb-4">
    {bypassed ? (
      <Unlock className="h-4 w-4" />
    ) : (
      <AlertTriangle className="h-4 w-4" />
    )}
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span>{description}</span>
      {!bypassed && showUpgrade && (
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link to="/settings?tab=subscription">Voir les plans</Link>
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

export default PlanLimitAlert;
