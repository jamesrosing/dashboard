/**
 * Consolidated compatibility module for Three.js and Troika
 * 
 * This file provides all necessary constants, classes, and patches
 * to ensure compatibility between Three.js, React Three Fiber, and Troika.
 * 
 * It consolidates multiple compatibility files into a single source of truth.
 */

// Safe check for browser environment
const isBrowser = typeof window !== 'undefined';

// We need to directly capture the THREE object before it's potentially modified
// by other imports to avoid circular reference issues
import * as THREE_ORIGINAL from 'three';

// Re-export everything from Three.js
export * from 'three';

// Define all constants first to avoid "Cannot access 'o' before initialization" errors
// These constants were removed in Three.js r152 but are still used by Troika
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const NoToneMapping = 0;

// Add various constants needed by different libraries
// These ensure proper compatibility regardless of Three.js version
export const UnsignedByteType = THREE_ORIGINAL.UnsignedByteType || 1009;
export const ByteType = THREE_ORIGINAL.ByteType || 1010;
export const ShortType = THREE_ORIGINAL.ShortType || 1011;
export const UnsignedShortType = THREE_ORIGINAL.UnsignedShortType || 1012;
export const IntType = THREE_ORIGINAL.IntType || 1013;
export const UnsignedIntType = THREE_ORIGINAL.UnsignedIntType || 1014;
export const FloatType = THREE_ORIGINAL.FloatType || 1015;
export const HalfFloatType = THREE_ORIGINAL.HalfFloatType || 1016;

// Format constants
export const RGBAFormat = THREE_ORIGINAL.RGBAFormat || 1023;
export const RGIntegerFormat = THREE_ORIGINAL.RGIntegerFormat || 1033;
export const RedFormat = THREE_ORIGINAL.RedFormat || 1028;
export const RGFormat = THREE_ORIGINAL.RGFormat || 1030;
export const RedIntegerFormat = THREE_ORIGINAL.RedIntegerFormat || 1031;
export const RGBAIntegerFormat = THREE_ORIGINAL.RGBAIntegerFormat || 1033;

// Filter and mapping constants
export const LinearFilter = THREE_ORIGINAL.LinearFilter || 1006;
export const NearestFilter = THREE_ORIGINAL.NearestFilter || 1003;
export const ClampToEdgeWrapping = THREE_ORIGINAL.ClampToEdgeWrapping || 1001;
export const UVMapping = THREE_ORIGINAL.UVMapping || 300;
export const LinearMipMapLinearFilter = THREE_ORIGINAL.LinearMipMapLinearFilter || 1008;

// Color space constants
export const LinearSRGBColorSpace = THREE_ORIGINAL.LinearSRGBColorSpace || 'Linear';
export const SRGBColorSpace = THREE_ORIGINAL.SRGBColorSpace || 'srgb';

// Blending mode constants
export const NoBlending = THREE_ORIGINAL.NoBlending || 0;

// Side constants
export const FrontSide = THREE_ORIGINAL.FrontSide || 0;
export const BackSide = THREE_ORIGINAL.BackSide || 1;
export const DoubleSide = THREE_ORIGINAL.DoubleSide || 2;

// Version constant required by some libraries
export const REVISION = THREE_ORIGINAL.REVISION || '176';
export const UniformsLib = THREE_ORIGINAL.UniformsLib || {};

