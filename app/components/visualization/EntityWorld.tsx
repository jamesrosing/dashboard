import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppSelector } from '../../../lib/state/hooks';
import { selectAllEntities } from '../../../lib/state/entitySlice';
import { Entity, EntityType } from '../../../lib/state/entityTypes';
import { Environment } from './Environment';
import { EntityRenderer } from './EntityRenderer';

interface EntityWorldProps {
  onFpsChange?: (fps: number) => void;
}

// Main EntityWorld container that sets up the Three.js canvas
export const EntityWorld: React.FC<EntityWorldProps> = ({ onFpsChange }) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black">
      <Canvas shadows gl={{ antialias: true }}>
        <fog attach="fog" args={['#202030', 30, 100]} />
        <EntityWorldScene onFpsChange={onFpsChange} />
        <Stats className="stats" />
      </Canvas>
    </div>
  );
};

interface EntityWorldSceneProps {
  onFpsChange?: (fps: number) => void;
}

// Main scene component that manages the 3D environment
const EntityWorldScene: React.FC<EntityWorldSceneProps> = ({ onFpsChange }) => {
  const entities = useAppSelector(selectAllEntities);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  // Using 'any' type for OrbitControls ref due to the complex typing - eslint no-explicit-any is disabled in project config
  const controlsRef = useRef<any>(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  // Camera settings
  const cameraSettings = useMemo(() => ({
    position: [30, 30, 30] as [number, number, number],
    fov: 60,
    near: 0.1,
    far: 1000,
  }), []);

  // Set up the scene when it mounts
  useEffect(() => {
    if (controlsRef.current) {
      // Configure orbit controls
      controlsRef.current.minDistance = 10;
      controlsRef.current.maxDistance = 100;
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
      controlsRef.current.dampingFactor = 0.1;
      controlsRef.current.enableDamping = true;
    }
  }, []);

  // Create entity groups for efficient rendering
  const entityGroups = useMemo(() => {
    // Group entities by type for more efficient processing
    const groups: Record<EntityType, Entity[]> = {
      [EntityType.DRONE]: [],
      [EntityType.VEHICLE]: [],
      [EntityType.STATIONARY]: [],
    };

    entities.forEach(entity => {
      if (entity.type in groups) {
        groups[entity.type].push(entity);
      }
    });

    return groups;
  }, [entities]);

  // Track performance metrics
  useFrame(() => {
    // Calculate FPS
    const counter = fpsCounterRef.current;
    counter.frames++;
    
    const currentTime = performance.now();
    if (currentTime - counter.lastTime >= 1000) {
      // Calculate FPS and report it
      const fps = Math.round((counter.frames * 1000) / (currentTime - counter.lastTime));
      if (onFpsChange) {
        onFpsChange(fps);
      }
      
      // Reset counter
      counter.frames = 0;
      counter.lastTime = currentTime;
    }
  });

  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={cameraSettings.position}
        fov={cameraSettings.fov}
        near={cameraSettings.near}
        far={cameraSettings.far}
      />
      <OrbitControls ref={controlsRef} />

      {/* Lighting system */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 20, 15]} 
        intensity={1.0} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      <hemisphereLight args={['#ffffff', '#667799', 0.5]} />

      {/* Environment (terrain, grid, etc.) */}
      <Environment />

      {/* Entity renderers by type */}
      <EntityRenderer 
        entities={entityGroups[EntityType.DRONE]} 
        entityType={EntityType.DRONE} 
      />
      <EntityRenderer 
        entities={entityGroups[EntityType.VEHICLE]} 
        entityType={EntityType.VEHICLE} 
      />
      <EntityRenderer 
        entities={entityGroups[EntityType.STATIONARY]} 
        entityType={EntityType.STATIONARY} 
      />
    </>
  );
};

export default EntityWorld; 