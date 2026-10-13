import { useEffect, useRef, useState } from 'react';
import { readClockOffsetMs } from '../lib/clock-offset';

/** Current Date, refreshed on an interval (default 4x per second for smooth seconds). */
export const useNow = (intervalMs = 250): Date => {
  const offsetRef = useRef(readClockOffsetMs());
  const [now, setNow] = useState(() => new Date(Date.now() + offsetRef.current));

  useEffect(() => {
    const id = window.setInterval(
      () => setNow(new Date(Date.now() + offsetRef.current)),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
};
