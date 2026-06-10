import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  PointsMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import {
  CELESTIAL_BODIES,
  createOrbitPoints,
  getOrbitPosition,
  getVisualOrbitalSpeed,
  type CelestialBodyData,
  type CelestialBodyId,
  type SatelliteData,
} from '@/entities/celestialBody';

import styles from './SolarSystemScene.module.scss';

const SYSTEM_CAMERA_POSITION = new Vector3(20, 22, 20);
const SYSTEM_CAMERA_TARGET = new Vector3(1, 0, 0);
const TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/`;

type SolarSystemSceneProps = {
  isTimePaused?: boolean;
  resetViewSignal?: number;
  selectedBodyId?: CelestialBodyId;
  timeScale?: number;
};

type PlanetProps = {
  body: CelestialBodyData;
  isDimmed: boolean;
  isHovered: boolean;
  isSelected: boolean;
  isSystemPaused: boolean;
  isTimePaused: boolean;
  timeScale: number;
  onHover: (bodyId: CelestialBodyId | null) => void;
  onRegister: (bodyId: CelestialBodyId, group: Group | null) => void;
  onSelect: (bodyId: CelestialBodyId) => void;
};

type SatelliteOrbitLineProps = {
  radius: number;
};

function SatelliteOrbitLine({ radius }: SatelliteOrbitLineProps) {
  return (
    <mesh rotation-x={Math.PI / 2}>
      <ringGeometry args={[radius - 0.008, radius + 0.008, 96]} />
      <meshBasicMaterial color='#65809d' transparent opacity={0.34} side={DoubleSide} />
    </mesh>
  );
}

function GalacticBackground() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    let seed = 31;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < 900; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 52 + random() * 40;
      const bandOffset = (random() - 0.5) * 12;

      positions.push(
        Math.cos(angle) * radius,
        bandOffset + Math.sin(angle * 1.7) * 4,
        Math.sin(angle) * radius,
      );
    }

    const bandGeometry = new BufferGeometry();
    bandGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    return bandGeometry;
  }, []);
  const material = useMemo(
    () =>
      new PointsMaterial({
        blending: AdditiveBlending,
        color: '#9fb8d5',
        depthWrite: false,
        opacity: 0.17,
        size: 0.34,
        sizeAttenuation: true,
        transparent: true,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <points geometry={geometry} material={material} rotation={[0.18, 0, -0.48]} />;
}

function useCelestialTexture(textureFile: string) {
  const sourceTexture = useTexture(`${TEXTURE_PATH}${textureFile}`);
  const renderer = useThree((state) => state.gl);
  const texture = useMemo(() => {
    const configuredTexture = sourceTexture.clone();

    configuredTexture.colorSpace = SRGBColorSpace;
    configuredTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    configuredTexture.needsUpdate = true;

    return configuredTexture;
  }, [renderer, sourceTexture]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

function Atmosphere({ body, isDimmed }: { body: CelestialBodyData; isDimmed: boolean }) {
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

function SatelliteSurface({ satellite }: { satellite: SatelliteData }) {
  const texture = useCelestialTexture(satellite.textureFile!);

  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.92}
      emissive={satellite.color}
      emissiveIntensity={0.025}
    />
  );
}

function PlanetOrbitLine({
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
      opacity={isDimmed ? 0.05 : isActive ? 0.8 : 0.22}
    />
  );
}

function Satellite({
  isTimePaused,
  satellite,
  timeScale,
}: {
  isTimePaused: boolean;
  satellite: SatelliteData;
  timeScale: number;
}) {
  const orbitRef = useRef<Group>(null);
  const orbitalTime = useRef(0);

  useFrame((_, delta) => {
    if (!orbitRef.current) {
      return;
    }

    if (!isTimePaused) {
      orbitalTime.current += delta * timeScale;
    }

    orbitRef.current.rotation.y =
      satellite.initialAngle + orbitalTime.current * satellite.orbitalSpeed;
  });

  return (
    <>
      <SatelliteOrbitLine radius={satellite.orbitRadius} />
      <group ref={orbitRef}>
        <mesh position={[satellite.orbitRadius, 0, 0]}>
          <sphereGeometry args={[satellite.radius, 24, 24]} />
          {satellite.textureFile ? (
            <Suspense fallback={<meshStandardMaterial color={satellite.color} roughness={0.9} />}>
              <SatelliteSurface satellite={satellite} />
            </Suspense>
          ) : (
            <meshStandardMaterial
              color={satellite.color}
              roughness={0.9}
              emissive={satellite.color}
              emissiveIntensity={0.08}
            />
          )}
        </mesh>
      </group>
    </>
  );
}

function PlanetSurface({
  body,
  isDimmed,
  isHovered,
  isSelected,
}: {
  body: CelestialBodyData;
  isDimmed: boolean;
  isHovered: boolean;
  isSelected: boolean;
}) {
  const texture = useCelestialTexture(body.textureFile);

  return (
    <meshStandardMaterial
      map={texture}
      emissive={body.color}
      emissiveIntensity={isHovered || isSelected ? 0.2 : 0.015}
      opacity={isDimmed ? 0.18 : 1}
      roughness={0.82}
      transparent={isDimmed}
    />
  );
}

function Planet({
  body,
  isDimmed,
  isHovered,
  isSelected,
  isSystemPaused,
  isTimePaused,
  timeScale,
  onHover,
  onRegister,
  onSelect,
}: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const orbitalTime = useRef(0);
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
  const orbitalSpeed = getVisualOrbitalSpeed(body.orbitalPeriodDays);

  useFrame((_, delta) => {
    const group = meshRef.current?.parent;

    if (!group || !meshRef.current) {
      return;
    }

    if (!isSystemPaused) {
      orbitalTime.current += delta * timeScale;
      group.position.copy(
        getOrbitPosition(body.initialAngle + orbitalTime.current * orbitalSpeed, orbitParameters),
      );
    }

    if (!isTimePaused) {
      meshRef.current.rotation.y += delta * 0.22 * timeScale;
    }
  });

  return (
    <group
      position={initialPosition}
      ref={(group) => onRegister(body.id, group)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(body.id);
      }}
      onPointerEnter={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover(body.id);
      }}
      onPointerLeave={() => {
        document.body.style.cursor = 'default';
        onHover(null);
      }}
    >
      <mesh>
        <sphereGeometry args={[body.radius * 1.8, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Atmosphere body={body} isDimmed={isDimmed} />

      <mesh ref={meshRef}>
        <sphereGeometry args={[body.radius, 48, 48]} />
        <Suspense
          fallback={
            <meshStandardMaterial
              color={body.color}
              emissive={body.color}
              emissiveIntensity={isHovered || isSelected ? 0.45 : 0.08}
              opacity={isDimmed ? 0.18 : 1}
              roughness={0.72}
              transparent={isDimmed}
            />
          }
        >
          <PlanetSurface
            body={body}
            isDimmed={isDimmed}
            isHovered={isHovered}
            isSelected={isSelected}
          />
        </Suspense>
      </mesh>

      {isHovered && !isSelected && (
        <Html position={[0, body.radius + 0.65, 0]} center distanceFactor={20}>
          <div className={styles.tooltip} aria-live='polite'>
            <strong>{body.name}</strong>
            <span>Планета земной группы</span>
            <span>{body.distanceLabel}</span>
          </div>
        </Html>
      )}

      {isSelected &&
        body.satellites.map((satellite) => (
          <Satellite
            key={satellite.id}
            isTimePaused={isTimePaused}
            satellite={satellite}
            timeScale={timeScale}
          />
        ))}
    </group>
  );
}

function Sun({ body, isDimmed }: { body: CelestialBodyData; isDimmed: boolean }) {
  const texture = useCelestialTexture(body.textureFile);

  return (
    <mesh>
      <sphereGeometry args={[body.radius, 64, 64]} />
      <meshBasicMaterial map={texture} transparent={isDimmed} opacity={isDimmed ? 0.18 : 1} />
      <pointLight color='#ffb56b' intensity={50} distance={35} />
    </mesh>
  );
}

function CameraFocus({
  resetViewSignal,
  selectedBodyId,
  bodyGroups,
  controlsRef,
}: {
  resetViewSignal: number;
  selectedBodyId?: CelestialBodyId;
  bodyGroups: RefObject<Map<CelestialBodyId, Group>>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const camera = useThree((state) => state.camera);
  const targetPosition = useRef(new Vector3());
  const desiredPosition = useRef(new Vector3());
  const selectedCameraOffset = useRef(new Vector3(0, 2.4, 5.2));
  const isTransitioning = useRef(true);

  useEffect(() => {
    isTransitioning.current = true;
  }, [resetViewSignal, selectedBodyId]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;

    if (!controls || !isTransitioning.current) {
      return;
    }

    if (selectedBodyId) {
      const selectedGroup = bodyGroups.current.get(selectedBodyId);

      if (!selectedGroup) {
        return;
      }

      selectedGroup.getWorldPosition(targetPosition.current);
      desiredPosition.current.copy(targetPosition.current).add(selectedCameraOffset.current);
    } else {
      targetPosition.current.copy(SYSTEM_CAMERA_TARGET);
      desiredPosition.current.copy(SYSTEM_CAMERA_POSITION);
    }

    const damping = 1 - Math.exp(-delta * 2.2);
    camera.position.lerp(desiredPosition.current, damping);
    controls.target.lerp(targetPosition.current, damping);
    controls.update();

    const cameraDistance = camera.position.distanceTo(desiredPosition.current);
    const targetDistance = controls.target.distanceTo(targetPosition.current);

    if (cameraDistance < 0.04 && targetDistance < 0.04) {
      camera.position.copy(desiredPosition.current);
      controls.target.copy(targetPosition.current);
      controls.update();
      isTransitioning.current = false;
    }
  });

  return null;
}

function SolarSystem({
  isTimePaused = false,
  resetViewSignal = 0,
  selectedBodyId,
  timeScale = 1,
}: SolarSystemSceneProps) {
  const navigate = useNavigate();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const bodyGroups = useRef(new Map<CelestialBodyId, Group>());
  const [hoveredBodyId, setHoveredBodyId] = useState<CelestialBodyId | null>(null);
  const sun = CELESTIAL_BODIES[0];
  const planets = CELESTIAL_BODIES.slice(1);

  const registerBody = (bodyId: CelestialBodyId, group: Group | null) => {
    if (group) {
      bodyGroups.current.set(bodyId, group);
      return;
    }

    bodyGroups.current.delete(bodyId);
  };

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[0, 0, 0]} intensity={180} distance={70} />
      <Stars radius={95} depth={50} count={2600} factor={2.6} fade speed={0.2} />
      <Stars radius={120} depth={45} count={700} factor={4.5} saturation={0.35} fade speed={0.08} />
      <GalacticBackground />

      <Suspense
        fallback={
          <mesh>
            <sphereGeometry args={[sun.radius, 64, 64]} />
            <meshBasicMaterial
              color={sun.color}
              transparent={Boolean(selectedBodyId)}
              opacity={selectedBodyId ? 0.18 : 1}
            />
            <pointLight color='#ffb56b' intensity={50} distance={35} />
          </mesh>
        }
      >
        <Sun body={sun} isDimmed={Boolean(selectedBodyId)} />
      </Suspense>

      {planets.map((body) => {
        const isSelected = selectedBodyId === body.id;
        const isDimmed = Boolean(selectedBodyId && !isSelected);

        return (
          <group key={body.id}>
            <PlanetOrbitLine
              body={body}
              isActive={hoveredBodyId === body.id}
              isDimmed={Boolean(selectedBodyId)}
            />
            <Planet
              body={body}
              isDimmed={isDimmed}
              isHovered={hoveredBodyId === body.id}
              isSelected={isSelected}
              isSystemPaused={Boolean(selectedBodyId) || isTimePaused}
              isTimePaused={isTimePaused}
              timeScale={timeScale}
              onHover={setHoveredBodyId}
              onRegister={registerBody}
              onSelect={(bodyId) => navigate(`/body/${bodyId}`)}
            />
          </group>
        );
      })}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={selectedBodyId ? 2.4 : 16}
        maxDistance={selectedBodyId ? 11 : 48}
        minPolarAngle={selectedBodyId ? Math.PI / 5 : Math.PI / 6}
        maxPolarAngle={selectedBodyId ? Math.PI / 1.65 : Math.PI / 2.2}
        target={[1, 0, 0]}
      />

      <CameraFocus
        resetViewSignal={resetViewSignal}
        selectedBodyId={selectedBodyId}
        bodyGroups={bodyGroups}
        controlsRef={controlsRef}
      />
    </>
  );
}

export function SolarSystemScene({
  isTimePaused,
  resetViewSignal,
  selectedBodyId,
  timeScale,
}: SolarSystemSceneProps) {
  return (
    <div className={styles.scene}>
      <Canvas
        camera={{
          position: [20, 22, 20],
          fov: 48,
          near: 0.1,
          far: 240,
        }}
        dpr={[1, 1.75]}
      >
        <SolarSystem
          isTimePaused={isTimePaused}
          resetViewSignal={resetViewSignal}
          selectedBodyId={selectedBodyId}
          timeScale={timeScale}
        />
      </Canvas>
    </div>
  );
}
