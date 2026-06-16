/** Contenu FR — style template mariage Renderforest (Outdoor / Elegant Wedding) */

export const WEDDING_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
  story: '/images/services/invitations-personnalise.png',
  storyAlt: '/images/gallery/gallery-intimate-moment.png',
  gallery: [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
    'https://images.unsplash.com/photo-1465497035980-0f5e2d0c8e8e?w=600&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b238486?w=600&q=80',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80',
    'https://images.unsplash.com/photo-1591604466377-1a63d266d989?w=600&q=80',
    'https://images.unsplash.com/photo-1529636798458-921d089c3625?w=600&q=80',
  ],
  venue: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80',
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
