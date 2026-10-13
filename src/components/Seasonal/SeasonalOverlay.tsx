import { useEffect, useRef } from 'react';

export type Season = 'lente' | 'zomer' | 'herfst' | 'winter';

export const SEASONS: Season[] = ['lente', 'zomer', 'herfst', 'winter'];

/** Meteorological seasons: lente mrt–mei, zomer jun–aug, herfst sep–nov, winter dec–feb. */
export const seasonOf = (date: Date): Season => {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'lente';
  if (month >= 5 && month <= 7) return 'zomer';
  if (month >= 8 && month <= 10) return 'herfst';
  return 'winter';
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  swaySpeed: number;
  spin: number;
  spinSpeed: number;
  alpha: number;
}

const MAX_PIXEL_RATIO = 1.5;

const spawn = (width: number, height: number, season: Season): Particle => ({
  x: Math.random() * width,
  y: season === 'zomer' ? height + Math.random() * height : -Math.random() * height,
  size: 2 + Math.random() * 4,
  speed: season === 'zomer' ? -(6 + Math.random() * 10) : 12 + Math.random() * 26,
  sway: Math.random() * Math.PI * 2,
  swaySpeed: 0.4 + Math.random() * 0.8,
  spin: Math.random() * Math.PI * 2,
  spinSpeed: (Math.random() - 0.5) * 2.4,
  alpha: 0.22 + Math.random() * 0.5,
});

export interface SeasonalOverlayProps {
  season: Season;
}

/**
 * Monochrome seasonal particle layer — vallende bladeren (herfst), sneeuw
 * (winter), bloesem (lente) en stijgende vonken (zomer) — bovenop het
 * artwork, onder de interface.
 */
export const SeasonalOverlay = ({ season }: SeasonalOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seasonRef = useRef(season);
  if (seasonRef.current !== season) {
    seasonRef.current = season;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeScale = reducedMotion ? 0.35 : 1;

    let width = 0;
    let height = 0;
    let ratio = 1;
    let frameId = 0;
    let previous = 0;
    let particles: Particle[] = [];
    let currentSeason = seasonRef.current;

    const targetCount = () =>
      Math.max(14, Math.min(90, Math.round((width * height) / 26000)));

    const repopulate = () => {
      particles = Array.from({ length: targetCount() }, () =>
        spawn(width, height, currentSeason),
      );
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      repopulate();
    };

    const drawParticle = (p: Particle, time: number) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#fff';
      ctx.translate(p.x, p.y);
      if (currentSeason === 'herfst') {
        ctx.rotate(p.spin);
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size, 0, 0, p.size);
        ctx.quadraticCurveTo(-p.size, 0, 0, -p.size);
        ctx.fill();
      } else if (currentSeason === 'winter') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentSeason === 'lente') {
        ctx.rotate(p.spin);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const flicker = 0.55 + 0.45 * Math.sin(time * 2.2 + p.sway);
        ctx.globalAlpha = p.alpha * flicker;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.36, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const render = (now: number) => {
      frameId = requestAnimationFrame(render);
      resize();
      if (previous === 0) previous = now;
      const dt = Math.min((now - previous) / 1000, 0.1) * timeScale;
      previous = now;
      const time = now / 1000;

      if (seasonRef.current !== currentSeason) {
        currentSeason = seasonRef.current;
        repopulate();
      }

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const wanted = targetCount();
      if (particles.length > wanted) particles.length = wanted;
      while (particles.length < wanted) particles.push(spawn(width, height, currentSeason));

      for (const p of particles) {
        p.sway += p.swaySpeed * dt;
        p.spin += p.spinSpeed * dt;
        p.x += Math.sin(p.sway) * 22 * dt;
        p.y += p.speed * dt;
        if (currentSeason === 'zomer' ? p.y < -20 : p.y > height + 20) {
          Object.assign(p, spawn(width, height, currentSeason));
          p.y = currentSeason === 'zomer' ? height + 10 : -10;
          p.x = Math.random() * width;
        }
        drawParticle(p, time);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
        return;
      }
      previous = performance.now();
      frameId = requestAnimationFrame(render);
    };

    resize();
    frameId = requestAnimationFrame(render);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="seasonal-canvas" aria-hidden="true" />;
};
