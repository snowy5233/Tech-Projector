/** Optional `?at=HH:MM` (and `?dow=0-6`) so a phase can be previewed on the projector. */
export const readClockOffsetMs = (): number => {
  const params = new URLSearchParams(window.location.search);
  const at = params.get('at');
  if (!at) return 0;

  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(at);
  if (!match) return 0;

  const simulated = new Date();
  simulated.setHours(Number(match[1]), Number(match[2]), Number(match[3] ?? 0), 0);

  const dow = params.get('dow');
  if (dow !== null) {
    const wanted = Number(dow);
    if (Number.isInteger(wanted) && wanted >= 0 && wanted <= 6) {
      const delta = (wanted - simulated.getDay() + 7) % 7;
      simulated.setDate(simulated.getDate() + delta);
    }
  }

  return simulated.getTime() - Date.now();
};

export interface CountdownConfig {
  /** Moment the countdown reaches zero, in ms since epoch.
   * Parsed with `Date.parse`, so `2026-10-16T16:20` counts as local time. */
  targetMs: number;
  /** Dutch caption shown under the countdown. */
  label: string;
}

const DEFAULT_COUNTDOWN_TARGET_MS = Date.parse('2026-10-16T16:20:00+02:00');
const DEFAULT_COUNTDOWN_LABEL = 'Bijna Vakantie!';

/**
 * Optional event countdown via `?tot=<moment>` and `?tekst=<label>`.
 * Invalid or missing values fall back to the defaults.
 */
export const readCountdownConfig = (): CountdownConfig => {
  const params = new URLSearchParams(window.location.search);
  const tot = params.get('tot');
  const parsed = tot === null ? NaN : Date.parse(tot);
  return {
    targetMs: Number.isFinite(parsed) ? parsed : DEFAULT_COUNTDOWN_TARGET_MS,
    label: params.get('tekst') ?? DEFAULT_COUNTDOWN_LABEL,
  };
};
