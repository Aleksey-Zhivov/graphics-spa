import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import { Group, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import type { CelestialBodyData, CelestialBodyId } from '@/entities/celestialBody';

import { SYSTEM_CAMERA_POSITION, SYSTEM_CAMERA_TARGET } from '../lib/constants';

export function CameraFocus({
  resetViewSignal,
  selectedBody,
  bodyGroups,
  controlsRef,
}: {
  resetViewSignal: number;
  selectedBody?: CelestialBodyData;
  bodyGroups: RefObject<Map<CelestialBodyId, Group>>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const camera = useThree((state) => state.camera);
  const targetPosition = useRef(new Vector3());
  const desiredPosition = useRef(new Vector3());
  const selectedCameraOffset = useRef(new Vector3(0, 2.4, 5.2));
  const largeSatelliteOffset = useRef(new Vector3(0, 0.42, 1.05));
  const smallBodyOffset = useRef(new Vector3(0, 0.3, 0.9));
  const isTransitioning = useRef(true);

  useEffect(() => {
    isTransitioning.current = true;
  }, [resetViewSignal, selectedBody]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;

    if (!controls || !isTransitioning.current) {
      return;
    }

    if (selectedBody) {
      const selectedGroup = bodyGroups.current.get(selectedBody.id);

      if (!selectedGroup) {
        return;
      }

      selectedGroup.getWorldPosition(targetPosition.current);
      const offset =
        selectedBody.kind === 'satellite'
          ? selectedBody.radius >= 0.15
            ? largeSatelliteOffset.current
            : smallBodyOffset.current
          : selectedCameraOffset.current;
      desiredPosition.current.copy(targetPosition.current).add(offset);
    } else {
      targetPosition.current.copy(SYSTEM_CAMERA_TARGET);
      desiredPosition.current.copy(SYSTEM_CAMERA_POSITION);
    }

    const damping = 1 - Math.exp(-delta * 2.2);
    camera.position.lerp(desiredPosition.current, damping);
    controls.target.lerp(targetPosition.current, damping);
    controls.update();

    if (
      camera.position.distanceTo(desiredPosition.current) < 0.04 &&
      controls.target.distanceTo(targetPosition.current) < 0.04
    ) {
      camera.position.copy(desiredPosition.current);
      controls.target.copy(targetPosition.current);
      controls.update();
      isTransitioning.current = false;
    }
  });

  return null;
}
