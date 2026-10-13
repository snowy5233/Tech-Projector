/**
 * Radius covering the center title plate (`--u` = 0.52vw + 0.52vh, plate ~22u).
 * Artwork should start outside this so it is never hidden behind the black square.
 */
export const plateClearance = (width: number, height: number): number => {
  const u = width * 0.0052 + height * 0.0052;
  return u * 22;
};

export const isInsidePlate = (
  x: number,
  y: number,
  width: number,
  height: number,
  clearance: number,
): boolean => Math.hypot(x - width * 0.5, y - height * 0.5) < clearance;

/** How many of `total` items to draw; always at least `floor`, so the field is visible immediately. */
export const shownCount = (total: number, presence: number, floor = 3): number =>
  Math.min(total, Math.max(floor, Math.round(floor + presence * (total - floor))));
