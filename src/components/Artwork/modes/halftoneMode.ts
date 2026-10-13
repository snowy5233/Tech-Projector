import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { isInsidePlate } from '../plate';
import { fbm2d } from '../noise';

/**
 * A breathing halftone dot field. Dots live around the title plate from the start.
 */
export const createHalftoneMode = (): ArtworkMode => ({
  id: 'halftone',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const spacing = Math.max(26, 42 * unit);
    const maxRadius = spacing * 0.38;
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    const cx = width * 0.5;
    const cy = height * 0.5;
    const speed = 0.12 + energy * 0.12;
    const size = 0.5 + presence * 0.5;

    ctx.fillStyle = '#fff';
    ctx.beginPath();

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col * spacing;
        const y = row * spacing;
        if (isInsidePlate(x, y, width, height, innerClearance)) continue;

        const dx = (x - cx) / width;
        const dy = (y - cy) / height;
        const radial = Math.hypot(dx, dy);

        const wave =
          Math.sin(radial * 14 - time * speed * 6) * 0.5 +
          Math.sin((x / width) * 7 + time * speed * 1.7) * 0.25 +
          Math.sin((y / height) * 5 - time * speed * 1.2) * 0.25;

        const field = fbm2d(x / (width * 0.28) + time * 0.05, y / (height * 0.28) - time * 0.04);
        const amount = (wave * 0.55 + 0.5) * 0.65 + field * 0.5;
        const eased = Math.max(0, Math.min(1, amount)) ** 1.6;
        if (eased < 0.52 - presence * 0.22) continue;
        const radius = eased * maxRadius * size;

        if (radius < 0.45) continue;
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
      }
    }

    ctx.fill();
  },
});
