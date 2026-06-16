import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeddingPublicLayout, { WeddingSectionTitle } from '@/components/landing/WeddingPublicLayout';
import { getServiceBySlug, SERVICES, type ServiceItem } from '@/content/services.fr';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const serviceImageClass = (service: ServiceItem, variant: 'card' | 'thumb') => {
  if (!service.isIllustration) {
    return variant === 'card'
      ? 'w-full aspect-[4/5] object-cover shadow-xl'
      : 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700';
  }
  return variant === 'card'
    ? 'w-full aspect-square object-contain p-8 md:p-12 bg-[#faf8f5] border border-[#e8e0d8] shadow-xl'
    : 'w-full h-full object-contain p-6 bg-[#faf8f5] group-hover:scale-105 transition-transform duration-500';
};

const ServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : undefined;

  if (!service) return <Navigate to="/services" replace />;

  const otherServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <WeddingPublicLayout>
      {/* Hero */}
      <section className={`relative min-h-[70vh] flex items-end pt-20 ${service.isIllustration ? 'bg-[#faf8f5]' : ''}`}>
        <div className="absolute inset-0">
          {service.isIllustration ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-[#f5ebe6] to-[#faf8f5]" />
              <img
                src={service.cardImage}
                alt=""
                className="absolute inset-0 w-full h-full object-contain object-center p-12 md:p-20 max-h-[55vh] mx-auto opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4a5a44]/90 via-[#4a5a44]/40 to-transparent" />
            </>
          ) : (
            <>
              <img src={service.heroImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4a5a44] via-[#4a5a44]/50 to-black/30" />
            </>
          )}
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 pb-16 pt-32 text-center text-white w-full">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="wedding-script text-5xl md:text-6xl text-[#f5ebe6] mb-3"
          >
            {service.script}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-4xl md:text-6xl font-light tracking-wide"
          >
            {service.title}
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
            className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto"
          >
            {service.shortDescription}
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-[#5a6a54] font-light leading-relaxed italic"
          >
            &ldquo;{service.highlight}&rdquo;
          </motion.p>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8 text-lg text-[#7a8b72] font-light leading-relaxed"
          >
            {service.intro}
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[#f5ebe6]/40">
        <div className="max-w-6xl mx-auto">
          <WeddingSectionTitle script="Atouts" title="Ce que nous offrons" />
          <div className="grid sm:grid-cols-2 gap-8">
            {service.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white p-8 border border-[#e8e0d8] shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#4a5a44] flex items-center justify-center">
                    <Check className="h-5 w-5 text-[#faf8f5]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#4a5a44]">{feature.title}</h3>
                    <p className="mt-2 text-[#7a8b72] font-light leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image + Steps */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.img
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            src={service.cardImage}
            alt={service.title}
            className={serviceImageClass(service, 'card')}
          />
          <div>
            <WeddingSectionTitle script="Étapes" title="Comment ça marche" subtitle="Simple, élégant, efficace" />
            <div className="space-y-8">
              {service.steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5"
                >
                  <span className="font-display text-3xl font-light text-[#b8956c] shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#4a5a44]">{step.title}</h3>
                    <p className="mt-1 text-[#7a8b72] font-light">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#4a5a44] text-center">
        <div className="max-w-xl mx-auto">
          <p className="wedding-script text-5xl text-[#d4bc94] mb-4">Commencez</p>
          <h2 className="font-display text-3xl text-[#faf8f5] font-semibold">Prêt à utiliser ce service ?</h2>
          <p className="mt-4 text-[#faf8f5]/80 font-light">Connectez-vous ou créez un compte pour accéder à toutes les fonctionnalités.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="outline" className="rounded-none uppercase tracking-widest px-10 border-[#faf8f5] text-[#faf8f5] hover:bg-[#faf8f5] hover:text-[#4a5a44]">
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

      {/* Other services */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <WeddingSectionTitle script="Découvrir" title="Nos autres services" />
          <div className="grid md:grid-cols-3 gap-8">
            {otherServices.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="group block">
                <div className="overflow-hidden aspect-[4/3] mb-4">
                  <img
                    src={s.cardImage}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <p className="wedding-script text-2xl text-[#b8956c]">{s.script}</p>
                <h3 className="font-display text-lg font-semibold text-[#4a5a44] mt-1 group-hover:text-[#b8956c] transition-colors">
                  {s.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-sm text-[#7a8b72] mt-2 uppercase tracking-wider">
                  En savoir plus <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </WeddingPublicLayout>
  );
};

export default ServicePage;
