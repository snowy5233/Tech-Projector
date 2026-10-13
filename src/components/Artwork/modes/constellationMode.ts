import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { isInsidePlate } from '../plate';
import { fbm2d, hash01 } from '../noise';

const COLS = 16;
const ROWS = 9;

/**
 * Twinkling star nodes on a jittered grid, joined into survey lines while the
 * field builds up. Per-node visibility is hash-based, so links stay stable.
 */
export const createConstellationMode = (): ArtworkMode => ({
  id: 'constellation',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const visibleFraction = 0.2 + presence * 0.75;
    const cellW = width / (COLS - 1);
    const cellH = height / (ROWS - 1);
    const jitter = Math.min(cellW, cellH) * 0.22;

    const node = (col: number, row: number): [number, number] => [
      col * cellW + (fbm2d(col * 0.8 + 4.2, row * 0.8 + time * 0.05) - 0.5) * jitter * 2,
      row * cellH + (fbm2d(col * 0.8 + 9.7, row * 0.8 + 1.3 + time * 0.05) - 0.5) * jitter * 2,
    ];

    const visible = (index: number): boolean => hash01(index * 1.93 + 0.4) < visibleFraction;
    const clear = (x: number, y: number): boolean =>
      !isInsidePlate(x, y, width, height, innerClearance);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 0.9 * unit);
    ctx.beginPath();

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const index = row * COLS + col;
        if (!visible(index)) continue;
        const [x, y] = node(col, row);
        if (!clear(x, y)) continue;

        if (col + 1 < COLS && visible(index + 1)) {
          const [rx, ry] = node(col + 1, row);
          if (clear(rx, ry)) {
            ctx.moveTo(x, y);
            ctx.lineTo(rx, ry);
          }
        }
        if (row + 1 < ROWS && visible(index + COLS)) {
          const [bx, by] = node(col, row + 1);
          if (clear(bx, by)) {
            ctx.moveTo(x, y);
            ctx.lineTo(bx, by);
          }
        }
      }
    }

    ctx.stroke();

    // Nodes on top of the lines, pulsing a touch with the room's energy.
    ctx.fillStyle = '#fff';
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const index = row * COLS + col;
        if (!visible(index)) continue;
        const [x, y] = node(col, row);
        if (!clear(x, y)) continue;
        const twinkle =
          0.5 + 0.5 * Math.sin(time * (1.6 + energy * 1.4) + hash01(index * 3.1) * Math.PI * 2);
        const size = Math.max(1, (0.9 + twinkle * 1.6) * unit);
        ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
      }
    }
  },
});
