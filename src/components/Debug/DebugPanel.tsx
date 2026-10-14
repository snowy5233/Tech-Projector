import type { DebugConfig } from '../../hooks/useDebugConfig';
import type { ScheduleState } from '../../hooks/useScheduleState';
import { ARTWORK_MODE_IDS } from '../Artwork/createArtworkModes';
import { Button } from '../ui/Button';
import { SEASONS, seasonOf, type Season, type Weather } from '../Seasonal/SeasonalOverlay';
import { HOLIDAY_IDS, holidayOf, type HolidayId } from '../../lib/holidays';
import { SPEEDS } from '../../hooks/useDebugConfig';
import './debug.css';

const DAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

const pad = (value: number) => String(value).padStart(2, '0');
const hhmm = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export interface DebugPanelProps {
  config: DebugConfig;
  now: Date;
  phase: ScheduleState['phase'];
  visible: boolean;
  /** Live weather label for the auto option ('regen' | 'sneeuw' | 'droog'). */
  weatherLive: Weather | 'droog';
}

/**
 * Control panel: shifts the simulated clock (time + day), locks the artwork
 * theme, effects and overrides the slide text. Only visible while the mouse moves, like the calibration bar, so a
 * quiet projection stays clean.
 */
export const DebugPanel = ({ config, now, phase, visible, weatherLive }: DebugPanelProps) => {
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
        <span className="u-eyebrow debug__label">paneel</span>
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
          value={config.forcedMode}
          onChange={(event) => config.setForcedMode(event.target.value)}
        >
          <option value="auto">auto (rooster)</option>
          <option value="uit">uit</option>
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
          value={config.forcedSeason}
          onChange={(event) =>
            config.setForcedSeason(event.target.value as Season | 'auto' | 'uit')
          }
        >
          <option value="auto">auto ({seasonOf(now)})</option>
          <option value="uit">uit</option>
          {SEASONS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <label className="debug__row">
        <span className="u-eyebrow">weer</span>
        <select
          className="debug__input"
          value={config.forcedWeather ?? 'auto'}
          onChange={(event) =>
            config.setForcedWeather(event.target.value as Weather | 'auto' | 'uit')
          }
        >
          <option value="auto">auto ({weatherLive})</option>
          <option value="regen">regen</option>
          <option value="sneeuw">sneeuw</option>
          <option value="uit">uit</option>
        </select>
      </label>
      <label className="debug__row">
        <span className="u-eyebrow">feest</span>
        <select
          className="debug__input"
          value={config.forcedHoliday}
          onChange={(event) =>
            config.setForcedHoliday(event.target.value as HolidayId | 'auto' | 'uit')
          }
        >
          <option value="auto">auto ({holidayOf(now) ?? 'geen'})</option>
          <option value="uit">uit</option>
          {HOLIDAY_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <label className="debug__row">
        <span className="u-eyebrow">tekst</span>
        <span className="debug__controls">
          <input
            className="debug__input"
            type="text"
            value={config.customTitle}
            placeholder="auto (rooster)"
            onChange={(event) => config.setCustomTitle(event.target.value)}
          />
          <Button
            size="sm"
            onClick={() => config.setCustomTitleOn(!config.customTitleOn)}
          >
            {config.customTitleOn ? 'aan' : 'uit'}
          </Button>
        </span>
      </label>
      <label className="debug__row">
        <span className="u-eyebrow">tijd</span>
        <span className="debug__controls">
          <input
            className="debug__input"
            type="text"
            value={config.customRange}
            placeholder="auto (rooster)"
            onChange={(event) => config.setCustomRange(event.target.value)}
          />
          <Button
            size="sm"
            onClick={() => config.setCustomRangeOn(!config.customRangeOn)}
          >
            {config.customRangeOn ? 'aan' : 'uit'}
          </Button>
        </span>
      </label>
      <label className="debug__row">
        <span className="u-eyebrow">snelheid</span>
        <select
          className="debug__input"
          value={config.speed}
          onChange={(event) => config.setSpeed(Number(event.target.value))}
        >
          {SPEEDS.map((value) => (
            <option key={value} value={value}>
              {value}x
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
