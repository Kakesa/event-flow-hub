import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WeddingPublicLayout, { WeddingSectionTitle } from '@/components/landing/WeddingPublicLayout';
import { SERVICES } from '@/content/services.fr';

const ServicesIndexPage = () => (
  <WeddingPublicLayout>
    <section className="relative pt-32 pb-20 px-4 bg-[#f5ebe6]/30">
      <div className="max-w-4xl mx-auto text-center">
        <p className="wedding-script text-5xl md:text-6xl text-[#b8956c] mb-3">Prestations</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-[#4a5a44] tracking-wide">Nos services</h1>
        <div className="wedding-divider mt-6">✦</div>
        <p className="mt-6 text-lg text-[#7a8b72] font-light max-w-2xl mx-auto">
          Tout ce dont vous avez besoin pour orchestrer une célébration mémorable, avec l&apos;élégance d&apos;un site mariage premium.
        </p>
      </div>
    </section>

    <section className="py-12 px-4 pb-24">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {SERVICES.map((service, i) => (
          <motion.article
            key={service.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={`/services/${service.slug}`} className="group block h-full">
              <div className={`overflow-hidden aspect-[4/3] relative ${service.isIllustration ? 'bg-[#faf8f5]' : ''}`}>
                <img
                  src={service.cardImage}
                  alt={service.title}
                  className={
                    service.isIllustration
                      ? 'w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500'
                      : 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                  }
                />
                {!service.isIllustration && (
                  <div className="absolute inset-0 bg-[#4a5a44]/0 group-hover:bg-[#4a5a44]/20 transition-colors duration-500" />
                )}
              </div>
              <div className="pt-6 pb-4 text-center border-b border-[#e8e0d8] group-hover:border-[#b8956c] transition-colors">
                <p className="wedding-script text-3xl text-[#b8956c]">{service.script}</p>
                <h2 className="font-display text-xl font-semibold text-[#4a5a44] mt-2">{service.title}</h2>
                <p className="mt-3 text-sm text-[#7a8b72] font-light leading-relaxed px-2">{service.shortDescription}</p>
                <span className="inline-flex items-center gap-2 mt-5 text-xs uppercase tracking-[0.2em] text-[#4a5a44] group-hover:text-[#b8956c] transition-colors">
                  Découvrir <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  </WeddingPublicLayout>
);

export default ServicesIndexPage;
