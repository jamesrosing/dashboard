import React, { useState, useEffect } from 'react';
import ClientOnly from './ClientOnly';

export default function StatusBar() {
  const [latency, setLatency] = useState<number>(0);
  const [connectionStatus] = useState<'connected' | 'disconnected'>('connected');
  
  // Simulate random latency
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.random() * 20 + 5);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
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
  );
} 