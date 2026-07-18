import { Fragment, useEffect, useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { Event } from '@/types/models';
import { getEventTypeWithArticle } from '@/lib/eventTypePhrases';
import { getRsvpLayoutId } from '@/lib/rsvpLayout';
import { getEventCoverUrl } from '@/utils/eventCover';
import WeddingStyleRsvpLayout from '@/components/rsvp/WeddingStyleRsvpLayout';
import SageBohoRsvpLayout from '@/components/rsvp/SageBohoRsvpLayout';

interface PreviewCustomization {
  eventName: string;
  message: string;
  date: string;
  time: string;
  location: string;
  primaryColor: string;
}

interface RsvpInvitationPreviewProps {
  event: Event | null;
  customization: PreviewCustomization;
  rsvpTheme?: string;
  guestName?: string;
  className?: string;
}

const PreviewCountdown = ({ date }: { date: string }) => {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) return;
      setParts({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);

  if (new Date(date) <= new Date()) return null;

  const boxes = [
    { label: 'Jours', value: parts.days },
    { label: 'Heures', value: parts.hours },
    { label: 'Min', value: parts.minutes },
    { label: 'Sec', value: parts.seconds },
  ];

  return (
    <div className="wedding-rsvp-countdown-wrap">
      <p className="wedding-rsvp-countdown-title">Il reste</p>
      <div className="wedding-rsvp-countdown wedding-rsvp-countdown--inline">
        {boxes.map((box, index) => (
          <Fragment key={box.label}>
            {index > 0 && <span className="wedding-rsvp-countdown-sep">:</span>}
            <div className="wedding-rsvp-countdown-box">
              <p className="wedding-rsvp-countdown-value">{String(box.value).padStart(2, '0')}</p>
              <p className="wedding-rsvp-countdown-label">{box.label}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const PreviewFormPlaceholder = ({ accent }: { accent: string }) => (
  <div className="rsvp-glass p-6 sm:p-8 space-y-6 pointer-events-none select-none" style={{ borderTop: `3px solid ${accent}` }}>
    <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#7a8b72]">Aperçu — formulaire invité</p>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-sm border-2 p-4 text-center border-[#e8e0d8] bg-[#faf8f5]">
        <p className="font-display text-sm text-[#4a5a44]">Oui, avec plaisir</p>
      </div>
      <div className="rounded-sm border-2 p-4 text-center border-[#e8e0d8] opacity-60">
        <p className="font-display text-sm text-[#4a5a44]">Non, désolé(e)</p>
      </div>
    </div>
    <div className="h-10 rounded-sm bg-[#faf8f5] border border-[#e8e0d8]" />
    <div
      className="h-12 rounded-sm w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-white font-semibold"
      style={{ backgroundColor: accent }}
    >
      Confirmer ma réponse
    </div>
  </div>
);

function buildPreviewEvent(
  event: Event | null,
  customization: PreviewCustomization,
  rsvpTheme?: string,
): Event {
  const base = event ?? ({} as Event);
  return {
    ...base,
    id: base.id || 'preview',
    userId: base.userId || '',
    title: customization.eventName || base.title || 'Notre événement',
    slug: base.slug || 'preview',
    type: base.type || 'Mariage',
    description: customization.message || base.description,
    date: base.date || new Date().toISOString(),
    startTime: customization.time || base.startTime,
    endTime: base.endTime,
    location: customization.location || base.location || 'Lieu de l\'événement',
    coverImage: base.coverImage,
    primaryColor: customization.primaryColor || base.primaryColor,
    accentColor: base.accentColor,
    theme: rsvpTheme || base.theme,
  };
}

const RsvpInvitationPreview = ({
  event,
  customization,
  rsvpTheme,
  guestName = 'Marie Dupont',
  className = '',
}: RsvpInvitationPreviewProps) => {
  const previewEvent = useMemo(
    () => buildPreviewEvent(event, customization, rsvpTheme),
    [event, customization, rsvpTheme],
  );

  const layoutId = getRsvpLayoutId(previewEvent);
  const coverUrl = getEventCoverUrl(previewEvent);
  const typePhrase = getEventTypeWithArticle(previewEvent.type);
  const accent = customization.primaryColor || previewEvent.primaryColor || '#1e2d4a';

  const countdown =
    layoutId === 'boho_sage' ? (
      <PreviewCountdownBoho date={previewEvent.date} />
    ) : (
      <PreviewCountdown date={previewEvent.date} />
    );

  const formSection = <PreviewFormPlaceholder accent={accent} />;

  const layoutProps = {
    event: previewEvent,
    coverUrl,
    guestName,
    typePhrase,
    countdown,
    onImageError: (e: SyntheticEvent<HTMLImageElement>) => {
      (e.target as HTMLImageElement).src =
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80';
    },
    formSection,
  };

  return (
    <div className={`rsvp-page rsvp-invitation-preview ${className}`}>
      {layoutId === 'boho_sage' ? (
        <SageBohoRsvpLayout {...layoutProps} />
      ) : (
        <WeddingStyleRsvpLayout {...layoutProps} />
      )}
    </div>
  );
};

const PreviewCountdownBoho = ({ date }: { date: string }) => {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) return;
      setParts({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);

  if (new Date(date) <= new Date()) return null;

  const boxes = [
    { label: 'Jours', value: parts.days },
    { label: 'Heures', value: parts.hours },
    { label: 'Min', value: parts.minutes },
    { label: 'Sec', value: parts.seconds },
  ];

  return (
    <div className="boho-rsvp-countdown-inline">
      <div className="boho-rsvp-countdown-grid">
        {boxes.map((box, index) => (
          <Fragment key={box.label}>
            {index > 0 && <span className="boho-rsvp-countdown-sep">:</span>}
            <div className="boho-rsvp-countdown-box">
              <p className="boho-rsvp-countdown-value">{String(box.value).padStart(2, '0')}</p>
              <p className="boho-rsvp-countdown-unit">{box.label}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default RsvpInvitationPreview;
