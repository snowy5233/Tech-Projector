import { formatSlotTime, SCHOOL_DAY_END, SCHOOL_DAY_START } from '../../data/schedule';
import { SegmentBar } from '../ui/SegmentBar';
import './screen-footer.css';

export interface ScreenFooterProps {
  dayProgress: number;
}

export const ScreenFooter = ({ dayProgress }: ScreenFooterProps) => (
  <footer className="screen-footer">
    <span className="u-mono screen-footer__edge">{formatSlotTime(SCHOOL_DAY_START)}</span>
    <SegmentBar value={dayProgress} segments={48} label="Voortgang van de lesdag" />
    <span className="u-mono screen-footer__edge">{formatSlotTime(SCHOOL_DAY_END)}</span>
  </footer>
);
