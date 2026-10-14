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
  /** Locked season effect: 'auto' = clock month, 'uit' = off, or a season id. Seeded from `?seizoen`. */
  forcedSeason: Season | 'auto' | 'uit';
  setForcedSeason: (season: Season | 'auto' | 'uit') => void;
  /** Locked weather effect; null = live weather (or none). Seeded from `?weer`. */
  forcedWeather: Weather | 'auto' | 'uit';
  setForcedWeather: (weather: Weather | 'auto' | 'uit') => void;
  /** Locked holiday effect: 'auto' = clock date, 'uit' = off, or a holiday id. Seeded from `?feest`. */
  forcedHoliday: HolidayId | 'auto' | 'uit';
  setForcedHoliday: (holiday: HolidayId | 'auto' | 'uit') => void;
}

/** Optional `?seizoen=<id|uit>` to force one seasonal effect. Unknown values are ignored. */
const forcedSeasonFromUrl = (): Season | 'auto' | 'uit' => {
  const value = new URLSearchParams(window.location.search).get('seizoen');
  if (value === 'uit') return 'uit';
  return value && SEASONS.includes(value as Season) ? (value as Season) : 'auto';
};

/** Optional `?weer=<regen|sneeuw|uit>` to force the weather effect. */
const forcedWeatherFromUrl = (): Weather | 'auto' | 'uit' => {
  const value = new URLSearchParams(window.location.search).get('weer');
  if (value === 'regen' || value === 'sneeuw') return value;
  if (value === 'uit') return 'uit';
  return 'auto';
};

/** Optional `?feest=<id|uit>` to force one holiday effect. */
const forcedHolidayFromUrl = (): HolidayId | 'auto' | 'uit' => {
  const value = new URLSearchParams(window.location.search).get('feest');
  if (value === 'uit') return 'uit';
  return value && HOLIDAY_IDS.includes(value as HolidayId) ? (value as HolidayId) : 'auto';
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
  const [forcedSeason, setForcedSeason] = useState<Season | 'auto' | 'uit'>(forcedSeasonFromUrl);
  const [forcedWeather, setForcedWeather] = useState<Weather | 'auto' | 'uit'>(forcedWeatherFromUrl);
  const [forcedHoliday, setForcedHoliday] = useState<HolidayId | 'auto' | 'uit'>(forcedHolidayFromUrl);
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
