import type { Event } from '@/types/models';
import { normalizeEventType } from '@/lib/eventTypePhrases';

export interface CoupleNames {
  name1: string;
  name2: string;
  display: string;
}

export interface CalendarDay {
  day: number | null;
  isEventDay: boolean;
}

export interface EventCalendar {
  monthLabel: string;
  year: number;
  weeks: CalendarDay[][];
}

export interface DateBlockParts {
  weekday: string;
  day: number;
  month: string;
  year: number;
}

const DEFAULT_NAVY = '#1e2d4a';
const DEFAULT_GOLD = '#c9a227';

/** Évite le décalage d'un jour avec les dates ISO (UTC vs local). */
function parseLocalDate(dateStr: string): Date {
  const iso = dateStr.split('T')[0];
  const parts = iso.split('-').map(Number);
  if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
}

function capitalizeFr(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function parseCoupleFromTitle(title: string): CoupleNames {
  const parts = title
    .split(/\s*(?:&| et | and |\+)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      name1: parts[0],
      name2: parts[1],
      display: `${parts[0]} & ${parts[1]}`,
    };
  }

  return { name1: title, name2: '', display: title };
}

export function getMonogram(couple: CoupleNames): string {
  const first = couple.name1.charAt(0).toUpperCase();
  const second = couple.name2 ? couple.name2.charAt(0).toUpperCase() : '';
  return second ? `${first}  ${second}` : first;
}

export function formatCompactDate(date: string): string {
  const parsed = parseLocalDate(date);
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatFullDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getDateBlockParts(date: string): DateBlockParts {
  const parsed = parseLocalDate(date);
  return {
    weekday: parsed.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase(),
    day: parsed.getDate(),
    month: parsed.toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase(),
    year: parsed.getFullYear(),
  };
}

export function getEventCalendarGrid(dateStr: string): EventCalendar {
  const eventDate = parseLocalDate(dateStr);
  const year = eventDate.getFullYear();
  const month = eventDate.getMonth();
  const eventDay = eventDate.getDate();

  const monthLabel = capitalizeFr(
    eventDate.toLocaleDateString('fr-FR', { month: 'long' }),
  );
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startWeekday = firstDay.getDay();
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

  const cells: CalendarDay[] = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ day: null, isEventDay: false });
  }
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push({ day, isEventDay: day === eventDay });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, isEventDay: false });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return { monthLabel, year, weeks };
}

export function getRsvpDeadlineLabel(date: string): string {
  const deadline = parseLocalDate(date);
  deadline.setDate(deadline.getDate() - 14);
  return deadline.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export function getRsvpThemeColor(event: Event): string {
  return event.primaryColor || DEFAULT_NAVY;
}

export function getRsvpGoldColor(event: Event): string {
  return event.accentColor || DEFAULT_GOLD;
}

export const DEFAULT_DRESS_CODE = 'Élégante';
export const DEFAULT_DRESS_CODE_NOTES =
  'Tenue de cérémonie souhaitée. Merci d\'éviter le blanc et les tons similaires.';

export function getDressCodeLabel(event: Event): string {
  return event.dressCode?.trim() || DEFAULT_DRESS_CODE;
}

export function getDressCodeNotes(event: Event): string {
  return event.dressCodeNotes?.trim() || DEFAULT_DRESS_CODE_NOTES;
}

export function hasCustomDressCode(event: Event): boolean {
  return Boolean(event.dressCode?.trim() || event.dressCodeNotes?.trim());
}

export function getAnnouncementPhrase(event: Event): string {
  const type = normalizeEventType(event.type);
  if (type === 'Mariage') return 'Nous nous marions !';
  if (type === 'Anniversaire') return 'Nous fêtons cet anniversaire !';
  if (type === 'Baby Shower') return 'Un bébé arrive !';
  return 'Vous êtes invité(e) !';
}

export function buildMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function getGuestInvitationLine(
  guestName: string | undefined,
  event: Event,
  typePhrase: string,
): string {
  if (guestName) {
    return `Cher(e) ${guestName}, nous avons l'honneur de vous inviter ${typePhrase}. Merci de confirmer votre présence.`;
  }
  return `Nous avons l'honneur de vous inviter ${typePhrase}. Nous serions ravis de partager ce moment avec vous.`;
}

export const CALENDAR_WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
