import { useCallback, useEffect, useState } from 'react';
import { calcCountdown, type CountdownTime } from '@/utils/eventCountdown';

export function useCountdown(target: Date | null | undefined): CountdownTime {
  const targetTime = target?.getTime();

  const calc = useCallback(() => {
    if (targetTime == null) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPast: true };
    }
    return calcCountdown(new Date(targetTime));
  }, [targetTime]);

  const [time, setTime] = useState<CountdownTime>(calc);

  useEffect(() => {
    setTime(calc());
    const id = window.setInterval(() => setTime(calc()), 1000);
    return () => window.clearInterval(id);
  }, [calc]);

  return time;
}
