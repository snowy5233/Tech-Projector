import { Clock } from '../Clock/Clock';
import './screen-header.css';

export interface ScreenHeaderProps {
  now: Date;
}

export const ScreenHeader = ({ now }: ScreenHeaderProps) => (
  <header className="screen-header">
    <Clock now={now} className="screen-header__clock" />
  </header>
);
