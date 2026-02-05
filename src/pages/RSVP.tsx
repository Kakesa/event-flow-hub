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
import { Calendar, MapPin, Clock, Wine, Check, X, HelpCircle, Heart, AlertCircle } from "lucide-react";

import type { Event, Guest, ApiResponse } from "@/types/models";
import { rsvpApi, eventsApi } from "@/services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const drinkOptions = [
  { value: "champagne", label: "Champagne" },
  { value: "wine", label: "Vin rouge/blanc" },
  { value: "cocktail", label: "Cocktails" },
  { value: "beer", label: "Bière" },
  { value: "soft", label: "Boissons sans alcool" },
  { value: "none", label: "Pas de préférence" },
];

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

const RSVP = () => {
  const { eventId, guestId } = useParams<{ eventId: string; guestId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    status: "pending" as "confirmed" | "declined" | "pending",
    drinkPreference: "",
    message: "",
    dietaryRestrictions: "",
    plusOne: false,
    plusOneName: "",
  });

  // Récupérer l'événement et le guest
  useEffect(() => {
    if (!eventId || !guestId) {
      setError("Lien d'invitation invalide");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch event et guest en parallèle
        const [eventRes, guestRes] = await Promise.all([
          eventsApi.getById(eventId).catch(() => ({ success: false, data: null })),
          rsvpApi.getStatus(eventId, guestId).catch(() => ({ success: false, data: null })),
        ]);

        if (!eventRes.success || !eventRes.data) {
          setError("Événement introuvable ou lien expiré");
          return;
        }

        if (!guestRes.success || !guestRes.data) {
          setError("Invitation introuvable. Vérifiez votre lien.");
          return;
        }

        setEvent(eventRes.data);
        setGuest(guestRes.data);
        setFormData({
          status: guestRes.data.status === "invited" ? "pending" : guestRes.data.status,
          drinkPreference: guestRes.data.drinkPreference || "",
          message: "",
          dietaryRestrictions: "",
          plusOne: false,
          plusOneName: "",
        });
      } catch (err: any) {
        console.error("RSVP fetch error:", err);
        setError(err.message || "Impossible de charger les informations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, guestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    if (!formData.status || formData.status === "pending") {
      toast.error("Veuillez confirmer ou décliner l'invitation");
      return;
    }

    setIsSubmitting(true);

    try {
      const res: ApiResponse<Guest> = await rsvpApi.submit(guest.id, formData);
      if (res.success) {
        setGuest(res.data);
        setIsSubmitted(true);
        toast.success("Votre réponse a été enregistrée!");
      }
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // États de chargement et d'erreur
  if (isLoading) return <RSVPSkeleton />;
  if (error) return <RSVPError message={error} />;
  if (!guest || !event) return <RSVPError message="Données introuvables" />;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-border/50 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              {formData.status === "confirmed" ? (
                <Heart className="w-10 h-10 text-primary" />
              ) : (
                <Check className="w-10 h-10 text-primary" />
              )}
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Merci pour votre réponse!</h2>
            <p className="text-muted-foreground">
              {formData.status === "confirmed"
                ? "Nous sommes ravis de vous compter parmi nous!"
                : "Nous comprenons et vous remercions d'avoir pris le temps de répondre."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 overflow-hidden mx-auto">
              <img src="/src/assets/black.png" alt="logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-foreground mb-2">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 -mt-8 relative z-10">
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

        {/* RSVP Form */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-xl">Confirmer votre présence</CardTitle>
            <CardDescription>Merci de nous indiquer votre réponse</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Response Selection */}
              <div className="space-y-3">
                <Label>Votre réponse *</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as "confirmed" | "declined" | "pending" })
                  }
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <Label
                    htmlFor="confirmed"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.status === "confirmed"
                        ? "border-green-500 bg-green-500/10"
                        : "border-border hover:border-green-500/50"
                    }`}
                  >
                    <RadioGroupItem value="confirmed" id="confirmed" className="sr-only" />
                    <Check className={`w-5 h-5 ${formData.status === "confirmed" ? "text-green-500" : "text-muted-foreground"}`} />
                    <span className="font-medium">Je serai présent</span>
                  </Label>

                  <Label
                    htmlFor="declined"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.status === "declined"
                        ? "border-red-500 bg-red-500/10"
                        : "border-border hover:border-red-500/50"
                    }`}
                  >
                    <RadioGroupItem value="declined" id="declined" className="sr-only" />
                    <X className={`w-5 h-5 ${formData.status === "declined" ? "text-red-500" : "text-muted-foreground"}`} />
                    <span className="font-medium">Je décline</span>
                  </Label>

                  <Label
                    htmlFor="pending"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.status === "pending"
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-border hover:border-amber-500/50"
                    }`}
                  >
                    <RadioGroupItem value="pending" id="pending" className="sr-only" />
                    <HelpCircle className={`w-5 h-5 ${formData.status === "pending" ? "text-amber-500" : "text-muted-foreground"}`} />
                    <span className="font-medium">Incertain</span>
                  </Label>
                </RadioGroup>
              </div>

              {formData.status === "confirmed" && (
                <>
                  {/* Drink Preference */}
                  <div className="space-y-2">
                    <Label htmlFor="drink">Préférence de boisson</Label>
                    <Select
                      value={formData.drinkPreference}
                      onValueChange={(value) => setFormData({ ...formData, drinkPreference: value })}
                    >
                      <SelectTrigger>
                        <Wine className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Sélectionnez votre préférence" />
                      </SelectTrigger>
                      <SelectContent>
                        {drinkOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="space-y-2">
                    <Label htmlFor="dietary">Restrictions alimentaires</Label>
                    <Input
                      id="dietary"
                      placeholder="Ex: végétarien, allergies..."
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    />
                  </div>
                </>
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

        <p className="text-center text-xs text-muted-foreground mt-6">
          Propulsé par HK Event
        </p>
      </div>
    </div>
  );
};

export default RSVP;
