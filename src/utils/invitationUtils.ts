import type { Guest, Invitation } from '@/types/models';

/** Identifiant stable d'un invité (id ou _id). */
export function resolveGuestId(guest: Guest): string {
  return String(guest.id || guest._id || '');
}

/** Identifiant invité depuis une invitation (guestId peuplé ou string). */
export function resolveGuestIdFromInvitation(inv: Invitation): string {
  if (inv.guest?.id) return String(inv.guest.id);

  const ref = inv.guestId;
  if (typeof ref === 'object' && ref !== null) {
    const obj = ref as { id?: string; _id?: string };
    return String(obj.id || obj._id || '');
  }

  return String(ref || '');
}

/** Invitation considérée comme déjà envoyée. */
export function isInvitationAlreadySent(inv: Invitation): boolean {
  return inv.status === 'sent' || Boolean(inv.sentAt);
}

/** Ensemble des invités ayant déjà reçu une invitation. */
export function getInvitedGuestIds(
  invitations: Invitation[],
  extraGuestIds: string[] = [],
): Set<string> {
  const ids = new Set<string>();

  for (const inv of invitations) {
    if (!isInvitationAlreadySent(inv)) continue;
    const guestId = resolveGuestIdFromInvitation(inv);
    if (guestId) ids.add(guestId);
  }

  for (const guestId of extraGuestIds) {
    if (guestId) ids.add(String(guestId));
  }

  return ids;
}

/** Invités sans invitation envoyée. */
export function getGuestsWithoutInvitation(
  guests: Guest[],
  invitations: Invitation[],
  extraInvitedGuestIds: string[] = [],
): Guest[] {
  const invitedIds = getInvitedGuestIds(invitations, extraInvitedGuestIds);
  return guests.filter((guest) => {
    const guestId = resolveGuestId(guest);
    return guestId && !invitedIds.has(guestId);
  });
}
