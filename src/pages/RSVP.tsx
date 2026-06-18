/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  Wine,
  Check,
  X,
  Heart,
  AlertCircle,
  QrCode,
  Beer,
  GlassWater,
  Sparkles,
  PartyPopper,
  Download,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import logoBlack from "@/assets/black.png";

import type { Event, Guest } from "@/types/models";
import { rsvpApi, eventsApi, emailsApi, BASE_URL } from "@/services/api";
import { getEventTypePhraseParts, getEventTypeWithArticle } from "@/lib/eventTypePhrases";
import RsvpInvitationHero from "@/components/rsvp/RsvpInvitationHero";
import { downloadQrCodePng } from "@/utils/downloadQrCode";
import { getGuestCheckInUrl } from "@/utils/qrCode";
import { ALCOHOLIC_DRINKS, SOFT_DRINKS } from "@/config/drinks";

type RsvpChoice = "confirmed" | "declined" | "pending" | "";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

const getCoverUrl = (event: Event) => {
  if (!event.coverImage) {
    return "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80";
  }
  return event.coverImage.startsWith("http")
    ? event.coverImage
    : `${BASE_URL}${event.coverImage}`;
};

const accentColor = (event: Event) => event.primaryColor || "#b8956c";

const formatFullDate = (date: string) =>
  new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const RSVPSkeleton = () => (
  <div className="rsvp-page min-h-screen">
    <Skeleton className="w-full h-[62dvh] min-h-[280px] rounded-none" />
    <Skeleton className="w-full h-64 rounded-none" />
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Skeleton className="h-40 rounded-none" />
      <Skeleton className="h-36 rounded-none" />
      <Skeleton className="h-96 rounded-none" />
    </div>
  </div>
);

