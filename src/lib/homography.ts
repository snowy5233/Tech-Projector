export interface Point {
  x: number;
  y: number;
}

/** Corner order is fixed everywhere: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

export const CORNER_LABELS = ['Linksboven', 'Rechtsboven', 'Rechtsonder', 'Linksonder'] as const;

/** Solves A·x = b with Gaussian elimination and partial pivoting. */
const solveLinearSystem = (matrix: number[][], vector: number[]): number[] | null => {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i]]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-10) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col] / a[col][col];
      if (factor === 0) continue;
      for (let k = col; k <= n; k += 1) a[row][k] -= factor * a[col][k];
    }
  }

  return a.map((row, i) => row[n] / row[i]);
};

/**
 * Projective transform that maps the rect (0,0)-(width,height) onto `quad`,
 * expressed as a CSS matrix3d (column-major) for use with transform-origin: 0 0.
 */
export const quadToMatrix3d = (quad: Quad, width: number, height: number): string => {
  const source: Quad = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  const rows: number[][] = [];
  const values: number[] = [];

  for (let i = 0; i < 4; i += 1) {
    const { x, y } = source[i];
    const { x: u, y: v } = quad[i];
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    values.push(u);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    values.push(v);
  }

  const h = solveLinearSystem(rows, values);
  if (!h) return 'none';

  const [h1, h2, h3, h4, h5, h6, h7, h8] = h;
  const m = [h1, h4, 0, h7, h2, h5, 0, h8, 0, 0, 1, 0, h3, h6, 0, 1];
  return `matrix3d(${m.map((value) => Number(value.toFixed(6))).join(',')})`;
};

/** Normalized (0..1) quad so a stored calibration survives resolution changes. */
export const DEFAULT_NORMALIZED_QUAD: Quad = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

export const denormalizeQuad = (quad: Quad, width: number, height: number): Quad =>
  quad.map((point) => ({ x: point.x * width, y: point.y * height })) as Quad;

export const isDefaultQuad = (quad: Quad): boolean =>
  quad.every(
    (point, index) =>
      Math.abs(point.x - DEFAULT_NORMALIZED_QUAD[index].x) < 1e-4 &&
      Math.abs(point.y - DEFAULT_NORMALIZED_QUAD[index].y) < 1e-4,
  );

export const isValidQuad = (quad: unknown): quad is Quad =>
  Array.isArray(quad) &&
  quad.length === 4 &&
  quad.every(
    (point) =>
      typeof point === 'object' &&
      point !== null &&
      typeof (point as Point).x === 'number' &&
      typeof (point as Point).y === 'number' &&
      Number.isFinite((point as Point).x) &&
      Number.isFinite((point as Point).y),
  );
