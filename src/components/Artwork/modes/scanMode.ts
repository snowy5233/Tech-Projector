import type { ArtworkFrame, ArtworkMode } from '../artwork-types';

const SPACING_UNITS = 5;
const BAND_UNITS = 80;

/**
 * CRT raster: hairline scan lines with a solid bright bar rolling down the
 * screen, inverted to black lines while it passes. Rows break around the plate.
 */
export const createScanMode = (): ArtworkMode => ({
  id: 'scan',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const spacing = Math.max(4, SPACING_UNITS * unit);
    const bandHeight = Math.max(spacing * 4, BAND_UNITS * unit * (0.5 + energy * 0.7));
    const travel = height + bandHeight;
    const duration = Math.max(5, 11 - energy * 5);
    const bands = 1 + Math.round(presence * 2);

    const cx = width * 0.5;
    const cy = height * 0.5;

    /** Half-width of the plate chord at this row, 0 when the row misses the plate. */
    const chord = (y: number): number => {
      const dy = Math.abs(y - cy);
      return dy < innerClearance ? Math.sqrt(innerClearance * innerClearance - dy * dy) : 0;
    };

    const segments = (y: number): Array<[number, number]> => {
      const skip = chord(y);
      if (skip <= 0) return [[0, width]];
      return [
        [0, cx - skip],
        [cx + skip, width],
      ];
    };

    const tops = Array.from(
      { length: bands },
      (_, b) => ((time / duration + b / bands) % 1) * travel - bandHeight,
    );
    const inBand = (y: number): boolean => tops.some((top) => y >= top && y < top + bandHeight);

    // Pass 1: white raster — thin lines outside the bar, solid fill inside it.
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.15 * unit);
    ctx.beginPath();
    for (let y = spacing * 0.5; y < height; y += spacing) {
      const bright = inBand(y);
      for (const [x0, x1] of segments(y)) {
        if (x1 - x0 < 1) continue;
        if (bright) {
          ctx.fillRect(x0, y - spacing * 0.5, x1 - x0, spacing);
        } else {
          ctx.moveTo(x0, y);
          ctx.lineTo(x1, y);
        }
      }
    }
    ctx.stroke();

    // Pass 2: black hairlines inside the bar, so it reads as an inverted raster.
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    for (let y = spacing * 0.5; y < height; y += spacing) {
      if (!inBand(y)) continue;
      for (const [x0, x1] of segments(y)) {
        if (x1 - x0 < 1) continue;
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
      }
    }
    ctx.stroke();
  },
});
