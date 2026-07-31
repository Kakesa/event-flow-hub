import { absoluteUrl } from '@/config/site';

/** Extrait le token depuis un scan (hash seul ou URL complète) */
export const parseScanToken = (raw: string): string => {
  let token = decodeURIComponent(String(raw || '').trim());
  const fromUrl = token.match(/\/checkin\/([a-fA-F0-9]{24,64})/);
  if (fromUrl) token = fromUrl[1];
  return token;
};

/** URL encodée dans le QR — ouvre la page de check-in au scan */
export const getGuestCheckInUrl = (token: string, invitationCode?: string): string => {
  const base = absoluteUrl(`/checkin/${parseScanToken(token)}`);
  const code = invitationCode?.trim().toUpperCase();
  if (code) {
    return `${base}?code=${encodeURIComponent(code)}`;
  }
  return base;
};
