import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EntityType, EntityStatus } from './entityTypes';

/**
 * Filter criteria definition
 */
export interface FilterCriteria {
  id: string;
  name: string;
  description?: string;
  types?: EntityType[];
  statuses?: EntityStatus[];
  tags?: string[];
  healthMin?: number;
  healthMax?: number;
  positionBounds?: {
    x: [number, number] | null;
    y: [number, number] | null;
    z: [number, number] | null;
  };
  customFilter?: string; // JSON string representing a custom function
  isActive: boolean;
  isPinned: boolean;
  dateCreated: number;
  dateModified: number;
}

/**
 * Entity filter state interface
 */
interface EntityFilterState {
  activeFilterId: string | null;
  savedFilters: Record<string, FilterCriteria>;
  quickFilters: {
    types: EntityType[];
    statuses: EntityStatus[];
    tags: string[];
    healthThreshold: number | null;
  };
  filteredIds: string[];
  highlightedIds: string[];
  hiddenIds: string[];
  showingFiltered: boolean;
  showHidden: boolean;
}

/**
 * Initial state for entity filter slice
 */
const initialState: EntityFilterState = {
  activeFilterId: null,
  savedFilters: {},
  quickFilters: {
    types: [],
    statuses: [],
    tags: [],
    healthThreshold: null
  },
  filteredIds: [],
  highlightedIds: [],
  hiddenIds: [],
  showingFiltered: false,
  showHidden: false
};

/**
 * Entity filter slice
 */
const entityFilterSlice = createSlice({
  name: 'entityFilter',
  initialState,
  reducers: {
    /**
     * Set active filter by ID
     */
    setActiveFilter: (state, action: PayloadAction<string | null>) => {
      state.activeFilterId = action.payload;
      state.showingFiltered = action.payload !== null;
    },
    
    /**
     * Save a filter criteria
     */
    saveFilter: (state, action: PayloadAction<FilterCriteria>) => {
      const filter = action.payload;
      state.savedFilters[filter.id] = filter;
    },
    
    /**
     * Update a saved filter
     */
    updateFilter: (state, action: PayloadAction<{
      id: string;
      changes: Partial<Omit<FilterCriteria, 'id'>>;
    }>) => {
      const { id, changes } = action.payload;
      if (state.savedFilters[id]) {
        state.savedFilters[id] = {
          ...state.savedFilters[id],
          ...changes,
          dateModified: Date.now()
        };
      }
    },
    
    /**
     * Delete a saved filter
     */
    deleteFilter: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.activeFilterId === id) {
        state.activeFilterId = null;
      }
      delete state.savedFilters[id];
    },
    
    /**
     * Set quick filter for entity types
     */
    setTypeFilter: (state, action: PayloadAction<EntityType[]>) => {
      state.quickFilters.types = action.payload;
      state.showingFiltered = 
        state.quickFilters.types.length > 0 || 
        state.quickFilters.statuses.length > 0 || 
        state.quickFilters.tags.length > 0 ||
        state.quickFilters.healthThreshold !== null;
    },
    
    /**
     * Set quick filter for entity statuses
     */
    setStatusFilter: (state, action: PayloadAction<EntityStatus[]>) => {
      state.quickFilters.statuses = action.payload;
      state.showingFiltered = 
        state.quickFilters.types.length > 0 || 
        state.quickFilters.statuses.length > 0 || 
        state.quickFilters.tags.length > 0 ||
        state.quickFilters.healthThreshold !== null;
    },
    
    /**
     * Set quick filter for entity tags
     */
    setTagFilter: (state, action: PayloadAction<string[]>) => {
      state.quickFilters.tags = action.payload;
      state.showingFiltered = 
        state.quickFilters.types.length > 0 || 
        state.quickFilters.statuses.length > 0 || 
        state.quickFilters.tags.length > 0 ||
        state.quickFilters.healthThreshold !== null;
    },
    
    /**
     * Set quick filter for health threshold
     */
    setHealthThresholdFilter: (state, action: PayloadAction<number | null>) => {
      state.quickFilters.healthThreshold = action.payload;
      state.showingFiltered = 
        state.quickFilters.types.length > 0 || 
        state.quickFilters.statuses.length > 0 || 
        state.quickFilters.tags.length > 0 ||
        state.quickFilters.healthThreshold !== null;
    },
    
    /**
     * Clear all quick filters
     */
    clearQuickFilters: (state) => {
      state.quickFilters = {
        types: [],
        statuses: [],
        tags: [],
        healthThreshold: null
      };
      state.showingFiltered = state.activeFilterId !== null;
    },
    
    /**
     * Set filtered entity IDs
     */
    setFilteredIds: (state, action: PayloadAction<string[]>) => {
      state.filteredIds = action.payload;
    },
    
    /**
     * Set highlighted entity IDs
     */
    setHighlightedIds: (state, action: PayloadAction<string[]>) => {
      state.highlightedIds = action.payload;
    },
    
    /**
     * Add entity to hidden list
     */
    hideEntity: (state, action: PayloadAction<string>) => {
      if (!state.hiddenIds.includes(action.payload)) {
        state.hiddenIds.push(action.payload);
      }
    },
    
    /**
     * Remove entity from hidden list
     */
    showEntity: (state, action: PayloadAction<string>) => {
      state.hiddenIds = state.hiddenIds.filter(id => id !== action.payload);
    },
    
    /**
     * Toggle visibility of hidden entities
     */
    toggleShowHidden: (state) => {
      state.showHidden = !state.showHidden;
    },
    
    /**
     * Import filters from JSON
     */
    importFilters: (state, action: PayloadAction<Record<string, FilterCriteria>>) => {
      state.savedFilters = {
        ...state.savedFilters,
        ...action.payload
      };
    },
    
    /**
     * Toggle filter active state
     */
    toggleFilterActive: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.savedFilters[id]) {
        state.savedFilters[id].isActive = !state.savedFilters[id].isActive;
      }
    },
    
    /**
     * Toggle filter pinned state
     */
    toggleFilterPinned: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.savedFilters[id]) {
        state.savedFilters[id].isPinned = !state.savedFilters[id].isPinned;
      }
    }
  }
});

// Export actions
export const {
  setActiveFilter,
  saveFilter,
  updateFilter,
  deleteFilter,
  setTypeFilter,
  setStatusFilter,
  setTagFilter,
  setHealthThresholdFilter,
  clearQuickFilters,
  setFilteredIds,
  setHighlightedIds,
  hideEntity,
  showEntity,
  toggleShowHidden,
  importFilters,
  toggleFilterActive,
  toggleFilterPinned
} = entityFilterSlice.actions;

// Export reducer
export default entityFilterSlice.reducer; 