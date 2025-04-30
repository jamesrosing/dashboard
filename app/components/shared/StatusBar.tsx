import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/state/store';
import { ConnectionState } from '@/lib/websocket/websocketManager';
import { useWebSocketConnection } from '@/lib/websocket/useWebSocketConnection';
import ClientOnly from './ClientOnly';
import PerformanceMetrics from './PerformanceMetrics';

interface StatusBarProps {
  fps?: number;
}

export default function StatusBar({ fps = 0 }: StatusBarProps) {
  const { ping, connect, connectionState } = useWebSocketConnection();
  const latency = useSelector((state: RootState) => state.websocket.latency) || 0;
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState<boolean>(false);

  // Get connection status display properties
  const getConnectionStatusDisplay = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return { color: 'bg-green-500', text: 'Connected' };
      case ConnectionState.CONNECTING:
        return { color: 'bg-yellow-500', text: 'Connecting' };
      case ConnectionState.RECONNECTING:
        return { color: 'bg-yellow-500', text: 'Reconnecting' };
      case ConnectionState.ERROR:
        return { color: 'bg-red-500', text: 'Error' };
      case ConnectionState.DISCONNECTED:
      default:
        return { color: 'bg-red-500', text: 'Disconnected' };
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  // Set up ping interval to measure latency
  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED) {
      const pingInterval = setInterval(() => {
        ping();
      }, 10000); // Ping every 10 seconds when connected
      
      return () => clearInterval(pingInterval);
    }
  }, [connectionState, ping]);

  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div 
            className={`w-2 h-2 rounded-full mr-2 ${statusDisplay.color}`} 
          />
          <span className="text-sm">
            {statusDisplay.text}
          </span>
          {connectionState !== ConnectionState.CONNECTED && (
            <button
              onClick={() => connect()}
              className="ml-2 text-xs px-2 py-0.5 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Connect
            </button>
          )}
        </div>
        <div className="text-sm">
          Latency: {latency.toFixed(1)}ms
        </div>
        <ClientOnly>
          <div className="text-sm">
            Time: {new Date().toLocaleTimeString()}
          </div>
        </ClientOnly>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Compact FPS display always visible */}
        <div className="text-sm flex items-center">
          <span className="mr-1">FPS:</span>
          <span 
            className={`font-medium ${
              fps >= 55 ? 'text-green-500' : 
              fps >= 30 ? 'text-yellow-500' : 
              'text-red-500'
            }`}
          >
            {fps}
          </span>
        </div>
        
        <button 
          onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
          className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
        >
          {showPerformanceMetrics ? 'Hide Details' : 'Show Details'}
        </button>
        
        {/* Expanded performance metrics modal */}
        {showPerformanceMetrics && (
          <div className="absolute bottom-10 right-4 z-10">
            <PerformanceMetrics 
              fps={fps} 
              expanded={true} 
              className="shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
} 