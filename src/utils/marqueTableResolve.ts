import type { Event, MarqueTable, MarqueTableDesign, MarqueTableTextStyle } from '@/types/models';

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
  backgroundColor: '#faf7f2',
  textColor: '#3a342c',
  accentColor: '#b8956c',
  border: { enabled: false, color: '#d4c4b0', widthMm: 0.3, radiusMm: 0 },
  decoration: { enabled: true, motif: 'event-cover', opacity: 1 },
  label: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.32em',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
    color: '#b8956c',
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 48,
    fontWeight: 500,
    letterSpacing: '0.04em',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
  },
  names: {
    fontFamily: '"Great Vibes", cursive',
    fontSize: 22,
    fontWeight: 400,
    letterSpacing: '0.01em',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
  },
  date: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.18em',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
    color: '#b8956c',
  },
};

export function mergeMarqueDesign(design?: MarqueTableDesign | null): MarqueTableDesign {
  const rawMotif = design?.decoration?.motif;
  let motif = rawMotif || 'event-cover';
  if (motif === 'floral-left') motif = 'event-cover';

  const isLegacyFont = (font?: string) =>
    !font ||
    font.includes('Times New Roman') ||
    font.startsWith('Georgia') ||
    font === 'system-ui, sans-serif';

  const mergeText = (
    key: 'label' | 'title' | 'names' | 'date',
  ): MarqueTableTextStyle => {
    const base = DEFAULT_MARQUE_DESIGN[key] || {};
    const override = design?.[key] || {};
    const fontFamily = isLegacyFont(override.fontFamily)
      ? base.fontFamily
      : override.fontFamily;
    return { ...base, ...override, fontFamily };
  };

  return {
    ...DEFAULT_MARQUE_DESIGN,
    ...design,
    backgroundColor:
      !design?.backgroundColor || design.backgroundColor === '#ffffff'
        ? DEFAULT_MARQUE_DESIGN.backgroundColor
        : design.backgroundColor,
    textColor:
      !design?.textColor || design.textColor === '#3d3d3d'
        ? DEFAULT_MARQUE_DESIGN.textColor
        : design.textColor,
    accentColor:
      !design?.accentColor || design.accentColor === '#8f6fad'
        ? DEFAULT_MARQUE_DESIGN.accentColor
        : design.accentColor,
    border: { ...DEFAULT_MARQUE_DESIGN.border, ...design?.border },
    decoration: {
      ...DEFAULT_MARQUE_DESIGN.decoration,
      ...design?.decoration,
      motif,
    },
    label: mergeText('label'),
    title: mergeText('title'),
    names: mergeText('names'),
    date: mergeText('date'),
  };
}
