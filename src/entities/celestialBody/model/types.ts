export type CelestialBodyId = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars';

export type CelestialBodyType = 'star' | 'planet';

export type SatelliteData = {
  id: string;
  name: string;
  color: string;
  textureFile?: string;
  radius: number;
  orbitRadius: number;
  orbitalSpeed: number;
  initialAngle: number;
};

export type CelestialBodyData = {
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
  initialAngle: number;
  distanceLabel: string;
  orbitalPeriodLabel: string;
  description: string;
  satellites: SatelliteData[];
};
