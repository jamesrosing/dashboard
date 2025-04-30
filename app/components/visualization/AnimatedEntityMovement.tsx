import React, { useRef } from 'react';
import * as THREE from '@/lib/three/three-entry';
import { useFrame } from '@react-three/fiber';
import { Entity, positionToVector3 } from '../../../lib/state/entityTypes';

// Safe creation helper functions to prevent initialization errors
const safeEuler = (x: number, y: number, z: number, order?: string): any => {
  try {
    return new (THREE as any).Euler(x || 0, y || 0, z || 0, order || 'XYZ');
  } catch (e) {
    return {
      x: x || 0,
      y: y || 0,
      z: z || 0,
      order: order || 'XYZ',
      isEuler: true,
      copy: function(e: any) {
        this.x = e.x;
        this.y = e.y;
        this.z = e.z;
        if (e.order) this.order = e.order;
        return this;
      }
    };
  }
};

const safeVector3 = (x: number, y: number, z: number): any => {
  try {
    return new (THREE as any).Vector3(x || 0, y || 0, z || 0);
  } catch (e) {
    return {
      x: x || 0,
      y: y || 0,
      z: z || 0,
      isVector3: true,
      copy: function(v: any) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      },
      equals: function(v: any) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
      },
      subVectors: function(a: any, b: any) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
      },
      length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      }
    };
  }
};

const safeVector2 = (x: number, y: number): any => {
  try {
    return new (THREE as any).Vector2(x || 0, y || 0);
  } catch (e) {
    return {
      x: x || 0,
      y: y || 0,
      isVector2: true,
      length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
    };
  }
};

// Safe Math utilities
const safeMathUtils = {
  lerp: (x: number, y: number, t: number) => {
    try {
      return (THREE as any).MathUtils.lerp(x, y, t);
    } catch (e) {
      return x + (y - x) * t;
    }
  },
  clamp: (value: number, min: number, max: number) => {
    try {
      return (THREE as any).MathUtils.clamp(value, min, max);
    } catch (e) {
      return Math.max(min, Math.min(max, value));
    }
  }
};

interface AnimatedEntityMovementProps {
  entity: Entity;
  children: React.ReactNode;
}

/**
 * Wrapper component that animates entity movement with smooth transitions
 * and proper rotation based on movement direction
 */
export const AnimatedEntityMovement: React.FC<AnimatedEntityMovementProps> = ({ 
  entity, 
  children 
}) => {
  // Reference to the group that will be animated
  const groupRef = useRef<any>(null);
  
  // Last known position, for interpolation
  const lastPositionRef = useRef<any>(
    positionToVector3(entity.position)
  );
  
  // Current target position from entity data
  const targetPositionRef = useRef<any>(
    positionToVector3(entity.position)
  );
  
  // Last rotation for smooth transitions
  const lastRotationRef = useRef<any>(
    safeEuler(
      entity.rotation?.x || 0,
      entity.rotation?.y || 0,
      entity.rotation?.z || 0
    )
  );
  
  // Current movement vector for calculating rotation
  const movementVectorRef = useRef<any>(safeVector3(0, 0, 0));
  
  // Animation settings
  const animationSettingsRef = useRef({
    positionLerpFactor: 0.1, // Position smoothing factor
    rotationLerpFactor: 0.08, // Rotation smoothing factor
    minimumMovement: 0.01, // Minimum movement to trigger rotation update
  });
  
  // Update target position when entity position changes
  if (!targetPositionRef.current.equals(positionToVector3(entity.position))) {
    targetPositionRef.current = positionToVector3(entity.position);
  }
  
  // Animation loop
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const currentPosition = groupRef.current.position;
    const targetPosition = targetPositionRef.current;
    const settings = animationSettingsRef.current;
    
    // Only animate moving entities
    if (entity.type !== 'stationary') {
      // Smoothly interpolate position
      const newPosition = safeVector3(0, 0, 0);
      newPosition.x = safeMathUtils.lerp(currentPosition.x, targetPosition.x, settings.positionLerpFactor);
      newPosition.y = safeMathUtils.lerp(currentPosition.y, targetPosition.y, settings.positionLerpFactor);
      newPosition.z = safeMathUtils.lerp(currentPosition.z, targetPosition.z, settings.positionLerpFactor);
      
      // Calculate movement vector (direction of motion)
      const movement = safeVector3(0, 0, 0).subVectors(newPosition, currentPosition);
      
      // Only update rotation if there's significant movement
      if (movement.length() > settings.minimumMovement) {
        movementVectorRef.current.copy(movement);
        
        // For drones, adjust movement vector to always point forward
        // with pitch based on vertical movement
        if (entity.type === 'drone') {
          // Create a rotation that points the drone in the direction of movement
          const targetRotation = safeEuler(0, 0, 0);
          
          // Calculate yaw (rotation around y-axis) based on movement in xz plane
          const horizontalDirection = safeVector2(movement.x, movement.z);
          if (horizontalDirection.length() > settings.minimumMovement) {
            targetRotation.y = Math.atan2(movement.x, movement.z);
          } else {
            targetRotation.y = lastRotationRef.current.y;
          }
          
          // Calculate pitch (rotation around x-axis) based on vertical movement
          // Limit pitch to reasonable angles (-30 to 30 degrees)
          const pitchAngle = Math.atan2(movement.y, Math.sqrt(movement.x * movement.x + movement.z * movement.z));
          targetRotation.x = safeMathUtils.clamp(pitchAngle, -Math.PI/6, Math.PI/6);
          
          // Update rotation smoothly
          groupRef.current.rotation.x = safeMathUtils.lerp(
            groupRef.current.rotation.x,
            targetRotation.x,
            settings.rotationLerpFactor
          );
          
          groupRef.current.rotation.y = safeMathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotation.y,
            settings.rotationLerpFactor
          );
          
          // Remember last rotation
          lastRotationRef.current.copy(groupRef.current.rotation);
        }
        
        // For vehicles, only handle yaw rotation in the xz plane
        else if (entity.type === 'vehicle') {
          // Create a rotation that points the vehicle in the direction of movement
          const horizontalDirection = safeVector2(movement.x, movement.z);
          
          // Only update rotation if there's significant horizontal movement
          if (horizontalDirection.length() > settings.minimumMovement) {
            const targetYaw = Math.atan2(movement.x, movement.z);
            
            // Smooth rotation using lerp
            groupRef.current.rotation.y = safeMathUtils.lerp(
              groupRef.current.rotation.y,
              targetYaw,
              settings.rotationLerpFactor
            );
            
            // Remember last rotation
            lastRotationRef.current.y = groupRef.current.rotation.y;
          }
        }
      }
      
      // Update position
      groupRef.current.position.copy(newPosition);
      lastPositionRef.current.copy(newPosition);
    } else {
      // For stationary entities, just set position directly
      groupRef.current.position.copy(targetPosition);
      
      // If entity has explicit rotation, use it
      if (entity.rotation) {
        groupRef.current.rotation.set(
          entity.rotation.x,
          entity.rotation.y,
          entity.rotation.z
        );
      }
    }
  });

  return (
    <group ref={groupRef} position={positionToVector3(entity.position)}>
      {children}
    </group>
  );
};

export default AnimatedEntityMovement; 