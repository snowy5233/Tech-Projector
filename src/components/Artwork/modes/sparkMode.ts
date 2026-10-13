import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { isInsidePlate, shownCount } from '../plate';
import { hash01 } from '../noise';

const BURSTS = 9;
const RAYS = 16;

/** Radial spark bursts — placed around the title plate, never under it. */
export const createSparkMode = (): ArtworkMode => ({
  id: 'spark',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.35 * unit);
    ctx.beginPath();

    const keep = shownCount(BURSTS, presence, 4);
    const midx = width * 0.5;
    const midy = height * 0.5;

    for (let b = 0; b < keep; b += 1) {
      const life = ((time * (0.16 + energy * 0.08) + hash01(b * 4.2)) % 1);
      let bx = hash01(b * 7.1) * width;
      let by = hash01(b * 3.9 + 2) * height;
      if (isInsidePlate(bx, by, width, height, innerClearance)) {
        const dx = bx - midx;
        const dy = by - midy;
        const dist = Math.hypot(dx, dy) || 1;
        const scale = (innerClearance * 1.15) / dist;
        bx = midx + dx * scale;
        by = midy + dy * scale;
      }
      const reach = Math.min(width, height) * (0.08 + hash01(b) * 0.16) * (0.35 + life * 0.65);

      for (let r = 0; r < RAYS; r += 1) {
        const angle = (r / RAYS) * Math.PI * 2 + time * 0.1;
        const inner = reach * 0.15;
        ctx.moveTo(bx + Math.cos(angle) * inner, by + Math.sin(angle) * inner);
        ctx.lineTo(bx + Math.cos(angle) * reach, by + Math.sin(angle) * reach);
      }
    }

    ctx.stroke();
  },
});
