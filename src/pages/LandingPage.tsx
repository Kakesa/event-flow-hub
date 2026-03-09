import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Calendar, Users, Star, Mail, Phone, MapPin,
  ArrowRight, Sparkles, ChevronRight,
  PartyPopper, Mic2, Camera, Utensils,
  Menu, X, HelpCircle, Moon, Sun, Send, GlassWater
} from 'lucide-react';
import { toast } from 'sonner';

import teamEspoir from '@/assets/team-espoir.jpg';
import teamDan from '@/assets/team-dan.jpg';
import logoWhite from '@/assets/white.png';

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const floatAnimation = {
  y: [-8, 8, -8],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

/* ─── Data ─── */
const stats = [
  { label: 'Événements créés', value: '2,500+', icon: Calendar },
  { label: 'Invités gérés', value: '150K+', icon: Users },
  { label: 'Taux de satisfaction', value: '98%', icon: Star },
  { label: 'Messages envoyés', value: '500K+', icon: Mail },
];

const services = [
  { icon: PartyPopper, title: 'Gestion d\'événements', description: 'Créez et gérez vos événements de A à Z avec notre plateforme intuitive.' },
  { icon: Users, title: 'Gestion des invités', description: 'Importez, suivez et communiquez avec vos invités en temps réel.' },
  { icon: Mail, title: 'Invitations personnalisées', description: 'Envoyez des invitations élégantes par email ou WhatsApp.' },
  { icon: Camera, title: 'Scanner QR Code', description: 'Accueillez vos invités avec un scan rapide à l\'entrée.' },
  { icon: Mic2, title: 'Livre d\'or digital', description: 'Recueillez les messages et vœux de vos invités en temps réel.' },
  { icon: GlassWater, title: 'Preference boisson', description: 'Les invités peuvent choisir leurs boissons préférées.' },
];

const testimonials = [
  { name: 'Marie K.', role: 'Organisatrice de mariage', content: 'HK Event a transformé la gestion de notre mariage. Tout était parfaitement organisé !', avatar: 'MK' },
  { name: 'Jean-Paul M.', role: 'Directeur d\'entreprise', content: 'Un outil indispensable pour nos événements corporate. Simple et efficace.', avatar: 'JP' },
  { name: 'Amina D.', role: 'Wedding Planner', content: 'Je recommande HK Event à tous mes clients. La gestion des invités n\'a jamais été aussi facile.', avatar: 'AD' },
];

const team = [
  { name: 'Espoir Kakesa', role: 'Fondateur & Lead Développeur', image: teamEspoir },
  { name: 'Dan Kakene', role: 'Lead Designer & Responsable Marketing', image: teamDan },
];

const latestEvents = [
  { title: 'Gala de Charité 2025', date: '15 Mars 2025', guests: 350, image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=250&fit=crop' },
  { title: 'Mariage Élégance', date: '22 Février 2025', guests: 200, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop' },
  { title: 'Conférence Tech Africa', date: '10 Janvier 2025', guests: 500, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop' },
];

const faqs = [
  { question: 'Comment créer mon premier événement ?', answer: 'Inscrivez-vous gratuitement, accédez à votre tableau de bord et cliquez sur "Créer un événement". Remplissez les détails (nom, date, lieu) et commencez à inviter vos invités en quelques minutes.' },
  { question: 'Est-ce que HK Event est gratuit ?', answer: 'Oui, nous proposons un plan gratuit qui vous permet de gérer jusqu\'à 10 invités par événement. Pour des besoins plus importants, découvrez nos plans Premium et Business.' },
  { question: 'Comment fonctionne le scanner QR Code ?', answer: 'Chaque invité reçoit un QR Code unique avec son invitation. Le jour de l\'événement, utilisez notre scanner intégré pour vérifier rapidement les entrées et suivre la présence en temps réel.' },
  { question: 'Puis-je personnaliser les invitations ?', answer: 'Absolument ! Choisissez parmi nos modèles élégants ou créez le vôtre. Personnalisez les couleurs, les polices, ajoutez votre logo et envoyez par email ou WhatsApp.' },
  { question: 'Comment gérer les réponses RSVP ?', answer: 'Les invités peuvent confirmer leur présence directement depuis l\'invitation. Vous suivez toutes les réponses en temps réel depuis votre tableau de bord avec des statistiques détaillées.' },
  { question: 'HK Event est-il disponible en Afrique ?', answer: 'Oui ! HK Event est conçu spécialement pour le marché africain avec un support des paiements locaux (M-Pesa, Airtel Money) et une interface optimisée pour les connexions mobiles.' },
];

const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#events', label: 'Événements' },
  { href: '#testimonials', label: 'Témoignages' },
  { href: '#team', label: 'Équipe' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Message envoyé avec succès ! Nous vous répondrons bientôt.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <img src={logoWhite} alt="HK Event" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">HK Event</span>
          </motion.div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              whileTap={{ scale: 0.9 }}
              whileHover={{ rotate: 15 }}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="h-5 w-5 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="h-5 w-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <Link to="/auth" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">Se connecter</Button></Link>
            <Link to="/auth" className="hidden sm:inline-flex"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Commencer</Button></Link>
            {/* Hamburger */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-6 w-6 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-6 w-6 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden bg-background border-b border-border"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                  <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Se connecter</Button>
                  </Link>
                  <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground">Commencer</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section with background video */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: heroScale }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop"
          >
            <source
              src="https://videos.pexels.com/video-files/3401988/3401988-uhd_2560_1440_30fps.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </motion.div>

        <motion.div className="container mx-auto px-4 text-center relative z-10 py-32" style={{ opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/20 backdrop-blur-md text-primary-foreground text-sm font-medium mb-8 border border-primary/30"
          >
            <motion.div animate={floatAnimation}>
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Plateforme #1 de gestion d'événements
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight max-w-4xl mx-auto"
          >
            Créez des événements{' '}
            <motion.span
              className="text-primary inline-block"
              initial={{ opacity: 0, rotateX: 90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              inoubliables
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Gérez vos invités, envoyez des invitations élégantes et suivez tout en temps réel. HK Event simplifie l'organisation de vos événements.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-13 text-base shadow-[var(--shadow-gold)]">
                  Créer mon premier événement <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <a href="#services">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Button variant="outline" size="lg" className="h-13 text-base px-8 backdrop-blur-sm">Découvrir nos services</Button>
              </motion.div>
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/40 flex items-start justify-center p-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-y border-border bg-muted/30 relative">
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center group">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
              >
                <stat.icon className="h-7 w-7" />
              </motion.div>
              <motion.p
                className="font-display text-3xl md:text-4xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.15 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Latest Events */}
      <section id="events" className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Événements récents
            </motion.span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Derniers événements</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Découvrez quelques-uns des événements récemment organisés avec HK Event.</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid md:grid-cols-3 gap-8">
            {latestEvents.map((event, i) => (
              <motion.div key={event.title} variants={scaleIn} custom={i} whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-500 border-border">
                  <div className="aspect-video overflow-hidden relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground">{event.title}</h3>
                    <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{event.date}</span>
                      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{event.guests} invités</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Ce que nous offrons
            </motion.span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Nos services</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Tout ce dont vous avez besoin pour organiser des événements exceptionnels.</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div key={service.title} variants={fadeUp} custom={i} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full">
                  <CardContent className="p-7">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                    >
                      <service.icon className="h-7 w-7" />
                    </motion.div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Témoignages
            </motion.span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Ce que disent nos clients</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Des milliers d'organisateurs nous font confiance.</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={scaleIn} custom={i} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="hover:shadow-lg transition-all duration-300 h-full border-border">
                  <CardContent className="p-7">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <motion.div key={j} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + j * 0.1 }}>
                          <Star className="h-4 w-4 fill-primary text-primary" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">"{t.content}"</p>
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm"
                      >
                        {t.avatar}
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              FAQ
            </motion.span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Questions fréquentes</h2>
            <p className="mt-4 text-muted-foreground">Tout ce que vous devez savoir sur HK Event.</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <AccordionItem value={`faq-${i}`} className="border border-border rounded-xl px-5 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
                    <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline gap-3">
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pl-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Notre équipe
            </motion.span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">L'équipe HK Event</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Une équipe passionnée au service de vos événements.</p>
          </motion.div>
          
          {/* MODIFICATION ICI : Utilisation de flex, flex-wrap et justify-center au lieu de grid-cols-4 */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="flex flex-wrap justify-center gap-8">
            {team.map((member, i) => (
              <motion.div 
                key={member.name} 
                variants={scaleIn} 
                custom={i} 
                whileHover={{ y: -10 }} 
                transition={{ type: 'spring', stiffness: 300 }} 
                // Ajout d'une largeur (w-full md:w-72) pour que les cartes gardent une belle taille
                className="w-full md:w-72 flex justify-center"
              >
                <Card className="w-full text-center hover:shadow-lg transition-all duration-300 overflow-hidden group border-border">
                  <CardContent className="p-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="h-28 w-28 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-primary/10 group-hover:ring-primary/40 transition-all duration-500"
                    >
                      <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                    </motion.div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="contact" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Contact
            </motion.span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Contactez-nous</h2>
            <p className="mt-4 text-muted-foreground">Une question ? Notre équipe est là pour vous aider.</p>
          </motion.div>
          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact info */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="md:col-span-2 space-y-6">
              {[
                { icon: Mail, title: 'Email', info: 'contact@hkevent.com' },
                { icon: Phone, title: 'Téléphone', info: '+243 828 863 897' },
                { icon: MapPin, title: 'Adresse', info: 'Kinshasa, RDC' },
              ].map((item, i) => (
                <motion.div key={item.title} variants={fadeLeft} custom={i} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="hover:shadow-lg transition-all duration-300 border-border">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.info}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact form */}
            <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="md:col-span-3">
              <Card className="border-border shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name" className="text-foreground">Nom complet *</Label>
                        <Input
                          id="contact-name"
                          placeholder="Votre nom"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          maxLength={100}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-foreground">Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          maxLength={255}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-subject" className="text-foreground">Sujet</Label>
                      <Input
                        id="contact-subject"
                        placeholder="Sujet de votre message"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-foreground">Message *</Label>
                      <Textarea
                        id="contact-message"
                        placeholder="Décrivez votre demande..."
                        rows={5}
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        maxLength={1000}
                        required
                      />
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12" disabled={sending}>
                        {sending ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                        ) : (
                          <>Envoyer le message <Send className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
        className="py-24 px-4 bg-sidebar text-sidebar-foreground relative overflow-hidden"
      >
        {/* Animated bg circles */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto text-center relative z-10">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="font-display text-3xl md:text-5xl font-bold">Prêt à créer votre événement ?</motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="mt-4 text-sidebar-foreground/70 max-w-lg mx-auto text-lg">Rejoignez des milliers d'organisateurs qui font confiance à HK Event.</motion.p>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <Link to="/auth" className="mt-8 inline-block">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-13 px-10 text-base shadow-[var(--shadow-gold)]">
                  Créer un compte gratuitement <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                  <img src={logoWhite} alt="HK Event" className="h-full w-full object-contain" />
                </div>
                <span className="font-display text-lg font-bold">HK Event</span>
              </div>
              <p className="text-sm text-sidebar-foreground/60 leading-relaxed">La plateforme de gestion d'événements la plus complète d'Afrique.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/60">
                <li><a href="#services" className="hover:text-sidebar-foreground transition-colors">Services</a></li>
                <li><a href="#events" className="hover:text-sidebar-foreground transition-colors">Événements</a></li>
                <li><a href="#faq" className="hover:text-sidebar-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/60">
                <li><a href="#team" className="hover:text-sidebar-foreground transition-colors">Équipe</a></li>
                <li><a href="#contact" className="hover:text-sidebar-foreground transition-colors">Contact</a></li>
                <li><a href="#testimonials" className="hover:text-sidebar-foreground transition-colors">Témoignages</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/60">
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Conditions d'utilisation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sidebar-border mt-10 pt-6 text-center text-sm text-sidebar-foreground/40">
            © {new Date().getFullYear()} HK Event. Tous droits réservés. Developed by <a href="https://espoir-kakesa.netlify.app" className="text-primary" target="_blank" rel="noopener noreferrer">Espoir Kakesa</a>.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
