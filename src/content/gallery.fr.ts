export type GalleryCategory = 'mariages' | 'galas' | 'decor' | 'moments';

export interface GalleryItem {
  id: string;
  src: string;
  category: GalleryCategory;
  caption: string;
  layout: 'tall' | 'wide' | 'square';
}

export const GALLERY_CATEGORIES: { id: GalleryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'mariages', label: 'Mariages' },
  { id: 'galas', label: 'Galas' },
  { id: 'decor', label: 'Décor & Fleurs' },
  { id: 'moments', label: 'Moments' },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'hk-1',
    src: '/images/gallery/gallery-bride-portrait.png',
    category: 'mariages',
    caption: 'Portrait de la mariée — élégance et grâce',
    layout: 'tall',
  },
  {
    id: 'hk-2',
    src: '/images/gallery/gallery-royal-kiss.png',
    category: 'mariages',
    caption: 'Royal — baiser sur la main',
    layout: 'tall',
  },
  {
    id: 'hk-3',
    src: '/images/gallery/gallery-couple-road.png',
    category: 'mariages',
    caption: 'Le couple — complicité et bonheur',
    layout: 'tall',
  },
  {
    id: 'hk-4',
    src: '/images/gallery/gallery-intimate-moment.png',
    category: 'mariages',
    caption: 'Moment intime — émotion pure',
    layout: 'tall',
  },
  {
    id: 'hk-5',
    src: '/images/gallery/gallery-garden-embrace.png',
    category: 'mariages',
    caption: 'Étreinte dans le jardin — joie partagée',
    layout: 'tall',
  },
  { id: '1', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', category: 'mariages', caption: 'Union sous la lumière dorée', layout: 'square' },
  { id: '2', src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', category: 'mariages', caption: 'Alliances et promesses éternelles', layout: 'square' },
  { id: '3', src: 'https://images.unsplash.com/photo-1465497035980-0f5e2d0c8e8e?w=800&q=80', category: 'mariages', caption: 'Premier pas de danse', layout: 'wide' },
  { id: '4', src: 'https://images.unsplash.com/photo-1522673607200-164d1b238486?w=800&q=80', category: 'decor', caption: 'Table dressée avec raffinement', layout: 'square' },
  { id: '5', src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', category: 'moments', caption: 'Éclats de rire et joie partagée', layout: 'tall' },
  { id: '6', src: 'https://images.unsplash.com/photo-1591604466377-1a63d266d989?w=800&q=80', category: 'mariages', caption: 'Bouquet de la mariée', layout: 'square' },
  { id: '7', src: 'https://images.unsplash.com/photo-1529636798458-921d089c3625?w=800&q=80', category: 'moments', caption: 'Célébration en plein air', layout: 'wide' },
  { id: '8', src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', category: 'decor', caption: 'Arche florale romantique', layout: 'tall' },
  { id: '9', src: 'https://images.unsplash.com/photo-1464366400600-7168b8f9bc26?w=800&q=80', category: 'galas', caption: 'Réception sous les guirlandes', layout: 'wide' },
  { id: '10', src: 'https://images.unsplash.com/photo-1470225620780-dbae8db9ab10?w=800&q=80', category: 'galas', caption: 'Soirée élégante et festive', layout: 'square' },
  { id: '11', src: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80', category: 'galas', caption: 'Gala de charité — Kinshasa', layout: 'tall' },
  { id: '12', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', category: 'galas', caption: 'Conférence et networking', layout: 'square' },
  { id: '13', src: 'https://images.unsplash.com/photo-1537633552985-df84227e3082?w=800&q=80', category: 'decor', caption: 'Centre de table raffiné', layout: 'square' },
  { id: '14', src: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800&q=80', category: 'decor', caption: 'Détails floraux délicats', layout: 'tall' },
  { id: '15', src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80', category: 'moments', caption: 'Toast entre amis', layout: 'wide' },
  { id: '16', src: 'https://images.unsplash.com/photo-1520854221256-17451cc791c3?w=800&q=80', category: 'mariages', caption: 'Cérémonie intime en nature', layout: 'square' },
  { id: '17', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', category: 'moments', caption: 'Portraits de convives', layout: 'tall' },
  { id: '18', src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', category: 'galas', caption: 'Dîner de gala prestigieux', layout: 'wide' },
];

export const GALLERY_HERO = '/images/gallery/gallery-couple-road.png';

export const GALLERY_FEATURED = [
  GALLERY_ITEMS[0],
  GALLERY_ITEMS[2],
  GALLERY_ITEMS[4],
];
