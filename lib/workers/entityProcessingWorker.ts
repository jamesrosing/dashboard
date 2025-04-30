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
  ERROR = 'error',
  PREDICT_COLLISIONS = 'predictCollisions',
  COLLISION_PREDICTION_RESULT = 'collisionPredictionResult',
  CALCULATE_PATH = 'calculatePath',
  PATH_CALCULATION_RESULT = 'pathCalculationResult',
  CALCULATE_EFFICIENCY = 'calculateEfficiency',
  EFFICIENCY_CALCULATION_RESULT = 'efficiencyCalculationResult'
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
  const acceleration = { ...entity.acceleration };

  // Calculate future positions based on physics
  for (let i = 0; i < timeSteps; i++) {
    // Update velocity with acceleration
    currentVelocity = {
      x: currentVelocity.x + acceleration.x * timeStep,
      y: currentVelocity.y + acceleration.y * timeStep,
      z: currentVelocity.z + acceleration.z * timeStep
    };

    // Update position with velocity
    currentPosition = {
      x: currentPosition.x + currentVelocity.x * timeStep,
      y: currentPosition.y + currentVelocity.y * timeStep,
      z: currentPosition.z + currentVelocity.z * timeStep
    };

    // Add to trajectory
    trajectory.push({ ...currentPosition });
  }

  return trajectory;
}

/**
 * Calculate collision between entities
 * @param entity1 First entity
 * @param entity2 Second entity
 * @param radius1 Radius of first entity
 * @param radius2 Radius of second entity
 * @returns True if entities collide
 */
function checkCollision(
  entity1: ProcessedEntity,
  entity2: ProcessedEntity,
  radius1: number = 5,
  radius2: number = 5
): boolean {
  const distance = calculateDistance(entity1.position, entity2.position);
  return distance < (radius1 + radius2);
}

/**
 * Predict potential collisions within a time window
 * @param entities Array of entities to check
 * @param timeWindow Time window to check for collisions (seconds)
 * @param timeStep Time step for trajectory calculation
 * @returns Array of collision pairs (entity IDs)
 */
function predictCollisions(
  entities: ProcessedEntity[],
  timeWindow: number = 10,
  timeStep: number = 0.5
): { entity1: string; entity2: string; timeToCollision: number }[] {
  const collisions: { entity1: string; entity2: string; timeToCollision: number }[] = [];
  const timeSteps = Math.ceil(timeWindow / timeStep);
  
  // For each pair of entities
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const entity1 = entities[i];
      const entity2 = entities[j];
      
      // Calculate trajectories
      const trajectory1 = calculateTrajectory(entity1, timeSteps, timeStep);
      const trajectory2 = calculateTrajectory(entity2, timeSteps, timeStep);
      
      // Check for collision along trajectories
      for (let step = 0; step < timeSteps; step++) {
        if (step < trajectory1.length && step < trajectory2.length) {
          const pos1 = trajectory1[step];
          const pos2 = trajectory2[step];
          const distance = calculateDistance(pos1, pos2);
          
          // Use estimated entity sizes
          const collisionRadius = 10; // Combined radius
          
          if (distance < collisionRadius) {
            collisions.push({
              entity1: entity1.id,
              entity2: entity2.id,
              timeToCollision: step * timeStep
            });
            
            // Once a collision is found, no need to check further steps
            break;
          }
        }
      }
    }
  }
  
  return collisions;
}

/**
 * Calculate optimal path between points avoiding obstacles
 * @param start Starting position
 * @param end Target position
 * @param obstacles Array of obstacle positions
 * @param obstacleRadius Radius to avoid around obstacles
 * @returns Array of waypoints forming a path
 */
