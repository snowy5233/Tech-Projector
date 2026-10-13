import { formatSlotTime } from '../../data/schedule';
import type { CSSProperties } from 'react';
import {
  COUNTDOWN_LABEL,
  eventCountdownGlitchLevel,
  formatEventCountdownNl,
  isCountdownPassed,
} from '../../lib/time';
import { ARTWORK_MODE_COUNT } from '../Artwork/createArtworkModes';
import type { DebugConfig } from '../../hooks/useDebugConfig';
import type { ScheduleState } from '../../hooks/useScheduleState';
import { useRandomModeIndex } from '../../hooks/useRandomModeIndex';
import { ArtworkCanvas } from '../Artwork/ArtworkCanvas';
import { Clock } from '../Clock/Clock';
import { DebugPanel } from '../Debug/DebugPanel';
import { Slide, slotIndexOf } from '../Slide/Slide';
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
  /** Locked artwork slot (?art or the debug panel); null = the schedule decides. */
  forcedModeIndex: number | null;
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
  forcedModeIndex,
  debug,
}: ScreenProps) => {
  const slot = state.currentSlot;
  const afterHours = state.phase === 'after';
  const randomMode = useRandomModeIndex(afterHours, ARTWORK_MODE_COUNT);
  const modeIndex = forcedModeIndex ?? (slot ? slotIndexOf(slot) : afterHours ? randomMode : 0);
  const title = slot ? slot.label : IDLE_TITLE[state.phase];
  const range = slot
    ? `${formatSlotTime(slot.start)}–${formatSlotTime(slot.end)}`
    : undefined;
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
      <ArtworkCanvas
        modeIndex={modeIndex}
        energy={ENERGY[state.phase]}
        density={density}
      />

      <div className="screen__ui">
        <Clock now={now} showDate={false} className="clock--corner" />
        <Slide title={title} range={range} nextSlot={state.nextSlot} brand={afterHours} />

        {showCountdown && (
          <>
            <p className="screen__countdown u-mono" data-text={countdownText} style={glitchStyle}>
              {countdownText}
            </p>

            <p className="screen__countdown-label">{COUNTDOWN_LABEL}</p>
          </>
        )}
      </div>

      {debug && (
        <DebugPanel
          config={debug}
          now={now}
          phase={state.phase}
          visible={pointerActive}
        />
      )}

      <CalibrateBar
        visible={pointerActive}
        canReset={canResetPin}
        isFullscreen={isFullscreen}
        onReset={onResetPin}
      />
    </div>
  );
};
