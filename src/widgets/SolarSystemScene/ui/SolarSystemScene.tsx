import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
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
  getSatelliteVisualOrbitalSpeed,
  getVisualOrbitalSpeed,
  getVisualRotationSpeed,
  type CelestialBodyData,
  type CelestialBodyId,
  type RotationDirection,
  type SatelliteData,
  type SatelliteId,
} from '@/entities/celestialBody';

import styles from './SolarSystemScene.module.scss';

const SYSTEM_CAMERA_POSITION = new Vector3(20, 22, 20);
const SYSTEM_CAMERA_TARGET = new Vector3(1, 0, 0);
const TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/`;

function getThreeRotationDirection(direction: RotationDirection): number {
  return direction === 'prograde' ? -1 : 1;
}

type SolarSystemSceneProps = {
  isTimePaused?: boolean;
  resetViewSignal?: number;
  selectedBodyId?: CelestialBodyId;
  selectedSatelliteId?: SatelliteId;
  timeScale?: number;
};

type PlanetProps = {
  body: CelestialBodyData;
  hoveredSatelliteId: SatelliteId | null;
  isDimmed: boolean;
  isHovered: boolean;
  isSelected: boolean;
  isSystemPaused: boolean;
  isTimePaused: boolean;
  selectedSatelliteId?: SatelliteId;
  timeScale: number;
  onHover: (bodyId: CelestialBodyId | null) => void;
  onRegister: (objectId: string, group: Group | null) => void;
  onSatelliteHover: (satelliteId: SatelliteId | null) => void;
  onSatelliteSelect: (satelliteId: SatelliteId) => void;
  onSelect: (bodyId: CelestialBodyId) => void;
};

type SatelliteOrbitLineProps = {
  isActive: boolean;
  radius: number;
};

function SatelliteOrbitLine({ isActive, radius }: SatelliteOrbitLineProps) {
  return (
    <mesh rotation-x={Math.PI / 2}>
      <ringGeometry args={[radius - 0.008, radius + 0.008, 96]} />
      <meshBasicMaterial
        color={isActive ? '#bce8ff' : '#65809d'}
        transparent
        opacity={isActive ? 0.78 : 0.34}
        side={DoubleSide}
      />
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

    for (let index = 0; index < 1500; index += 1) {
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
        color: '#b9c9e1',
        depthWrite: false,
        opacity: 0.31,
        size: 0.42,
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

function useProceduralSatelliteTexture(satellite: SatelliteData) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    let seed = satellite.id === 'phobos' ? 47 : 83;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const baseColor = satellite.id === 'phobos' ? [126, 113, 96] : [143, 130, 111];
    const imageData = context.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const pixelIndex = (y * canvas.width + x) * 4;
        const broadVariation = Math.sin(x * 0.035) * 7 + Math.cos(y * 0.052) * 6;
        const noise = (random() - 0.5) * 28 + broadVariation;

        imageData.data[pixelIndex] = Math.max(0, Math.min(255, baseColor[0] + noise));
        imageData.data[pixelIndex + 1] = Math.max(0, Math.min(255, baseColor[1] + noise));
        imageData.data[pixelIndex + 2] = Math.max(0, Math.min(255, baseColor[2] + noise));
        imageData.data[pixelIndex + 3] = 255;
      }
    }

    context.putImageData(imageData, 0, 0);

    for (let index = 0; index < 34; index += 1) {
      const radius = 2 + random() * 14;
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const gradient = context.createRadialGradient(
        x - radius * 0.25,
        y - radius * 0.25,
        radius * 0.15,
        x,
        y,
        radius,
      );
      gradient.addColorStop(0, 'rgb(50 45 40 / 65%)');
      gradient.addColorStop(0.72, 'rgb(96 86 75 / 32%)');
      gradient.addColorStop(1, 'rgb(185 169 148 / 24%)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    const generatedTexture = new CanvasTexture(canvas);
    generatedTexture.colorSpace = SRGBColorSpace;

    return generatedTexture;
  }, [satellite]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

function SatelliteSurface({
  isActive,
  satellite,
}: {
  isActive: boolean;
  satellite: SatelliteData;
}) {
  const texture = useCelestialTexture(satellite.textureFile!);

  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.92}
      emissive={satellite.color}
      emissiveIntensity={isActive ? 0.2 : 0.025}
    />
  );
}

function ProceduralSatelliteSurface({
  isActive,
  satellite,
}: {
  isActive: boolean;
  satellite: SatelliteData;
}) {
  const texture = useProceduralSatelliteTexture(satellite);

  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.96}
      emissive={satellite.color}
      emissiveIntensity={isActive ? 0.18 : 0.02}
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
  isHovered,
  isSelected,
  isTimePaused,
  objectId,
  onHover,
  onRegister,
  onSelect,
  satellite,
  showOrbit,
  timeScale,
}: {
  isHovered: boolean;
  isSelected: boolean;
  isTimePaused: boolean;
  objectId: string;
  onHover: (satelliteId: SatelliteId | null) => void;
  onRegister: (objectId: string, group: Group | null) => void;
  onSelect: (satelliteId: SatelliteId) => void;
  satellite: SatelliteData;
  showOrbit: boolean;
  timeScale: number;
}) {
  const orbitRef = useRef<Group>(null);
  const satelliteRef = useRef<Group>(null);
  const orbitalTime = useRef(0);
  const orbitalSpeed = getSatelliteVisualOrbitalSpeed(satellite.orbitalPeriodDays);
  const orbitDirection = getThreeRotationDirection(satellite.orbitDirection);
  const rotationSpeed = getVisualRotationSpeed(satellite.rotationPeriodDays);
  const rotationDirection = getThreeRotationDirection(satellite.rotationDirection);
  const irregularScale: [number, number, number] =
    satellite.id === 'moon' ? [1, 1, 1] : [1.35, 0.9, 1];

  useFrame((_, delta) => {
    if (!orbitRef.current || !satelliteRef.current) {
      return;
    }

    if (!isTimePaused) {
      orbitalTime.current += delta * timeScale;
    }

    orbitRef.current.rotation.y =
      (satellite.initialAngle + orbitalTime.current * orbitalSpeed) * orbitDirection;

    if (!isTimePaused && !satellite.isTidallyLocked) {
      satelliteRef.current.rotation.y += delta * rotationSpeed * timeScale * rotationDirection;
    }
  });

  return (
    <>
      {showOrbit && (
        <SatelliteOrbitLine isActive={isHovered || isSelected} radius={satellite.orbitRadius} />
      )}
      <group ref={orbitRef}>
        <group
          position={[satellite.orbitRadius, 0, 0]}
          ref={(group) => {
            satelliteRef.current = group;
            onRegister(objectId, group);
          }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(satellite.id);
          }}
          onPointerEnter={(event) => {
            event.stopPropagation();
            document.body.style.cursor = 'pointer';
            onHover(satellite.id);
          }}
          onPointerLeave={() => {
            document.body.style.cursor = 'default';
            onHover(null);
          }}
        >
          <mesh scale={irregularScale}>
            <sphereGeometry args={[satellite.radius, 32, 32]} />
            {satellite.textureFile ? (
              <Suspense fallback={<meshStandardMaterial color={satellite.color} roughness={0.9} />}>
                <SatelliteSurface isActive={isHovered || isSelected} satellite={satellite} />
              </Suspense>
            ) : (
              <ProceduralSatelliteSurface
                isActive={isHovered || isSelected}
                satellite={satellite}
              />
            )}
          </mesh>

          <mesh>
            <sphereGeometry args={[satellite.radius * 2.8, 20, 20]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {isHovered && !isSelected && (
            <Html position={[0, satellite.radius + 0.28, 0]} center distanceFactor={8}>
              <div className={styles.tooltip} aria-live='polite'>
                <strong>{satellite.name}</strong>
                <span>Спутник</span>
                <span>{satellite.orbitalPeriodLabel}</span>
              </div>
            </Html>
          )}
        </group>
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
  hoveredSatelliteId,
  isDimmed,
  isHovered,
  isSelected,
  isSystemPaused,
  isTimePaused,
  selectedSatelliteId,
  timeScale,
  onHover,
  onRegister,
  onSatelliteHover,
  onSatelliteSelect,
  onSelect,
}: PlanetProps) {
  const planetRef = useRef<Group>(null);
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
  const orbitDirection = body.orbitDirection === 'prograde' ? 1 : -1;
  const rotationSpeed = getVisualRotationSpeed(body.rotationPeriodDays);
  const rotationDirection = getThreeRotationDirection(body.rotationDirection);

  useFrame((_, delta) => {
    if (!planetRef.current || !meshRef.current) {
      return;
    }

    if (!isSystemPaused) {
      orbitalTime.current += delta * timeScale;
      planetRef.current.position.copy(
        getOrbitPosition(
          body.initialAngle + orbitalTime.current * orbitalSpeed * orbitDirection,
          orbitParameters,
        ),
      );
    }

    if (!isTimePaused) {
      meshRef.current.rotation.y += delta * rotationSpeed * timeScale * rotationDirection;
    }
  });

  return (
    <group
      position={initialPosition}
      ref={(group) => {
        planetRef.current = group;
        onRegister(body.id, group);
      }}
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

      <group rotation-z={(body.axialTiltDegrees * Math.PI) / 180}>
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
      </group>

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
            isHovered={hoveredSatelliteId === satellite.id}
            isSelected={selectedSatelliteId === satellite.id}
            isTimePaused={isTimePaused || Boolean(selectedSatelliteId)}
            objectId={`${body.id}:${satellite.id}`}
            onHover={onSatelliteHover}
            onRegister={onRegister}
            onSelect={onSatelliteSelect}
            satellite={satellite}
            showOrbit={!selectedSatelliteId}
            timeScale={timeScale}
          />
        ))}
    </group>
  );
}

function Sun({
  body,
  isDimmed,
  isTimePaused,
  timeScale,
}: {
  body: CelestialBodyData;
  isDimmed: boolean;
  isTimePaused: boolean;
  timeScale: number;
}) {
  const texture = useCelestialTexture(body.textureFile);
  const meshRef = useRef<Mesh>(null);
  const rotationSpeed = getVisualRotationSpeed(body.rotationPeriodDays);
  const rotationDirection = getThreeRotationDirection(body.rotationDirection);

  useFrame((_, delta) => {
    if (meshRef.current && !isTimePaused) {
      meshRef.current.rotation.y += delta * rotationSpeed * timeScale * rotationDirection;
    }
  });

  return (
    <group rotation-z={(body.axialTiltDegrees * Math.PI) / 180}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[body.radius, 64, 64]} />
        <meshBasicMaterial map={texture} transparent={isDimmed} opacity={isDimmed ? 0.18 : 1} />
      </mesh>
      <pointLight color='#ffb56b' intensity={50} distance={35} />
    </group>
  );
}

function CameraFocus({
  resetViewSignal,
  selectedBodyId,
  selectedSatelliteId,
  bodyGroups,
  controlsRef,
}: {
  resetViewSignal: number;
  selectedBodyId?: CelestialBodyId;
  selectedSatelliteId?: SatelliteId;
  bodyGroups: RefObject<Map<string, Group>>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const camera = useThree((state) => state.camera);
  const targetPosition = useRef(new Vector3());
  const desiredPosition = useRef(new Vector3());
  const selectedCameraOffset = useRef(new Vector3(0, 2.4, 5.2));
  const moonCameraOffset = useRef(new Vector3(0, 0.42, 1.05));
  const smallSatelliteCameraOffset = useRef(new Vector3(0, 0.3, 0.9));
  const isTransitioning = useRef(true);

  useEffect(() => {
    isTransitioning.current = true;
  }, [resetViewSignal, selectedBodyId, selectedSatelliteId]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;

    if (!controls || !isTransitioning.current) {
      return;
    }

    if (selectedBodyId) {
      const selectedObjectId = selectedSatelliteId
        ? `${selectedBodyId}:${selectedSatelliteId}`
        : selectedBodyId;
      const selectedGroup = bodyGroups.current.get(selectedObjectId);

      if (!selectedGroup) {
        return;
      }

      selectedGroup.getWorldPosition(targetPosition.current);
      desiredPosition.current
        .copy(targetPosition.current)
        .add(
          selectedSatelliteId
            ? selectedSatelliteId === 'moon'
              ? moonCameraOffset.current
              : smallSatelliteCameraOffset.current
            : selectedCameraOffset.current,
        );
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
  selectedSatelliteId,
  timeScale = 1,
}: SolarSystemSceneProps) {
  const navigate = useNavigate();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const bodyGroups = useRef(new Map<string, Group>());
  const [hoveredBodyId, setHoveredBodyId] = useState<CelestialBodyId | null>(null);
  const [hoveredSatelliteId, setHoveredSatelliteId] = useState<SatelliteId | null>(null);
  const sun = CELESTIAL_BODIES[0];
  const planets = CELESTIAL_BODIES.slice(1);

  const registerBody = (objectId: string, group: Group | null) => {
    if (group) {
      bodyGroups.current.set(objectId, group);
      return;
    }

    bodyGroups.current.delete(objectId);
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
        <Sun
          body={sun}
          isDimmed={Boolean(selectedBodyId)}
          isTimePaused={isTimePaused}
          timeScale={timeScale}
        />
      </Suspense>

      {planets.map((body) => {
        const isSelected = selectedBodyId === body.id;
        const isDimmed = Boolean(
          (selectedBodyId && !isSelected) || (selectedSatelliteId && isSelected),
        );

        return (
          <group key={body.id}>
            <PlanetOrbitLine
              body={body}
              isActive={hoveredBodyId === body.id}
              isDimmed={Boolean(selectedBodyId)}
            />
            <Planet
              body={body}
              hoveredSatelliteId={hoveredSatelliteId}
              isDimmed={isDimmed}
              isHovered={hoveredBodyId === body.id}
              isSelected={isSelected}
              isSystemPaused={Boolean(selectedBodyId) || isTimePaused}
              isTimePaused={isTimePaused}
              selectedSatelliteId={selectedSatelliteId}
              timeScale={timeScale}
              onHover={setHoveredBodyId}
              onRegister={registerBody}
              onSatelliteHover={setHoveredSatelliteId}
              onSatelliteSelect={(satelliteId) => navigate(`/body/${body.id}/moon/${satelliteId}`)}
              onSelect={(bodyId) => navigate(`/body/${bodyId}`)}
            />
          </group>
        );
      })}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={selectedSatelliteId ? 0.45 : selectedBodyId ? 2.4 : 16}
        maxDistance={selectedSatelliteId ? 4 : selectedBodyId ? 11 : 48}
        minPolarAngle={selectedBodyId ? Math.PI / 5 : Math.PI / 6}
        maxPolarAngle={selectedBodyId ? Math.PI / 1.65 : Math.PI / 2.2}
        target={[1, 0, 0]}
      />

      <CameraFocus
        resetViewSignal={resetViewSignal}
        selectedBodyId={selectedBodyId}
        selectedSatelliteId={selectedSatelliteId}
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
  selectedSatelliteId,
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
          selectedSatelliteId={selectedSatelliteId}
          timeScale={timeScale}
        />
      </Canvas>
    </div>
  );
}
