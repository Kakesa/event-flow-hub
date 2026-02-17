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
import { guestsApi, eventsApi, emailsApi, invitationsApi, BASE_URL } from '@/services/api';
import type { Guest, Event } from '@/types/models';
import WhatsAppSender from '@/components/invitations/WhatsAppSender';

interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  primaryColor: string;
  icon: React.ElementType;
}

const templates: Template[] = [
  { id: 'wedding_dark', name: 'Mariage Royal (Sombre)', category: 'Mariage', preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', primaryColor: '#0F2C33', icon: Heart },
  { id: 'wedding_sage', name: 'Mariage Nature (Sauge)', category: 'Mariage', preview: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', primaryColor: '#4A5B4F', icon: Heart },
  { id: 'wedding_luxury', name: 'Mariage Luxe (Or)', category: 'Mariage', preview: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800', primaryColor: '#D4AF37', icon: Sparkles },
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
  const [showWhatsAppSender, setShowWhatsAppSender] = useState(false);
  const [whatsappGuests, setWhatsappGuests] = useState<Guest[]>([]);

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
    const isWedding = selectedTemplate?.id.startsWith('wedding_');
    const header = isWedding ? '💍 *INVITATION MARIAGE* 💍' : `✨ *${customization.title.toUpperCase()}* ✨`;

    return encodeURIComponent(
      `${header}\n\n` +
      `📌 *${customization.eventName}*\n\n` +
      `📅 *Date:* ${customization.date}\n` +
      `🕐 *Heure:* ${customization.time}\n` +
      `📍 *Lieu:* ${customization.location}\n\n` +
      `${customization.message}\n\n` +
      `🙏 *Nous serions honorés de votre présence.*\n\n` +
      `👉 *Confirmez votre réponse ici:* ${rsvpLink}\n\n` +
      `_HK Events - L'excellence au service de vos souvenirs_`
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
        setWhatsappGuests(guestsToSend);
        setShowWhatsAppSender(true);
        if (sendMethod === 'whatsapp') {
          setSendDialogOpen(false);
          setIsSending(false);
          return;
        }
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
    const isWeddingTemplate = selectedTemplate?.id.startsWith('wedding_');
    const backgroundColor = isWeddingTemplate ? primaryColor : '#f9f9f9';
    const textColor = isWeddingTemplate ? '#ffffff' : '#333333';
    const accentColor = isWeddingTemplate ? '#ffffff' : primaryColor;

    // Priorité à l'image de l'événement si elle existe
    const eventImageUrl = event?.coverImage
      ? (event.coverImage.startsWith('http') ? event.coverImage : `${BASE_URL}${event.coverImage}`)
      : selectedTemplate?.preview || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';

    const tornEdgeSvg = `
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 50px; z-index: 10; fill: ${backgroundColor};">
        <path d="M0 10 L5 8 L10 9 L15 7 L20 9 L25 8 L30 10 L35 7 L40 9 L45 8 L50 10 L55 7 L60 9 L65 8 L70 10 L75 7 L80 9 L85 8 L90 10 L95 7 L100 10 Z" />
      </svg>
    `;

    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:wght@300;400;600&display=swap');
      </style>
      <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; background-color: ${backgroundColor}; border-radius: 0; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.45); border: none; position: relative;">
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
            <svg viewBox="0 0 100 100" style="fill: ${accentColor};">
              <path d="M50 0 C45 20 20 25 20 45 C20 65 45 70 50 90 C55 70 80 65 80 45 C80 25 55 20 50 0 Z" opacity="0.4" />
              <path d="M50 20 C48 30 35 32 35 45 C35 58 48 60 50 75 C52 60 65 58 65 45 C65 32 52 30 50 20 Z" />
            </svg>
          </div>

          ${tornEdgeSvg}
        </div>
        
        <!-- Content Section -->
        <div style="padding: 70px 50px; text-align: center; color: ${textColor}; position: relative;">
          <!-- Ornamental Decorations -->
          <div style="font-size: 36px; margin-bottom: 30px; color: ${accentColor}; letter-spacing: 8px; opacity: 0.8;">━━━━  ❀  ━━━━</div>
          
          <p style="font-family: 'Cinzel', serif; text-transform: uppercase; letter-spacing: 6px; font-size: 14px; margin-bottom: 25px; opacity: 0.9; font-weight: 700;">
            ${customization.title}
          </p>
          
          <h1 style="font-size: 48px; font-family: 'Playfair Display', serif; margin: 0 0 35px 0; font-weight: 700; color: ${accentColor}; line-height: 1.2; letter-spacing: 2px; text-shadow: 0 2px 10px rgba(0,0,0,0.15);">
            ${customization.eventName.toUpperCase()}
          </h1>
          
          <div style="width: 100px; height: 1px; background-color: ${accentColor}; margin: 0 auto 40px auto; opacity: 0.5;"></div>
          
          <p style="font-family: 'Montserrat', sans-serif; font-size: 19px; line-height: 2; margin-bottom: 50px; font-weight: 300; opacity: 0.95; max-width: 480px; margin-left: auto; margin-right: auto;">
            "${customization.message}"
          </p>

          <div style="background-color: rgba(255,255,255,0.05); padding: 45px 30px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 50px; display: inline-block; width: 100%; box-sizing: border-box; backdrop-filter: blur(10px); border-radius: 4px;">
            <div style="font-family: 'Cinzel', serif; font-size: 32px; font-weight: 700; margin-bottom: 15px; letter-spacing: 4px; color: ${accentColor};">
              ${customization.date.toUpperCase()}
            </div>
            <div style="font-family: 'Montserrat', sans-serif; font-size: 15px; opacity: 0.8; letter-spacing: 3px; text-transform: uppercase; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 15px; display: inline-block; font-weight: 600;">
              📍 ${customization.location}
            </div>
          </div>

          <a href="${rsvpLink}" style="display: inline-block; background-color: ${isWeddingTemplate ? '#ffffff' : primaryColor}; color: ${isWeddingTemplate ? primaryColor : '#ffffff'}; padding: 24px 60px; border-radius: 4px; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 4px; font-size: 14px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); transition: all 0.4s ease; border: ${isWeddingTemplate ? 'none' : '1px solid rgba(255,255,255,0.2)'};">
            Confirmer ma présence
          </a>
          
          <div style="margin-top: 70px; font-family: 'Cinzel', serif; font-size: 11px; opacity: 0.5; letter-spacing: 5px; text-transform: uppercase; font-weight: 700;">
             ✧ HK Events d'Exception ✧
          </div>
        </div>

        <!-- Bottom Border Accent -->
        <div style="height: 12px; background: linear-gradient(90deg, transparent, ${accentColor}, transparent); opacity: 0.4;"></div>
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

      {/* WhatsApp Sender Modal */}
      <WhatsAppSender
        open={showWhatsAppSender}
        onClose={() => {
          setShowWhatsAppSender(false);
          setIsSending(false);
        }}
        guests={whatsappGuests}
        event={event}
        customMessage={customization.message}
        onSuccess={() => {
          setSelectedGuests([]);
        }}
      />
    </DashboardLayout>
  );
};

export default InvitationTemplates;
