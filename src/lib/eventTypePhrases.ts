const TYPE_ALIASES: Record<string, string> = {
  wedding: 'Mariage',
  birthday: 'Anniversaire',
  corporate: 'Événement corporate',
  graduation: 'Remise de diplôme',
  babyshower: 'Baby Shower',
  party: 'Fête',
  other: 'Autre',
};

/** Normalise les anciennes valeurs (ex. wedding) vers le libellé FR */
export const normalizeEventType = (eventType?: string): string => {
  if (!eventType?.trim()) return '';
  const trimmed = eventType.trim();
  return TYPE_ALIASES[trimmed.toLowerCase()] ?? trimmed;
};

export interface EventTypePhraseParts {
  prefix: string;
  noun: string;
}

/** Ex. { prefix: 'à notre', noun: 'mariage' } */
export const getEventTypePhraseParts = (eventType?: string): EventTypePhraseParts => {
  const type = normalizeEventType(eventType);

  switch (type) {
    case 'Mariage':
      return { prefix: 'à notre', noun: 'mariage' };
    case 'Anniversaire':
      return { prefix: 'à mon', noun: 'anniversaire' };
    case 'Baby Shower':
      return { prefix: 'à notre', noun: 'baby shower' };
    case 'Remise de diplôme':
      return { prefix: 'à ma', noun: 'remise de diplôme' };
    case 'Événement corporate':
      return { prefix: 'à notre', noun: 'événement corporate' };
    case 'Fête':
      return { prefix: 'à notre', noun: 'fête' };
    case 'Autre':
      return { prefix: 'à notre', noun: 'événement' };
    default:
      if (!type) return { prefix: 'à notre', noun: 'événement' };
      return { prefix: 'à notre', noun: type.toLowerCase() };
  }
};

/** Libellé court du type : « mariage », « anniversaire »… */
export const getEventTypeNoun = (eventType?: string): string =>
  getEventTypePhraseParts(eventType).noun;

/** Ex. « à notre mariage », « à mon anniversaire » */
export const getEventTypeWithArticle = (eventType?: string): string => {
  const { prefix, noun } = getEventTypePhraseParts(eventType);
  return `${prefix} ${noun}`;
};

/** Ligne d'accroche RSVP : « Vous êtes invité(e) à notre mariage » */
export const getRsvpInvitationLine = (eventType?: string): string => {
  const { prefix, noun } = getEventTypePhraseParts(eventType);
  return `Vous êtes invité(e) ${prefix} ${noun}`;
};
