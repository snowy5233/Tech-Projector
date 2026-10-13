import type { ReactNode } from 'react';
import './badge.css';

export type BadgeVariant = 'solid' | 'outline';

export interface BadgeProps {
  variant?: BadgeVariant;
  /** Slow blink to draw the eye — used for the live "NU" marker. */
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}

export const Badge = ({ variant = 'outline', pulse = false, className, children }: BadgeProps) => (
  <span
    className={['badge', `badge--${variant}`, pulse ? 'badge--pulse' : '', className ?? '']
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </span>
);
