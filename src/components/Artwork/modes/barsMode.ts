import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

const COUNT = 28;

/** Vertical bars along the bottom edge, spread across the width from the start. */
export const createBarsMode = (): ArtworkMode => ({
  id: 'bars',
  draw: ({ ctx, width, height, time, presence, energy, unit }: ArtworkFrame) => {
    const gap = width / COUNT;
    const floor = height * 0.92;
    const ceiling = height * 0.08;
    const range = floor - ceiling;
    const speed = 0.72 + energy * 0.4;
    const active = shownCount(COUNT, presence, 8);
    const stride = Math.max(1, Math.round(COUNT / active));
    const lift = 0.28 + presence * 0.45;

    ctx.fillStyle = '#fff';
    ctx.beginPath();

    for (let i = 0; i < COUNT; i += stride) {
      const wave =
        0.35 +
        0.35 * Math.sin(time * speed + i * 0.55) +
        0.25 * Math.sin(time * speed * 0.37 + i * 1.3);
      const h = Math.max(range * 0.08, range * wave * lift);
      const x = i * gap + gap * 0.18;
      const w = gap * 0.64;
      ctx.rect(x, floor - h, w, h);
    }

    ctx.fill();
    ctx.lineWidth = Math.max(1, 1.2 * unit);
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, floor);
    ctx.lineTo(width, floor);
    ctx.stroke();
  },
});
