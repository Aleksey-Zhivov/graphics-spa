import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, BackSide, Group, MeshBasicMaterial, ShaderMaterial } from 'three';

const vertexShader = `
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vPosition;

  void main() {
    vec3 point = normalize(vPosition);
    float cells =
      sin(point.x * 22.0 + uTime * 0.7) *
      sin(point.y * 27.0 - uTime * 0.45) *
      sin(point.z * 24.0 + uTime * 0.55);
    float glow = smoothstep(-0.35, 0.75, cells);
    vec3 color = mix(vec3(1.0, 0.22, 0.01), vec3(1.0, 0.82, 0.18), glow);

    gl_FragColor = vec4(color, (0.08 + glow * 0.2) * uOpacity);
  }
`;

const PROMINENCES = [
  { rotation: [0.15, 0.3, 0.2], scale: 1, speed: 0.7 },
  { rotation: [1.3, -0.4, 1.1], scale: 0.72, speed: 0.9 },
  { rotation: [-0.8, 0.7, -0.5], scale: 0.55, speed: 1.15 },
] as const;

export function SunActivity({
  isDimmed,
  isTimePaused,
  radius,
  timeScale,
}: {
  isDimmed: boolean;
  isTimePaused: boolean;
  radius: number;
  timeScale: number;
}) {
  const surfaceMaterialRef = useRef<ShaderMaterial>(null);
  const coronaMaterialRef = useRef<MeshBasicMaterial>(null);
  const prominenceRefs = useRef<Array<Group | null>>([]);
  const elapsedTime = useRef(0);
  const surfaceUniforms = useMemo(
    () => ({
      uOpacity: { value: isDimmed ? 0.18 : 1 },
      uTime: { value: 0 },
    }),
    [isDimmed],
  );

  useFrame((_, delta) => {
    if (!isTimePaused) {
      elapsedTime.current += delta * timeScale;
    }

    const time = elapsedTime.current;

    if (surfaceMaterialRef.current) {
      surfaceMaterialRef.current.uniforms.uTime.value = time;
    }

    if (coronaMaterialRef.current) {
      coronaMaterialRef.current.opacity =
        (isDimmed ? 0.025 : 0.11) + Math.sin(time * 0.85) * (isDimmed ? 0.008 : 0.025);
    }

    prominenceRefs.current.forEach((group, index) => {
      if (!group) {
        return;
      }

      const prominence = PROMINENCES[index];
      group.rotation.z = time * 0.025 * prominence.speed;
      const pulse = prominence.scale + Math.sin(time * prominence.speed + index) * 0.08;
      group.scale.setScalar(pulse);
    });
  });

  return (
    <>
      <mesh scale={1.006}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          ref={surfaceMaterialRef}
          blending={AdditiveBlending}
          depthWrite={false}
          fragmentShader={fragmentShader}
          transparent
          uniforms={surfaceUniforms}
          vertexShader={vertexShader}
        />
      </mesh>

      <mesh scale={1.16}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial
          ref={coronaMaterialRef}
          blending={AdditiveBlending}
          color='#ff7a24'
          depthWrite={false}
          opacity={isDimmed ? 0.025 : 0.11}
          side={BackSide}
          transparent
        />
      </mesh>

      {PROMINENCES.map((prominence, index) => (
        <group
          key={index}
          ref={(group) => {
            prominenceRefs.current[index] = group;
          }}
          rotation={prominence.rotation}
          scale={prominence.scale}
        >
          <mesh position={[radius * 0.88, 0, 0]} rotation={[0, 0, -Math.PI / 2.7]}>
            <torusGeometry args={[radius * 0.34, radius * 0.018, 8, 32, Math.PI * 1.15]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color='#ff7a24'
              depthWrite={false}
              opacity={isDimmed ? 0.04 : 0.36}
              transparent
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
