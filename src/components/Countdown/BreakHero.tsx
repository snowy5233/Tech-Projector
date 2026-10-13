import { formatSlotTime, type Slot } from '../../data/schedule';
import { Countdown } from './Countdown';
import './break-hero.css';

export interface BreakHeroProps {
  kicker: string;
  seconds: number;
  nextLesson?: Slot | null;
  className?: string;
}

export const BreakHero = ({ kicker, seconds, nextLesson, className }: BreakHeroProps) => (
  <div className={['break-hero', className ?? ''].filter(Boolean).join(' ')}>
    <div className="break-hero__plaque">
      <p className="break-hero__kicker">{kicker}</p>
      <Countdown seconds={seconds} size="hero" className="break-hero__count" />
      {nextLesson && (
        <p className="break-hero__next">
          {nextLesson.label}
          <span className="u-mono">{formatSlotTime(nextLesson.start)}</span>
        </p>
      )}
    </div>
  </div>
);
