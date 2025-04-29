import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Entity, EntityType, getStatusColor, positionToVector3, rotationToEuler } from '../../../lib/state/entityTypes';
import { useAppSelector } from '../../../lib/state/hooks';
import AnimatedEntityMovement from './AnimatedEntityMovement';

// Safe browser detection
const isBrowser = typeof window !== 'undefined';

interface EntityRendererProps {
  entities: Entity[];
  entityType: EntityType;
}

// Renderer for groups of entities of the same type using instanced rendering
export const EntityRenderer: React.FC<EntityRendererProps> = ({ entities, entityType }) => {
  // Get selected entity ID from store
  const selectedEntityId = useAppSelector((state) => state.entities.selectedIds[0]);
  const { camera } = useThree();
  
  // State for tracking current LOD level
  const [currentLOD, setCurrentLOD] = useState(0);
  
  // Reference to the instance mesh
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create dummy for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Determine the appropriate geometry based on entity type and LOD level
  const geometry = useMemo(() => {
    // High detail geometries (LOD 0)
    if (currentLOD === 0) {
      switch (entityType) {
        case EntityType.DRONE:
          return new THREE.ConeGeometry(0.5, 1, 16);
        case EntityType.VEHICLE:
          return new THREE.BoxGeometry(1, 0.5, 2, 8, 4, 8);
        case EntityType.STATIONARY:
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
        default:
          return new THREE.SphereGeometry(0.5, 16, 16);
      }
    }
    // Medium detail geometries (LOD 1)
    else if (currentLOD === 1) {
      switch (entityType) {
        case EntityType.DRONE:
          return new THREE.ConeGeometry(0.5, 1, 8);
        case EntityType.VEHICLE:
          return new THREE.BoxGeometry(1, 0.5, 2, 4, 2, 4);
        case EntityType.STATIONARY:
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        default:
          return new THREE.SphereGeometry(0.5, 8, 8);
      }
    }
    // Low detail geometries (LOD 2)
    else {
      switch (entityType) {
        case EntityType.DRONE:
          return new THREE.ConeGeometry(0.5, 1, 6);
        case EntityType.VEHICLE:
          return new THREE.BoxGeometry(1, 0.5, 2);
        case EntityType.STATIONARY:
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
        default:
          return new THREE.SphereGeometry(0.5, 6, 6);
      }
    }
  }, [entityType, currentLOD]);

  // Check camera distance to the center of the scene to update LOD level
  useFrame(() => {
    if (entities.length > 0) {
      // Calculate average position of entities as a reference point
      const centerEntity = entities[0];
      const distance = camera.position.distanceTo(new THREE.Vector3(
        centerEntity.position.x,
        centerEntity.position.y,
        centerEntity.position.z
      ));
      
      // Update LOD based on distance
      if (distance > 5000 && currentLOD !== 2) {
        setCurrentLOD(2); // Low detail
      } else if (distance > 1000 && distance <= 5000 && currentLOD !== 1) {
        setCurrentLOD(1); // Medium detail
      } else if (distance <= 1000 && currentLOD !== 0) {
        setCurrentLOD(0); // High detail
      }
    }
  });

  // Create appropriate material with optimization based on LOD level
  const material = useMemo(() => {
    // High quality material for close-up view
    if (currentLOD === 0) {
      return new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.9,
        emissive: new THREE.Color(0x222222),
        emissiveIntensity: 0.2,
      });
    } 
    // Medium quality for medium distance
    else if (currentLOD === 1) {
      return new THREE.MeshStandardMaterial({
        roughness: 0.4,
        metalness: 0.7,
        emissive: new THREE.Color(0x111111),
        emissiveIntensity: 0.1,
      });
    }
    // Simple material for far view
    else {
      return new THREE.MeshLambertMaterial();
    }
  }, [currentLOD]);

  // Update instances on each frame
  useFrame(() => {
    // Skip in SSR
    if (!isBrowser || !meshRef.current || !entities.length) return;

    // Make sure we have a valid instance count
    if (meshRef.current.count !== entities.length) {
      meshRef.current.count = entities.length;
    }
    
    // Update each entity's position and rotation
    entities.forEach((entity, i) => {
      if (!entity || !entity.position || !meshRef.current) return;
      
      // Position the entity
      dummy.position.copy(positionToVector3(entity.position));
      
      // Add a vertical offset based on entity type
      if (entityType === EntityType.DRONE) {
        dummy.position.y += 2; // Drones float higher
      }
      
      // Set rotation based on entity type
      if (entity.rotation) {
        const rotation = rotationToEuler(entity.rotation);
        dummy.rotation.copy(rotation);
      } else {
        // Default rotation if none specified
        dummy.rotation.set(0, 0, 0);
      }
      
      // Update matrix and apply to the instanced mesh
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    
    // Mark the instance matrices as needing an update
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // No entities to render
  if (entities.length === 0) {
    return null;
  }

  return (
    <>
      {/* Regular entities */}
      <Instances
        limit={1000} // Maximum number of instances
        geometry={geometry}
        material={material}
        ref={meshRef}
      >
        {entities
          .filter(entity => entity.id !== selectedEntityId)
          .map((entity) => (
            <EntityInstance 
              key={entity.id} 
              entity={entity} 
              isSelected={false} 
              lodLevel={currentLOD}
            />
          ))}
      </Instances>

      {/* Selected entity with highlight effect */}
      {entities.filter(entity => entity.id === selectedEntityId).map(entity => (
        <SelectedEntityHighlight 
          key={`selected-${entity.id}`} 
          entity={entity} 
          entityType={entityType} 
          lodLevel={currentLOD}
        />
      ))}
    </>
  );
};

interface EntityInstanceProps {
  entity: Entity;
  isSelected: boolean;
  lodLevel: number;
}

// Individual entity instance
const EntityInstance: React.FC<EntityInstanceProps> = ({ entity, isSelected, lodLevel }) => {
  // Get color based on entity status
  const color = useMemo(() => {
    return getStatusColor(entity.status);
  }, [entity.status]);

  // Scale up selected entities
  const scale = isSelected ? 1.5 : 1;

  // For better performance, we only animate selected or close entities
  const shouldAnimate = isSelected || lodLevel === 0;

  if (shouldAnimate) {
    return (
      <AnimatedEntityMovement entity={entity}>
        <Instance scale={scale} color={color} />
      </AnimatedEntityMovement>
    );
  }

  // For distant entities, use direct positioning without animation
  return (
    <Instance
      position={new THREE.Vector3(
        entity.position.x,
        entity.position.y,
        entity.position.z
      )}
      rotation={[
        entity.rotation?.x || 0,
        entity.rotation?.y || 0,
        entity.rotation?.z || 0
      ]}
      scale={scale}
      color={color}
    />
  );
};

interface SelectedEntityHighlightProps {
  entity: Entity;
  entityType: EntityType;
  lodLevel: number;
}

// Special component for highlighted selected entity
const SelectedEntityHighlight: React.FC<SelectedEntityHighlightProps> = ({ entity, entityType, lodLevel }) => {
  // Get color based on entity status with increased brightness
  const entityColor = getStatusColor(entity.status);

  // Determine highlight effects based on LOD level
  const showComplexHighlight = lodLevel < 2; // Only show complex effects for LOD 0 and 1

  // Get appropriate geometry for entity type based on LOD level
  const geometry = useMemo(() => {
    // High detail geometries (LOD 0)
    if (lodLevel === 0) {
      switch (entityType) {
        case EntityType.DRONE:
          return new THREE.ConeGeometry(0.5, 1, 16);
        case EntityType.VEHICLE:
          return new THREE.BoxGeometry(1, 0.5, 2, 8, 4, 8);
        case EntityType.STATIONARY:
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
        default:
          return new THREE.SphereGeometry(0.5, 16, 16);
      }
    }
    // Medium detail geometries (LOD 1)
    else if (lodLevel === 1) {
      switch (entityType) {
        case EntityType.DRONE:
          return new THREE.ConeGeometry(0.5, 1, 8);
        case EntityType.VEHICLE:
          return new THREE.BoxGeometry(1, 0.5, 2, 4, 2, 4);
        case EntityType.STATIONARY:
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        default:
          return new THREE.SphereGeometry(0.5, 8, 8);
      }
    }
    // Low detail geometries (LOD 2)
    else {
      switch (entityType) {
        case EntityType.DRONE:
          return new THREE.ConeGeometry(0.5, 1, 6);
        case EntityType.VEHICLE:
          return new THREE.BoxGeometry(1, 0.5, 2);
        case EntityType.STATIONARY:
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
        default:
          return new THREE.SphereGeometry(0.5, 6, 6);
      }
    }
  }, [entityType, lodLevel]);

  return (
    <AnimatedEntityMovement entity={entity}>
      <group>
        {/* Main entity mesh with enhanced material */}
        <mesh geometry={geometry} scale={1.2}>
          <meshStandardMaterial 
            color={entityColor}
            roughness={0.2}
            metalness={1.0}
            emissive={entityColor}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Highlight glow sphere - only show for LOD 0 and 1 */}
        {showComplexHighlight && (
          <mesh scale={1.8}>
            <sphereGeometry args={[1, Math.max(8, 16 - lodLevel * 4), Math.max(8, 16 - lodLevel * 4)]} />
            <meshBasicMaterial 
              color={entityColor}
              transparent
              opacity={0.15}
            />
          </mesh>
        )}

        {/* Selection indicator ring - simplified for LOD 2 */}
        <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.1, Math.max(8, 16 - lodLevel * 4), Math.max(16, 32 - lodLevel * 8)]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Pulsing animation effect - only for LOD 0 and 1 */}
        {showComplexHighlight && <PulsingRing color={entityColor} lodLevel={lodLevel} />}
      </group>
    </AnimatedEntityMovement>
  );
};

// Pulsing ring animation for selected entity
const PulsingRing = ({ color, lodLevel }: { color: string, lodLevel: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Animate the ring scale - reduced complexity for LOD 1
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Simpler animation for LOD 1
      const frequency = lodLevel === 0 ? 3 : 2;
      const scale = 1 + 0.2 * Math.sin(clock.getElapsedTime() * frequency);
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  // Adjust segment count based on LOD
  const segments = lodLevel === 0 ? 32 : 16;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 2.0, segments]} />
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.5} />
    </mesh>
  );
};

export default EntityRenderer; 