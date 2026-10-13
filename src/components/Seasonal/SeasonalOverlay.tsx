import { useEffect, useRef } from 'react';
import './seasonal.css';

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
  size: 7 + Math.random() * 9,
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
      Math.max(10, Math.min(48, Math.round((width * height) / 42000)));

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
        const w = p.size;
        const h = p.size * 1.25;
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.quadraticCurveTo(w, -h * 0.45, 0, h);
        ctx.quadraticCurveTo(-w, -h * 0.45, 0, -h);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = Math.max(0.5, p.size * 0.07);
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.92);
        ctx.lineTo(0, h * 0.9);
        ctx.moveTo(0, -h * 0.25);
        ctx.lineTo(w * 0.55, -h * 0.05);
        ctx.moveTo(0, -h * 0.25);
        ctx.lineTo(-w * 0.55, -h * 0.05);
        ctx.moveTo(0, h * 0.2);
        ctx.lineTo(w * 0.45, h * 0.4);
        ctx.moveTo(0, h * 0.2);
        ctx.lineTo(-w * 0.45, h * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.quadraticCurveTo(w * 0.22, h * 1.18, w * 0.38, h * 1.1);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = Math.max(0.6, p.size * 0.1);
        ctx.stroke();
      } else if (currentSeason === 'winter') {
        ctx.rotate(p.spin);
        const r = p.size * 0.75;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = Math.max(0.7, p.size * 0.1);
        ctx.lineCap = 'round';
        for (let a = 0; a < 6; a += 1) {
          const angle = (a / 6) * Math.PI * 2;
          const dx = Math.cos(angle);
          const dy = Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(dx * r, dy * r);
          ctx.stroke();
          for (const t of [0.45, 0.72]) {
            const bx = dx * r * t;
            const by = dy * r * t;
            for (const dir of [1, -1]) {
              const branch = r * 0.3;
              const perp = angle + (dir * Math.PI) / 3;
              ctx.beginPath();
              ctx.moveTo(bx, by);
              ctx.lineTo(bx + Math.cos(perp) * branch, by + Math.sin(perp) * branch);
              ctx.stroke();
            }
          }
          ctx.beginPath();
          ctx.arc(dx * r, dy * r, Math.max(0.6, p.size * 0.08), 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.8, p.size * 0.12), 0, Math.PI * 2);
        ctx.fill();
      } else if (currentSeason === 'lente') {
        ctx.rotate(p.spin);
        const w = p.size * 0.9;
        const h = p.size * 0.55;
        ctx.beginPath();
        ctx.moveTo(-w, 0);
        ctx.quadraticCurveTo(0, -h * 1.6, w, 0);
        ctx.quadraticCurveTo(0, h * 0.9, -w, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w, 0);
        ctx.quadraticCurveTo(0, h * 1.6, w, 0);
        ctx.quadraticCurveTo(0, -h * 0.9, -w, 0);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = Math.max(0.4, p.size * 0.05);
        ctx.beginPath();
        ctx.moveTo(-w * 0.85, 0);
        ctx.lineTo(w * 0.85, 0);
        ctx.stroke();
      } else {
        const flicker = 0.55 + 0.45 * Math.sin(time * 2.2 + p.sway);
        ctx.globalAlpha = p.alpha * flicker * 0.28;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = p.alpha * flicker * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = p.alpha * flicker;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = p.alpha * flicker * 0.8;
        for (let ray = 0; ray < 4; ray += 1) {
          const angle = p.sway + (ray / 4) * Math.PI * 2;
          const len = p.size * 1.1 * (0.7 + 0.3 * Math.sin(time * 3 + ray));
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * p.size * 0.3, Math.sin(angle) * p.size * 0.3);
          ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = Math.max(0.5, p.size * 0.09);
          ctx.stroke();
        }
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
