import { readCountdownConfig } from './clock-offset';

export const WEEKDAYS_NL = [
  'zondag',
  'maandag',
  'dinsdag',
  'woensdag',
  'donderdag',
  'vrijdag',
  'zaterdag',
] as const;

export const MONTHS_NL = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
] as const;

export const formatDateNl = (date: Date): string =>
  `${WEEKDAYS_NL[date.getDay()]} ${date.getDate()} ${MONTHS_NL[date.getMonth()]}`;

export const pad2 = (value: number): string => String(Math.floor(value)).padStart(2, '0');

const countdownConfig = readCountdownConfig();

/** Event countdown target — default vrijdag 16 oktober 16:20, override via `?tot=`. */
export const COUNTDOWN_TARGET_MS = countdownConfig.targetMs;
/** Dutch caption shown under the countdown, override via `?tekst=`. */
export const COUNTDOWN_LABEL = countdownConfig.label;

/** True once the countdown target has passed — the countdown is then hidden. */
export const isCountdownPassed = (from: Date): boolean =>
  from.getTime() >= COUNTDOWN_TARGET_MS;

/** "X Dagen XX uren XX Minuten XX Seconden", clamped at zero once passed. */
export const formatEventCountdownNl = (from: Date): string => {
  const total = Math.max(0, Math.ceil((COUNTDOWN_TARGET_MS - from.getTime()) / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `Nog ${days} dagen ${pad2(hours)} uren ${pad2(minutes)} minuten ${pad2(seconds)} seconden tot de vakantie!`;
};

export const minutesOfDay = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60 + date.getMilliseconds() / 60000;

export interface Duration {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const toDuration = (seconds: number): Duration => {
  const total = Math.max(0, Math.ceil(seconds));
  return {
    totalSeconds: total,
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

/** "04:32" or "1:12:30" for longer stretches. */
export const formatCountdown = (seconds: number): string => {
  const { hours, minutes, seconds: secs } = toDuration(seconds);
  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(secs)}`;
  return `${pad2(minutes)}:${pad2(secs)}`;
};

/** "nog 12 min" / "nog 45 sec" — used for compact status lines. */
export const formatRemainingNl = (seconds: number): string => {
  const { hours, minutes, seconds: secs } = toDuration(seconds);
  if (hours > 0) return `nog ${hours} uur ${minutes} min`;
  if (minutes > 0) return `nog ${minutes} min`;
  return `nog ${secs} sec`;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** 0 far out, ramps up to 1 at the event - drives countdown glitch intensity. */
export const eventCountdownGlitchLevel = (from: Date): number => {
  const rampMs = 4.5 * 24 * 60 * 60 * 1000;
  const remainingMs = Math.max(0, COUNTDOWN_TARGET_MS - from.getTime());
  return clamp(1 - remainingMs / rampMs, 0, 1);
};
