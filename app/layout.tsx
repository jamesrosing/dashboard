import './globals.css';
import Script from 'next/script';
import ThreeVerification from './components/ThreeVerification';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Special script to ensure THREE constants are defined before any module loads */}
        <Script id="three-init" strategy="beforeInteractive">
          {`
            // Pre-define critical THREE constants to avoid initialization errors
            if (typeof window !== 'undefined') {
              window.THREE = window.THREE || {};
              
              // Define the 'D' variable that's causing the initialization error
              window.THREE.D = {};
              
              // Define the 'I' variable that's also causing initialization errors
              window.THREE.I = {};
              
              // Basic constants
              const constants = {
                UnsignedByteType: 1009,
                ByteType: 1010,
                ShortType: 1011,
                UnsignedShortType: 1012,
                IntType: 1013,
                UnsignedIntType: 1014,
                FloatType: 1015,
                HalfFloatType: 1016,
                RGBAFormat: 1023,
                RGIntegerFormat: 1033,
                RedFormat: 1028,
                RGFormat: 1030,
                RedIntegerFormat: 1031,
                RGBAIntegerFormat: 1033,
                LinearEncoding: 3000,
                sRGBEncoding: 3001,
                LinearFilter: 1006,
                NearestFilter: 1003,
                ClampToEdgeWrapping: 1001,
                UVMapping: 300,
                LinearMipMapLinearFilter: 1008,
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
              };

              // Create base helper utility to prevent circular references in production build
              constants.MathUtils = {
                generateUUID: function() {
                  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                  });
                },
                clamp: function(value, min, max) {
                  return Math.max(min, Math.min(max, value));
                },
                lerp: function(x, y, t) {
                  return (1 - t) * x + t * y;
                },
                DEG2RAD: Math.PI / 180,
                RAD2DEG: 180 / Math.PI
              };
              
              // EventDispatcher stub implementation - critical for Object3D
              constants.EventDispatcher = function() {};
              constants.EventDispatcher.prototype = {
                constructor: constants.EventDispatcher,
                addEventListener: function() { return this; },
                hasEventListener: function() { return false; },
                removeEventListener: function() { return this; },
                dispatchEvent: function() { return this; }
              };
              
              // CRITICAL: Object3D stub implementation
              // This is essential as it's being accessed before initialization
              constants.Object3D = function() {
                this.isObject3D = true;
                this.id = Math.floor(Math.random() * 100000);
                this.uuid = constants.MathUtils.generateUUID();
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
                
                // Apply EventDispatcher properties
                constants.EventDispatcher.call(this);
                
                // Basic methods
                this.add = function(object) { 
                  if (arguments.length > 1) {
                    for (let i = 0; i < arguments.length; i++) {
                      this.add(arguments[i]);
                    }
                    return this;
                  }
                  
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
                
                this.remove = function(object) {
                  if (arguments.length > 1) {
                    for (let i = 0; i < arguments.length; i++) {
                      this.remove(arguments[i]);
                    }
                    return this;
                  }
                  
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
                
                this.updateMatrixWorld = function(force) {
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
                
                this.traverse = function(callback) {
                  callback(this);
                  
                  const children = this.children;
                  
                  for (let i = 0, l = children.length; i < l; i++) {
                    children[i].traverse(callback);
                  }
                };
                
                this.getObjectById = function(id) {
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
                
                this.getObjectByName = function(name) {
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
                
                this.getObjectByProperty = function(name, value) {
                  if (this[name] === value) return this;
                  
                  const children = this.children;
                  
                  for (let i = 0, l = children.length; i < l; i++) {
                    const object = children[i].getObjectByProperty(name, value);
                    
                    if (object !== undefined) {
                      return object;
                    }
                  }
                  
                  return undefined;
                };
                
                this.getWorldPosition = function(target) {
                  if (!target) {
                    target = { x: 0, y: 0, z: 0, isVector3: true };
                  }
                  
                  // In a real implementation, this would compute the world position
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
              constants.Object3D.prototype = Object.create(constants.EventDispatcher.prototype);
              constants.Object3D.prototype.constructor = constants.Object3D;
              
              // Vector3 class stub
              constants.Vector3 = function(x, y, z) { 
                this.x = x || 0; 
                this.y = y || 0; 
                this.z = z || 0;
                this.isVector3 = true;
                
                // Add basic methods
                this.set = function(x, y, z) {
                  this.x = x || 0;
                  this.y = y || 0;
                  this.z = z || 0;
                  return this;
                };
                
                this.copy = function(v) {
                  this.x = v.x;
                  this.y = v.y;
                  this.z = v.z;
                  return this;
                };
                
                this.add = function(v) {
                  this.x += v.x;
                  this.y += v.y;
                  this.z += v.z;
                  return this;
                };
              };
              
              // Euler class stub
              constants.Euler = function(x, y, z, order) {
                this.x = x || 0;
                this.y = y || 0;
                this.z = z || 0;
                this.order = order || 'XYZ';
                this.isEuler = true;
                
                // Add basic methods
                this.set = function(x, y, z, order) {
                  this.x = x || 0;
                  this.y = y || 0;
                  this.z = z || 0;
                  if (order) this.order = order;
                  return this;
                };
                
                this.copy = function(euler) {
                  this.x = euler.x;
                  this.y = euler.y;
                  this.z = euler.z;
                  this.order = euler.order;
                  return this;
                };
              };
              
              // Matrix4 class stub
              constants.Matrix4 = function() {
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
              
              // Color class stub
              constants.Color = function(r, g, b) {
                this.r = r || 0;
                this.g = g || 0;
                this.b = b || 0;
                this.isColor = true;
                
                // Add basic methods
                this.set = function(color) { return this; };
                this.copy = function(color) { 
                  this.r = color.r;
                  this.g = color.g;
                  this.b = color.b;
                  return this; 
                };
              };
              
              // Group class stub - extends Object3D
              constants.Group = function() {
                constants.Object3D.call(this);
                this.type = 'Group';
                this.isGroup = true;
              };
              
              // Inherit from Object3D
              constants.Group.prototype = Object.create(constants.Object3D.prototype);
              constants.Group.prototype.constructor = constants.Group;
              
              // Frustum class stub
              constants.Frustum = function() {
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
              
              // Sphere class stub
              constants.Sphere = function(center, radius) {
                this.center = center || { x: 0, y: 0, z: 0 };
                this.radius = radius || 1;
                
                this.set = function(center, radius) { 
                  this.center = center;
                  this.radius = radius;
                  return this; 
                };
              };
              
              // Add the constants to window.THREE
              Object.assign(window.THREE, constants);
              console.log('THREE constants and stub classes pre-initialized in script tag');
            }
          `}
        </Script>
      </head>
      <body>
        {children}
        <ThreeVerification />
      </body>
    </html>
  );
}
