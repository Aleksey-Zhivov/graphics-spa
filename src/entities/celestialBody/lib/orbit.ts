import { Vector3 } from 'three';

const VISUAL_ORBIT_TIME_SCALE = 50;
const VISUAL_ROTATION_TIME_SCALE = 0.35;
const SATELLITE_REFERENCE_PERIOD_DAYS = 27.321661;
const SATELLITE_REFERENCE_SPEED = 0.9;
const KEPLER_ITERATIONS = 5;

type OrbitParameters = {
  semiMajorAxis: number;
  eccentricity: number;
  perihelionAngle: number;
};

function solveEccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
  let eccentricAnomaly = meanAnomaly;

  for (let index = 0; index < KEPLER_ITERATIONS; index += 1) {
    eccentricAnomaly -=
      (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly));
  }

  return eccentricAnomaly;
}

export function getVisualOrbitalSpeed(orbitalPeriodDays: number): number {
  return orbitalPeriodDays > 0 ? VISUAL_ORBIT_TIME_SCALE / orbitalPeriodDays : 0;
}

export function getVisualRotationSpeed(rotationPeriodDays: number): number {
  return rotationPeriodDays > 0 ? VISUAL_ROTATION_TIME_SCALE / rotationPeriodDays : 0;
}

export function getSatelliteVisualOrbitalSpeed(orbitalPeriodDays: number): number {
  return orbitalPeriodDays > 0
    ? SATELLITE_REFERENCE_SPEED *
        Math.pow(SATELLITE_REFERENCE_PERIOD_DAYS / orbitalPeriodDays, 0.25)
    : 0;
}

export function getOrbitPosition(
  meanAnomaly: number,
  { semiMajorAxis, eccentricity, perihelionAngle }: OrbitParameters,
): Vector3 {
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, eccentricity);
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
  const orbitalX = semiMajorAxis * (Math.cos(eccentricAnomaly) - eccentricity);
  const orbitalZ = semiMinorAxis * Math.sin(eccentricAnomaly);
  const cosine = Math.cos(perihelionAngle);
  const sine = Math.sin(perihelionAngle);

  return new Vector3(orbitalX * cosine - orbitalZ * sine, 0, orbitalX * sine + orbitalZ * cosine);
}

export function createOrbitPoints(parameters: OrbitParameters, segments = 160): Vector3[] {
  return Array.from({ length: segments + 1 }, (_, index) =>
    getOrbitPosition((index / segments) * Math.PI * 2, parameters),
  );
}
