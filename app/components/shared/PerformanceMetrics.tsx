import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../../lib/state/hooks';
import { selectAllEntities } from '../../../lib/state/entitySlice';
import ClientOnly from './ClientOnly';

interface PerformanceMetricsProps {
  fps: number;
  className?: string;
  expanded?: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  fps, 
  className = '',
  expanded = false
}) => {
  const entities = useAppSelector(selectAllEntities);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [expanded_, setExpanded] = useState(expanded);
  
  // Calculate entity stats
  const entityStats = useMemo(() => {
    const stats = {
      total: entities.length,
      drone: 0,
      vehicle: 0,
      stationary: 0,
      other: 0,
      moving: 0,
      stationary_count: 0,
    };
    
    entities.forEach(entity => {
      if (entity.type === 'drone') stats.drone++;
      else if (entity.type === 'vehicle') stats.vehicle++;
      else if (entity.type === 'stationary') stats.stationary++;
      else stats.other++;
      
      // Count moving entities (entities with non-zero velocity)
      if (entity.velocity && (
        entity.velocity.x !== 0 || 
        entity.velocity.y !== 0 || 
        entity.velocity.z !== 0
      )) {
        stats.moving++;
      } else {
        stats.stationary_count++;
      }
    });
    
    return stats;
  }, [entities]);
  
  // Get memory usage if available (Chrome only)
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        'performance' in window && 
        'memory' in (window.performance as any)) {
      
      const updateMemory = () => {
        const mem = (window.performance as any).memory;
        if (mem && mem.usedJSHeapSize) {
          // Convert bytes to MB
          setMemoryUsage(Math.round(mem.usedJSHeapSize / (1024 * 1024)));
        }
      };
      
      updateMemory();
      const interval = setInterval(updateMemory, 2000);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  // FPS color based on performance
  const fpsColor = useMemo(() => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  }, [fps]);
  
  return (
    <ClientOnly>
      <div className={`bg-gray-900 rounded-md p-2 text-sm ${className}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium">Performance Metrics</div>
          <button 
            onClick={() => setExpanded(!expanded_)}
            className="text-gray-400 hover:text-white"
          >
            {expanded_ ? '▼' : '►'}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            FPS: <span className={fpsColor}>{fps}</span>
          </div>
          <div>
            Entities: {entityStats.total}
          </div>
          {memoryUsage !== null && (
            <div>
              Memory: {memoryUsage} MB
            </div>
          )}
        </div>
        
        {expanded_ && (
          <div className="mt-2 pt-2 border-t border-gray-700 grid grid-cols-2 gap-2">
            <div>Drones: {entityStats.drone}</div>
            <div>Vehicles: {entityStats.vehicle}</div>
            <div>Stationary: {entityStats.stationary}</div>
            <div>Other: {entityStats.other}</div>
            <div>Moving: {entityStats.moving}</div>
            <div>Static: {entityStats.stationary_count}</div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
};

export default PerformanceMetrics; 