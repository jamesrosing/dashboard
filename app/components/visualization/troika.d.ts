import * as THREE from 'three';

/**
 * Type declarations for Troika libraries and Three.js constants
 * This ensures proper TypeScript compatibility with our Three.js compatibility layer
 */

// Declare the missing constants in the THREE namespace
declare module 'three' {
  export const LinearEncoding: number;
  export const sRGBEncoding: number;
  export const NoToneMapping: number;
  
  export class GridHelper extends THREE.Object3D {
    constructor(size?: number, divisions?: number, color1?: THREE.ColorRepresentation, color2?: THREE.ColorRepresentation);
    /**
     * @default 'GridHelper'
     */
    type: string;
  }
  
  export class CylinderGeometry extends THREE.BufferGeometry {
    /**
     * @param radiusTop — Radius of the cylinder at the top.
     * @param radiusBottom — Radius of the cylinder at the bottom.
     * @param height — Height of the cylinder.
     * @param radialSegments — Number of segmented faces around the circumference of the cylinder.
     * @param heightSegments — Number of rows of faces along the height of the cylinder.
     * @param openEnded — A Boolean indicating whether the ends of the cylinder are open or capped.
     * @param thetaStart — Start angle for first segment.
     * @param thetaLength — The central angle, often called theta, of the circular sector.
     */
    constructor(
      radiusTop?: number,
      radiusBottom?: number,
      height?: number,
      radialSegments?: number,
      heightSegments?: number,
      openEnded?: boolean,
      thetaStart?: number,
      thetaLength?: number
    );

    /**
     * @default 'CylinderGeometry'
     */
    type: string;

    parameters: {
      radiusTop: number;
      radiusBottom: number;
      height: number;
      radialSegments: number;
      heightSegments: number;
      openEnded: boolean;
      thetaStart: number;
      thetaLength: number;
    };
  }
}

// Declare both main module and direct imports to fix TypeScript errors
declare module 'troika-3d' {
  export class Canvas3D {
    constructor(domElement: HTMLElement);
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    renderOptions: any;
    getChildByKey(key: string): any;
    render(): void;
    dispose(): void;
  }
  
  export class Object3DFacade {
    constructor(parent: any);
    object3d: THREE.Object3D;
    afterUpdate(): void;
    dispose(): void;
    [key: string]: any;
  }
  
  export interface WorldBaseFacade {
    scene: THREE.Scene;
    camera: THREE.Camera;
    width: number;
    height: number;
    renderer: THREE.WebGLRenderer;
  }

  export class World extends Object3DFacade {
    children: Object3DFacadeConfig[];
  }
  
  export interface Object3DFacadeConfig {
    key?: string;
    facade?: any;
    [key: string]: any;
  }
  
  export class Facade<P = any, C = any> {
    constructor(parent: any);
    afterUpdate(): void;
  }

  export interface ParentFacade {}
  export interface ListFacade {}
}

// Also declare the direct ESM import path
declare module 'troika-3d/dist/troika-3d.esm.js' {
  export * from 'troika-3d';
  const Canvas3D: typeof import('troika-3d').Canvas3D;
  export default Canvas3D;
}

declare module 'troika-3d-text' {
  import { Object3DFacade } from 'troika-3d';

  export class Text3DFacade extends Object3DFacade {
    text: string;
    fontSize: number;
    color: string | number;
    anchorX: number | string;
    anchorY: number | string;
    textAlign: string;
    font: string;
    material: any;
    [key: string]: any;
  }
}

declare module 'troika-three-utils' {
  export function createDerivedMaterial(baseMaterial: any, options: any): any;
}

declare module 'troika-three-text' {
  export class Text extends THREE.Mesh {
    text: string;
    anchorX: number | string;
    anchorY: number | string;
    font: string;
    fontSize: number;
    color: THREE.ColorRepresentation;
    sync(): Promise<void>;
  }
} 