import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import { Entity, EntityType } from '@/lib/state/entityTypes';
import { getStatusColor } from '@/lib/state/entityTypes';

interface EntityRendererProps {
  entities: Entity[];
  entityType: EntityType;
}

// Renderer for groups of entities of the same type using instanced rendering
export const EntityRenderer: React.FC<EntityRendererProps> = ({ entities, entityType }) => {
  // Determine the appropriate geometry based on entity type
  const geometry = useMemo(() => {
    switch (entityType) {
      case EntityType.DRONE:
        return new THREE.ConeGeometry(0.5, 1, 8);
      case EntityType.VEHICLE:
        return new THREE.BoxGeometry(1, 0.5, 2);
      case EntityType.STATIONARY:
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
      default:
        return new THREE.SphereGeometry(0.5, 8, 8);
    }
  }, [entityType]);

  // No entities to render
  if (entities.length === 0) {
    return null;
  }

  return (
    <Instances
      limit={1000} // Maximum number of instances
      geometry={geometry}
      material={new THREE.MeshStandardMaterial({
        roughness: 0.5,
        metalness: 0.8,
      })}
    >
      {entities.map((entity) => (
        <EntityInstance key={entity.id} entity={entity} />
      ))}
    </Instances>
  );
};

interface EntityInstanceProps {
  entity: Entity;
}

// Individual entity instance
const EntityInstance: React.FC<EntityInstanceProps> = ({ entity }) => {
  // Convert position data to THREE Vector3
  const position = useMemo(() => {
    return new THREE.Vector3(
      entity.position.x,
      entity.position.y,
      entity.position.z
    );
  }, [entity.position]);

  // Convert rotation data if available
  const rotation = useMemo(() => {
    if (!entity.rotation) return [0, 0, 0] as const;
    return [entity.rotation.x, entity.rotation.y, entity.rotation.z] as const;
  }, [entity.rotation]);

  // Get color based on entity status
  const color = useMemo(() => {
    return getStatusColor(entity.status);
  }, [entity.status]);

  return (
    <Instance
      position={position}
      rotation={rotation}
      scale={1}
      color={color}
    />
  );
};

export default EntityRenderer; 