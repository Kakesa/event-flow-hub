import type { Event, Guest } from '@/types/models';
import { getWhatsAppDigits } from '@/utils/phoneUtils';
import {
  buildWhatsAppMessage,
  getStoredWhatsAppTemplateId,
  type WhatsAppTemplateCustomization,
} from '@/lib/whatsappTemplates';

export const buildDefaultInviteMessage = (
  guest: Guest,
  event: Event,
  eventId: string,
  templateId?: string,
  customization?: WhatsAppTemplateCustomization,
) =>
  buildWhatsAppMessage(templateId ?? getStoredWhatsAppTemplateId(), {
    guest,
    event,
    eventId,
    customization,
  });

export const openWhatsAppInvite = (phone: string, message: string) => {
  const url = `https://wa.me/${getWhatsAppDigits(phone)}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const guestHasPhone = (guest: Guest) => Boolean(guest.phone?.trim());
