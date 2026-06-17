import { normalizeEventType } from '@/lib/eventTypePhrases';

export const RSVP_ROSES_BOUQUET = '/images/rsvp/roses-bouquet.png';

export interface RsvpFloralAsset {
  src: string;
  alt: string;
  className: string;
  delay?: number;
}

export interface RsvpDecorationTheme {
  key: string;
  bg: string;
  borderColor: string;
  inset: string;
  /** Bouquets / fleurs photo réalistes */
  florals?: RsvpFloralAsset[];
  /** Décor emoji pour les autres types */
  corners?: { position: string; symbols: string[]; size: string }[];
  edges?: { symbol: string; top?: string; left?: string; right?: string; bottom?: string; rotate?: number; size: string; delay?: number }[];
}

const weddingFlorals: RsvpFloralAsset[] = [
  {
    src: RSVP_ROSES_BOUQUET,
    alt: 'Bouquet de roses',
    className:
      'bottom-0 left-0 w-[clamp(6.5rem,24vw,12rem)] -translate-x-[8%] translate-y-[6%] rotate-[18deg] origin-bottom-left',
    delay: 0.1,
  },
  {
    src: RSVP_ROSES_BOUQUET,
    alt: 'Bouquet de roses',
    className:
      'bottom-0 right-0 w-[clamp(6.5rem,24vw,12rem)] translate-x-[8%] translate-y-[6%] -scale-x-100 rotate-[-18deg] origin-bottom-right',
    delay: 0.18,
  },
  {
    src: RSVP_ROSES_BOUQUET,
    alt: 'Bouquet de roses',
    className:
      'top-0 left-0 w-[clamp(4.5rem,16vw,8rem)] -translate-x-[10%] -translate-y-[4%] rotate-[-28deg] origin-top-left opacity-95',
    delay: 0.25,
  },
  {
    src: RSVP_ROSES_BOUQUET,
    alt: 'Bouquet de roses',
    className:
      'top-0 right-0 w-[clamp(4.5rem,16vw,8rem)] translate-x-[10%] -translate-y-[4%] -scale-x-100 rotate-[28deg] origin-top-right opacity-95',
    delay: 0.32,
  },
  {
    src: RSVP_ROSES_BOUQUET,
    alt: 'Bouquet de roses',
    className:
      'top-[38%] -left-2 w-[clamp(3rem,10vw,5rem)] -translate-x-[20%] rotate-[-90deg] origin-center opacity-80 hidden sm:block',
    delay: 0.4,
  },
  {
    src: RSVP_ROSES_BOUQUET,
    alt: 'Bouquet de roses',
    className:
      'top-[38%] -right-2 w-[clamp(3rem,10vw,5rem)] translate-x-[20%] -scale-x-100 rotate-[90deg] origin-center opacity-80 hidden sm:block',
    delay: 0.48,
  },
];

const weddingTheme: RsvpDecorationTheme = {
  key: 'mariage',
  bg: 'linear-gradient(165deg, #f5f0eb 0%, #ebe3dc 45%, #ddd4cb 100%)',
  borderColor: '#8b2942',
  inset: 'clamp(18px, 4.5vw, 42px)',
  florals: weddingFlorals,
};

