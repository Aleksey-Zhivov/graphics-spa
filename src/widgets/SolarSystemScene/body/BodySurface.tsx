import type { CelestialBodyData } from '@/entities/celestialBody';

import { useCelestialTexture } from '../lib/useCelestialTexture';
import { useProceduralBodyTexture } from '../lib/useProceduralBodyTexture';

function TexturedSurface({
  body,
  isActive,
  isDimmed,
}: {
  body: CelestialBodyData & { textureFile: string };
  isActive: boolean;
  isDimmed: boolean;
}) {
  const texture = useCelestialTexture(body.textureFile);

  return (
    <meshStandardMaterial
      map={texture}
      emissive={body.color}
      emissiveIntensity={isActive ? 0.2 : 0.02}
      opacity={isDimmed ? 0.18 : 1}
      roughness={body.kind === 'satellite' ? 0.92 : 0.82}
      transparent={isDimmed}
    />
  );
}

function ProceduralSurface({
  body,
  isActive,
  isDimmed,
}: {
  body: CelestialBodyData;
  isActive: boolean;
  isDimmed: boolean;
}) {
  const texture = useProceduralBodyTexture(body);

  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.96}
      emissive={body.color}
      emissiveIntensity={isActive ? 0.18 : 0.02}
      opacity={isDimmed ? 0.18 : 1}
      transparent={isDimmed}
    />
  );
}

export function BodySurface({
  body,
  isActive,
  isDimmed,
}: {
  body: CelestialBodyData;
  isActive: boolean;
  isDimmed: boolean;
}) {
  return body.textureFile ? (
    <TexturedSurface
      body={body as CelestialBodyData & { textureFile: string }}
      isActive={isActive}
      isDimmed={isDimmed}
    />
  ) : (
    <ProceduralSurface body={body} isActive={isActive} isDimmed={isDimmed} />
  );
}
