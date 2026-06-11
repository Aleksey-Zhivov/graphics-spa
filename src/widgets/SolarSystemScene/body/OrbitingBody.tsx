import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Group, Mesh } from 'three';

import {
  getOrbitPosition,
  getSatelliteVisualOrbitalSpeed,
  getVisualOrbitalSpeed,
  getVisualRotationSpeed,
  type CelestialBodyData,
  type CelestialBodyId,
} from '@/entities/celestialBody';

import styles from '../ui/SolarSystemScene.module.scss';
import { getThreeRotationDirection } from '../lib/motion';
import { GRAPHICS_QUALITY, type GraphicsQuality } from '../model/quality';
import { AnimatedClouds } from './AnimatedClouds';
import { Atmosphere } from './Atmosphere';
import { BodySurface } from './BodySurface';
import { OrbitLine } from './OrbitLine';

const KIND_LABELS = {
  planet: 'Планета',
  dwarfPlanet: 'Карликовая планета',
  satellite: 'Спутник',
  comet: 'Комета',
  asteroid: 'Астероид',
  star: 'Звезда',
} as const;

type OrbitingBodyProps = {
  body: CelestialBodyData;
  childBodies: CelestialBodyData[];
  graphicsQuality: GraphicsQuality;
  hoveredBodyId: CelestialBodyId | null;
  isDimmed: boolean;
  isOrbitPaused: boolean;
  isTimePaused: boolean;
  selectedBodyId?: CelestialBodyId;
  showChildren: boolean;
  timeScale: number;
  onHover: (bodyId: CelestialBodyId | null) => void;
  onRegister: (bodyId: CelestialBodyId, group: Group | null) => void;
  onSelect: (bodyId: CelestialBodyId) => void;
};

export function OrbitingBody({
  body,
  childBodies,
  graphicsQuality,
  hoveredBodyId,
  isDimmed,
  isOrbitPaused,
  isTimePaused,
  selectedBodyId,
  showChildren,
  timeScale,
  onHover,
  onRegister,
  onSelect,
}: OrbitingBodyProps) {
  const bodyRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const orbitalTime = useRef(0);
  const isHovered = hoveredBodyId === body.id;
  const isSelected = selectedBodyId === body.id;
  const orbitParameters = useMemo(
    () => ({
      semiMajorAxis: body.orbitRadius,
      eccentricity: body.eccentricity,
      perihelionAngle: body.perihelionAngle,
    }),
    [body],
  );
  const initialPosition = useMemo(
    () => getOrbitPosition(body.initialAngle, orbitParameters).toArray(),
    [body.initialAngle, orbitParameters],
  );
  const orbitalSpeed =
    body.kind === 'satellite'
      ? getSatelliteVisualOrbitalSpeed(body.orbitalPeriodDays)
      : getVisualOrbitalSpeed(body.orbitalPeriodDays);
  const orbitDirection = body.orbitDirection === 'prograde' ? 1 : -1;
  const rotationSpeed = getVisualRotationSpeed(body.rotationPeriodDays);
  const rotationDirection = getThreeRotationDirection(body.rotationDirection);
  const irregularScale: [number, number, number] =
    body.shape === 'irregular' ? [1.35, 0.9, 1] : [1, 1, 1];

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
    if (!bodyRef.current || !meshRef.current) {
      return;
    }

    if (!isOrbitPaused) {
      orbitalTime.current += delta * timeScale;
      const position = getOrbitPosition(
        body.initialAngle + orbitalTime.current * orbitalSpeed * orbitDirection,
        orbitParameters,
      );
      bodyRef.current.position.copy(position);

      if (body.isTidallyLocked) {
        meshRef.current.rotation.y = Math.atan2(position.z, position.x);
      }
    }

    if (!isTimePaused && !body.isTidallyLocked) {
      meshRef.current.rotation.y += delta * rotationSpeed * timeScale * rotationDirection;
    }
  });

  return (
    <group
      position={initialPosition}
      ref={(group) => {
        bodyRef.current = group;
        onRegister(body.id, group);
      }}
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
      <mesh>
        <sphereGeometry args={[body.radius * (body.kind === 'satellite' ? 2.8 : 1.8), 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group rotation-z={(body.axialTiltDegrees * Math.PI) / 180}>
        <Atmosphere body={body} graphicsQuality={graphicsQuality} isDimmed={isDimmed} />

        <mesh ref={meshRef} scale={irregularScale}>
          <sphereGeometry args={[body.radius, body.kind === 'satellite' ? 32 : 48, 48]} />
          <Suspense
            fallback={
              <meshStandardMaterial
                color={body.color}
                emissive={body.color}
                emissiveIntensity={isHovered || isSelected ? 0.4 : 0.05}
                opacity={isDimmed ? 0.18 : 1}
                roughness={0.82}
                transparent={isDimmed}
              />
            }
          >
            <BodySurface
              body={body}
              graphicsQuality={graphicsQuality}
              isActive={isHovered || isSelected}
              isDimmed={isDimmed}
            />
          </Suspense>
        </mesh>

        {GRAPHICS_QUALITY[graphicsQuality].effects && body.id === 'earth' && (
          <AnimatedClouds
            color={[0.9, 0.96, 1]}
            density={0.48}
            flowSpeed={0.16}
            isDimmed={isDimmed}
            isTimePaused={isTimePaused}
            opacity={0.58}
            radius={body.radius}
            timeScale={timeScale}
          />
        )}

        {GRAPHICS_QUALITY[graphicsQuality].effects && body.id === 'venus' && (
          <AnimatedClouds
            color={[1, 0.78, 0.34]}
            density={0.42}
            flowSpeed={-0.1}
            isDimmed={isDimmed}
            isTimePaused={isTimePaused}
            opacity={0.32}
            radius={body.radius}
            timeScale={timeScale}
          />
        )}
      </group>

      {isHovered && !isSelected && (
        <Html
          position={[0, body.radius + (body.kind === 'satellite' ? 0.28 : 0.65), 0]}
          center
          distanceFactor={body.kind === 'satellite' ? 8 : 20}
        >
          <div className={styles.tooltip} aria-live='polite'>
            <strong>{body.name}</strong>
            <span>{KIND_LABELS[body.kind]}</span>
            <span>{body.kind === 'satellite' ? body.orbitalPeriodLabel : body.distanceLabel}</span>
          </div>
        </Html>
      )}

      {showChildren &&
        childBodies.map((childBody) => (
          <group key={childBody.id}>
            {!selectedBodyId || selectedBodyId === body.id ? (
              <OrbitLine
                body={childBody}
                isActive={hoveredBodyId === childBody.id}
                isDimmed={false}
              />
            ) : null}
            <OrbitingBody
              body={childBody}
              childBodies={[]}
              graphicsQuality={graphicsQuality}
              hoveredBodyId={hoveredBodyId}
              isDimmed={Boolean(selectedBodyId && selectedBodyId !== childBody.id)}
              isOrbitPaused={isTimePaused || selectedBodyId === childBody.id}
              isTimePaused={isTimePaused || selectedBodyId === childBody.id}
              selectedBodyId={selectedBodyId}
              showChildren={false}
              timeScale={timeScale}
              onHover={onHover}
              onRegister={onRegister}
              onSelect={onSelect}
            />
          </group>
        ))}
    </group>
  );
}
