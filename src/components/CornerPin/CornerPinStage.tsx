import { useMemo, type ReactNode } from 'react';
import { denormalizeQuad, quadToMatrix3d, type Point, type Quad } from '../../lib/homography';
import { useViewportSize } from '../../hooks/useViewportSize';
import { CornerHandle } from './CornerHandle';
import './corner-pin.css';

export interface CornerPinStageProps {
  /** Normalized (0..1) corner positions: TL, TR, BR, BL. */
  quad: Quad;
  onMove: (index: number, next: Point) => void;
  onNudge: (index: number, deltaX: number, deltaY: number) => void;
  /** Handles + alignment guides only appear while the mouse is moving. */
  showHandles: boolean;
  children: ReactNode;
}

/**
 * Wraps the whole page in a projective (corner-pin / keystone) transform so the
 * projection can be lined up exactly with the wall.
 */
export const CornerPinStage = ({
  quad,
  onMove,
  onNudge,
  showHandles,
  children,
}: CornerPinStageProps) => {
  const viewport = useViewportSize();
  const pixelQuad = useMemo(
    () => denormalizeQuad(quad, viewport.width, viewport.height),
    [quad, viewport.width, viewport.height],
  );
  const transform = useMemo(
    () => quadToMatrix3d(pixelQuad, viewport.width, viewport.height),
    [pixelQuad, viewport.width, viewport.height],
  );

  return (
    <div className="pin">
      <div
        className={`pin__content${showHandles ? ' pin__content--calibrating' : ''}`}
        style={{ width: `${viewport.width}px`, height: `${viewport.height}px`, transform }}
      >
        {children}
        <div className="pin__guides" aria-hidden="true">
          <span className="pin__guide pin__guide--v" />
          <span className="pin__guide pin__guide--h" />
        </div>
      </div>

      <div
        className={`pin__handles${showHandles ? ' pin__handles--visible' : ''}`}
        data-ui-layer="corner-pin"
      >
        {pixelQuad.map((point, index) => (
          <CornerHandle
            key={index}
            index={index}
            position={point}
            viewport={viewport}
            onMove={onMove}
            onNudge={onNudge}
          />
        ))}
      </div>
    </div>
  );
};
