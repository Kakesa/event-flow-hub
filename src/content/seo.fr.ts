import { getServiceBySlug, SERVICE_SLUGS } from '@/content/services.fr';
import { FAQ_ITEMS } from '@/content/weddingLanding.fr';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from '@/config/site';

export interface PageSEO {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const DEFAULT_SEO: PageSEO = {
  title: `${SITE_NAME} — Gestion d'événements, invitations & RSVP en Afrique`,
  description:
    'HK Event : plateforme élégante pour mariages, galas et cérémonies. Invitations personnalisées, RSVP en ligne, scanner QR, livre d\'or digital. Disponible en RDC et en Afrique.',
  path: '/',
  image: DEFAULT_OG_IMAGE,
};

const PRIVATE_PREFIXES = [
  '/dashboard',
  '/events',
  '/guests',
  '/guestbook',
  '/analytics',
  '/invitations',
  '/scanner',
  '/settings',
  '/users',
  '/admin',
  '/superadmin',
  '/rsvp',
  '/invite',
  '/checkin',
];

export const isPrivatePath = (pathname: string) =>
  PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const getSEOForPath = (pathname: string): PageSEO => {
  if (isPrivatePath(pathname)) {
    return {
      title: `${SITE_NAME}`,
      description: DEFAULT_SEO.description,
      path: pathname,
      noindex: true,
    };
  }

  if (pathname === '/auth' || pathname === '/auth/register') {
    return {
      title: `Connexion & inscription | ${SITE_NAME}`,
      description:
        'Créez votre compte HK Event gratuitement. Organisez mariages, galas et événements avec invitations, RSVP et scanner QR.',
      path: pathname,
      noindex: true,
    };
  }

  if (pathname === '/services') {
    return {
      title: `Nos services événementiels | ${SITE_NAME}`,
      description:
        'Planification, invitations personnalisées, RSVP, scanner QR, livre d\'or digital et analytics : découvrez tous les services HK Event pour vos célébrations.',
      path: '/services',
      image: absoluteUrl('/images/services/invitations-personnalise.png'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Services HK Event',
        itemListElement: SERVICE_SLUGS.map((slug, i) => {
          const s = getServiceBySlug(slug)!;
          return {
            '@type': 'ListItem',
            position: i + 1,
            name: s.title,
            url: absoluteUrl(`/services/${slug}`),
          };
        }),
      },
    };
  }

  const serviceMatch = pathname.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const service = getServiceBySlug(serviceMatch[1]);
    if (service) {
      return {
        title: `${service.title} | ${SITE_NAME}`,
        description: `${service.shortDescription} ${service.intro.slice(0, 120)}…`,
        path: pathname,
        image: absoluteUrl(service.cardImage),
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.shortDescription,
          provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          url: absoluteUrl(pathname),
          areaServed: { '@type': 'Country', name: 'République Démocratique du Congo' },
        },
      };
    }
  }

  if (pathname === '/galerie') {
    return {
      title: `Galerie mariages & événements | ${SITE_NAME}`,
      description:
        'Inspirez-vous de nos réalisations : mariages, galas et célébrations orchestrés avec HK Event en Afrique.',
      path: '/galerie',
      image: absoluteUrl('/images/gallery/gallery-bride-portrait.png'),
    };
  }

  if (pathname === '/') {
    return {
      ...DEFAULT_SEO,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: DEFAULT_OG_IMAGE,
          description: DEFAULT_SEO.description,
          areaServed: ['CD', 'Africa'],
          sameAs: [],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: 'fr-FR',
          description: DEFAULT_SEO.description,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          description: DEFAULT_SEO.description,
          url: SITE_URL,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
      ],
    };
  }

  return {
    title: `Page introuvable | ${SITE_NAME}`,
    description: DEFAULT_SEO.description,
    path: pathname,
    noindex: true,
  };
};
