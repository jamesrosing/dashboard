import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/state/hooks';
import { selectAllEntities, updateEntityPositions } from '@/lib/state/entitySlice';
import EntityWorld from './visualization/EntityWorld';
import EntityList from './shared/EntityList';
import EntityDetails from './shared/EntityDetails';

// Inline StatusBar component to fix import issues
const StatusBar = () => {
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
      <div className="text-sm">
        Time: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const entities = useAppSelector(selectAllEntities);
  const dispatch = useAppDispatch();
  const [fps, setFps] = useState(60);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  
  // Simulate entity movement
  useEffect(() => {
    const interval = setInterval(() => {
      const updates = entities.slice(0, 15).map(entity => {
        return {
          id: entity.id,
          position: {
            x: entity.position.x + (Math.random() - 0.5) * 0.5,
            y: entity.position.y + (Math.random() - 0.5) * 0.2,
            z: entity.position.z + (Math.random() - 0.5) * 0.5,
          }
        };
      });
      
      dispatch(updateEntityPositions(updates));
    }, 100);
    
    return () => clearInterval(interval);
  }, [entities, dispatch]);

  return (
    <div className="grid grid-rows-[60px_1fr_30px] h-screen w-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Real-time Multi-Entity Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded bg-green-600 text-sm">Connected</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Entities: {entities.length}</span>
            <span className="text-sm">|</span>
            <span className="text-sm">FPS: {fps}</span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 border-r border-gray-800 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Entities</h2>
          <EntityList 
            entities={entities}
            selectedEntityId={selectedEntityId}
            onSelectEntity={setSelectedEntityId}
          />
        </div>
        
        {/* 3D Visualization area */}
        <div className="flex-1 relative">
          <EntityWorld onFpsChange={setFps} />
        </div>
        
        {/* Right sidebar */}
        <div className="w-80 border-l border-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          {selectedEntityId ? (
            <EntityDetails 
              entityId={selectedEntityId} 
              onClose={() => setSelectedEntityId(null)}
            />
          ) : (
            <div className="text-sm text-gray-400">No entity selected</div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="flex items-center justify-between px-6 border-t border-gray-800 text-sm text-gray-400">
        <StatusBar />
        <div>Real-time Multi-Entity Dashboard Demo</div>
      </footer>
    </div>
  );
} 