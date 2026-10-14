import { useEffect, useRef } from 'react';
import './seasonal.css';
import type { HolidayId } from '../../lib/holidays';

export type Season = 'lente' | 'zomer' | 'herfst' | 'winter';
export const SEASONS: Season[] = ['lente', 'zomer', 'herfst', 'winter'];

/** Live weer-effect: 'regen', 'sneeuw' of null (geen neerslag). */
export type Weather = 'regen' | 'sneeuw' | null;

export type ParticleKind = Season | Weather | HolidayId;

/** Meteorological seasons: lente mrt–mei, zomer jun–aug, herfst sep–nov, winter dec–feb. */
export const seasonOf = (date: Date): Season => {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'lente';
  if (month >= 5 && month <= 7) return 'zomer';
  if (month >= 8 && month <= 10) return 'herfst';
  return 'winter';
};

interface Particle {
  kind: ParticleKind;
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

const KIND_COUNTS: Record<string, number> = {
  lente: 22,
  zomer: 18,
  herfst: 20,
  winter: 26,
  regen: 120,
  sneeuw: 90,
  nieuwjaar: 14,
  valentijn: 18,
  pasen: 14,
  koningsdag: 16,
  sinterklaas: 18,
  halloween: 16,
  kerst: 20,
};

const spawn = (width: number, height: number, kind: ParticleKind): Particle => ({
  kind,
  x: Math.random() * width,
  y: kind === 'zomer' || kind === 'nieuwjaar' ? height + Math.random() * height : -Math.random() * height,
  size: 7 + Math.random() * 9,
  speed:
    kind === 'zomer' || kind === 'nieuwjaar'
      ? -(6 + Math.random() * 10)
      : kind === 'regen'
        ? 340 + Math.random() * 180
        : kind === 'sneeuw' || kind === 'kerst' || kind === 'winter'
          ? 26 + Math.random() * 34
          : 12 + Math.random() * 26,
  sway: Math.random() * Math.PI * 2,
  swaySpeed: 0.4 + Math.random() * 0.8,
  spin: Math.random() * Math.PI * 2,
  spinSpeed: (Math.random() - 0.5) * 2.4,
  alpha: 0.22 + Math.random() * 0.5,
});

export interface SeasonalOverlayProps {
  /** Season effect to show; null = no seasonal particles. */
  season: Season | null;
  weather?: Weather;
  holiday?: HolidayId | null;
}

/**
 * Total particle budget across all active effects — with season + weather +
 * holiday combined, each effect gets a proportional share so the screen
 * never gets crowded.
 */
const TOTAL_BUDGET = 96;

const drawLeaf = (ctx: CanvasRenderingContext2D, p: Particle) => {
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
};

const drawSnowflake = (ctx: CanvasRenderingContext2D, p: Particle) => {
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
};

const drawPetal = (ctx: CanvasRenderingContext2D, p: Particle) => {
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
};

const drawSpark = (ctx: CanvasRenderingContext2D, p: Particle, time: number) => {
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
};

const drawRain = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(0.8, p.size * 0.12);
  ctx.globalAlpha = p.alpha * 0.75;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-p.size * 0.35, p.size * 2.6);
  ctx.stroke();
};

const drawHeart = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.rotate(Math.sin(p.sway) * 0.3);
  const s = p.size * 0.9;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.85);
  ctx.bezierCurveTo(-s * 1.3, -s * 0.2, -s * 0.5, -s * 1.1, 0, -s * 0.35);
  ctx.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.3, -s * 0.2, 0, s * 0.85);
  ctx.fill();
};

const drawEgg = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.rotate(Math.sin(p.sway) * 0.25);
  const w = p.size * 0.62;
  const h = p.size;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(0.5, p.size * 0.07);
  ctx.beginPath();
  ctx.moveTo(-w * 0.85, h * 0.3);
  for (let z = 0; z <= 6; z += 1) {
    ctx.lineTo(-w * 0.85 + (w * 1.7 * z) / 6, h * (0.3 + (z % 2 === 0 ? 0.12 : -0.12)));
  }
  ctx.stroke();
};

