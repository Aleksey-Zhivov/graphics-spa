import { Line } from '@react-three/drei';
import { useMemo } from 'react';

import { createOrbitPoints, type CelestialBodyData } from '@/entities/celestialBody';

export function OrbitLine({
  body,
  isActive,
  isDimmed,
}: {
  body: CelestialBodyData;
  isActive: boolean;
  isDimmed: boolean;
}) {
  const points = useMemo(
    () =>
      createOrbitPoints({
        semiMajorAxis: body.orbitRadius,
        eccentricity: body.eccentricity,
        perihelionAngle: body.perihelionAngle,
      }),
    [body],
  );

  return (
    <Line
      points={points}
      color={isActive ? '#bce8ff' : '#65809d'}
      lineWidth={isActive ? 1.6 : 0.7}
      transparent
      opacity={isDimmed ? 0.05 : isActive ? 0.8 : body.kind === 'satellite' ? 0.34 : 0.22}
    />
  );
}
