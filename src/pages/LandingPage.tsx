import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar, Users, CheckCircle2, Star, Mail, Phone, MapPin,
  ArrowRight, Sparkles, Shield, Clock, Heart, ChevronRight,
  PartyPopper, Mic2, Camera, Utensils
} from 'lucide-react';

const stats = [
  { label: 'Événements créés', value: '2,500+', icon: Calendar },
  { label: 'Invités gérés', value: '150K+', icon: Users },
  { label: 'Taux de satisfaction', value: '98%', icon: Star },
  { label: 'Messages envoyés', value: '500K+', icon: Mail },
];

const services = [
  {
    icon: PartyPopper,
    title: 'Gestion d\'événements',
    description: 'Créez et gérez vos événements de A à Z avec notre plateforme intuitive.',
  },
  {
    icon: Users,
    title: 'Gestion des invités',
    description: 'Importez, suivez et communiquez avec vos invités en temps réel.',
  },
  {
    icon: Mail,
    title: 'Invitations personnalisées',
    description: 'Envoyez des invitations élégantes par email ou WhatsApp.',
  },
  {
    icon: Camera,
    title: 'Scanner QR Code',
    description: 'Accueillez vos invités avec un scan rapide à l\'entrée.',
  },
  {
    icon: Mic2,
    title: 'Livre d\'or digital',
    description: 'Recueillez les messages et vœux de vos invités en temps réel.',
  },
  {
    icon: Utensils,
    title: 'Gestion des repas',
    description: 'Planifiez les menus et gérez les préférences alimentaires.',
  },
];

const testimonials = [
  {
    name: 'Marie K.',
    role: 'Organisatrice de mariage',
    content: 'HK Event a transformé la gestion de notre mariage. Tout était parfaitement organisé !',
    avatar: 'MK',
  },
  {
    name: 'Jean-Paul M.',
    role: 'Directeur d\'entreprise',
    content: 'Un outil indispensable pour nos événements corporate. Simple et efficace.',
    avatar: 'JP',
  },
  {
    name: 'Amina D.',
    role: 'Wedding Planner',
    content: 'Je recommande HK Event à tous mes clients. La gestion des invités n\'a jamais été aussi facile.',
    avatar: 'AD',
  },
];

const team = [
  { name: 'Hervé K.', role: 'Fondateur & CEO', initials: 'HK' },
  { name: 'Sarah M.', role: 'Directrice Créative', initials: 'SM' },
  { name: 'David L.', role: 'Lead Développeur', initials: 'DL' },
  { name: 'Fatou B.', role: 'Responsable Client', initials: 'FB' },
];

const latestEvents = [
  {
    title: 'Gala de Charité 2025',
    date: '15 Mars 2025',
    guests: 350,
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=250&fit=crop',
  },
  {
    title: 'Mariage Élégance',
    date: '22 Février 2025',
    guests: 200,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop',
  },
  {
    title: 'Conférence Tech Africa',
    date: '10 Janvier 2025',
    guests: 500,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">HK Event</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Événements</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Témoignages</a>
            <a href="#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Équipe</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Se connecter</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(38_92%_50%/0.08),transparent_60%)]" />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Plateforme #1 de gestion d'événements
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
            Créez des événements{' '}
            <span className="text-primary">inoubliables</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Gérez vos invités, envoyez des invitations élégantes et suivez tout en temps réel. HK Event simplifie l'organisation de vos événements.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base shadow-[var(--shadow-gold)]">
                Créer mon premier événement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#services">
              <Button variant="outline" size="lg" className="h-12 text-base px-8">
                Découvrir nos services
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border bg-muted/30">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-3">
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Events */}
      <section id="events" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Derniers événements
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Découvrez quelques-uns des événements récemment organisés avec HK Event.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {latestEvents.map((event) => (
              <Card key={event.title} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-display text-lg font-semibold text-foreground">{event.title}</h3>
                  <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {event.guests} invités
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Nos services
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Tout ce dont vous avez besoin pour organiser des événements exceptionnels.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="group hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Ce que disent nos clients
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Des milliers d'organisateurs nous font confiance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic mb-5">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              L'équipe HK Event
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Une équipe passionnée au service de vos événements.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="text-center hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display text-2xl font-bold mx-auto mb-4">
                    {member.initials}
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Contactez-nous
            </h2>
            <p className="mt-3 text-muted-foreground">
              Une question ? Notre équipe est là pour vous aider.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">contact@hkevent.com</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Téléphone</h3>
                <p className="text-sm text-muted-foreground">+243 XXX XXX XXX</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Adresse</h3>
                <p className="text-sm text-muted-foreground">Kinshasa, RDC</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Prêt à créer votre événement ?
          </h2>
          <p className="mt-4 text-sidebar-foreground/70 max-w-lg mx-auto">
            Rejoignez des milliers d'organisateurs qui font confiance à HK Event.
          </p>
          <Link to="/auth" className="mt-8 inline-block">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base shadow-[var(--shadow-gold)]">
              Créer un compte gratuitement
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display text-lg font-bold">HK Event</span>
              </div>
              <p className="text-sm text-sidebar-foreground/60 leading-relaxed">
                La plateforme de gestion d'événements la plus complète d'Afrique.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/60">
                <li><a href="#services" className="hover:text-sidebar-foreground transition-colors">Services</a></li>
                <li><a href="#events" className="hover:text-sidebar-foreground transition-colors">Événements</a></li>
                <li><a href="#testimonials" className="hover:text-sidebar-foreground transition-colors">Témoignages</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/60">
                <li><a href="#team" className="hover:text-sidebar-foreground transition-colors">Équipe</a></li>
                <li><a href="#contact" className="hover:text-sidebar-foreground transition-colors">Contact</a></li>
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
            © {new Date().getFullYear()} HK Event. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
