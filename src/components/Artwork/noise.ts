/** Deterministic 0..1 hash — used for dissolve thresholds and stable randomness. */
export const hash01 = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

const hash2 = (x: number, y: number): number => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return n - Math.floor(n);
};

const smooth = (t: number): number => t * t * (3 - 2 * t);

/** Cheap value noise in 0..1, smooth enough for organic field motion. */
export const noise2d = (x: number, y: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);

  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);

  return (a * (1 - xf) + b * xf) * (1 - yf) + (c * (1 - xf) + d * xf) * yf;
};

/** Two-octave variant for a bit more detail without much cost. */
export const fbm2d = (x: number, y: number): number =>
  noise2d(x, y) * 0.65 + noise2d(x * 2.17 + 5.2, y * 2.17 - 3.1) * 0.35;
