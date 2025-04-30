/**
 * Three.js initialization module
 * 
 * This module must be imported BEFORE any other Three.js imports
 * to ensure compatibility constants are properly defined.
 */

// Immediately define critical constants to prevent "Cannot access before initialization" errors
if (typeof window !== 'undefined') {
  // Define THREE global if it doesn't exist
  if (!(window as any).THREE) {
    (window as any).THREE = {};
  }
  
  // Directly assign primitive values to THREE globals
  // This ensures they're available before any module tries to access them
  Object.assign((window as any).THREE, {
    // Type constants
    UnsignedByteType: 1009,
    ByteType: 1010,
    ShortType: 1011,
    UnsignedShortType: 1012,
    IntType: 1013,
    UnsignedIntType: 1014,
    FloatType: 1015,
    HalfFloatType: 1016,
    
    // Format constants
    RGBAFormat: 1023,
    RGIntegerFormat: 1033,
    RedFormat: 1028,
    RGFormat: 1030,
    RedIntegerFormat: 1031,
    RGBAIntegerFormat: 1033,
    
    // Encoding constants
    LinearEncoding: 3000,
    sRGBEncoding: 3001,
    
    // Filter constants
    LinearFilter: 1006,
    NearestFilter: 1003,
    ClampToEdgeWrapping: 1001,
    UVMapping: 300,
    LinearMipMapLinearFilter: 1008,
    
    // Other constants
    NoToneMapping: 0,
    LinearSRGBColorSpace: 'Linear',
    SRGBColorSpace: 'srgb',
    NoBlending: 0,
    FrontSide: 0,
    BackSide: 1,
    DoubleSide: 2,
    
    // Math constants
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
    
    // Event types
    ObjectAddedEvent: 'added',
    ObjectRemovedEvent: 'removed',
  });

  // Define critical Object3D class
  if (!(window as any).THREE.Object3D) {
    (window as any).THREE.Object3D = function() {
      this.isObject3D = true;
      this.id = Math.floor(Math.random() * 100000);
      this.uuid = '';
      this.name = '';
      this.type = 'Object3D';
      this.parent = null;
      this.children = [];
      this.up = { x: 0, y: 1, z: 0 };
      this.position = { x: 0, y: 0, z: 0 };
      this.rotation = { x: 0, y: 0, z: 0, order: 'XYZ' };
      this.quaternion = { x: 0, y: 0, z: 0, w: 1 };
      this.scale = { x: 1, y: 1, z: 1 };
      this.modelViewMatrix = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1] };
      this.normalMatrix = { elements: [1,0,0, 0,1,0, 0,0,1] };
      this.matrix = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1] };
      this.matrixWorld = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1] };
      this.matrixAutoUpdate = true;
      this.matrixWorldNeedsUpdate = false;
      this.layers = { mask: 1 };
      this.visible = true;
      this.userData = {};
        
      // Basic methods
      this.add = function() { return this; };
      this.remove = function() { return this; };
      this.updateMatrix = function() {};
      this.updateMatrixWorld = function() {};
      this.applyMatrix4 = function() {};
      this.setRotationFromEuler = function() {};
      this.traverse = function() {};
    };
  }
  
  // Vector3 class stub
  if (!(window as any).THREE.Vector3) {
    (window as any).THREE.Vector3 = function(x: number, y: number, z: number) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.isVector3 = true;
        
      // Add basic methods
      this.set = function(x: number, y: number, z: number) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        return this;
      };
        
      this.copy = function(v: any) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      };
        
      this.add = function(v: any) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
      };
    };
  }
  
  // Euler class stub
  if (!(window as any).THREE.Euler) {
    (window as any).THREE.Euler = function(x: number, y: number, z: number, order: string) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.order = order || 'XYZ';
      this.isEuler = true;
        
      // Add basic methods
      this.set = function(x: number, y: number, z: number, order?: string) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        if (order) this.order = order;
        return this;
      };
        
      this.copy = function(euler: any) {
        this.x = euler.x;
        this.y = euler.y;
        this.z = euler.z;
        this.order = euler.order;
        return this;
      };
    };
  }
  
  // Matrix4 class stub
  if (!(window as any).THREE.Matrix4) {
    (window as any).THREE.Matrix4 = function() {
      this.elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      this.isMatrix4 = true;
        
      // Add basic methods
      this.set = function() { return this; };
      this.identity = function() { 
        this.elements = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
        return this; 
      };
      this.copy = function() { return this; };
      this.multiplyMatrices = function() { return this; };
    };
  }
  
  // Group class stub - extends Object3D
  if (!(window as any).THREE.Group) {
    (window as any).THREE.Group = function() {
      (window as any).THREE.Object3D.call(this);
      this.type = 'Group';
      this.isGroup = true;
    };
  }
  
  // Frustum class stub
  if (!(window as any).THREE.Frustum) {
    (window as any).THREE.Frustum = function() {
      this.planes = [
        {normal: {x:1,y:0,z:0}, constant: 0},
        {normal: {x:-1,y:0,z:0}, constant: 0},
        {normal: {x:0,y:1,z:0}, constant: 0},
        {normal: {x:0,y:-1,z:0}, constant: 0},
        {normal: {x:0,y:0,z:1}, constant: 0},
        {normal: {x:0,y:0,z:-1}, constant: 0}
      ];
        
      this.setFromProjectionMatrix = function() { return this; };
      this.intersectsSphere = function() { return true; };
    };
  }
  
  // Sphere class stub
  if (!(window as any).THREE.Sphere) {
    (window as any).THREE.Sphere = function(center: any, radius: number) {
      this.center = center || { x: 0, y: 0, z: 0 };
      this.radius = radius || 1;
        
      this.set = function(center: any, radius: number) { 
        this.center = center;
        this.radius = radius;
        return this; 
      };
    };
  }

  console.log('Critical Three.js constants and objects pre-initialized');
}

export const initializeThreeConstants = true; 