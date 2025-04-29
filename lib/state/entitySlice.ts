import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Entity, EntityType, EntityStatus, Position } from './entityTypes';
import mockEntities from './mockEntities';
import { RootState } from './store';

// Add safe browser detection
const isBrowser = typeof window !== 'undefined';

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
  trajectorySettings: {
    maxPastPositions: number;
    showSelectedOnly: boolean;
  };
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
  maxPastPositions: 20,
  maxProjectedPositions: 20,
  trajectorySettings: {
    maxPastPositions: 20,
    showSelectedOnly: false
  }
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
  maxProjectedPositions: 10,
  trajectorySettings: {
    maxPastPositions: 20,
    showSelectedOnly: false
  }
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
      
      // Initialize trajectory data if not present
      if (!entity.pastPositions) {
        entity.pastPositions = [];
      }
      
      if (!entity.futurePositions) {
        entity.futurePositions = [];
      }
      
      state.byId[entity.id] = entity;
      if (!state.allIds.includes(entity.id)) {
        state.allIds.push(entity.id);
      }
      state.lastUpdate = Date.now();
    },
    updateEntity: (state, action: PayloadAction<{id: string, changes: Partial<Entity>}>) => {
      const { id, changes } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...changes };
        state.lastUpdate = Date.now();
      }
    },
    updateEntityPosition: (state, action: PayloadAction<{id: string, position: Position}>) => {
      const { id, position } = action.payload;
      const entity = state.byId[id];
      
      if (entity) {
        // Skip during SSR
        if (!isBrowser) {
          entity.position = position;
          return;
        }
        
        // Add current position to past positions before updating
        if (!entity.pastPositions) {
          entity.pastPositions = [];
        }
        
        if (entity.position) {
          entity.pastPositions.push({ ...entity.position });
        }
        
        // Limit the number of past positions
        const maxPositions = state.trajectorySettings.maxPastPositions;
        if (entity.pastPositions.length > maxPositions) {
          entity.pastPositions = entity.pastPositions.slice(-maxPositions);
        }
        
        // Update current position
        entity.position = position;
        
        // Calculate future positions based on current velocity if available
        if (entity.velocity) {
          if (!entity.futurePositions) {
            entity.futurePositions = [];
          }
          
          // Clear previous future positions
          entity.futurePositions = [];
          
          // Simple linear projection for 5 steps ahead
          const { x, y, z } = entity.position;
          const velocity = entity.velocity;
          
          for (let i = 1; i <= 5; i++) {
            entity.futurePositions.push({
              x: x + velocity.x * i,
              y: y + velocity.y * i,
              z: z + velocity.z * i
            });
          }
        }
      }
      state.lastUpdate = Date.now();
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
      if (!state.selectedIds.includes(id) && state.allIds.includes(id)) {
        state.selectedIds = [id]; // Single selection for now
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
    setFilteredEntities: (state, action: PayloadAction<string[]>) => {
      state.filteredIds = action.payload;
    },
    clearFilteredEntities: (state) => {
      state.filteredIds = [];
    },
    setTrajectoryEnabled: (state, action: PayloadAction<boolean>) => {
      state.trajectoryEnabled = action.payload;
      
      // Clear trajectories if disabled
      if (!action.payload) {
        Object.values(state.byId).forEach(entity => {
          entity.pastPositions = [];
          entity.futurePositions = [];
        });
      }
    },
    setMaxPastPositions: (state, action: PayloadAction<number>) => {
      state.maxPastPositions = action.payload;
      
      // Trim existing trajectories if needed
      Object.values(state.byId).forEach(entity => {
        if (entity.pastPositions && entity.pastPositions.length > action.payload) {
          entity.pastPositions = entity.pastPositions.slice(0, action.payload);
        }
      });
    },
    setMaxProjectedPositions: (state, action: PayloadAction<number>) => {
      state.maxProjectedPositions = action.payload;
      
      // Update projected paths to match new limit
      Object.values(state.byId).forEach(entity => {
        if (entity.futurePositions && entity.futurePositions.length > 0 && entity.velocity) {
          entity.futurePositions = calculateProjectedPath(
            entity.position,
            entity.velocity,
            action.payload
          );
        }
      });
    },
    clearTrajectories: (state) => {
      Object.values(state.byId).forEach(entity => {
        entity.pastPositions = [];
        entity.futurePositions = [];
      });
    },
    updateTrajectorySettings: (state, action: PayloadAction<Partial<EntityState['trajectorySettings']>>) => {
      state.trajectorySettings = {
        ...state.trajectorySettings,
        ...action.payload
      };
    }
  },
});

// Helper function to calculate projected path based on current position and velocity
function calculateProjectedPath(
  position: Position, 
  velocity: Position, 
  steps: number
): Position[] {
  // Validate inputs
  if (!position || !velocity) {
    return [];
  }
  
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
  updateEntityPosition,
  removeEntity,
  selectEntity,
  deselectEntity,
  clearSelection,
  filterEntities,
  clearFilters,
  setFilteredEntities,
  clearFilteredEntities,
  setTrajectoryEnabled,
  setMaxPastPositions,
  setMaxProjectedPositions,
  clearTrajectories,
  updateTrajectorySettings
} = entitySlice.actions;

// Selectors
export const selectEntitiesState = (state: RootState) => state.entities;

export const selectEntityById = (state: RootState, id: string): Entity | undefined => state.entities.byId[id];

export const selectAllEntities = createSelector(
  selectEntitiesState,
  (entities) => entities.allIds.map(id => entities.byId[id])
);

export const selectSelectedEntities = createSelector(
  selectEntitiesState,
  (entities) => entities.selectedIds.map(id => entities.byId[id])
);

export const selectFilteredEntities = createSelector(
  selectEntitiesState,
  (entities) => entities.filteredIds.length > 0 
    ? entities.filteredIds.map(id => entities.byId[id])
    : entities.allIds.map(id => entities.byId[id])
);

export const selectEntitiesByType = (type: EntityType) => createSelector(
  selectAllEntities,
  (entities) => entities.filter(entity => entity.type === type)
);

export const selectEntitiesByStatus = (status: EntityStatus) => createSelector(
  selectAllEntities,
  (entities) => entities.filter(entity => entity.status === status)
);

export const selectTrajectoryEnabled = createSelector(
  selectEntitiesState,
  (entities) => entities.trajectoryEnabled
);

export const selectTrajectorySettings = createSelector(
  selectEntitiesState,
  (entities) => entities.trajectorySettings
);

export default entitySlice.reducer; 