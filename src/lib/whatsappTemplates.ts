import type { Event, Guest } from '@/types/models';

export interface WhatsAppTemplateCustomization {
  title?: string;
  message?: string;
  eventName?: string;
  date?: string;
  time?: string;
  location?: string;
}

export interface WhatsAppTemplateContext {
  guest: Guest;
  event: Event;
  eventId: string;
  customization?: WhatsAppTemplateCustomization;
}

export interface WhatsAppInviteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  build: (ctx: WhatsAppTemplateContext) => string;
}

export const WHATSAPP_TEMPLATE_STORAGE_KEY = 'hk_whatsapp_template_id';

const FOOTER = '_HK Events_';

function rsvpLink(eventId: string, guestId: string): string {
  return `${window.location.origin}/rsvp/${eventId}/${guestId}`;
}

function eventTitle(ctx: WhatsAppTemplateContext): string {
  return ctx.customization?.eventName || ctx.event.title;
}

function eventDate(ctx: WhatsAppTemplateContext): string {
  if (ctx.customization?.date) return ctx.customization.date;
  return new Date(ctx.event.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function eventTime(ctx: WhatsAppTemplateContext): string {
  return ctx.customization?.time || ctx.event.startTime || '';
}

function eventLocation(ctx: WhatsAppTemplateContext): string {
  return ctx.customization?.location || ctx.event.location;
}

function customMessage(ctx: WhatsAppTemplateContext, fallback: string): string {
  return ctx.customization?.message?.trim() || fallback;
}

function timeLine(ctx: WhatsAppTemplateContext): string {
  const time = eventTime(ctx);
  return time ? `🕐 *Heure :* ${time}\n` : '';
}

export const WHATSAPP_TEMPLATES: WhatsAppInviteTemplate[] = [
  {
    id: 'classique',
    name: 'Classique',
    category: 'Général',
    description: 'Invitation claire avec date, lieu et lien RSVP',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `✨ *${eventTitle(ctx).toUpperCase()}* ✨\n\n` +
        `📅 *Date :* ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `📍 *Lieu :* ${eventLocation(ctx)}\n\n` +
        `Bonjour *${ctx.guest.name}*,\n\n` +
        `${customMessage(ctx, 'Vous êtes cordialement invité(e) à cet événement spécial. Nous serions ravis de vous compter parmi nous !')}\n\n` +
        `👉 *Confirmez votre présence :* ${link}\n\n` +
        `Nous avons hâte de vous voir ! 🥂\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'mariage_elegant',
    name: 'Mariage élégant',
    category: 'Mariage',
    description: 'Ton romantique avec emoji mariage',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `💍 *INVITATION MARIAGE* 💍\n\n` +
        `✨ *${eventTitle(ctx)}*\n\n` +
        `📅 ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `📍 ${eventLocation(ctx)}\n\n` +
        `Cher(e) *${ctx.guest.name}*,\n\n` +
        `${customMessage(ctx, 'Nous avons la joie de vous inviter à célébrer notre union. Votre présence compte énormément pour nous.')}\n\n` +
        `🙏 Merci de confirmer votre présence :\n${link}\n\n` +
        `Avec tout notre amour 💕\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'mariage_royal',
    name: 'Mariage royal',
    category: 'Mariage',
    description: 'Formulation solennelle et raffinée',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `👑 *SAVE THE DATE* 👑\n\n` +
        `*${eventTitle(ctx)}*\n\n` +
        `Nous avons l'honneur de vous convier à la célébration de notre mariage.\n\n` +
        `📅 *Date :* ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `📍 *Lieu :* ${eventLocation(ctx)}\n\n` +
        `À l'attention de *${ctx.guest.name}*,\n\n` +
        `${customMessage(ctx, 'Il nous ferait grand plaisir de partager ce moment d\'exception avec vous.')}\n\n` +
        `RSVP : ${link}\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'romantique',
    name: 'Romantique',
    category: 'Mariage',
    description: 'Message doux et chaleureux',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `💕 *Une invitation spéciale* 💕\n\n` +
        `Bonjour *${ctx.guest.name}*,\n\n` +
        `${customMessage(ctx, 'Nous serions touchés de vous avoir à nos côtés pour ce jour inoubliable.')}\n\n` +
        `🌸 *${eventTitle(ctx)}*\n` +
        `📅 ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `📍 ${eventLocation(ctx)}\n\n` +
        `Confirmez ici : ${link}\n\n` +
        `Avec affection 🤍\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'festif',
    name: 'Festif',
    category: 'Anniversaire',
    description: 'Ton joyeux pour fêtes et anniversaires',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `🎉 *C'EST LA FÊTE !* 🎉\n\n` +
        `Salut *${ctx.guest.name}* ! 👋\n\n` +
        `${customMessage(ctx, 'On te invite à une super célébration — ta présence rendrait la fête encore plus belle !')}\n\n` +
        `🎊 *${eventTitle(ctx)}*\n` +
        `📅 ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `📍 ${eventLocation(ctx)}\n\n` +
        `Dis-nous si tu viens 👇\n${link}\n\n` +
        `On a hâte ! 🥳\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    category: 'Corporate',
    description: 'Court et professionnel',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `*${eventTitle(ctx)}*\n\n` +
        `Bonjour ${ctx.guest.name},\n\n` +
        `${customMessage(ctx, 'Vous êtes invité(e) à participer à notre événement.')}\n\n` +
        `Date : ${eventDate(ctx)}\n` +
        (eventTime(ctx) ? `Heure : ${eventTime(ctx)}\n` : '') +
        `Lieu : ${eventLocation(ctx)}\n\n` +
        `Confirmation : ${link}\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'formel',
    name: 'Formel',
    category: 'Gala',
    description: 'Style gala ou cérémonie officielle',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `🎩 *INVITATION OFFICIELLE* 🎩\n\n` +
        `Madame, Monsieur,\n\n` +
        `Nous avons le plaisir de vous adresser une invitation pour :\n\n` +
        `*${eventTitle(ctx)}*\n\n` +
        `📅 ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `📍 ${eventLocation(ctx)}\n\n` +
        `Cher(e) *${ctx.guest.name}*,\n` +
        `${customMessage(ctx, 'Votre présence serait un honneur pour les organisateurs.')}\n\n` +
        `Merci de bien vouloir confirmer votre participation :\n${link}\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'chaleureux',
    name: 'Chaleureux',
    category: 'Général',
    description: 'Ton familial et convivial',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `🤗 *Tu es invité(e) !* 🤗\n\n` +
        `Coucou *${ctx.guest.name}* !\n\n` +
        `${customMessage(ctx, 'On organise un moment spécial et on aimerait vraiment te compter parmi nous.')}\n\n` +
        `✨ *${eventTitle(ctx)}*\n` +
        `📅 ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `📍 ${eventLocation(ctx)}\n\n` +
        `Réponds ici (oui / non) :\n${link}\n\n` +
        `Merci d'avance ! 💛\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'boho_sage',
    name: 'Boho Sage',
    category: 'Mariage',
    description: 'Ton doux et naturel, style invitation vert sauge',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      return (
        `🌿 *INVITATION BOHO* 🌿\n\n` +
        `Bonjour *${ctx.guest.name}*,\n\n` +
        `${customMessage(ctx, 'Nous vous invitons à célébrer ce moment unique avec nous. Votre présence illuminerait notre journée.')}\n\n` +
        `✨ *${eventTitle(ctx)}*\n` +
        `📅 ${eventDate(ctx)}\n` +
        timeLine(ctx) +
        `\n💚 Confirmez votre présence :\n${link}\n\n` +
        `Avec amour 🤍\n\n` +
        FOOTER
      );
    },
  },
  {
    id: 'save_the_date',
    name: 'Save the Date',
    category: 'Mariage',
    description: 'Rappel date avec compte à rebours implicite',
    build: (ctx) => {
      const link = rsvpLink(ctx.eventId, ctx.guest.id);
      const shortDate = new Date(ctx.event.date).toLocaleDateString('fr-FR');
      return (
        `📌 *SAVE THE DATE* 📌\n\n` +
        `*${eventTitle(ctx)}*\n` +
        `🗓 ${shortDate}\n\n` +
        `Bonjour *${ctx.guest.name}*,\n\n` +
        `${customMessage(ctx, 'Réservez cette date ! Une invitation détaillée vous attend — merci de confirmer votre présence.')}\n\n` +
        `📍 ${eventLocation(ctx)}\n` +
        timeLine(ctx) +
        `\n👉 RSVP : ${link}\n\n` +
        FOOTER
      );
    },
  },
];

export function getWhatsAppTemplateById(id: string): WhatsAppInviteTemplate {
  return WHATSAPP_TEMPLATES.find((t) => t.id === id) ?? WHATSAPP_TEMPLATES[0];
}

export function getStoredWhatsAppTemplateId(): string {
  if (typeof window === 'undefined') return 'classique';
  return localStorage.getItem(WHATSAPP_TEMPLATE_STORAGE_KEY) || 'classique';
}

export function setStoredWhatsAppTemplateId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WHATSAPP_TEMPLATE_STORAGE_KEY, id);
}

export function buildWhatsAppMessage(templateId: string, ctx: WhatsAppTemplateContext): string {
  return getWhatsAppTemplateById(templateId).build(ctx);
}

export function mapVisualTemplateToWhatsApp(visualTemplateId?: string): string {
  if (!visualTemplateId) return 'classique';
  if (visualTemplateId === 'boho_sage') return 'boho_sage';
  if (visualTemplateId.startsWith('wedding_')) {
    if (visualTemplateId === 'wedding_luxury') return 'mariage_royal';
    if (visualTemplateId === 'wedding_dark') return 'mariage_royal';
    return 'mariage_elegant';
  }
  if (visualTemplateId === 'romantic') return 'romantique';
  if (visualTemplateId === 'festive') return 'festif';
  if (visualTemplateId === 'minimal') return 'minimal';
  if (visualTemplateId === 'graduation') return 'formel';
  if (visualTemplateId === 'elegant') return 'mariage_elegant';
  return 'classique';
}
