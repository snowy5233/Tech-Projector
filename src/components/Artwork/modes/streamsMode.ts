import type { ArtworkFrame, ArtworkMode } from '../artwork-types';
import { isInsidePlate, shownCount } from '../plate';
import { hash01, noise2d } from '../noise';

const PARTICLE_COUNT = 140;
const TRAIL_LENGTH = 18;

interface Particle {
  x: number;
  y: number;
  trail: number[];
  filled: number;
  speed: number;
}

/**
 * Particles riding a slowly rotating flow field. Trails stay around the title plate.
 */
export const createStreamsMode = (): ArtworkMode => {
  let particles: Particle[] = [];
  let bounds = { width: 0, height: 0 };

  const spawn = (index: number): Particle => ({
    x: hash01(index * 3.7) * bounds.width,
    y: hash01(index * 7.3 + 1.7) * bounds.height,
    trail: [],
    filled: 0,
    speed: 0.55 + hash01(index * 11.1) * 0.9,
  });

  return {
    id: 'streams',
    layout: (width, height) => {
      bounds = { width, height };
      particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => spawn(index));
    },
    draw: ({ ctx, width, height, time, dt, presence, energy, unit, innerClearance }: ArtworkFrame) => {
      if (!particles.length) return;
      bounds = { width, height };

      const step = Math.min(dt, 1 / 20) * 60;
      const scale = 1 / Math.max(320, Math.min(width, height) * 0.55);
      const velocity = (1.35 + energy * 1.1) * Math.max(1, unit);
      const keep = shownCount(PARTICLE_COUNT, presence, 28);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(1, 1.3 * unit);
      ctx.lineCap = 'round';
      ctx.beginPath();

      particles.forEach((particle, index) => {
        const angle =
          noise2d(particle.x * scale, particle.y * scale + time * 0.06) * Math.PI * 4 +
          time * 0.25;

        particle.x += Math.cos(angle) * velocity * particle.speed * step;
        particle.y += Math.sin(angle) * velocity * particle.speed * step;

        const outside =
          particle.x < -20 ||
          particle.x > width + 20 ||
          particle.y < -20 ||
          particle.y > height + 20;

        if (outside) {
          const fresh = spawn(index + Math.floor(time * 13));
          particle.x = fresh.x;
          particle.y = fresh.y;
          particle.trail.length = 0;
          particle.filled = 0;
        }

        particle.trail.push(particle.x, particle.y);
        if (particle.trail.length > TRAIL_LENGTH * 2) particle.trail.splice(0, 2);
        particle.filled = Math.min(particle.filled + 1, TRAIL_LENGTH);

        if (index >= keep) return;
        if (isInsidePlate(particle.x, particle.y, width, height, innerClearance)) return;

        const points = particle.trail;
        if (points.length < 4) return;
        ctx.moveTo(points[0], points[1]);
        for (let p = 2; p < points.length; p += 2) ctx.lineTo(points[p], points[p + 1]);
      });

      ctx.stroke();
      ctx.lineCap = 'butt';
    },
  };
};
