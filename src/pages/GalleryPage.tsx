import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeddingPublicLayout, { WeddingSectionTitle } from '@/components/landing/WeddingPublicLayout';
import {
  GALLERY_ITEMS,
  GALLERY_CATEGORIES,
  GALLERY_HERO,
  GALLERY_FEATURED,
  type GalleryCategory,
  type GalleryItem,
} from '@/content/gallery.fr';

const layoutClass: Record<GalleryItem['layout'], string> = {
  tall: 'row-span-2',
  wide: 'col-span-2',
  square: '',
};

const GalleryPage = () => {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxList, setLightboxList] = useState<GalleryItem[]>([]);

  const filtered =
    filter === 'all' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.category === filter);

  const openLightbox = (item: GalleryItem, list?: GalleryItem[]) => {
    const items = list ?? filtered;
    const idx = items.findIndex((i) => i.id === item.id);
    setLightboxList(items);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null || lightboxList.length === 0 ? null : (prev + 1) % lightboxList.length,
    );
  }, [lightboxList.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null || lightboxList.length === 0
        ? null
        : (prev - 1 + lightboxList.length) % lightboxList.length,
    );
  }, [lightboxList.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxIndex, goNext, goPrev]);

  const currentItem = lightboxIndex !== null ? lightboxList[lightboxIndex] : null;

  return (
    <WeddingPublicLayout>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0">
          <img src={GALLERY_HERO} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#faf8f5]" />
        </div>
        <div className="relative z-10 text-center px-4 py-24 text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="wedding-script text-5xl md:text-7xl text-[#f5ebe6] mb-3"
          >
            Souvenirs
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-4xl md:text-6xl font-light tracking-[0.1em] uppercase"
          >
            Galerie
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="h-px w-24 bg-[#b8956c] mx-auto my-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-light text-white/90 max-w-lg mx-auto"
          >
            Chaque image raconte une histoire d&apos;amour, de fête et de moments inoubliables
          </motion.p>
        </div>
      </section>

      {/* Featured strip — style Renderforest wedding gallery */}
      <section className="py-16 px-4 bg-[#f5ebe6]/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {GALLERY_FEATURED.map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => openLightbox(item, GALLERY_ITEMS)}
                className="group relative overflow-hidden aspect-[3/4] md:aspect-[4/5] text-left"
              >
                <img
                  src={item.src.replace('w=800', 'w=1200')}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4a5a44]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 inset-x-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="wedding-script text-2xl text-[#f5ebe6]">{item.caption}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-12 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <WeddingSectionTitle
            script="Collection"
            title="Nos plus beaux moments"
            subtitle="Filtrer par catégorie pour explorer la galerie"
          />

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={`px-5 py-2 text-xs uppercase tracking-[0.2em] border transition-all duration-300 ${
                  filter === cat.id
                    ? 'bg-[#4a5a44] text-[#faf8f5] border-[#4a5a44]'
                    : 'bg-transparent text-[#7a8b72] border-[#e8e0d8] hover:border-[#b8956c] hover:text-[#4a5a44]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.button
                  key={item.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.4 }}
                  onClick={() => openLightbox(item)}
                  className={`group relative overflow-hidden ${layoutClass[item.layout]}`}
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-[#4a5a44]/0 group-hover:bg-[#4a5a44]/40 transition-colors duration-400 flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs md:text-sm font-light tracking-wide">{item.caption}</p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          <p className="text-center mt-10 text-sm text-[#7a8b72] font-light">
            {filtered.length} photo{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#4a5a44] text-center">
        <div className="max-w-xl mx-auto">
          <p className="wedding-script text-5xl text-[#d4bc94] mb-4">Votre tour</p>
          <h2 className="font-display text-3xl text-[#faf8f5] font-semibold">Créez vos propres souvenirs</h2>
          <p className="mt-4 text-[#faf8f5]/80 font-light">
            Organisez votre événement et immortalisez chaque instant avec HK Event.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="outline" className="rounded-none uppercase tracking-widest px-10 border-[#faf8f5] text-[#1b1a1a] hover:bg-[#faf8f5] hover:text-[#4a5a44]">
                Connexion
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" className="wedding-btn-gold rounded-none uppercase tracking-widest px-10">
                Inscription
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {currentItem && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={closeLightbox}
          >
            <div className="flex items-center justify-between p-4 text-white shrink-0">
              <p className="text-sm uppercase tracking-widest text-white/70">
                {lightboxIndex + 1} / {lightboxList.length}
              </p>
              <button type="button" onClick={closeLightbox} aria-label="Fermer" className="p-2 hover:text-[#b8956c]">
                <X className="h-7 w-7" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 md:px-16 relative min-h-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 md:left-6 p-2 text-white/70 hover:text-white z-10"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>

              <motion.img
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                src={currentItem.src.replace('w=800', 'w=1600')}
                alt={currentItem.caption}
                className="max-h-[75vh] max-w-full object-contain"
              />

              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 md:right-6 p-2 text-white/70 hover:text-white z-10"
                aria-label="Suivant"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            </div>

            <div className="p-6 text-center shrink-0" onClick={(e) => e.stopPropagation()}>
              <p className="wedding-script text-3xl text-[#d4bc94]">{currentItem.caption}</p>
              <p className="text-white/50 text-xs uppercase tracking-widest mt-2">
                {GALLERY_CATEGORIES.find((c) => c.id === currentItem.category)?.label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WeddingPublicLayout>
  );
};

export default GalleryPage;
