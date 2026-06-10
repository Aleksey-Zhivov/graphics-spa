export type CelestialBodyId = string;

export type CelestialBodyKind =
  | 'star'
  | 'planet'
  | 'dwarfPlanet'
  | 'satellite'
  | 'comet'
  | 'asteroid';

export type RotationDirection = 'prograde' | 'retrograde';

export type CelestialBodyShape = 'sphere' | 'irregular';

export type CelestialBodyData = {
  atmosphere?: {
    color: string;
    opacity: number;
    scale: number;
  };
  id: CelestialBodyId;
  parentId: CelestialBodyId | null;
  name: string;
  kind: CelestialBodyKind;
  shape: CelestialBodyShape;
  color: string;
  textureFile?: string;
  radius: number;
  orbitRadius: number;
  eccentricity: number;
  perihelionAngle: number;
  orbitalPeriodDays: number;
  orbitDirection: RotationDirection;
  rotationPeriodDays: number;
  rotationDirection: RotationDirection;
  axialTiltDegrees: number;
  isTidallyLocked: boolean;
  initialAngle: number;
  distanceLabel: string;
  orbitalPeriodLabel: string;
  rotationPeriodLabel: string;
  description: string;
};
