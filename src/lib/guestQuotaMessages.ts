import type { SubscriptionLimitsStatus } from '@/types/models';
import { formatPlanLimit } from '@/config/subscriptionPlans';

export const ORGANIZER_QUOTA_MESSAGE =
  "Vous avez atteint le nombre maximal d'invités autorisé par votre abonnement. Veuillez contacter l'administrateur pour augmenter votre quota.";

export function getGuestLimitDescription(limits: SubscriptionLimitsStatus, guestCountFallback = 0): string {
  if (limits.planLimitsBypass) {
    return 'Déblocage actif — actualisez la page si le bouton reste grisé.';
  }

  if (limits.maxGuestsQuota != null) {
    const used = limits.totalGuestCount ?? guestCountFallback;
    return `Quota total : ${used}/${limits.maxGuestsQuota} invités. ${ORGANIZER_QUOTA_MESSAGE}`;
  }

  const used = limits.guestCount ?? guestCountFallback;
  return `Votre plan ${limits.plan} autorise ${formatPlanLimit(limits.maxGuests)} invité(s) par événement (${used} utilisés).`;
}

export function isOrganizerQuotaReached(limits: SubscriptionLimitsStatus): boolean {
  if (limits.planLimitsBypass) return false;
  if (limits.maxGuestsQuota != null) {
    return (limits.totalGuestCount ?? 0) >= limits.maxGuestsQuota;
  }
  return limits.canAddGuest === false;
}