const birthdayTheme: RsvpDecorationTheme = {
  key: 'anniversaire',
  bg: '#fffbeb',
  borderColor: '#fbbf24',
  inset: 'clamp(14px, 4vw, 36px)',
  corners: [
    { position: '-top-2 -left-2', symbols: ['🎈', '🎉'], size: 'text-4xl sm:text-5xl' },
    { position: '-top-2 -right-2', symbols: ['🎁', '🎈'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -left-2', symbols: ['🥳', '🎈'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -right-2', symbols: ['🎉', '🎁'], size: 'text-4xl sm:text-5xl' },
  ],
  edges: [
    { symbol: '🎈', top: '3%', left: '25%', size: 'text-2xl', rotate: -6, delay: 0 },
    { symbol: '✨', top: '5%', right: '30%', size: 'text-xl', rotate: 12, delay: 0.5 },
    { symbol: '🎈', bottom: '4%', left: '35%', size: 'text-2xl', rotate: 8, delay: 0.3 },
    { symbol: '🎉', bottom: '3%', right: '22%', size: 'text-xl', rotate: -10, delay: 0.7 },
  ],
};

const babyShowerTheme: RsvpDecorationTheme = {
  key: 'baby-shower',
  bg: '#f0fdf4',
  borderColor: '#86efac',
  inset: 'clamp(14px, 4vw, 36px)',
  corners: [
    { position: '-top-2 -left-2', symbols: ['🍼', '🧸'], size: 'text-4xl sm:text-5xl' },
    { position: '-top-2 -right-2', symbols: ['🌿', '🍼'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -left-2', symbols: ['🧸', '🌿'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -right-2', symbols: ['☁️', '🍼'], size: 'text-4xl sm:text-5xl' },
  ],
  edges: [
    { symbol: '🌿', top: '4%', left: '28%', size: 'text-xl', rotate: -15, delay: 0 },
    { symbol: '☁️', top: '3%', right: '26%', size: 'text-2xl', rotate: 5, delay: 0.4 },
    { symbol: '🌿', bottom: '4%', left: '30%', size: 'text-xl', rotate: 10, delay: 0.6 },
  ],
};

const graduationTheme: RsvpDecorationTheme = {
  key: 'diplome',
  bg: '#f5f3ff',
  borderColor: '#a78bfa',
  inset: 'clamp(14px, 4vw, 36px)',
  corners: [
    { position: '-top-2 -left-2', symbols: ['🎓', '✨'], size: 'text-4xl sm:text-5xl' },
    { position: '-top-2 -right-2', symbols: ['✨', '🎓'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -left-2', symbols: ['📜', '✨'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -right-2', symbols: ['🎓', '📜'], size: 'text-4xl sm:text-5xl' },
  ],
  edges: [
    { symbol: '✨', top: '4%', left: '30%', size: 'text-xl', rotate: 0, delay: 0 },
    { symbol: '⭐', top: '3%', right: '28%', size: 'text-lg', rotate: 12, delay: 0.5 },
    { symbol: '✨', bottom: '4%', right: '32%', size: 'text-xl', rotate: -8, delay: 0.8 },
  ],
};

const corporateTheme: RsvpDecorationTheme = {
  key: 'corporate',
  bg: '#f8fafc',
  borderColor: '#94a3b8',
  inset: 'clamp(12px, 3vw, 28px)',
  corners: [
    { position: '-top-2 -left-2', symbols: ['✦'], size: 'text-3xl sm:text-4xl text-[#64748b]' },
    { position: '-top-2 -right-2', symbols: ['✦'], size: 'text-3xl sm:text-4xl text-[#64748b]' },
    { position: '-bottom-2 -left-2', symbols: ['✦'], size: 'text-3xl sm:text-4xl text-[#64748b]' },
    { position: '-bottom-2 -right-2', symbols: ['✦'], size: 'text-3xl sm:text-4xl text-[#64748b]' },
  ],
  edges: [
    { symbol: '—', top: '2%', left: '50%', size: 'text-2xl text-[#cbd5e1] tracking-[0.5em]', rotate: 0, delay: 0 },
    { symbol: '—', bottom: '2%', left: '50%', size: 'text-2xl text-[#cbd5e1] tracking-[0.5em]', rotate: 0, delay: 0 },
  ],
};

const partyTheme: RsvpDecorationTheme = {
  key: 'fete',
  bg: '#fef3c7',
  borderColor: '#f59e0b',
  inset: 'clamp(14px, 4vw, 36px)',
  corners: [
    { position: '-top-2 -left-2', symbols: ['🎊', '🥳'], size: 'text-4xl sm:text-5xl' },
    { position: '-top-2 -right-2', symbols: ['🎉', '🎊'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -left-2', symbols: ['🥳', '🎉'], size: 'text-4xl sm:text-5xl' },
    { position: '-bottom-2 -right-2', symbols: ['🎊', '🎉'], size: 'text-4xl sm:text-5xl' },
  ],
  edges: [
    { symbol: '🎊', top: '3%', left: '24%', size: 'text-2xl', rotate: -10, delay: 0 },
    { symbol: '✨', top: '4%', right: '26%', size: 'text-xl', rotate: 15, delay: 0.3 },
    { symbol: '🎉', bottom: '3%', left: '32%', size: 'text-xl', rotate: 8, delay: 0.6 },
  ],
};

const defaultTheme: RsvpDecorationTheme = {
  key: 'default',
  bg: '#faf8f5',
  borderColor: '#b8956c',
  inset: 'clamp(14px, 4vw, 36px)',
  corners: [
    { position: '-top-1 -left-1', symbols: ['✦', '🌿'], size: 'text-3xl sm:text-4xl' },
    { position: '-top-1 -right-1', symbols: ['🌿', '✦'], size: 'text-3xl sm:text-4xl' },
    { position: '-bottom-1 -left-1', symbols: ['🌿', '✦'], size: 'text-3xl sm:text-4xl' },
    { position: '-bottom-1 -right-1', symbols: ['✦', '🌿'], size: 'text-3xl sm:text-4xl' },
  ],
  edges: [
    { symbol: '✦', top: '3%', left: '28%', size: 'text-lg text-[#b8956c]', rotate: 0, delay: 0 },
    { symbol: '🌿', bottom: '3%', right: '28%', size: 'text-lg', rotate: -12, delay: 0.5 },
  ],
};

export const getRsvpDecorationTheme = (eventType?: string): RsvpDecorationTheme => {
  switch (normalizeEventType(eventType)) {
    case 'Mariage':
      return weddingTheme;
    case 'Anniversaire':
      return birthdayTheme;
    case 'Baby Shower':
      return babyShowerTheme;
    case 'Remise de diplôme':
      return graduationTheme;
    case 'Événement corporate':
      return corporateTheme;
    case 'Fête':
      return partyTheme;
    default:
      return defaultTheme;
  }
};
