/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, MapPin, Clock, Wine, Check, X, HelpCircle, Heart, AlertCircle, Mail, QrCode, Beer, GlassWater } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import type { Event, Guest, ApiResponse } from "@/types/models";
import { rsvpApi, eventsApi, emailsApi, BASE_URL } from "@/services/api";

// Initial state removed: using real data from API

// Skeleton de chargement
const RSVPSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
    <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="max-w-2xl mx-auto px-4 py-8 -mt-8 relative z-10 space-y-6">
      <Card className="border-border/50 shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  </div>
);

// Composant d'erreur
const RSVPError = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/10 flex items-center justify-center p-4">
    <Card className="w-full max-w-md text-center border-destructive/30 shadow-2xl">
      <CardContent className="pt-12 pb-8">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Invitation introuvable</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <p className="text-sm text-muted-foreground">
          Vérifiez le lien d'invitation ou contactez l'organisateur.
        </p>
      </CardContent>
    </Card>
  </div>
);

// Floating hearts component
const FloatingHearts = () => {
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: `${14 + Math.random() * 18}px`,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  const petals = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${8 + Math.random() * 7}s`,
    size: `${16 + Math.random() * 14}px`,
    opacity: 0.2 + Math.random() * 0.3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <span
          key={`h-${heart.id}`}
          className="absolute text-primary animate-float-heart"
          style={{
            left: heart.left,
            bottom: '-40px',
            fontSize: heart.size,
            opacity: heart.opacity,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
          }}
        >
          ♥
        </span>
      ))}
      {petals.map((petal) => (
        <span
          key={`p-${petal.id}`}
          className="absolute animate-fall-petal"
          style={{
            left: petal.left,
            top: '-30px',
            fontSize: petal.size,
            opacity: petal.opacity,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        >
          🌸
        </span>
      ))}
    </div>
  );
};

const RSVP = () => {
  const { eventId, guestId, slug } = useParams<{ eventId: string; guestId: string; slug: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "", // Added for public RSVP
    email: "", // Added for public RSVP
    status: "pending" as "confirmed" | "declined" | "pending",
    drinkPreference: "",
    message: "",
    dietaryRestrictions: "",
    plusOne: false,
    plusOneName: "",
  });

  // Récupérer l'événement et le guest
  useEffect(() => {
    if (!eventId && !slug) {
      setError("Lien d'invitation invalide");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch event toujours
        let eventRes;
        if (eventId) {
          eventRes = await eventsApi.getByIdPublic(eventId).catch(() => ({ success: false, data: null }));
        } else if (slug) {
          eventRes = await eventsApi.getBySlugPublic(slug).catch(() => ({ success: false, data: null }));
        }

        if (!eventRes.success || !eventRes.data) {
          setError("Événement introuvable ou lien expiré");
          setIsLoading(false);
          return;
        }

        setEvent(eventRes!.data);

        // Fetch guest seulement si guestId est présent
        if (guestId && (eventId || eventRes!.data?.id)) {
          const targetEventId = eventId || eventRes!.data?.id || eventRes!.data?._id;
          const guestRes = await rsvpApi.getStatus(targetEventId, guestId).catch(() => ({ success: false, data: null }));
          
          if (guestRes.success && guestRes.data) {
            setGuest(guestRes.data);
            const status = guestRes.data.status;
            setFormData({
              name: guestRes.data.name,
              email: guestRes.data.email,
              status: status === "invited" ? "pending" : status,
              drinkPreference: guestRes.data.drinkPreference || "",
              message: "",
              dietaryRestrictions: "",
              plusOne: false,
              plusOneName: "",
            });

            // Si déjà répondu, on empêche une 2e réponse en montrant l'écran de succès
            if (status === "confirmed" || status === "declined") {
              setIsSubmitted(true);
            }
          }
        }
        // If no guestId, we stay in public mode (guest is null)

      } catch (err: any) {
        console.error("RSVP fetch error:", err);
        setError(err.message || "Impossible de charger les informations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, guestId, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (formData.status === "pending") {
      toast.error("Veuillez confirmer ou décliner l'invitation");
      return;
    }

    setIsSubmitting(true);

    try {
      let currentGuestId: string;
      let currentGuestName: string;

      if (guest) {
        // Update existing guest
        if (!guest.id) {
          console.error("DEBUG: guest.id is undefined", guest);
        }
        currentGuestId = guest.id;
        currentGuestName = guest.name;
        const res = await rsvpApi.submit(guest.id, {
          eventId: event.id,
          status: formData.status, // confirmed | declined
          drinkPreference: formData.drinkPreference,
          dietaryRestrictions: formData.dietaryRestrictions,
          message: formData.message,
        });
        if (res.success) setGuest(res.data);
      } else {
         // Create new guest via public register
         if (!formData.name || !formData.email) {
           toast.error("Nom et email requis");
           setIsSubmitting(false);
           return;
         }
         const res = await rsvpApi.registerPublic(event.id, {
            name: formData.name,
            email: formData.email,
            status: formData.status,
            drinkPreference: formData.drinkPreference,
            dietaryRestrictions: formData.dietaryRestrictions,
            message: formData.message,
            plusOne: formData.plusOne,
            plusOneName: formData.plusOneName,
         });
         if (res.success) {
           setGuest(res.data);
           currentGuestId = res.data.id;
           currentGuestName = res.data.name;
         } else {
            throw new Error(res.message || "Erreur lors de l'inscription");
         }
      }

      setIsSubmitted(true);
      toast.success("Votre réponse a été enregistrée !");

      // Notifier l'organisateur par email (fire-and-forget)
      if (guest || (formData.name && formData.email)) {
         // We might need the ID here if create, using what we got back
         // Since we setGuest above, state update might not be immediate for guest variable
         // Ideally use the returned data ID
         // But for simplicity, we assume we have *an* ID now.
         // Actually, let's use the ID we just got/have.
         const idToUse = guest ? guest.id : (guest as any)?.id; // Typescript might complain if we rely on state update
         // Better logic implemented above with currentGuestId
      }

      // Hack: we need the ID for the notification call if it's new
      // But notifyOrganizer needs guestId.
      // Re-architect: notifyOrganizer takes generic data or we pass the just-created ID.
      // Let's assume we use the just created/updated guest details for notification logic in backend or passed ID.
      // The current notifyOrganizer takes guestId. 
      // We stored currentGuestId above.
      
      emailsApi.notifyOrganizer(currentGuestId!, event.id, formData.status).catch((err) => {
        console.warn("Notification organisateur échouée:", err);
      });

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };


  // États de chargement et d'erreur
  if (isLoading) return <RSVPSkeleton />;
  if (error) return <RSVPError message={error} />;
  if (!event) return <RSVPError message="Événement introuvable" />; // Si pas d'event, c'est une erreur fatale

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4 relative">
        <FloatingHearts />
        <div className="w-full max-w-md space-y-4">
          <Card className="text-center border-border/50 shadow-2xl">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                {formData.status === "confirmed" ? (
                  <Heart className="w-10 h-10 text-primary" />
                ) : (
                  <Check className="w-10 h-10 text-primary" />
                )}
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Merci pour votre réponse!</h2>
              <p className="text-muted-foreground mb-6">
                {formData.status === "confirmed"
                  ? "Nous sommes ravis de vous compter parmi nous!"
                  : "Nous comprenons et vous remercions d'avoir pris le temps de répondre."}
              </p>
              <p className="text-sm text-muted-foreground">
                Si vous souhaitez modifier votre réponse, veuillez contacter l'organisateur.
              </p>
            </CardContent>
          </Card>

          {/* Récapitulatif des détails soumis */}
          {formData.status === "confirmed" && (
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wine className="w-4 h-4 text-primary" />
                  Récapitulatif de votre réponse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guest?.name && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{guest.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="font-medium text-green-600">✓ Confirmé</span>
                </div>
                {formData.drinkPreference && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Boissons choisies</span>
                    <span className="font-medium">
                      {formData.drinkPreference}
                    </span>
                  </div>
                )}
                {formData.dietaryRestrictions && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Restrictions alimentaires</span>
                    <span className="font-medium">{formData.dietaryRestrictions}</span>
                  </div>
                )}
                {formData.plusOne && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Accompagnant</span>
                    <span className="font-medium">{formData.plusOneName || "Oui"}</span>
                  </div>
                )}
                {formData.message && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Votre message</p>
                    <p className="text-sm italic">"{formData.message}"</p>
                  </div>
                )}

                {/* Détails de l'événement */}
                {event && (
                  <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rappel événement</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{event.startTime || "—"} - {event.endTime || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* QR Code pour l'entrée */}
          {formData.status === "confirmed" && guest?.qrCode && (
            <Card className="border-border/50 shadow-lg overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Votre Pass d'Entrée
                </CardTitle>
                <CardDescription>
                  Présentez ce code QR à l'entrée de l'événement
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-8 pb-8 bg-white">
                <div className="p-4 bg-white rounded-xl shadow-inner border border-border/20">
                  <QRCodeSVG 
                    value={guest.qrCode} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="mt-4 text-xs font-mono text-muted-foreground uppercase tracking-widest px-3 py-1 bg-muted rounded-full">
                  {guest.qrCode.slice(0, 8)}...{guest.qrCode.slice(-8)}
                </p>
              </CardContent>
            </Card>
          )}

          {formData.status === "declined" && formData.message && (
            <Card className="border-border/50 shadow-lg">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Votre message</p>
                <p className="text-sm italic">"{formData.message}"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 relative">
      <FloatingHearts />
      {/* Full Width Hero Section */}
      <div className="relative h-[500px] w-full overflow-hidden bg-black">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={event.coverImage 
              ? (event.coverImage.startsWith('http') 
                  ? event.coverImage 
                  : `${BASE_URL}${event.coverImage}`)
              : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
            }
            alt={event.title}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800';
            }}
          />
          {/* Multi-layered Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-12">
          {/* Premium Ornaments */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-primary/60" />
            <div className="text-primary text-xl tracking-[0.6em]">✦ ♡ ✦</div>
            <div className="h-[1px] w-12 bg-primary/60" />
          </div>

          {/* Title with Luxury Font Style */}
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] mb-4 tracking-tight max-w-4xl px-4">
            {event.title.toUpperCase()}
          </h1>

          <div className="text-white/60 text-sm tracking-[0.5em] mb-8 font-light flex items-center gap-2">
            <span>♥</span>
            <span>INTEMPOREL</span>
            <span>♥</span>
          </div>
        </div>

        {/* Torn Edge for consistency with Email Invitations */}
        <div className="absolute bottom-0 left-0 w-full h-16 z-20 pointer-events-none text-background fill-current">
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 10 L5 8 L10 9 L15 7 L20 9 L25 8 L30 10 L35 7 L40 9 L45 8 L50 10 L55 7 L60 9 L65 8 L70 10 L75 7 L80 9 L85 8 L90 10 L95 7 L100 10 Z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12 relative z-30 -mt-10">
        {/* Event Details Card */}
        <Card className="mb-6 border-border/50 shadow-lg">
            <CardContent className="pt-6">
            <p className="text-muted-foreground text-center mb-6">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">
                    {new Date(event.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Horaire</p>
                  <p className="text-sm font-medium">
                    {event.startTime || "—"} - {event.endTime || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Lieu</p>
                  <p className="text-sm font-medium line-clamp-2">{event.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* RSVP Form Card */}
        <Card 
          className="mb-6 shadow-2xl overflow-hidden border-t-4"
          style={{ borderTopColor: event.primaryColor || '#D4AF37' }}
        >
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Public Guest Fields */}
              {!guest && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Votre Nom *</Label>
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Votre Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 text-center">
                <h3 className="text-2xl font-display font-medium text-foreground">Serez-vous des nôtres ?</h3>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
                >
                  <Label
                    htmlFor="confirmed"
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      formData.status === "confirmed"
                        ? "border-green-500 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                        : "border-border hover:border-green-500/30"
                    }`}
                  >
                    <RadioGroupItem value="confirmed" id="confirmed" className="sr-only" />
                    <div className={`p-2 rounded-full ${formData.status === "confirmed" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Présent</span>
                  </Label>

                  <Label
                    htmlFor="declined"
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      formData.status === "declined"
                        ? "border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        : "border-border hover:border-red-500/30"
                    }`}
                  >
                    <RadioGroupItem value="declined" id="declined" className="sr-only" />
                    <div className={`p-2 rounded-full ${formData.status === "declined" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      <X className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Déclin</span>
                  </Label>

                  <Label
                    htmlFor="pending"
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      formData.status === "pending"
                        ? "border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "border-border hover:border-amber-500/30"
                    }`}
                  >
                    <RadioGroupItem value="pending" id="pending" className="sr-only" />
                    <div className={`p-2 rounded-full ${formData.status === "pending" ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Incertain</span>
                  </Label>
                </RadioGroup>
              </div>

              {formData.status === "confirmed" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* Drink Preference Section */}
                  <div className="space-y-6 pt-4">
                    <div className="text-center space-y-2">
                      <Label className="text-xl font-display font-bold flex items-center justify-center gap-3">
                        <Wine className="w-6 h-6" style={{ color: event.primaryColor || '#D4AF37' }} />
                        VOS PRÉFÉRENCES
                      </Label>
                      <p className="text-sm text-muted-foreground">Que désirez vous boire pour célébrer ? 🥂</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                        Maximum 2 choix
                      </div>
                    </div>

                    {/* Alcoholic Drinks */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-background border border-border/50 shadow-inner">
                      <div className="flex items-center gap-2 justify-center mb-6">
                        <Beer className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Selection Alcoolisée</h4>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {[
                          "Castel", "Beaufort", "Primus", "Tembo", "Turbo King", 
                          "Mutzig", "Heineken", "Nkoyi", "Likofi"
                        ].map((drink) => {
                          const isSelected = formData.drinkPreference.split(', ').includes(drink);
                          return (
                            <button
                              key={drink}
                              type="button"
                              onClick={() => {
                                const current = formData.drinkPreference ? formData.drinkPreference.split(', ') : [];
                                if (isSelected) {
                                  setFormData({ ...formData, drinkPreference: current.filter(d => d !== drink).join(', ') });
                                } else if (current.length < 2) {
                                  setFormData({ ...formData, drinkPreference: [...current, drink].join(', ') });
                                } else {
                                  toast.error("Vous ne pouvez sélectionner que deux boissons au maximum");
                                }
                              }}
                              className={`px-5 py-2.5 rounded-full transition-all duration-300 text-xs font-bold uppercase tracking-wider border-2 ${
                                isSelected 
                                  ? "scale-105 shadow-lg border-transparent text-white" 
                                  : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                              }`}
                              style={isSelected ? { backgroundColor: event.primaryColor || '#000' } : {}}
                            >
                              {drink}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Non-Alcoholic Drinks */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-background border border-border/50 shadow-inner">
                      <div className="flex items-center gap-2 justify-center mb-6">
                        <GlassWater className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Douceurs Fraîches</h4>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {[
                          "Coca", "Fanta", "Vitalo", "Maltina", "Sprite", "Energy Malt", "Eau"
                        ].map((drink) => {
                          const isSelected = formData.drinkPreference.split(', ').includes(drink);
                          return (
                            <button
                              key={drink}
                              type="button"
                              onClick={() => {
                                const current = formData.drinkPreference ? formData.drinkPreference.split(', ') : [];
                                if (isSelected) {
                                  setFormData({ ...formData, drinkPreference: current.filter(d => d !== drink).join(', ') });
                                } else if (current.length < 2) {
                                  setFormData({ ...formData, drinkPreference: [...current, drink].join(', ') });
                                } else {
                                  toast.error("Vous ne pouvez sélectionner que deux boissons au maximum");
                                }
                              }}
                              className={`px-5 py-2.5 rounded-full transition-all duration-300 text-xs font-bold uppercase tracking-wider border-2 ${
                                isSelected 
                                  ? "scale-105 shadow-lg border-transparent text-white" 
                                  : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                              }`}
                              style={isSelected ? { backgroundColor: event.primaryColor || '#000' } : {}}
                            >
                              {drink}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="space-y-4 pt-4 border-t border-border/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="dietary" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Restrictions alimentaires</Label>
                    </div>
                    <Input
                      id="dietary"
                      placeholder="Ex: végétarien, allergies..."
                      className="bg-muted/30 border-border/50 focus:border-primary/50"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Un petit mot (optionnel)</Label>
                <Textarea
                  id="message"
                  placeholder="Laissez un message pour les organisateurs..."
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer ma réponse"}
              </Button>
            </form>
          </CardContent>
        </Card>


        {/* Footer with Logo */}
        <div className="flex flex-col items-center gap-4 mt-8 pb-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white/50 backdrop-blur-sm border border-border shadow-sm">
            <img src="/src/assets/black.png" alt="logo" className="h-8 w-8 object-contain" />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Propulsé par HK Event
          </p>
        </div>
      </div>
    </div>
  );
};

export default RSVP;
