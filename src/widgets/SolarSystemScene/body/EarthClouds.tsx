import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Mesh, ShaderMaterial } from 'three';

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

    for (int index = 0; index < 4; index++) {
      value += noise(point) * amplitude;
      point *= 2.07;
      amplitude *= 0.48;
    }

    return value;
  }

  void main() {
    vec2 flow = vec2(vUv.x * 7.0 + uTime * 0.018, vUv.y * 4.0);
    float clouds = smoothstep(0.5, 0.7, fbm(flow));
    float latitudeFade = smoothstep(0.02, 0.18, vUv.y) * smoothstep(0.98, 0.82, vUv.y);
    float alpha = clouds * latitudeFade * uOpacity;

    if (alpha < 0.015) {
      discard;
    }

    gl_FragColor = vec4(vec3(0.9, 0.96, 1.0), alpha);
  }
`;

export function EarthClouds({
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
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: isDimmed ? 0.1 : 0.5 },
      uTime: { value: 0 },
    }),
    [isDimmed],
  );

  useFrame((_, delta) => {
    if (!isTimePaused && materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * timeScale;
    }

    if (!isTimePaused && meshRef.current) {
      meshRef.current.rotation.y -= delta * 0.012 * timeScale;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.022}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        fragmentShader={fragmentShader}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
