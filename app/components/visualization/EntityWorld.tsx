import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppSelector } from '../../../lib/state/hooks';
import { selectAllEntities, selectEntityById } from '../../../lib/state/entitySlice';
import { Entity, EntityType } from '../../../lib/state/entityTypes';
import { Environment } from './Environment';
import { EntityRenderer } from './EntityRenderer';

interface EntityWorldProps {
  onFpsChange?: (fps: number) => void;
}

// Main EntityWorld container that sets up the Three.js canvas
export const EntityWorld: React.FC<EntityWorldProps> = ({ onFpsChange }) => {
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Only initialize canvas after component is mounted
  useEffect(() => {
    setCanvasInitialized(true);
  }, []);

  // If not initialized yet, return a placeholder
  if (!canvasInitialized) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Initializing 3D view...</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black to-gray-900">
      <Canvas shadows gl={{ antialias: true }}>
        <fog attach="fog" args={['#050508', 100, 350]} />
        <EntityWorldScene onFpsChange={onFpsChange} />
      </Canvas>
    </div>
  );
};

interface EntityWorldSceneProps {
  onFpsChange?: (fps: number) => void;
}

// Main scene component that manages the 3D environment
const EntityWorldScene: React.FC<EntityWorldSceneProps> = ({ onFpsChange }) => {
  // Use ANY to avoid the complex type issues with drei components
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const framesRef = useRef<number[]>([]);
  const lastFpsUpdateRef = useRef<number>(0);
  
  // Get entities using the selector instead of destructuring from state
  const entities = useAppSelector(selectAllEntities);
  const selectedEntityId = useAppSelector((state) => state.entities.selectedIds[0]);
  
  const groupedEntities = useMemo(() => {
    const grouped = new Map<EntityType, Entity[]>();
    if (entities) {
      entities.forEach((entity) => {
        const group = grouped.get(entity.type) || [];
        group.push(entity);
        grouped.set(entity.type, group);
      });
    }
    return grouped;
  }, [entities]);
  
  // Calculate FPS
  useFrame((_, delta) => {
    // Update FPS counter
    const now = Date.now();
    framesRef.current.push(now);
    
    // Remove frames older than 1 second
    while (framesRef.current.length > 0 && framesRef.current[0] < now - 1000) {
      framesRef.current.shift();
    }
    
    // Update FPS every 500ms to avoid too frequent updates
    if (now - lastFpsUpdateRef.current > 500) {
      lastFpsUpdateRef.current = now;
      onFpsChange?.(framesRef.current.length);
    }
  });

  // Position camera and set initial target
  useEffect(() => {
    if (cameraRef.current && controlsRef.current) {
      // Set better camera position for a wider view
      cameraRef.current.position.set(0, 60, 120);
      cameraRef.current.updateProjectionMatrix();
      
      // Set controls target to center of the scene
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[0, 60, 120]} 
        fov={45}
        near={0.1}
        far={1000}
      />
      
      <OrbitControls 
        ref={controlsRef}
        enableDamping 
        dampingFactor={0.1} 
        rotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={20}
        maxDistance={300}
      />
      
      <Environment />
      
      {Array.from(groupedEntities.entries()).map(([type, typeEntities]) => (
        <EntityRenderer 
          key={type} 
          entityType={type} 
          entities={typeEntities} 
        />
      ))}
    </>
  );
};

export default EntityWorld; 