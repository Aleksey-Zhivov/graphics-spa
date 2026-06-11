import type { CelestialBodyData } from '@/entities/celestialBody';

import { GRAPHICS_QUALITY, type GraphicsQuality } from '../model/quality';
import { useCelestialTexture } from '../lib/useCelestialTexture';
import { useProceduralBodyTexture } from '../lib/useProceduralBodyTexture';

function SchematicSurface({
  body,
  isActive,
  isDimmed,
}: {
  body: CelestialBodyData;
  isActive: boolean;
  isDimmed: boolean;
}) {
  return (
    <meshStandardMaterial
      color={body.color}
      emissive={body.color}
      emissiveIntensity={isActive ? 0.28 : 0.06}
      opacity={isDimmed ? 0.18 : 1}
      roughness={0.9}
      transparent={isDimmed}
    />
  );
}

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
  graphicsQuality,
  isActive,
  isDimmed,
}: {
  body: CelestialBodyData;
  graphicsQuality: GraphicsQuality;
  isActive: boolean;
  isDimmed: boolean;
}) {
  if (!GRAPHICS_QUALITY[graphicsQuality].textures) {
    return <SchematicSurface body={body} isActive={isActive} isDimmed={isDimmed} />;
  }

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
