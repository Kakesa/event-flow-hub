/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Mail, MessageCircle, Send, Eye, Palette, Type,
  Image, Check, Sparkles, Heart, PartyPopper, GraduationCap,
  ArrowLeft, Copy, ExternalLink
} from 'lucide-react';
import { guestsApi, eventsApi, emailsApi } from '@/services/api';
import type { Guest, Event } from '@/types/models';

interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  primaryColor: string;
  icon: React.ElementType;
}

const templates: Template[] = [
  { id: 'elegant', name: 'Élégant Doré', category: 'Mariage', preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', primaryColor: '#D4AF37', icon: Sparkles },
  { id: 'romantic', name: 'Romantique Rose', category: 'Mariage', preview: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400', primaryColor: '#E91E63', icon: Heart },
  { id: 'festive', name: 'Festif Coloré', category: 'Anniversaire', preview: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400', primaryColor: '#FF5722', icon: PartyPopper },
  { id: 'graduation', name: 'Académique', category: 'Diplôme', preview: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', primaryColor: '#9C27B0', icon: GraduationCap },
  { id: 'minimal', name: 'Minimaliste', category: 'Corporate', preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', primaryColor: '#2196F3', icon: Sparkles },
  { id: 'nature', name: 'Nature Verte', category: 'Eco', preview: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400', primaryColor: '#4CAF50', icon: Heart },
];

// Initial state removed: using real data from API

const InvitationTemplates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get('eventId');

  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(templates[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [isSending, setIsSending] = useState(false);

  const [customization, setCustomization] = useState({
    title: 'Vous êtes cordialement invité(e)',
    eventName: 'Notre Événement Spécial',
    date: '',
    time: '',
    location: '',
    message: 'Nous serions honorés de votre présence à cet événement exceptionnel.',
    primaryColor: templates[0].primaryColor,
    fontFamily: 'Playfair Display',
  });

  // Charger les données de l'événement et les invités
  React.useEffect(() => {
    if (!eventIdFromUrl) return;

    const loadData = async () => {
      try {
        const [eventRes, guestsRes] = await Promise.all([
          eventsApi.getById(eventIdFromUrl),
          guestsApi.getByEvent(eventIdFromUrl)
        ]);
        
        const eventData = eventRes.data;
        setEvent(eventData);
        setGuests(guestsRes.data);
        
        // Mettre à jour la personnalisation avec les vraies données de l'événement
        setCustomization(prev => ({
          ...prev,
          eventName: eventData.title,
          date: new Date(eventData.date).toLocaleDateString('fr-FR'),
          time: eventData.startTime || '',
          location: eventData.location,
        }));
      } catch (error) {
        toast.error('Impossible de charger les détails de l\'événement');
      }
    };

    loadData();
  }, [eventIdFromUrl]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setCustomization(prev => ({ ...prev, primaryColor: template.primaryColor }));
  };

  const generateWhatsAppMessage = () => {
    const rsvpLink = `${window.location.origin}/rsvp/${eventIdFromUrl}`;
    return encodeURIComponent(
      `✨ ${customization.title}\n\n` +
      `📌 ${customization.eventName}\n` +
      `📅 ${customization.date} à ${customization.time}\n` +
      `📍 ${customization.location}\n\n` +
      `${customization.message}\n\n` +
      `Confirmez votre présence: ${rsvpLink}`
    );
  };

  const openWhatsApp = (phone: string) => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const copyInvitationLink = () => {
    const rsvpLink = `${window.location.origin}/rsvp/${eventIdFromUrl}`;
    navigator.clipboard.writeText(rsvpLink);
    toast.success('Lien copié dans le presse-papiers!');
  };

  const handleSendInvitations = async () => {
    if (selectedGuests.length === 0) {
      toast.error('Veuillez sélectionner au moins un invité');
      return;
    }

    if (!eventIdFromUrl) return;

    setIsSending(true);

    try {
      const guestsToSend = guests.filter(g => selectedGuests.includes(g.id));

      if (sendMethod === 'whatsapp' || sendMethod === 'both') {
        guestsToSend.forEach(guest => {
          if (guest.phone) {
            openWhatsApp(guest.phone);
          }
        });
      }

      if (sendMethod === 'email' || sendMethod === 'both') {
        const htmlContent = getEmailHtml();
        const subject = replaceLocalVariables(customization.title, guestsToSend[0] || null);
        
        await emailsApi.sendBulkInvitations(
          selectedGuests,
          eventIdFromUrl,
          customization.message,
          subject,
          htmlContent
        );
      }

      toast.success(`Invitations envoyées à ${selectedGuests.length} invité(s)!`);
      setSelectedGuests([]);
      setSendDialogOpen(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envois des invitations');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const replaceLocalVariables = (text: string, guest: Guest | null) => {
    return text
      .replace(/{{guestName}}/g, guest?.name || 'Cher invité')
      .replace(/{{eventName}}/g, customization.eventName)
      .replace(/{{eventDate}}/g, customization.date)
      .replace(/{{eventLocation}}/g, customization.location);
  };

  const getEmailHtml = () => {
    const rsvpLink = '{{rsvpLink}}';
    const primaryColor = customization.primaryColor;

    return `
      <div style="font-family: ${customization.fontFamily}, serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #eee;">
        <div style="background-color: #000; padding: 40px 20px; text-align: center;">
          <h1 style="color: ${primaryColor}; margin: 0; font-size: 28px; letter-spacing: 2px;">INVITATION</h1>
        </div>
        
        <div style="position: relative; height: 300px;">
          <img src="${selectedTemplate?.preview}" alt="Event" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; inset: 0; background-color: rgba(0,0,0,0.4);"></div>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 20px;">
            <p style="font-size: 16px; margin-bottom: 10px; opacity: 0.9;">${customization.title}</p>
            <h2 style="font-size: 32px; font-weight: bold; margin: 0; color: ${primaryColor};">${customization.eventName}</h2>
          </div>
        </div>

        <div style="padding: 40px 30px; background-color: white; text-align: center; color: #333;">
          <div style="display: inline-block; text-align: left; margin-bottom: 30px; font-size: 16px;">
            <p style="margin: 10px 0;">📅 <strong>Date :</strong> ${customization.date}</p>
            <p style="margin: 10px 0;">🕐 <strong>Heure :</strong> ${customization.time}</p>
            <p style="margin: 10px 0;">📍 <strong>Lieu :</strong> ${customization.location}</p>
          </div>

          <p style="line-height: 1.6; margin-bottom: 40px; color: #666;">
            ${customization.message}
          </p>

          <a href="${rsvpLink}" style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            Confirmer ma présence
          </a>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
          <p>HK Events - Gestion d'événements d'exception</p>
        </div>
      </div>
    `;
  };

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/invitations')}
              className="mb-2 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Templates d'invitations</h1>
            <p className="text-muted-foreground mt-1">Personnalisez et envoyez vos invitations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyInvitationLink}>
              <Copy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Copier le lien</span>
            </Button>
            <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedTemplate}>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Envoyer les invitations</DialogTitle>
                  <DialogDescription>
                    Sélectionnez les invités et le mode d'envoi
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Send Method */}
                  <div className="space-y-2">
                    <Label>Mode d'envoi</Label>
                    <Select value={sendMethod} onValueChange={(v: any) => setSendMethod(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            WhatsApp uniquement
                          </div>
                        </SelectItem>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            Email uniquement
                          </div>
                        </SelectItem>
                        <SelectItem value="both">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-primary" />
                            WhatsApp + Email
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Guest Selection */}
                  <div className="space-y-2">
                    <Label>Sélectionner les invités ({selectedGuests.length})</Label>
                    <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                      {guests.map(guest => (
                        <label
                          key={guest.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGuests.includes(guest.id)}
                            onChange={() => toggleGuestSelection(guest.id)}
                            className="rounded border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{guest.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{guest.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGuests(guests.map(g => g.id))}
                    >
                      Tout sélectionner
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSendInvitations} disabled={isSending}>
                    {isSending ? 'Envoi...' : 'Envoyer les invitations'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Template Selection & Customization */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="templates">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">
                  <Image className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="customize">
                  <Palette className="w-4 h-4 mr-2" />
                  Personnaliser
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate?.id === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all ${isSelected
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <div className="aspect-[3/4] relative">
                          <img
                            src={template.preview}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                              style={{ backgroundColor: `${template.primaryColor}30` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: template.primaryColor }} />
                            </div>
                            <p className="font-medium text-white text-sm text-left">{template.name}</p>
                            <p className="text-xs text-white/70 text-left">{template.category}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="customize" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Titre de l'invitation</Label>
                        <Input
                          id="title"
                          value={customization.title}
                          onChange={(e) => setCustomization(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventName">Nom de l'événement</Label>
                        <Input
                          id="eventName"
                          value={customization.eventName}
                          onChange={(e) => setCustomization(prev => ({ ...prev, eventName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          value={customization.date}
                          onChange={(e) => setCustomization(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Heure</Label>
                        <Input
                          id="time"
                          value={customization.time}
                          onChange={(e) => setCustomization(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="color">Couleur principale</Label>
                        <div className="flex gap-2">
                          <Input
                            id="color"
                            type="color"
                            value={customization.primaryColor}
                            onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={customization.primaryColor}
                            onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Lieu</Label>
                      <Input
                        id="location"
                        value={customization.location}
                        onChange={(e) => setCustomization(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message personnalisé</Label>
                      <Textarea
                        id="message"
                        rows={3}
                        value={customization.message}
                        onChange={(e) => setCustomization(prev => ({ ...prev, message: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Police</Label>
                      <Select
                        value={customization.fontFamily}
                        onValueChange={(v) => setCustomization(prev => ({ ...prev, fontFamily: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Playfair Display">Playfair Display (Élégant)</SelectItem>
                          <SelectItem value="Inter">Inter (Moderne)</SelectItem>
                          <SelectItem value="Georgia">Georgia (Classique)</SelectItem>
                          <SelectItem value="Arial">Arial (Simple)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Prévisualisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="aspect-[3/4] rounded-lg overflow-hidden border relative"
                  style={{ fontFamily: customization.fontFamily }}
                >
                  {selectedTemplate ? (
                    <>
                      <img
                        src={selectedTemplate.preview}
                        alt="Preview"
                        className="w-full h-full object-cover absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-black/50" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-4 overflow-hidden"
                          style={{ backgroundColor: customization.primaryColor }}
                        >
                          <img
                            src="/src/assets/black.png"
                            alt="logo"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-sm opacity-80 mb-2">{customization.title}</p>
                        <h3
                          className="text-xl font-bold mb-4"
                          style={{ color: customization.primaryColor }}
                        >
                          {customization.eventName}
                        </h3>
                        <div className="space-y-1 text-sm opacity-90">
                          <p>📅 {customization.date}</p>
                          <p>🕐 {customization.time}</p>
                          <p>📍 {customization.location}</p>
                        </div>
                        <p className="text-xs mt-4 opacity-70 line-clamp-3">
                          {customization.message}
                        </p>
                        <button
                          className="mt-4 px-4 py-2 rounded-full text-xs font-medium"
                          style={{ backgroundColor: customization.primaryColor }}
                        >
                          Confirmer ma présence
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <p className="text-muted-foreground text-sm text-center px-4">
                        Sélectionnez un template pour voir la prévisualisation
                      </p>
                    </div>
                  )}
                </div>

                {selectedTemplate && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPreviewOpen(true)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir en grand
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l'invitation</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div
              className="aspect-[3/4] rounded-lg overflow-hidden border relative max-h-[70vh]"
              style={{ fontFamily: customization.fontFamily }}
            >
              <img
                src={selectedTemplate.preview}
                alt="Preview"
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 overflow-hidden border border-transparent"
                >
                  <img
                    src="/src/assets/black.png"
                    alt="logo"
                    className="h-full w-full object-cover" // Utilisez object-cover pour remplir le cercle
                    style={{ borderRadius: '50%' }} // Assure que l'image est rendue en forme circulaire
                  />
                </div>
                <p className="text-lg opacity-80 mb-3">{customization.title}</p>
                <h3
                  className="text-3xl font-bold mb-6"
                  style={{ color: customization.primaryColor }}
                >
                  {customization.eventName}
                </h3>
                <div className="space-y-2 text-lg opacity-90">
                  <p>📅 {customization.date}</p>
                  <p>🕐 {customization.time}</p>
                  <p>📍 {customization.location}</p>
                </div>
                <p className="text-sm mt-6 opacity-70 max-w-md">
                  {customization.message}
                </p>
                <button
                  className="mt-6 px-6 py-3 rounded-full font-medium"
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  Confirmer ma présence
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InvitationTemplates;
