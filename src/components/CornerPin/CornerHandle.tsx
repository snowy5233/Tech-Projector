import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { CORNER_LABELS, type Point } from '../../lib/homography';

export interface CornerHandleProps {
  index: number;
  /** Position in viewport pixels. */
  position: Point;
  viewport: { width: number; height: number };
  onMove: (index: number, next: Point) => void;
  onNudge: (index: number, deltaX: number, deltaY: number) => void;
}

/** Draggable projection corner. Also keyboard-nudgeable for pixel-precise keystone. */
export const CornerHandle = ({
  index,
  position,
  viewport,
  onMove,
  onNudge,
}: CornerHandleProps) => {
  const draggingRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    event.stopPropagation();
    onMove(index, {
      x: event.clientX / viewport.width,
      y: event.clientY / viewport.height,
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    event.stopPropagation();
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = (event.shiftKey ? 10 : 1);
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-step / viewport.width, 0],
      ArrowRight: [step / viewport.width, 0],
      ArrowUp: [0, -step / viewport.height],
      ArrowDown: [0, step / viewport.height],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    event.stopPropagation();
    onNudge(index, delta[0], delta[1]);
  };

  const percent = (value: number) => `${Math.round(value)}`;

  return (
    <button
      type="button"
      className="pin-handle"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      aria-label={`Projectiehoek ${CORNER_LABELS[index]} verplaatsen`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="pin-handle__ring" aria-hidden="true" />
      <span className="pin-handle__caption u-mono" aria-hidden="true">
        {CORNER_LABELS[index]} · {percent(position.x)},{percent(position.y)}
      </span>
    </button>
  );
};
