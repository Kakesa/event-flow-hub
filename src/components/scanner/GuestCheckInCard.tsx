import {
  User,
  Phone,
  Ticket,
  Calendar,
  LayoutPanelLeft,
  Users,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GuestCheckInCard, CheckInMethod } from '@/types/models';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  CHECKED_IN: 'Entrée enregistrée',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  PENDING: 'En attente',
  INVITED: 'Invitée',
};

const STATUS_STYLES: Record<string, string> = {
  CHECKED_IN: 'bg-success/10 text-success border-success/20',
  CONFIRMED: 'bg-primary/10 text-primary border-primary/20',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  PENDING: 'bg-warning/10 text-warning border-warning/20',
  INVITED: 'bg-muted text-muted-foreground border-border',
};

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

interface GuestCheckInCardProps {
  guest: GuestCheckInCard;
  onValidate?: () => void;
  validating?: boolean;
  successMessage?: string | null;
  className?: string;
}

const GuestCheckInCard = ({
  guest,
  onValidate,
  validating = false,
  successMessage,
  className,
}: GuestCheckInCardProps) => {
  const alreadyUsed = guest.checkedIn || guest.invitationStatus === 'CHECKED_IN';
  const statusKey = guest.invitationStatus || 'PENDING';

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Invité</p>
          <h3 className="font-display text-xl font-semibold">{guest.name}</h3>
        </div>
        <Badge className={cn('shrink-0', STATUS_STYLES[statusKey] || STATUS_STYLES.PENDING)}>
          {STATUS_LABELS[statusKey] || statusKey}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoRow icon={Phone} label="Téléphone" value={guest.phone || '—'} />
        <InfoRow icon={Ticket} label="Code d'invitation" value={guest.invitationCode || '—'} />
        <InfoRow icon={Calendar} label="Événement" value={guest.eventName || '—'} />
        <InfoRow icon={LayoutPanelLeft} label="Table" value={guest.table || 'Non assignée'} />
        <InfoRow
          icon={Users}
          label="Nombre de places"
          value={String(guest.seatCount ?? 1)}
        />
      </div>

      {alreadyUsed && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-2">
          <p className="font-medium text-warning">Cette invitation a déjà été utilisée.</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Heure d'entrée : {formatDateTime(guest.checkedInAt)}
            </span>
            {guest.checkedInBy?.name && (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Contrôleur : {guest.checkedInBy.name}
              </span>
            )}
          </div>
        </div>
      )}

      {!alreadyUsed && guest.declineReason && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{guest.declineReason}</p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-success font-medium">
          {successMessage}
        </div>
      )}

      {onValidate && (
        <Button
          className="w-full"
          size="lg"
          onClick={onValidate}
          disabled={!guest.canCheckIn || validating || !!successMessage}
        >
          {validating ? 'Validation…' : "Valider l'entrée"}
        </Button>
      )}
    </div>
  );
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export default GuestCheckInCard;
export type { CheckInMethod };