const drawBat = (ctx: CanvasRenderingContext2D, p: Particle, time: number) => {
  const flap = Math.sin(time * 7 + p.sway) * 0.5;
  ctx.rotate(p.spin * 0.2);
  const w = p.size * 1.4;
  const h = p.size * 0.55;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-w * 0.55, -h * (1 + flap), -w, -flap * h * 0.4);
  ctx.quadraticCurveTo(-w * 0.6, h * 0.5, -w * 0.25, h * 0.1);
  ctx.quadraticCurveTo(-w * 0.1, 0, 0, 0);
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w * 0.55, -h * (1 + flap), w, -flap * h * 0.4);
  ctx.quadraticCurveTo(w * 0.6, h * 0.5, w * 0.25, h * 0.1);
  ctx.quadraticCurveTo(w * 0.1, 0, 0, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.32, p.size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-p.size * 0.12, -p.size * 0.15, p.size * 0.07, 0, Math.PI * 2);
  ctx.arc(p.size * 0.12, -p.size * 0.15, p.size * 0.07, 0, Math.PI * 2);
  ctx.fill();
};

const drawPumpkin = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.rotate(Math.sin(p.sway) * 0.2);
  const r = p.size;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.15, r, r * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(0.5, p.size * 0.08);
  ctx.beginPath();
  ctx.moveTo(-r * 0.45, -r * 0.6);
  ctx.quadraticCurveTo(-r * 0.6, r * 0.15, -r * 0.45, r * 0.9);
  ctx.moveTo(r * 0.45, -r * 0.6);
  ctx.quadraticCurveTo(r * 0.6, r * 0.15, r * 0.45, r * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.75);
  ctx.lineTo(0, r * 0.9);
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(0.8, p.size * 0.12);
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, -r * 0.05);
  ctx.lineTo(-r * 0.3, -r * 0.05);
  ctx.moveTo(r * 0.3, -r * 0.05);
  ctx.lineTo(r * 0.55, -r * 0.05);
  ctx.moveTo(-r * 0.5, r * 0.25);
  ctx.lineTo(-r * 0.28, r * 0.25);
  ctx.moveTo(r * 0.28, r * 0.25);
  ctx.lineTo(r * 0.5, r * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.78);
  ctx.quadraticCurveTo(-r * 0.3, -r * 1.15, -r * 0.1, -r * 1.2);
  ctx.stroke();
};

const drawBaubel = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.rotate(Math.sin(p.sway) * 0.3);
  const r = p.size * 0.7;
  ctx.beginPath();
  ctx.arc(0, r * 0.3, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(0.5, p.size * 0.07);
  ctx.beginPath();
  ctx.arc(0, r * 0.3, r * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-r * 0.18, -r * 0.85, r * 0.36, r * 0.45);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(0.6, p.size * 0.09);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.85);
  ctx.lineTo(0, -r * 1.6);
  ctx.stroke();
};

const drawFirework = (ctx: CanvasRenderingContext2D, p: Particle, time: number) => {
  const life = (time * 0.35 + p.sway) % 1;
  const burst = Math.sin(life * Math.PI);
  ctx.globalAlpha = p.alpha * burst;
  const r = p.size * (1.4 + life * 3.2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(0.7, p.size * 0.1);
  for (let ray = 0; ray < 10; ray += 1) {
    const angle = (ray / 10) * Math.PI * 2 + p.spin;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r * 0.5, Math.sin(angle) * r * 0.5);
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    ctx.stroke();
  }
  ctx.globalAlpha = p.alpha * burst * 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
};

const drawGift = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.rotate(Math.sin(p.sway) * 0.25);
  const s = p.size * 0.85;
  ctx.fillRect(-s, -s * 0.75, s * 2, s * 1.5);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(0.5, p.size * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.75);
  ctx.lineTo(0, s * 0.75);
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(0.6, p.size * 0.11);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.75);
  ctx.quadraticCurveTo(-s * 0.4, -s * 1.2, -s * 0.1, -s * 1.05);
  ctx.moveTo(0, -s * 0.75);
  ctx.quadraticCurveTo(s * 0.4, -s * 1.2, s * 0.1, -s * 1.05);
  ctx.stroke();
};

const drawBalloon = (ctx: CanvasRenderingContext2D, p: Particle) => {
  const r = p.size * 0.65;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.8, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-r * 0.15, r);
  ctx.lineTo(r * 0.15, r);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(0.5, p.size * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, r * 1.05);
  ctx.quadraticCurveTo(r * 0.3, r * 1.6, 0, r * 2.1);
  ctx.stroke();
};

const drawPepernoot = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.rotate(p.spin);
  const s = p.size * 0.55;
  ctx.beginPath();
  ctx.moveTo(-s, -s * 0.4);
  ctx.lineTo(-s * 0.3, -s);
  ctx.lineTo(s * 0.5, -s * 0.9);
  ctx.lineTo(s, -s * 0.2);
  ctx.lineTo(s * 0.7, s * 0.8);
  ctx.lineTo(-s * 0.3, s * 0.9);
  ctx.closePath();
  ctx.fill();
};

