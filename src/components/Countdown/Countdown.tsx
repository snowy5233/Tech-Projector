import { formatCountdown } from '../../lib/time';
import './countdown.css';

export type CountdownSize = 'hero' | 'md';

export interface CountdownProps {
  seconds: number;
  size?: CountdownSize;
  label?: string;
  className?: string;
}

/** Big tabular countdown. Re-keyed per second so each tick animates. */
export const Countdown = ({ seconds, size = 'md', label, className }: CountdownProps) => {
  const text = formatCountdown(seconds);
  const wholeSeconds = Math.ceil(seconds);

  return (
    <div
      className={['countdown', `countdown--${size}`, className ?? ''].filter(Boolean).join(' ')}
      aria-live="off"
    >
      {label && <p className="u-eyebrow countdown__label">{label}</p>}
      <p className="countdown__value u-mono" key={wholeSeconds}>
        {text}
      </p>
    </div>
  );
};
