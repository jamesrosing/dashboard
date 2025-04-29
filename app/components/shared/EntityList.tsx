import React from 'react';
import { Entity, EntityStatus, getStatusColor } from '@/lib/state/entityTypes';

interface EntityListProps {
  entities: Entity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
}

export default function EntityList({ entities, selectedEntityId, onSelectEntity }: EntityListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {entities.length === 0 ? (
        <div className="text-sm text-gray-400">No entities found</div>
      ) : (
        <div className="space-y-1">
          {entities.map(entity => (
            <div
              key={entity.id}
              className={`p-2 rounded cursor-pointer transition-colors ${
                selectedEntityId === entity.id
                  ? 'bg-blue-900/50 border border-blue-500/50'
                  : 'hover:bg-gray-800 border border-transparent'
              }`}
              onClick={() => onSelectEntity(entity.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getStatusColor(entity.status) }} 
                  />
                  <span className="font-medium truncate">{entity.type} {entity.id.substring(0, 6)}</span>
                </div>
                <div className="text-xs opacity-60">{formatDistance(entity.position)}</div>
              </div>
              <div className="text-xs opacity-60 mt-1 flex justify-between">
                <div>Status: {formatStatus(entity.status)}</div>
                <div>Batt: {entity.health.batteryLevel.toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatDistance(position: { x: number, y: number, z: number }): string {
  const distance = Math.sqrt(
    position.x * position.x + 
    position.y * position.y + 
    position.z * position.z
  );
  return `${distance.toFixed(1)}m`;
}

function formatStatus(status: EntityStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
} 