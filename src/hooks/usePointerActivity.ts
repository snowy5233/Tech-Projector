import { useEffect, useState } from 'react';

/**
 * True while the mouse is moving (and for `idleDelayMs` after it stops).
 * Used to reveal the corner-pin handles only when someone is actually at the machine.
 */
export const usePointerActivity = (idleDelayMs = 2500): boolean => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timeout = 0;

    let holding = false;

    const sleep = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setActive(false), idleDelayMs);
    };

    const wake = () => {
      setActive(true);
      window.clearTimeout(timeout);
      if (!holding) sleep();
    };

    const down = () => {
      holding = true;
      wake();
    };

    const up = () => {
      holding = false;
      wake();
    };

    window.addEventListener('pointermove', wake, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    window.addEventListener('keydown', wake);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', wake);
    };
  }, [idleDelayMs]);

  return active;
};
