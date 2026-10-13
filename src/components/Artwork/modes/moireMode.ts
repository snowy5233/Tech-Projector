import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

const RINGS = 14;

/**
 * Two drifting sets of concentric rings. Rings start outside the title plate.
 */
export const createMoireMode = (): ArtworkMode => ({
  id: 'moire',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const span = Math.min(width, height);
    const rMin = innerClearance * 0.85;
    const rMax = span * (0.32 + presence * 0.16);
    const gap = Math.max(18, (rMax - rMin) / Math.max(1, RINGS - 1));
    const drift = 0.06 + energy * 0.05;
    const count = shownCount(RINGS, presence, 4);

    const centers = [
      {
        x: width * (0.5 + Math.sin(time * drift) * 0.12),
        y: height * (0.5 + Math.cos(time * drift * 0.83) * 0.1),
      },
      {
        x: width * (0.5 - Math.sin(time * drift * 0.71 + 1.2) * 0.14),
        y: height * (0.5 - Math.cos(time * drift * 0.61) * 0.11),
      },
    ];

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.15 * unit);

    centers.forEach((center, centerIndex) => {
      ctx.beginPath();
      const phase = time * (2.4 + centerIndex * 0.9);

      for (let i = 0; i < count; i += 1) {
        const radius = rMin + ((i * gap + phase) % Math.max(gap, rMax - rMin));
        if (radius < rMin || radius > rMax) continue;
        ctx.moveTo(center.x + radius, center.y);
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      }

      ctx.stroke();
    });
  },
});
