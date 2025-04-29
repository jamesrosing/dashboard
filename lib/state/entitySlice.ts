import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Entity, EntityType, EntityStatus, Position } from './entityTypes';
import mockEntities from './mockEntities';
import { RootState } from './store';

/**
 * Entity state interface
 */
interface EntityState {
  byId: Record<string, Entity>;
  allIds: string[];
  selectedIds: string[];
  filteredIds: string[];
  lastUpdate: number;
  trajectoryEnabled: boolean;
  maxPastPositions: number;
  maxProjectedPositions: number;
}

/**
 * Initial state
 */
const initialState: EntityState = {
  byId: {},
  allIds: [],
  selectedIds: [],
  filteredIds: [],
  lastUpdate: Date.now(),
  trajectoryEnabled: true,
  maxPastPositions: 50,
  maxProjectedPositions: 20
};

// Initialize with mock entities in development
const preloadedEntities = mockEntities.reduce((acc, entity) => {
  acc[entity.id] = entity;
  return acc;
}, {} as Record<string, Entity>);

const preloadedState: EntityState = {
  byId: preloadedEntities,
  allIds: Object.keys(preloadedEntities),
  selectedIds: [],
  filteredIds: [],
  lastUpdate: Date.now(),
  trajectoryEnabled: true,
  maxPastPositions: 20,
  maxProjectedPositions: 10
};

/**
 * Entity slice
 */
export const entitySlice = createSlice({
  name: 'entities',
  initialState: process.env.NODE_ENV === 'development' ? preloadedState : initialState,
  reducers: {
    addEntity: (state, action: PayloadAction<Entity>) => {
      const entity = action.payload;
      state.byId[entity.id] = entity;
      if (!state.allIds.includes(entity.id)) {
        state.allIds.push(entity.id);
      }
      state.lastUpdate = Date.now();
    },
    updateEntity: (state, action: PayloadAction<Partial<Entity> & { id: string }>) => {
      const update = action.payload;
      if (state.byId[update.id]) {
        state.byId[update.id] = {
          ...state.byId[update.id],
          ...update,
          lastUpdated: Date.now()
        };
        state.lastUpdate = Date.now();
      }
    },
    removeEntity: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter(entityId => entityId !== id);
      state.selectedIds = state.selectedIds.filter(entityId => entityId !== id);
      state.filteredIds = state.filteredIds.filter(entityId => entityId !== id);
      state.lastUpdate = Date.now();
    },
    selectEntity: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.selectedIds.includes(id)) {
        state.selectedIds.push(id);
      }
    },
    deselectEntity: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.selectedIds = state.selectedIds.filter(entityId => entityId !== id);
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    filterEntities: (state, action: PayloadAction<{
      types?: EntityType[];
      statuses?: EntityStatus[];
      predicate?: (entity: Entity) => boolean;
    }>) => {
      const { types, statuses, predicate } = action.payload;
      
      state.filteredIds = state.allIds.filter(id => {
        const entity = state.byId[id];
        
        const typeMatch = !types || types.length === 0 || types.includes(entity.type);
        const statusMatch = !statuses || statuses.length === 0 || statuses.includes(entity.status);
        const predicateMatch = !predicate || predicate(entity);
        
        return typeMatch && statusMatch && predicateMatch;
      });
    },
    clearFilters: (state) => {
      state.filteredIds = [];
    },
    updateEntityPositions: (state, action: PayloadAction<Array<{ id: string, position: Entity['position'] }>>) => {
      action.payload.forEach(update => {
        if (state.byId[update.id]) {
          const entity = state.byId[update.id];
          
          // Record current position in trajectory if enabled
          if (state.trajectoryEnabled) {
            // Only add to trajectory for moving entities
            if (entity.type !== EntityType.STATIONARY) {
              // Add current position to past positions array
              entity.trajectory.pastPositions.unshift({...entity.position});
              
              // Limit past positions array size
              if (entity.trajectory.pastPositions.length > state.maxPastPositions) {
                entity.trajectory.pastPositions = entity.trajectory.pastPositions.slice(0, state.maxPastPositions);
              }
              
              // Generate simple projected path based on velocity
              if (entity.velocity) {
                entity.trajectory.projectedPath = calculateProjectedPath(
                  update.position, 
                  entity.velocity, 
                  state.maxProjectedPositions
                );
              }
            }
          }
          
          // Update entity position
          entity.position = update.position;
          entity.lastUpdated = Date.now();
        }
      });
      state.lastUpdate = Date.now();
    },
    setTrajectoryEnabled: (state, action: PayloadAction<boolean>) => {
      state.trajectoryEnabled = action.payload;
      
      // Clear trajectories if disabled
      if (!action.payload) {
        Object.values(state.byId).forEach(entity => {
          entity.trajectory.pastPositions = [];
          entity.trajectory.projectedPath = [];
        });
      }
    },
    setMaxPastPositions: (state, action: PayloadAction<number>) => {
      state.maxPastPositions = action.payload;
      
      // Trim existing trajectories if needed
      Object.values(state.byId).forEach(entity => {
        if (entity.trajectory.pastPositions.length > action.payload) {
          entity.trajectory.pastPositions = entity.trajectory.pastPositions.slice(0, action.payload);
        }
      });
    },
    setMaxProjectedPositions: (state, action: PayloadAction<number>) => {
      state.maxProjectedPositions = action.payload;
      
      // Update projected paths to match new limit
      Object.values(state.byId).forEach(entity => {
        if (entity.trajectory.projectedPath.length > 0 && entity.velocity) {
          entity.trajectory.projectedPath = calculateProjectedPath(
            entity.position,
            entity.velocity,
            action.payload
          );
        }
      });
    },
    clearTrajectories: (state) => {
      Object.values(state.byId).forEach(entity => {
        entity.trajectory.pastPositions = [];
        entity.trajectory.projectedPath = [];
      });
    }
  },
});

