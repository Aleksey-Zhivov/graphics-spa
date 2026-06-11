import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

import type { CelestialBodyData } from '@/entities/celestialBody';

const SURFACE_COLORS: Record<string, [number, number, number]> = {
  phobos: [126, 113, 96],
  deimos: [143, 130, 111],
  io: [202, 167, 60],
  europa: [192, 181, 151],
  ganymede: [130, 116, 98],
  callisto: [88, 79, 72],
  titan: [182, 126, 57],
};

export function useProceduralBodyTexture(body: CelestialBodyData) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    let seed = body.id.split('').reduce((value, character) => value + character.charCodeAt(0), 17);
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    if (body.id === 'jupiter' || body.id === 'saturn') {
      const isJupiter = body.id === 'jupiter';
      const bands = isJupiter
        ? ['#d7b58e', '#b87954', '#ead7b1', '#9c5e45', '#d9b989', '#f0ddbd']
        : ['#d8c18d', '#bfa46f', '#e5d3a6', '#c8ac78', '#efdfb8'];

      for (let y = 0; y < canvas.height; y += 1) {
        const latitude = y / canvas.height;
        const wave = Math.sin(latitude * Math.PI * (isJupiter ? 20 : 14)) * 0.5 + 0.5;
        const bandIndex = Math.floor(latitude * bands.length * (isJupiter ? 2.4 : 1.8));
        context.fillStyle = bands[bandIndex % bands.length];
        context.fillRect(0, y, canvas.width, 1);
        context.fillStyle = `rgb(255 255 255 / ${wave * (isJupiter ? 0.035 : 0.055)})`;
        context.fillRect(0, y, canvas.width, 1);
      }

      for (let index = 0; index < 9000; index += 1) {
        const x = random() * canvas.width;
        const y = random() * canvas.height;
        context.fillStyle = `rgb(255 255 255 / ${random() * 0.055})`;
        context.fillRect(x, y, 1 + random() * 4, 1);
      }

      if (isJupiter) {
        const storm = context.createRadialGradient(385, 166, 3, 385, 166, 31);
        storm.addColorStop(0, '#c65f3f');
        storm.addColorStop(0.58, '#a94f3d');
        storm.addColorStop(0.78, '#e0a17e');
        storm.addColorStop(1, 'rgb(224 161 126 / 0%)');
        context.save();
        context.scale(1.8, 0.72);
        context.fillStyle = storm;
        context.beginPath();
        context.arc(214, 230, 31, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      const generatedTexture = new CanvasTexture(canvas);
      generatedTexture.colorSpace = SRGBColorSpace;

      return generatedTexture;
    }

    const baseColor = SURFACE_COLORS[body.id] ?? [143, 130, 111];
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

    const craterCount = body.id === 'io' || body.id === 'titan' ? 14 : 34;

    for (let index = 0; index < craterCount; index += 1) {
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
