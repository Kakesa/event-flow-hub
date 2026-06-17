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
];

export const GALLERY_HERO = '/images/gallery/gallery-couple-road.png';

export const GALLERY_FEATURED = [
  GALLERY_ITEMS[0],
  GALLERY_ITEMS[2],
  GALLERY_ITEMS[4],
];
