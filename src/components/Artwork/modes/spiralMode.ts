import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

const TURNS = 18;
const STEPS = 720;

/** A spinning Archimedean spiral that begins outside the title plate. */
export const createSpiralMode = (): ArtworkMode => ({
  id: 'spiral',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const maxR = Math.hypot(width, height) * 0.42;
    const spin = time * (0.16 + energy * 0.1);
    const t0 = Math.min(0.92, innerClearance / Math.max(1, maxR));
    const t1 = Math.min(1, t0 + 0.22 + presence * 0.4);
    const arms = shownCount(3, presence, 1);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.5 * unit);

    for (let arm = 0; arm < arms; arm += 1) {
      const offset = (arm / 3) * Math.PI * 2 + spin;
      ctx.beginPath();
      const start = Math.floor(STEPS * t0);
      const limit = Math.floor(STEPS * t1);
      for (let i = start; i <= limit; i += 1) {
        const t = i / STEPS;
        const angle = offset + t * Math.PI * 2 * TURNS;
        const radius = t * maxR;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === start) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  },
});