const drawParticle = (
  ctx: CanvasRenderingContext2D,
  p: Particle,
  time: number,
) => {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = '#fff';
  ctx.translate(p.x, p.y);
  switch (p.kind) {
    case 'herfst':
      drawLeaf(ctx, p);
      break;
    case 'winter':
      drawSnowflake(ctx, p);
      break;
    case 'lente':
      drawPetal(ctx, p);
      break;
    case 'zomer':
      drawSpark(ctx, p, time);
      break;
    case 'regen':
      drawRain(ctx, p);
      break;
    case 'sneeuw':
      drawSnowflake(ctx, p);
      break;
    case 'nieuwjaar':
      drawFirework(ctx, p, time);
      break;
    case 'valentijn':
      drawHeart(ctx, p);
      break;
    case 'pasen':
      drawEgg(ctx, p);
      break;
    case 'koningsdag':
      drawBalloon(ctx, p);
      break;
    case 'sinterklaas':
      if (p.size % 2 > 1) drawGift(ctx, p);
      else drawPepernoot(ctx, p);
      break;
    case 'halloween':
      if (p.size % 2 > 1) drawBat(ctx, p, time);
      else drawPumpkin(ctx, p);
      break;
    case 'kerst':
      if (p.size % 2 > 1) drawBaubel(ctx, p);
      else drawSnowflake(ctx, p);
      break;
  }
  ctx.restore();
};

/**
 * Seizoens- en feestdag-effecten bovenop het artwork, onder de interface.
 * Seizoen uit de klok, weer (regen/sneeuw) uit useWeather, feestdag uit de datum.
 */
export const SeasonalOverlay = ({ season, weather = null, holiday = null }: SeasonalOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectsRef = useRef<string>('');
  const kindsOf = () => {
    const kinds: ParticleKind[] = [];
    if (season) kinds.push(season);
    if (weather) kinds.push(weather);
    if (holiday) kinds.push(holiday);
    return kinds;
  };
  const signature = kindsOf().join('+');
  if (effectsRef.current !== signature) {
    effectsRef.current = signature;
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
    let activeSignature = effectsRef.current;

    const scaleUnit = () => Math.max(0.6, Math.min(1.6, Math.min(width, height) / 900));

    const countFor = (kind: ParticleKind) =>
      Math.max(6, Math.round(KIND_COUNTS[kind as string] ?? 16) * scaleUnit());

    /**
     * Balance: each active effect keeps its own character (rain needs many
     * streaks, holiday items are few and large) but the total stays within
     * TOTAL_BUDGET, scaling every effect down evenly when they stack.
     */
    const balancedCounts = (kinds: ParticleKind[]): Map<ParticleKind, number> => {
      const caps = kinds.map((kind) => countFor(kind));
      const total = caps.reduce((sum, cap) => sum + cap, 0);
      const scale = total > TOTAL_BUDGET ? TOTAL_BUDGET / total : 1;
      const counts = new Map<ParticleKind, number>();
      kinds.forEach((kind, index) => {
        counts.set(kind, Math.max(4, Math.round(caps[index] * scale)));
      });
      return counts;
    };

    const repopulate = () => {
      particles = [];
      const kinds = activeSignature.split('+').filter(Boolean) as ParticleKind[];
      for (const [kind, count] of balancedCounts(kinds)) {
        for (let i = 0; i < count; i += 1) {
          particles.push(spawn(width, height, kind));
        }
      }
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

    const render = (now: number) => {
      frameId = requestAnimationFrame(render);
      resize();
      if (previous === 0) previous = now;
      const dt = Math.min((now - previous) / 1000, 0.1) * timeScale;
      previous = now;
      const time = now / 1000;

      if (effectsRef.current !== activeSignature) {
        activeSignature = effectsRef.current;
        repopulate();
      }

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.sway += p.swaySpeed * dt;
        p.spin += p.spinSpeed * dt;
        if (p.kind === 'regen') {
          p.y += p.speed * dt;
          p.x -= p.speed * dt * 0.12;
        } else {
          p.x += Math.sin(p.sway) * 22 * dt;
          p.y += p.speed * dt;
        }
        const rising = p.kind === 'zomer' || p.kind === 'nieuwjaar' || p.kind === 'koningsdag' || p.kind === 'valentijn';
        if (rising ? p.y < -40 : p.y > height + 40) {
          Object.assign(p, spawn(width, height, p.kind));
          p.y = rising ? height + 10 : -10;
          p.x = Math.random() * width;
        }
        if (p.kind === 'regen' && p.x < -20) {
          p.x = width + 10;
        }
        drawParticle(ctx, p, time);
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
