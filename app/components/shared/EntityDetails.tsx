import React from 'react';
import { useAppSelector } from '@/lib/state/hooks';
import { selectEntityById } from '@/lib/state/entitySlice';
import { getStatusColor } from '@/lib/state/entityTypes';

interface EntityDetailsProps {
  entityId: string;
  onClose: () => void;
}

export default function EntityDetails({ entityId, onClose }: EntityDetailsProps) {
  const entity = useAppSelector(state => selectEntityById(state, entityId));

  if (!entity) {
    return <div className="text-sm text-gray-400">Entity not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {entity.type} #{entity.id.substring(0, 6)}
        </h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="px-3 py-2 rounded bg-gray-800/50 flex items-center space-x-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: getStatusColor(entity.status) }} 
        />
        <span>Status: {entity.status}</span>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium border-b border-gray-800 pb-1">Position</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="px-2 py-1 bg-gray-800/30 rounded">
            <div className="text-gray-400">X</div>
            <div>{entity.position.x.toFixed(2)}</div>
          </div>
          <div className="px-2 py-1 bg-gray-800/30 rounded">
            <div className="text-gray-400">Y</div>
            <div>{entity.position.y.toFixed(2)}</div>
          </div>
          <div className="px-2 py-1 bg-gray-800/30 rounded">
            <div className="text-gray-400">Z</div>
            <div>{entity.position.z.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium border-b border-gray-800 pb-1">Health</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Battery</span>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden mr-2">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${entity.health.batteryLevel}%`,
                    backgroundColor: entity.health.batteryLevel > 30 
                      ? '#4caf50' 
                      : entity.health.batteryLevel > 10 
                        ? '#ff9800' 
                        : '#f44336'
                  }} 
                />
              </div>
              <span className="text-xs">{entity.health.batteryLevel.toFixed(0)}%</span>
            </div>
          </div>

          {entity.health.fuelLevel !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Fuel</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${entity.health.fuelLevel}%` }} 
                  />
                </div>
                <span className="text-xs">{entity.health.fuelLevel.toFixed(0)}%</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm">Temperature</span>
            <span className="text-xs">{entity.health.temperature.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium border-b border-gray-800 pb-1">Tasks</h4>
        {entity.tasks.length === 0 ? (
          <div className="text-sm text-gray-400">No active tasks</div>
        ) : (
          <div className="space-y-2">
            {entity.tasks.map(task => (
              <div key={task.id} className="text-sm p-2 bg-gray-800/30 rounded">
                <div className="flex justify-between">
                  <span>{task.type}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700">
                    {task.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center">
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${task.progress}%` }} 
                    />
                  </div>
                  <span className="text-xs">{task.progress.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium border-b border-gray-800 pb-1">Sensors</h4>
        <div className="space-y-2">
          {Object.entries(entity.sensors).map(([key, sensor]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm capitalize">{key}</span>
              <span 
                className={`text-xs ${
                  sensor.status === 'warning' 
                    ? 'text-amber-500' 
                    : sensor.status === 'critical' 
                      ? 'text-red-500' 
                      : 'text-gray-300'
                }`}
              >
                {sensor.value.toFixed(2)} {sensor.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 