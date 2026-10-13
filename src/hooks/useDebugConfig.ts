import { useState } from 'react';
import { forcedArtworkModeIndex } from '../components/Artwork/createArtworkModes';
import { SEASONS, type Season } from '../components/Seasonal/SeasonalOverlay';
import { readClockOffsetMs } from '../lib/clock-offset';

export interface DebugConfig {
  /** Simulated clock shift in ms; 0 = live clock. Seeded from `?at` / `?dow`. */
  clockOffsetMs: number;
  setClockOffsetMs: (ms: number) => void;
  /** Locked artwork slot; null = the schedule decides. Seeded from `?art`. */
  forcedModeIndex: number | null;
  setForcedModeIndex: (index: number | null) => void;
  /** Locked season effect; null = derived from the clock month. Seeded from `?seizoen`. */
  forcedSeason: Season | null;
  setForcedSeason: (season: Season | null) => void;
}

/** Optional `?seizoen=<id>` to force one seasonal effect. Unknown values are ignored. */
const forcedSeasonFromUrl = (): Season | null => {
  const value = new URLSearchParams(window.location.search).get('seizoen');
  return value && SEASONS.includes(value as Season) ? (value as Season) : null;
};

/** Runtime overrides for the debug panel, seeded from the URL preview params. */
export const useDebugConfig = (): DebugConfig => {
  const [clockOffsetMs, setClockOffsetMs] = useState(readClockOffsetMs);
  const [forcedModeIndex, setForcedModeIndex] = useState<number | null>(forcedArtworkModeIndex);
  const [forcedSeason, setForcedSeason] = useState<Season | null>(forcedSeasonFromUrl);
  return {
    clockOffsetMs,
    setClockOffsetMs,
    forcedModeIndex,
    setForcedModeIndex,
    forcedSeason,
    setForcedSeason,
  };
};
