export {
  CELESTIAL_BODIES,
  getBodiesByKind,
  getCelestialBodyById,
  getChildBodies,
} from './model/catalog';
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
  CelestialBodyKind,
  CelestialBodyShape,
  RotationDirection,
} from './model/types';
