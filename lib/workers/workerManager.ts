import { store } from '../state/store';
import { Entity, Position } from '../state/entityTypes';
import { WorkerMessage, WorkerMessageType } from './entityProcessingWorker';

/**
 * Class to manage communication with entity processing worker
 */
export class WorkerManager {
  private worker: Worker | null = null;
  private trajectoryCallbacks: Map<string, (trajectories: Record<string, Position[]>) => void> = new Map();
  private spatialQueryCallbacks: Map<string, (results: string[]) => void> = new Map();
  private callbackIdCounter = 0;
  private isWorkerReady = false;
  
  /**
   * Initialize worker
   */
  initialize(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      // Create worker
      this.worker = new Worker(new URL('./entityProcessingWorker.ts', import.meta.url));
      
      // Setup message handler
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      
      // Initialize worker with configuration
      this.worker.postMessage({
        type: WorkerMessageType.INIT,
        payload: {
          cellSize: 100
        }
      });
      
      this.isWorkerReady = true;
      
      console.log('Entity processing worker initialized');
    } catch (error) {
      console.error('Error initializing worker:', error);
      this.isWorkerReady = false;
    }
  }
  
  /**
   * Handle messages from worker
   */
  private handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
    const { type, payload } = event.data;
    
    switch (type) {
      case WorkerMessageType.ENTITIES_PROCESSED:
        // Entities have been processed by the worker
        console.debug(`Processed ${payload.count} entities in worker`);
        break;
        
      case WorkerMessageType.TRAJECTORIES_CALCULATED:
        // Trajectories have been calculated
        const { trajectories, callbackId } = payload;
        const trajectoryCallback = this.trajectoryCallbacks.get(callbackId);
        
        if (trajectoryCallback) {
          trajectoryCallback(trajectories);
          this.trajectoryCallbacks.delete(callbackId);
        }
        break;
        
      case WorkerMessageType.SPATIAL_QUERY_RESULT:
        // Spatial query results
        const { results, callbackId: queryCallbackId } = payload;
        const spatialCallback = this.spatialQueryCallbacks.get(queryCallbackId);
        
        if (spatialCallback) {
          spatialCallback(results);
          this.spatialQueryCallbacks.delete(queryCallbackId);
        }
        break;
        
      case WorkerMessageType.ERROR:
        // Error from worker
        console.error('Worker error:', payload.error);
        store.dispatch({
          type: 'ui/addNotification',
          payload: {
            id: `worker-error-${Date.now()}`,
            type: 'error',
            message: `Worker error: ${payload.error}`
          }
        });
        break;
        
      default:
        console.warn('Unknown message from worker:', type);
    }
  }
  
  /**
   * Process entities in worker
   */
  processEntities(entities: Entity[]): void {
    if (!this.isWorkerReady || !this.worker) {
      console.warn('Worker not ready');
      return;
    }
    
    // Send entities to worker for processing
    this.worker.postMessage({
      type: WorkerMessageType.PROCESS_ENTITIES,
      payload: {
        entities
      }
    });
  }
  
  /**
   * Calculate trajectories for entities
   */
  calculateTrajectories(
    entityIds: string[],
    timeSteps = 20,
    timeStep = 0.1,
    callback: (trajectories: Record<string, Position[]>) => void
  ): void {
    if (!this.isWorkerReady || !this.worker) {
      console.warn('Worker not ready');
      callback({});
      return;
    }
    
    // Generate unique callback ID
    const callbackId = `trajectory_${++this.callbackIdCounter}`;
    
    // Store callback
    this.trajectoryCallbacks.set(callbackId, callback);
    
    // Send request to worker
    this.worker.postMessage({
      type: WorkerMessageType.CALCULATE_TRAJECTORIES,
      payload: {
        entityIds,
        timeSteps,
        timeStep,
        callbackId
      }
    });
  }
  
  /**
   * Perform spatial query
   */
  spatialQuery(
    position: Position,
    radius: number,
    callback: (results: string[]) => void
  ): void {
    if (!this.isWorkerReady || !this.worker) {
      console.warn('Worker not ready');
      callback([]);
      return;
    }
    
    // Generate unique callback ID
    const callbackId = `spatial_${++this.callbackIdCounter}`;
    
    // Store callback
    this.spatialQueryCallbacks.set(callbackId, callback);
    
    // Send request to worker
    this.worker.postMessage({
      type: WorkerMessageType.SPATIAL_QUERY,
      payload: {
        position,
        radius,
        callbackId
      }
    });
  }
  
  /**
   * Terminate worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isWorkerReady = false;
      console.log('Entity processing worker terminated');
    }
  }
}

// Create singleton instance
export const workerManager = new WorkerManager();

export default workerManager; 