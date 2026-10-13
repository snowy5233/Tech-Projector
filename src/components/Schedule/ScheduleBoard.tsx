import { SLOTS } from '../../data/schedule';
import type { ScheduleState } from '../../hooks/useScheduleState';
import { Panel } from '../ui/Panel';
import { SlotRow } from './SlotRow';
import './schedule-board.css';

export interface ScheduleBoardProps {
  state: ScheduleState;
  className?: string;
}

/** Full timetable: all 9 lesson blocks plus the breaks, always in view. */
export const ScheduleBoard = ({ state, className }: ScheduleBoardProps) => (
  <Panel
    label="Lesrooster"
    meta="9 lesuren"
    className={['board', className ?? ''].filter(Boolean).join(' ')}
  >
    <ol className="board__list">
      {SLOTS.map((slot) => {
        const status = state.statusOf(slot);
        return (
          <SlotRow
            key={slot.id}
            slot={slot}
            status={status}
            progress={status === 'active' ? state.slotProgress : 0}
            remainingSeconds={status === 'active' ? state.secondsUntilChange : 0}
          />
        );
      })}
    </ol>
  </Panel>
);
