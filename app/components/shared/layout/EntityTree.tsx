import React, { useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/state/hooks';
import { selectAllEntities } from '@/lib/state/entitySlice';
import { Entity, EntityType, EntityStatus, getStatusColor } from '@/lib/state/entityTypes';

interface EntityTreeProps {
  onSelectEntity: (id: string) => void;
  selectedEntityId: string | null;
  className?: string;
  showStatusFilter?: boolean;
}

/**
 * EntityTree component that organizes entities into a hierarchical tree view by type
 * 
 * Displays entities organized by entity type with collapsible groups and status indicators
 * Supports filtering, search, and selection of entities
 */
export function EntityTree({
  onSelectEntity,
  selectedEntityId,
  className = '',
  showStatusFilter = true,
}: EntityTreeProps) {
  const entities = useAppSelector(selectAllEntities);
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({
    [EntityType.DRONE]: true,
    [EntityType.VEHICLE]: true,
    [EntityType.STATIONARY]: true,
  });
  const [statusFilter, setStatusFilter] = useState<EntityStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Group entities by type
  const entityGroups = useMemo(() => {
    // Apply filters
    const filteredEntities = entities.filter(entity => {
      const matchesStatus = !statusFilter || entity.status === statusFilter;
      const matchesSearch = !searchTerm || 
        entity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
    
    // Group by type
    return filteredEntities.reduce((groups, entity) => {
      if (!groups[entity.type]) {
        groups[entity.type] = [];
      }
      groups[entity.type].push(entity);
      return groups;
    }, {} as Record<string, Entity[]>);
  }, [entities, statusFilter, searchTerm]);
  
  // Toggle type group expansion
  const toggleTypeExpanded = (type: string) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };
  
  // Count entities in each status category
  const statusCounts = useMemo(() => {
    return entities.reduce((counts, entity) => {
      counts[entity.status] = (counts[entity.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }, [entities]);

  return (
    <div className={`entity-tree ${className}`}>
      {/* Search and filter controls */}
      <div className="entity-tree-controls" style={{ marginBottom: '8px' }}>
        <input
          type="text"
          placeholder="Search entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            background: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px',
            marginBottom: '8px',
          }}
        />
        
        {showStatusFilter && (
          <div className="entity-tree-status-filter" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter(null)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                background: statusFilter === null ? '#555' : '#2a2a2a',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            
            {Object.values(EntityStatus).map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  background: statusFilter === status ? '#555' : '#2a2a2a',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(status),
                    display: 'inline-block',
                  }}
                />
                {status} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Entity tree */}
      <div className="entity-tree-content" style={{ overflowY: 'auto' }}>
        {Object.entries(entityGroups).map(([type, groupEntities]) => (
          <div key={type} className="entity-type-group">
            {/* Type header */}
            <div 
              className="entity-type-header"
              onClick={() => toggleTypeExpanded(type)}
              style={{
                padding: '6px 8px',
                background: '#2a2a2a',
                cursor: 'pointer',
                borderRadius: '4px',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {type} ({groupEntities.length})
                </span>
              </div>
              <span>{expandedTypes[type] ? '▼' : '▶'}</span>
            </div>
            
            {/* Entity list */}
            {expandedTypes[type] && (
              <div 
                className="entity-list"
                style={{ 
                  padding: '0 0 0 12px',
                  marginBottom: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {groupEntities.map(entity => (
                  <div
                    key={entity.id}
                    className={`entity-item ${selectedEntityId === entity.id ? 'selected' : ''}`}
                    onClick={() => onSelectEntity(entity.id)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: selectedEntityId === entity.id ? '#3a3a3a' : 'transparent',
                      border: selectedEntityId === entity.id ? '1px solid #555' : '1px solid transparent',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(entity.status),
                          }}
                        />
                        <span className="entity-id" style={{ fontSize: '13px' }}>
                          {entity.id.substring(0, 6)}
                        </span>
                      </div>
                      <span className="entity-distance" style={{ fontSize: '12px', opacity: 0.7 }}>
                        {formatDistance(entity)}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '12px', 
                      opacity: 0.7,
                      marginTop: '2px',
                    }}>
                      <span>
                        {entity.status}
                      </span>
                      <span>
                        Bat: {entity.health.batteryLevel.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to format distance
function formatDistance(entity: Entity): string {
  const distance = Math.sqrt(
    entity.position.x * entity.position.x +
    entity.position.y * entity.position.y +
    entity.position.z * entity.position.z
  );
  return `${distance.toFixed(1)}m`;
}

export default EntityTree; 