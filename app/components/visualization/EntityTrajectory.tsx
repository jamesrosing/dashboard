import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Entity, Position, positionToVector3 } from '../../../lib/state/entityTypes';

interface EntityTrajectoryProps {
  entity: Entity;
  settings: {
    historyLength: number;
    pastColor: string;
    futureColor: string;
    opacity: number;
    width: number;
    showFuture: boolean;
  };
}

/**
 * Component to render entity movement trajectories
 * Shows past positions and optionally projected future path
 */
export const EntityTrajectory: React.FC<EntityTrajectoryProps> = ({ 
  entity, 
  settings
}) => {
  // Add a safeguard for client-side only execution
  const isBrowser = typeof window !== 'undefined';
  
  // Memory for animation timeouts
  const animationRef = useRef<{
    updateTimer: number | null;
    lastUpdate: number;
  }>({ updateTimer: null, lastUpdate: 0 });

  // We can't use strong typing for these refs due to drei Line component
  const pastLineRef = useRef(null);
  const futureLineRef = useRef(null);
  
  // Calculate points for past trajectory
  const pastPoints = useMemo(() => {
    // Ensure we have valid data to work with
    if (!entity.trajectory?.pastPositions || entity.trajectory.pastPositions.length === 0) {
      // Return at least two points at the current position to avoid errors
      const pos = positionToVector3(entity.position);
      return [pos, new THREE.Vector3(pos.x, pos.y, pos.z + 0.001)];
    }
    
    // Limit to the specified history length
    const limitedHistory = [...entity.trajectory.pastPositions]
      .slice(-Math.min(settings.historyLength, entity.trajectory.pastPositions.length));
    
    // Include current position and convert all to Vector3
    return [...limitedHistory, entity.position].map(pos => {
      // Ensure each position is valid
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
        return new THREE.Vector3(0, 0, 0);
      }
      return new THREE.Vector3(pos.x, pos.y, pos.z);
    });
  }, [entity.position, entity.trajectory?.pastPositions, settings.historyLength]);
  
  // Calculate points for future projected path
  const futurePoints = useMemo(() => {
    // Ensure we have valid data to work with and future path display is enabled
    if (!settings.showFuture || 
        !entity.trajectory?.projectedPath || 
        entity.trajectory.projectedPath.length === 0) {
      // Return at least two points at the current position to avoid errors
      const pos = positionToVector3(entity.position);
      return [pos, new THREE.Vector3(pos.x, pos.y, pos.z + 0.001)];
    }
    
    // Start from current position and extend to future points, converting all to Vector3
    return [entity.position, ...entity.trajectory.projectedPath].map(pos => {
      // Ensure each position is valid
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
        return new THREE.Vector3(0, 0, 0);
      }
      return new THREE.Vector3(pos.x, pos.y, pos.z);
    });
  }, [entity.position, entity.trajectory?.projectedPath, settings.showFuture]);
  
  // Ensure we have at least 2 distinct points to avoid LineGeometry errors
  const ensureValidPoints = (points: THREE.Vector3[]): THREE.Vector3[] => {
    if (points.length < 2) {
      // If less than 2 points, duplicate the last point with a tiny offset
      const lastPoint = points[points.length - 1] || new THREE.Vector3();
      return [...points, new THREE.Vector3(lastPoint.x + 0.001, lastPoint.y, lastPoint.z)];
    }
    
    // Check if all points are identical, which could cause rendering issues
    const allSame = points.every(p => 
      p.x === points[0].x && p.y === points[0].y && p.z === points[0].z);
    
    if (allSame) {
      // Add a tiny offset to the last point
      const lastPoint = points[points.length - 1];
      return [
        ...points.slice(0, -1), 
        new THREE.Vector3(lastPoint.x + 0.001, lastPoint.y, lastPoint.z)
      ];
    }
    
    return points;
  };
  
  // Ensure valid points arrays
  const validPastPoints = useMemo(() => ensureValidPoints(pastPoints), [pastPoints]);
  const validFuturePoints = useMemo(() => ensureValidPoints(futurePoints), [futurePoints]);
  
  // Modify the useFrame hook to only run on the client side
  useFrame(({ clock }) => {
    // Skip animation during SSR
    if (!isBrowser) return;
    
    const currentTime = clock.getElapsedTime();
    
    // Update every 50ms for animation effects
    if (currentTime - animationRef.current.lastUpdate > 0.05) {
      // Past line fade effect - older parts of the trail become more transparent
      if (pastLineRef.current) {
        // Use type assertion to access material property safely
        const line = pastLineRef.current as unknown as { material: THREE.Material };
        if (line.material instanceof THREE.LineBasicMaterial) {
          line.material.opacity = 0.5 + Math.sin(currentTime * 0.5) * 0.1;
        }
      }
      
      // Future line pulse effect - make it subtly pulse
      if (futureLineRef.current) {
        // Use type assertion to access material property safely
        const line = futureLineRef.current as unknown as { material: THREE.Material };
        if (line.material instanceof THREE.LineBasicMaterial) {
          line.material.opacity = 0.3 + Math.sin(currentTime * 2) * 0.2;
        }
      }
      
      animationRef.current.lastUpdate = currentTime;
    }
  });
  
  return (
    <group>
      {/* Past trajectory line */}
      <Line
        ref={pastLineRef}
        points={validPastPoints}
        color={settings.pastColor}
        lineWidth={settings.width}
        transparent
        opacity={settings.opacity}
      />
      
      {/* Future trajectory line (if enabled) */}
      {settings.showFuture && (
        <Line
          ref={futureLineRef}
          points={validFuturePoints}
          color={settings.futureColor}
          lineWidth={settings.width * 0.8} // Slightly thinner
          transparent
          opacity={settings.opacity * 0.7} // Slightly more transparent
          dashed={true}
          dashSize={0.5}
          dashScale={10}
        />
      )}
    </group>
  );
};

/**
 * Component to render trajectories for multiple entities of the same type
 */
interface EntityTrajectoriesProps {
  entities: Entity[];
  settings: {
    historyLength: number; 
    pastColor: string;
    futureColor: string;
    opacity: number;
    width: number;
    showFuture: boolean;
  };
  selectedEntityId?: string;
}

export const EntityTrajectories: React.FC<EntityTrajectoriesProps> = ({
  entities,
  settings,
  selectedEntityId
}) => {
  // Enhanced settings for selected entity
  const selectedSettings = useMemo(() => ({
    ...settings,
    width: settings.width * 1.5,
    opacity: settings.opacity * 1.2
  }), [settings]);
  
  return (
    <group>
      {entities.map(entity => (
        <EntityTrajectory
          key={`trajectory-${entity.id}`}
          entity={entity}
          settings={entity.id === selectedEntityId ? selectedSettings : settings}
        />
      ))}
    </group>
  );
};

export default EntityTrajectories; 