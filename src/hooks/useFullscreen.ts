import { useCallback, useEffect, useState } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const enter = useCallback(async () => {
    if (document.fullscreenElement) return;
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      // Fullscreen can be blocked by policy; the page stays usable windowed.
    }
  }, []);

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      // Ignore — nothing to exit.
    }
  }, []);

  const toggle = useCallback(() => {
    void (document.fullscreenElement ? exit() : enter());
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
};
