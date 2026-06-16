import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, User, MessageSquare, ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import WeddingPublicLayout from '@/components/landing/WeddingPublicLayout';

import teamEspoir from '@/assets/team-espoir.jpg';
import teamDan from '@/assets/team-dan.jpg';
import {
  WEDDING_IMAGES,
  TESTIMONIALS,
  FAQ_ITEMS,
  COUNTDOWN_TARGET,
} from '@/content/weddingLanding.fr';
import { SERVICES } from '@/content/services.fr';
import { GALLERY_ITEMS } from '@/content/gallery.fr';

const TEAM = [
  { name: 'Espoir Kakesa', role: 'Fondateur & Lead Développeur', image: teamEspoir },
  { name: 'Dan Kakene', role: 'Lead Designer & Marketing', image: teamDan },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies Variants;

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [target]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time;
}

const SectionTitle = ({ script, title, subtitle }: { script: string; title: string; subtitle?: string }) => (
  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
    <p className="wedding-script text-4xl md:text-5xl text-[#b8956c] mb-2">{script}</p>
    <h2 className="font-display text-3xl md:text-5xl font-semibold text-[#4a5a44] tracking-wide">{title}</h2>
    {subtitle && <p className="mt-4 text-lg text-[#7a8b72] max-w-xl mx-auto font-light">{subtitle}</p>}
    <div className="wedding-divider mt-6">✦</div>
  </motion.div>
);

