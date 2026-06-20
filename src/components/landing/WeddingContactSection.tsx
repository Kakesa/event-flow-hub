import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, User, CalendarHeart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { contactApi } from '@/services/api';

const CONTACT_EMAIL = 'espoirkakesa2@gmail.com';

const EVENT_TYPES = [
  { value: 'mariage', label: 'Mariage' },
  { value: 'anniversaire', label: 'Anniversaire' },
  { value: 'corporate', label: 'Événement corporate' },
  { value: 'conference', label: 'Conférence / Gala' },
  { value: 'autre', label: 'Autre' },
] as const;

const WeddingContactSection = () => {
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name.trim() || !demoForm.email.trim()) {
      toast.error('Veuillez renseigner votre nom et votre e-mail.');
      return;
    }

    setSending(true);
    try {
      await contactApi.requestDemo(demoForm);
      setSubmittedName(demoForm.name.trim());
      setSent(true);
      toast.success('Demande envoyée ! Nous vous contactons très bientôt.');
      setDemoForm({ name: '', email: '', phone: '', eventType: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible d\'envoyer la demande';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="demo" className="py-24 px-4 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="wedding-script text-4xl md:text-5xl text-[#b8956c] mb-2">Démonstration</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-[#4a5a44] tracking-wide">
            Demandez une démo
          </h2>
          <p className="mt-4 text-lg text-[#7a8b72] max-w-xl mx-auto font-light">
            Découvrez HK Event en action. Notre équipe vous présente la plateforme et répond à vos questions.
          </p>
          <div className="wedding-divider mt-6">✦</div>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            {[
              {
                icon: Sparkles,
                title: 'Présentation live',
                info: 'Visite guidée des fonctionnalités clés : invitations, RSVP, QR code et analytics.',
              },
              {
                icon: CalendarHeart,
                title: 'Adapté à votre événement',
                info: 'Mariage, anniversaire, gala ou événement d\'entreprise — on vous montre ce qui compte pour vous.',
              },
              {
                icon: Mail,
                title: 'Réponse rapide',
                info: `Réponse sous 24 h à ${CONTACT_EMAIL} ou au +243 828 863 897.`,
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 bg-white border border-[#e8e0d8]">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-[#b8956c]">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display font-semibold text-[#4a5a44]">{item.title}</p>
                  <p className="text-sm text-[#7a8b72] mt-1 leading-relaxed">{item.info}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 p-5 bg-[#f5ebe6]/50 border border-[#e8e0d8]">
              <MapPin className="h-5 w-5 text-[#b8956c] shrink-0" />
              <p className="text-sm text-[#7a8b72]">Kinshasa, RDC — démo en ligne ou sur rendez-vous</p>
            </div>
          </div>

          <div className="md:col-span-3 bg-white border border-[#e8e0d8] p-6 md:p-8">
            {sent ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-[#7a8b72] mx-auto mb-4" />
                <h3 className="font-display text-2xl text-[#4a5a44]">Demande reçue !</h3>
                <p className="text-[#7a8b72] mt-2">
                  Merci {submittedName}. Nous vous recontactons très bientôt pour planifier votre démo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoRequest} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-name" className="text-[#4a5a44] flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Nom complet *
                    </Label>
                    <Input
                      id="demo-name"
                      placeholder="Votre nom"
                      value={demoForm.name}
                      onChange={(e) => setDemoForm((p) => ({ ...p, name: e.target.value }))}
                      className="rounded-none border-[#e8e0d8]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-email" className="text-[#4a5a44] flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> E-mail *
                    </Label>
                    <Input
                      id="demo-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm((p) => ({ ...p, email: e.target.value }))}
                      className="rounded-none border-[#e8e0d8]"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-phone" className="text-[#4a5a44] flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> Téléphone
                    </Label>
                    <Input
                      id="demo-phone"
                      type="tel"
                      placeholder="+243 828 863 897"
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm((p) => ({ ...p, phone: e.target.value }))}
                      className="rounded-none border-[#e8e0d8]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-event-type" className="text-[#4a5a44]">
                      Type d&apos;événement
                    </Label>
                    <Select
                      value={demoForm.eventType}
                      onValueChange={(value) => setDemoForm((p) => ({ ...p, eventType: value }))}
                    >
                      <SelectTrigger id="demo-event-type" className="rounded-none border-[#e8e0d8]">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo-message" className="text-[#4a5a44]">
                    Vos besoins (optionnel)
                  </Label>
                  <Textarea
                    id="demo-message"
                    rows={4}
                    placeholder="Nombre d'invités, date prévue, fonctionnalités qui vous intéressent..."
                    value={demoForm.message}
                    onChange={(e) => setDemoForm((p) => ({ ...p, message: e.target.value }))}
                    className="rounded-none border-[#e8e0d8] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full wedding-btn-gold rounded-none uppercase tracking-widest h-12"
                >
                  {sending ? 'Envoi en cours…' : <>Demander une démo <Send className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeddingContactSection;
