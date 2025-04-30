import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConnectionState } from '../websocket/websocketManager';

/**
 * WebSocket state interface
 */
interface WebSocketState {
  connectionState: ConnectionState;
  lastConnected: number | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  error: string | null;
  connectionStats: {
    messagesReceived: number;
    messagesSent: number;
    bytesReceived: number;
    bytesSent: number;
    lastMessageTime: number | null;
  };
  latency: number | null;
}

/**
 * Initial state for WebSocket slice
 */
const initialState: WebSocketState = {
  connectionState: ConnectionState.DISCONNECTED,
  lastConnected: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  error: null,
  connectionStats: {
    messagesReceived: 0,
    messagesSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    lastMessageTime: null
  },
  latency: null
};

/**
 * Redux slice for WebSocket state
 */
const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    /**
     * Connection state changed
     */
    connectionChanged: (state, action: PayloadAction<{
      state: ConnectionState;
      timestamp: number;
    }>) => {
      state.connectionState = action.payload.state;
      
      if (action.payload.state === ConnectionState.CONNECTED) {
        state.lastConnected = action.payload.timestamp;
        state.reconnectAttempts = 0;
        state.error = null;
      }
    },
    
    /**
     * Connection error occurred
     */
    connectionError: (state, action: PayloadAction<{
      error: string;
      timestamp: number;
    }>) => {
      state.error = action.payload.error;
      state.connectionState = ConnectionState.ERROR;
    },
    
    /**
     * Connection failed after max reconnect attempts
     */
    connectionFailed: (state, action: PayloadAction<{
      reason: string;
      timestamp: number;
    }>) => {
      state.error = action.payload.reason;
      state.connectionState = ConnectionState.DISCONNECTED;
    },
    
    /**
     * Reconnecting attempt
     */
    reconnecting: (state, action: PayloadAction<{
      attempt: number;
      maxAttempts: number;
      timestamp: number;
    }>) => {
      state.connectionState = ConnectionState.RECONNECTING;
      state.reconnectAttempts = action.payload.attempt;
      state.maxReconnectAttempts = action.payload.maxAttempts;
    },
    
    /**
     * Connection status update
     */
    connectionStatusUpdate: (state, action: PayloadAction<{
      latency?: number;
      messagesReceived?: number;
      messagesSent?: number;
      bytesReceived?: number;
      bytesSent?: number;
    }>) => {
      if (action.payload.latency !== undefined) {
        state.latency = action.payload.latency;
      }
      
      if (action.payload.messagesReceived !== undefined) {
        state.connectionStats.messagesReceived = action.payload.messagesReceived;
      }
      
      if (action.payload.messagesSent !== undefined) {
        state.connectionStats.messagesSent = action.payload.messagesSent;
      }
      
      if (action.payload.bytesReceived !== undefined) {
        state.connectionStats.bytesReceived = action.payload.bytesReceived;
      }
      
      if (action.payload.bytesSent !== undefined) {
        state.connectionStats.bytesSent = action.payload.bytesSent;
      }
      
      state.connectionStats.lastMessageTime = Date.now();
    },
    
    /**
     * Message received
     */
    messageReceived: (state, action: PayloadAction<{
      size: number;
    }>) => {
      state.connectionStats.messagesReceived++;
      state.connectionStats.bytesReceived += action.payload.size;
      state.connectionStats.lastMessageTime = Date.now();
    },
    
    /**
     * Message sent
     */
    messageSent: (state, action: PayloadAction<{
      size: number;
    }>) => {
      state.connectionStats.messagesSent++;
      state.connectionStats.bytesSent += action.payload.size;
    },
    
    /**
     * Reset connection stats
     */
    resetConnectionStats: (state) => {
      state.connectionStats = {
        messagesReceived: 0,
        messagesSent: 0,
        bytesReceived: 0,
        bytesSent: 0,
        lastMessageTime: null
      };
    }
  }
});

// Export actions
export const {
  connectionChanged,
  connectionError,
  connectionFailed,
  reconnecting,
  connectionStatusUpdate,
  messageReceived,
  messageSent,
  resetConnectionStats
} = websocketSlice.actions;

// Export reducer
export default websocketSlice.reducer; 