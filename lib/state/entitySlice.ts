import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Entity, EntityStatus, EntityType } from './entityTypes';

/**
 * Entity state interface
 */
interface EntityState {
  byId: Record<string, Entity>;
  allIds: string[];
  selectedIds: string[];
  groupedIds: Record<string, string[]>;
  filteredIds: string[];
  lastUpdate: number;
  filter: {
    status?: EntityStatus[];
    type?: EntityType[];
    searchTerm?: string;
  };
}

/**
 * Initial state
 */
const initialState: EntityState = {
  byId: {},
  allIds: [],
  selectedIds: [],
  groupedIds: {},
  filteredIds: [],
  lastUpdate: 0,
  filter: {}
};

/**
 * Entity slice
 */
export const entitySlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    // Add a new entity or update an existing one
    upsertEntity: (state, action: PayloadAction<Entity>) => {
      const entity = action.payload;
      state.byId[entity.id] = entity;
      
      // Add to allIds if not already present
      if (!state.allIds.includes(entity.id)) {
        state.allIds.push(entity.id);
      }
      
      state.lastUpdate = Date.now();
      
      // Update filtered ids based on current filter
      applyFilter(state);
    },
    
    // Update multiple entities at once
    updateEntities: (state, action: PayloadAction<Entity[]>) => {
      action.payload.forEach(entity => {
        if (state.byId[entity.id]) {
          state.byId[entity.id] = {
            ...state.byId[entity.id],
            ...entity,
            lastUpdated: Date.now()
          };
        }
      });
      
      state.lastUpdate = Date.now();
      
      // Update filtered ids based on current filter
      applyFilter(state);
    },
    
    // Remove an entity
    removeEntity: (state, action: PayloadAction<string>) => {
      const entityId = action.payload;
      
      // Remove from byId
      delete state.byId[entityId];
      
      // Remove from allIds
      state.allIds = state.allIds.filter(id => id !== entityId);
      
      // Remove from selectedIds
      state.selectedIds = state.selectedIds.filter(id => id !== entityId);
      
      // Remove from groupedIds
      Object.keys(state.groupedIds).forEach(group => {
        state.groupedIds[group] = state.groupedIds[group].filter(id => id !== entityId);
      });
      
      // Remove from filteredIds
      state.filteredIds = state.filteredIds.filter(id => id !== entityId);
      
      state.lastUpdate = Date.now();
    },
    
    // Set selected entities
    setSelectedEntities: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    
    // Add entity to selection
    addSelectedEntity: (state, action: PayloadAction<string>) => {
      const entityId = action.payload;
      if (!state.selectedIds.includes(entityId)) {
        state.selectedIds.push(entityId);
      }
    },
    
    // Remove entity from selection
    removeSelectedEntity: (state, action: PayloadAction<string>) => {
      state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
    },
    
    // Clear selection
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    
    // Create a new group
    createGroup: (state, action: PayloadAction<{ name: string, entityIds: string[] }>) => {
      const { name, entityIds } = action.payload;
      state.groupedIds[name] = entityIds;
    },
    
    // Add entity to group
    addEntityToGroup: (state, action: PayloadAction<{ group: string, entityId: string }>) => {
      const { group, entityId } = action.payload;
      
      if (!state.groupedIds[group]) {
        state.groupedIds[group] = [];
      }
      
      if (!state.groupedIds[group].includes(entityId)) {
        state.groupedIds[group].push(entityId);
      }
    },
    
    // Remove entity from group
    removeEntityFromGroup: (state, action: PayloadAction<{ group: string, entityId: string }>) => {
      const { group, entityId } = action.payload;
      
      if (state.groupedIds[group]) {
        state.groupedIds[group] = state.groupedIds[group].filter(id => id !== entityId);
      }
    },
    
    // Delete group
    deleteGroup: (state, action: PayloadAction<string>) => {
      const group = action.payload;
      delete state.groupedIds[group];
    },
    
    // Set filter
    setFilter: (state, action: PayloadAction<{
      status?: EntityStatus[],
      type?: EntityType[],
      searchTerm?: string
    }>) => {
      state.filter = action.payload;
      applyFilter(state);
    },
    
    // Clear filter
    clearFilter: (state) => {
      state.filter = {};
      state.filteredIds = state.allIds;
    }
  }
});

/**
 * Apply current filter to update filteredIds
 */
function applyFilter(state: EntityState) {
  const { status, type, searchTerm } = state.filter;
  
  // Start with all entities
  let filtered = state.allIds;
  
  // Filter by status if specified
  if (status && status.length > 0) {
    filtered = filtered.filter(id => status.includes(state.byId[id].status));
  }
  
  // Filter by type if specified
  if (type && type.length > 0) {
    filtered = filtered.filter(id => type.includes(state.byId[id].type));
  }
  
  // Filter by search term if specified
  if (searchTerm && searchTerm.length > 0) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(id => {
      const entity = state.byId[id];
      return (
        entity.id.toLowerCase().includes(term) ||
        entity.type.toString().toLowerCase().includes(term) ||
        (entity.metadata.name && entity.metadata.name.toLowerCase().includes(term))
      );
    });
  }
  
  state.filteredIds = filtered;
}

// Export actions
export const {
  upsertEntity,
  updateEntities,
  removeEntity,
  setSelectedEntities,
  addSelectedEntity,
  removeSelectedEntity,
  clearSelection,
  createGroup,
  addEntityToGroup,
  removeEntityFromGroup,
  deleteGroup,
  setFilter,
  clearFilter
} = entitySlice.actions;

// Selectors
export const selectEntities = (state: { entities: EntityState }) => state.entities.byId;
export const selectAllEntityIds = (state: { entities: EntityState }) => state.entities.allIds;
export const selectFilteredEntityIds = (state: { entities: EntityState }) => state.entities.filteredIds;
export const selectSelectedEntityIds = (state: { entities: EntityState }) => state.entities.selectedIds;

// Memoized selectors for better performance
export const selectAllEntities = createSelector(
  [selectEntities, selectAllEntityIds],
  (entities, ids) => ids.map(id => entities[id])
);

export const selectFilteredEntities = createSelector(
  [selectEntities, selectFilteredEntityIds],
  (entities, ids) => ids.map(id => entities[id])
);

export const selectSelectedEntities = createSelector(
  [selectEntities, selectSelectedEntityIds],
  (entities, ids) => ids.map(id => entities[id])
);

export const selectEntityById = (id: string) => 
  createSelector(
    [selectEntities],
    (entities) => entities[id]
  );

export const selectEntitiesByGroup = (group: string) =>
  createSelector(
    [selectEntities, (state: { entities: EntityState }) => state.entities.groupedIds[group] || []],
    (entities, ids) => ids.map(id => entities[id])
  );

// Export reducer
export default entitySlice.reducer; 