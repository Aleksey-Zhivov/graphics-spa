import { DoubleSide } from 'three';

import type { CelestialBodyData } from '@/entities/celestialBody';

export function PlanetRings({
  rings,
  isDimmed,
}: {
  rings: NonNullable<CelestialBodyData['rings']>;
  isDimmed: boolean;
}) {
  const { color, innerRadius, opacity, outerRadius } = rings;
  const ringWidth = outerRadius - innerRadius;
  const bands = [
    {
      inner: innerRadius,
      outer: innerRadius + ringWidth * 0.28,
      opacity: opacity * 0.54,
    },
    {
      inner: innerRadius + ringWidth * 0.34,
      outer: innerRadius + ringWidth * 0.68,
      opacity,
    },
    {
      inner: innerRadius + ringWidth * 0.73,
      outer: outerRadius,
      opacity: opacity * 0.68,
    },
  ];

  return (
    <group rotation-x={-Math.PI / 2}>
      {bands.map((band) => (
        <mesh key={band.inner} renderOrder={2}>
          <ringGeometry args={[band.inner, band.outer, 160]} />
          <meshBasicMaterial
            color={color}
            depthWrite={false}
            opacity={band.opacity * (isDimmed ? 0.18 : 1)}
            side={DoubleSide}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
