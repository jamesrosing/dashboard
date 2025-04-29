import { Object3DFacade } from './troika-imports';
import * as THREE from 'three';
import { Entity, EntityType, Position, positionToVector3 } from '../../../lib/state/entityTypes';
import { getGeometryForEntityType } from '../../../lib/three/geometries';
import { getStatusColor } from '../../../lib/state/entityTypes';

/**
 * Base EntityFacade for visualizing entities in the 3D scene
 * Extends Troika's Object3DFacade for automatic optimization
 */
export class EntityFacade extends Object3DFacade {
  // Entity data properties
  entityData: Entity | null = null;
  entityType: EntityType = EntityType.DRONE;
  
  // Visual properties
  detailLevel: 'high' | 'medium' | 'low' = 'medium';
  geometry: THREE.BufferGeometry | null = null;
  material: THREE.MeshPhongMaterial;
  
  // Internal properties for optimization
  protected _prevPosition: Position | null = null;
  protected _prevStatus: string | null = null;
  
  constructor(parent: Object3DFacade) {
    super(parent);
    
    // Create default material
    this.material = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true
    });
  }
  
  /**
   * Initialize facade with entity data
   */
  afterUpdate() {
    // Initialize or update entity
    if (this.entityData && (!this.object3d || this.entityType !== this.entityData.type)) {
      this.entityType = this.entityData.type;
      this.initializeEntity();
    }
    
    // Update entity state if necessary
    if (this.entityData) {
      this.updateEntityState();
    }
    
    super.afterUpdate();
  }
  
  /**
   * Initialize Three.js object for entity
   */
  protected initializeEntity() {
    // Get geometry based on entity type
    this.geometry = getGeometryForEntityType(this.entityType, this.detailLevel);
    
    // Create mesh with non-null geometry and material
    if (this.geometry) {
      const mesh = new THREE.Mesh(this.geometry, this.material);
      
      // Add shadow support
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Store reference
      this.object3d = mesh;
      
      // Set initial position
      if (this.entityData) {
        this.updatePosition();
        this.updateStatus();
      }
    }
  }
  
  /**
   * Update entity state based on current data
   */
  protected updateEntityState() {
    if (!this.entityData || !this.object3d) return;
    
    // Update position if changed
    if (!this._prevPosition || 
        this._prevPosition.x !== this.entityData.position.x ||
        this._prevPosition.y !== this.entityData.position.y ||
        this._prevPosition.z !== this.entityData.position.z) {
      this.updatePosition();
    }
    
    // Update status if changed
    if (!this._prevStatus || this._prevStatus !== this.entityData.status) {
      this.updateStatus();
    }
  }
  
  /**
   * Update entity position
   */
  protected updatePosition() {
    if (!this.entityData || !this.object3d) return;
    
    // Convert position to Vector3
    const position = positionToVector3(this.entityData.position);
    
    // Update object position
    this.object3d.position.copy(position);
    
    // Apply rotation if available
    if (this.entityData.rotation) {
      this.object3d.rotation.set(
        this.entityData.rotation.x,
        this.entityData.rotation.y,
        this.entityData.rotation.z
      );
    }
    
    // Store previous position for change detection
    this._prevPosition = { ...this.entityData.position };
  }
  
  /**
   * Update entity visual status
   */
  protected updateStatus() {
    if (!this.entityData) return;
    
    // Get color for entity status
    const statusColor = getStatusColor(this.entityData.status);
    
    // Update material color
    this.material.color.set(statusColor);
    
    // Store previous status for change detection
    this._prevStatus = this.entityData.status;
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Clean up Three.js objects to avoid memory leaks
    if (this.geometry) {
      this.geometry.dispose();
    }
    
    if (this.material) {
      this.material.dispose();
    }
    
    super.dispose();
  }
} 