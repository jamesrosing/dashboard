import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/state/hooks';
import { 
  selectAllEntities, 
  selectEntityById, 
  updateEntityPositions,
  selectTrajectoryEnabled,
  setTrajectoryEnabled,
  clearTrajectories
} from '@/lib/state/entitySlice';
import ClientOnly from './shared/ClientOnly';
import SplitPane from './shared/layout/SplitPane';
import Panel from './shared/layout/Panel';
import EntityTree from './shared/layout/EntityTree';
import EntityWorld from './visualization/EntityWorld';
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
      <ClientOnly>
        <div className="text-sm">
          Time: {new Date().toLocaleTimeString()}
        </div>
      </ClientOnly>
    </div>
  );
};

export default function Dashboard() {
  const entities = useAppSelector(selectAllEntities);
  const dispatch = useAppDispatch();
  const [fps, setFps] = useState(60);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const selectedEntity = useAppSelector(
    state => selectedEntityId ? selectEntityById(state, selectedEntityId) : undefined
  );
  
  // Simulate entity movement (client-side only)
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
    <div className="grid grid-rows-[60px_1fr_30px] h-screen w-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 border-b border-gray-800 relative">
        <div className="flex items-center">
          {/* Move indicator to inline with title instead of top-left corner */}
          <div className="w-4 h-4 bg-emerald-500 mr-3 rounded"></div>
          <h1 className="text-xl font-bold">Real-time Multi-Entity Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded text-sm text-green-500 border border-green-600">Connected</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Entities: {entities.length}</span>
            <span className="text-sm">|</span>
            <span className="text-sm">FPS: {fps}</span>
          </div>
        </div>
      </header>
      
      {/* Main content with split pane layout - adjust to fill more space */}
      <main className="flex-1 overflow-hidden">
        <SplitPane 
          direction="horizontal" 
          minSizes={[250, 400]}
          defaultSizes={[20, 80]} 
          id="dashboard-main-split"
        >
          {/* Left side: Entity management */}
          <div className="flex flex-col h-full">
            <Panel 
              title="Entities" 
              id="entity-tree-panel"
              className="flex-grow"
            >
              <ClientOnly fallback={
                <div className="p-4 text-sm text-gray-400">Loading entities...</div>
              }>
                <EntityTree
                  selectedEntityId={selectedEntityId}
                  onSelectEntity={setSelectedEntityId}
                />
              </ClientOnly>
            </Panel>
            
            {/* Details panel adjacent to entity list */}
            <Panel 
              title="Entity Details" 
              id="entity-details-panel"
              defaultCollapsed={!selectedEntityId}
            >
              {selectedEntityId ? (
                <EntityDetails 
                  entityId={selectedEntityId} 
                  onClose={() => setSelectedEntityId(null)}
                />
              ) : (
                <div className="text-sm text-gray-400">No entity selected</div>
              )}
            </Panel>
          </div>
          
          {/* Right side: Visualization - adjust the split for better space usage */}
          <SplitPane
            direction="vertical"
            minSizes={[400, 100]}
            defaultSizes={[95, 5]} 
            id="visualization-split"
          >
            {/* 3D Visualization area with ClientOnly wrapper */}
            <div className="flex-1 relative w-full h-full">
              <ClientOnly fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-lg text-gray-400">Loading visualization...</div>
                </div>
              }>
                <EntityWorld onFpsChange={setFps} />
              </ClientOnly>
            </div>
            
            {/* Bottom area for timeline/stats - slimmer design */}
            <Panel title="Statistics" id="statistics-panel">
              <div className="p-2">
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-gray-500 mr-1">Entities:</span>
                      {entities.length}
                    </div>
                    <div>
                      <span className="text-gray-500 mr-1">FPS:</span>
                      {fps}
                    </div>
                    <div>
                      <span className="text-gray-500 mr-1">Update:</span>
                      10Hz
                    </div>
                  </div>
                  
                  {selectedEntity && (
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-gray-500 mr-1">Selected:</span>
                        {selectedEntity.id.substring(0, 6)}
                      </div>
                      <div>
                        <span className="text-gray-500 mr-1">Type:</span>
                        {selectedEntity.type}
                      </div>
                      <div>
                        <span className="text-gray-500 mr-1">Status:</span>
                        {selectedEntity.status}
                      </div>
                      <div>
                        <span className="text-gray-500 mr-1">Battery:</span>
                        {selectedEntity.health.batteryLevel.toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Trajectory controls */}
                <ClientOnly>
                  <TrajectoryControls />
                </ClientOnly>
              </div>
            </Panel>
          </SplitPane>
        </SplitPane>
      </main>
      
      {/* Footer */}
      <footer className="flex items-center justify-between px-6 border-t border-gray-800 text-sm text-gray-400">
        <StatusBar />
        <div>Real-time Multi-Entity Dashboard Demo</div>
      </footer>
    </div>
  );
}

// TrajectoryControls component to manage trajectory visualization
const TrajectoryControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const trajectoryEnabled = useAppSelector(selectTrajectoryEnabled);
  
  return (
    <div className="flex items-center mt-3 justify-between border-t border-gray-800 pt-2">
      <div className="text-xs text-gray-400">Trajectory Visualization</div>
      <div className="flex items-center gap-2">
        <button
          className={`px-2 py-1 text-xs rounded ${
            trajectoryEnabled 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => dispatch(setTrajectoryEnabled(!trajectoryEnabled))}
        >
          {trajectoryEnabled ? 'Enabled' : 'Disabled'}
        </button>
        
        <button
          className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          onClick={() => dispatch(clearTrajectories())}
          disabled={!trajectoryEnabled}
          title={!trajectoryEnabled ? 'Enable trajectories first' : 'Clear all trajectory data'}
        >
          Clear Paths
        </button>

        <div className="text-xs text-gray-400 ml-2">
          Press <span className="px-1 bg-gray-700 rounded">T</span> to toggle all paths
        </div>
      </div>
    </div>
  );
}; 