import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { contactApi } from '@/services/api';

const CONTACT_EMAIL = 'espoirkakesa2@gmail.com';

const WeddingContactSection = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSending(true);
    try {
      await contactApi.send(contactForm);
      setSent(true);
      toast.success('Message envoyé ! Nous vous répondrons bientôt.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 3500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'envoyer le message";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="wedding-script text-4xl md:text-5xl text-[#b8956c] mb-2">Contact</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-[#4a5a44] tracking-wide">Écrivez-nous</h2>
          <p className="mt-4 text-lg text-[#7a8b72] max-w-xl mx-auto font-light">
            Une question ? Notre équipe vous répond avec plaisir.
          </p>
          <div className="wedding-divider mt-6">✦</div>
        </div>
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            {[
              { icon: Mail, title: 'E-mail', info: CONTACT_EMAIL },
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
                    <Label htmlFor="contact-name" className="text-[#4a5a44] flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Nom *
                    </Label>
                    <Input
                      id="contact-name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                      className="rounded-none border-[#e8e0d8]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-[#4a5a44] flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> E-mail *
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                      className="rounded-none border-[#e8e0d8]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject" className="text-[#4a5a44]">Sujet</Label>
                  <Input
                    id="contact-subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                    className="rounded-none border-[#e8e0d8]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-[#4a5a44] flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" /> Message *
                  </Label>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                    className="rounded-none border-[#e8e0d8] resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full wedding-btn-gold rounded-none uppercase tracking-widest h-12"
                >
                  {sending ? 'Envoi…' : <>Envoyer <Send className="ml-2 h-4 w-4" /></>}
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
