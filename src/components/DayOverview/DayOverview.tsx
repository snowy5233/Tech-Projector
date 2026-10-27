import { formatSlotTime, SLOTS, type Slot } from '../../data/schedule';
import type { ScheduleState } from '../../hooks/useScheduleState';
import './day-overview.css';

/** "mm:ss:hh" — minuten : seconden : honderdsten. */
const formatRemaining = (totalSeconds: number): string => {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = Math.floor(clamped % 60);
  const hundredths = Math.round((clamped - Math.floor(clamped)) * 100) % 100;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}:${pad(hundredths)}`;
};

export interface DayOverviewProps {
  state: ScheduleState;
}

/**
 * Volledige dagoverzicht rechtsonder: alle lesuren en pauzes, met het
 * huidige uur gemarkeerd en de resterende seconden ernaast.
 */
export const DayOverview = ({ state }: DayOverviewProps) => {
  const statusOf = state.statusOf;
  const current = state.currentSlot;
  const remaining = state.secondsUntilChange;
  return (
    <ul className="day-overview u-mono">
      {SLOTS.map((slot: Slot) => {
        const status = statusOf(slot);
        const isCurrent = current?.id === slot.id;
        return (
          <li
            key={slot.id}
            className={[
              'day-overview__row',
              `day-overview__row--${status}`,
              isCurrent ? 'day-overview__row--current' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="day-overview__label">{slot.label}</span>
            <span className="day-overview__time">
              {formatSlotTime(slot.start)}–{formatSlotTime(slot.end)}
            </span>
            {isCurrent && (
              <span className="day-overview__remaining">
                {formatRemaining(remaining)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};
