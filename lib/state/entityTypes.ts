import * as THREE from 'three';

/**
 * Entity types supported by the system
 */
export enum EntityType {
  DRONE = 'drone',
  VEHICLE = 'vehicle',
  STATIONARY = 'stationary'
}

/**
 * Entity operational status
 */
export enum EntityStatus {
  OPERATIONAL = 'operational',
  STANDBY = 'standby',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

/**
 * Task types that can be assigned to entities
 */
export enum TaskType {
  PATROL = 'patrol',
  TRANSPORT = 'transport',
  SURVEY = 'survey',
  IDLE = 'idle'
}

/**
 * Task status
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Position interface - uses Vector3 compatible format
 */
export interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotation interface - uses Euler compatible format
 */
export interface Rotation {
  x: number;
  y: number;
  z: number;
}

/**
 * Task assigned to an entity
 */
export interface Task {
  id: string;
  type: TaskType;
  priority: number; // 1-10
  waypoints: Position[];
  assignedAt: number; // timestamp
  status: TaskStatus;
  progress: number; // 0-100%
  estimatedCompletion: number; // timestamp
}

/**
 * Sensor reading from an entity
 */
export interface SensorReading {
  value: number;
  unit: string;
  timestamp: number;
  status: 'normal' | 'warning' | 'critical';
  thresholds: {
    warning: number;
    critical: number;
  };
}

/**
 * Main entity interface
 */
export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  position: Position;
  rotation: Rotation;
  velocity?: Position;  // Make this optional and add it to fix TypeScript errors
  speed: number;
  battery: number;
  temperature: number;
  lastUpdateTime: number;
  pastPositions?: Position[];  // For trajectory visualization
  futurePositions?: Position[]; // For projected path visualization
  health: {
    batteryLevel: number; // 0-100%
    fuelLevel?: number; // 0-100%
    temperature: number;
    lastMaintenance?: number; // timestamp
    errorCodes: string[];
  };
  sensors: Record<string, SensorReading>;
  tasks: Task[];
  metadata: Record<string, any>; // Custom attributes
  lastUpdated: number; // timestamp
  [key: string]: any;
}

/**
 * Helper to convert Position to THREE.Vector3
 */
export function positionToVector3(position: Position): any {
  // Safe wrapper to prevent "Cannot access before initialization" errors
  if (!position) return new (THREE as any).Vector3(0, 0, 0);
  
  try {
    // Use type assertion to avoid direct property access on THREE
    return new (THREE as any).Vector3(
      position.x || 0,
      position.y || 0,
      position.z || 0
    );
  } catch (e) {
    // Fallback object with Vector3 interface if THREE isn't fully initialized
    return {
      x: position.x || 0,
      y: position.y || 0,
      z: position.z || 0,
      isVector3: true,
      set: function(x: number, y: number, z: number) { 
        this.x = x; this.y = y; this.z = z; 
        return this; 
      },
      copy: function(v: any) { 
        this.x = v.x; this.y = v.y; this.z = v.z; 
        return this; 
      },
      add: function(v: any) { 
        this.x += v.x; this.y += v.y; this.z += v.z; 
        return this; 
      }
    };
  }
}

/**
 * Helper to convert THREE.Vector3 to Position
 */
export function vector3ToPosition(vector: any): Position {
  // Safely extract x, y, z values with fallbacks
  if (!vector) return { x: 0, y: 0, z: 0 };
  
  return { 
    x: vector.x || 0, 
    y: vector.y || 0, 
    z: vector.z || 0 
  };
}

/**
 * Helper to convert Rotation to THREE.Euler
 */
export function rotationToEuler(rotation: Rotation): any {
  // Safe wrapper to prevent "Cannot access before initialization" errors
  if (!rotation) return new (THREE as any).Euler(0, 0, 0);
  
  try {
    // Use type assertion to avoid direct property access on THREE
    return new (THREE as any).Euler(
      rotation.x || 0,
      rotation.y || 0, 
      rotation.z || 0
    );
  } catch (e) {
    // Fallback object with Euler interface if THREE isn't fully initialized
    return {
      x: rotation.x || 0,
      y: rotation.y || 0,
      z: rotation.z || 0,
      order: 'XYZ',
      isEuler: true,
      set: function(x: number, y: number, z: number) { 
        this.x = x; this.y = y; this.z = z; 
        return this; 
      },
      copy: function(e: any) { 
        this.x = e.x; this.y = e.y; this.z = e.z; this.order = e.order; 
        return this; 
      }
    };
  }
}

/**
 * Get color for entity status
 */
export function getStatusColor(status: EntityStatus): string {
  switch (status) {
    case EntityStatus.OPERATIONAL:
      return '#00ff00'; // Brighter Green
    case EntityStatus.STANDBY:
      return '#00b7ff'; // Brighter Blue
    case EntityStatus.WARNING:
      return '#ffbf00'; // Brighter Amber
    case EntityStatus.CRITICAL:
      return '#ff2222'; // Brighter Red
    case EntityStatus.OFFLINE:
      return '#cccccc'; // Lighter Gray
    case EntityStatus.MAINTENANCE:
      return '#ff00ff'; // Brighter Magenta
    default:
      return '#ffffff'; // White
  }
}

/**
 * Type guard to check if a string is a valid EntityType
 */
export function isEntityType(type: string): type is EntityType {
  return Object.values(EntityType).includes(type as EntityType);
}

/**
 * Type guard to check if a string is a valid EntityStatus
 */
export function isEntityStatus(status: string): status is EntityStatus {
  return Object.values(EntityStatus).includes(status as EntityStatus);
}