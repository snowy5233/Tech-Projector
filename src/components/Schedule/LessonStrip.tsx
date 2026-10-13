import { SLOTS } from '../../data/schedule';
import type { ScheduleState } from '../../hooks/useScheduleState';
import { LessonRow } from './LessonRow';
import './lesson-strip.css';

export interface LessonStripProps {
  state: ScheduleState;
  className?: string;
}

export const LessonStrip = ({ state, className }: LessonStripProps) => {
  const nextId = SLOTS.find((slot) => state.statusOf(slot) === 'upcoming')?.id;

  return (
    <ol className={['strip', className ?? ''].filter(Boolean).join(' ')} aria-label="Lesrooster">
      {SLOTS.map((slot) => {
        const isActive = state.currentSlot?.id === slot.id;

        return (
          <LessonRow
            key={slot.id}
            slot={slot}
            status={state.statusOf(slot)}
            fill={state.fillOf(slot)}
            remainingSeconds={isActive ? state.secondsUntilChange : 0}
            isNext={slot.id === nextId}
          />
        );
      })}
    </ol>
  );
};
