import { Html, OrbitControls, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoubleSide, type Group, type Mesh } from 'three';

import {
  CELESTIAL_BODIES,
  type CelestialBodyData,
  type CelestialBodyId,
} from '@/entities/celestialBody';

import styles from './SolarSystemScene.module.scss';

type PlanetProps = {
  body: CelestialBodyData;
  isHovered: boolean;
  onHover: (bodyId: CelestialBodyId | null) => void;
  onSelect: (bodyId: CelestialBodyId) => void;
};

function OrbitLine({ radius, isActive }: { radius: number; isActive: boolean }) {
  return (
    <mesh rotation-x={Math.PI / 2}>
      <ringGeometry args={[radius - 0.018, radius + 0.018, 160]} />
      <meshBasicMaterial
        color={isActive ? '#bce8ff' : '#65809d'}
        transparent
        opacity={isActive ? 0.8 : 0.22}
        side={DoubleSide}
      />
    </mesh>
  );
}

function Planet({ body, isHovered, onHover, onSelect }: PlanetProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !meshRef.current) {
      return;
    }

    const angle = body.initialAngle + clock.elapsedTime * body.orbitalSpeed;
    groupRef.current.position.set(
      Math.cos(angle) * body.orbitRadius,
      0,
      Math.sin(angle) * body.orbitRadius,
    );
    meshRef.current.rotation.y += delta * 0.22;
  });

  return (
    <group
      ref={groupRef}
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

      <mesh
        ref={meshRef}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <sphereGeometry args={[body.radius, 48, 48]} />
        <meshStandardMaterial
          color={body.color}
          emissive={body.color}
          emissiveIntensity={isHovered ? 0.8 : 0.12}
          roughness={0.72}
        />
      </mesh>

      {isHovered && (
        <Html position={[0, body.radius + 0.65, 0]} center distanceFactor={20}>
          <div className={styles.tooltip} aria-live='polite'>
            <strong>{body.name}</strong>
            <span>Планета земной группы</span>
            <span>{body.distanceLabel}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function SolarSystem() {
  const navigate = useNavigate();
  const [hoveredBodyId, setHoveredBodyId] = useState<CelestialBodyId | null>(null);
  const sun = CELESTIAL_BODIES[0];
  const planets = CELESTIAL_BODIES.slice(1);

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[0, 0, 0]} intensity={180} distance={70} />
      <Stars radius={95} depth={50} count={3000} factor={3} fade speed={0.3} />

      <mesh>
        <sphereGeometry args={[sun.radius, 64, 64]} />
        <meshBasicMaterial color={sun.color} />
        <pointLight color='#ffb56b' intensity={50} distance={35} />
      </mesh>

      {planets.map((body) => (
        <group key={body.id}>
          <OrbitLine radius={body.orbitRadius} isActive={hoveredBodyId === body.id} />
          <Planet
            body={body}
            isHovered={hoveredBodyId === body.id}
            onHover={setHoveredBodyId}
            onSelect={(bodyId) => navigate(`/body/${bodyId}`)}
          />
        </group>
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={16}
        maxDistance={48}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        target={[1, 0, 0]}
      />
    </>
  );
}

export function SolarSystemScene() {
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
        <SolarSystem />
      </Canvas>
    </div>
  );
}
