import { useEffect, useMemo } from 'react';
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, PointsMaterial } from 'three';

export function GalacticBackground() {
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
