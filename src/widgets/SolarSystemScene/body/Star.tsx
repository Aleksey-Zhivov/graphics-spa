import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Mesh } from 'three';

import {
  getVisualRotationSpeed,
  type CelestialBodyData,
  type CelestialBodyId,
} from '@/entities/celestialBody';
import { Group } from 'three';

import { getThreeRotationDirection } from '../lib/motion';
import { useCelestialTexture } from '../lib/useCelestialTexture';
import { GRAPHICS_QUALITY, type GraphicsQuality } from '../model/quality';
import { SunActivity } from './SunActivity';

function TexturedStarSurface({ body, isDimmed }: { body: CelestialBodyData; isDimmed: boolean }) {
  const texture = useCelestialTexture(body.textureFile!);

  return <meshBasicMaterial map={texture} transparent={isDimmed} opacity={isDimmed ? 0.18 : 1} />;
}

export function Star({
  body,
  graphicsQuality,
  isDimmed,
  isHovered,
  isTimePaused,
  timeScale,
  onHover,
  onRegister,
  onSelect,
}: {
  body: CelestialBodyData;
  graphicsQuality: GraphicsQuality;
  isDimmed: boolean;
  isHovered: boolean;
  isTimePaused: boolean;
  timeScale: number;
  onHover: (bodyId: CelestialBodyId | null) => void;
  onRegister: (bodyId: CelestialBodyId, group: Group | null) => void;
  onSelect: (bodyId: CelestialBodyId) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const qualitySettings = GRAPHICS_QUALITY[graphicsQuality];
  const rotationSpeed = getVisualRotationSpeed(body.rotationPeriodDays);
  const rotationDirection = getThreeRotationDirection(body.rotationDirection);

  useEffect(() => {
    if (isHovered) {
      document.body.style.cursor = 'pointer';
    }

    return () => {
      if (isHovered) {
        document.body.style.cursor = 'default';
      }
    };
  }, [isHovered]);

  useFrame((_, delta) => {
    if (meshRef.current && !isTimePaused) {
      meshRef.current.rotation.y += delta * rotationSpeed * timeScale * rotationDirection;
    }
  });

  return (
    <group
      ref={(group) => onRegister(body.id, group)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(body.id);
      }}
      onPointerEnter={(event) => {
        event.stopPropagation();
        onHover(body.id);
      }}
      onPointerLeave={() => onHover(null)}
    >
      <group rotation-z={(body.axialTiltDegrees * Math.PI) / 180}>
        {qualitySettings.effects ? (
          <SunActivity
            isDimmed={isDimmed}
            isTimePaused={isTimePaused}
            radius={body.radius}
            timeScale={timeScale}
          />
        ) : (
          <mesh ref={meshRef}>
            <sphereGeometry args={[body.radius, 64, 64]} />
            {!qualitySettings.textures ? (
              <meshBasicMaterial
                color={body.color}
                transparent={isDimmed}
                opacity={isDimmed ? 0.18 : 1}
              />
            ) : (
              <TexturedStarSurface body={body} isDimmed={isDimmed} />
            )}
          </mesh>
        )}
        <pointLight color='#ffb56b' intensity={50} distance={35} />
      </group>
    </group>
  );
}
