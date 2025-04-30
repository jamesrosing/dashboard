/**
 * Three.js Entry Module
 * 
 * This module is specifically designed to be the main entry point for Three.js imports.
 * It pre-defines all constants and then exports everything from Three.js.
 * 
 * Enhanced with better error handling to prevent initialization errors in production.
 */

// First import Three.js - we need this for the class/method exports
import * as THREE from 'three';

// DEBUGGING SUPPORT
const DEBUG = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
if (DEBUG && typeof window !== 'undefined') {
  console.log('Three.js entry module initializing in DEBUG mode');
}

// Type constants
export const UnsignedByteType = 1009;
export const ByteType = 1010; 
export const ShortType = 1011;
export const UnsignedShortType = 1012;
export const IntType = 1013;
export const UnsignedIntType = 1014;
export const FloatType = 1015;
export const HalfFloatType = 1016;

// Make sure 'D' is defined
export const D = {};

// Format constants
export const RGBAFormat = 1023;
export const RGIntegerFormat = 1033;
export const RedFormat = 1028;
export const RGFormat = 1030;
export const RedIntegerFormat = 1031; 
export const RGBAIntegerFormat = 1033;

// Encoding constants (removed in Three.js r152)
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const NoToneMapping = 0;

// Filter and mapping constants
export const LinearFilter = 1006;
export const NearestFilter = 1003;
export const ClampToEdgeWrapping = 1001;
export const UVMapping = 300;
export const LinearMipMapLinearFilter = 1008;

// Color spaces
export const LinearSRGBColorSpace = 'Linear';
export const SRGBColorSpace = 'srgb';

// Blending and sides
export const NoBlending = 0;
export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;

// Apply patches to global THREE if in browser
if (typeof window !== 'undefined') {
  if (!(window as any).THREE) {
    (window as any).THREE = {};
  }
  
  // Define the constants in the global THREE object
  Object.assign((window as any).THREE, {
    UnsignedByteType,
    ByteType,
    ShortType,
    UnsignedShortType,
    IntType,
    UnsignedIntType,
    FloatType,
    HalfFloatType,
    RGBAFormat,
    RGIntegerFormat,
    RedFormat,
    RGFormat,
    RedIntegerFormat,
    RGBAIntegerFormat,
    LinearEncoding,
    sRGBEncoding,
    NoToneMapping,
    LinearFilter,
    NearestFilter,
    ClampToEdgeWrapping,
    UVMapping,
    LinearMipMapLinearFilter,
    LinearSRGBColorSpace,
    SRGBColorSpace,
    NoBlending,
    FrontSide,
    BackSide,
    DoubleSide,
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
    D,
  });
  
  // Create base stubs for critical classes if they don't exist
  // This is our fallback in case the Script in layout.tsx doesn't execute properly
  if (!(window as any).THREE.Vector3) {
    (window as any).THREE.Vector3 = function(x: number, y: number, z: number) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.isVector3 = true;
    };
  }
  
  if (!(window as any).THREE.Euler) {
    (window as any).THREE.Euler = function(x: number, y: number, z: number, order: string) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.order = order || 'XYZ';
      this.isEuler = true;
    };
  }
  
  if (!(window as any).THREE.Matrix4) {
    (window as any).THREE.Matrix4 = function() {
      this.elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      this.isMatrix4 = true;
    };
  }
  
  if (!(window as any).THREE.Color) {
    (window as any).THREE.Color = function(r: number, g: number, b: number) {
      this.r = r || 0;
      this.g = g || 0;
      this.b = b || 0;
      this.isColor = true;
    };
  }

  if (DEBUG) {
    console.log('THREE global patched with constants and stub classes');
  }
}

// Export all Three.js classes and objects that our app needs
export const { 
  // Core
  Object3D,
  Group,
  Scene,
  
  // Cameras
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
  
  // Renderers
  WebGLRenderer,
  WebGLRenderTarget,
  
  // Geometries
  BoxGeometry,
  SphereGeometry,
  ConeGeometry,
  CylinderGeometry,
  TorusGeometry,
  PlaneGeometry,
  BufferGeometry,
  
  // Materials
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  LineBasicMaterial,
  ShaderMaterial,
  
  // Meshes and primitives
  Mesh,
  InstancedMesh,
  LineSegments,
  Line,
  Points,
  
  // Math
  Vector2,
  Vector3,
  Vector4,
  Matrix3,
  Matrix4,
  Quaternion,
  Euler,
  Color,
  MathUtils,
  
  // Textures
  Texture,
  DataTexture,
  
  // Loaders
  TextureLoader,
  Loader,
  LoadingManager,
  FileLoader,
  
  // Helpers
  BufferAttribute,
  
  // Animation
  AnimationMixer,
  AnimationClip,
  AnimationAction,
  
  // Lights
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  
  // Utilities
  Raycaster,
  Frustum,
  Sphere,
  Box3,
  Triangle,
  Plane,
  Line3,
  
  // Extras
  Path,
  LatheGeometry,
  
  // Constants
  REVISION,
  UniformsLib
} = THREE;

// Add debug logging in development
if (DEBUG && typeof window !== 'undefined') {
  console.log('Three.js entry module loaded successfully');
  
  // Verify critical objects exist
  try {
    const v = new Vector3(1, 2, 3);
    console.log('Vector3 created:', v);
    
    const e = new Euler(0, 1, 0);
    console.log('Euler created:', e);
    
    const m = new Matrix4();
    console.log('Matrix4 created:', m);
  } catch (error) {
    console.error('Error creating Three.js objects:', error);
  }
}

// Make sure we export everything from Three.js 
export * from 'three'; 