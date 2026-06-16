/** URL publique du site (sans slash final) */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL?.trim() || 'https://www.hkeventscd.com'
).replace(/\/+$/, '');

export const SITE_NAME = 'HK Event';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/pwa-icon-512.png`;

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
