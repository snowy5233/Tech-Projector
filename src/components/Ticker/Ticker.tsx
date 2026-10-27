import './ticker.css';

export interface TickerProps {
  text: string;
}

/** Scrollende mededeling onderaan het scherm. */
export const Ticker = ({ text }: TickerProps) => (
  <div className="ticker" aria-hidden="true">
    <p className="ticker__text u-mono">{text}</p>
  </div>
);
