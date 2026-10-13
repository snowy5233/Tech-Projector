import { formatDateNl, pad2 } from '../../lib/time';
import './clock.css';

export interface ClockProps {
  now: Date;
  showDate?: boolean;
  className?: string;
}

export const Clock = ({ now, showDate = true, className }: ClockProps) => {
  const hours = pad2(now.getHours());
  const minutes = pad2(now.getMinutes());
  const seconds = now.getSeconds();

  return (
    <div className={['clock', className ?? ''].filter(Boolean).join(' ')}>
      {showDate && <p className="u-eyebrow clock__date">{formatDateNl(now)}</p>}

      <div className="clock__time u-mono">
        <span className="clock__hm">
          {hours}
          <span className="clock__colon" aria-hidden="true">
            :
          </span>
          {minutes}
        </span>
        <span className="clock__seconds">{pad2(seconds)}</span>
      </div>
    </div>
  );
};
