import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import {
  getBodiesByKind,
  getCelestialBodyById,
  getChildBodies,
  type CelestialBodyId,
} from '@/entities/celestialBody';

import { GalacticBackground } from '../background/GalacticBackground';
import { OrbitingBody } from '../body/OrbitingBody';
import { OrbitLine } from '../body/OrbitLine';
import { Star } from '../body/Star';
import { GRAPHICS_QUALITY } from '../model/quality';
import type { SolarSystemSceneProps } from '../model/types';
import { CameraFocus } from './CameraFocus';

export function SolarSystem({
  graphicsQuality = 'medium',
  isTimePaused = false,
  resetViewSignal = 0,
  selectedBodyId,
  timeScale = 1,
}: SolarSystemSceneProps) {
  const qualitySettings = GRAPHICS_QUALITY[graphicsQuality];
  const navigate = useNavigate();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const bodyGroups = useRef(new Map<CelestialBodyId, Group>());
  const [cameraInteractionSignal, setCameraInteractionSignal] = useState(0);
  const [hoveredBodyId, setHoveredBodyId] = useState<CelestialBodyId | null>(null);
  const sun = getBodiesByKind('star')[0];
  const selectedBody = getCelestialBodyById(selectedBodyId);
  const primaryBodies = sun ? getChildBodies(sun.id) : [];
  const selectedPrimaryBody =
    selectedBody?.parentId === sun?.id
      ? selectedBody
      : getCelestialBodyById(selectedBody?.parentId ?? undefined);
  const isFocusedView = Boolean(selectedBody);

  const registerBody = (bodyId: CelestialBodyId, group: Group | null) => {
    if (group) {
      bodyGroups.current.set(bodyId, group);
      return;
    }

    bodyGroups.current.delete(bodyId);
  };

  if (!sun) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[0, 0, 0]} intensity={180} distance={70} />
      <Stars
        radius={95}
        depth={50}
        count={qualitySettings.primaryStars}
        factor={2.6}
        fade
        speed={0.2}
      />
      <Stars
        radius={120}
        depth={45}
        count={qualitySettings.secondaryStars}
        factor={4.5}
        saturation={0.35}
        fade
        speed={0.08}
      />
      <GalacticBackground starCount={qualitySettings.galacticStars} />

      <Suspense
        fallback={
          <mesh>
            <sphereGeometry args={[sun.radius, 64, 64]} />
            <meshBasicMaterial
              color={sun.color}
              transparent={Boolean(selectedBody)}
              opacity={selectedBody ? 0.18 : 1}
            />
            <pointLight color='#ffb56b' intensity={50} distance={35} />
          </mesh>
        }
      >
        <Star
          body={sun}
          graphicsQuality={graphicsQuality}
          isDimmed={Boolean(selectedBody && selectedBody.id !== sun.id)}
          isHovered={hoveredBodyId === sun.id}
          isInteractive={!isFocusedView}
          isTimePaused={isTimePaused}
          timeScale={timeScale}
          onHover={setHoveredBodyId}
          onRegister={registerBody}
          onSelect={(bodyId) => navigate(`/body/${bodyId}`)}
        />
      </Suspense>

      {primaryBodies.map((body) => {
        const childBodies = selectedPrimaryBody?.id === body.id ? getChildBodies(body.id) : [];

        return (
          <group key={body.id}>
            <OrbitLine
              body={body}
              isActive={hoveredBodyId === body.id}
              isDimmed={Boolean(selectedBody)}
            />
            <OrbitingBody
              body={body}
              childBodies={childBodies}
              childrenAreInteractive={Boolean(selectedBody && selectedPrimaryBody?.id === body.id)}
              graphicsQuality={graphicsQuality}
              hoveredBodyId={hoveredBodyId}
              isDimmed={Boolean(selectedBody && selectedBody.id !== body.id)}
              isInteractive={!isFocusedView}
              isOrbitPaused={Boolean(selectedBody) || isTimePaused}
              isTimePaused={isTimePaused}
              selectedBodyId={selectedBodyId}
              showChildren={childBodies.length > 0}
              timeScale={timeScale}
              onHover={setHoveredBodyId}
              onRegister={registerBody}
              onSelect={(bodyId) => navigate(`/body/${bodyId}`)}
            />
          </group>
        );
      })}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={selectedBody?.kind === 'satellite' ? 0.45 : selectedBody ? 2.4 : 16}
        maxDistance={selectedBody?.kind === 'satellite' ? 4 : selectedBody ? 11 : 48}
        minPolarAngle={selectedBody ? Math.PI / 5 : Math.PI / 6}
        maxPolarAngle={selectedBody ? Math.PI / 1.65 : Math.PI / 2.2}
        onStart={() => setCameraInteractionSignal((signal) => signal + 1)}
        target={[1, 0, 0]}
      />

      <CameraFocus
        interactionSignal={cameraInteractionSignal}
        resetViewSignal={resetViewSignal}
        selectedBody={selectedBody}
        bodyGroups={bodyGroups}
        controlsRef={controlsRef}
      />
    </>
  );
}
