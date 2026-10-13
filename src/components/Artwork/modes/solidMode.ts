import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { shownCount } from '../plate';

const SEGMENTS = 420;
const TUBE_SIDES = 7;

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const knotPoint = (t: number, p: number, q: number): Vec3 => {
  const r = Math.cos(q * t) + 2;
  return {
    x: r * Math.cos(p * t),
    y: r * Math.sin(p * t),
    z: -Math.sin(q * t),
  };
};

const rotate = (point: Vec3, ax: number, ay: number): Vec3 => {
  const cosY = Math.cos(ay);
  const sinY = Math.sin(ay);
  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;

  const cosX = Math.cos(ax);
  const sinX = Math.sin(ax);
  const y2 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
};

/** Rotating wireframe torus knot, scaled so it reads around the title plate. */
export const createSolidMode = (): ArtworkMode => ({
  id: 'solid',
  draw: ({ ctx, width, height, time, presence, energy, unit }: ArtworkFrame) => {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width, height) * 0.24;
    const focal = 6.2;
    const ax = time * (0.09 + energy * 0.05);
    const ay = time * (0.12 + energy * 0.06);
    const p = 2;
    const q = 3;
    const sides = shownCount(TUBE_SIDES, presence, 2);

    const project = (point: Vec3) => {
      const rotated = rotate(point, ax, ay);
      const depth = focal / (focal + rotated.z);
      return {
        x: cx + rotated.x * scale * depth,
        y: cy + rotated.y * scale * depth,
        depth,
      };
    };

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 1.5 * unit);

    for (let side = 0; side < sides; side += 1) {
      const offset = (side / TUBE_SIDES) * Math.PI * 2;
      ctx.beginPath();

      for (let i = 0; i <= SEGMENTS; i += 1) {
        const t = (i / SEGMENTS) * Math.PI * 2;
        const base = knotPoint(t, p, q);
        const ripple = 0.34 + Math.sin(t * 6 + time * 0.55) * 0.05;
        const point: Vec3 = {
          x: base.x + Math.cos(offset + t * 2) * ripple,
          y: base.y + Math.sin(offset + t * 2) * ripple,
          z: base.z + Math.cos(offset) * ripple,
        };
        const { x, y } = project(point);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    }
  },
});
