import type { SchedulePhase, ScheduleState } from '../../hooks/useScheduleState';
import { BreakHero } from '../Countdown/BreakHero';
import './phase-hero.css';

export interface PhaseHeroProps {
  phase: SchedulePhase;
  state: ScheduleState;
}

const COPY: Record<Exclude<SchedulePhase, 'lesson'>, string> = {
  break: 'Pauze',
  before: 'Goeiemorgen',
  after: 'Klaar',
  weekend: 'Weekend',
};

export const PhaseHero = ({ phase, state }: PhaseHeroProps) => {
  if (phase === 'lesson') return null;

  const title = COPY[phase];
  const showCountdown = phase === 'break' || phase === 'before';

  if (showCountdown) {
    return (
      <BreakHero kicker={title} seconds={state.secondsUntilChange} nextLesson={state.nextLesson} />
    );
  }

  return (
    <div className="phase-hero">
      <p className="phase-hero__title">{title}</p>
    </div>
  );
};
