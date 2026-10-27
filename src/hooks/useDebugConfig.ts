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
  /** Custom slide title override; '' = the schedule decides. Seeded from `?titel=`. */
  customTitle: string;
  setCustomTitle: (title: string) => void;
  /** Custom slide time range override; '' = the schedule decides. Seeded from `?tijd=`. */
  customRange: string;
  setCustomRange: (range: string) => void;
  /** Whether the custom title override is applied. */
  customTitleOn: boolean;
  setCustomTitleOn: (on: boolean) => void;
  /** Whether the custom time range override is applied. */
  customRangeOn: boolean;
  setCustomRangeOn: (on: boolean) => void;
  /** Animation speed multiplier for artwork and particles. Seeded from `?snelheid=`. */
  speed: number;
  setSpeed: (speed: number) => void;
  /** Raw text of the custom speed input; '' = preset in use. */
  customSpeed: string;
  setCustomSpeed: (value: string) => void;
  /** Particle size multiplier. Seeded from `?grootte=`. */
  sizeScale: number;
  setSizeScale: (scale: number) => void;
  /** Overgangsblend: mix themes around the lesson switch. */
  blendOn: boolean;
  setBlendOn: (on: boolean) => void;
  /** Scrollende mededeling ticker text; '' = hidden. Seeded from `?mededeling=`. */
  ticker: string;
  setTicker: (text: string) => void;
  /** Whether the ticker is shown. */
  tickerOn: boolean;
  setTickerOn: (on: boolean) => void;
}

export const SPEEDS = [0.5, 1, 1.5, 2, 3];

/** Particle size presets, van subtiel tot goof. */
export const SIZE_SCALES = [0.5, 1, 2, 3, 4, 5, 10, 20, 50];

/** Optional `?grootte=<x>` to scale particle size. */
const sizeScaleFromUrl = (): number => {
  const value = new URLSearchParams(window.location.search).get('grootte');
  const parsed = value === null ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

/** Optional `?snelheid=<0.5|1|1.5|2|3>` to scale animation speed. */
const speedFromUrl = (): number => {
  const value = new URLSearchParams(window.location.search).get('snelheid');
  const parsed = value === null ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

/** Any positive number from `?snelheid=` that is not a preset becomes the custom value. */
const customSpeedFromUrl = (): string => {
  const value = new URLSearchParams(window.location.search).get('snelheid');
  if (value === null) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && !SPEEDS.includes(parsed) ? value : '';
};

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
  const [customTitle, setCustomTitle] = useState<string>(
    () => new URLSearchParams(window.location.search).get('titel') ?? '',
  );
  const [customRange, setCustomRange] = useState<string>(
    () => new URLSearchParams(window.location.search).get('tijd') ?? '',
  );
  const [customTitleOn, setCustomTitleOn] = useState(true);
  const [customRangeOn, setCustomRangeOn] = useState(true);
  const [speed, setSpeed] = useState<number>(speedFromUrl);
  const [customSpeed, setCustomSpeed] = useState<string>(customSpeedFromUrl);
  const [sizeScale, setSizeScale] = useState<number>(sizeScaleFromUrl);
  const [blendOn, setBlendOn] = useState(
    () => new URLSearchParams(window.location.search).get('overgang') !== 'uit',
  );
  const [ticker, setTicker] = useState<string>(
    () => new URLSearchParams(window.location.search).get('mededeling') ?? '',
  );
  const [tickerOn, setTickerOn] = useState(true);
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
    customTitle,
    setCustomTitle,
    customRange,
    setCustomRange,
    customTitleOn,
    setCustomTitleOn,
    customRangeOn,
    setCustomRangeOn,
    speed,
    setSpeed,
    customSpeed,
    setCustomSpeed,
    sizeScale,
    setSizeScale,
    blendOn,
    setBlendOn,
    ticker,
    setTicker,
    tickerOn,
    setTickerOn,
  };
};
