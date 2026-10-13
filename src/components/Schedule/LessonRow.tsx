import type { CSSProperties } from 'react';
import { formatSlotTime, type Slot } from '../../data/schedule';
import type { SlotStatus } from '../../hooks/useScheduleState';
import { formatRemainingNl } from '../../lib/time';

export interface LessonRowProps {
  slot: Slot;
  status: SlotStatus;
  /** 0..1 fill of this hour. Done = 1, upcoming = 0, active = elapsed fraction. */
  fill: number;
  remainingSeconds?: number;
  isNext?: boolean;
}

export const LessonRow = ({
  slot,
  status,
  fill,
  remainingSeconds = 0,
  isNext = false,
}: LessonRowProps) => {
  const isActive = status === 'active';

  return (
    <li
      className={[
        'strip__item',
        `strip__item--${slot.kind}`,
        `strip__item--${status}`,
        isNext && !isActive ? 'strip__item--next' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-current={isActive ? 'true' : undefined}
      style={{ '--fill': String(fill) } as CSSProperties}
    >
      {isActive && <span className="strip__meter" aria-hidden="true" />}

      <span className="strip__label">{slot.label}</span>
      <span className="strip__time u-mono">
        {formatSlotTime(slot.start)}–{formatSlotTime(slot.end)}
      </span>
      {isActive && (
        <span className="strip__remaining u-mono">{formatRemainingNl(remainingSeconds)}</span>
      )}
    </li>
  );
};
