import type { Event, MarqueTable, MarqueTableDesign } from '@/types/models';

/** Parse couple names from event title — also supports Portuguese/Spanish " e ". */
export function parseMarqueCoupleFromTitle(title: string): {
  name1: string;
  name2: string;
  display: string;
  isCouple: boolean;
} {
  const parts = String(title || '')
    .split(/\s*(?:&| et | and | e |\+)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      name1: parts[0],
      name2: parts[1],
      display: `${parts[0]} & ${parts[1]}`,
      isCouple: true,
    };
  }

  return {
    name1: title,
    name2: '',
    display: title,
    isCouple: false,
  };
}

export function formatMarqueDate(date: string | Date | undefined): string {
  if (!date) return '';
  const raw = typeof date === 'string' ? date : date.toISOString();
  const iso = raw.split('T')[0];
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function resolveMarqueDisplayName(
  marque: Pick<MarqueTable, 'displayNameOverride'>,
  event?: Pick<Event, 'title'> | null,
): string {
  const override = marque.displayNameOverride?.trim();
  if (override) return override;
  if (!event?.title) return '';
  return parseMarqueCoupleFromTitle(event.title).display;
}

export function resolveMarqueDisplayDate(
  marque: Pick<MarqueTable, 'displayDateOverride'>,
  event?: Pick<Event, 'date'> | null,
): string {
  const override = marque.displayDateOverride?.trim();
  if (override) return override;
  return formatMarqueDate(event?.date);
}

export function resolveMarqueTitleText(marque: Pick<MarqueTable, 'titleText' | 'number'>): string {
  return (marque.titleText || marque.number || '').trim();
}

export const DEFAULT_MARQUE_DESIGN: Required<
  Pick<
    MarqueTableDesign,
    | 'templateId'
    | 'orientation'
    | 'widthMm'
    | 'heightMm'
    | 'tentFold'
    | 'backgroundColor'
    | 'textColor'
    | 'accentColor'
  >
> &
  MarqueTableDesign = {
  templateId: 'classic-floral',
  orientation: 'landscape',
  widthMm: 160,
  heightMm: 95,
  tentFold: true,
  backgroundColor: '#ffffff',
  textColor: '#3d3d3d',
  accentColor: '#8f6fad',
  border: { enabled: false, color: '#e5e0d8', widthMm: 0.3, radiusMm: 0 },
  decoration: { enabled: true, motif: 'event-cover', opacity: 0.98 },
  label: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: '0.06em',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
  },
  title: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 42,
    fontWeight: 500,
    letterSpacing: '0.02em',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
  },
  names: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: '0.03em',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
  },
  date: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: '0.04em',
    align: 'center',
    offsetX: 0,
    offsetY: 2,
  },
};

export function mergeMarqueDesign(design?: MarqueTableDesign | null): MarqueTableDesign {
  const rawMotif = design?.decoration?.motif;
  // Ancien défaut stocké `floral-left` → photo de couverture
  // Le choix volontaire « Floral » utilise désormais `floral`
  let motif = rawMotif || 'event-cover';
  if (motif === 'floral-left') motif = 'event-cover';

  return {
    ...DEFAULT_MARQUE_DESIGN,
    ...design,
    border: { ...DEFAULT_MARQUE_DESIGN.border, ...design?.border },
    decoration: {
      ...DEFAULT_MARQUE_DESIGN.decoration,
      ...design?.decoration,
      motif,
    },
    label: { ...DEFAULT_MARQUE_DESIGN.label, ...design?.label },
    title: { ...DEFAULT_MARQUE_DESIGN.title, ...design?.title },
    names: { ...DEFAULT_MARQUE_DESIGN.names, ...design?.names },
    date: { ...DEFAULT_MARQUE_DESIGN.date, ...design?.date },
  };
}
