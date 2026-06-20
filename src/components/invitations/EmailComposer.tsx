import { useState, useEffect } from 'react';
import { Send, Eye, Mail, Sparkles, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emailsApi, BASE_URL } from '@/services/api';
import type { Guest, Event } from '@/types/models';
import { getEventTypeWithArticle } from '@/lib/eventTypePhrases';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: string;
  body: string;
  preview: string;
}

interface EmailColorTheme {
  id: string;
  name: string;
  swatch: string; // tailwind bg class for selector
  bg: string;
  bgGradient: string;
  headerGradient: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  btnGradient: string;
  btnShadow: string;
  bodyBg: string;
  bodyBorder: string;
  bodyText: string;
  divider: string;
  footerText: string;
}

const emailThemes: EmailColorTheme[] = [
  {
    id: 'gold',
    name: 'Doré',
    swatch: 'bg-amber-500',
    bg: '#1a1710',
    bgGradient: 'linear-gradient(180deg, #1a1710 0%, #2a2318 100%)',
    headerGradient: 'linear-gradient(180deg, #1a1710 0%, #2a2318 100%)',
    accent: '#daa520',
    accentLight: '#f5c842',
    accentDark: '#b8860b',
    btnGradient: 'linear-gradient(135deg, #b8860b, #daa520, #f5c842)',
    btnShadow: '0 4px 20px rgba(218, 165, 32, 0.4)',
    bodyBg: 'linear-gradient(180deg, #f9f6f0 0%, #ffffff 30%, #ffffff 70%, #f9f6f0 100%)',
    bodyBorder: '#e8dcc8',
    bodyText: '#3d3428',
    divider: 'linear-gradient(90deg, transparent, #daa520, transparent)',
    footerText: '#6b5e4e',
  },
  {
    id: 'blue',
    name: 'Bleu',
    swatch: 'bg-blue-500',
    bg: '#0f1724',
    bgGradient: 'linear-gradient(180deg, #0f1724 0%, #162032 100%)',
    headerGradient: 'linear-gradient(180deg, #0f1724 0%, #162032 100%)',
    accent: '#4a9eff',
    accentLight: '#7dbdff',
    accentDark: '#2563eb',
    btnGradient: 'linear-gradient(135deg, #2563eb, #4a9eff, #7dbdff)',
    btnShadow: '0 4px 20px rgba(74, 158, 255, 0.4)',
    bodyBg: 'linear-gradient(180deg, #f0f4fa 0%, #ffffff 30%, #ffffff 70%, #f0f4fa 100%)',
    bodyBorder: '#c8d8e8',
    bodyText: '#1e293b',
    divider: 'linear-gradient(90deg, transparent, #4a9eff, transparent)',
    footerText: '#64748b',
  },
  {
    id: 'green',
    name: 'Vert',
    swatch: 'bg-emerald-500',
    bg: '#0f1a14',
    bgGradient: 'linear-gradient(180deg, #0f1a14 0%, #162a1e 100%)',
    headerGradient: 'linear-gradient(180deg, #0f1a14 0%, #162a1e 100%)',
    accent: '#34d399',
    accentLight: '#6ee7b7',
    accentDark: '#059669',
    btnGradient: 'linear-gradient(135deg, #059669, #34d399, #6ee7b7)',
    btnShadow: '0 4px 20px rgba(52, 211, 153, 0.4)',
    bodyBg: 'linear-gradient(180deg, #f0faf5 0%, #ffffff 30%, #ffffff 70%, #f0faf5 100%)',
    bodyBorder: '#c8e8d8',
    bodyText: '#1a3028',
    divider: 'linear-gradient(90deg, transparent, #34d399, transparent)',
    footerText: '#4b6b5e',
  },
  {
    id: 'rose',
    name: 'Rose / Bordeaux',
    swatch: 'bg-rose-700',
    bg: '#1a0f14',
    bgGradient: 'linear-gradient(180deg, #1a0f14 0%, #2a1620 100%)',
    headerGradient: 'linear-gradient(180deg, #1a0f14 0%, #2a1620 100%)',
    accent: '#e11d48',
    accentLight: '#fb7185',
    accentDark: '#9f1239',
    btnGradient: 'linear-gradient(135deg, #9f1239, #e11d48, #fb7185)',
    btnShadow: '0 4px 20px rgba(225, 29, 72, 0.4)',
    bodyBg: 'linear-gradient(180deg, #fdf2f4 0%, #ffffff 30%, #ffffff 70%, #fdf2f4 100%)',
    bodyBorder: '#e8c8d0',
    bodyText: '#3d1a28',
    divider: 'linear-gradient(90deg, transparent, #e11d48, transparent)',
    footerText: '#6b4050',
  },
];

