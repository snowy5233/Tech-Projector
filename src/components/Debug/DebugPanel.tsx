import type { DebugConfig } from '../../hooks/useDebugConfig';
import type { ScheduleState } from '../../hooks/useScheduleState';
import { ARTWORK_MODE_IDS } from '../Artwork/createArtworkModes';
import { Button } from '../ui/Button';
import { SEASONS, seasonOf, type Season } from '../Seasonal/SeasonalOverlay';
import './debug.css';

const DAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

const pad = (value: number) => String(value).padStart(2, '0');
const hhmm = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export interface DebugPanelProps {
  config: DebugConfig;
  now: Date;
  phase: ScheduleState['phase'];
  visible: boolean;
}

/**
 * Preview chrome: shifts the simulated clock (time + day) and locks the artwork
 * theme. Only visible while the mouse moves, like the calibration bar, so a
 * quiet projection stays clean.
 */
export const DebugPanel = ({ config, now, phase, visible }: DebugPanelProps) => {
  const simulate = (day: number, hours: number, minutes: number) => {
    const target = new Date();
    const delta = (day - target.getDay() + 7) % 7;
    target.setDate(target.getDate() + delta);
    target.setHours(hours, minutes, 0, 0);
    config.setClockOffsetMs(target.getTime() - Date.now());
  };

  return (
    <div
      className={`debug${visible ? ' debug--visible' : ''}`}
      data-ui-layer="debug"
    >
      <header className="debug__header">
        <span className="u-eyebrow debug__label">debug</span>
        <span className="u-eyebrow u-mono debug__phase">{phase}</span>
      </header>

      <label className="debug__row">
        <span className="u-eyebrow">tijd</span>
        <span className="debug__controls">
          <input
            className="debug__input"
            type="time"
            value={hhmm(now)}
            onChange={(event) => {
              const match = /^(\d{2}):(\d{2})$/.exec(event.target.value);
              if (match) {
                simulate(now.getDay(), Number(match[1]), Number(match[2]));
              }
            }}
          />
          <select
            className="debug__input"
            value={now.getDay()}
            onChange={(event) => {
              simulate(Number(event.target.value), now.getHours(), now.getMinutes());
            }}
          >
            {DAYS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={() => config.setClockOffsetMs(0)}
            disabled={config.clockOffsetMs === 0}
          >
            live
          </Button>
        </span>
      </label>

      <label className="debug__row">
        <span className="u-eyebrow">thema</span>
        <select
          className="debug__input"
          value={config.forcedModeIndex === null ? 'auto' : ARTWORK_MODE_IDS[config.forcedModeIndex]}
          onChange={(event) =>
            config.setForcedModeIndex(
              event.target.value === 'auto'
                ? null
                : ARTWORK_MODE_IDS.indexOf(event.target.value),
            )
          }
        >
          <option value="auto">auto (rooster)</option>
          {ARTWORK_MODE_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <label className="debug__row">
        <span className="u-eyebrow">seizoen</span>
        <select
          className="debug__input"
          value={config.forcedSeason ?? 'auto'}
          onChange={(event) =>
            config.setForcedSeason(
              event.target.value === 'auto' ? null : (event.target.value as Season),
            )
          }
        >
          <option value="auto">auto ({seasonOf(now)})</option>
          {SEASONS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
