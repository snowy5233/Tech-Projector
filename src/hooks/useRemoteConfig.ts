import { useEffect, useState } from 'react';
import { fetchRemote, remoteEnabled, type RemoteBeeld } from '../lib/remoteConfig';

const POLL_SECONDS = 5;

/**
 * Luistert naar de beeld-opdracht uit Firebase. Elke POLL_SECONDS seconden
 * opnieuw gelezen; een wijziging in de admin-pagina is dus binnen enkele
 * seconden zichtbaar op de projector. Null als remote niet is ingesteld.
 */
export const useRemoteConfig = (): RemoteBeeld | null => {
  const [remote, setRemote] = useState<RemoteBeeld | null>(null);

  useEffect(() => {
    if (!remoteEnabled()) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchRemote();
        if (!cancelled) setRemote(data);
      } catch {
        /* geen verbinding: houd de laatste opdracht */
      }
    };

    void load();
    const id = setInterval(load, POLL_SECONDS * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return remoteEnabled() ? remote : null;
};
