import { formatSlotTime, LESSONS, SLOTS } from '../../data/schedule';
import type { ScheduleState } from '../../hooks/useScheduleState';
import { Countdown } from '../Countdown/Countdown';
import { Badge } from '../ui/Badge';
import { Panel } from '../ui/Panel';
import { SegmentBar } from '../ui/SegmentBar';
import './now-panel.css';

export interface NowPanelProps {
  state: ScheduleState;
  className?: string;
}

/** "What is happening right now" card, shown while a lesson is running. */
export const NowPanel = ({ state, className }: NowPanelProps) => {
  const slot = state.currentSlot;
  if (!slot) return null;

  const slotIndex = SLOTS.findIndex((item) => item.id === slot.id);
  const upNext = SLOTS[slotIndex + 1];
  const lessonPosition = LESSONS.findIndex((item) => item.id === slot.id) + 1;

  return (
    <Panel
      label="Nu"
      meta={lessonPosition > 0 ? `les ${lessonPosition} van ${LESSONS.length}` : undefined}
      className={['now', className ?? ''].filter(Boolean).join(' ')}
    >
      <div className="now__head">
        <h2 className="now__title">{slot.label}</h2>
        <Badge pulse>live</Badge>
      </div>

      <p className="now__times u-mono">
        {formatSlotTime(slot.start)} – {formatSlotTime(slot.end)}
      </p>

      <Countdown seconds={state.secondsUntilChange} label="Nog te gaan" className="now__countdown" />

      <SegmentBar
        value={state.slotProgress}
        segments={36}
        label={`Voortgang ${slot.label}`}
        className="now__bar"
      />

      {upNext && (
        <p className="now__next">
          <span className="u-eyebrow">Hierna</span>
          <span className="now__next-value">
            {upNext.label}
            <span className="u-mono now__next-time">{formatSlotTime(upNext.start)}</span>
          </span>
        </p>
      )}
    </Panel>
  );
};
