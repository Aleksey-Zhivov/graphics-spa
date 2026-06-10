export type CelestialBodyId = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars';

export type CelestialBodyType = 'star' | 'planet';

export type RotationDirection = 'prograde' | 'retrograde';

export type SatelliteId = 'moon' | 'phobos' | 'deimos';

export type SatelliteData = {
  id: SatelliteId;
  name: string;
  color: string;
  textureFile?: string;
  radius: number;
  orbitRadius: number;
  orbitalPeriodDays: number;
  orbitDirection: RotationDirection;
  rotationPeriodDays: number;
  rotationDirection: RotationDirection;
  isTidallyLocked: boolean;
  initialAngle: number;
  distanceLabel: string;
  orbitalPeriodLabel: string;
  rotationPeriodLabel: string;
  description: string;
};

export type CelestialBodyData = {
  atmosphere?: {
    color: string;
    opacity: number;
    scale: number;
  };
  id: CelestialBodyId;
  name: string;
  type: CelestialBodyType;
  color: string;
  textureFile: string;
  radius: number;
  orbitRadius: number;
  eccentricity: number;
  perihelionAngle: number;
  orbitalPeriodDays: number;
  orbitDirection: RotationDirection;
  rotationPeriodDays: number;
  rotationDirection: RotationDirection;
  axialTiltDegrees: number;
  initialAngle: number;
  distanceLabel: string;
  orbitalPeriodLabel: string;
  rotationPeriodLabel: string;
  description: string;
  satellites: SatelliteData[];
};
