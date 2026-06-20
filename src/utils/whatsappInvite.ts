import type { Event, Guest } from '@/types/models';
import { getWhatsAppDigits } from '@/utils/phoneUtils';

export const buildDefaultInviteMessage = (guest: Guest, event: Event, eventId: string) => {
  const rsvpLink = `${window.location.origin}/rsvp/${eventId}/${guest.id}`;
  return (
    `✨ *${event.title.toUpperCase()}* ✨\n\n` +
    `📅 *Date:* ${new Date(event.date).toLocaleDateString('fr-FR')}\n` +
    `📍 *Lieu:* ${event.location}\n\n` +
    `Bonjour *${guest.name}*,\n\n` +
    `Vous êtes cordialement invité(e) à cet événement spécial. Nous serions ravis de vous compter parmi nous !\n\n` +
    `👉 *Confirmez votre présence ici :* ${rsvpLink}\n\n` +
    `Nous avons hâte de vous voir! 🥂\n\n` +
    `_HK Events_`
  );
};

export const openWhatsAppInvite = (phone: string, message: string) => {
  const url = `https://wa.me/${getWhatsAppDigits(phone)}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const guestHasPhone = (guest: Guest) => Boolean(guest.phone?.trim());
