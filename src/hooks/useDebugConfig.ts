import { useState } from 'react';
import { forcedArtworkModeIndex } from '../components/Artwork/createArtworkModes';
import { readClockOffsetMs } from '../lib/clock-offset';

export interface DebugConfig {
  /** Simulated clock shift in ms; 0 = live clock. Seeded from `?at` / `?dow`. */
  clockOffsetMs: number;
  setClockOffsetMs: (ms: number) => void;
  /** Locked artwork slot; null = the schedule decides. Seeded from `?art`. */
  forcedModeIndex: number | null;
  setForcedModeIndex: (index: number | null) => void;
}

/** Runtime overrides for the debug panel, seeded from the URL preview params. */
export const useDebugConfig = (): DebugConfig => {
  const [clockOffsetMs, setClockOffsetMs] = useState(readClockOffsetMs);
  const [forcedModeIndex, setForcedModeIndex] = useState<number | null>(forcedArtworkModeIndex);

  return { clockOffsetMs, setClockOffsetMs, forcedModeIndex, setForcedModeIndex };
};
