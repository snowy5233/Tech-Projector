import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { isInsidePlate, shownCount } from '../plate';
import { fbm2d } from '../noise';

const ROWS = 24;

/**
 * Slowly breathing horizon lines warped by value noise — dunes, not a grid.
 * Segments are dropped where they would cross the title plate.
 */
export const createWavesMode = (): ArtworkMode => ({
  id: 'waves',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const rows = shownCount(ROWS, presence, 6);
    const amplitude = Math.min(width, height) * (0.035 + energy * 0.05);
    const drift = time * (0.14 + energy * 0.12);
    const step = Math.max(28, width / 34);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.3 * unit);
    ctx.beginPath();

    for (let row = 0; row < rows; row += 1) {
      const baseY = ((row + 0.5) / rows) * height;
      let drawing = false;

      for (let x = -step; x <= width + step; x += step) {
        const warp = fbm2d(x * 0.004 + drift, row * 0.37 + time * 0.045) - 0.5;
        const y = baseY + warp * amplitude * 2;

        if (isInsidePlate(x, y, width, height, innerClearance)) {
          drawing = false;
          continue;
        }
        if (drawing) {
          ctx.lineTo(x, y);
        } else {
          ctx.moveTo(x, y);
          drawing = true;
        }
      }
    }

    ctx.stroke();
  },
});
