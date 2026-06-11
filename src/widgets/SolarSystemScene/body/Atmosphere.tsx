import { AdditiveBlending, BackSide } from 'three';

import type { CelestialBodyData } from '@/entities/celestialBody';
import { GRAPHICS_QUALITY, type GraphicsQuality } from '../model/quality';

export function Atmosphere({
  body,
  graphicsQuality,
  isDimmed,
}: {
  body: CelestialBodyData;
  graphicsQuality: GraphicsQuality;
  isDimmed: boolean;
}) {
  if (!body.atmosphere || !GRAPHICS_QUALITY[graphicsQuality].textures) {
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
