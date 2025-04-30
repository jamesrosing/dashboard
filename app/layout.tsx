import './globals.css';
import Script from 'next/script';
// Import the Three.js initialization module to apply patches early
import '../lib/three/initialize';
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
              
              // CRITICAL: Object3D stub implementation
              // This is essential as it's being accessed before initialization
              constants.Object3D = function() {
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
