import '../../../lib/three/initialize';
import * as THREE from '../../../lib/three/troika-compat-patch';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { useAppSelector } from '../../../lib/state/hooks';
import { selectAllEntities, selectTrajectoryEnabled, selectTrajectorySettings } from '../../../lib/state/entitySlice';
import { Entity, EntityType } from '../../../lib/state/entityTypes';
import { Environment } from './Environment';
import { EntityRenderer } from './EntityRenderer';
import EntityTrajectories from './EntityTrajectory';

// Safe browser detection
const isBrowser = typeof window !== 'undefined';

// Define entity distance thresholds for memory optimization
const ENTITY_DISTANCE_THRESHOLDS = {
  HIGH_DETAIL: 300,    // Show full details within this distance
  MEDIUM_DETAIL: 1000, // Show reduced details within this distance
  LOW_DETAIL: 3000,    // Show minimal representation within this distance
  CULLING: 5000        // Don't render entities beyond this distance
};

// Entity update frequency by distance
const UPDATE_FREQUENCY = {
  HIGH_DETAIL: 1,      // Update every frame
  MEDIUM_DETAIL: 2,    // Update every 2 frames
  LOW_DETAIL: 5,       // Update every 5 frames
  VERY_FAR: 10         // Update every 10 frames
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
  const frameCountRef = useRef<number>(0);
  
  // Get entities using the selector instead of destructuring from state
  const entities = useAppSelector(selectAllEntities);
  const selectedEntityId = useAppSelector((state) => state.entities.selectedIds[0]);
  const trajectoryEnabled = useAppSelector(selectTrajectoryEnabled);
  const trajectorySettings = useAppSelector(selectTrajectorySettings);

  // Show trajectories for selected entity only or all entities based on settings
  const [showAllTrajectories, setShowAllTrajectories] = useState(false);
  
  // State to track which subset of entities should render trajectories
  // This helps save memory by only calculating trajectories for visible/important entities
  const [entitiesWithTrajectories, setEntitiesWithTrajectories] = useState<Entity[]>([]);

  // Toggle all trajectories with 'T' key - only on client
  useEffect(() => {
    // Skip in SSR
    if (!isBrowser) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        setShowAllTrajectories(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Safely group entities by type
  const groupedEntities = useMemo(() => {
    const grouped = new Map<EntityType, Entity[]>();
    if (entities && Array.isArray(entities)) {
      entities.forEach((entity) => {
        if (entity && entity.type) {
          const group = grouped.get(entity.type) || [];
          group.push(entity);
          grouped.set(entity.type, group);
        }
      });
    }
    return grouped;
  }, [entities]);
  
  // Calculate average position of entities to optimize updates
  const entitiesCenter = useMemo(() => {
    if (!entities || entities.length === 0) return new THREE.Vector3(0, 0, 0);
    
    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;
    
    // Take a sample of entities to avoid expensive calculation on large sets
    const sampleSize = Math.min(entities.length, 20); 
    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor((i / sampleSize) * entities.length);
      const entity = entities[idx];
      if (entity && entity.position) {
        sumX += entity.position.x;
        sumY += entity.position.y;
        sumZ += entity.position.z;
        count++;
      }
    }
    
    return new THREE.Vector3(
      count > 0 ? sumX / count : 0,
      count > 0 ? sumY / count : 0,
      count > 0 ? sumZ / count : 0
    );
  }, [entities]);
  
  // Determine which entities should have trajectories rendered
  // This optimizes memory usage by only calculating and storing trajectories
  // for entities that are visible and important
  useEffect(() => {
    if (!isBrowser || !trajectoryEnabled || !entities.length) {
      setEntitiesWithTrajectories([]);
      return;
    }
    
    // If showing all trajectories, limit to a reasonable number to avoid performance issues
    if (showAllTrajectories) {
      // Take at most 30 entities for all trajectories to avoid overwhelming the GPU
      const maxEntities = Math.min(entities.length, 30);
      setEntitiesWithTrajectories(entities.slice(0, maxEntities));
    } else {
      // Only show trajectory for selected entity
      const selectedEntity = entities.find(e => e.id === selectedEntityId);
      setEntitiesWithTrajectories(selectedEntity ? [selectedEntity] : []);
    }
  }, [entities, selectedEntityId, showAllTrajectories, trajectoryEnabled]);
  
  // Calculate FPS - only on client
  useFrame((_, delta) => {
    // Skip in SSR
    if (!isBrowser) return;
    
    // Increment frame counter for selective updates
    frameCountRef.current += 1;
    
    // Update FPS counter
    const now = Date.now();
    framesRef.current.push(now);
    
    // Remove frames older than 1 second
    while (framesRef.current.length > 0 && framesRef.current[0] < now - 1000) {
      framesRef.current.shift();
    }
    
    // Update FPS every 500ms to avoid too frequent updates
    if (now - lastFpsUpdateRef.current > 500 && typeof onFpsChange === 'function') {
      lastFpsUpdateRef.current = now;
      onFpsChange(framesRef.current.length);
    }
  });

  // Position camera and set initial target - only on client
  useEffect(() => {
    // Skip in SSR
    if (!isBrowser) return;
    
    // Ensure refs exist before accessing
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
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={0.9}
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      <directionalLight 
        position={[-50, 80, -50]} 
        intensity={0.5} 
        castShadow={false}
      />
      
      <hemisphereLight 
        args={[0x3366ff, 0x224422, 0.5]} 
        position={[0, 100, 0]} 
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
      
      {/* Render entities grouped by type */}
      {Array.from(groupedEntities.entries()).map(([type, typeEntities]) => (
        <EntityRenderer 
          key={`renderer-${type}`} 
          entityType={type} 
          entities={typeEntities} 
        />
      ))}
      
      {/* Render entity trajectories if enabled */}
      {trajectoryEnabled && isBrowser && entitiesWithTrajectories.length > 0 && (
        <>
          {Array.from(groupedEntities.entries()).map(([type, entities]) => {
            // Filter entities to only those that should show trajectories
            const filteredEntities = entities.filter(entity => 
              entitiesWithTrajectories.some(e => e.id === entity.id)
            );
            
            // Only render if there are entities to show
            return filteredEntities.length > 0 ? (
              <EntityTrajectories 
                key={`trajectory-${type}`}
                entities={filteredEntities}
                settings={{
                  historyLength: trajectorySettings.maxPastPositions,
                  pastColor: "#4caf50", // Green for past
                  futureColor: "#2196f3", // Blue for future
                  opacity: 0.7,
                  width: 0.1,
                  showFuture: true
                }}
                selectedEntityId={selectedEntityId}
              />
            ) : null;
          })}
        </>
      )}
      
      {/* Trajectory controls helper */}
      {isBrowser && (
        <group position={[0, 0.1, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[80, 0, 80]} receiveShadow>
            <planeGeometry args={[30, 10]} />
            <meshStandardMaterial color="#222222" opacity={0.7} transparent />
          </mesh>
          <Text 
            position={[80, 1, 80]}
            fontSize={1.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {`Press 'T' to ${showAllTrajectories ? 'show selected entity only' : 'show all trajectories'}`}
          </Text>
        </group>
      )}
    </>
  );
};

export default EntityWorldScene; 