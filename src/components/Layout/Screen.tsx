import { formatSlotTime } from '../../data/schedule';
import type { CSSProperties } from 'react';
import {
  eventCountdownGlitchLevel,
  formatEventCountdownNl,
  isCountdownPassed,
} from '../../lib/time';
import { ARTWORK_MODE_COUNT, ARTWORK_MODE_IDS_INDEX } from '../Artwork/createArtworkModes';
import type { DebugConfig } from '../../hooks/useDebugConfig';
import type { ScheduleState } from '../../hooks/useScheduleState';

import { useRandomModeIndex } from '../../hooks/useRandomModeIndex';
import { ArtworkCanvas } from '../Artwork/ArtworkCanvas';
import { Clock } from '../Clock/Clock';
import { DebugPanel } from '../Debug/DebugPanel';
import { Slide, slotIndexOf } from '../Slide/Slide';
import { Ticker } from '../Ticker/Ticker';
import { DayOverview } from '../DayOverview/DayOverview';
import type { Season } from '../Seasonal/SeasonalOverlay';
import { SeasonalOverlay, seasonOf, type Weather } from '../Seasonal/SeasonalOverlay';
import { holidayOf, type HolidayId } from '../../lib/holidays';
import { CalibrateBar } from './CalibrateBar';
import './screen.css';

const ENERGY: Record<ScheduleState['phase'], number> = {
  lesson: 0.3,
  break: 0.38,
  before: 0.18,
  after: 0.32,
  weekend: 0.14,
};

/** Sparse at the start of a block, fuller at the end — never a packed field. */
const densityForProgress = (progress: number) => 0.16 + progress ** 1.4 * 0.28;

const IDLE_TITLE: Record<ScheduleState['phase'], string> = {
  lesson: '',
  break: '',
  before: 'Goeiemorgen',
  after: 'TECHLAB',
  weekend: 'Weekend',
};

export interface ScreenProps {
  now: Date;
  state: ScheduleState;
  pointerActive: boolean;
  canResetPin: boolean;
  isFullscreen: boolean;
  onResetPin: () => void;
  /** Locked artwork theme: 'auto' = schedule decides, 'uit' = off, or a mode id. */
  forcedMode: string;
  /** Locked season effect: 'auto' = clock month, 'uit' = off, or a season id. */
  forcedSeason: Season | 'auto' | 'uit';
  /** Locked weather effect; 'auto' = live weather via useWeather. */
  forcedWeather: Weather | 'auto' | 'uit';
  /** Live weather from useWeather, shown in the debug panel and used when 'auto'. */
  weatherLive: Weather;
  /** Locked holiday effect: 'auto' = clock date, 'uit' = off, or a holiday id. */
  forcedHoliday: HolidayId | 'auto' | 'uit';
  /** Custom slide title override; '' = the schedule decides. */
  customTitle: string;
  /** Whether the custom title override is applied. */
  customTitleOn: boolean;
  /** Custom slide time range override; '' = the schedule decides. */
  customRange: string;
  /** Whether the custom time range override is applied. */
  customRangeOn: boolean;
  /** Animation speed multiplier for artwork and particles. */
  speed: number;
  /** Particle size multiplier. */
  sizeScale: number;
  /** Overgangsblend toggle: mix themes around the lesson switch. */
  blendOn: boolean;
  /** Scrollende mededeling; '' = hidden. */
  ticker: string;
  /** Whether the ticker is shown. */
  tickerOn: boolean;
  /** Whether the day overview (lesuren) is shown bottom-right. */
  dayOverviewOn: boolean;
  /** Debug controls; shown while the mouse moves. */
  debug: DebugConfig | null;
}

export const Screen = ({
  now,
  state,
  pointerActive,
  canResetPin,
  isFullscreen,
  onResetPin,
  forcedMode,
  forcedSeason,
  forcedWeather,
  weatherLive,
  forcedHoliday,
  customTitle,
  customTitleOn,
  customRange,
  customRangeOn,
  speed,
  sizeScale,
  blendOn,
  ticker,
  tickerOn,
  dayOverviewOn,
  debug,
}: ScreenProps) => {
  const slot = state.currentSlot;
  const afterHours = state.phase === 'after';
  const randomMode = useRandomModeIndex(afterHours, ARTWORK_MODE_COUNT);
  const forcedIndex = ARTWORK_MODE_IDS_INDEX[forcedMode] ?? null;
  const artworkOff = forcedMode === 'uit';
  const modeIndex = forcedIndex ?? (slot ? slotIndexOf(slot) : afterHours ? randomMode : 0);
  const title = customTitleOn
    ? customTitle || (slot ? slot.label : IDLE_TITLE[state.phase])
    : '';
  const range = slot
    ? `${formatSlotTime(slot.start)}–${formatSlotTime(slot.end)}`
    : undefined;
  // Overgangsblend: laatste minuut van een slot en eerste minuut erna.
  const nextModeIndex = slot && state.nextSlot ? slotIndexOf(state.nextSlot) : null;
  const blendRemaining = slot && state.secondsUntilChange < 60 ? 1 - state.secondsUntilChange / 60 : 0;
  const blendElapsed = slot && state.slotProgress < 1 / 45 ? state.slotProgress * 45 : 0;
  const blend = blendOn ? Math.min(1, Math.max(blendRemaining, blendElapsed)) : 0;
  const density = slot
    ? densityForProgress(state.slotProgress)
    : afterHours
      ? 0.4
      : 0.12;

  const countdownText = formatEventCountdownNl(now);
  const glitchStyle = { '--glitch': eventCountdownGlitchLevel(now) } as CSSProperties;
  const showCountdown = !isCountdownPassed(now);

  return (
    <div className={`screen screen--${state.phase}`}>
      {artworkOff || (
        <ArtworkCanvas
          modeIndex={modeIndex}
          energy={ENERGY[state.phase]}
          density={density}
          speed={speed}
          nextModeIndex={nextModeIndex}
          blend={blend}
        />
      )}

      <SeasonalOverlay
        season={forcedSeason === 'auto' ? seasonOf(now) : forcedSeason === 'uit' ? null : forcedSeason}
        weather={forcedWeather === 'auto' ? weatherLive : forcedWeather === 'uit' ? null : forcedWeather}
        holiday={forcedHoliday === 'auto' ? holidayOf(now) : forcedHoliday === 'uit' ? null : forcedHoliday}
        speed={speed}
        sizeScale={sizeScale}
      />

      <div className="screen__ui">
        <Clock now={now} showDate={false} className="clock--corner" />
        <Slide
          title={title}
          range={customRangeOn ? customRange || range : undefined}
          nextSlot={state.nextSlot}
          brand={afterHours}
        />

        {showCountdown && (
          <p className="screen__countdown u-mono" data-text={countdownText} style={glitchStyle}>
            {countdownText}
          </p>
        )}
      </div>

      {debug && (
        <DebugPanel
          config={debug}
          now={now}
          phase={state.phase}
          visible={pointerActive}
          weatherLive={weatherLive ?? 'droog'}
        />
      )}

      {tickerOn && ticker !== '' && <Ticker text={ticker} />}

      {dayOverviewOn && <DayOverview state={state} />}

      <CalibrateBar
        visible={pointerActive}
        canReset={canResetPin}
        isFullscreen={isFullscreen}
        onReset={onResetPin}
      />
    </div>
  );
};
