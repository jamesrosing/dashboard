import { Entity, Position } from '../state/entityTypes';

/**
 * Message types for worker communication
 */
export enum WorkerMessageType {
  INIT = 'init',
  PROCESS_ENTITIES = 'processEntities',
  CALCULATE_TRAJECTORIES = 'calculateTrajectories',
  ENTITIES_PROCESSED = 'entitiesProcessed',
  TRAJECTORIES_CALCULATED = 'trajectoriesCalculated',
  SPATIAL_QUERY = 'spatialQuery',
  SPATIAL_QUERY_RESULT = 'spatialQueryResult',
  ERROR = 'error'
}

/**
 * Worker message interface
 */
export interface WorkerMessage {
  type: WorkerMessageType;
  payload: any;
}

/**
 * Spatial index cell
 */
interface SpatialCell {
  x: number;
  y: number;
  z: number;
  entityIds: string[];
}

/**
 * Simplified entity for processing
 */
interface ProcessedEntity {
  id: string;
  position: Position;
  velocity: Position;
  acceleration: Position;
  lastUpdated: number;
}

/**
 * Class representing the spatial grid for efficient entity lookup
 */
class SpatialGrid {
  private cells: Map<string, SpatialCell>;
  public cellSize: number;
  private entities: Map<string, ProcessedEntity>;

  constructor(cellSize = 100) {
    this.cells = new Map();
    this.cellSize = cellSize;
    this.entities = new Map();
  }

  /**
   * Get cell key from position
   */
  private getCellKey(position: Position): string {
    const x = Math.floor(position.x / this.cellSize);
    const y = Math.floor(position.y / this.cellSize);
    const z = Math.floor(position.z / this.cellSize);
    return `${x},${y},${z}`;
  }

  /**
   * Update entity in spatial grid
   */
  updateEntity(entity: ProcessedEntity): void {
    const oldEntity = this.entities.get(entity.id);
    if (oldEntity) {
      // Remove from old cell
      const oldKey = this.getCellKey(oldEntity.position);
      const oldCell = this.cells.get(oldKey);
      if (oldCell) {
        oldCell.entityIds = oldCell.entityIds.filter(id => id !== entity.id);
        if (oldCell.entityIds.length === 0) {
          this.cells.delete(oldKey);
        } else {
          this.cells.set(oldKey, oldCell);
        }
      }
    }

    // Add to new cell
    const newKey = this.getCellKey(entity.position);
    let cell = this.cells.get(newKey);
    if (!cell) {
      const [x, y, z] = newKey.split(',').map(Number);
      cell = { x, y, z, entityIds: [] };
    }
    
    if (!cell.entityIds.includes(entity.id)) {
      cell.entityIds.push(entity.id);
    }
    
    this.cells.set(newKey, cell);
    this.entities.set(entity.id, entity);
  }

  /**
   * Remove entity from spatial grid
   */
  removeEntity(entityId: string): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    // Remove from cell
    const key = this.getCellKey(entity.position);
    const cell = this.cells.get(key);
    if (cell) {
      cell.entityIds = cell.entityIds.filter(id => id !== entityId);
      if (cell.entityIds.length === 0) {
        this.cells.delete(key);
      } else {
        this.cells.set(key, cell);
      }
    }

    // Remove from entities
    this.entities.delete(entityId);
  }

  /**
   * Find entities within radius of position
   */
  findInRadius(position: Position, radius: number): string[] {
    const result = new Set<string>();
    const radiusCells = Math.ceil(radius / this.cellSize);
    
    const centerX = Math.floor(position.x / this.cellSize);
    const centerY = Math.floor(position.y / this.cellSize);
    const centerZ = Math.floor(position.z / this.cellSize);
    
    // Check cells in radius
    for (let x = centerX - radiusCells; x <= centerX + radiusCells; x++) {
      for (let y = centerY - radiusCells; y <= centerY + radiusCells; y++) {
        for (let z = centerZ - radiusCells; z <= centerZ + radiusCells; z++) {
          const key = `${x},${y},${z}`;
          const cell = this.cells.get(key);
          
          if (cell) {
            // For each entity in the cell, check if it's within radius
            cell.entityIds.forEach(entityId => {
              const entity = this.entities.get(entityId);
              if (entity) {
                const distance = calculateDistance(position, entity.position);
                if (distance <= radius) {
                  result.add(entityId);
                }
              }
            });
          }
        }
      }
    }
    
    return Array.from(result);
  }

  /**
   * Get all entity IDs
   */
  getAllEntityIds(): string[] {
    return Array.from(this.entities.keys());
  }

  /**
   * Get entity by ID
   */
  getEntity(entityId: string): ProcessedEntity | undefined {
    return this.entities.get(entityId);
  }
}

