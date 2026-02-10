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
import { emailsApi } from '@/services/api';
import type { Guest, Event } from '@/types/models';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
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
    subject: 'Vous êtes invité(e) à {{eventName}}',
    body: `Bonjour {{guestName}},

Nous avons le plaisir de vous inviter à {{eventName}} qui se tiendra le {{eventDate}} à {{eventLocation}}.

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

  useEffect(() => {
    const template = defaultTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [selectedTemplate]);

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

    return text
      .replace(/{{eventName}}/g, event.title)
      .replace(/{{eventDate}}/g, eventDate)
      .replace(/{{eventLocation}}/g, event.location)
      .replace(/{{guestName}}/g, guest?.name || '[Nom de l\'invité]')
      .replace(/{{organizerName}}/g, event.organizer?.name || 'L\'équipe organisatrice')
      .replace(/{{rsvpLink}}/g, rsvpLink);
  };

  const getPreviewHtml = () => {
    const previewGuest = selectedGuests[0] || { name: 'Jean Dupont', email: 'jean@example.com' } as Guest;
    const processedSubject = replaceVariables(subject, previewGuest);
    const processedBody = replaceVariables(body, previewGuest);

    return `
      <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #1a1710; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        
        <!-- Top gold accent line -->
        <div style="height: 4px; background: linear-gradient(90deg, #b8860b, #daa520, #f5c842, #daa520, #b8860b);"></div>
        
        <!-- Header -->
        <div style="background: linear-gradient(180deg, #1a1710 0%, #2a2318 100%); padding: 40px 40px 30px; text-align: center;">
          <img src="${window.location.origin}/images/logo-white.png" alt="HK Events Agency" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 16px; object-fit: cover;" />
          <h1 style="color: #f5f0e8; margin: 0; font-size: 26px; font-weight: 400; line-height: 1.3; font-family: 'Georgia', serif;">${processedSubject}</h1>
          <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #daa520, transparent); margin: 20px auto 0;"></div>
        </div>
        
        <!-- Body -->
        <div style="padding: 0 40px;">
          <div style="background: linear-gradient(180deg, #f9f6f0 0%, #ffffff 30%, #ffffff 70%, #f9f6f0 100%); border-radius: 12px; padding: 36px 32px; border: 1px solid #e8dcc8;">
            <div style="white-space: pre-wrap; line-height: 1.8; color: #3d3428; font-size: 15px;">
              ${processedBody.replace(/\n/g, '<br />')}
            </div>
          </div>
        </div>
        
        <!-- RSVP Button area -->
        <div style="text-align: center; padding: 30px 40px 10px;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #b8860b, #daa520, #f5c842); color: #1a1710; padding: 14px 40px; border-radius: 50px; text-decoration: none; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 4px 20px rgba(218, 165, 32, 0.4);">
            Confirmer ma présence
          </a>
        </div>
        
        <!-- Footer -->
        <div style="padding: 24px 40px 32px; text-align: center;">
          <div style="width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #daa520, transparent); margin: 0 auto 16px;"></div>
          <p style="color: #6b5e4e; font-size: 11px; margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; letter-spacing: 1px;">
            Envoyé avec élégance via <span style="color: #daa520;">HK Event</span>
          </p>
        </div>
        
        <!-- Bottom gold accent line -->
        <div style="height: 4px; background: linear-gradient(90deg, #b8860b, #daa520, #f5c842, #daa520, #b8860b);"></div>
      </div>
    `;
  };

  const handleSend = async () => {
    if (!event || selectedGuests.length === 0) return;

    setSending(true);
    try {
      const result = await emailsApi.sendBulkInvitations(
        selectedGuests.map(g => g.id),
        event.id,
        body
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
                Variables disponibles : {'{{eventName}}, {{eventDate}}, {{guestName}}, {{organizerName}}'}
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
