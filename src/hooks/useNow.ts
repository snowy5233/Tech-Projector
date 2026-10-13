import { useEffect, useRef, useState } from 'react';

/**
 * Current Date, refreshed on an interval (default 4x per second for smooth
 * seconds). `offsetMs` shifts the clock for previews and can change at runtime.
 */
export const useNow = (intervalMs = 250, offsetMs = 0): Date => {
  const offsetRef = useRef(offsetMs);
  offsetRef.current = offsetMs;
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
