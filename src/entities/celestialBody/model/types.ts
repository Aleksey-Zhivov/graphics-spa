export type CelestialBodyId = 'sun' | 'venus' | 'earth' | 'mars';

export type CelestialBodyType = 'star' | 'planet';

export type CelestialBodyData = {
  id: CelestialBodyId;
  name: string;
  type: CelestialBodyType;
  color: string;
  radius: number;
  orbitRadius: number;
  orbitalSpeed: number;
  initialAngle: number;
  distanceLabel: string;
};
