import { formatSlotTime, type Slot } from '../../data/schedule';
import { formatRemainingNl, pad2 } from '../../lib/time';
import type { SlotStatus } from '../../hooks/useScheduleState';
import { SegmentBar } from '../ui/SegmentBar';
import './slot-row.css';

export interface SlotRowProps {
  slot: Slot;
  status: SlotStatus;
  /** 0..1, only used when status is "active". */
  progress?: number;
  /** Seconds left in this slot, only used when status is "active". */
  remainingSeconds?: number;
}

/** One line of the timetable. Inverted while it is the current slot. */
export const SlotRow = ({ slot, status, progress = 0, remainingSeconds = 0 }: SlotRowProps) => {
  const isLesson = slot.kind === 'lesson';
  const isActive = status === 'active';

  return (
    <li
      className={[
        'slot',
        `slot--${slot.kind}`,
        `slot--${status}`,
      ].join(' ')}
      aria-current={isActive ? 'true' : undefined}
    >
      <span className="slot__index u-mono">{isLesson ? pad2(slot.lesson ?? 0) : '––'}</span>

      <span className="slot__label">{slot.label}</span>

      <span className="slot__time u-mono">
        {formatSlotTime(slot.start)}
        <span className="slot__dash">–</span>
        {formatSlotTime(slot.end)}
      </span>

      <span className="slot__tail">
        {isActive ? (
          <span className="slot__live">
            <SegmentBar
              value={progress}
              segments={14}
              inverted
              label={`Voortgang ${slot.label}`}
              className="slot__bar"
            />
            <span className="slot__remaining u-mono">{formatRemainingNl(remainingSeconds)}</span>
          </span>
        ) : (
          <span className="slot__marker" aria-hidden="true" />
        )}
      </span>
    </li>
  );
};
