import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Entity, EntityType, EntityStatus } from './entityTypes';
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
}

/**
 * Initial state
 */
const initialState: EntityState = {
  byId: {},
  allIds: [],
  selectedIds: [],
  filteredIds: [],
  lastUpdate: Date.now()
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
  lastUpdate: Date.now()
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
          state.byId[update.id].position = update.position;
          state.byId[update.id].lastUpdated = Date.now();
        }
      });
      state.lastUpdate = Date.now();
    }
  },
});

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
  updateEntityPositions
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

export default entitySlice.reducer; 