function calculatePath(
  start: Position,
  end: Position,
  obstacles: Position[],
  obstacleRadius: number = 20
): Position[] {
  // Simple implementation using straight line if no obstacles in the way
  const path: Position[] = [{ ...start }];
  
  // Check if direct path is clear
  let directPathClear = true;
  
  // Vector from start to end
  const direction = {
    x: end.x - start.x,
    y: end.y - start.y,
    z: end.z - start.z
  };
  
  // Length of the vector
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
  
  // Normalized direction
  const normalizedDirection = {
    x: direction.x / length,
    y: direction.y / length,
    z: direction.z / length
  };
  
  // Check for obstacles along the path
  for (const obstacle of obstacles) {
    // Calculate nearest point on line segment to obstacle
    const t = Math.max(0, Math.min(length, 
      (obstacle.x - start.x) * normalizedDirection.x +
      (obstacle.y - start.y) * normalizedDirection.y +
      (obstacle.z - start.z) * normalizedDirection.z
    ));
    
    const nearestPoint = {
      x: start.x + normalizedDirection.x * t,
      y: start.y + normalizedDirection.y * t,
      z: start.z + normalizedDirection.z * t
    };
    
    // Check if obstacle is too close to the path
    const distanceToObstacle = calculateDistance(nearestPoint, obstacle);
    if (distanceToObstacle < obstacleRadius) {
      directPathClear = false;
      break;
    }
  }
  
  // If direct path is clear, return simple path
  if (directPathClear) {
    path.push({ ...end });
    return path;
  }
  
  // Otherwise, implement a simple navigation around obstacles
  // For now, using a recursive subdivision approach
  
  // Find the nearest obstacle
  let nearestObstacle: Position | null = null;
  let minDistance = Infinity;
  
  for (const obstacle of obstacles) {
    const distance = calculateDistance(start, obstacle);
    if (distance < minDistance) {
      minDistance = distance;
      nearestObstacle = obstacle;
    }
  }
  
  if (nearestObstacle) {
    // Calculate dodge point (perpendicular to the path)
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    
    // Create a perpendicular vector in the XZ plane
    const dodgePoint = {
      x: (start.x + end.x) / 2 - dy * 1.5,
      y: (start.y + end.y) / 2 + dx * 0.5,
      z: (start.z + end.z) / 2
    };
    
    // Recursively calculate path segments
    const path1 = calculatePath(start, dodgePoint, obstacles, obstacleRadius);
    const path2 = calculatePath(dodgePoint, end, obstacles, obstacleRadius);
    
    // Combine paths (removing duplicate middle point)
    return [...path1.slice(0, path1.length - 1), ...path2];
  }
  
  // Fallback - just return direct path
  path.push({ ...end });
  return path;
}

/**
 * Calculate efficiency score for entity movement
 * @param entity Entity to analyze
 * @param targetPosition Target position (if available)
 * @returns Efficiency score (0-100)
 */
function calculateEfficiencyScore(
  entity: ProcessedEntity,
  targetPosition?: Position
): number {
  // Base score
  let score = 100;
  
  // If target position is available, check if entity is moving toward it
  if (targetPosition) {
    // Direction from current position to target
    const targetDirection = {
      x: targetPosition.x - entity.position.x,
      y: targetPosition.y - entity.position.y,
      z: targetPosition.z - entity.position.z
    };
    
    // Normalize target direction
    const targetDistance = Math.sqrt(
      targetDirection.x * targetDirection.x +
      targetDirection.y * targetDirection.y +
      targetDirection.z * targetDirection.z
    );
    
    if (targetDistance > 0) {
      targetDirection.x /= targetDistance;
      targetDirection.y /= targetDistance;
      targetDirection.z /= targetDistance;
      
      // Current velocity direction
      const velocity = entity.velocity;
      const speed = Math.sqrt(
        velocity.x * velocity.x +
        velocity.y * velocity.y +
        velocity.z * velocity.z
      );
      
      if (speed > 0) {
        const velocityDirection = {
          x: velocity.x / speed,
          y: velocity.y / speed,
          z: velocity.z / speed
        };
        
        // Dot product to determine alignment (-1 to 1)
        const alignment = 
          velocityDirection.x * targetDirection.x +
          velocityDirection.y * targetDirection.y +
          velocityDirection.z * targetDirection.z;
        
        // Reduce score if not aligned with target
        score -= (1 - alignment) * 30;
      }
    }
  }
  
  // Check for excessive acceleration
  const acceleration = entity.acceleration;
  const accelerationMagnitude = Math.sqrt(
    acceleration.x * acceleration.x +
    acceleration.y * acceleration.y +
    acceleration.z * acceleration.z
  );
  
  // Penalize high acceleration (assumed inefficient)
  score -= Math.min(20, accelerationMagnitude * 10);
  
  // Check for abrupt velocity changes
  // Would need historical data for better analysis
  
  // Ensure score is in range 0-100
  return Math.max(0, Math.min(100, score));
}

// Create spatial grid
let spatialGrid = new SpatialGrid();