// Helper function to calculate projected path based on current position and velocity
function calculateProjectedPath(
  position: Position, 
  velocity: Position, 
  steps: number
): Position[] {
  const path: Position[] = [];
  
  let currentX = position.x;
  let currentY = position.y;
  let currentZ = position.z;
  
  for (let i = 1; i <= steps; i++) {
    // Simple linear projection with slight randomness for natural appearance
    currentX += velocity.x + (Math.random() - 0.5) * 0.1;
    currentY += velocity.y + (Math.random() - 0.5) * 0.1;
    currentZ += velocity.z + (Math.random() - 0.5) * 0.1;
    
    path.push({
      x: currentX,
      y: currentY,
      z: currentZ
    });
  }
  
  return path;
}

// Actions
export const {
  addEntity,
  updateEntity,
  removeEntity,
  selectEntity,
  deselectEntity,
  clearSelection,
  filterEntities,
  clearFilters,
  updateEntityPositions,
  setTrajectoryEnabled,
  setMaxPastPositions,
  setMaxProjectedPositions,
  clearTrajectories
} = entitySlice.actions;

// Selectors
export const selectEntityById = (state: RootState, id: string): Entity | undefined => state.entities.byId[id];
export const selectAllEntities = (state: RootState): Entity[] => state.entities.allIds.map(id => state.entities.byId[id]);
export const selectSelectedEntities = (state: RootState): Entity[] => 
  state.entities.selectedIds.map(id => state.entities.byId[id]).filter(Boolean);
export const selectFilteredEntities = (state: RootState): Entity[] => 
  (state.entities.filteredIds.length > 0 ? state.entities.filteredIds : state.entities.allIds)
    .map(id => state.entities.byId[id])
    .filter(Boolean);
export const selectEntitiesByType = (state: RootState, type: EntityType): Entity[] =>
  state.entities.allIds
    .map(id => state.entities.byId[id])
    .filter(entity => entity.type === type);
export const selectEntitiesByStatus = (state: RootState, status: EntityStatus): Entity[] =>
  state.entities.allIds
    .map(id => state.entities.byId[id])
    .filter(entity => entity.status === status);
export const selectTrajectoryEnabled = (state: RootState): boolean => state.entities.trajectoryEnabled;
export const selectTrajectorySettings = (state: RootState) => ({
  enabled: state.entities.trajectoryEnabled,
  maxPastPositions: state.entities.maxPastPositions,
  maxProjectedPositions: state.entities.maxProjectedPositions
});

export default entitySlice.reducer; 