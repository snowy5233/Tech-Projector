import { useState } from 'react';
import { ARTWORK_MODE_IDS, forcedArtworkModeIndex } from '../components/Artwork/createArtworkModes';
import { SEASONS, type Season, type Weather } from '../components/Seasonal/SeasonalOverlay';
import { HOLIDAY_IDS, type HolidayId } from '../lib/holidays';
import { readClockOffsetMs } from '../lib/clock-offset';

export interface DebugConfig {
  /** Simulated clock shift in ms; 0 = live clock. Seeded from `?at` / `?dow`. */
  clockOffsetMs: number;
  setClockOffsetMs: (ms: number) => void;
  /** Locked artwork slot: 'auto' = schedule decides, 'uit' = artwork off, or a mode id. Seeded from `?art`. */
  forcedMode: string;
  setForcedMode: (mode: string) => void;
  /** Locked season effect; null = derived from the clock month. Seeded from `?seizoen`. */
  forcedSeason: Season | null;
  setForcedSeason: (season: Season | null) => void;
  /** Locked weather effect; null = live weather (or none). Seeded from `?weer`. */
  forcedWeather: Weather | 'auto' | 'uit';
  setForcedWeather: (weather: Weather | 'auto' | 'uit') => void;
  /** Locked holiday effect; null = derived from the clock date. Seeded from `?feest`. */
  forcedHoliday: HolidayId | null;
  setForcedHoliday: (holiday: HolidayId | null) => void;
}

/** Optional `?seizoen=<id>` to force one seasonal effect. Unknown values are ignored. */
const forcedSeasonFromUrl = (): Season | null => {
  const value = new URLSearchParams(window.location.search).get('seizoen');
  return value && SEASONS.includes(value as Season) ? (value as Season) : null;
};

/** Optional `?weer=<regen|sneeuw|uit>` to force the weather effect. */
const forcedWeatherFromUrl = (): Weather | 'auto' | 'uit' => {
  const value = new URLSearchParams(window.location.search).get('weer');
  if (value === 'regen' || value === 'sneeuw') return value;
  if (value === 'uit') return 'uit';
  return 'auto';
};

/** Optional `?feest=<id>` to force one holiday effect. */
const forcedHolidayFromUrl = (): HolidayId | null => {
  const value = new URLSearchParams(window.location.search).get('feest');
  return value && HOLIDAY_IDS.includes(value as HolidayId) ? (value as HolidayId) : null;
};

/** Runtime overrides for the debug panel, seeded from the URL preview params. */
export const useDebugConfig = (): DebugConfig => {
  const [clockOffsetMs, setClockOffsetMs] = useState(readClockOffsetMs);
  const [forcedMode, setForcedMode] = useState<string>(() => {
    const raw = new URLSearchParams(window.location.search).get('art');
    if (raw === 'uit') return 'uit';
    const index = forcedArtworkModeIndex();
    return index === null ? 'auto' : ARTWORK_MODE_IDS[index] ?? 'auto';
  });
  const [forcedSeason, setForcedSeason] = useState<Season | null>(forcedSeasonFromUrl);
  const [forcedWeather, setForcedWeather] = useState<Weather | 'auto' | 'uit'>(forcedWeatherFromUrl);
  const [forcedHoliday, setForcedHoliday] = useState<HolidayId | null>(forcedHolidayFromUrl);
  return {
    clockOffsetMs,
    setClockOffsetMs,
    forcedMode,
    setForcedMode,
    forcedSeason,
    setForcedSeason,
    forcedWeather,
    setForcedWeather,
    forcedHoliday,
    setForcedHoliday,
  };
};
