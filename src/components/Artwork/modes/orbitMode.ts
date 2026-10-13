import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';
import { hash01 } from '../noise';

const BODY_COUNT = 48;

/**
 * Orbiting 1-bit bodies — rings and planets sit around the title plate from the start.
 */
export const createOrbitMode = (): ArtworkMode => ({
  id: 'orbit',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const cx = width * 0.5;
    const cy = height * 0.52;
    const rMin = innerClearance;
    const rMax = Math.min(width, height) * 0.46;
    const spin = time * (0.12 + energy * 0.08);
    const rings = shownCount(6, presence, 2);

    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.4 * unit);

    for (let ring = 0; ring < rings; ring += 1) {
      const t = rings === 1 ? 0.35 : ring / Math.max(1, rings - 1);
      const radius = rMin + (rMax - rMin) * (0.08 + t * 0.92);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    const bodies = shownCount(BODY_COUNT, presence, 8);
    ctx.beginPath();
    for (let i = 0; i < bodies; i += 1) {
      const ring = Math.floor(hash01(i * 4.1) * rings);
      const t = rings === 1 ? 0.35 : ring / Math.max(1, rings - 1);
      const radius = rMin + (rMax - rMin) * (0.08 + t * 0.92);
      const speed = (0.22 + hash01(i * 9.3) * 0.7) * (hash01(i) > 0.5 ? 1 : -1);
      const angle = spin * speed + hash01(i * 6.6) * Math.PI * 2;
      const wobble = 1 + Math.sin(time * 0.7 + i) * 0.04;
      const x = cx + Math.cos(angle) * radius * wobble;
      const y = cy + Math.sin(angle) * radius * wobble * 0.72;
      const size = (3 + hash01(i * 3.3) * 9) * unit * (0.7 + energy * 0.5);

      ctx.moveTo(x + size, y);
      ctx.arc(x, y, size, 0, Math.PI * 2);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < bodies; i += 1) {
      if (hash01(i * 1.9) > 0.42) continue;

      const ring = Math.floor(hash01(i * 4.1) * rings);
      const t = rings === 1 ? 0.35 : ring / Math.max(1, rings - 1);
      const radius = rMin + (rMax - rMin) * (0.08 + t * 0.92);
      const speed = (0.22 + hash01(i * 9.3) * 0.7) * (hash01(i) > 0.5 ? 1 : -1);
      const angle = spin * speed + hash01(i * 6.6) * Math.PI * 2;
      const wobble = 1 + Math.sin(time * 0.7 + i) * 0.04;
      const x = cx + Math.cos(angle) * radius * wobble;
      const y = cy + Math.sin(angle) * radius * wobble * 0.72;
      const size = (3 + hash01(i * 3.3) * 9) * unit * (0.7 + energy * 0.5) * 0.68;

      ctx.moveTo(x + size, y);
      ctx.arc(x, y, size, 0, Math.PI * 2);
    }
    ctx.fill();
  },
});
