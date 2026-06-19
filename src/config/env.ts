/**
 * Configuration API — une seule source de vérité pour le frontend.
 *
 * Variables Vite :
 * - VITE_API_URL        → URL de l'API avec /api (ex: https://api.hkeventscd.com/api)
 * - VITE_API_BASE_URL   → URL du serveur sans /api (ex: https://api.hkeventscd.com)
 *
 * Fichiers par environnement :
 * - .env.development    → local (npm run dev)
 * - .env.production     → production (npm run build)
 * - .env.local          → overrides personnels (non versionné)
 */

const trimSlash = (value: string) => value.replace(/\/+$/, '');

const DEFAULT_LOCAL_SERVER = 'http://localhost:5000';
const DEFAULT_LOCAL_API = `${DEFAULT_LOCAL_SERVER}/api`;

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const envServerUrl = import.meta.env.VITE_API_BASE_URL?.trim();

/** URL de base de l'API (inclut /api) — utilisée pour tous les fetch */
export const API_BASE_URL = trimSlash(
  envApiUrl || (envServerUrl ? `${trimSlash(envServerUrl)}/api` : DEFAULT_LOCAL_API)
);

/** URL du serveur backend sans /api — uploads, images, fichiers statiques */
export const BASE_URL = trimSlash(
  envServerUrl || API_BASE_URL.replace(/\/api$/, '') || DEFAULT_LOCAL_SERVER
);

export const APP_MODE = import.meta.env.MODE;
export const IS_PRODUCTION = import.meta.env.PROD;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

/** Construit une URL absolue pour un chemin relatif (/uploads/...) ou Cloudinary http(s) */
export const resolveAssetUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
