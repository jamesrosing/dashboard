import { io, Socket } from 'socket.io-client';
import { Entity } from '../state/entityTypes';
import { store } from '../state/store';
import { addEntity, updateEntity, removeEntity } from '../state/entitySlice';

/**
 * Command interface for entity commands
 */
interface EntityCommand {
  action: string;
  parameters?: Record<string, any>;
  timestamp?: number;
}

/**
 * WebSocket error interface
 */
interface WebSocketError {
  message: string;
  code?: number;
}

/**
 * WebSocket service for real-time entity data
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPingSent = 0;
  private serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket) {
      return;
    }

    // Update connection status
    store.dispatch({ type: 'connection/setStatus', payload: 'connecting' });

    // Create socket connection
    this.socket = io(this.serverUrl, {
      reconnection: false, // We'll handle reconnection manually
      transports: ['websocket'],
      query: {
        client: 'dashboard'
      }
    });

    // Setup event listeners
    this.setupEventListeners();

    // Start ping interval
    this.startPingInterval();
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (!this.socket) {
      return;
    }

    // Stop ping interval
    this.stopPingInterval();

    // Disconnect socket
    this.socket.disconnect();
    this.socket = null;

    // Update connection status
    store.dispatch({ type: 'connection/setStatus', payload: 'disconnected' });
  }

  /**
   * Reconnect to the WebSocket server
   */
  private reconnect(): void {
    this.reconnectAttempts++;

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.error('Maximum reconnect attempts reached');
      return;
    }

    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

    // Update connection status
    store.dispatch({ type: 'connection/setStatus', payload: 'connecting' });

    // Wait before reconnecting
    setTimeout(() => {
      this.disconnect();
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      store.dispatch({ type: 'connection/setStatus', payload: 'connected' });
      
      // Request initial data
      this.socket?.emit('requestEntities');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      store.dispatch({ type: 'connection/setStatus', payload: 'disconnected' });
      this.stopPingInterval();
      this.reconnect();
    });

    this.socket.on('error', (error: WebSocketError) => {
      console.error('WebSocket error:', error);
      store.dispatch({
        type: 'ui/addNotification',
        payload: {
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'Connection error: ' + error.message
        }
      });
    });

    this.socket.on('entityUpdate', (data: Entity) => {
      const state = store.getState();
      if (state.entities.byId && data.id in state.entities.byId) {
        store.dispatch(updateEntity({
          id: data.id,
          changes: data
        }));
      } else {
        store.dispatch(addEntity(data));
      }
    });

    this.socket.on('entitiesUpdate', (data: Entity[]) => {
      // Add new entities or update existing ones
      const state = store.getState();
      data.forEach(entity => {
        if (state.entities.byId && entity.id in state.entities.byId) {
          store.dispatch(updateEntity({
            id: entity.id,
            changes: entity
          }));
        } else {
          store.dispatch(addEntity(entity));
        }
      });
    });

    this.socket.on('entityRemove', (entityId: string) => {
      store.dispatch(removeEntity(entityId));
    });

    this.socket.on('pong', (timestamp: number) => {
      const latency = Date.now() - timestamp;
      store.dispatch({ type: 'connection/setLatency', payload: latency });
    });
  }

  /**
   * Start ping interval to measure latency
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.lastPingSent = Date.now();
        this.socket.emit('ping', this.lastPingSent);
      }
    }, 5000);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send command to entity
   */
  sendCommand(entityId: string, command: EntityCommand): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send command: not connected');
      store.dispatch({
        type: 'ui/addNotification',
        payload: {
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'Cannot send command: not connected'
        }
      });
      return;
    }

    this.socket.emit('command', { entityId, command });
  }

  /**
   * Send command to multiple entities
   */
  sendGroupCommand(entityIds: string[], command: EntityCommand): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send command: not connected');
      store.dispatch({
        type: 'ui/addNotification',
        payload: {
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'Cannot send group command: not connected'
        }
      });
      return;
    }

    this.socket.emit('groupCommand', { entityIds, command });
  }

  /**
   * Request full entity data refresh
   */
  requestEntities(): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot request entities: not connected');
      return;
    }

    this.socket.emit('requestEntities');
  }

  /**
   * Get current connection status
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  /**
   * Get server URL
   */
  getServerUrl(): string {
    return this.serverUrl;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

export default websocketService; 