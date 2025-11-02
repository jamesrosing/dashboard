import { store } from '../state/store';

/**
 * WebSocket connection states
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * WebSocket message types
 */
export enum MessageType {
  ENTITY_UPDATE = 'entityUpdate',
  ENTITY_BATCH_UPDATE = 'entityBatchUpdate',
  ENTITY_DELETE = 'entityDelete',
  CONNECTION_STATUS = 'connectionStatus',
  AUTHENTICATION = 'authentication',
  COMMAND = 'command',
  COMMAND_RESPONSE = 'commandResponse',
  ERROR = 'error'
}

/**
 * WebSocket message interface
 */
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp?: number;
  messageId?: string;
}

/**
 * Connection configuration
 */
export interface ConnectionConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  authToken?: string;
}

/**
 * Class to manage WebSocket connections and message handling
 */
export class WebSocketManager {
  private socket: WebSocket | null = null;
  private config: ConnectionConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<MessageType, ((message: WebSocketMessage) => void)[]> = new Map();
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private messageQueue: WebSocketMessage[] = [];
  private messageIdCounter = 0;
  
  /**
   * Create WebSocket manager with configuration
   */
  constructor(config: ConnectionConfig) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config
    };
  }
  
  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        return resolve();
      }

      this.updateConnectionState(ConnectionState.CONNECTING);

      // Set connection timeout (5 seconds)
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          this.socket.close();
          const error = new Error('WebSocket connection timeout');
          this.onError(error);
          reject(error);
        }
      }, 5000);

      try {
        this.socket = new WebSocket(this.config.url);

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout);
          this.onConnected();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleIncomingMessage(event);
        };

        this.socket.onclose = () => {
          clearTimeout(connectionTimeout);
          this.onDisconnected();
        };

        this.socket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          this.onError(error);
          reject(error);
        };
      } catch (error) {
        clearTimeout(connectionTimeout);
        this.onError(error);
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      // Stop any reconnection attempts
      this.clearReconnectTimer();
      this.config.autoReconnect = false;
      
      this.socket.close();
      this.socket = null;
      this.updateConnectionState(ConnectionState.DISCONNECTED);
    }
  }
  
  /**
   * Handle successful connection
   */
  private onConnected(): void {
    this.reconnectAttempts = 0;
    this.updateConnectionState(ConnectionState.CONNECTED);
    
    // Send any queued messages
    this.sendQueuedMessages();
    
    // Send authentication if token is provided
    if (this.config.authToken) {
      this.sendMessage({
        type: MessageType.AUTHENTICATION,
        payload: {
          token: this.config.authToken
        }
      });
    }
    
    // Notify application of connection
    store.dispatch({
      type: 'websocket/connectionChanged',
      payload: {
        state: ConnectionState.CONNECTED,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Handle disconnection
   */
  private onDisconnected(): void {
    this.updateConnectionState(ConnectionState.DISCONNECTED);
    
    // Notify application of disconnection
    store.dispatch({
      type: 'websocket/connectionChanged',
      payload: {
        state: ConnectionState.DISCONNECTED,
        timestamp: Date.now()
      }
    });
    
    // Attempt to reconnect if configured
    if (this.config.autoReconnect) {
      this.attemptReconnection();
    }
  }
  
  /**
   * Handle connection errors
   */
  private onError(error: any): void {
    this.updateConnectionState(ConnectionState.ERROR);
    
    // Notify application of error
    store.dispatch({
      type: 'websocket/connectionError',
      payload: {
        error: error.message || 'Unknown WebSocket error',
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Attempt to reconnect with backoff
   */
  private attemptReconnection(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      // Max attempts reached
      store.dispatch({
        type: 'websocket/connectionFailed',
        payload: {
          reason: 'Maximum reconnection attempts reached',
          timestamp: Date.now()
        }
      });
      return;
    }
    
    this.reconnectAttempts++;
    this.updateConnectionState(ConnectionState.RECONNECTING);
    
    // Notify application of reconnection attempt
    store.dispatch({
      type: 'websocket/reconnecting',
      payload: {
        attempt: this.reconnectAttempts,
        maxAttempts: this.config.maxReconnectAttempts,
        timestamp: Date.now()
      }
    });
    
    // Set timer for reconnection with backoff
    const delay = this.config.reconnectInterval! * Math.min(this.reconnectAttempts, 5);
    this.clearReconnectTimer();
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Connection failed, will try again automatically
      });
    }, delay);
  }
  
  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * Update connection state
   */
  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
  }
  
  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  /**
   * Send WebSocket message
   */
  sendMessage(message: WebSocketMessage): boolean {
    // Add timestamp and message ID if not provided
    const enhancedMessage: WebSocketMessage = {
      ...message,
      timestamp: message.timestamp || Date.now(),
      messageId: message.messageId || `msg_${++this.messageIdCounter}`
    };
    
    // Check if connected
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(enhancedMessage));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        // Queue message for retry
        this.queueMessage(enhancedMessage);
        return false;
      }
    } else {
      // Queue message for when connection is established
      this.queueMessage(enhancedMessage);
      return false;
    }
  }
  
  /**
   * Queue message for later sending
   */
  private queueMessage(message: WebSocketMessage): void {
    // Only queue important messages
    const importantMessageTypes = [
      MessageType.ENTITY_UPDATE,
      MessageType.COMMAND,
      MessageType.AUTHENTICATION
    ];
    
    if (importantMessageTypes.includes(message.type)) {
      this.messageQueue.push(message);
      
      // Limit queue size
      if (this.messageQueue.length > 100) {
        this.messageQueue.shift();
      }
    }
  }
  
  /**
   * Send queued messages
   */
  private sendQueuedMessages(): void {
    if (this.messageQueue.length === 0) return;
    
    // Clone and clear queue
    const queuedMessages = [...this.messageQueue];
    this.messageQueue = [];
    
    // Send each message
    queuedMessages.forEach(message => {
      this.sendMessage(message);
    });
  }
  
  /**
   * Handle incoming WebSocket message
   */
  private handleIncomingMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Process message
      this.processMessage(message);
      
      // Call registered handlers
      this.notifyMessageHandlers(message);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }
  
  /**
   * Process received message and update application state
   */
  private processMessage(message: WebSocketMessage): void {
    const { type, payload } = message;
    
    switch (type) {
      case MessageType.ENTITY_UPDATE:
        // Update a single entity
        store.dispatch({
          type: 'entities/updateEntity',
          payload: payload
        });
        break;
        
      case MessageType.ENTITY_BATCH_UPDATE:
        // Update multiple entities at once
        store.dispatch({
          type: 'entities/updateEntities',
          payload: payload.entities
        });
        break;
        
      case MessageType.ENTITY_DELETE:
        // Delete an entity
        store.dispatch({
          type: 'entities/removeEntity',
          payload: payload.id
        });
        break;
        
      case MessageType.CONNECTION_STATUS:
        // Update connection status
        store.dispatch({
          type: 'websocket/connectionStatusUpdate',
          payload: payload
        });
        break;
        
      case MessageType.ERROR:
        // Handle error message
        store.dispatch({
          type: 'ui/addNotification',
          payload: {
            id: `ws-error-${Date.now()}`,
            type: 'error',
            message: payload.message || 'Unknown WebSocket error',
            timestamp: Date.now()
          }
        });
        break;
        
      case MessageType.COMMAND_RESPONSE:
        // Handle command response
        store.dispatch({
          type: 'commands/commandResponse',
          payload: payload
        });
        break;
    }
  }
  
  /**
   * Register a message handler for a specific message type
   */
  registerMessageHandler(type: MessageType, handler: (message: WebSocketMessage) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)?.push(handler);
  }
  
  /**
   * Unregister a message handler
   */
  unregisterMessageHandler(type: MessageType, handler: (message: WebSocketMessage) => void): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  /**
   * Notify all registered handlers for a message
   */
  private notifyMessageHandlers(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }
}

// Export singleton instance with default config
// Create singleton instance with default config
export const websocketManager = new WebSocketManager({
  // Use environment variable for WebSocket URL if available
  url: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WS_URL
    ? process.env.NEXT_PUBLIC_WS_URL 
    : (typeof window !== 'undefined' && window.location)
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket`
      : 'ws://localhost:3000/api/websocket'
});

export default websocketManager; 