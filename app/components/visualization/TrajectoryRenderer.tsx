import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { Entity, EntityType, positionToVector3 } from '../../../lib/state/entityTypes';

interface TrajectoryRendererProps {
  entities: Entity[];
  selectedEntityId?: string | null;
  showAllTrajectories?: boolean;
  pastTrailLength?: number;
  projectedTrailLength?: number;
  pastTrailOpacity?: number;
  projectedTrailOpacity?: number;
}

/**
 * TrajectoryRenderer component for visualizing entity movement trajectories
 * 
 * Renders past positions (history) and projected paths (future) for entities
 * Can be configured to show trajectories for selected entities only or all
 */
export const TrajectoryRenderer: React.FC<TrajectoryRendererProps> = ({
  entities,
  selectedEntityId = null,
  showAllTrajectories = false,
  pastTrailLength = 20,
  projectedTrailLength = 10,
  pastTrailOpacity = 0.7,
  projectedTrailOpacity = 0.4,
}) => {
  // Filter entities to only those that should show trajectories
  const entitiesToShow = useMemo(() => {
    if (showAllTrajectories) {
      return entities.filter(e => 
        // Only show for moving entities (vehicles and drones)
        e.type !== EntityType.STATIONARY &&
        // Has some trajectory data
        (e.trajectory.pastPositions.length > 0 || e.trajectory.projectedPath.length > 0)
      );
    } else if (selectedEntityId) {
      return entities.filter(e => 
        e.id === selectedEntityId && 
        (e.trajectory.pastPositions.length > 0 || e.trajectory.projectedPath.length > 0)
      );
    }
    return [];
  }, [entities, selectedEntityId, showAllTrajectories]);

  if (entitiesToShow.length === 0) {
    return null;
  }

  return (
    <group>
      {entitiesToShow.map(entity => (
        <EntityTrajectory 
          key={entity.id}
          entity={entity}
          pastTrailLength={pastTrailLength}
          projectedTrailLength={projectedTrailLength}
          pastTrailOpacity={pastTrailOpacity}
          projectedTrailOpacity={projectedTrailOpacity}
        />
      ))}
    </group>
  );
};

interface EntityTrajectoryProps {
  entity: Entity;
  pastTrailLength: number;
  projectedTrailLength: number;
  pastTrailOpacity: number;
  projectedTrailOpacity: number;
}

/**
 * EntityTrajectory component for rendering a single entity's trajectory
 */
const EntityTrajectory: React.FC<EntityTrajectoryProps> = ({
  entity,
  pastTrailLength,
  projectedTrailLength,
  pastTrailOpacity,
  projectedTrailOpacity,
}) => {
  // Create points for past positions trajectory
  const pastPoints = useMemo(() => {
    // Create a new array with current position plus past positions
    const positions = [
      positionToVector3(entity.position),
      ...entity.trajectory.pastPositions
        .slice(0, pastTrailLength)
        .map(pos => positionToVector3(pos))
    ];
    
    // Ensure the trail has elevation (y) so it doesn't clip into the ground
    positions.forEach(pos => {
      pos.y = Math.max(pos.y, 0.1); // Ensure minimum height above ground
    });
    
    return positions;
  }, [entity.position, entity.trajectory.pastPositions, pastTrailLength]);

  // Create points for projected path trajectory
  const projectedPoints = useMemo(() => {
    // Create a new array with current position plus projected positions
    const positions = [
      positionToVector3(entity.position),
      ...entity.trajectory.projectedPath
        .slice(0, projectedTrailLength)
        .map(pos => positionToVector3(pos))
    ];
    
    // Ensure the trail has elevation (y) so it doesn't clip into the ground
    positions.forEach(pos => {
      pos.y = Math.max(pos.y, 0.1); // Ensure minimum height above ground
    });
    
    return positions;
  }, [entity.position, entity.trajectory.projectedPath, projectedTrailLength]);

  // Get colors based on entity type
  const getTrailColor = (entityType: EntityType): string => {
    switch (entityType) {
      case EntityType.DRONE:
        return '#00ffaa'; // Cyan for drones
      case EntityType.VEHICLE:
        return '#ff9500'; // Orange for vehicles
      default:
        return '#ffffff'; // White for other types
    }
  };

  return (
    <>
      {/* Past positions trajectory */}
      {pastPoints.length > 1 && (
        <Line
          points={pastPoints}
          color={getTrailColor(entity.type)}
          lineWidth={2}
          opacity={pastTrailOpacity}
          transparent={true}
          dashed={false}
        />
      )}
      
      {/* Projected path trajectory */}
      {projectedPoints.length > 1 && (
        <Line
          points={projectedPoints}
          color={getTrailColor(entity.type)}
          lineWidth={1.5}
          opacity={projectedTrailOpacity}
          transparent={true}
          dashed={true}
          dashSize={0.5}
          dashScale={1}
          gapSize={0.2}
        />
      )}
    </>
  );
};

export default TrajectoryRenderer; 