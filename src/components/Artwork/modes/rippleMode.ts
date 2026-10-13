import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

const RINGS = 22;

/** Expanding diamond ripples that start outside the title plate. */
export const createRippleMode = (): ArtworkMode => ({
  id: 'ripple',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rMin = innerClearance;
    const rMax = Math.hypot(width, height) * 0.48;
    const span = Math.max(8, rMax - rMin);
    const speed = 18 + energy * 10;
    const phase = time * speed;
    const count = shownCount(RINGS, presence, 4);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.4 * unit);
    ctx.beginPath();

    for (let i = 0; i < count; i += 1) {
      const t = ((i / RINGS) * span + phase) % span;
      const r = rMin + t;
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
    }

    ctx.stroke();
  },
});