/**
 * Calculate distance between two positions
 */
function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const dz = pos2.z - pos1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate entity trajectory based on current position, velocity, and acceleration
 */
function calculateTrajectory(
  entity: ProcessedEntity,
  timeSteps: number,
  timeStep: number
): Position[] {
  const trajectory: Position[] = [];
  let currentPosition = { ...entity.position };
  let currentVelocity = { ...entity.velocity };
  
  for (let i = 0; i < timeSteps; i++) {
    // Update velocity based on acceleration
    currentVelocity = {
      x: currentVelocity.x + entity.acceleration.x * timeStep,
      y: currentVelocity.y + entity.acceleration.y * timeStep,
      z: currentVelocity.z + entity.acceleration.z * timeStep
    };
    
    // Update position based on velocity
    currentPosition = {
      x: currentPosition.x + currentVelocity.x * timeStep,
      y: currentPosition.y + currentVelocity.y * timeStep,
      z: currentPosition.z + currentVelocity.z * timeStep
    };
    
    trajectory.push({ ...currentPosition });
  }
  
  return trajectory;
}

// Create spatial grid
const spatialGrid = new SpatialGrid(100);

// Handle worker messages
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, payload } = e.data;
  
  try {
    switch (type) {
      case WorkerMessageType.INIT:
        // Initialize worker with configuration
        const { cellSize } = payload;
        spatialGrid.cellSize = cellSize;
        break;
        
      case WorkerMessageType.PROCESS_ENTITIES:
        // Process batch of entities
        const entities: Entity[] = payload.entities;
        
        entities.forEach(entity => {
          // Extract only the data we need for processing
          const processedEntity: ProcessedEntity = {
            id: entity.id,
            position: entity.position,
            velocity: entity.velocity,
            acceleration: entity.acceleration,
            lastUpdated: entity.lastUpdated
          };
          
          // Update spatial grid
          spatialGrid.updateEntity(processedEntity);
        });
        
        // Send processed result
        self.postMessage({
          type: WorkerMessageType.ENTITIES_PROCESSED,
          payload: {
            count: entities.length,
            timestamp: Date.now()
          }
        });
        break;
        
      case WorkerMessageType.CALCULATE_TRAJECTORIES:
        // Calculate trajectories for entities
        const { entityIds, timeSteps, timeStep } = payload;
        const trajectories: Record<string, Position[]> = {};
        
        entityIds.forEach((entityId: string) => {
          const entity = spatialGrid.getEntity(entityId);
          if (entity) {
            trajectories[entityId] = calculateTrajectory(entity, timeSteps, timeStep);
          }
        });
        
        // Send trajectories result
        self.postMessage({
          type: WorkerMessageType.TRAJECTORIES_CALCULATED,
          payload: {
            trajectories,
            timestamp: Date.now()
          }
        });
        break;
        
      case WorkerMessageType.SPATIAL_QUERY:
        // Perform spatial query
        const { position, radius } = payload;
        const results = spatialGrid.findInRadius(position, radius);
        
        // Send query results
        self.postMessage({
          type: WorkerMessageType.SPATIAL_QUERY_RESULT,
          payload: {
            results,
            position,
            radius,
            timestamp: Date.now()
          }
        });
        break;
        
      default:
        console.error('Unknown message type:', type);
    }
  } catch (error) {
    // Send error to main thread
    self.postMessage({
      type: WorkerMessageType.ERROR,
      payload: {
        error: (error as Error).message,
        timestamp: Date.now()
      }
    });
  }
}; 