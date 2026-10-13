import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

const COLS = 28;
const ROWS = 18;

/** Receding perspective grid — floor and vanishing lines stay below / beside the title plate. */
export const createGridMode = (): ArtworkMode => ({
  id: 'grid',
  draw: ({ ctx, width, height, time, presence, energy, unit }: ArtworkFrame) => {
    const horizon = height * (0.38 + Math.sin(time * 0.18) * 0.03);
    const vanishX = width * (0.5 + Math.sin(time * 0.12) * 0.08);
    const speed = 0.1 + energy * 0.1;
    const travel = ((time * speed) % 1 + 1) % 1;
    const cols = shownCount(COLS, presence, 8);
    const rows = shownCount(ROWS, presence, 5);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.2 * unit);
    ctx.beginPath();

    ctx.moveTo(0, horizon);
    ctx.lineTo(width, horizon);

    const colStride = Math.max(1, Math.round(COLS / cols));
    for (let i = 0; i <= COLS; i += colStride) {
      const t = i / COLS;
      const x = (t - 0.5) * width * 1.6 + vanishX;
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(x, height);
    }

    for (let i = 0; i < rows; i += 1) {
      const depth = ((i / ROWS + travel) % 1) ** 1.65;
      if (depth < 0.12) continue;
      const y = horizon + (height - horizon) * depth;
      const spread = depth * 0.92;
      const inset = (1 - spread) * width * 0.5;
      ctx.moveTo(inset + (vanishX - width * 0.5) * (1 - depth), y);
      ctx.lineTo(width - inset + (vanishX - width * 0.5) * (1 - depth), y);
    }

    ctx.stroke();

    const sunR = Math.min(width, height) * (0.05 + presence * 0.05);
    ctx.beginPath();
    ctx.arc(vanishX, horizon - sunR * 0.2, sunR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    const rays = shownCount(16, presence, 6);
    for (let r = 0; r < rays; r += 1) {
      const angle = (r / 16) * Math.PI + time * 0.15;
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(
        vanishX + Math.cos(angle) * sunR * 2.4,
        horizon - Math.abs(Math.sin(angle)) * sunR * 1.8,
      );
    }
    ctx.stroke();
  },
});
