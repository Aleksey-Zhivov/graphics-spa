import { describe, expect, it } from 'vitest';

import {
  createOrbitPoints,
  getOrbitPosition,
  getSatelliteVisualOrbitalSpeed,
  getVisualOrbitalSpeed,
  getVisualRotationSpeed,
} from './orbit';

describe('celestial body motion helpers', () => {
  it('returns zero visual speed for non-positive periods', () => {
    expect(getVisualOrbitalSpeed(0)).toBe(0);
    expect(getVisualRotationSpeed(-1)).toBe(0);
    expect(getSatelliteVisualOrbitalSpeed(0)).toBe(0);
  });

  it('keeps shorter orbital and rotation periods visually faster', () => {
    expect(getVisualOrbitalSpeed(100)).toBeGreaterThan(getVisualOrbitalSpeed(200));
    expect(getVisualRotationSpeed(1)).toBeGreaterThan(getVisualRotationSpeed(2));
    expect(getSatelliteVisualOrbitalSpeed(1)).toBeGreaterThan(getSatelliteVisualOrbitalSpeed(10));
  });

  it('places a circular orbit on its semi-major radius', () => {
    const position = getOrbitPosition(Math.PI / 2, {
      semiMajorAxis: 10,
      eccentricity: 0,
      perihelionAngle: 0,
    });

    expect(position.x).toBeCloseTo(0, 10);
    expect(position.y).toBe(0);
    expect(position.z).toBeCloseTo(10, 10);
  });

  it('places perihelion at a * (1 - e)', () => {
    const position = getOrbitPosition(0, {
      semiMajorAxis: 10,
      eccentricity: 0.2,
      perihelionAngle: 0,
    });

    expect(position.x).toBeCloseTo(8, 10);
    expect(position.z).toBeCloseTo(0, 10);
  });

  it('rotates the orbit by the perihelion angle', () => {
    const position = getOrbitPosition(0, {
      semiMajorAxis: 10,
      eccentricity: 0.2,
      perihelionAngle: Math.PI / 2,
    });

    expect(position.x).toBeCloseTo(0, 10);
    expect(position.z).toBeCloseTo(8, 10);
  });

  it('creates a closed orbit with the requested segment count', () => {
    const points = createOrbitPoints(
      {
        semiMajorAxis: 12,
        eccentricity: 0.1,
        perihelionAngle: 0.4,
      },
      32,
    );

    expect(points).toHaveLength(33);
    expect(points[0].distanceTo(points.at(-1)!)).toBeLessThan(1e-10);
  });
});