const RSVPError = ({ message }: { message: string }) => (
  <div className="rsvp-page min-h-screen flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rsvp-glass w-full max-w-md text-center p-10"
    >
      <div className="w-16 h-16 rounded-full bg-[#f5ebe6] flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-8 h-8 text-[#b8956c]" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-[#4a5a44] mb-2">Invitation introuvable</h2>
      <p className="text-[#7a8b72] mb-4">{message}</p>
      <p className="text-sm text-[#7a8b72]/80">Vérifiez le lien reçu ou contactez l&apos;organisateur.</p>
    </motion.div>
  </div>
);

const FloatingHearts = ({ contained = false }: { contained?: boolean }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${8 + Math.random() * 84}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${7 + Math.random() * 5}s`,
        size: `${12 + Math.random() * 14}px`,
        opacity: 0.12 + Math.random() * 0.2,
        char: i % 3 === 0 ? "✦" : "♥",
      })),
    [],
  );

  return (
    <div className={`${contained ? "absolute" : "fixed"} inset-0 pointer-events-none overflow-hidden z-0`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-float-heart text-[#b8956c]"
          style={{
            left: p.left,
            bottom: "-40px",
            fontSize: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
};

const EventCountdown = ({ date }: { date: string }) => {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) return;
      setParts({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [date]);

  if (new Date(date) <= new Date()) return null;

  const boxes = [
    { label: "Jours", value: parts.days },
    { label: "Heures", value: parts.hours },
    { label: "Minutes", value: parts.minutes },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="flex justify-center gap-3 sm:gap-4 mt-8"
    >
      {boxes.map((box) => (
        <div
          key={box.label}
          className="min-w-[4.5rem] sm:min-w-[5.5rem] px-3 py-3 text-center rounded-sm border border-[#d4bc94]/60 bg-white shadow-sm"
        >
          <p className="font-display text-2xl sm:text-3xl font-light text-[#4a5a44] tabular-nums">
            {String(box.value).padStart(2, "0")}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a8b72] mt-1">{box.label}</p>
        </div>
      ))}
    </motion.div>
  );
};

const DrinkChip = ({
  drink,
  selected,
  accent,
  onToggle,
}: {
  drink: string;
  selected: boolean;
  accent: string;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`rsvp-drink-chip px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border-2 ${
      selected
        ? "text-white border-transparent scale-105 shadow-md"
        : "bg-white/80 text-[#7a8b72] border-[#e8e0d8] hover:border-[#b8956c]/50 hover:text-[#4a5a44]"
    }`}
    style={selected ? { backgroundColor: accent } : undefined}
  >
    {drink}
  </button>
);

interface SuccessViewProps {
  formData: {
    status: RsvpChoice;
    drinkPreference: string;
    dietaryRestrictions: string;
    plusOne: boolean;
    plusOneName: string;
    message: string;
  };
  guest: Guest | null;
  event: Event;
}

const SuccessView = ({ formData, guest, event }: SuccessViewProps) => {
  const confirmed = formData.status === "confirmed";

  const handleDownloadQr = async () => {
    const svg = document.getElementById("rsvp-guest-qr") as SVGSVGElement | null;
    if (!svg) return;
    try {
      await downloadQrCodePng(svg, `pass-${guest?.name?.replace(/\s+/g, "_") || "invitation"}.png`);
      toast.success("QR code téléchargé");
    } catch {
      toast.error("Impossible de télécharger le QR code");
    }
  };

  return (
    <div className="rsvp-page min-h-screen flex items-center justify-center p-4 py-16 relative">
      <FloatingHearts />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-5 relative z-10"
      >
        <div className="rsvp-glass text-center p-10 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#b8956c] to-transparent" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              confirmed ? "bg-[#4a5a44]" : "bg-[#f5ebe6]"
            }`}
          >
            {confirmed ? (
              <PartyPopper className="w-9 h-9 text-[#faf8f5]" />
            ) : (
              <Heart className="w-9 h-9 text-[#b8956c]" />
            )}
          </motion.div>
          <p className="wedding-script text-3xl text-[#b8956c] mb-2">Merci</p>
          <h2 className="font-display text-2xl font-semibold text-[#4a5a44] mb-3">
            {confirmed ? "Votre présence est confirmée !" : "Réponse enregistrée"}
          </h2>
          <p className="text-[#7a8b72] font-light leading-relaxed">
            {confirmed
              ? "Nous avons hâte de célébrer ce moment unique avec vous."
              : "Merci d'avoir pris le temps de nous répondre. Vous serez dans nos pensées."}
          </p>
        </div>

        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rsvp-glass p-6 space-y-4"
          >
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-[#4a5a44] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#b8956c]" />
              Récapitulatif
            </h3>
            {guest?.name && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7a8b72]">Invité(e)</span>
                <span className="font-medium text-[#4a5a44]">{guest.name}</span>
              </div>
            )}
            {formData.drinkPreference && (
              <div className="flex justify-between text-sm gap-4">
                <span className="text-[#7a8b72] shrink-0">Boissons</span>
                <span className="font-medium text-[#4a5a44] text-right">{formData.drinkPreference}</span>
              </div>
            )}
            {formData.dietaryRestrictions && (
              <div className="flex justify-between text-sm gap-4">
                <span className="text-[#7a8b72] shrink-0">Régime</span>
                <span className="font-medium text-[#4a5a44] text-right">{formData.dietaryRestrictions}</span>
              </div>
            )}
            {formData.message && (
              <blockquote className="text-sm italic text-[#5a6a54] border-l-2 border-[#b8956c] pl-4 pt-1">
                &ldquo;{formData.message}&rdquo;
              </blockquote>
            )}
            <div className="pt-3 border-t border-[#e8e0d8] space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#4a5a44]">
                <Calendar className="w-4 h-4 text-[#b8956c]" />
                <span>{formatFullDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4a5a44]">
                <Clock className="w-4 h-4 text-[#b8956c]" />
                <span>{event.startTime || "—"} – {event.endTime || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4a5a44]">
                <MapPin className="w-4 h-4 text-[#b8956c]" />
                <span>{event.location}</span>
              </div>
            </div>
          </motion.div>
        )}

        {confirmed && guest?.qrCode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rsvp-ticket rounded-sm overflow-hidden"
          >
            <div className="bg-[#4a5a44] text-[#faf8f5] px-6 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-[#d4bc94] mb-1">Pass d&apos;entrée</p>
              <h3 className="font-display text-lg flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                Votre code QR
              </h3>
            </div>
            <div className="flex flex-col items-center py-8 px-6 bg-white">
              <div className="p-4 bg-white rounded-lg shadow-inner border border-[#e8e0d8]">
                <QRCodeSVG
                  id="rsvp-guest-qr"
                  value={getGuestCheckInUrl(guest.qrCode)}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="mt-4 text-xs text-[#7a8b72] text-center max-w-xs">
                Présentez ce QR code à l&apos;accueil le jour de l&apos;événement
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 wedding-btn-outline rounded-none uppercase tracking-wider text-xs"
                onClick={handleDownloadQr}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger mon QR code
              </Button>
            </div>
          </motion.div>
        )}

        {!confirmed && formData.message && (
          <div className="rsvp-glass p-5">
            <p className="text-xs uppercase tracking-wider text-[#7a8b72] mb-2">Votre message</p>
            <p className="text-sm italic text-[#4a5a44]">&ldquo;{formData.message}&rdquo;</p>
          </div>
        )}
      </motion.div>
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
    name: "",
    email: "",
    status: "pending" as RsvpChoice,
    drinkPreference: "",
    message: "",
    dietaryRestrictions: "",
    plusOne: false,
    plusOneName: "",
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    return () => document.documentElement.classList.add("dark");
  }, []);

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
        let eventRes;
        if (eventId) {
          eventRes = await eventsApi.getByIdPublic(eventId).catch(() => ({ success: false, data: null }));
        } else if (slug) {
          eventRes = await eventsApi.getBySlugPublic(slug).catch(() => ({ success: false, data: null }));
        }

        if (!eventRes?.success || !eventRes.data) {
          setError("Événement introuvable ou lien expiré");
          setIsLoading(false);
          return;
        }

        setEvent(eventRes.data);

        if (guestId && (eventId || eventRes.data?.id)) {
          const targetEventId = eventId || eventRes.data?.id || eventRes.data?._id;
          const guestRes = await rsvpApi.getStatus(targetEventId, guestId).catch(() => ({ success: false, data: null }));

          if (guestRes.success && guestRes.data) {
            const { eventMeta, ...guestData } = guestRes.data;

            if (eventMeta?.type) {
              setEvent((prev) => (prev ? { ...prev, ...eventMeta, type: eventMeta.type! } : prev));
            }

            setGuest(guestData);
            const status = guestData.status;
            setFormData({
              name: guestData.name,
              email: guestData.email,
              status: status === "invited" ? "pending" : status,
              drinkPreference: guestData.drinkPreference || "",
              message: "",
              dietaryRestrictions: "",
              plusOne: false,
              plusOneName: "",
            });

            if (status === "confirmed" || status === "declined") {
              setIsSubmitted(true);
            }
          }
        }
      } catch (err: any) {
        console.error("RSVP fetch error:", err);
        setError(err.message || "Impossible de charger les informations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, guestId, slug]);

  const toggleDrink = (drink: string) => {
    const current = formData.drinkPreference ? formData.drinkPreference.split(", ") : [];
    const isSelected = current.includes(drink);
    if (isSelected) {
      setFormData({ ...formData, drinkPreference: current.filter((d) => d !== drink).join(", ") });
    } else if (current.length < 2) {
      setFormData({ ...formData, drinkPreference: [...current, drink].join(", ") });
    } else {
      toast.error("Maximum 2 boissons");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (formData.status !== "confirmed" && formData.status !== "declined") {
      toast.error("Veuillez confirmer ou décliner l'invitation");
      return;
    }

    setIsSubmitting(true);
    let currentGuestId = "";

    try {
      if (guest) {
        currentGuestId = guest.id;
        const res = await rsvpApi.submit(guest.id, {
          eventId: event.id,
          status: formData.status,
          drinkPreference: formData.drinkPreference,
          dietaryRestrictions: formData.dietaryRestrictions,
          message: formData.message,
        });
        if (res.success) setGuest({ ...res.data, id: res.data.id || (res.data as Guest & { _id?: string })._id || "" });
      } else {
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
          setGuest({ ...res.data, id: res.data.id || (res.data as Guest & { _id?: string })._id || "" });
          currentGuestId = res.data.id || (res.data as Guest & { _id?: string })._id || "";
        } else {
          throw new Error(res.message || "Erreur lors de l'inscription");
        }
      }

      setIsSubmitted(true);
      toast.success("Votre réponse a été enregistrée !");

      if (currentGuestId) {
        emailsApi.notifyOrganizer(currentGuestId, event.id, formData.status).catch((err) => {
          console.warn("Notification organisateur échouée:", err);
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <RSVPSkeleton />;
  if (error) return <RSVPError message={error} />;
  if (!event) return <RSVPError message="Événement introuvable" />;
  if (isSubmitted) return <SuccessView formData={formData} guest={guest} event={event} />;

  const accent = accentColor(event);
  const guestName = guest?.name || formData.name;
  const { prefix: typePrefix, noun: typeNoun } = getEventTypePhraseParts(event.type);
  const typePhrase = getEventTypeWithArticle(event.type);

  return (
    <div className="rsvp-page min-h-screen relative overflow-x-hidden">
      <RsvpInvitationHero
        coverSrc={getCoverUrl(event)}
        coverAlt={event.title}
        eventType={event.type}
        title={event.title}
        typePrefix={typePrefix}
        typeNoun={typeNoun}
        typePhrase={typePhrase}
        guestName={guestName || undefined}
        description={event.description}
        onImageError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80";
        }}
      >
        <EventCountdown date={event.date} />
      </RsvpInvitationHero>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-16 relative z-20 space-y-6">
        {/* Event details */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rsvp-glass p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Calendar, label: "Date", value: formatFullDate(event.date) },
              { icon: Clock, label: "Horaire", value: `${event.startTime || "—"} – ${event.endTime || "—"}` },
              { icon: MapPin, label: "Lieu", value: event.location },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-4 bg-[#faf8f5] border border-[#e8e0d8] rounded-sm"
              >
                <Icon className="w-5 h-5 text-[#b8956c] mb-2" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a8b72] mb-1">{label}</p>
                <p className="text-sm font-medium text-[#4a5a44] leading-snug">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="rsvp-glass overflow-hidden"
          style={{ borderTop: `3px solid ${accent}` }}
        >
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {!guest && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#4a5a44] text-xs uppercase tracking-wider">
                    Votre nom *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Prénom et nom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="rounded-sm border-[#e8e0d8] bg-white focus-visible:ring-[#b8956c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#4a5a44] text-xs uppercase tracking-wider">
                    Votre email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-sm border-[#e8e0d8] bg-white focus-visible:ring-[#b8956c]"
                  />
                </div>
              </div>
            )}

            {/* RSVP choice */}
            <div className="space-y-5 text-center">
              <div>
                <p className="wedding-script text-3xl text-[#b8956c] mb-1">Réponse</p>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#4a5a44]">
                  Serez-vous des nôtres ?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                {[
                  {
                    value: "confirmed" as const,
                    label: "Oui, avec plaisir",
                    sub: "Je serai présent(e)",
                    icon: Check,
                    activeClass: "border-[#4a5a44] bg-[#4a5a44]/5",
                    iconActive: "bg-[#4a5a44] text-white",
                  },
                  {
                    value: "declined" as const,
                    label: "Non, désolé(e)",
                    sub: "Je ne pourrai pas venir",
                    icon: X,
                    activeClass: "border-[#b8956c] bg-[#f5ebe6]",
                    iconActive: "bg-[#b8956c] text-white",
                  },
                ].map((option) => {
                  const selected = formData.status === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: option.value })}
                      className={`rsvp-choice flex flex-col items-center gap-3 p-6 rounded-sm border-2 cursor-pointer ${
                        selected
                          ? `rsvp-choice-selected ${option.activeClass}`
                          : "border-[#e8e0d8] bg-white hover:border-[#b8956c]/40"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-full transition-colors ${
                          selected ? option.iconActive : "bg-[#f5ebe6] text-[#7a8b72]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-[#4a5a44] text-sm">{option.label}</p>
                        <p className="text-xs text-[#7a8b72] mt-0.5">{option.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {formData.status === "confirmed" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="text-center space-y-2 pt-2">
                    <Label className="font-display text-lg text-[#4a5a44] flex items-center justify-center gap-2">
                      <Wine className="w-5 h-5" style={{ color: accent }} />
                      Vos préférences
                    </Label>
                    <p className="text-sm text-[#7a8b72]">Choisissez jusqu&apos;à 2 boissons 🥂</p>
                  </div>

                  <div className="p-5 sm:p-6 bg-[#faf8f5] border border-[#e8e0d8] rounded-sm space-y-5">
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Beer className="w-4 h-4 text-[#7a8b72]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a8b72]">
                          Alcoolisées
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {ALCOHOLIC_DRINKS.map((drink) => (
                          <DrinkChip
                            key={drink}
                            drink={drink}
                            selected={formData.drinkPreference.split(", ").includes(drink)}
                            accent={accent}
                            onToggle={() => toggleDrink(drink)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-[#e8e0d8]" />

                    <div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <GlassWater className="w-4 h-4 text-[#7a8b72]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a8b72]">
                          Sans alcool
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {SOFT_DRINKS.map((drink) => (
                          <DrinkChip
                            key={drink}
                            drink={drink}
                            selected={formData.drinkPreference.split(", ").includes(drink)}
                            accent={accent}
                            onToggle={() => toggleDrink(drink)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietary" className="text-xs uppercase tracking-wider text-[#7a8b72]">
                      Restrictions alimentaires
                    </Label>
                    <Input
                      id="dietary"
                      placeholder="Végétarien, allergies..."
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                      className="rounded-sm border-[#e8e0d8] bg-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs uppercase tracking-wider text-[#7a8b72]">
                Un petit mot (optionnel)
              </Label>
              <Textarea
                id="message"
                placeholder="Laissez un message aux organisateurs..."
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="rounded-sm border-[#e8e0d8] bg-white resize-none focus-visible:ring-[#b8956c]"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-sm uppercase tracking-[0.2em] text-xs font-semibold text-white border-0 hover:opacity-95 transition-opacity"
              style={{ backgroundColor: accent }}
            >
              {isSubmitting ? "Envoi en cours..." : "Confirmer ma réponse"}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="h-11 w-11 rounded-full border border-[#b8956c] p-0.5 bg-white overflow-hidden shadow-sm">
            <img src={logoBlack} alt="HK Event" className="h-full w-full object-contain" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#7a8b72]">Propulsé par HK Event</p>
        </div>
      </div>
    </div>
  );
};

export default RSVP;