const LandingPage = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const countdown = useCountdown(COUNTDOWN_TARGET);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success('Message envoyé ! Nous vous répondrons bientôt.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 3500);
    }, 1200);
  };

  return (
    <WeddingPublicLayout navTransparent>
      {/* Hero */}
      <section id="accueil" className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={WEDDING_IMAGES.hero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#faf8f5]" />
        </div>

        <div className="relative z-10 text-center px-4 pt-20 pb-32 max-w-4xl mx-auto text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="wedding-script text-5xl md:text-7xl text-[#f5ebe6] mb-4"
          >
            Bienvenue chez HK Event
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.08em] uppercase"
          >
            HK Event
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-px w-32 bg-[#b8956c] mx-auto my-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg md:text-xl font-light tracking-wide text-white/90 max-w-lg mx-auto"
          >
            La plateforme élégante pour vos mariages, galas et célébrations inoubliables
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="wedding-btn-gold rounded-none uppercase tracking-widest px-10 h-12 text-sm">
                Connexion
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline" className="rounded-none uppercase tracking-widest px-10 h-12 text-sm border-white text-white bg-white/10 hover:bg-white hover:text-[#4a5a44] backdrop-blur-sm">
                Inscription
              </Button>
            </Link>
          </motion.div>
          <motion.a
            href="#compte-a-rebours"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="inline-block mt-16 animate-bounce"
          >
            <ChevronDown className="h-8 w-8 text-white/70" />
          </motion.a>
        </div>
      </section>

      {/* Countdown */}
      <section id="compte-a-rebours" className="py-20 px-4 -mt-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTitle
            script="Save the date"
            title="Compte à rebours"
            subtitle="Préparez votre prochaine célébration avec sérénité"
          />
          <div className="grid grid-cols-4 gap-3 md:gap-6">
            {[
              { val: countdown.days, label: 'Jours' },
              { val: countdown.hours, label: 'Heures' },
              { val: countdown.minutes, label: 'Minutes' },
              { val: countdown.seconds, label: 'Secondes' },
            ].map(({ val, label }) => (
              <div key={label} className="countdown-box py-6 md:py-8 px-2">
                <p className="font-display text-3xl md:text-5xl font-semibold text-[#4a5a44]">{String(val).padStart(2, '0')}</p>
                <p className="text-xs md:text-sm uppercase tracking-widest text-[#7a8b72] mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="histoire" className="py-24 px-4 bg-[#f5ebe6]/40">
        <div className="max-w-6xl mx-auto">
          <SectionTitle script="Notre histoire" title="Une passion pour l'élégance" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
              <div className="w-full aspect-[4/5] bg-[#faf8f5] border border-[#e8e0d8] shadow-xl overflow-hidden flex items-center justify-center p-4 md:p-6">
                <img
                  src={WEDDING_IMAGES.story}
                  alt="Invitation personnalisée — HK Event"
                  className="w-full h-full object-contain"
                />
              </div>
              <img
                src={WEDDING_IMAGES.storyAlt}
                alt="Couple en cérémonie"
                className="absolute -bottom-8 -right-4 md:-right-8 w-40 md:w-52 aspect-square object-cover border-4 border-[#faf8f5] shadow-lg hidden sm:block"
              />
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6 text-lg text-[#5a6a54] font-light leading-relaxed">
              <p>
                HK Event est née d&apos;une conviction simple : chaque grand moment mérite une organisation aussi
                raffinée que la cérémonie elle-même. Mariages, anniversaires, galas — nous accompagnons les
                organisateurs africains avec des outils modernes et une esthétique soignée.
              </p>
              <p>
                Invitations personnalisées, suivi RSVP en temps réel, scanner QR à l&apos;accueil et livre d&apos;or
                digital : tout est pensé pour que vous viviez pleinement votre événement, sans stress.
              </p>
              <p className="wedding-script text-3xl text-[#b8956c]">Avec amour, l&apos;équipe HK Event</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            script="Prestations"
            title="Nos services"
            subtitle="Chaque détail compte pour une célébration parfaite"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {SERVICES.map((service, i) => (
              <motion.article
                key={service.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
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
                      <div className="absolute inset-0 bg-[#4a5a44]/0 group-hover:bg-[#4a5a44]/25 transition-colors duration-500" />
                    )}
                  </div>
                  <div className="pt-6 text-center border-b border-[#e8e0d8] pb-6 group-hover:border-[#b8956c] transition-colors">
                    <p className="wedding-script text-3xl text-[#b8956c]">{service.script}</p>
                    <h3 className="font-display text-xl font-semibold text-[#4a5a44] mt-2">{service.title}</h3>
                    <p className="mt-3 text-sm text-[#7a8b72] font-light leading-relaxed px-2">{service.shortDescription}</p>
                    <span className="inline-flex items-center gap-2 mt-5 text-xs uppercase tracking-[0.2em] text-[#4a5a44] group-hover:text-[#b8956c] transition-colors">
                      En savoir plus <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services">
              <Button variant="outline" className="wedding-btn-outline rounded-none uppercase tracking-widest px-8">
                Voir tous les services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section id="galerie" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionTitle script="Galerie" title="Moments précieux" subtitle="Ils nous ont fait confiance. Voici leurs moments magnifiques. On garde des bons souvenirs des nos clients. Veux-tu être parmi eux ?" />
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {GALLERY_ITEMS.slice(0, 6).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="break-inside-avoid overflow-hidden group"
              >
                <Link to="/galerie">
                  <img
                    src={item.src}
                    alt={item.caption}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-700 ${item.layout === 'tall' ? 'aspect-[3/4]' : 'aspect-square'}`}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/galerie">
              <Button variant="outline" className="wedding-btn-outline rounded-none uppercase tracking-widest px-10">
                Voir toute la galerie
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Venue / Platform highlight */}
      <section className="relative py-32 px-4">
        <div className="absolute inset-0">
          <img src={WEDDING_IMAGES.venue} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#4a5a44]/75" />
        </div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto text-center text-[#faf8f5]"
        >
          <p className="wedding-script text-5xl text-[#d4bc94] mb-4">Le lieu idéal</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Votre événement, partout en Afrique</h2>
          <p className="mt-6 text-lg font-light text-[#faf8f5]/85 leading-relaxed">
            Que ce soit à Kinshasa, Lubumbashi ou ailleurs, HK Event vous accompagne avec une interface mobile,
            des paiements locaux et un support dédié.
          </p>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section id="temoignages" className="py-24 px-4 bg-[#f5ebe6]/30">
        <div className="max-w-6xl mx-auto">
          <SectionTitle script="Témoignages" title="Ce qu'ils en disent" />
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.blockquote
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 shadow-sm border border-[#e8e0d8] text-center"
              >
                <p className="wedding-script text-5xl text-[#b8956c]/40 leading-none mb-4">&ldquo;</p>
                <p className="text-[#5a6a54] font-light italic leading-relaxed mb-6">{t.quote}</p>
                <footer>
                  <p className="font-display font-semibold text-[#4a5a44]">{t.name}</p>
                  <p className="text-sm text-[#7a8b72] mt-1">{t.role}</p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="equipe" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle script="Notre équipe" title="Les visages derrière HK Event" />
          <div className="flex flex-wrap justify-center gap-12">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="h-36 w-36 md:h-44 md:w-44 rounded-full overflow-hidden mx-auto border-2 border-[#b8956c] p-1">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover rounded-full" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[#4a5a44] mt-5">{member.name}</h3>
                <p className="text-sm text-[#7a8b72] mt-1 uppercase tracking-wider">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <SectionTitle script="Questions" title="Foire aux questions" />
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-[#e8e0d8] px-5 bg-[#faf8f5]">
                <AccordionTrigger className="text-left font-display text-lg text-[#4a5a44] hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#7a8b72] font-light leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Auth CTA */}
      <section className="py-24 px-4 bg-[#4a5a44] text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-xl mx-auto">
          <p className="wedding-script text-5xl text-[#d4bc94] mb-4">Rejoignez-nous</p>
          <h2 className="font-display text-3xl md:text-4xl text-[#faf8f5] font-semibold">Créez votre compte gratuitement</h2>
          <p className="mt-4 text-[#faf8f5]/80 font-light">Connectez-vous ou inscrivez-vous pour commencer à organiser votre événement.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="outline" className="rounded-none uppercase tracking-widest px-10 border-[#faf8f5] text-[#080808] hover:bg-[#faf8f5] hover:text-[#4a5a44]">
                Connexion
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" className="wedding-btn-gold rounded-none uppercase tracking-widest px-10">
                Inscription
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionTitle script="Contact" title="Écrivez-nous" subtitle="Une question ? Notre équipe vous répond avec plaisir." />
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-6">
              {[
                { icon: Mail, title: 'E-mail', info: 'contact@hkevent.com' },
                { icon: Phone, title: 'Téléphone', info: '+243 828 863 897' },
                { icon: MapPin, title: 'Adresse', info: 'Kinshasa, RDC' },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-4 p-5 bg-white border border-[#e8e0d8]">
                  <div className="h-12 w-12 flex items-center justify-center text-[#b8956c]">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-[#4a5a44]">{item.title}</p>
                    <p className="text-sm text-[#7a8b72]">{item.info}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:col-span-3 bg-white border border-[#e8e0d8] p-6 md:p-8">
              {sent ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="h-16 w-16 text-[#7a8b72] mx-auto mb-4" />
                  <h3 className="font-display text-2xl text-[#4a5a44]">Message envoyé !</h3>
                  <p className="text-[#7a8b72] mt-2">Nous vous répondrons très bientôt.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#4a5a44] flex items-center gap-1"><User className="h-3.5 w-3.5" /> Nom *</Label>
                      <Input id="name" value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} className="rounded-none border-[#e8e0d8]" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#4a5a44] flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> E-mail *</Label>
                      <Input id="email" type="email" value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} className="rounded-none border-[#e8e0d8]" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-[#4a5a44]">Sujet</Label>
                    <Input id="subject" value={contactForm.subject} onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))} className="rounded-none border-[#e8e0d8]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[#4a5a44] flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Message *</Label>
                    <Textarea id="message" rows={5} value={contactForm.message} onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))} className="rounded-none border-[#e8e0d8] resize-none" required />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full wedding-btn-gold rounded-none uppercase tracking-widest h-12">
                    {sending ? 'Envoi…' : <>Envoyer <Send className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </WeddingPublicLayout>
  );
};

export default LandingPage;
