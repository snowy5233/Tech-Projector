import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

/** Rotating radar sweep with range rings that sit around the title plate. */
export const createRadarMode = (): ArtworkMode => ({
  id: 'radar',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rMin = innerClearance;
    const rMax = Math.hypot(width, height) * 0.52;
    const sweep = time * (0.32 + energy * 0.16);
    const rings = shownCount(8, presence, 3);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.4 * unit);
    ctx.beginPath();
    for (let i = 0; i < rings; i += 1) {
      const t = rings === 1 ? 0.4 : i / Math.max(1, rings - 1);
      const r = rMin + (rMax - rMin) * (0.06 + t * 0.94);
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    }
    ctx.stroke();

    ctx.beginPath();
    const ticks = shownCount(48, presence, 12);
    for (let i = 0; i < ticks; i += 1) {
      const a = (i / 48) * Math.PI * 2;
      const inner = rMax * (i % 4 === 0 ? 0.88 : 0.94);
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * rMax, cy + Math.sin(a) * rMax);
    }
    ctx.stroke();

    const beam = rMin + (rMax - rMin) * (0.55 + presence * 0.4);
    ctx.beginPath();
    ctx.lineWidth = Math.max(2, 3.2 * unit);
    ctx.moveTo(cx + Math.cos(sweep) * rMin, cy + Math.sin(sweep) * rMin);
    ctx.lineTo(cx + Math.cos(sweep) * beam, cy + Math.sin(sweep) * beam);
    ctx.stroke();
  },
});
