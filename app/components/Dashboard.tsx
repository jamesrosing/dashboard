import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/state/hooks';
import { 
  selectAllEntities, 
  selectEntityById, 
  updateEntityPosition,
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
import StatusBar from './shared/StatusBar';
import PerformanceMetrics from './shared/PerformanceMetrics';
import ThreeDiagnostics from './ThreeDiagnostics';

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
      // Update each entity one by one
      entities.slice(0, 15).forEach(entity => {
        dispatch(updateEntityPosition({
          id: entity.id,
          position: {
            x: entity.position.x + (Math.random() - 0.5) * 0.5,
            y: entity.position.y + (Math.random() - 0.5) * 0.2,
            z: entity.position.z + (Math.random() - 0.5) * 0.5,
          }
        }));
      });
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
              
              {/* Floating Performance Metrics */}
              <div className="absolute top-4 right-4 z-10">
                <ClientOnly>
                  <PerformanceMetrics fps={fps} />
                </ClientOnly>
              </div>
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
        <StatusBar fps={fps} />
        <div>Real-time Multi-Entity Dashboard Demo</div>
      </footer>
      
      {/* Three.js Diagnostics Tool */}
      <ClientOnly>
        <ThreeDiagnostics />
      </ClientOnly>
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
      </div>
    </div>
  );
}; 