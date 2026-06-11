import { describe, expect, it } from 'vitest';

import { CELESTIAL_BODIES, getCelestialBodyById, getChildBodies } from './catalog';

describe('celestial body catalog', () => {
  it('uses unique ids and valid parent references', () => {
    const ids = CELESTIAL_BODIES.map((body) => body.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(
      CELESTIAL_BODIES.every(
        (body) => body.parentId === null || getCelestialBodyById(body.parentId) !== undefined,
      ),
    ).toBe(true);
  });

  it('includes the major Jupiter and Saturn systems', () => {
    expect(getChildBodies('jupiter').map((body) => body.id)).toEqual([
      'io',
      'europa',
      'ganymede',
      'callisto',
    ]);
    expect(getChildBodies('saturn').map((body) => body.id)).toEqual(['titan']);
    expect(getCelestialBodyById('saturn')?.rings).toBeDefined();
  });

  it('keeps satellites tidally locked to their parent planets', () => {
    const satellites = CELESTIAL_BODIES.filter((body) => body.kind === 'satellite');

    expect(satellites.every((body) => body.isTidallyLocked)).toBe(true);
    expect(satellites.every((body) => body.rotationPeriodDays === body.orbitalPeriodDays)).toBe(
      true,
    );
  });
});
