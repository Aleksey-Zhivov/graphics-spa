import { AdditiveBlending, BackSide } from 'three';

import type { CelestialBodyData } from '@/entities/celestialBody';

export function Atmosphere({ body, isDimmed }: { body: CelestialBodyData; isDimmed: boolean }) {
  if (!body.atmosphere) {
    return null;
  }

  return (
    <mesh scale={body.atmosphere.scale}>
      <sphereGeometry args={[body.radius, 48, 48]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        color={body.atmosphere.color}
        depthWrite={false}
        opacity={body.atmosphere.opacity * (isDimmed ? 0.25 : 1)}
        side={BackSide}
        transparent
      />
    </mesh>
  );
}
