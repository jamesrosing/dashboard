import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { websocketManager, ConnectionState, MessageType } from './websocketManager';
import { RootState } from '../state/store';

/**
 * Custom hook for WebSocket connection management
 */
export const useWebSocketConnection = () => {
  const dispatch = useDispatch();
  const connectionState = useSelector((state: RootState) => state.websocket.connectionState);
  const latency = useSelector((state: RootState) => state.websocket.latency);
  const error = useSelector((state: RootState) => state.websocket.error);
  const [isPinging, setIsPinging] = useState(false);
  
  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(async () => {
    if (connectionState === ConnectionState.CONNECTED || 
        connectionState === ConnectionState.CONNECTING) {
      return;
    }
    
    try {
      await websocketManager.connect();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [connectionState]);
  
  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    websocketManager.disconnect();
  }, []);
  
  /**
   * Send ping to measure latency
   */
  const ping = useCallback(async () => {
    if (connectionState !== ConnectionState.CONNECTED) {
      return;
    }
    
    setIsPinging(true);
    
    // Record start time
    const startTime = Date.now();
    
    // Create a promise that resolves when pong is received
    const pongPromise = new Promise<number>((resolve) => {
      const handlePong = (message: any) => {
        if (message.type === 'pong') {
          // Remove handler after receiving pong
          websocketManager.unregisterMessageHandler(MessageType.CONNECTION_STATUS, handlePong);
          
          // Calculate latency
          const endTime = Date.now();
          const latency = endTime - startTime;
          resolve(latency);
        }
      };
      
      // Register handler for pong message
      websocketManager.registerMessageHandler(MessageType.CONNECTION_STATUS, handlePong);
      
      // Set timeout for pong response
      setTimeout(() => {
        websocketManager.unregisterMessageHandler(MessageType.CONNECTION_STATUS, handlePong);
        resolve(-1); // Timeout, no response
      }, 5000);
    });
    
    // Send ping message
    websocketManager.sendMessage({
      type: MessageType.CONNECTION_STATUS,
      payload: {
        type: 'ping',
        timestamp: Date.now()
      }
    });
    
    // Wait for pong response
    const latency = await pongPromise;
    
    // Update latency in state
    if (latency > 0) {
      dispatch({
        type: 'websocket/connectionStatusUpdate',
        payload: {
          latency
        }
      });
    }
    
    setIsPinging(false);
    
    return latency;
  }, [connectionState, dispatch]);
  
  /**
   * Subscribe to entity updates
   */
  const subscribeToEntityUpdates = useCallback(() => {
    if (connectionState !== ConnectionState.CONNECTED) {
      return false;
    }
    
    return websocketManager.sendMessage({
      type: MessageType.AUTHENTICATION,
      payload: {
        channels: ['entities']
      }
    });
  }, [connectionState]);
  
  /**
   * Initialize WebSocket connection on mount
   */
  useEffect(() => {
    // Auto-connect when component mounts
    connect();
    
    // Set up ping interval to measure latency
    const pingInterval = setInterval(() => {
      if (connectionState === ConnectionState.CONNECTED && !isPinging) {
        ping();
      }
    }, 30000); // Ping every 30 seconds
    
    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
    };
  }, [connect, connectionState, isPinging, ping]);
  
  return {
    connect,
    disconnect,
    ping,
    subscribeToEntityUpdates,
    connectionState,
    latency,
    error,
    isPinging
  };
}; 