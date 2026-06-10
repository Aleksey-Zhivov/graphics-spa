import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { SRGBColorSpace } from 'three';

import { TEXTURE_PATH } from './constants';

export function useCelestialTexture(textureFile: string) {
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
