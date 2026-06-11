import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, BackSide, Group, MeshBasicMaterial, ShaderMaterial } from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.55;

    for (int index = 0; index < 5; index++) {
      value += noise(point) * amplitude;
      point = point * 2.03 + vec2(3.1, 1.7);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 pixelUv = floor(vUv * vec2(180.0, 90.0)) / vec2(180.0, 90.0);
    float latitudeFlow = sin(pixelUv.y * 19.0 + uTime * 0.75) * 0.025;
    vec2 slowFlow = vec2(
      pixelUv.x * 8.0 + uTime * 0.11 + latitudeFlow,
      pixelUv.y * 5.0 - uTime * 0.035
    );
    vec2 counterFlow = vec2(
      pixelUv.x * 15.0 - uTime * 0.07,
      pixelUv.y * 9.0 + uTime * 0.055
    );
    float convection = fbm(slowFlow);
    float granules = noise(counterFlow);
    float sectorPulse = sin(
      floor(pixelUv.x * 28.0) * 1.7 +
      floor(pixelUv.y * 14.0) * 0.9 +
      uTime * 2.2
    );
    float energy = clamp(convection * 0.82 + granules * 0.34 + sectorPulse * 0.1, 0.0, 1.0);
    float sunspotNoise = fbm(vec2(pixelUv.x * 5.0 - uTime * 0.025, pixelUv.y * 3.0));
    float sunspots = smoothstep(0.73, 0.82, sunspotNoise) * 0.72;
    vec3 deepOrange = vec3(0.78, 0.08, 0.0);
    vec3 orange = vec3(1.0, 0.28, 0.015);
    vec3 yellow = vec3(1.0, 0.9, 0.25);
    vec3 color = mix(deepOrange, orange, smoothstep(0.18, 0.58, energy));
    color = mix(color, yellow, smoothstep(0.55, 0.9, energy));
    color *= 1.0 - sunspots;

    gl_FragColor = vec4(color, uOpacity);
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
