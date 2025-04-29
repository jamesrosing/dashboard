import { configureStore } from '@reduxjs/toolkit';
import entityReducer from './entitySlice';

/**
 * Camera state interface
 */
export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
}

/**
 * Visualization state interface
 */
export interface VisualizationState {
  camera: CameraState;
  terrain: {
    enabled: boolean;
    resolution: number;
  };
  renderSettings: {
    showTrajectories: boolean;
    showLabels: boolean;
    showGrid: boolean;
    detailLevel: 'high' | 'medium' | 'low';
  };
}

/**
 * UI state interface
 */
export interface UIState {
  activePanel: string | null;
  showEntityList: boolean;
  showDetailsPanel: boolean;
  notifications: {
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }[];
}

/**
 * Connection state interface
 */
export interface ConnectionState {
  status: 'connected' | 'connecting' | 'disconnected';
  latency: number;
  lastReconnect: number | null;
}

/**
 * Initial visualization state
 */
const initialVisualizationState: VisualizationState = {
  camera: {
    position: { x: 0, y: 100, z: 200 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1
  },
  terrain: {
    enabled: true,
    resolution: 128
  },
  renderSettings: {
    showTrajectories: true,
    showLabels: true,
    showGrid: true,
    detailLevel: 'high'
  }
};

/**
 * Visualization reducer
 */
function visualizationReducer(
  state = initialVisualizationState,
  action: any
): VisualizationState {
  switch (action.type) {
    case 'visualization/setCameraPosition':
      return {
        ...state,
        camera: {
          ...state.camera,
          position: action.payload
        }
      };
    case 'visualization/setCameraTarget':
      return {
        ...state,
        camera: {
          ...state.camera,
          target: action.payload
        }
      };
    case 'visualization/setCameraZoom':
      return {
        ...state,
        camera: {
          ...state.camera,
          zoom: action.payload
        }
      };
    case 'visualization/setTerrainEnabled':
      return {
        ...state,
        terrain: {
          ...state.terrain,
          enabled: action.payload
        }
      };
    case 'visualization/setTerrainResolution':
      return {
        ...state,
        terrain: {
          ...state.terrain,
          resolution: action.payload
        }
      };
    case 'visualization/setRenderSettings':
      return {
        ...state,
        renderSettings: {
          ...state.renderSettings,
          ...action.payload
        }
      };
    default:
      return state;
  }
}

/**
 * Initial UI state
 */
const initialUIState: UIState = {
  activePanel: null,
  showEntityList: true,
  showDetailsPanel: true,
  notifications: []
};

/**
 * UI reducer
 */
function uiReducer(state = initialUIState, action: any): UIState {
  switch (action.type) {
    case 'ui/setActivePanel':
      return {
        ...state,
        activePanel: action.payload
      };
    case 'ui/toggleEntityList':
      return {
        ...state,
        showEntityList: !state.showEntityList
      };
    case 'ui/toggleDetailsPanel':
      return {
        ...state,
        showDetailsPanel: !state.showDetailsPanel
      };
    case 'ui/addNotification':
      return {
        ...state,
        notifications: [...state.notifications, {
          ...action.payload,
          timestamp: Date.now()
        }]
      };
    case 'ui/removeNotification':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'ui/clearNotifications':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
}

/**
 * Initial connection state
 */
const initialConnectionState: ConnectionState = {
  status: 'disconnected',
  latency: 0,
  lastReconnect: null
};

/**
 * Connection reducer
 */
function connectionReducer(state = initialConnectionState, action: any): ConnectionState {
  switch (action.type) {
    case 'connection/setStatus':
      return {
        ...state,
        status: action.payload,
        lastReconnect: action.payload === 'connected' ? Date.now() : state.lastReconnect
      };
    case 'connection/setLatency':
      return {
        ...state,
        latency: action.payload
      };
    default:
      return state;
  }
}

/**
 * Configure Redux store
 */
export const store = configureStore({
  reducer: {
    entities: entityReducer,
    visualization: visualizationReducer,
    ui: uiReducer,
    connection: connectionReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['visualization/updateScene'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.threeObject', 'payload.scene', 'payload.camera'],
        // Ignore these paths in the state
        ignoredPaths: ['visualization.threeObjects']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 