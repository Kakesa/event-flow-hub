import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import { CalendarCheck, Clock, Shirt, UtensilsCrossed } from 'lucide-react';
import type { Event } from '@/types/models';
import { normalizeEventType } from '@/lib/eventTypePhrases';
import { getBohoSageColor } from '@/lib/rsvpLayout';
import {
  formatCompactDate,
  getAnnouncementPhrase,
  getGuestInvitationLine,
  getRsvpDeadlineLabel,
  getDressCodeLabel,
  getDressCodeNotes,
  hasCustomDressCode,
  parseCoupleFromTitle,
} from '@/lib/rsvpWeddingLayout';

const WavyDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`boho-rsvp-wave ${flip ? 'boho-rsvp-wave--flip' : ''}`} aria-hidden>
    <svg viewBox="0 0 1200 48" preserveAspectRatio="none">
      <path
        d="M0,48 L0,24 Q150,8 300,22 Q450,36 600,18 Q750,2 900,20 Q1050,38 1200,16 L1200,48 Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

const FloatingHearts = () => (
  <div className="boho-rsvp-hearts" aria-hidden>
    {['♥', '♥', '♥', '♥', '♥'].map((heart, i) => (
      <span key={i} className="boho-rsvp-heart" style={{ left: `${12 + i * 18}%`, animationDelay: `${i * 0.7}s` }}>
        {heart}
      </span>
    ))}
  </div>
);

interface SageBohoRsvpLayoutProps {
  event: Event;
  coverUrl: string;
  guestName?: string;
  typePhrase: string;
  onImageError?: (e: SyntheticEvent<HTMLImageElement>) => void;
  countdown?: ReactNode;
  formSection: ReactNode;
}

const SageBohoRsvpLayout = ({
  event,
  coverUrl,
  guestName,
  typePhrase,
  onImageError,
  countdown,
  formSection,
}: SageBohoRsvpLayoutProps) => {
  const sage = getBohoSageColor(event);
  const couple = parseCoupleFromTitle(event.title);
  const invitationLine = getGuestInvitationLine(guestName, event, typePhrase);
  const deadline = getRsvpDeadlineLabel(event.date);
  const compactDate = formatCompactDate(event.date);
  const showDressCode = hasCustomDressCode(event) || normalizeEventType(event.type) === 'Mariage';

  const themeStyle = { '--boho-sage': sage } as CSSProperties;

  return (
    <div className="boho-rsvp" style={themeStyle}>
      {/* En-tête : photo ronde + titre */}
      <header className="boho-rsvp-header">
        <div className="boho-rsvp-header-photo">
          <img src={coverUrl} alt={event.title} onError={onImageError} />
        </div>
        <div className="boho-rsvp-header-text">
          <p className="boho-rsvp-header-label">Invitation</p>
          <p className="boho-rsvp-script boho-rsvp-couple">{couple.display}</p>
          <span className="boho-rsvp-heart-icon" aria-hidden>♥</span>
        </div>
      </header>

      {/* Arche sage — message */}
      <section className="boho-rsvp-arch-section">
        <div className="boho-rsvp-arch">
          <div className="boho-rsvp-arch-inner">
            {event.description && (
              <p className="boho-rsvp-arch-quote">&ldquo;{event.description}&rdquo;</p>
            )}
            <p className="boho-rsvp-script boho-rsvp-arch-names">{couple.display}</p>
            <p className="boho-rsvp-announce">{getAnnouncementPhrase(event)}</p>
            <p className="boho-rsvp-intro">{invitationLine}</p>
          </div>
        </div>
      </section>

      {/* Photo principale */}
      <section className="boho-rsvp-photo-wrap">
        <img src={coverUrl} alt="" className="boho-rsvp-photo-main" onError={onImageError} />
        <WavyDivider />
      </section>

      {/* Date & heure */}
      <section className="boho-rsvp-date-section">
        <p className="boho-rsvp-script boho-rsvp-date-title">Réception</p>
        <p className="boho-rsvp-date-value">{compactDate}</p>
        {event.startTime && (
          <p className="boho-rsvp-time">
            <Clock className="inline w-4 h-4 mr-1 -mt-0.5" strokeWidth={1.5} />
            {event.startTime}
          </p>
        )}
        <div className="boho-rsvp-botanical" aria-hidden />
      </section>

      {/* Compte à rebours sur photo */}
      {countdown && (
        <section className="boho-rsvp-countdown-section">
          <img src={coverUrl} alt="" className="boho-rsvp-countdown-bg" aria-hidden onError={onImageError} />
          <div className="boho-rsvp-countdown-overlay">
            <p className="boho-rsvp-countdown-label">Il reste</p>
            {countdown}
          </div>
        </section>
      )}

      {/* Programme */}
      <section className="boho-rsvp-program">
        <p className="boho-rsvp-script boho-rsvp-program-title">Programme</p>
        <div className="boho-rsvp-program-item">
          <UtensilsCrossed className="w-5 h-5" strokeWidth={1.25} />
          <div>
            <p className="boho-rsvp-program-time">{event.startTime || '—'}</p>
            <p className="boho-rsvp-program-label">Accueil & réception</p>
          </div>
        </div>
        {event.endTime && (
          <div className="boho-rsvp-program-item">
            <CalendarCheck className="w-5 h-5" strokeWidth={1.25} />
            <div>
              <p className="boho-rsvp-program-time">{event.endTime}</p>
              <p className="boho-rsvp-program-label">Fin de la célébration</p>
            </div>
          </div>
        )}
      </section>

      {showDressCode && (
        <section className="boho-rsvp-dress-section">
          <Shirt className="w-6 h-6 mx-auto mb-2 boho-rsvp-dress-icon" strokeWidth={1.25} />
          <p className="boho-rsvp-label">Code vestimentaire</p>
          <p className="boho-rsvp-script boho-rsvp-dress-title">{getDressCodeLabel(event)}</p>
          <p className="boho-rsvp-dress-notes">{getDressCodeNotes(event)}</p>
        </section>
      )}

      {/* RSVP */}
      <section id="rsvp-confirm-section" className="boho-rsvp-rsvp-section scroll-mt-4">
        <p className="boho-rsvp-script boho-rsvp-rsvp-title">Viendrez-vous ?</p>
        <p className="boho-rsvp-rsvp-deadline">Merci de répondre avant le {deadline}</p>
        <div className="boho-rsvp-form-wrap">{formSection}</div>
      </section>

      {/* Pied de page */}
      <footer className="boho-rsvp-footer">
        <img src={coverUrl} alt="" className="boho-rsvp-footer-photo" onError={onImageError} />
        <FloatingHearts />
        <p className="boho-rsvp-script boho-rsvp-footer-names">{couple.display}</p>
      </footer>
    </div>
  );
};

export default SageBohoRsvpLayout;
