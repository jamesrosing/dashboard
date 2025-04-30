import React, { useState, useEffect } from 'react';
import ClientOnly from './ClientOnly';
import PerformanceMetrics from './PerformanceMetrics';

interface StatusBarProps {
  fps?: number;
}

export default function StatusBar({ fps = 0 }: StatusBarProps) {
  const [latency, setLatency] = useState<number>(0);
  const [connectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState<boolean>(false);
  
  // Simulate random latency
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.random() * 20 + 5);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div 
            className={`w-2 h-2 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} 
          />
          <span className="text-sm">
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
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