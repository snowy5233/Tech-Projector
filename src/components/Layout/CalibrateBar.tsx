import { Button } from '../ui/Button';
import './calibrate-bar.css';

export interface CalibrateBarProps {
  visible: boolean;
  canReset: boolean;
  isFullscreen: boolean;
  onReset: () => void;
}

/** Calibration chrome: only while the mouse is moving, never during a quiet projection. */
export const CalibrateBar = ({
  visible,
  canReset,
  isFullscreen,
  onReset,
}: CalibrateBarProps) => (
  <div
    className={`calibrate${visible ? ' calibrate--visible' : ''}`}
    data-ui-layer="calibrate"
  >
    {!isFullscreen && (
      <p className="u-eyebrow calibrate__hint">Klik ergens voor volledig scherm</p>
    )}
    {canReset && (
      <Button
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          onReset();
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        Hoeken resetten
      </Button>
    )}
  </div>
);
