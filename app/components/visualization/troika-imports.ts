/**
 * Type-safe troika-3d imports
 * 
 * This module provides typed exports for troika-3d modules to avoid TypeScript errors.
 * Import from this file instead of importing directly from troika-3d packages.
 */
// Import THREE for type definitions
import * as THREE from 'three';

// Import actual troika modules with type any to suppress TS errors
// @ts-expect-error - Troika ESM modules don't have type definitions
import TroikaCanvas3D from 'troika-3d/dist/troika-3d.esm.js';
// @ts-expect-error - Troika ESM modules don't have type definitions
import { Object3DFacade as TroikaObject3DFacade } from 'troika-3d/dist/troika-3d.esm.js';

// Define interfaces for Troika components
export interface ITroikaCanvas3D {
  scene: THREE.Scene;
  width: number;
  height: number;
  renderAnimationFrame: () => void;
  destroy: () => void;
}

// Re-export with more specific typing
export const Canvas3D: typeof TroikaCanvas3D = TroikaCanvas3D;

// Properly typed Object3DFacade with all the properties we need
export class Object3DFacade extends TroikaObject3DFacade {
  // Add properties directly to make TypeScript happy
  object3d: THREE.Object3D = new THREE.Object3D();
  
  constructor(parent: Object3DFacade) {
    super(parent);
  }
  
  afterUpdate(): void {
    // Implementation will be inherited from actual Troika
    super.afterUpdate();
  }
  
  dispose(): void {
    // Implementation will be inherited from actual Troika
    super.dispose();
  }
}

// Export types for convenience
export type { Object3DFacade as TroikaObject3DFacade }; 