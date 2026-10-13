import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

const RING_COUNT = 26;
const SPOKES = 24;

/** Wireframe perspective tunnel — rings sit around the title plate, never inside it. */
export const createTunnelMode = (): ArtworkMode => ({
  id: 'tunnel',
  draw: ({ ctx, width, height, time, presence, energy, unit, innerClearance }: ArtworkFrame) => {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const reach = Math.hypot(width, height) * 0.62;
    const speed = 0.08 + energy * 0.06;
    const twist = time * (0.07 + energy * 0.05);
    const rMin = innerClearance;
    const rMax = reach * (0.5 + presence * 0.45);
    const keep = shownCount(RING_COUNT, presence, 5);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.6 * unit);
    ctx.beginPath();

    let drawn = 0;
    for (let i = 0; i < RING_COUNT; i += 1) {
      const depth = ((i / RING_COUNT + time * speed) % 1 + 1) % 1;
      const scale = depth ** 2.4;
      const radius = scale * reach;
      if (radius < rMin || radius > rMax) continue;
      drawn += 1;
      if (drawn > keep) continue;

      const rotation = twist + i * 0.22;
      const squash = 1 + Math.sin(time * 0.5 + i * 0.35) * 0.1;

      for (let s = 0; s <= SPOKES; s += 1) {
        const angle = rotation + (s / SPOKES) * Math.PI * 2;
        const wobble = 1 + Math.sin(angle * 3 + time * 0.4) * 0.06;
        const x = cx + Math.cos(angle) * radius * wobble;
        const y = cy + Math.sin(angle) * radius * wobble * squash;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }

    const spokeCount = shownCount(SPOKES / 2, presence, 6);
    for (let s = 0; s < SPOKES; s += 2) {
      if (s / 2 >= spokeCount) continue;
      const angle = twist + (s / SPOKES) * Math.PI * 2;
      ctx.moveTo(cx + Math.cos(angle) * rMin, cy + Math.sin(angle) * rMin);
      ctx.lineTo(cx + Math.cos(angle) * rMax, cy + Math.sin(angle) * rMax);
    }

    ctx.stroke();
  },
});