// Handle messages from main thread
self.onmessage = function(event: MessageEvent<WorkerMessage>): void {
  try {
    const { type, payload } = event.data;
    
    switch (type) {
      case WorkerMessageType.INIT:
        // Initialize spatial grid
        const cellSize = payload.cellSize || 100;
        spatialGrid = new SpatialGrid(cellSize);
        
        // Respond with success
        self.postMessage({
          type: WorkerMessageType.ENTITIES_PROCESSED,
          payload: {
            count: 0,
            message: 'Worker initialized with cell size: ' + cellSize
          }
        });
        break;
        
      case WorkerMessageType.PROCESS_ENTITIES:
        // Process entities
        const entities = payload.entities as Entity[];
        
        // Update spatial grid
        entities.forEach(entity => {
          const processedEntity: ProcessedEntity = {
            id: entity.id,
            position: entity.position,
            velocity: entity.velocity || { x: 0, y: 0, z: 0 },
            acceleration: entity.acceleration || { x: 0, y: 0, z: 0 },
            lastUpdated: entity.lastUpdated || Date.now()
          };
          
          spatialGrid.updateEntity(processedEntity);
        });
        
        // Respond with success
        self.postMessage({
          type: WorkerMessageType.ENTITIES_PROCESSED,
          payload: {
            count: entities.length
          }
        });
        break;
        
      case WorkerMessageType.CALCULATE_TRAJECTORIES:
        // Calculate trajectory for entities
        const { entityIds, timeSteps, timeStep, callbackId } = payload;
        const trajectories: Record<string, Position[]> = {};
        
        // Process each entity
        entityIds.forEach((entityId: string) => {
          const entity = spatialGrid.getEntity(entityId);
          if (entity) {
            trajectories[entityId] = calculateTrajectory(entity, timeSteps, timeStep);
          }
        });
        
        // Return trajectories
        self.postMessage({
          type: WorkerMessageType.TRAJECTORIES_CALCULATED,
          payload: {
            trajectories,
            callbackId
          }
        });
        break;
        
      case WorkerMessageType.SPATIAL_QUERY:
        // Perform spatial query
        const { position, radius, callbackId: queryCallbackId } = payload;
        const results = spatialGrid.findInRadius(position, radius);
        
        // Return results
        self.postMessage({
          type: WorkerMessageType.SPATIAL_QUERY_RESULT,
          payload: {
            results,
            callbackId: queryCallbackId
          }
        });
        break;
        
      case WorkerMessageType.PREDICT_COLLISIONS:
        // Predict collisions between entities
        const { timeWindow, predictionStep, callbackId: collisionCallbackId } = payload;
        
        // Get all entities
        const allEntityIds = spatialGrid.getAllEntityIds();
        const allEntities: ProcessedEntity[] = [];
        
        allEntityIds.forEach(id => {
          const entity = spatialGrid.getEntity(id);
          if (entity) {
            allEntities.push(entity);
          }
        });
        
        // Predict collisions
        const collisions = predictCollisions(
          allEntities,
          timeWindow || 10,
          predictionStep || 0.5
        );
        
        // Return results
        self.postMessage({
          type: WorkerMessageType.COLLISION_PREDICTION_RESULT,
          payload: {
            collisions,
            callbackId: collisionCallbackId
          }
        });
        break;
        
      case WorkerMessageType.CALCULATE_PATH:
        // Calculate path avoiding obstacles
        const { start, end, obstacleIds, callbackId: pathCallbackId } = payload;
        
        // Get obstacle positions
        const obstacles: Position[] = [];
        if (obstacleIds && Array.isArray(obstacleIds)) {
          obstacleIds.forEach(id => {
            const entity = spatialGrid.getEntity(id);
            if (entity) {
              obstacles.push(entity.position);
            }
          });
        }
        
        // Calculate path
        const path = calculatePath(start, end, obstacles);
        
        // Return results
        self.postMessage({
          type: WorkerMessageType.PATH_CALCULATION_RESULT,
          payload: {
            path,
            callbackId: pathCallbackId
          }
        });
        break;
        
      case WorkerMessageType.CALCULATE_EFFICIENCY:
        // Calculate efficiency for entities
        const { entityIds: efficiencyEntityIds, targetPositions, callbackId: efficiencyCallbackId } = payload;
        const efficiencyScores: Record<string, number> = {};
        
        // Process each entity
        if (efficiencyEntityIds && Array.isArray(efficiencyEntityIds)) {
          efficiencyEntityIds.forEach((entityId: string) => {
            const entity = spatialGrid.getEntity(entityId);
            if (entity) {
              const targetPosition = targetPositions && targetPositions[entityId];
              efficiencyScores[entityId] = calculateEfficiencyScore(entity, targetPosition);
            }
          });
        }
        
        // Return results
        self.postMessage({
          type: WorkerMessageType.EFFICIENCY_CALCULATION_RESULT,
          payload: {
            efficiencyScores,
            callbackId: efficiencyCallbackId
          }
        });
        break;
        
      default:
        console.error('Unknown message type:', type);
        self.postMessage({
          type: WorkerMessageType.ERROR,
          payload: {
            error: `Unknown message type: ${type}`
          }
        });
    }
  } catch (error) {
    // Handle any errors
    console.error('Error in worker:', error);
    self.postMessage({
      type: WorkerMessageType.ERROR,
      payload: {
        error: (error as Error).message || 'Unknown error in worker'
      }
    });
  }
};

// Notify that worker is ready
self.postMessage({
  type: WorkerMessageType.ENTITIES_PROCESSED,
  payload: {
    count: 0,
    message: 'Worker initialized and ready'
  }
}); 