interface EmailComposerProps {
  open: boolean;
  onClose: () => void;
  selectedGuests: Guest[];
  event: Event | null;
  onSuccess?: () => void;
}

const defaultTemplates: EmailTemplate[] = [
  {
  id: 'invitation',
  name: 'Invitation Classique',
  subject: 'Vous êtes invité(e) {{eventTypeWithArticle}}',
  type: '{{eventType}}',
  body: `Bonjour {{guestName}},

Nous avons le plaisir de vous inviter {{eventTypeWithArticle}} qui se tiendra le {{eventDate}} à {{eventLocation}}.

Nous serions ravis de vous compter parmi nous pour cette occasion spéciale.

Merci de confirmer votre présence en cliquant sur le lien ci-dessous :
{{rsvpLink}}

Cordialement,
{{organizerName}}`,
  preview: 'Template d\'invitation élégant et professionnel',
},
  {
    id: 'reminder',
    name: 'Rappel',
    subject: 'Rappel : {{eventName}} approche !',
    type:'{{eventType}}',
    body: `Bonjour {{guestName}},

N'oubliez pas ! {{eventName}} aura lieu le {{eventDate}} à {{eventLocation}}.

Si vous n'avez pas encore confirmé votre présence, merci de le faire via :
{{rsvpLink}}

À très bientôt !
{{organizerName}}`,
    preview: 'Rappel amical pour les invités',
  },
  {
    id: 'confirmation',
    name: 'Confirmation',
    subject: 'Confirmation de votre participation à {{eventName}}',
    type: '{{eventType}}',
    body: `Bonjour {{guestName}},

Nous confirmons votre participation à {{eventName}}.

📅 Date : {{eventDate}}
📍 Lieu : {{eventLocation}}

Nous avons hâte de vous y retrouver !

Cordialement,
{{organizerName}}`,
    preview: 'Email de confirmation après RSVP',
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    subject: '',
    type: '',
    body: '',
    preview: 'Créez votre propre message',
  },
];

