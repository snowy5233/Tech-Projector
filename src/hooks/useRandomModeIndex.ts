import { useEffect, useState } from 'react';

const pickOther = (prev: number, count: number): number => {
  if (count <= 1) return 0;
  let next = Math.floor(Math.random() * (count - 1));
  if (next >= prev) next += 1;
  return next;
};

/** Random artwork index that hops to a different mode on an interval. */
export const useRandomModeIndex = (enabled: boolean, count: number, intervalMs = 14000): number => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(1, count)));

  useEffect(() => {
    if (!enabled || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => pickOther(prev, count));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, count, intervalMs]);

  return index;
};
