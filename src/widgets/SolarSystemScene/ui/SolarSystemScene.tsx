import { Canvas } from '@react-three/fiber';

import type { SolarSystemSceneProps } from '../model/types';
import styles from './SolarSystemScene.module.scss';
import { SolarSystem } from './SolarSystem';

export function SolarSystemScene(props: SolarSystemSceneProps) {
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
        <SolarSystem {...props} />
      </Canvas>
    </div>
  );
}