const EmailComposer = ({ open, onClose, selectedGuests, event, onSuccess }: EmailComposerProps) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('invitation');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('gold');
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const template = defaultTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [selectedTemplate]);

 // 🔹 Gestion intelligente de l'article français
  const replaceVariables = (text: string, guest?: Guest) => {
  if (!event) return text;

  const eventDate = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const rsvpLink = `${window.location.origin}/rsvp/${event.id}${guest ? `/${guest.id}` : ''}`;

  // ✅ CECI MANQUAIT CHEZ TOI
  const eventTypeWithArticle = getEventTypeWithArticle(event?.type);

  return text
    .replace(/{{eventName}}/g, event.title || '')
    .replace(/{{eventDate}}/g, eventDate)
    .replace(/{{eventLocation}}/g, event.location || '')
    .replace(/{{guestName}}/g, guest?.name || "[Nom de l'invité]")
    .replace(/{{organizerName}}/g, event.organizer?.name || "L'équipe organisatrice")
    .replace(/{{rsvpLink}}/g, rsvpLink)
    .replace(/{{eventTypeWithArticle}}/g, eventTypeWithArticle);
};

  const getPreviewHtml = (forEmail = false) => {
    const previewGuest = selectedGuests[0] || { name: 'Witness Kakesa', email: 'witness@example.com' } as Guest;
    
    const processedSubject = forEmail ? subject : replaceVariables(subject, previewGuest);
    const processedBody = forEmail ? body : replaceVariables(body, previewGuest);
    const rsvpLink = forEmail ? '{{rsvpLink}}' : replaceVariables('{{rsvpLink}}', previewGuest);
    
    const t = emailThemes.find(th => th.id === selectedTheme) || emailThemes[0];

    const eventImageUrl = event?.coverImage
      ? (event.coverImage.startsWith('http') ? event.coverImage : `${BASE_URL}${event.coverImage}`)
      : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';

    const tornEdgeSvg = `
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 50px; z-index: 10; fill: ${t.bg};">
        <path d="M0 10 L5 8 L10 9 L15 7 L20 9 L25 8 L30 10 L35 7 L40 9 L45 8 L50 10 L55 7 L60 9 L65 8 L70 10 L75 7 L80 9 L85 8 L90 10 L95 7 L100 10 Z" />
      </svg>
    `;

    return `
      <div style="font-family: 'Lato', sans-serif; max-width: 600px; margin: 0 auto; background-color: ${t.bg}; border-radius: 0; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.45); border: none; position: relative;">
        <!-- Header Image with Overlay & Torn Edge -->
        <div style="position: relative; height: 450px; overflow: hidden; background-color: #222;">
          <img src="${eventImageUrl}" alt="Event" style="width: 100%; height: 100%; object-fit: cover; object-position: center 25%; display: block;" />
          <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 100%);"></div>
          
          <!-- Floral Decorations -->
          <div style="position: absolute; bottom: 30px; left: 25px; width: 120px; height: 120px; z-index: 15; opacity: 0.9; transform: rotate(-10deg);">
            <svg viewBox="0 0 100 100" style="fill: white;">
              <path d="M50 0 C45 20 20 25 20 45 C20 65 45 70 50 90 C55 70 80 65 80 45 C80 25 55 20 50 0 Z" opacity="0.4" />
              <path d="M50 20 C48 30 35 32 35 45 C35 58 48 60 50 75 C52 60 65 58 65 45 C65 32 52 30 50 20 Z" />
            </svg>
          </div>
          <div style="position: absolute; bottom: 50px; right: 25px; width: 100px; height: 100px; z-index: 15; opacity: 0.7; transform: rotate(20deg) scaleX(-1);">
            <svg viewBox="0 0 100 100" style="fill: ${t.accent};">
              <path d="M50 0 C45 20 20 25 20 45 C20 65 45 70 50 90 C55 70 80 65 80 45 C80 25 55 20 50 0 Z" opacity="0.4" />
              <path d="M50 20 C48 30 35 32 35 45 C35 58 48 60 50 75 C52 60 65 58 65 45 C65 32 52 30 50 20 Z" />
            </svg>
          </div>

          ${tornEdgeSvg}
        </div>
        
        <!-- Content Section -->
        <div style="padding: 70px 50px; text-align: center; color: ${t.id === 'gold' || t.id === 'rose' || t.id === 'blue' || t.id === 'green' ? '#ffffff' : '#333333'}; position: relative; background: ${t.bgGradient};">
          <!-- Ornamental Decorations -->
          <div style="font-size: 36px; margin-bottom: 30px; color: ${t.accent}; letter-spacing: 8px; opacity: 0.8;">━━━━  ❀  ━━━━</div>
          
          <p style="font-family: 'Lato', sans-serif; text-transform: uppercase; letter-spacing: 6px; font-size: 14px; margin-bottom: 25px; opacity: 0.9; font-weight: 700; color: ${t.accentLight};">
            ${processedSubject}
          </p>
          
          <h1 style="font-size: 48px; font-family: 'Lato', sans-serif; margin: 0 0 35px 0; font-weight: 700; color: ${t.accent}; line-height: 1.2; letter-spacing: 2px; text-shadow: 0 2px 10px rgba(0,0,0,0.15);">
            ${(event?.title || 'Votre Événement D\'exception').toUpperCase()}
          </h1>
          
          <div style="width: 100px; height: 1px; background-color: ${t.accent}; margin: 0 auto 40px auto; opacity: 0.5;"></div>
          
          <div style="background-color: rgba(255,255,255,0.05); padding: 45px 30px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 50px; font-family: 'Roboto', sans-serif; font-size: 19px; line-height: 2; font-weight: 300; backdrop-filter: blur(10px); border-radius: 4px;">
            ${processedBody.replace(/\n/g, '<br />')}
          </div>

          <a href="${rsvpLink}" style="display: inline-block; background: ${t.btnGradient}; color: #ffffff; padding: 24px 60px; border-radius: 4px; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 4px; font-size: 14px; box-shadow: ${t.btnShadow}; transition: all 0.4s ease;">
            Confirmer ma présence
          </a>
          
          <div style="margin-top: 70px; font-family: 'Lato', sans-serif; font-size: 11px; opacity: 0.5; letter-spacing: 5px; color: ${t.accentLight}; font-weight: 700; text-transform: uppercase;">
            ${(event?.location || 'Lieu de l\'événement').toUpperCase()}
          </div>
        </div>

        <div style="background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-family: 'Roboto', sans-serif; font-size: 10px; color: #ffffff; opacity: 0.5; border-top: 1px solid rgba(255,255,255,0.05); letter-spacing: 3px;">
          <div style="margin-bottom: 15px;">
            <img src="${window.location.origin}/images/logo-white.png" alt="Logo" style="width: 40px; height: 40px; border-radius: 50%; opacity: 0.8;" />
          </div>
          <p>HK Events - L'excellence au service de vos souvenirs.</p>
        </div>
      </div>
      <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
    `;
  };

  const handleSend = async () => {
    if (!event || selectedGuests.length === 0) return;

    setSending(true);
    try {
      const htmlContent = getPreviewHtml(true);
      const result = await emailsApi.sendBulkInvitations(
        selectedGuests.map(g => g.id),
        event.id,
        body,
        subject,
        htmlContent
      );

      if (result.success) {
        toast({
          title: 'Emails envoyés',
          description: `${result.data?.sent || selectedGuests.length} email(s) envoyé(s) avec succès`,
        });
        onSuccess?.();
        onClose();
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer les emails. Vérifiez votre configuration.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Composer un Email
          </DialogTitle>
          <DialogDescription>
            Envoyez des invitations personnalisées à {selectedGuests.length} invité(s)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Composer</TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Prévisualiser
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4 mt-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {defaultTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {template.id === 'custom' && <Sparkles className="h-4 w-4 text-primary" />}
                        <span className="font-medium text-sm">{template.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{template.preview}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Thème de couleur
              </Label>
              <div className="flex gap-3">
                {emailThemes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-primary ring-2 ring-primary/20 bg-accent'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${theme.swatch} shadow-inner`} />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de l'email..."
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles : {'{{eventName}}, {{eventDate}}, {{guestName}}, {{organizerName}}, {{eventTypeWithArticle}}'}
              </p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Contenu de l'email..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <Label>Destinataires ({selectedGuests.length})</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-muted rounded-lg">
                {selectedGuests.slice(0, 10).map((guest) => (
                  <Badge key={guest.id} variant="secondary">
                    {guest.name}
                  </Badge>
                ))}
                {selectedGuests.length > 10 && (
                  <Badge variant="outline">+{selectedGuests.length - 10} autres</Badge>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Aperçu de l'email</CardTitle>
                <CardDescription>
                  Voici comment l'email apparaîtra pour vos invités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !subject || !body || selectedGuests.length === 0}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer ({selectedGuests.length})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailComposer;
