import { motion } from 'framer-motion';
import type { ReactNode, SyntheticEvent } from 'react';
import { normalizeEventType } from '@/lib/eventTypePhrases';
import { RSVP_ROSES_BOUQUET, getRsvpDecorationTheme } from '@/lib/rsvpDecorations';

const TornEdge = ({ fill = '#faf6f2' }: { fill?: string }) => (
  <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 pointer-events-none z-10 leading-[0]" aria-hidden>
    <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className="w-full h-full block">
      <path
        d="M0,24 L0,8 Q15,18 30,6 Q45,16 60,4 Q75,14 90,5 Q105,17 120,7 Q135,15 150,6 Q165,18 180,8 Q195,14 210,5 Q225,16 240,7 Q255,15 270,6 Q285,17 300,8 Q315,14 330,5 Q345,16 360,7 Q375,15 390,6 Q405,18 420,8 Q435,14 450,5 Q465,16 480,7 Q495,15 510,6 Q525,17 540,8 Q555,14 570,5 Q585,16 600,7 Q615,15 630,6 Q645,18 660,8 Q675,14 690,5 Q705,16 720,7 Q735,15 750,6 Q765,17 780,8 Q795,14 810,5 Q825,16 840,7 Q855,15 870,6 Q885,18 900,8 Q915,14 930,5 Q945,16 960,7 Q975,15 990,6 Q1005,17 1020,8 Q1035,14 1050,5 Q1065,16 1080,7 Q1095,15 1110,6 Q1125,17 1140,8 Q1155,14 1170,5 L1200,12 L1200,24 Z"
        fill={fill}
      />
    </svg>
  </div>
);

interface RsvpInvitationHeroProps {
  coverSrc: string;
  coverAlt: string;
  eventType?: string;
  title: string;
  typePrefix: string;
  typeNoun: string;
  typePhrase: string;
  guestName?: string;
  description?: string;
  children?: ReactNode;
  onImageError?: (e: SyntheticEvent<HTMLImageElement>) => void;
}

const getPanelFill = (eventType?: string) => {
  const type = normalizeEventType(eventType);
  switch (type) {
    case 'Mariage':
      return '#faf6f2';
    case 'Anniversaire':
      return '#fffbeb';
    case 'Baby Shower':
      return '#f4fdf6';
    case 'Remise de diplôme':
      return '#f8f6ff';
    case 'Événement corporate':
      return '#f8fafc';
    case 'Fête':
      return '#fff9eb';
    default:
      return '#faf8f5';
  }
};

const getPanelClass = (eventType?: string) => {
  const type = normalizeEventType(eventType);
  switch (type) {
    case 'Mariage':
      return 'rsvp-invitation-panel--wedding';
    case 'Anniversaire':
      return 'rsvp-invitation-panel--birthday';
    case 'Baby Shower':
      return 'rsvp-invitation-panel--baby';
    default:
      return 'rsvp-invitation-panel--default';
  }
};

const getTitleColor = (eventType?: string) => {
  const type = normalizeEventType(eventType);
  if (type === 'Mariage') return '#5c2030';
  if (type === 'Anniversaire') return '#92400e';
  if (type === 'Baby Shower') return '#166534';
  if (type === 'Remise de diplôme') return '#5b21b6';
  if (type === 'Événement corporate') return '#334155';
  return '#4a5a44';
};

const RsvpInvitationHero = ({
  coverSrc,
  coverAlt,
  eventType,
  title,
  typePrefix,
  typeNoun,
  typePhrase,
  guestName,
  description,
  children,
  onImageError,
}: RsvpInvitationHeroProps) => {
  const theme = getRsvpDecorationTheme(eventType);
  const panelFill = getPanelFill(eventType);
  const titleColor = getTitleColor(eventType);
  const isWedding = normalizeEventType(eventType) === 'Mariage';

  return (
    <header className="rsvp-invitation-hero w-full">
      {/* Photo — ~2/3 écran, sans texte */}
      <div className="relative w-full h-[65dvh] min-h-[300px] max-h-[740px] bg-[#e8dfd4] overflow-hidden">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          src={coverSrc}
          alt={coverAlt}
          className="w-full h-full object-cover object-top sm:object-[center_20%] md:object-[center_24%]"
          onError={onImageError}
        />
        <TornEdge fill={panelFill} />
      </div>

      {/* Panneau invitation — style carte papier */}
      <div
        className={`rsvp-invitation-panel relative px-5 sm:px-8 pt-2 pb-10 sm:pb-12 text-center overflow-hidden ${getPanelClass(eventType)}`}
        style={{ backgroundColor: panelFill }}
      >
        {/* Fleurs en bas — mariage */}
        {isWedding && (
          <>
            <img
              src={RSVP_ROSES_BOUQUET}
              alt=""
              aria-hidden
              className="absolute bottom-0 left-0 w-[clamp(5.5rem,28vw,9.5rem)] object-contain object-bottom pointer-events-none select-none opacity-95 -translate-x-[12%] translate-y-[8%] rotate-[12deg] drop-shadow-lg"
              draggable={false}
            />
            <img
              src={RSVP_ROSES_BOUQUET}
              alt=""
              aria-hidden
              className="absolute bottom-0 right-0 w-[clamp(5.5rem,28vw,9.5rem)] object-contain object-bottom pointer-events-none select-none opacity-95 translate-x-[12%] translate-y-[8%] -scale-x-100 rotate-[12deg] drop-shadow-lg"
              draggable={false}
            />
          </>
        )}

        {/* Décor autres événements */}
        {!isWedding && theme.corners && (
          <div className="absolute inset-0 pointer-events-none">
            {theme.corners.slice(2).map((corner, i) => (
              <div key={i} className={`absolute ${corner.position} opacity-80`}>
                {corner.symbols.map((s, j) => (
                  <span key={j} className={corner.size}>
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="relative z-10 max-w-lg mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] sm:text-xs uppercase tracking-[0.35em] font-light mb-3"
            style={{ color: titleColor, opacity: 0.75 }}
          >
            Vous êtes invité(e) {typePrefix}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-2xl sm:text-3xl font-light capitalize mb-1"
            style={{ color: titleColor }}
          >
            {typeNoun}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-3xl sm:text-[2.75rem] font-semibold tracking-wide leading-tight mt-4 mb-5 px-2"
            style={{ color: titleColor }}
          >
            {title}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mx-auto h-px w-16 mb-5"
            style={{ backgroundColor: `${titleColor}44` }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="text-sm sm:text-base font-light leading-relaxed max-w-md mx-auto px-1"
            style={{ color: titleColor, opacity: 0.85 }}
          >
            {guestName ? (
              <>
                Cher(e) <span className="font-medium">{guestName}</span>, nous avons l&apos;honneur de
                vous inviter {typePhrase}. Merci de confirmer votre présence.
              </>
            ) : (
              <>
                Nous avons l&apos;honneur de vous inviter {typePhrase}. Nous serions ravis de partager
                ce moment avec vous.
              </>
            )}
          </motion.p>

          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="mt-4 text-sm font-light italic leading-relaxed max-w-md mx-auto px-2"
              style={{ color: titleColor, opacity: 0.7 }}
            >
              {description}
            </motion.p>
          )}

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </header>
  );
};

export default RsvpInvitationHero;
