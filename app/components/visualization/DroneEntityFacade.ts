import * as THREE from '@/lib/three/module-fix';
import { EntityFacade } from './EntityFacade';
import { Entity, EntityType } from '@/lib/state/entityTypes';
import { getDroneGeometry } from '@/lib/three/geometries';

/**
 * Specialized facade for drone entity visualization
 * Extends the base EntityFacade with drone-specific functionality
 */
export class DroneEntityFacade extends EntityFacade {
  // Propeller animation properties
  private propellerGroup: THREE.Group | null = null;
  private propellers: THREE.Mesh[] = [];
  private propellerSpeed = 0.2;
  private animating = false;
  
  constructor(parent: any) {
    super(parent);
    this.entityType = EntityType.DRONE;
    
    // Create specialized material for drones
    this.material = new THREE.MeshPhongMaterial({
      color: 0x3a86ff,
      flatShading: true,
      shininess: 80
    });
  }
  
  /**
   * Override to create specialized drone geometry
   */
  protected initializeEntity() {
    // Get drone-specific geometry
    this.geometry = getDroneGeometry(this.detailLevel);
    
    // Create mesh
    if (this.geometry) {
      const mesh = new THREE.Mesh(this.geometry, this.material);
      
      // Add shadow support
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Create group for animations
      const group = new THREE.Group();
      group.add(mesh);
      
      // Add propellers if high detail level
      if (this.detailLevel === 'high') {
        this.addPropellers(group);
      }
      
      // Store reference
      this.object3d = group;
      
      // Set initial position
      if (this.entityData) {
        this.updatePosition();
        this.updateStatus();
      }
      
      // Start propeller animation
      this.startPropellerAnimation();
    }
  }
  
  /**
   * Add propellers to the drone for animation
   */
  protected addPropellers(group: THREE.Group) {
    const propellerGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 8);
    propellerGeometry.rotateX(Math.PI / 2);
    
    const propellerMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      flatShading: true
    });
    
    // Create propeller group
    this.propellerGroup = new THREE.Group();
    
    // Create four propellers
    const propPositions = [
      { x: 2, y: 0.25, z: 0 },
      { x: 0, y: 0.25, z: 2 },
      { x: -2, y: 0.25, z: 0 },
      { x: 0, y: 0.25, z: -2 }
    ];
    
    propPositions.forEach(position => {
      const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
      propeller.position.set(position.x, position.y, position.z);
      this.propellers.push(propeller);
      
      if (this.propellerGroup) {
        this.propellerGroup.add(propeller);
      }
    });
    
    // Add propeller group to main group
    if (this.propellerGroup) {
      group.add(this.propellerGroup);
    }
  }
  
  /**
   * Start propeller animation
   */
  private startPropellerAnimation() {
    if (this.animating || this.propellers.length === 0) return;
    
    this.animating = true;
    
    // Animation function
    const animate = () => {
      if (!this.animating) return;
      
      // Rotate propellers
      this.propellers.forEach((propeller, index) => {
        // Alternate rotation direction for even/odd indices
        const direction = index % 2 === 0 ? 1 : -1;
        propeller.rotation.z += this.propellerSpeed * direction;
      });
      
      // Request next frame
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
  }
  
  /**
   * Update drone status - overridden to add speed-based propeller animation
   */
  protected updateStatus() {
    super.updateStatus();
    
    // Update propeller speed based on drone velocity
    if (this.entityData && this.propellers.length > 0) {
      const velocity = this.entityData.velocity;
      const speed = Math.sqrt(
        velocity.x * velocity.x + 
        velocity.y * velocity.y + 
        velocity.z * velocity.z
      );
      
      // Scale propeller speed based on drone velocity
      this.propellerSpeed = 0.2 + speed * 0.01;
    }
  }
  
  /**
   * Stop animation on dispose
   */
  dispose() {
    this.animating = false;
    
    // Dispose propeller geometries and materials
    if (this.propellers.length > 0) {
      const propellerGeometry = this.propellers[0].geometry;
      const propellerMaterial = this.propellers[0].material as THREE.Material;
      
      propellerGeometry.dispose();
      propellerMaterial.dispose();
    }
    
    super.dispose();
  }
} 