import type { Event } from '@/types/models';
import { COUNTDOWN_TARGET } from '@/content/weddingLanding.fr';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
}

export interface CountdownMilestone {
  days: number;
  suffix: string;
  message: (title: string) => string;
}

export const COUNTDOWN_MILESTONES: CountdownMilestone[] = [
  {
    days: 7,
    suffix: 'j7',
    message: (title) => `Il reste 1 semaine avant « ${title} ». Finalisez les derniers détails !`,
  },
  {
    days: 3,
    suffix: 'j3',
    message: (title) => `Plus que 3 jours avant « ${title} ». Vérifiez vos invités et invitations.`,
  },
  {
    days: 1,
    suffix: 'j1',
    message: (title) => `Demain, c'est le grand jour : « ${title} ». Bonne dernière ligne droite !`,
  },
  {
    days: 0,
    suffix: 'j0',
    message: (title) =>
      `C'est le jour J pour « ${title} » ! Merci d'avoir choisi HK Event pour votre célébration.`,
  },
];

export const parseEventDateTime = (dateStr: string, startTime?: string): Date => {
  const date = new Date(dateStr);
  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    if (!Number.isNaN(hours)) {
      date.setHours(hours, minutes ?? 0, 0, 0);
    }
  } else {
    date.setHours(18, 0, 0, 0);
  }
  return date;
};

export const getCalendarDaysUntil = (target: Date): number => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((eventDay.getTime() - today.getTime()) / 86_400_000);
};

export const calcCountdown = (target: Date): CountdownTime => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: diff, isPast: true };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    totalMs: diff,
    isPast: false,
  };
};

export const getNextUpcomingEvent = (events: Event[]): Event | null => {
  const now = Date.now();
  const upcoming = events
    .map((event) => ({
      event,
      at: parseEventDateTime(event.date, event.startTime).getTime(),
    }))
    .filter(({ at }) => at >= now - 86_400_000)
    .sort((a, b) => a.at - b.at);

  return upcoming[0]?.event ?? null;
};

export const getCountdownTargetForEvent = (event: Event): Date =>
  parseEventDateTime(event.date, event.startTime);

export const DEFAULT_COUNTDOWN_TARGET = COUNTDOWN_TARGET;

/** Fenêtre d'affichage pour chaque palier (J-7, J-3, J-1, J). */
export const isMilestoneActive = (daysLeft: number, milestoneDays: number): boolean => {
  if (daysLeft < 0) return false;
  if (milestoneDays === 7) return daysLeft >= 4 && daysLeft <= 7;
  if (milestoneDays === 3) return daysLeft >= 2 && daysLeft <= 3;
  if (milestoneDays === 1) return daysLeft === 1;
  if (milestoneDays === 0) return daysLeft === 0;
  return false;
};

export const formatEventDateFr = (dateStr: string, startTime?: string): string => {
  const date = parseEventDateTime(dateStr, startTime);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(startTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

export const dayJStorageKey = (userId: string, eventId: string) =>
  `hk_dayj_seen_${userId}_${eventId}`;
