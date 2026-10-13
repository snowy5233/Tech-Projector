import { formatSlotTime, SLOTS, type Slot } from '../../data/schedule';
import './slide.css';

export interface SlideProps {
  title: string;
  range?: string;
  nextSlot?: Slot | null;
  /** Wider tracking for a wordmark like TECHLAB. */
  brand?: boolean;
}

export const Slide = ({ title, range, nextSlot, brand = false }: SlideProps) => (
  <div className={['slide', brand ? 'slide--brand' : ''].filter(Boolean).join(' ')}>
    <div className="slide__hero">
      <h1 className="slide__title">{title}</h1>
      {range && <p className="slide__range u-mono">{range}</p>}
    </div>

    {nextSlot && (
      <p className="slide__next">
        <span className="slide__next-label">Hierna</span>
        <span className="slide__next-value">
          {nextSlot.label}
          <span className="u-mono">{formatSlotTime(nextSlot.start)}</span>
        </span>
      </p>
    )}
  </div>
);

export const slotIndexOf = (slot: Slot | null): number => {
  if (!slot) return 0;
  const index = SLOTS.findIndex((item) => item.id === slot.id);
  return index < 0 ? 0 : index;
};
