import type { CelestialBodyId } from '@/entities/celestialBody';

import type { GraphicsQuality } from './quality';

export type SolarSystemSceneProps = {
  graphicsQuality?: GraphicsQuality;
  isTimePaused?: boolean;
  resetViewSignal?: number;
  selectedBodyId?: CelestialBodyId;
  timeScale?: number;
};
