import { Entity, EntityType, EntityStatus, TaskType, TaskStatus, Position } from './entityTypes';

// Generate a unique ID
const generateId = (): string => Math.random().toString(36).substring(2, 9);

// Generate a random position within bounds
const generatePosition = (bounds = 50) => ({
  x: (Math.random() - 0.5) * bounds,
  y: Math.random() * 20,
  z: (Math.random() - 0.5) * bounds
});

// Generate a random entity status with weighted distribution
const generateStatus = (): EntityStatus => {
  const rand = Math.random();
  if (rand < 0.6) return EntityStatus.OPERATIONAL;
  if (rand < 0.75) return EntityStatus.STANDBY;
  if (rand < 0.85) return EntityStatus.WARNING;
  if (rand < 0.95) return EntityStatus.CRITICAL;
  return EntityStatus.OFFLINE;
};

// Generate a realistic trajectory path (past positions)
const generatePastTrajectory = (currentPosition: Position, count: number): Position[] => {
  const positions: Position[] = [];
  let prevPos = { ...currentPosition };
  
  // Create points that simulate a smooth path leading to current position
  for (let i = 0; i < count; i++) {
    // Each point is slightly offset from the previous one (simulating movement)
    const pos = {
      x: prevPos.x - (Math.random() * 0.8 + 0.2) * (Math.random() < 0.5 ? 1 : -1),
      y: prevPos.y + (Math.random() - 0.5) * 0.3, // Less vertical movement
      z: prevPos.z - (Math.random() * 0.8 + 0.2) * (Math.random() < 0.5 ? 1 : -1),
    };
    
    // Ensure minimum height
    pos.y = Math.max(pos.y, 0.5);
    
    positions.push(pos);
    prevPos = pos;
  }
  
  return positions;
};

// Generate a projected path based on current position and velocity
const generateProjectedPath = (currentPosition: Position, velocity: Position, count: number): Position[] => {
  const positions: Position[] = [];
  let pos = { ...currentPosition };
  
  for (let i = 0; i < count; i++) {
    pos = {
      x: pos.x + velocity.x + (Math.random() - 0.5) * 0.2,
      y: pos.y + velocity.y + (Math.random() - 0.5) * 0.1,
      z: pos.z + velocity.z + (Math.random() - 0.5) * 0.2,
    };
    
    // Ensure minimum height
    pos.y = Math.max(pos.y, 0.5);
    
    positions.push(pos);
  }
  
  return positions;
};

// Generate a single entity with random properties
export const generateEntity = (type?: EntityType): Entity => {
  const entityType = type || (Math.random() < 0.33 
    ? EntityType.DRONE 
    : Math.random() < 0.66 
      ? EntityType.VEHICLE 
      : EntityType.STATIONARY);

  const position = generatePosition();
  const status = generateStatus();
  
  // Create realistic velocity based on entity type
  const velocity = {
    x: (Math.random() - 0.5) * (entityType === EntityType.DRONE ? 2 : entityType === EntityType.VEHICLE ? 1 : 0),
    y: (Math.random() - 0.5) * (entityType === EntityType.DRONE ? 0.5 : 0),
    z: (Math.random() - 0.5) * (entityType === EntityType.DRONE ? 2 : entityType === EntityType.VEHICLE ? 1 : 0)
  };
  
  // Stationary objects don't move
  if (entityType === EntityType.STATIONARY) {
    velocity.x = 0;
    velocity.y = 0;
    velocity.z = 0;
  }
  
  return {
    id: generateId(),
    type: entityType,
    position,
    rotation: {
      x: Math.random() * Math.PI * 2,
      y: Math.random() * Math.PI * 2,
      z: Math.random() * Math.PI * 2
    },
    velocity,
    acceleration: {
      x: 0, y: 0, z: 0
    },
    status,
    health: {
      batteryLevel: Math.random() * 100,
      fuelLevel: entityType === EntityType.VEHICLE ? Math.random() * 100 : undefined,
      temperature: 20 + Math.random() * 40,
      lastMaintenance: status !== EntityStatus.OFFLINE ? Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 : undefined,
      errorCodes: status === EntityStatus.CRITICAL ? ['E001', 'E405'] : status === EntityStatus.WARNING ? ['W023'] : []
    },
    sensors: {
      altitude: {
        value: position.y,
        unit: 'm',
        timestamp: Date.now(),
        status: position.y < 5 ? 'warning' : position.y > 50 ? 'warning' : 'normal',
        thresholds: { warning: 5, critical: 2 }
      },
      speed: {
        value: Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.z, 2)),
        unit: 'km/h',
        timestamp: Date.now(),
        status: 'normal',
        thresholds: { warning: 80, critical: 100 }
      }
    },
    tasks: [
      {
        id: generateId(),
        type: [TaskType.PATROL, TaskType.TRANSPORT, TaskType.SURVEY, TaskType.IDLE][Math.floor(Math.random() * 4)],
        priority: Math.floor(Math.random() * 10) + 1,
        waypoints: Array(Math.floor(Math.random() * 5) + 1).fill(0).map(() => generatePosition()),
        assignedAt: Date.now() - Math.random() * 60 * 60 * 1000,
        status: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.FAILED][Math.floor(Math.random() * 4)],
        progress: Math.random() * 100,
        estimatedCompletion: Date.now() + Math.random() * 60 * 60 * 1000
      }
    ],
    trajectory: {
      // Generate realistic trajectory data based on entity type
      pastPositions: entityType !== EntityType.STATIONARY 
        ? generatePastTrajectory(position, 20) 
        : [],
      projectedPath: entityType !== EntityType.STATIONARY && (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0)
        ? generateProjectedPath(position, velocity, 10)
        : []
    },
    metadata: {
      createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    },
    lastUpdated: Date.now()
  };
};

// Generate multiple entities
export const generateEntities = (count: number): Entity[] => {
  return Array(count).fill(0).map(() => generateEntity());
};

// Generate a distribution of entities by type
export const generateEntityDistribution = (droneCount: number, vehicleCount: number, stationaryCount: number): Entity[] => {
  return [
    ...Array(droneCount).fill(0).map(() => generateEntity(EntityType.DRONE)),
    ...Array(vehicleCount).fill(0).map(() => generateEntity(EntityType.VEHICLE)),
    ...Array(stationaryCount).fill(0).map(() => generateEntity(EntityType.STATIONARY))
  ];
};

// Default export of 50 random entities
export default generateEntityDistribution(20, 15, 15); 