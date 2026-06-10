import type { CelestialBodyId } from '@/entities/celestialBody';

export type SolarSystemSceneProps = {
  isTimePaused?: boolean;
  resetViewSignal?: number;
  selectedBodyId?: CelestialBodyId;
  timeScale?: number;
};
