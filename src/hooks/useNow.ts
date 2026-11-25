import { useEffect, useRef, useState } from 'react';

/**
 * Current Date, refreshed on an interval (default 2x per second — the seconds
 * display needs ~1s precision, 500ms keeps it feeling smooth without
 * re-rendering the whole tree needlessly). `offsetMs` shifts the clock for
 * previews and can change at runtime.
 *
 * The timer stops while the tab is hidden (projector output off, another
 * window focused): no wasted cycles, and the first tick after returning
 * re-syncs immediately.
 */
export const useNow = (intervalMs = 500, offsetMs = 0): Date => {
  const offsetRef = useRef(offsetMs);
  offsetRef.current = offsetMs;
  const [now, setNow] = useState(() => new Date(Date.now() + offsetRef.current));

  useEffect(() => {
    let id = 0;

    const tick = () => setNow(new Date(Date.now() + offsetRef.current));

    const start = () => {
      if (id === 0) id = window.setInterval(tick, intervalMs);
    };

    const stop = () => {
      window.clearInterval(id);
      id = 0;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);

  return now;
};
