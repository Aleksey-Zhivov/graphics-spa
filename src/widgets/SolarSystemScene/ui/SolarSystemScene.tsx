import { Canvas } from '@react-three/fiber';

import { GRAPHICS_QUALITY } from '../model/quality';
import type { SolarSystemSceneProps } from '../model/types';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import styles from './SolarSystemScene.module.scss';
import { SolarSystem } from './SolarSystem';

export function SolarSystemScene({ graphicsQuality = 'high', ...props }: SolarSystemSceneProps) {
  const qualitySettings = GRAPHICS_QUALITY[graphicsQuality];

  return (
    <div className={styles.scene}>
      <SceneErrorBoundary resetKey={`${props.selectedBodyId ?? 'system'}:${graphicsQuality}`}>
        <Canvas
          camera={{
            position: [20, 22, 20],
            fov: 48,
            near: 0.1,
            far: 240,
          }}
          dpr={qualitySettings.dpr}
        >
          <SolarSystem {...props} graphicsQuality={graphicsQuality} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
