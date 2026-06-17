/** Contenu FR — style template mariage Renderforest (Outdoor / Elegant Wedding) */

export const WEDDING_IMAGES = {
  hero: '/images/services/planification-hero.jpg',
  heroWebpSrcSet:
    '/images/services/planification-hero-768.webp 768w, /images/services/planification-hero-1280.webp 1280w, /images/services/planification-hero-1920.webp 1920w',
  story: '/images/services/invitations-personnalise.png',
  storyAlt: '/images/gallery/gallery-intimate-moment.png',
  gallery: [
    '/images/gallery/gallery-bride-portrait.png',
    '/images/gallery/gallery-royal-kiss.png',
    '/images/gallery/gallery-couple-road.png',
    '/images/gallery/gallery-intimate-moment.png',
    '/images/gallery/gallery-garden-embrace.png',
    '/images/gallery/gallery-bride-portrait.png',
  ],
  venue: '/images/services/planification-hero.jpg',
  venueWebpSrcSet:
    '/images/services/planification-hero-768.webp 768w, /images/services/planification-hero-1280.webp 1280w',
};

export const NAV_LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '/services', label: 'Services', isRoute: true },
  { href: '/galerie', label: 'Galerie', isRoute: true },
  { href: '#contact', label: 'Contact' },
] as const;

export const TESTIMONIALS = [
  {
    name: 'Marie Kabongo',
    role: 'Organisatrice de mariage',
    quote: 'HK Event a transformé notre grand jour. Invitations, RSVP et accueil : tout était fluide et élégant.',
  },
  {
    name: 'Jean-Paul Mbuyi',
    role: 'Directeur d\'entreprise',
    quote: 'Pour nos galas corporate, la plateforme nous fait gagner un temps précieux. Simple, beau, efficace.',
  },
  {
    name: 'Amina Diallo',
    role: 'Wedding planner',
    quote: 'Je recommande HK Event à tous mes clients. Une expérience digne des plus belles cérémonies.',
  },
];

export const FAQ_ITEMS = [
  {
    q: 'Comment créer mon premier événement ?',
    a: 'Inscrivez-vous gratuitement, connectez-vous et accédez à votre tableau de bord. Cliquez sur « Nouvel événement » et renseignez les détails de votre cérémonie.',
  },
  {
    q: 'HK Event est-il gratuit ?',
    a: 'Oui, un plan gratuit permet de gérer jusqu\'à 10 invités par événement. Des formules Premium sont disponibles pour les grandes célébrations.',
  },
  {
    q: 'Comment fonctionne le scanner QR ?',
    a: 'Chaque invité reçoit un QR code unique. Le jour J, scannez-le à l\'entrée pour valider la présence instantanément.',
  },
  {
    q: 'Puis-je personnaliser les invitations ?',
    a: 'Absolument. Choisissez un modèle, personnalisez couleurs et textes, puis envoyez par e-mail ou WhatsApp.',
  },
  {
    q: 'Disponible en République Démocratique du Congo ?',
    a: 'Oui. HK Event est pensé pour l\'Afrique, avec paiements locaux (M-Pesa, Airtel Money) et interface mobile optimisée.',
  },
];

export const COUNTDOWN_TARGET = new Date('2026-12-31T18:00:00');