// Create safe references to all commonly used classes
// This prevents "Cannot access 'o' before initialization" errors
// by ensuring we access the original THREE object directly
export const WebGLRenderTarget = THREE_ORIGINAL.WebGLRenderTarget;
export const Mesh = THREE_ORIGINAL.Mesh;
export const PlaneGeometry = THREE_ORIGINAL.PlaneGeometry;
export const MeshBasicMaterial = THREE_ORIGINAL.MeshBasicMaterial;
export const MeshStandardMaterial = THREE_ORIGINAL.MeshStandardMaterial;
export const MeshLambertMaterial = THREE_ORIGINAL.MeshLambertMaterial;
export const Scene = THREE_ORIGINAL.Scene;
export const OrthographicCamera = THREE_ORIGINAL.OrthographicCamera;
export const WebGLRenderer = THREE_ORIGINAL.WebGLRenderer;
export const DataTexture = THREE_ORIGINAL.DataTexture;
export const ShaderMaterial = THREE_ORIGINAL.ShaderMaterial;
export const Texture = THREE_ORIGINAL.Texture;
export const Vector3 = THREE_ORIGINAL.Vector3;
export const Vector2 = THREE_ORIGINAL.Vector2;
export const Vector4 = THREE_ORIGINAL.Vector4;
export const Loader = THREE_ORIGINAL.Loader;
export const LoadingManager = THREE_ORIGINAL.LoadingManager;
export const FileLoader = THREE_ORIGINAL.FileLoader;
export const BufferGeometry = THREE_ORIGINAL.BufferGeometry;
export const Matrix4 = THREE_ORIGINAL.Matrix4;
export const Matrix3 = THREE_ORIGINAL.Matrix3;
export const BufferAttribute = THREE_ORIGINAL.BufferAttribute;
export const Color = THREE_ORIGINAL.Color;
export const Ray = THREE_ORIGINAL.Ray;
export const Sphere = THREE_ORIGINAL.Sphere;
export const LineSegments = THREE_ORIGINAL.LineSegments;
export const Box3 = THREE_ORIGINAL.Box3;
export const Triangle = THREE_ORIGINAL.Triangle;
export const Plane = THREE_ORIGINAL.Plane;
export const Line3 = THREE_ORIGINAL.Line3;
export const Object3D = THREE_ORIGINAL.Object3D;
export const Group = THREE_ORIGINAL.Group;
export const LineBasicMaterial = THREE_ORIGINAL.LineBasicMaterial;
export const LatheGeometry = THREE_ORIGINAL.LatheGeometry;
export const Path = THREE_ORIGINAL.Path;

// Provide a polyfill for BatchedMesh which might not exist in older Three.js versions
export const BatchedMesh = THREE_ORIGINAL.BatchedMesh || class {}; 

// Ensure MathUtils is available for calculations
export const MathUtils = THREE_ORIGINAL.MathUtils || { 
  lerp: (x: number, y: number, t: number) => x + (y - x) * t,
  clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
  degToRad: (degrees: number) => degrees * (Math.PI / 180),
  radToDeg: (radians: number) => radians * (180 / Math.PI)
};

// Ensure Euler is available for rotations
export const Euler = THREE_ORIGINAL.Euler;

// Frustum for culling operations
export const Frustum = THREE_ORIGINAL.Frustum;

// Common geometries used in our application
export const BoxGeometry = THREE_ORIGINAL.BoxGeometry;
export const SphereGeometry = THREE_ORIGINAL.SphereGeometry;
export const ConeGeometry = THREE_ORIGINAL.ConeGeometry;
export const CylinderGeometry = THREE_ORIGINAL.CylinderGeometry;
export const TorusGeometry = THREE_ORIGINAL.TorusGeometry;

// Create a patch object with all our constants
const PATCH_CONSTANTS = {
  LinearEncoding,
  sRGBEncoding,
  NoToneMapping,
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
  REVISION
};

// Flag to track if patches have been applied
let patchesApplied = false;

/**
 * Function to safely apply compatibility patches
 * This is called at application initialization to ensure all patches are applied
 */
export function applyThreeCompatibilityPatches() {
  // Only apply patches once and only in browser environment
  if (patchesApplied || !isBrowser) return true;
  
  try {
    // Apply patches to global THREE object if it exists
    if (typeof window !== 'undefined') {
      // Create global THREE if it doesn't exist
      if (!(window as any).THREE) {
        (window as any).THREE = { ...THREE_ORIGINAL };
      }
      
      // Apply patch constants
      Object.entries(PATCH_CONSTANTS).forEach(([key, value]) => {
        (window as any).THREE[key] = value;
      });
      
      // Mark as applied
      patchesApplied = true;
      console.log('Three.js compatibility patches applied successfully');
    }
  } catch (error) {
    console.error('Failed to apply Three.js compatibility patches:', error);
  }
  
  return patchesApplied;
}

// Immediately try to apply patches when this module is loaded in browser environment
if (isBrowser) {
  applyThreeCompatibilityPatches();
}

// Export default for compatibility with original Three.js import pattern
export default THREE_ORIGINAL; 