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
  OFFLINE = 'offline'
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
  type: EntityType;
  position: Position;
  rotation: Position; // Using Position for simplicity in the API
  velocity: Position;
  acceleration: Position;
  status: EntityStatus;
  health: {
    batteryLevel: number; // 0-100%
    fuelLevel?: number; // 0-100%
    temperature: number;
    lastMaintenance?: number; // timestamp
    errorCodes: string[];
  };
  sensors: Record<string, SensorReading>;
  tasks: Task[];
  trajectory: {
    pastPositions: Position[]; // Limited array of past positions
    projectedPath: Position[]; // Calculated future path
  };
  metadata: Record<string, any>; // Custom attributes
  lastUpdated: number; // timestamp
}

/**
 * Helper to convert Position to THREE.Vector3
 */
export function positionToVector3(position: Position): THREE.Vector3 {
  return new THREE.Vector3(position.x, position.y, position.z);
}

/**
 * Helper to convert THREE.Vector3 to Position
 */
export function vector3ToPosition(vector: THREE.Vector3): Position {
  return { x: vector.x, y: vector.y, z: vector.z };
}

/**
 * Get color for entity status
 */
export function getStatusColor(status: EntityStatus): string {
  switch (status) {
    case EntityStatus.OPERATIONAL:
      return '#4caf50'; // Green
    case EntityStatus.STANDBY:
      return '#2196f3'; // Blue
    case EntityStatus.WARNING:
      return '#ff9800'; // Amber
    case EntityStatus.CRITICAL:
      return '#f44336'; // Red
    case EntityStatus.OFFLINE:
      return '#9e9e9e'; // Gray
    default:
      return '#ffffff'; // White
  }
} 