import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, Mesh, ShaderMaterial } from 'three';

const vertexShader = `
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uDensity;
  uniform float uFlowSpeed;
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vPosition;

  float hash(vec3 point) {
    return fract(sin(dot(point, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float noise(vec3 point) {
    vec3 cell = floor(point);
    vec3 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float x00 = mix(hash(cell), hash(cell + vec3(1.0, 0.0, 0.0)), local.x);
    float x10 = mix(
      hash(cell + vec3(0.0, 1.0, 0.0)),
      hash(cell + vec3(1.0, 1.0, 0.0)),
      local.x
    );
    float x01 = mix(
      hash(cell + vec3(0.0, 0.0, 1.0)),
      hash(cell + vec3(1.0, 0.0, 1.0)),
      local.x
    );
    float x11 = mix(
      hash(cell + vec3(0.0, 1.0, 1.0)),
      hash(cell + vec3(1.0, 1.0, 1.0)),
      local.x
    );

    return mix(mix(x00, x10, local.y), mix(x01, x11, local.y), local.z);
  }

  float fbm(vec3 point) {
    float value = 0.0;
    float amplitude = 0.55;

    for (int index = 0; index < 4; index++) {
      value += noise(point) * amplitude;
      point = point * 2.07 + vec3(1.7, 3.1, 2.3);
      amplitude *= 0.48;
    }

    return value;
  }

  void main() {
    vec3 point = normalize(vPosition);
    float flowAngle = uTime * uFlowSpeed + point.y * 0.3;
    mat2 flowRotation = mat2(
      cos(flowAngle), -sin(flowAngle),
      sin(flowAngle), cos(flowAngle)
    );
    point.xz = flowRotation * point.xz;

    vec3 flow =
      point * vec3(7.5, 5.0, 7.5) +
      vec3(uTime * uFlowSpeed * 0.42, -uTime * uFlowSpeed * 0.1, uTime * uFlowSpeed * 0.27);
    float clouds = smoothstep(uDensity, uDensity + 0.18, fbm(flow));
    float latitudeFade = smoothstep(0.02, 0.18, 1.0 - abs(point.y));
    float alpha = clouds * latitudeFade * uOpacity;

    if (alpha < 0.015) {
      discard;
    }

    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function AnimatedClouds({
  axialRotationSpeed,
  color,
  density,
  flowSpeed,
  isDimmed,
  isTimePaused,
  opacity,
  radius,
  timeScale,
}: {
  axialRotationSpeed: number;
  color: [number, number, number];
  density: number;
  flowSpeed: number;
  isDimmed: boolean;
  isTimePaused: boolean;
  opacity: number;
  radius: number;
  timeScale: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: isDimmed ? opacity * 0.22 : opacity },
      uColor: { value: new Color(...color) },
      uDensity: { value: density },
      uFlowSpeed: { value: flowSpeed },
      uTime: { value: 0 },
    }),
    [color, density, flowSpeed, isDimmed, opacity],
  );

  useFrame((_, delta) => {
    if (!isTimePaused && materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * timeScale;
    }

    if (!isTimePaused && meshRef.current) {
      meshRef.current.rotation.y += delta * (axialRotationSpeed - flowSpeed * 0.5) * timeScale;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.022}>
      <sphereGeometry args={[radius, 64, 64]} />
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
