import type { ReactNode } from 'react';
import './panel.css';

export type PanelVariant = 'solid' | 'invert' | 'ghost';

export interface PanelProps {
  /** Small uppercase label in the panel header. */
  label?: ReactNode;
  /** Optional right-aligned header slot (time, counter, marker). */
  meta?: ReactNode;
  variant?: PanelVariant;
  /** Dashed border reads as "not now" without needing grey. */
  dashed?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Framed content block — the single building block for every card on screen. */
export const Panel = ({
  label,
  meta,
  variant = 'solid',
  dashed = false,
  className,
  children,
}: PanelProps) => (
  <section
    className={[
      'panel',
      `panel--${variant}`,
      dashed ? 'panel--dashed' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {(label || meta) && (
      <header className="panel__header">
        {label ? <span className="u-eyebrow panel__label">{label}</span> : <span />}
        {meta ? <span className="u-eyebrow panel__meta u-mono">{meta}</span> : null}
      </header>
    )}
    <div className="panel__body">{children}</div>
  </section>
);
