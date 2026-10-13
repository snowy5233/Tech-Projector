import type { ArtworkMode } from './artwork-types';
import { createBarsMode } from './modes/barsMode';
import { createConstellationMode } from './modes/constellationMode';
import { createGridMode } from './modes/gridMode';
import { createHalftoneMode } from './modes/halftoneMode';
import { createMoireMode } from './modes/moireMode';
import { createOrbitMode } from './modes/orbitMode';
import { createRadarMode } from './modes/radarMode';
import { createRippleMode } from './modes/rippleMode';
import { createScanMode } from './modes/scanMode';
import { createSolidMode } from './modes/solidMode';
import { createSparkMode } from './modes/sparkMode';
import { createSpiralMode } from './modes/spiralMode';
import { createStreamsMode } from './modes/streamsMode';
import { createWavesMode } from './modes/wavesMode';
import { createTunnelMode } from './modes/tunnelMode';

/** Twelve slot animations (9 lessons + 3 pauzes) plus three extras for the after-hours rotation. */
export const ARTWORK_MODE_COUNT = 15;


export const createArtworkModes = (): ArtworkMode[] => [
  createHalftoneMode(),
  createTunnelMode(),
  createOrbitMode(),
  createStreamsMode(),
  createGridMode(),
  createMoireMode(),
  createSolidMode(),
  createRadarMode(),
  createBarsMode(),
  createSpiralMode(),
  createSparkMode(),
  createRippleMode(),
  createWavesMode(),
  createConstellationMode(),
  createScanMode(),
];

export const ARTWORK_MODE_IDS: string[] = createArtworkModes().map((mode) => mode.id);

/** Mode id -> 0-based index lookup. */
export const ARTWORK_MODE_IDS_INDEX: Record<string, number> = Object.fromEntries(
  ARTWORK_MODE_IDS.map((id, index) => [id, index]),
);

/**
 * Optional `?art=<id or 0-based index>` to force one artwork theme, e.g.
 * `?art=waves`. Unknown values are ignored and the schedule picks as usual.
 */
export const forcedArtworkModeIndex = (): number | null => {
  const value = new URLSearchParams(window.location.search).get('art');
  if (!value) return null;

  const byId = ARTWORK_MODE_IDS.indexOf(value);
  if (byId >= 0) return byId;

  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 0 && numeric < ARTWORK_MODE_IDS.length
    ? numeric
    : null;
};
