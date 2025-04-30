/**
 * Three.js initialization module
 * 
 * This module must be imported BEFORE any other Three.js imports
 * to ensure compatibility constants are properly defined.
 */

// Create MathUtils helper for UUID generation and other functions
const MathUtils = {
  generateUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  clamp: function(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  },
  lerp: function(x: number, y: number, t: number) {
    return (1 - t) * x + t * y;
  },
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI
};

// Immediately define critical constants to prevent "Cannot access before initialization" errors
if (typeof window !== 'undefined') {
  // Define THREE global if it doesn't exist
  if (!(window as any).THREE) {
    (window as any).THREE = {};
  }
  
  // First define EventDispatcher for inheritance
  if (!(window as any).THREE.EventDispatcher) {
    (window as any).THREE.EventDispatcher = function() {};
    (window as any).THREE.EventDispatcher.prototype = {
      constructor: (window as any).THREE.EventDispatcher,
      addEventListener: function() { return this; },
      hasEventListener: function() { return false; },
      removeEventListener: function() { return this; },
      dispatchEvent: function() { return this; }
    };
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
    
    // Add MathUtils
    MathUtils: MathUtils
  });

  // Define critical Object3D class
  if (!(window as any).THREE.Object3D) {
    // CRITICAL: Object3D stub implementation
    (window as any).THREE.Object3D = function() {
      this.isObject3D = true;
      this.id = Math.floor(Math.random() * 100000);
      this.uuid = MathUtils.generateUUID();
      this.name = '';
      this.type = 'Object3D';
      this.parent = null;
      this.children = [];
      this.up = { x: 0, y: 1, z: 0, isVector3: true };
      this.position = { x: 0, y: 0, z: 0, isVector3: true };
      this.rotation = { x: 0, y: 0, z: 0, order: 'XYZ', isEuler: true };
      this.quaternion = { x: 0, y: 0, z: 0, w: 1, isQuaternion: true };
      this.scale = { x: 1, y: 1, z: 1, isVector3: true };
      this.modelViewMatrix = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], isMatrix4: true };
      this.normalMatrix = { elements: [1,0,0, 0,1,0, 0,0,1], isMatrix3: true };
      this.matrix = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], isMatrix4: true };
      this.matrixWorld = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], isMatrix4: true };
      this.matrixAutoUpdate = true;
      this.matrixWorldNeedsUpdate = false;
      this.layers = { mask: 1 };
      this.visible = true;
      this.castShadow = false;
      this.receiveShadow = false;
      this.frustumCulled = true;
      this.renderOrder = 0;
      this.userData = {};
      this.listeners = {};
      
      // Apply EventDispatcher properties - this is critical
      (window as any).THREE.EventDispatcher.call(this);
      
      // Basic methods
      this.add = function(...objects: any[]) { 
        if (objects.length > 1) {
          for (let i = 0; i < objects.length; i++) {
            this.add(objects[i]);
          }
          return this;
        }
        
        const object = objects[0];
        if (object === this) return this;
        
        if (object && object.isObject3D) {
          if (object.parent !== null) {
            object.parent.remove(object);
          }
          
          object.parent = this;
          this.children.push(object);
        }
        
        return this;
      };
      
      this.remove = function(...objects: any[]) {
        if (objects.length > 1) {
          for (let i = 0; i < objects.length; i++) {
            this.remove(objects[i]);
          }
          return this;
        }
        
        const object = objects[0];
        const index = this.children.indexOf(object);
        
        if (index !== -1) {
          object.parent = null;
          this.children.splice(index, 1);
        }
        
        return this;
      };
      
      this.clear = function() {
        for (let i = 0; i < this.children.length; i++) {
          const object = this.children[i];
          object.parent = null;
        }
        
        this.children.length = 0;
        
        return this;
      };
      
      this.updateMatrix = function() {
        // Stub implementation
        return this;
      };
      
      this.updateMatrixWorld = function() {
        // Stub implementation
        return this;
      };
      
      this.updateWorldMatrix = function() {
        // Stub implementation
        return this;
      };
      
      this.applyMatrix4 = function() {
        // Stub implementation
        return this;
      };
      
      this.setRotationFromEuler = function() {
        // Stub implementation
        return this;
      };
      
      this.traverse = function(callback: (obj: any) => void) {
        callback(this);
        
        const children = this.children;
        
        for (let i = 0, l = children.length; i < l; i++) {
          children[i].traverse(callback);
        }
      };
      
      this.getObjectById = function(id: number) {
        if (this.id === id) return this;
        
        const children = this.children;
        
        for (let i = 0, l = children.length; i < l; i++) {
          const object = children[i].getObjectById(id);
          
          if (object !== undefined) {
            return object;
          }
        }
        
        return undefined;
      };
      
      this.getObjectByName = function(name: string) {
        if (this.name === name) return this;
        
        const children = this.children;
        
        for (let i = 0, l = children.length; i < l; i++) {
          const object = children[i].getObjectByName(name);
          
          if (object !== undefined) {
            return object;
          }
        }
        
        return undefined;
      };
      
      this.getWorldPosition = function(target: any) {
        if (!target) {
          target = { x: 0, y: 0, z: 0, isVector3: true };
        }
        
        // For the stub, we just copy the object's position
        target.x = this.position.x;
        target.y = this.position.y;
        target.z = this.position.z;
        
        return target;
      };
      
      this.lookAt = function() {
        // Stub implementation
        return this;
      };
    };
    
    // Inherit from EventDispatcher
    (window as any).THREE.Object3D.prototype = Object.create((window as any).THREE.EventDispatcher.prototype);
    (window as any).THREE.Object3D.prototype.constructor = (window as any).THREE.Object3D;
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
      
      this.subVectors = function(a: any, b: any) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
      };
      
      this.length = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      };
      
      this.equals = function(v: any) {
        return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
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
      this.multiplyScalar = function() { return this; };
      
      this.makeRotationFromEuler = function() { return this; };
      this.makeRotationFromQuaternion = function() { return this; };
      this.makeScale = function() { return this; };
      this.makeTranslation = function() { return this; };
    };
  }
  
  // Group class stub
  if (!(window as any).THREE.Group) {
    (window as any).THREE.Group = function() {
      (window as any).THREE.Object3D.call(this);
      this.type = 'Group';
      this.isGroup = true;
    };
    
    // Inherit from Object3D
    (window as any).THREE.Group.prototype = Object.create((window as any).THREE.Object3D.prototype);
    (window as any).THREE.Group.prototype.constructor = (window as any).THREE.Group;
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

  // Scene class stub - extends Object3D
  if (!(window as any).THREE.Scene) {
    (window as any).THREE.Scene = function() {
      (window as any).THREE.Object3D.call(this);
      this.type = 'Scene';
      this.isScene = true;
      this.background = null;
      this.environment = null;
      this.fog = null;
    };
    
    // Inherit from Object3D
    (window as any).THREE.Scene.prototype = Object.create((window as any).THREE.Object3D.prototype);
    (window as any).THREE.Scene.prototype.constructor = (window as any).THREE.Scene;
  }

  console.log('Critical Three.js constants and objects pre-initialized');
}

export const initializeThreeConstants = true; 