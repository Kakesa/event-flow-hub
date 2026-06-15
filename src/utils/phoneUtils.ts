const DEFAULT_COUNTRY_CODE = '243';

/** Normalise un numéro RDC vers +243XXXXXXXXX */
export const normalizePhoneToE164 = (
  phone?: string | null
): string | undefined => {
  if (!phone?.trim()) return undefined;

  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    const national = digits.slice(3);
    if (national.length === 9) {
      return `+${DEFAULT_COUNTRY_CODE}${national}`;
    }
  }

  if (digits.length === 9) {
    return `+${DEFAULT_COUNTRY_CODE}${digits}`;
  }

  return undefined;
};

export const isValidCongolesePhone = (phone?: string | null): boolean =>
  !!normalizePhoneToE164(phone);

/** Chiffres pour wa.me (ex: 243828863897) */
export const getWhatsAppDigits = (phone?: string | null): string => {
  const normalized = normalizePhoneToE164(phone);
  return normalized ? normalized.replace(/\D/g, '') : '';
};

/** Saisie locale : 9 chiffres sans indicatif */
export const formatPhoneInput = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) digits = digits.slice(3);
  return digits.slice(0, 9);
};

export const phoneFromStorageToInput = (stored?: string | null): string => {
  if (!stored) return '';
  const digits = stored.replace(/\D/g, '');
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    return digits.slice(3, 12);
  }
  return digits.slice(0, 9);
};

export const formatPhoneDisplay = (phone?: string | null): string =>
  normalizePhoneToE164(phone) || phone || '';
