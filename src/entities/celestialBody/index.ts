export { CELESTIAL_BODIES } from './model/catalog';
export {
  createOrbitPoints,
  getOrbitPosition,
  getSatelliteVisualOrbitalSpeed,
  getVisualOrbitalSpeed,
  getVisualRotationSpeed,
} from './lib/orbit';
export type {
  CelestialBodyData,
  CelestialBodyId,
  CelestialBodyType,
  RotationDirection,
  SatelliteData,
  SatelliteId,
} from './model/types';
