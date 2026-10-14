import { useEffect, useRef } from 'react';
import { createArtworkModes } from './createArtworkModes';
import { plateClearance } from './plate';
import './artwork.css';

const MAX_PIXEL_RATIO = 1.5;
const CROSSFADE_SECONDS = 1.1;

export interface ArtworkCanvasProps {
  /** Which of the 15 slot animations to play. */
  modeIndex: number;
  /** 0..1 — higher during breaks. */
  energy?: number;
  /** 0..1 — how built-up the drawing is (start of block = black, end = airy white). */
  density?: number;
  /** Animation speed multiplier. */
  speed?: number;
}

export const ArtworkCanvas = ({ modeIndex, energy = 0.3, density = 0.2, speed = 1 }: ArtworkCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const energyRef = useRef(energy);
  const densityRef = useRef(density);
  const speedRef = useRef(speed);
  const modeRef = useRef(modeIndex);
  const fromRef = useRef(modeIndex);
  const mixRef = useRef(1);
  energyRef.current = energy;
  densityRef.current = density;

  if (modeIndex !== modeRef.current) {
    fromRef.current = modeRef.current;
    modeRef.current = modeIndex;
    mixRef.current = 0;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const modes = createArtworkModes();

    let width = 0;
    let height = 0;
    let ratio = 1;
    let frameId = 0;
    let previous = 0;
    let artworkTime = 0;
    let smoothEnergy = energyRef.current;
    let smoothDensity = densityRef.current;

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
      modes.forEach((mode) => mode.layout?.(width, height));
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeScale = () => (reducedMotion ? 0.35 : 1) * speedRef.current;

    const wrap = (index: number) => {
      const len = modes.length;
      return ((index % len) + len) % len;
    };

    const render = (now: number) => {
      frameId = requestAnimationFrame(render);
      resize();

      if (previous === 0) previous = now;

      const rawDt = Math.min((now - previous) / 1000, 0.1) * timeScale();
      previous = now;

      smoothEnergy += (energyRef.current - smoothEnergy) * Math.min(1, rawDt * 1.5);
      smoothDensity += (densityRef.current - smoothDensity) * Math.min(1, rawDt * 1.2);

      // Fuller frames would feel faster; ease motion down as the field builds.
      const calm = 1 - Math.min(1, smoothDensity) * 0.38;
      const dt = rawDt * calm;
      artworkTime += dt;
      const time = artworkTime;

      mixRef.current = Math.min(1, mixRef.current + dt / CROSSFADE_SECONDS);

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      const unit = Math.min(width, height) / 900;
      const mix = mixRef.current;
      const current = modes[wrap(modeRef.current)];
      const previousMode = modes[wrap(fromRef.current)];
      if (!current) return;

      const presence = Math.min(smoothDensity, 0.48);
      const innerClearance = plateClearance(width, height);
      const base = { ctx, width, height, time, dt, energy: smoothEnergy, unit, innerClearance };

      // Density drives how much white is on screen, capped so the field stays airy.
      if (mix >= 1 || !previousMode || previousMode === current) {
        current.draw({ ...base, presence });
      } else {
        previousMode.draw({ ...base, presence: (1 - mix) * presence });
        current.draw({ ...base, presence: mix * presence });
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

  return <canvas ref={canvasRef} className="artwork-canvas" aria-hidden="true" />;
};
