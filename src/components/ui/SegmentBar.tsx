import './segment-bar.css';

export interface SegmentBarProps {
  /** 0..1 */
  value: number;
  segments?: number;
  /** Use inside inverted (white) panels. */
  inverted?: boolean;
  label?: string;
  className?: string;
}

/**
 * Blocky progress meter: filled blocks vs outlined blocks. No gradients, so it
 * survives heavy projector blur and stays strictly black/white.
 */
export const SegmentBar = ({
  value,
  segments = 30,
  inverted = false,
  label,
  className,
}: SegmentBarProps) => {
  const filled = Math.round(Math.min(1, Math.max(0, value)) * segments);

  return (
    <div
      className={['segbar', inverted ? 'segbar--invert' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-label={label}
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          key={index}
          className={`segbar__cell${index < filled ? ' segbar__cell--on' : ''}`}
        />
      ))}
    </div>
  );
};
