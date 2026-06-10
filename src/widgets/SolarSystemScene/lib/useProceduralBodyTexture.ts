import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

import type { CelestialBodyData } from '@/entities/celestialBody';

export function useProceduralBodyTexture(body: CelestialBodyData) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    let seed = body.id === 'phobos' ? 47 : 83;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const baseColor = body.id === 'phobos' ? [126, 113, 96] : [143, 130, 111];
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
  }, [body.id]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}
