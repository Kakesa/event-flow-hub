import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import { CalendarCheck, ChevronDown, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types/models';
import { normalizeEventType } from '@/lib/eventTypePhrases';
import {
  buildWhatsAppUrl,
  CALENDAR_WEEKDAYS,
  formatCompactDate,
  getAnnouncementPhrase,
  getDateBlockParts,
  getEventCalendarGrid,
  getGuestInvitationLine,
  getMonogram,
  getRsvpDeadlineLabel,
  getDressCodeLabel,
  getDressCodeNotes,
  hasCustomDressCode,
  getRsvpGoldColor,
  getRsvpThemeColor,
  parseCoupleFromTitle,
} from '@/lib/rsvpWeddingLayout';

const FloralFrame = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`wedding-rsvp-floral-frame ${className}`}>
    <span className="wedding-rsvp-floral-corner wedding-rsvp-floral-corner--tl" aria-hidden />
    <span className="wedding-rsvp-floral-corner wedding-rsvp-floral-corner--tr" aria-hidden />
    <div className="wedding-rsvp-floral-content">{children}</div>
    <span className="wedding-rsvp-floral-corner wedding-rsvp-floral-corner--bl" aria-hidden />
    <span className="wedding-rsvp-floral-corner wedding-rsvp-floral-corner--br" aria-hidden />
  </div>
);

const EnvelopeIllustration = ({ gold }: { gold: string }) => (
  <div className="wedding-rsvp-envelope-scene" aria-hidden>
    <div className="wedding-rsvp-envelope-flap">
      <span className="wedding-rsvp-envelope-flap-line wedding-rsvp-envelope-flap-line--left" />
      <span className="wedding-rsvp-envelope-flap-line wedding-rsvp-envelope-flap-line--right" />
    </div>
    <div
      className="wedding-rsvp-seal"
      style={{
        background: `radial-gradient(circle at 38% 28%, ${gold}f5, ${gold} 38%, #a8841a 72%, #7a6010 100%)`,
      }}
    >
      <span className="wedding-rsvp-seal-deco" />
    </div>
  </div>
);

const ScrollHintButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    type="button"
    className="wedding-rsvp-scroll-hint"
    onClick={onClick}
    aria-label="Faire défiler vers le bas"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8, duration: 0.5 }}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.92 }}
  >
    <span className="wedding-rsvp-scroll-hint-ring" aria-hidden />
    <span className="wedding-rsvp-scroll-hint-ring wedding-rsvp-scroll-hint-ring--delayed" aria-hidden />
    <motion.span
      className="wedding-rsvp-scroll-hint-icon"
      animate={{ y: [0, 9, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <ChevronDown className="w-6 h-6 wedding-rsvp-scroll-hint-chevron wedding-rsvp-scroll-hint-chevron--top" strokeWidth={1.75} />
      <ChevronDown className="w-6 h-6 wedding-rsvp-scroll-hint-chevron" strokeWidth={1.75} />
    </motion.span>
    <motion.span
      className="wedding-rsvp-scroll-hint-label"
      animate={{ opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      Défiler
    </motion.span>
  </motion.button>
);

interface WeddingStyleRsvpLayoutProps {
  event: Event;
  coverUrl: string;
  guestName?: string;
  typePhrase: string;
  onImageError?: (e: SyntheticEvent<HTMLImageElement>) => void;
  countdown?: ReactNode;
  formSection: ReactNode;
}

const WeddingStyleRsvpLayout = ({
  event,
  coverUrl,
  guestName,
  typePhrase,
  onImageError,
  countdown,
  formSection,
}: WeddingStyleRsvpLayoutProps) => {
  const navy = getRsvpThemeColor(event);
  const gold = getRsvpGoldColor(event);
  const couple = parseCoupleFromTitle(event.title);
  const monogram = getMonogram(couple);
  const dateBlock = getDateBlockParts(event.date);
  const calendar = getEventCalendarGrid(event.date);
  const invitationLine = getGuestInvitationLine(guestName, event, typePhrase);
  const deadline = getRsvpDeadlineLabel(event.date);
  const organizerPhone = event.organizer?.phone?.trim();
  const showDressCode = hasCustomDressCode(event) || normalizeEventType(event.type) === 'Mariage';

  const themeStyle = {
    '--wrsvp-navy': navy,
    '--wrsvp-gold': gold,
    '--wrsvp-envelope-bg': '#6b8294',
  } as CSSProperties;

  const scrollToContent = () => {
    document.getElementById('rsvp-intro-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToForm = () => {
    document.getElementById('rsvp-confirm-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const contactMessage = `Bonjour, je confirme ma présence pour ${event.title}.`;

  return (
    <div className="wedding-rsvp" style={themeStyle}>
      {/* Enveloppe + noms */}
      <header className="wedding-rsvp-envelope">
        <div className="wedding-rsvp-envelope-names">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="wedding-rsvp-script wedding-rsvp-couple-name"
          >
            {couple.name1}
          </motion.p>
          {couple.name2 && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.06 }}
                className="wedding-rsvp-couple-amp"
              >
                &amp;
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="wedding-rsvp-script wedding-rsvp-couple-name"
              >
                {couple.name2}
              </motion.p>
            </>
          )}
        </div>
        <EnvelopeIllustration gold={gold} />
        <div className="wedding-rsvp-envelope-footer">
          <p className="wedding-rsvp-envelope-date">{formatCompactDate(event.date)}</p>
          <ScrollHintButton onClick={scrollToContent} />
        </div>
      </header>

      {/* Citation + annonce */}
      <section id="rsvp-intro-section" className="wedding-rsvp-cream wedding-rsvp-section scroll-mt-0">
        <FloralFrame>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="wedding-rsvp-section-inner text-center py-2"
          >
            {event.description && (
              <p className="wedding-rsvp-quote">&ldquo;{event.description}&rdquo;</p>
            )}
            <p className="wedding-rsvp-monogram">{monogram}</p>
            <p className="wedding-rsvp-announce">{getAnnouncementPhrase(event)}</p>
            <p className="wedding-rsvp-intro">{invitationLine}</p>
          </motion.div>
        </FloralFrame>
      </section>

      {/* Photo du couple / couverture */}
      <section className="wedding-rsvp-photo-block">
        <img
          src={coverUrl}
          alt={event.title}
          className="wedding-rsvp-photo wedding-rsvp-photo--hero"
          onError={onImageError}
        />
      </section>

      {/* Grande date */}
      <section className="wedding-rsvp-navy wedding-rsvp-date-block">
        <p className="wedding-rsvp-date-block-weekday">{dateBlock.weekday}</p>
        <p className="wedding-rsvp-date-block-day">{dateBlock.day}</p>
        <p className="wedding-rsvp-date-block-month">
          {dateBlock.month} {dateBlock.year}
        </p>
      </section>

      {/* Compte à rebours */}
      {countdown && (
        <section className="wedding-rsvp-navy wedding-rsvp-section wedding-rsvp-section--compact">
          {countdown}
        </section>
      )}

      {/* Calendrier */}
      <section className="wedding-rsvp-cream wedding-rsvp-section">
        <div className="wedding-rsvp-section-inner">
          <p className="wedding-rsvp-label text-center mb-4">
            {calendar.monthLabel} {calendar.year}
          </p>
          <div className="wedding-rsvp-calendar">
            <div className="wedding-rsvp-calendar-head">
              {CALENDAR_WEEKDAYS.map((label, index) => (
                <span key={`${label}-${index}`}>{label}</span>
              ))}
            </div>
            {calendar.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="wedding-rsvp-calendar-row">
                {week.map((cell, dayIndex) => (
                  <span
                    key={`${weekIndex}-${dayIndex}`}
                    className={
                      cell.day
                        ? cell.isEventDay
                          ? 'wedding-rsvp-calendar-day wedding-rsvp-calendar-day--event'
                          : 'wedding-rsvp-calendar-day'
                        : 'wedding-rsvp-calendar-day wedding-rsvp-calendar-day--empty'
                    }
                  >
                    {cell.isEventDay && (
                      <span className="wedding-rsvp-calendar-heart" aria-hidden>♥</span>
                    )}
                    {cell.day ?? ''}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {showDressCode && (
      <section className="wedding-rsvp-cream wedding-rsvp-section wedding-rsvp-section--border-top">
        <div className="wedding-rsvp-section-inner text-center">
          <Shirt className="w-7 h-7 mx-auto mb-3 wedding-rsvp-icon" strokeWidth={1.25} />
          <p className="wedding-rsvp-label">Code vestimentaire</p>
          <p className="wedding-rsvp-heading-sm">{getDressCodeLabel(event)}</p>
          <div className="wedding-rsvp-dress-icons" aria-hidden>
            <span>🤵</span>
            <span>👗</span>
          </div>
          <p className="wedding-rsvp-meta mt-3 max-w-xs mx-auto">
            {getDressCodeNotes(event)}
          </p>
        </div>
      </section>
      )}

      {/* Confirmation */}
      <section id="rsvp-confirm-section" className="wedding-rsvp-cream wedding-rsvp-section scroll-mt-4">
        <FloralFrame>
          <div className="wedding-rsvp-section-inner text-center py-2">
            <CalendarCheck className="w-7 h-7 mx-auto mb-3 wedding-rsvp-icon" strokeWidth={1.25} />
            <p className="wedding-rsvp-label">Confirmation</p>
            <p className="wedding-rsvp-meta mt-3 max-w-sm mx-auto leading-relaxed">
              Merci de confirmer votre présence avant le {deadline}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              {couple.name2 && organizerPhone ? (
                <>
                  <Button
                    type="button"
                    className="wedding-rsvp-btn flex-1"
                    onClick={() =>
                      window.open(
                        buildWhatsAppUrl(organizerPhone, `${contactMessage} (${couple.name1})`),
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    Contacter {couple.name1.split(' ')[0]}
                  </Button>
                  <Button
                    type="button"
                    className="wedding-rsvp-btn flex-1"
                    onClick={() =>
                      window.open(
                        buildWhatsAppUrl(organizerPhone, `${contactMessage} (${couple.name2})`),
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    Contacter {couple.name2.split(' ')[0]}
                  </Button>
                </>
              ) : (
                <Button type="button" className="wedding-rsvp-btn" onClick={scrollToForm}>
                  Confirmer ma présence
                </Button>
              )}
            </div>
            {(couple.name2 && organizerPhone) && (
              <Button
                type="button"
                variant="link"
                className="mt-4 text-xs uppercase tracking-wider wedding-rsvp-link"
                onClick={scrollToForm}
              >
                Ou répondre via le formulaire
              </Button>
            )}
          </div>
        </FloralFrame>
      </section>

      {/* Formulaire RSVP */}
      <section className="wedding-rsvp-cream wedding-rsvp-form-wrap">{formSection}</section>

      {/* Remerciements */}
      <section className="wedding-rsvp-cream wedding-rsvp-section wedding-rsvp-thanks">
        <FloralFrame>
          <div className="text-center py-4">
            <p className="wedding-rsvp-script wedding-rsvp-thanks-text">Merci !</p>
            <p className="wedding-rsvp-meta mt-2">{couple.display}</p>
          </div>
        </FloralFrame>
      </section>
    </div>
  );
};

export default WeddingStyleRsvpLayout;
