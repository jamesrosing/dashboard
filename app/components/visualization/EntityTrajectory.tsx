import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { Entity, positionToVector3 } from '../../../lib/state/entityTypes';

// Safe check for browser environment
const isBrowser = typeof window !== 'undefined';

// Safe Vector3 creation helper function to prevent initialization errors
const safeVector3 = (x: number, y: number, z: number): any => {
  try {
    return new (THREE as any).Vector3(x || 0, y || 0, z || 0);
  } catch (e) {
    // Fallback if THREE.Vector3 is not available
    return {
      x: x || 0,
      y: y || 0,
      z: z || 0,
      isVector3: true
    };
  }
};

interface EntityTrajectoryProps {
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

// Ensure we have at least two valid points for trajectory lines
const ensureValidPoints = (points: any[]): any[] => {
  if (!points || points.length < 2) {
    // Return a minimum valid line with two points if insufficient data
    return [
      safeVector3(0, 0, 0),
      safeVector3(0, 0.01, 0) // Slightly different to avoid degenerate line
    ];
  }
  return points;
};

const EntityTrajectories: React.FC<EntityTrajectoryProps> = ({ 
  entities, 
  settings,
  selectedEntityId 
}) => {
  return (
    <>
      {entities.map((entity) => (
        <EntityTrajectory 
          key={`trajectory-${entity.id}`} 
          entity={entity} 
          settings={settings}
          isSelected={entity.id === selectedEntityId}
        />
      ))}
    </>
  );
};

interface SingleEntityTrajectoryProps {
  entity: Entity;
  settings: {
    historyLength: number;
    pastColor: string;
    futureColor: string;
    opacity: number;
    width: number;
    showFuture: boolean;
  };
  isSelected?: boolean;
}

const EntityTrajectory: React.FC<SingleEntityTrajectoryProps> = ({ 
  entity, 
  settings,
  isSelected = false
}) => {
  // Refs for the line objects
  const pastLineRef = useRef<any>(null);
  const futureLineRef = useRef<any>(null);
  
  // Calculate points for the trajectory
  const pastPoints = useMemo(() => {
    // Initialize with current position
    let points: any[] = [];
    
    // Only process if in browser environment
    if (isBrowser && entity.pastPositions && entity.pastPositions.length > 0) {
      points = entity.pastPositions.map(pos => safeVector3(pos.x, pos.y, pos.z));
      // Add current position at the end of past trajectory
      points.push(safeVector3(entity.position.x, entity.position.y, entity.position.z));
    } else {
      // Fallback for SSR or if no past positions
      points = [
        safeVector3(entity.position.x, entity.position.y, entity.position.z),
        safeVector3(entity.position.x, entity.position.y + 0.01, entity.position.z)
      ];
    }
    
    return points;
  }, [entity.position, entity.pastPositions]);
  
  // Calculate future points if available
  const futurePoints = useMemo(() => {
    // Initialize with current position
    let points: any[] = [];
    
    // Only process if in browser environment
    if (isBrowser && entity.futurePositions && entity.futurePositions.length > 0) {
      // Start with current position
      points = [safeVector3(entity.position.x, entity.position.y, entity.position.z)];
      // Add future positions
      points = points.concat(entity.futurePositions.map(pos => safeVector3(pos.x, pos.y, pos.z)));
    } else {
      // Fallback for SSR or if no future positions
      points = [
        safeVector3(entity.position.x, entity.position.y, entity.position.z),
        safeVector3(entity.position.x, entity.position.y + 0.01, entity.position.z)
      ];
    }
    
    return points;
  }, [entity.position, entity.futurePositions]);
  
  // Ensure valid points arrays with minimum two distinct points
  const validPastPoints = useMemo(() => ensureValidPoints(pastPoints), [pastPoints]);
  const validFuturePoints = useMemo(() => ensureValidPoints(futurePoints), [futurePoints]);
  
  // Animate the lines if selected
  useFrame(({ clock }) => {
    // Skip animations during SSR
    if (!isBrowser) return;
    
    const pastLine = pastLineRef.current;
    const futureLine = futureLineRef.current;
    
    if (pastLine && isSelected) {
      // Pulsing effect for selected entity
      const pulse = Math.sin(clock.getElapsedTime() * 4) * 0.2 + 0.8;
      pastLine.material.opacity = settings.opacity * pulse;
    } else if (pastLine) {
      // Normal opacity for non-selected
      pastLine.material.opacity = settings.opacity;
    }
    
    if (futureLine && settings.showFuture) {
      // Animated dash for future trajectory
      futureLine.material.dashOffset = -clock.getElapsedTime();
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
      
      {/* Future trajectory line */}
      {settings.showFuture && (
        <Line
          ref={futureLineRef}
          points={validFuturePoints}
          color={settings.futureColor}
          lineWidth={settings.width * 0.8}
          transparent
          opacity={settings.opacity * 0.7}
          dashed={true}
          dashSize={0.5}
          dashScale={10}
        />
      )}
    </group>
  );
};

export default EntityTrajectories; 