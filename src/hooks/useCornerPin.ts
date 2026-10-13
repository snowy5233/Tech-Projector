import { useCallback } from 'react';
import {
  DEFAULT_NORMALIZED_QUAD,
  isDefaultQuad,
  isValidQuad,
  type Point,
  type Quad,
} from '../lib/homography';
import { clamp } from '../lib/time';
import { useLocalStorageState } from './useLocalStorageState';

const STORAGE_KEY = 'tech-projector:corner-pin';
/** Corners may travel a bit outside the screen so keystone correction has room. */
const LIMIT = 0.35;

export const useCornerPin = () => {
  const [quad, setQuad, reset] = useLocalStorageState<Quad>(
    STORAGE_KEY,
    DEFAULT_NORMALIZED_QUAD,
    isValidQuad,
  );

  const moveCorner = useCallback(
    (index: number, next: Point) => {
      setQuad(
        (previous) =>
          previous.map((point, i) =>
            i === index
              ? { x: clamp(next.x, -LIMIT, 1 + LIMIT), y: clamp(next.y, -LIMIT, 1 + LIMIT) }
              : point,
          ) as Quad,
      );
    },
    [setQuad],
  );

  const nudgeCorner = useCallback(
    (index: number, deltaX: number, deltaY: number) => {
      setQuad(
        (previous) =>
          previous.map((point, i) =>
            i === index
              ? {
                  x: clamp(point.x + deltaX, -LIMIT, 1 + LIMIT),
                  y: clamp(point.y + deltaY, -LIMIT, 1 + LIMIT),
                }
              : point,
          ) as Quad,
      );
    },
    [setQuad],
  );

  return {
    quad,
    moveCorner,
    nudgeCorner,
    reset,
    isDefault: isDefaultQuad(quad),
  };
};
