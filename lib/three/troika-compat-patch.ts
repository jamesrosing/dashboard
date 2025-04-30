/**
 * Consolidated compatibility module for Three.js and Troika
 * 
 * This file provides all necessary constants, classes, and patches
 * to ensure compatibility between Three.js, React Three Fiber, and Troika.
 * 
 * It consolidates multiple compatibility files into a single source of truth.
 */
import * as THREE from 'three';

// Re-export everything from Three.js
export * from 'three';

// Add compatibility constants for LinearEncoding, sRGBEncoding, and NoToneMapping
// These constants were removed in Three.js r152 but are still used by Troika
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const NoToneMapping = 0;

// Add various constants needed by different libraries
// These ensure proper compatibility regardless of Three.js version
export const UnsignedByteType = THREE.UnsignedByteType || 1009;
export const ByteType = THREE.ByteType || 1010;
export const ShortType = THREE.ShortType || 1011;
export const UnsignedShortType = THREE.UnsignedShortType || 1012;
export const IntType = THREE.IntType || 1013;
export const UnsignedIntType = THREE.UnsignedIntType || 1014;
export const FloatType = THREE.FloatType || 1015;
export const HalfFloatType = THREE.HalfFloatType || 1016;

// Format constants
export const RGBAFormat = THREE.RGBAFormat || 1023;
export const RGIntegerFormat = THREE.RGIntegerFormat || 1033;
export const RedFormat = THREE.RedFormat || 1028;
export const RGFormat = THREE.RGFormat || 1030;
export const RedIntegerFormat = THREE.RedIntegerFormat || 1031;
export const RGBAIntegerFormat = THREE.RGBAIntegerFormat || 1033;

// Filter and mapping constants
export const LinearFilter = THREE.LinearFilter || 1006;
export const NearestFilter = THREE.NearestFilter || 1003;
export const ClampToEdgeWrapping = THREE.ClampToEdgeWrapping || 1001;
export const UVMapping = THREE.UVMapping || 300;
export const LinearMipMapLinearFilter = THREE.LinearMipMapLinearFilter || 1008;

// Color space constants
export const LinearSRGBColorSpace = THREE.LinearSRGBColorSpace || 'Linear';
export const SRGBColorSpace = THREE.SRGBColorSpace || 'srgb';

// Blending mode constants
export const NoBlending = THREE.NoBlending || 0;

// Side constants
export const FrontSide = THREE.FrontSide || 0;
export const BackSide = THREE.BackSide || 1;
export const DoubleSide = THREE.DoubleSide || 2;

// Version constant required by some libraries
export const REVISION = THREE.REVISION || '176';
export const UniformsLib = THREE.UniformsLib || {};

// Export commonly used classes to ensure type compatibility
export const WebGLRenderTarget = THREE.WebGLRenderTarget;
export const Mesh = THREE.Mesh;
export const PlaneGeometry = THREE.PlaneGeometry;
export const MeshBasicMaterial = THREE.MeshBasicMaterial;
export const MeshStandardMaterial = THREE.MeshStandardMaterial;
export const MeshLambertMaterial = THREE.MeshLambertMaterial;
export const Scene = THREE.Scene;
export const OrthographicCamera = THREE.OrthographicCamera;
export const WebGLRenderer = THREE.WebGLRenderer;
export const DataTexture = THREE.DataTexture;
export const ShaderMaterial = THREE.ShaderMaterial;
export const Texture = THREE.Texture;
export const Vector3 = THREE.Vector3;
export const Vector2 = THREE.Vector2;
export const Vector4 = THREE.Vector4;
export const Loader = THREE.Loader;
export const LoadingManager = THREE.LoadingManager;
export const FileLoader = THREE.FileLoader;
export const BufferGeometry = THREE.BufferGeometry;
export const Matrix4 = THREE.Matrix4;
export const Matrix3 = THREE.Matrix3;
export const BufferAttribute = THREE.BufferAttribute;
export const Color = THREE.Color;
export const Ray = THREE.Ray;
export const Sphere = THREE.Sphere;
export const LineSegments = THREE.LineSegments;
export const Box3 = THREE.Box3;
export const Triangle = THREE.Triangle;
export const Plane = THREE.Plane;
export const Line3 = THREE.Line3;
export const Object3D = THREE.Object3D;
export const Group = THREE.Group;
export const LineBasicMaterial = THREE.LineBasicMaterial;
export const LatheGeometry = THREE.LatheGeometry;
export const Path = THREE.Path;

// Provide a polyfill for BatchedMesh which might not exist in older Three.js versions
export const BatchedMesh = THREE.BatchedMesh || class {}; 

// Ensure MathUtils is available for calculations
export const MathUtils = THREE.MathUtils || { 
  lerp: (x: number, y: number, t: number) => x + (y - x) * t,
  clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
  degToRad: (degrees: number) => degrees * (Math.PI / 180),
  radToDeg: (radians: number) => radians * (180 / Math.PI)
};

// Ensure Euler is available for rotations
export const Euler = THREE.Euler;

// Frustum for culling operations
export const Frustum = THREE.Frustum;

// Common geometries used in our application
export const BoxGeometry = THREE.BoxGeometry;
export const SphereGeometry = THREE.SphereGeometry;
export const ConeGeometry = THREE.ConeGeometry;
export const CylinderGeometry = THREE.CylinderGeometry;
export const TorusGeometry = THREE.TorusGeometry;

/**
 * Function to safely apply compatibility patches
 * This is called at application initialization to ensure all patches are applied
 */
export function applyThreeCompatibilityPatches() {
  // Add missing constants to the global THREE object for libraries that access them directly
  if (typeof window !== 'undefined') {
    // Make THREE available globally for libraries that expect it
    (window as any).THREE = {
      ...THREE,
      LinearEncoding,
      sRGBEncoding,
      NoToneMapping,
      // Add other constants as needed
    };
  }
  
  // Return true to indicate successful patching
  return true;
}

// Export default for compatibility with original Three.js import pattern
export default THREE; 