import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Heart, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dayJStorageKey, formatEventDateFr } from '@/utils/eventCountdown';
import type { Event } from '@/types/models';

interface DayJCelebrationProps {
  event: Event | null;
  userId?: string;
  isDayJ: boolean;
}

const DayJCelebration = ({ event, userId, isDayJ }: DayJCelebrationProps) => {
  const [open, setOpen] = useState(false);
  const eventId = event?._id || event?.id;

  useEffect(() => {
    if (!isDayJ || !event || !userId || !eventId) {
      setOpen(false);
      return;
    }
    const key = dayJStorageKey(userId, eventId);
    if (!sessionStorage.getItem(key)) {
      setOpen(true);
    }
  }, [isDayJ, event, userId, eventId]);

  const dismiss = () => {
    if (userId && eventId) {
      sessionStorage.setItem(dayJStorageKey(userId, eventId), '1');
    }
    setOpen(false);
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260 }}
            className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#faf8f5] via-[#f5ebe6] to-[#e8e0d8] p-8 shadow-2xl border border-[#b8956c]/40 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-4 right-4 text-[#7a8b72] hover:text-[#4a5a44]"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PartyPopper className="h-16 w-16 mx-auto text-[#b8956c]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="wedding-script text-4xl text-[#b8956c] mt-4"
            >
              Félicitations !
            </motion.p>

            <h2 className="font-display text-2xl font-bold text-[#4a5a44] mt-2">
              C&apos;est le jour J
            </h2>
            <p className="text-lg font-medium text-[#4a5a44] mt-2">{event.title}</p>
            <p className="text-sm text-[#7a8b72] mt-1">
              {formatEventDateFr(event.date, event.startTime)}
            </p>

            <p className="mt-6 text-[#4a5a44] leading-relaxed">
              Toute l&apos;équipe HK Event vous souhaite une célébration magnifique et vous remercie
              chaleureusement d&apos;avoir choisi notre plateforme pour orchestrer ce moment
              d&apos;exception.
            </p>

            <div className="flex items-center justify-center gap-2 mt-4 text-[#b8956c]">
              <Heart className="h-4 w-4 fill-current" />
              <Sparkles className="h-4 w-4" />
              <Heart className="h-4 w-4 fill-current" />
            </div>

            <Button onClick={dismiss} className="mt-8 shadow-gold w-full sm:w-auto">
              Merci HK Event !
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DayJCelebration;
